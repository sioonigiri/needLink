'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { conversationPair } from '@/lib/utils'

type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: unknown }

async function requireUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

/** 2ユーザー間の会話を探す（なければ null）。新規作成はしない。 */
export async function findConversationBetween(
  recipientId: string
): Promise<ActionResult<{ conversationId: string | null }>> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }
  if (user.id === recipientId) return { ok: false, error: '自分にはメッセージできません。' }

  const [one, two] = conversationPair(user.id, recipientId)
  const { data, error } = await (supabase as any)
    .from('conversations')
    .select('id')
    .eq('participant_one', one)
    .eq('participant_two', two)
    .maybeSingle()

  if (error) return { ok: false, error }
  return {
    ok: true,
    data: { conversationId: (data as { id: string } | null)?.id ?? null },
  }
}

/**
 * プロフィール／サービスからチャットを開く。
 * - 既存会話 → conversationId
 * - 相手が自分をフォロー → 空の会話を作成して conversationId
 * - それ以外 → mode: 'request'（初回メッセージ入力が必要）
 */
export async function openConversationWith(
  recipientId: string
): Promise<
  ActionResult<
    | { mode: 'dm'; conversationId: string }
    | { mode: 'request' }
  >
> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }
  if (user.id === recipientId) return { ok: false, error: '自分にはメッセージできません。' }

  const { data: recipient } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', recipientId)
    .single()
  if (!recipient) return { ok: false, error: 'ユーザーが見つかりません。' }

  const found = await findConversationBetween(recipientId)
  if (!found.ok) return { ok: false, error: found.error }
  if (found.data.conversationId) {
    return { ok: true, data: { mode: 'dm', conversationId: found.data.conversationId } }
  }

  const followed = await isFollowedBy(supabase, recipientId, user.id)
  if (followed) {
    const { conversation, error } = await getOrCreateConversation(
      supabase,
      user.id,
      recipientId
    )
    if (error || !conversation) {
      return { ok: false, error: error || '会話を作成できませんでした。' }
    }
    revalidatePath('/messages')
    revalidatePath(`/messages/${conversation.id}`)
    return { ok: true, data: { mode: 'dm', conversationId: conversation.id } }
  }

  return { ok: true, data: { mode: 'request' } }
}

/** 会話を取得、なければ作成（メッセージリクエスト許可後・フォロー済みDM開始で利用） */
export async function getOrCreateConversation(
  supabase: ReturnType<typeof createClient>,
  userA: string,
  userB: string
) {
  const [one, two] = conversationPair(userA, userB)
  const { data: existing } = await (supabase as any)
    .from('conversations')
    .select('*')
    .eq('participant_one', one)
    .eq('participant_two', two)
    .maybeSingle()

  if (existing) return { conversation: existing as { id: string }, error: null }

  const { data: created, error } = await (supabase as any)
    .from('conversations')
    .insert({ participant_one: one, participant_two: two })
    .select('*')
    .single()

  return { conversation: created as { id: string } | null, error }
}

/** 相手が自分をフォローしているか */
async function isFollowedBy(
  supabase: ReturnType<typeof createClient>,
  targetUserId: string,
  currentUserId: string
) {
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', targetUserId)
    .eq('following_id', currentUserId)
    .maybeSingle()
  return !!data
}

/**
 * DM開始 / 送信。
 * - 既存会話あり → メッセージ送信
 * - 相手が自分をフォロー → 通常会話
 * - それ以外 → メッセージリクエスト
 */
export async function startOrSendMessage(
  recipientId: string,
  body: string
): Promise<ActionResult<{ conversationId?: string; requestId?: string; mode: 'dm' | 'request' }>> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }
  if (user.id === recipientId) return { ok: false, error: '自分にはメッセージできません。' }

  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: 'メッセージを入力してください。' }

  const { data: recipient } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', recipientId)
    .single()
  if (!recipient) return { ok: false, error: 'ユーザーが見つかりません。' }

  const { data: actor } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()
  const actorName = (actor as { username?: string } | null)?.username || 'ユーザー'

  const [one, two] = conversationPair(user.id, recipientId)
  const { data: existingConv } = await (supabase as any)
    .from('conversations')
    .select('id')
    .eq('participant_one', one)
    .eq('participant_two', two)
    .maybeSingle()

  if (existingConv) {
    const convId = (existingConv as { id: string }).id
    const { error } = await (supabase as any).from('messages').insert({
      conversation_id: convId,
      sender_id: user.id,
      body: trimmed,
    })
    if (error) return { ok: false, error }

    await (supabase as any)
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', convId)

    await (supabase as any).from('notifications').insert({
      user_id: recipientId,
      actor_id: user.id,
      type: 'dm',
      title: `${actorName}さんからメッセージ`,
      body: trimmed.slice(0, 120),
      link: `/messages/${convId}`,
    })

    revalidatePath('/messages')
    revalidatePath(`/messages/${convId}`)
    return { ok: true, data: { conversationId: convId, mode: 'dm' } }
  }

  const followed = await isFollowedBy(supabase, recipientId, user.id)
  if (followed) {
    const { conversation, error: convError } = await getOrCreateConversation(
      supabase,
      user.id,
      recipientId
    )
    if (convError || !conversation) return { ok: false, error: convError || '会話を作成できませんでした。' }

    const { error } = await (supabase as any).from('messages').insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      body: trimmed,
    })
    if (error) return { ok: false, error }

    await (supabase as any)
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation.id)

    await (supabase as any).from('notifications').insert({
      user_id: recipientId,
      actor_id: user.id,
      type: 'dm',
      title: `${actorName}さんからメッセージ`,
      body: trimmed.slice(0, 120),
      link: `/messages/${conversation.id}`,
    })

    revalidatePath('/messages')
    revalidatePath(`/messages/${conversation.id}`)
    return { ok: true, data: { conversationId: conversation.id, mode: 'dm' } }
  }

  // メッセージリクエスト
  const { data: pending } = await (supabase as any)
    .from('message_requests')
    .select('id')
    .eq('sender_id', user.id)
    .eq('receiver_id', recipientId)
    .eq('status', 'pending')
    .maybeSingle()

  if (pending) {
    const { error } = await (supabase as any)
      .from('message_requests')
      .update({ body: trimmed, updated_at: new Date().toISOString() })
      .eq('id', (pending as { id: string }).id)
    if (error) return { ok: false, error }

    await (supabase as any).from('notifications').insert({
      user_id: recipientId,
      actor_id: user.id,
      type: 'message_request',
      title: `${actorName}さんからメッセージリクエスト`,
      body: trimmed.slice(0, 120),
      link: '/messages/requests',
    })

    revalidatePath('/messages/requests')
    return {
      ok: true,
      data: { requestId: (pending as { id: string }).id, mode: 'request' },
    }
  }

  const { data: created, error } = await (supabase as any)
    .from('message_requests')
    .insert({
      sender_id: user.id,
      receiver_id: recipientId,
      body: trimmed,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error) return { ok: false, error }

  await (supabase as any).from('notifications').insert({
    user_id: recipientId,
    actor_id: user.id,
    type: 'message_request',
    title: `${actorName}さんからメッセージリクエスト`,
    body: trimmed.slice(0, 120),
    link: '/messages/requests',
  })

  revalidatePath('/messages/requests')
  return {
    ok: true,
    data: { requestId: (created as { id: string }).id, mode: 'request' },
  }
}

export async function sendConversationMessage(
  conversationId: string,
  body: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: 'メッセージを入力してください。' }

  const { data: conv } = await (supabase as any)
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single()

  if (!conv) return { ok: false, error: '会話が見つかりません。' }
  const c = conv as { participant_one: string; participant_two: string }
  if (c.participant_one !== user.id && c.participant_two !== user.id) {
    return { ok: false, error: '権限がありません。' }
  }

  const { error } = await (supabase as any).from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: trimmed,
  })
  if (error) return { ok: false, error }

  await (supabase as any)
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)

  const peerId = c.participant_one === user.id ? c.participant_two : c.participant_one
  const { data: actor } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()
  const actorName = (actor as { username?: string } | null)?.username || 'ユーザー'

  await (supabase as any).from('notifications').insert({
    user_id: peerId,
    actor_id: user.id,
    type: 'dm',
    title: `${actorName}さんからメッセージ`,
    body: trimmed.slice(0, 120),
    link: `/messages/${conversationId}`,
  })

  revalidatePath('/messages')
  revalidatePath(`/messages/${conversationId}`)
  return { ok: true }
}

export async function markConversationRead(
  conversationId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const { error } = await (supabase as any)
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .is('read_at', null)

  if (error) return { ok: false, error }
  revalidatePath('/messages')
  revalidatePath(`/messages/${conversationId}`)
  return { ok: true }
}

export async function acceptMessageRequest(
  requestId: string
): Promise<ActionResult<{ conversationId: string }>> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const { data: req, error: fetchError } = await (supabase as any)
    .from('message_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (fetchError) {
    console.error(fetchError)
    return { ok: false, error: fetchError }
  }
  if (!req) return { ok: false, error: 'リクエストが見つかりません。' }

  const request = req as {
    id: string
    sender_id: string
    receiver_id: string
    body: string
    status: string
  }

  if (request.receiver_id !== user.id) return { ok: false, error: '権限がありません。' }
  if (request.status !== 'pending') return { ok: false, error: 'すでに処理済みです。' }

  // 1. 会話を取得または作成（受信者は参加者なので INSERT 可）
  const { conversation, error: convError } = await getOrCreateConversation(
    supabase,
    request.sender_id,
    request.receiver_id
  )
  if (convError || !conversation) {
    console.error(convError)
    return { ok: false, error: convError || '会話を作成できませんでした。' }
  }

  // 2. 初回メッセージを送信者名義で挿入（pending 中のみ RLS で許可）
  //    ※ status を先に accepted にすると RLS 条件を満たせなくなるため順序厳守
  const { data: existingMsg } = await (supabase as any)
    .from('messages')
    .select('id')
    .eq('conversation_id', conversation.id)
    .eq('sender_id', request.sender_id)
    .eq('body', request.body)
    .limit(1)
    .maybeSingle()

  if (!existingMsg) {
    const { error: msgError } = await (supabase as any).from('messages').insert({
      conversation_id: conversation.id,
      sender_id: request.sender_id,
      body: request.body,
    })
    if (msgError) {
      console.error(msgError)
      return { ok: false, error: msgError }
    }
  }

  await (supabase as any)
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversation.id)

  // 3. リクエストを許可済みに更新
  const { error } = await (supabase as any)
    .from('message_requests')
    .update({
      status: 'accepted',
      conversation_id: conversation.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('receiver_id', user.id)
    .eq('status', 'pending')

  if (error) {
    console.error(error)
    return { ok: false, error }
  }

  revalidatePath('/messages')
  revalidatePath('/messages/requests')
  revalidatePath(`/messages/${conversation.id}`)
  return { ok: true, data: { conversationId: conversation.id } }
}

export async function rejectMessageRequest(requestId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const { data: req } = await (supabase as any)
    .from('message_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (!req) return { ok: false, error: 'リクエストが見つかりません。' }
  const request = req as { receiver_id: string; status: string }
  if (request.receiver_id !== user.id) return { ok: false, error: '権限がありません。' }
  if (request.status !== 'pending') return { ok: false, error: 'すでに処理済みです。' }

  const { error } = await (supabase as any)
    .from('message_requests')
    .update({ status: 'rejected', updated_at: new Date().toISOString() })
    .eq('id', requestId)

  if (error) return { ok: false, error }
  revalidatePath('/messages/requests')
  return { ok: true }
}

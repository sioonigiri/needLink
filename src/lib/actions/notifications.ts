'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: unknown }

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const { error } = await (supabase as any)
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) return { ok: false, error }
  revalidatePath('/notifications')
  return { ok: true }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const { error } = await (supabase as any)
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) return { ok: false, error }
  revalidatePath('/notifications')
  return { ok: true }
}

export async function getUnreadCounts(): Promise<{
  notifications: number
  messages: number
  requests: number
}> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { notifications: 0, messages: 0, requests: 0 }

  const [{ count: notifCount }, { data: convs }, { count: reqCount }] = await Promise.all([
    (supabase as any)
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null),
    (supabase as any)
      .from('conversations')
      .select('id')
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`),
    (supabase as any)
      .from('message_requests')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('status', 'pending'),
  ])

  let messages = 0
  const convIds = ((convs as { id: string }[]) || []).map((c) => c.id)
  if (convIds.length > 0) {
    const { count } = await (supabase as any)
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .neq('sender_id', user.id)
      .is('read_at', null)
    messages = count || 0
  }

  return {
    notifications: notifCount || 0,
    messages: messages || 0,
    requests: reqCount || 0,
  }
}

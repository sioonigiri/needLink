'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: unknown }

async function requireUser() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null as null }
  return { supabase, user }
}

export async function createFeedback(
  serviceId: string,
  body: string
): Promise<ActionResult & { ownerId?: string }> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: 'コメントを入力してください。' }

  const { data: service } = await supabase
    .from('services')
    .select('user_id, name')
    .eq('id', serviceId)
    .single()

  if (!service) return { ok: false, error: 'サービスが見つかりません。' }

  const { error } = await (supabase as any).from('feedback').insert({
    service_id: serviceId,
    user_id: user.id,
    body: trimmed,
  })

  if (error) return { ok: false, error }

  const svc = service as { user_id: string; name: string }
  if (svc.user_id !== user.id) {
    const { data: actor } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    const username = (actor as { username?: string } | null)?.username || 'ユーザー'
    await (supabase as any).from('notifications').insert({
      user_id: svc.user_id,
      actor_id: user.id,
      type: 'feedback',
      title: `${username}さんからフィードバック`,
      body: trimmed.slice(0, 120),
      link: `/services/${serviceId}#feedback`,
    })
  }

  revalidatePath(`/services/${serviceId}`)
  return { ok: true, ownerId: svc.user_id }
}

export async function deleteFeedback(
  feedbackId: string,
  serviceId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const { error } = await (supabase as any)
    .from('feedback')
    .delete()
    .eq('id', feedbackId)
    .eq('user_id', user.id)

  if (error) return { ok: false, error }
  revalidatePath(`/services/${serviceId}`)
  return { ok: true }
}

export async function createDevelopmentLog(
  serviceId: string,
  body: string,
  loggedAt?: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: '内容を入力してください。' }

  const { data: service } = await supabase
    .from('services')
    .select('user_id')
    .eq('id', serviceId)
    .single()

  if (!service || (service as { user_id: string }).user_id !== user.id) {
    return { ok: false, error: '権限がありません。' }
  }

  const { error } = await (supabase as any).from('development_logs').insert({
    service_id: serviceId,
    user_id: user.id,
    body: trimmed,
    logged_at: loggedAt || new Date().toISOString().slice(0, 10),
  })

  if (error) return { ok: false, error }
  revalidatePath(`/services/${serviceId}`)
  return { ok: true }
}

export async function updateDevelopmentLog(
  logId: string,
  serviceId: string,
  body: string,
  loggedAt?: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const trimmed = body.trim()
  if (!trimmed) return { ok: false, error: '内容を入力してください。' }

  const { data: service } = await supabase
    .from('services')
    .select('user_id')
    .eq('id', serviceId)
    .single()

  if (!service || (service as { user_id: string }).user_id !== user.id) {
    return { ok: false, error: '権限がありません。' }
  }

  const payload: Record<string, string> = {
    body: trimmed,
    updated_at: new Date().toISOString(),
  }
  if (loggedAt) payload.logged_at = loggedAt

  const { error } = await (supabase as any)
    .from('development_logs')
    .update(payload)
    .eq('id', logId)
    .eq('service_id', serviceId)

  if (error) return { ok: false, error }
  revalidatePath(`/services/${serviceId}`)
  return { ok: true }
}

export async function deleteDevelopmentLog(
  logId: string,
  serviceId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const { data: service } = await supabase
    .from('services')
    .select('user_id')
    .eq('id', serviceId)
    .single()

  if (!service || (service as { user_id: string }).user_id !== user.id) {
    return { ok: false, error: '権限がありません。' }
  }

  const { error } = await (supabase as any)
    .from('development_logs')
    .delete()
    .eq('id', logId)
    .eq('service_id', serviceId)

  if (error) return { ok: false, error }
  revalidatePath(`/services/${serviceId}`)
  return { ok: true }
}

export async function createUpdateHistory(
  serviceId: string,
  version: string,
  body: string,
  releasedAt?: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const ver = version.trim()
  const trimmed = body.trim()
  if (!ver) return { ok: false, error: 'バージョンを入力してください。' }
  if (!trimmed) return { ok: false, error: '内容を入力してください。' }

  const { data: service } = await supabase
    .from('services')
    .select('user_id')
    .eq('id', serviceId)
    .single()

  if (!service || (service as { user_id: string }).user_id !== user.id) {
    return { ok: false, error: '権限がありません。' }
  }

  const { error } = await (supabase as any).from('update_histories').insert({
    service_id: serviceId,
    user_id: user.id,
    version: ver,
    body: trimmed,
    released_at: releasedAt || new Date().toISOString().slice(0, 10),
  })

  if (error) return { ok: false, error }
  revalidatePath(`/services/${serviceId}`)
  return { ok: true }
}

export async function updateUpdateHistory(
  historyId: string,
  serviceId: string,
  version: string,
  body: string,
  releasedAt?: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const ver = version.trim()
  const trimmed = body.trim()
  if (!ver) return { ok: false, error: 'バージョンを入力してください。' }
  if (!trimmed) return { ok: false, error: '内容を入力してください。' }

  const { data: service } = await supabase
    .from('services')
    .select('user_id')
    .eq('id', serviceId)
    .single()

  if (!service || (service as { user_id: string }).user_id !== user.id) {
    return { ok: false, error: '権限がありません。' }
  }

  const payload: Record<string, string> = {
    version: ver,
    body: trimmed,
    updated_at: new Date().toISOString(),
  }
  if (releasedAt) payload.released_at = releasedAt

  const { error } = await (supabase as any)
    .from('update_histories')
    .update(payload)
    .eq('id', historyId)
    .eq('service_id', serviceId)

  if (error) return { ok: false, error }
  revalidatePath(`/services/${serviceId}`)
  return { ok: true }
}

export async function deleteUpdateHistory(
  historyId: string,
  serviceId: string
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: 'ログインが必要です。' }

  const { data: service } = await supabase
    .from('services')
    .select('user_id')
    .eq('id', serviceId)
    .single()

  if (!service || (service as { user_id: string }).user_id !== user.id) {
    return { ok: false, error: '権限がありません。' }
  }

  const { error } = await (supabase as any)
    .from('update_histories')
    .delete()
    .eq('id', historyId)
    .eq('service_id', serviceId)

  if (error) return { ok: false, error }
  revalidatePath(`/services/${serviceId}`)
  return { ok: true }
}

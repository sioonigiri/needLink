import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationsList } from '@/components/notifications/NotificationsList'
import type { Notification, Profile } from '@/types'

export default async function NotificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: notifs } = await (supabase as any)
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const items = (notifs || []) as Notification[]
  const actorIds = [...new Set(items.map((n) => n.actor_id).filter(Boolean))] as string[]

  let actors: Record<string, Profile> = {}
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', actorIds)
    for (const p of (profiles || []) as Profile[]) {
      actors[p.id] = p
    }
  }

  const withActor = items.map((n) => ({
    ...n,
    actor: n.actor_id ? actors[n.actor_id] || null : null,
  }))

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-nl-text mb-2">通知</h1>
      <p className="text-sm text-nl-muted mb-8">
        フィードバック、メッセージ、リクエストの通知
      </p>
      <NotificationsList initialItems={withActor} />
    </div>
  )
}

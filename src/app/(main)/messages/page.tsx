import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Avatar, EmptyState } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import type { Conversation, Message, Profile } from '@/types'

export default async function MessagesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: convs } = await (supabase as any)
    .from('conversations')
    .select('*')
    .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  const conversations = (convs || []) as Conversation[]
  const peerIds = conversations.map((c) =>
    c.participant_one === user.id ? c.participant_two : c.participant_one
  )

  let peers: Record<string, Profile> = {}
  if (peerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', peerIds)
    for (const p of (profiles || []) as Profile[]) {
      peers[p.id] = p
    }
  }

  const lastMessages: Record<string, Message | null> = {}
  const unreadCounts: Record<string, number> = {}

  await Promise.all(
    conversations.map(async (c) => {
      const [{ data: last }, { count }] = await Promise.all([
        (supabase as any)
          .from('messages')
          .select('*')
          .eq('conversation_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        (supabase as any)
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', c.id)
          .neq('sender_id', user.id)
          .is('read_at', null),
      ])
      lastMessages[c.id] = (last as Message) || null
      unreadCounts[c.id] = count || 0
    })
  )

  const { count: requestCount } = await (supabase as any)
    .from('message_requests')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', user.id)
    .eq('status', 'pending')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-nl-text">メッセージ</h1>
          <p className="text-nl-muted mt-1 text-sm">チャット一覧</p>
        </div>
        <Link
          href="/messages/requests"
          className="relative text-sm font-medium text-nl-primary hover:text-nl-primary-hover"
        >
          リクエスト
          {(requestCount || 0) > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-nl-primary text-white text-xs">
              {requestCount}
            </span>
          )}
        </Link>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-12 h-12 text-nl-border" />}
          title="まだチャットがありません"
          description="サービスページから開発者にメッセージを送ってみましょう"
          actionLabel="サービスを探す"
          actionHref="/search"
        />
      ) : (
        <ul className="bg-nl-card rounded-nl-card border border-nl-card-border shadow-nl-card divide-y divide-nl-card-border overflow-hidden">
          {conversations.map((c) => {
            const peerId = c.participant_one === user.id ? c.participant_two : c.participant_one
            const peer = peers[peerId]
            const last = lastMessages[c.id]
            const unread = unreadCounts[c.id] || 0
            if (!peer) return null
            return (
              <li key={c.id}>
                <Link
                  href={`/messages/${c.id}`}
                  className="flex items-center gap-3 px-4 sm:px-5 py-4 hover:bg-nl-beige/50 transition-colors"
                >
                  <Avatar src={peer.avatar_url} name={peer.username} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-nl-text truncate">{peer.username}</span>
                      {last && (
                        <span className="text-xs text-nl-muted shrink-0">
                          {formatDateTime(last.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-sm text-nl-muted truncate">
                        {last?.body || 'メッセージはまだありません'}
                      </p>
                      {unread > 0 && (
                        <span className="shrink-0 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-nl-primary text-white text-xs font-medium">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

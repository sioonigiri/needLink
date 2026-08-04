import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { MessageRequestsList } from '@/components/dm/MessageRequestsList'
import type { MessageRequest, Profile } from '@/types'

export default async function MessageRequestsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: requests } = await (supabase as any)
    .from('message_requests')
    .select('*')
    .eq('receiver_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  const items = (requests || []) as MessageRequest[]
  const senderIds = items.map((r) => r.sender_id)

  let senders: Record<string, Profile> = {}
  if (senderIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', senderIds)
    for (const p of (profiles || []) as Profile[]) {
      senders[p.id] = p
    }
  }

  const withSender = items
    .map((r) => ({ ...r, sender: senders[r.sender_id] }))
    .filter((r) => r.sender)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link
        href="/messages"
        className="inline-flex items-center gap-1.5 text-sm text-nl-muted hover:text-nl-text mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        チャット一覧
      </Link>
      <h1 className="text-2xl font-bold text-nl-text mb-2">メッセージリクエスト</h1>
      <p className="text-sm text-nl-muted mb-8">
        フォローしていない相手からのメッセージです。許可すると通常のチャットに移動します。
      </p>
      <MessageRequestsList initialItems={withSender} />
    </div>
  )
}

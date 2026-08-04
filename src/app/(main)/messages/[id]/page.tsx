import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChatThread } from '@/components/dm/ChatThread'
import type { Conversation, Message, Profile } from '@/types'

interface PageProps {
  params: { id: string }
}

export default async function ConversationPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: convRaw } = await (supabase as any)
    .from('conversations')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!convRaw) notFound()
  const conv = convRaw as Conversation

  if (conv.participant_one !== user.id && conv.participant_two !== user.id) {
    notFound()
  }

  const peerId =
    conv.participant_one === user.id ? conv.participant_two : conv.participant_one

  const { data: peerRaw } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', peerId)
    .single()

  if (!peerRaw) notFound()
  const peer = peerRaw as Profile

  const { data: messagesRaw } = await (supabase as any)
    .from('messages')
    .select('*')
    .eq('conversation_id', params.id)
    .order('created_at', { ascending: true })

  const messages = (messagesRaw || []) as Message[]

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <ChatThread
        conversationId={params.id}
        currentUserId={user.id}
        peer={peer}
        initialMessages={messages}
      />
    </div>
  )
}

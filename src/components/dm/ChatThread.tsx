'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui'
import { Toast } from '@/components/ui/Toast'
import { useUserRole } from '@/components/providers/ProfileProvider'
import { getDisplayError } from '@/lib/errors'
import { markConversationRead, sendConversationMessage } from '@/lib/actions/dm'
import { cn, formatDateTime } from '@/lib/utils'
import type { Message, Profile } from '@/types'

interface ChatThreadProps {
  conversationId: string
  currentUserId: string
  peer: Profile
  initialMessages: Message[]
}

export function ChatThread({
  conversationId,
  currentUserId,
  peer,
  initialMessages,
}: ChatThreadProps) {
  const router = useRouter()
  const role = useUserRole()
  const [messages, setMessages] = useState(initialMessages)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const peerHref = `/users/${encodeURIComponent(peer.slug || peer.username)}`

  useEffect(() => {
    markConversationRead(conversationId)
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!menuOpen) return
    function onDoc(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [menuOpen])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    const text = body.trim()
    setBody('')
    setError(null)

    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: text,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    startTransition(async () => {
      const result = await sendConversationMessage(conversationId, text)
      if (!result.ok) {
        console.error(result.error)
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
        setBody(text)
        setError(getDisplayError(result.error, role, '送信できませんでした。'))
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col h-[min(78vh,720px)] bg-nl-card rounded-nl-card border border-nl-card-border shadow-nl-card overflow-hidden">
      {/* Header: ← 名前 ⋮ */}
      <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-b border-nl-card-border shrink-0">
        <Link
          href="/messages"
          className="p-2 -ml-1 rounded-lg text-nl-muted hover:text-nl-text hover:bg-nl-beige transition-colors"
          aria-label="チャット一覧へ戻る"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Link
          href={peerHref}
          className="flex-1 min-w-0 font-semibold text-nl-text hover:text-nl-primary truncate"
        >
          {peer.username}
        </Link>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-2 rounded-lg text-nl-muted hover:text-nl-text hover:bg-nl-beige transition-colors"
            aria-label="メニュー"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="w-5 h-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-nl-card rounded-nl-input border border-nl-card-border shadow-nl-card z-10 py-1">
              <Link
                href={peerHref}
                className="block px-3 py-2 text-sm text-nl-text hover:bg-nl-beige"
                onClick={() => setMenuOpen(false)}
              >
                プロフィールを見る
              </Link>
              <Link
                href="/messages"
                className="block px-3 py-2 text-sm text-nl-text hover:bg-nl-beige"
                onClick={() => setMenuOpen(false)}
              >
                チャット一覧
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-sm text-nl-muted text-center py-16">
            メッセージを送って会話を始めましょう
          </p>
        ) : (
          messages.map((msg, index) => {
            const mine = msg.sender_id === currentUserId
            const prev = messages[index - 1]
            const showName = !mine && (!prev || prev.sender_id !== msg.sender_id)

            return (
              <div key={msg.id} className={cn('flex flex-col', mine ? 'items-end' : 'items-start')}>
                {showName && (
                  <span className="text-xs font-medium text-nl-muted mb-1 px-1">
                    {peer.username}
                  </span>
                )}
                <div
                  className={cn(
                    'max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    mine
                      ? 'bg-nl-primary text-white rounded-br-md'
                      : 'bg-nl-beige text-nl-text rounded-bl-md'
                  )}
                >
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                  <p
                    className={cn(
                      'text-[11px] mt-1',
                      mine ? 'text-white/70' : 'text-nl-muted'
                    )}
                  >
                    {formatDateTime(msg.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSend}
        className="border-t border-nl-card-border p-3 sm:p-4 flex gap-2 items-end shrink-0"
      >
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={5000}
          placeholder="メッセージを入力..."
          className="flex-1 h-11 rounded-nl-input border border-nl-border bg-white px-3.5 text-sm text-nl-text placeholder:text-nl-muted focus:outline-none focus:border-nl-primary"
        />
        <Button type="submit" size="sm" loading={pending} disabled={!body.trim()} className="h-11 px-4">
          送信
        </Button>
      </form>

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
    </div>
  )
}

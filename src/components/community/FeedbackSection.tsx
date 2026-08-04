'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { Avatar, Button, Card, EmptyState } from '@/components/ui'
import { Toast } from '@/components/ui/Toast'
import { useUserRole } from '@/components/providers/ProfileProvider'
import { getDisplayError } from '@/lib/errors'
import { createFeedback, deleteFeedback } from '@/lib/actions/community'
import { formatDateTime } from '@/lib/utils'
import type { FeedbackWithProfile } from '@/types'

interface FeedbackSectionProps {
  serviceId: string
  currentUserId: string | null
  initialItems: FeedbackWithProfile[]
}

export function FeedbackSection({
  serviceId,
  currentUserId,
  initialItems,
}: FeedbackSectionProps) {
  const role = useUserRole()
  const [items, setItems] = useState(initialItems)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId) {
      window.location.href = '/auth'
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await createFeedback(serviceId, body)
      if (!result.ok) {
        console.error(result.error)
        setError(getDisplayError(result.error, role, 'コメントを投稿できませんでした。'))
        return
      }
      setBody('')
      window.location.reload()
    })
  }

  function handleDelete(id: string) {
    setError(null)
    startTransition(async () => {
      const result = await deleteFeedback(id, serviceId)
      if (!result.ok) {
        console.error(result.error)
        setError(getDisplayError(result.error, role, '削除できませんでした。'))
        return
      }
      setItems((prev) => prev.filter((item) => item.id !== id))
    })
  }

  return (
    <Card id="feedback" className="p-6 sm:p-8">
      <h2 className="font-semibold text-nl-text text-lg mb-1">フィードバック</h2>
      <p className="text-sm text-nl-muted mb-6">
        使った感想、改善案、質問、応援コメントを投稿できます。
      </p>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="mb-8 space-y-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="フィードバックを書く…"
            className="w-full rounded-nl-input border border-nl-border bg-white px-4 py-3 text-sm text-nl-text placeholder:text-nl-muted focus:outline-none focus:border-nl-primary focus:shadow-[0_0_0_3px_rgba(217,119,6,0.12)] resize-y"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={pending} disabled={!body.trim()}>
              投稿する
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-nl-input bg-nl-beige text-sm text-nl-muted">
          フィードバックの投稿には
          <Link href="/auth" className="text-nl-primary font-medium mx-1 hover:underline">
            ログイン
          </Link>
          が必要です。
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="まだフィードバックはありません"
          description="最初のコメントを投稿してみましょう"
          className="py-10 shadow-none"
        />
      ) : (
        <ul className="space-y-5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <Link href={`/users/${item.profile.slug || item.profile.username}`} className="shrink-0">
                <Avatar
                  src={item.profile.avatar_url}
                  name={item.profile.username}
                  size="sm"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <Link
                      href={`/users/${item.profile.slug || item.profile.username}`}
                      className="text-sm font-semibold text-nl-text hover:text-nl-primary truncate"
                    >
                      {item.profile.username}
                    </Link>
                    <span className="text-xs text-nl-muted shrink-0">
                      {formatDateTime(item.created_at)}
                    </span>
                  </div>
                  {currentUserId === item.user_id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={pending}
                      className="p-1.5 text-nl-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-nl-text leading-relaxed whitespace-pre-wrap">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
    </Card>
  )
}

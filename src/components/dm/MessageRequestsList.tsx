'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Avatar, Button, Card, EmptyState } from '@/components/ui'
import { Toast } from '@/components/ui/Toast'
import { useUserRole } from '@/components/providers/ProfileProvider'
import { getDisplayError } from '@/lib/errors'
import { acceptMessageRequest, rejectMessageRequest } from '@/lib/actions/dm'
import { formatDateTime } from '@/lib/utils'
import type { MessageRequestWithSender } from '@/types'

interface MessageRequestsListProps {
  initialItems: MessageRequestWithSender[]
}

export function MessageRequestsList({ initialItems }: MessageRequestsListProps) {
  const router = useRouter()
  const role = useUserRole()
  const [items, setItems] = useState(initialItems)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function handleAccept(id: string) {
    setError(null)
    setPendingId(id)
    startTransition(async () => {
      const result = await acceptMessageRequest(id)
      setPendingId(null)
      if (!result.ok) {
        console.error(result.error)
        setError(getDisplayError(result.error, role, '許可できませんでした。'))
        return
      }
      setItems((prev) => prev.filter((i) => i.id !== id))
      router.push(`/messages/${result.data.conversationId}`)
    })
  }

  function handleReject(id: string) {
    setError(null)
    setPendingId(id)
    startTransition(async () => {
      const result = await rejectMessageRequest(id)
      setPendingId(null)
      if (!result.ok) {
        console.error(result.error)
        setError(getDisplayError(result.error, role, '拒否できませんでした。'))
        return
      }
      setItems((prev) => prev.filter((i) => i.id !== id))
    })
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="メッセージリクエストはありません"
        description="フォローしていない相手からのメッセージはここに届きます"
        actionLabel="チャット一覧へ"
        actionHref="/messages"
      />
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="p-5">
          <div className="flex items-start gap-3">
            <Link href={`/users/${item.sender.slug || item.sender.username}`}>
              <Avatar src={item.sender.avatar_url} name={item.sender.username} size="md" />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-nl-text mb-1">
                <span className="font-semibold">{item.sender.username}</span>
                さんからメッセージ
              </p>
              <p className="text-sm text-nl-muted line-clamp-3 mb-2 whitespace-pre-wrap">
                {item.body}
              </p>
              <p className="text-xs text-nl-muted mb-4">{formatDateTime(item.created_at)}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  loading={pending && pendingId === item.id}
                  onClick={() => handleAccept(item.id)}
                >
                  許可する
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={pending && pendingId === item.id}
                  onClick={() => handleReject(item.id)}
                >
                  拒否する
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
    </div>
  )
}

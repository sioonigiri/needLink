'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button, EmptyState } from '@/components/ui'
import { Avatar } from '@/components/ui'
import { Toast } from '@/components/ui/Toast'
import { useUserRole } from '@/components/providers/ProfileProvider'
import { getDisplayError } from '@/lib/errors'
import { markAllNotificationsRead, markNotificationRead } from '@/lib/actions/notifications'
import { formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { NotificationWithActor } from '@/types'
import { Bell } from 'lucide-react'

interface NotificationsListProps {
  initialItems: NotificationWithActor[]
}

export function NotificationsList({ initialItems }: NotificationsListProps) {
  const role = useUserRole()
  const [items, setItems] = useState(initialItems)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const unread = items.filter((i) => !i.read_at).length

  function handleMarkAll() {
    setError(null)
    startTransition(async () => {
      const result = await markAllNotificationsRead()
      if (!result.ok) {
        console.error(result.error)
        setError(getDisplayError(result.error, role, '更新できませんでした。'))
        return
      }
      setItems((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      )
    })
  }

  function handleClick(id: string) {
    const item = items.find((n) => n.id === id)
    if (!item || item.read_at) return
    startTransition(async () => {
      const result = await markNotificationRead(id)
      if (!result.ok) {
        console.error(result.error)
        return
      }
      setItems((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      )
    })
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Bell className="w-12 h-12 text-nl-border" />}
        title="通知はありません"
        description="コメントやメッセージが届くとここに表示されます"
      />
    )
  }

  return (
    <div>
      {unread > 0 && (
        <div className="flex justify-end mb-4">
          <Button type="button" variant="ghost" size="sm" loading={pending} onClick={handleMarkAll}>
            すべて既読にする
          </Button>
        </div>
      )}
      <ul className="bg-nl-card rounded-nl-card border border-nl-card-border shadow-nl-card divide-y divide-nl-card-border overflow-hidden">
        {items.map((item) => {
          const content = (
            <div
              className={cn(
                'flex items-start gap-3 px-4 sm:px-5 py-4 transition-colors',
                !item.read_at ? 'bg-nl-primary/5' : 'hover:bg-nl-beige/40'
              )}
            >
              <Avatar
                src={item.actor?.avatar_url}
                name={item.actor?.username || '?'}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-nl-text">{item.title}</p>
                {item.body && (
                  <p className="text-sm text-nl-muted mt-0.5 line-clamp-2">{item.body}</p>
                )}
                <p className="text-xs text-nl-muted mt-1">{formatDateTime(item.created_at)}</p>
              </div>
              {!item.read_at && (
                <span className="mt-1.5 w-2 h-2 rounded-full bg-nl-primary shrink-0" />
              )}
            </div>
          )

          return (
            <li key={item.id}>
              {item.link ? (
                <Link href={item.link} onClick={() => handleClick(item.id)}>
                  {content}
                </Link>
              ) : (
                <button type="button" className="w-full text-left" onClick={() => handleClick(item.id)}>
                  {content}
                </button>
              )}
            </li>
          )
        })}
      </ul>
      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
    </div>
  )
}

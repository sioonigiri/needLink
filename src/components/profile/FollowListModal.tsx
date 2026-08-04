'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { Avatar, Modal, Spinner } from '@/components/ui'
import { Toast } from '@/components/ui/Toast'
import { FollowButton } from '@/components/profile/FollowButton'
import { useUserRole } from '@/components/providers/ProfileProvider'
import { getDisplayError } from '@/lib/errors'
import {
  getFollowList,
  type FollowListItem,
  type FollowListKind,
} from '@/lib/actions/follows'

interface FollowListModalProps {
  open: boolean
  onClose: () => void
  profileId: string
  kind: FollowListKind
  currentUserId: string | null
}

export function FollowListModal({
  open,
  onClose,
  profileId,
  kind,
  currentUserId,
}: FollowListModalProps) {
  const role = useUserRole()
  const [items, setItems] = useState<FollowListItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const title = kind === 'following' ? 'フォロー中一覧' : 'フォロワー一覧'
  const emptyMessage =
    kind === 'following'
      ? 'まだ誰もフォローしていません'
      : 'まだフォロワーはいません'

  useEffect(() => {
    if (!open) {
      setLoaded(false)
      setItems([])
      setError(null)
      return
    }

    startTransition(async () => {
      setError(null)
      const result = await getFollowList(profileId, kind)
      if (!result.ok) {
        console.error(result.error)
        setError(getDisplayError(result.error, role, '一覧を取得できませんでした。'))
        setLoaded(true)
        return
      }
      setItems(result.items)
      setLoaded(true)
    })
  }, [open, profileId, kind, role])

  return (
    <>
      <Modal open={open} onClose={onClose} title={title} variant="sheet">
        {!loaded || pending ? (
          <div className="flex justify-center py-12">
            <Spinner size="md" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-nl-muted text-center py-12">{emptyMessage}</p>
        ) : (
          <ul className="divide-y divide-nl-card-border -mx-1">
            {items.map((item) => {
              const p = item.profile
              const href = `/users/${encodeURIComponent(p.slug || p.username)}`
              const isSelf = currentUserId === p.id

              return (
                <li key={item.followId} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <Link
                      href={href}
                      onClick={onClose}
                      className="shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-nl-primary/40"
                    >
                      <Avatar src={p.avatar_url} name={p.username} size="md" />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={href}
                            onClick={onClose}
                            className="block font-semibold text-nl-text hover:text-nl-primary truncate"
                          >
                            {p.username}
                          </Link>
                          <Link
                            href={href}
                            onClick={onClose}
                            className="block text-sm text-nl-muted truncate"
                          >
                            @{p.slug || p.username}
                          </Link>
                        </div>
                        {!isSelf && (
                          <div className="shrink-0 w-[7.5rem]">
                            <FollowButton
                              targetUserId={p.id}
                              currentUserId={currentUserId}
                              initialFollowing={item.isFollowing}
                              className="w-full rounded-nl-input"
                            />
                          </div>
                        )}
                      </div>
                      {p.bio && (
                        <p className="text-sm text-nl-muted mt-1.5 line-clamp-2 leading-relaxed">
                          {p.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Modal>

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
    </>
  )
}

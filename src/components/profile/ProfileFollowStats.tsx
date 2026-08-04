'use client'

import { useState } from 'react'
import { FollowListModal } from '@/components/profile/FollowListModal'
import type { FollowListKind } from '@/lib/actions/follows'

interface ProfileFollowStatsProps {
  profileId: string
  servicesCount: number
  followersCount: number
  followingCount: number
  currentUserId: string | null
}

export function ProfileFollowStats({
  profileId,
  servicesCount,
  followersCount,
  followingCount,
  currentUserId,
}: ProfileFollowStatsProps) {
  const [openKind, setOpenKind] = useState<FollowListKind | null>(null)

  return (
    <>
      <div className="flex items-center gap-6 mt-4">
        <div className="text-sm">
          <span className="font-semibold text-nl-text">{servicesCount}</span>
          <span className="text-nl-muted ml-1">サービス</span>
        </div>
        <button
          type="button"
          onClick={() => setOpenKind('followers')}
          className="text-sm rounded-lg hover:bg-nl-beige px-1.5 py-0.5 -mx-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nl-primary/30"
        >
          <span className="font-semibold text-nl-text">{followersCount}</span>
          <span className="text-nl-muted ml-1">フォロワー</span>
        </button>
        <button
          type="button"
          onClick={() => setOpenKind('following')}
          className="text-sm rounded-lg hover:bg-nl-beige px-1.5 py-0.5 -mx-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-nl-primary/30"
        >
          <span className="font-semibold text-nl-text">{followingCount}</span>
          <span className="text-nl-muted ml-1">フォロー中</span>
        </button>
      </div>

      <FollowListModal
        open={openKind !== null}
        onClose={() => setOpenKind(null)}
        profileId={profileId}
        kind={openKind || 'followers'}
        currentUserId={currentUserId}
      />
    </>
  )
}

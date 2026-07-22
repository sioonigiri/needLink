'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
  targetUserId: string
  currentUserId: string | null
  initialFollowing: boolean
}

export function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowing,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!currentUserId) {
      window.location.href = '/auth'
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (following) {
      await (supabase as any)
        .from('follows')
        .delete()
        .match({ follower_id: currentUserId, following_id: targetUserId })
      setFollowing(false)
    } else {
      await (supabase as any)
        .from('follows')
        .insert({ follower_id: currentUserId, following_id: targetUserId })
      setFollowing(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'flex-1 px-3 py-2 text-sm font-medium rounded-xl border transition-all duration-200',
        following
          ? 'bg-warm-100 border-warm-200 text-warm-700 hover:bg-warm-200'
          : 'bg-warm-500 border-warm-500 text-white hover:bg-warm-600'
      )}
    >
      {following ? 'フォロー中' : 'フォローする'}
    </button>
  )
}

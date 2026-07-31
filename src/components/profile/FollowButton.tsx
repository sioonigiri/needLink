'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'

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
    <Button
      type="button"
      variant={following ? 'secondary' : 'primary'}
      size="sm"
      loading={loading}
      onClick={toggle}
      className="flex-1 rounded-nl-input"
    >
      {following ? 'フォロー中' : 'フォローする'}
    </Button>
  )
}

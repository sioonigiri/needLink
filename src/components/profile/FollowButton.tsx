'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'
import { Toast } from '@/components/ui/Toast'
import { useUserRole } from '@/components/providers/ProfileProvider'
import { getDisplayError } from '@/lib/errors'

interface FollowButtonProps {
  targetUserId: string
  currentUserId: string | null
  initialFollowing: boolean
  className?: string
}

export function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowing,
  className,
}: FollowButtonProps) {
  const role = useUserRole()
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setFollowing(initialFollowing)
  }, [initialFollowing, targetUserId])

  async function toggle() {
    if (!currentUserId) {
      window.location.href = '/auth'
      return
    }

    setLoading(true)
    setError(null)
    const prevFollowing = following
    setFollowing(!prevFollowing)

    try {
      const supabase = createClient()

      if (prevFollowing) {
        const { error: deleteError } = await (supabase as any)
          .from('follows')
          .delete()
          .match({ follower_id: currentUserId, following_id: targetUserId })
        if (deleteError) {
          console.error(deleteError)
          setFollowing(prevFollowing)
          setError(getDisplayError(deleteError, role, 'フォローを更新できませんでした。'))
          return
        }
      } else {
        const { error: insertError } = await (supabase as any)
          .from('follows')
          .insert({ follower_id: currentUserId, following_id: targetUserId })
        if (insertError) {
          console.error(insertError)
          setFollowing(prevFollowing)
          setError(getDisplayError(insertError, role, 'フォローを更新できませんでした。'))
          return
        }
      }
    } catch (err) {
      console.error(err)
      setFollowing(prevFollowing)
      setError(getDisplayError(err, role, 'フォローを更新できませんでした。'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={following ? 'secondary' : 'primary'}
        size="sm"
        loading={loading}
        onClick={toggle}
        className={className || 'flex-1 rounded-nl-input'}
      >
        {following ? 'フォロー中' : 'フォローする'}
      </Button>
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
    </>
  )
}

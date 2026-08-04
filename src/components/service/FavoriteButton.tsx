'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'
import { Toast } from '@/components/ui/Toast'
import { useUserRole } from '@/components/providers/ProfileProvider'
import { getDisplayError } from '@/lib/errors'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  serviceId: string
  userId: string | null
  initialFavorited: boolean
  initialCount: number
}

export function FavoriteButton({
  serviceId,
  userId,
  initialFavorited,
  initialCount,
}: FavoriteButtonProps) {
  const role = useUserRole()
  const [favorited, setFavorited] = useState(initialFavorited)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    if (!userId) {
      window.location.href = '/auth'
      return
    }

    setLoading(true)
    setError(null)
    const prevFavorited = favorited
    const prevCount = count
    setFavorited(!prevFavorited)
    setCount((c) => (prevFavorited ? Math.max(0, c - 1) : c + 1))

    try {
      const supabase = createClient()

      if (prevFavorited) {
        const { error: deleteError } = await (supabase as any)
          .from('favorites')
          .delete()
          .match({ user_id: userId, service_id: serviceId })
        if (deleteError) {
          console.error(deleteError)
          setFavorited(prevFavorited)
          setCount(prevCount)
          setError(getDisplayError(deleteError, role, 'お気に入りを更新できませんでした。'))
          return
        }
      } else {
        const { error: insertError } = await (supabase as any)
          .from('favorites')
          .insert({ user_id: userId, service_id: serviceId })
        if (insertError) {
          console.error(insertError)
          setFavorited(prevFavorited)
          setCount(prevCount)
          setError(getDisplayError(insertError, role, 'お気に入りを更新できませんでした。'))
          return
        }
      }
    } catch (err) {
      console.error(err)
      setFavorited(prevFavorited)
      setCount(prevCount)
      setError(getDisplayError(err, role, 'お気に入りを更新できませんでした。'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={loading}
        onClick={toggle}
        className={cn(
          'rounded-nl-input',
          favorited && 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100 hover:border-red-200 hover:shadow-none'
        )}
      >
        <Heart className={cn('w-4 h-4 transition-transform', favorited && 'fill-current scale-110')} />
        <span className="tabular-nums">{count}</span>
        <span>{favorited ? 'お気に入り済み' : 'お気に入り'}</span>
      </Button>
      {error && (
        <Toast message={error} type="error" onClose={() => setError(null)} />
      )}
    </>
  )
}

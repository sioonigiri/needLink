'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'
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
  const [favorited, setFavorited] = useState(initialFavorited)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!userId) {
      window.location.href = '/auth'
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (favorited) {
      await (supabase as any)
        .from('favorites')
        .delete()
        .match({ user_id: userId, service_id: serviceId })
      setFavorited(false)
      setCount((c) => Math.max(0, c - 1))
    } else {
      await (supabase as any)
        .from('favorites')
        .insert({ user_id: userId, service_id: serviceId })
      setFavorited(true)
      setCount((c) => c + 1)
    }
    setLoading(false)
  }

  return (
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
      {count > 0 && <span>{count}</span>}
      <span>{favorited ? 'お気に入り済み' : 'お気に入り'}</span>
    </Button>
  )
}

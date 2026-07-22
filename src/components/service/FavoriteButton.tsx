'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
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
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all duration-200',
        favorited
          ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
          : 'bg-white border-cream-300 text-ink-600 hover:bg-cream-100'
      )}
    >
      <Heart className={cn('w-4 h-4 transition-transform', favorited && 'fill-current scale-110')} />
      <span>{count > 0 ? count : ''}</span>
      <span>{favorited ? 'お気に入り済み' : 'お気に入り'}</span>
    </button>
  )
}

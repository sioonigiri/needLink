'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart, Pencil } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, Card } from '@/components/ui'
import { TagChip } from '@/components/ui/TagChip'
import { createClient } from '@/lib/supabase/client'
import { SERVICE_STATUS_LABELS, SERVICE_STATUS_COLORS, ServiceStatus, ServiceWithProfile } from '@/types'
import { getCategoriesByIds } from '@/data/categories'
import { cn } from '@/lib/utils'

interface ServiceCardProps {
  service: ServiceWithProfile
  currentUserId?: string | null
}

export function ServiceCard({ service, currentUserId }: ServiceCardProps) {
  const router = useRouter()
  const [favorited, setFavorited] = useState(service.is_favorited ?? false)
  const [favoriteCount, setFavoriteCount] = useState(service.favorites_count)
  const [loading, setLoading] = useState(false)

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUserId) {
      window.location.href = '/auth'
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (favorited) {
      await (supabase as any)
        .from('favorites')
        .delete()
        .match({ user_id: currentUserId, service_id: service.id })
      setFavorited(false)
      setFavoriteCount((c) => Math.max(0, c - 1))
    } else {
      await (supabase as any)
        .from('favorites')
        .insert({ user_id: currentUserId, service_id: service.id })
      setFavorited(true)
      setFavoriteCount((c) => c + 1)
    }
    setLoading(false)
  }

  const status = service.status as ServiceStatus
  const isOwner = !!(currentUserId && currentUserId === service.user_id)

  return (
    <Link href={`/services/${service.id}`} className="group block">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5">
        {/* Thumbnail */}
        <div className="relative aspect-[16/9] bg-nl-beige overflow-hidden">
          {service.thumbnail_url ? (
            <Image
              src={service.thumbnail_url}
              alt={service.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nl-beige to-nl-card-border">
              <span className="text-4xl font-bold text-nl-muted/40">
                {service.name.charAt(0)}
              </span>
            </div>
          )}
          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm',
                SERVICE_STATUS_COLORS[status]
              )}
            >
              {SERVICE_STATUS_LABELS[status]}
            </span>
          </div>
          {/* 自分のサービス → 編集ボタン / 他者のサービス → お気に入りボタン */}
          {isOwner ? (
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push(`/services/${service.id}/edit`) }}
              className="absolute top-3 right-3 p-2 rounded-full bg-white/80 text-nl-muted hover:text-nl-text hover:bg-white backdrop-blur-sm transition-all duration-200"
            >
              <Pencil className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={toggleFavorite}
              disabled={loading}
              className={cn(
                'absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200',
                favorited
                  ? 'bg-red-50 text-red-500'
                  : 'bg-white/80 text-nl-muted hover:text-red-400 hover:bg-red-50'
              )}
            >
              <Heart className={cn('w-4 h-4', favorited && 'fill-current')} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-nl-text group-hover:text-nl-primary transition-colors line-clamp-1">
              {service.name}
            </h3>
            {favoriteCount > 0 && (
              <span className="flex items-center gap-1 text-xs text-nl-muted shrink-0">
                <Heart className="w-3 h-3 fill-red-400 text-red-400" />
                {favoriteCount}
              </span>
            )}
          </div>
          <p className="text-sm text-nl-muted line-clamp-2 mb-3">{service.tagline}</p>

          {/* カテゴリ */}
          {(service as any).categories?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {getCategoriesByIds((service as any).categories).map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-nl-beige text-nl-muted"
                >
                  {cat.emoji} {cat.label}
                </span>
              ))}
            </div>
          )}

          {/* Tags — クリックで検索へ遷移（カード自体のLink伝播を止める） */}
          {service.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3" onClick={(e) => e.preventDefault()}>
              {service.tags.slice(0, 3).map((tag) => (
                <TagChip key={tag} variant="clickable" label={tag} />
              ))}
              {service.tags.length > 3 && (
                <span className="text-xs text-nl-muted self-center">+{service.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-2 pt-3 border-t border-nl-card-border">
            <Avatar
              src={service.profile.avatar_url}
              name={service.profile.username}
              size="xs"
            />
            <span className="text-xs text-nl-muted">
              {service.profile.username}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

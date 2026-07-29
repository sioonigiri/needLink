import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Globe, ShoppingBag, Play, ExternalLink, Heart, Calendar, Pencil } from 'lucide-react'
import { GithubIcon, XIcon } from '@/components/ui/Icons'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { TagChip } from '@/components/ui/TagChip'
import { SERVICE_STATUS_LABELS, SERVICE_STATUS_COLORS, ServiceStatus } from '@/types'
import { getCategoriesByIds } from '@/data/categories'
import { cn, formatDate } from '@/lib/utils'
import { FavoriteButton } from '@/components/service/FavoriteButton'
import { DeleteServiceButton } from '@/components/service/DeleteServiceButton'
import { FollowButton } from '@/components/profile/FollowButton'

interface ServiceDetailPageProps {
  params: { id: string }
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: serviceRaw } = await supabase
    .from('services')
    .select(`
      *,
      profile:profiles(*),
      favorites_count:favorites(count)
    `)
    .eq('id', params.id)
    .single()

  if (!serviceRaw) notFound()

  const service = serviceRaw as any
  const status = service.status as ServiceStatus
  const profile = service.profile
  const favCount = service.favorites_count?.[0]?.count || 0

  let isFavorited = false
  let isFollowing = false
  if (user) {
    const [{ data: fav }, { data: follow }] = await Promise.all([
      supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('service_id', params.id)
        .single(),
      supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .single(),
    ])
    isFavorited = !!fav
    isFollowing = !!follow
  }

  const links = [
    { icon: Globe, label: 'Webサイト', url: service.website_url },
    { icon: GithubIcon, label: 'GitHub', url: service.github_url },
    { icon: ShoppingBag, label: 'App Store', url: service.app_store_url },
    { icon: Play, label: 'Google Play', url: service.google_play_url },
  ].filter((l) => l.url)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-cream-300 shadow-soft overflow-hidden mb-6">
        {/* Thumbnail */}
        {service.thumbnail_url && (
          <div className="relative aspect-[16/6] bg-cream-100">
            <Image
              src={service.thumbnail_url}
              alt={service.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    SERVICE_STATUS_COLORS[status]
                  )}
                >
                  {SERVICE_STATUS_LABELS[status]}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink-800 mb-2">
                {service.name}
              </h1>
              <p className="text-ink-500 text-lg">{service.tagline}</p>
            </div>
            {user && user.id === service.user_id ? (
              <div className="flex flex-col gap-2.5 shrink-0">
                <Link
                  href={`/services/${service.id}/edit`}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-cream-300 text-ink-700 hover:bg-cream-100 rounded-xl text-sm font-medium transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  編集する
                </Link>
                <DeleteServiceButton
                  serviceId={service.id}
                  userId={user.id}
                  redirectTo="/"
                />
              </div>
            ) : (
              <FavoriteButton
                serviceId={service.id}
                userId={user?.id || null}
                initialFavorited={isFavorited}
                initialCount={favCount}
              />
            )}
          </div>

          {/* Tags */}
          {service.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {service.tags.map((tag: string) => (
                <TagChip key={tag} variant="clickable" label={tag} />
              ))}
            </div>
          )}

          {/* Categories */}
          {service.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {getCategoriesByIds(service.categories).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/search?categories=${cat.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-cream-100 text-ink-600 hover:bg-warm-100 hover:text-warm-700 transition-colors"
                >
                  {cat.emoji} {cat.label}
                </Link>
              ))}
            </div>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6">
              {links.map(({ icon: Icon, label, url }) => (
                <a
                  key={label}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-cream-100 hover:bg-cream-200 text-ink-700 text-sm font-medium rounded-xl transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <ExternalLink className="w-3 h-3 text-ink-400" />
                </a>
              ))}
            </div>
          )}

          <p className="text-xs text-ink-400 mt-6 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(service.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {service.description && (
            <div className="bg-white rounded-2xl border border-cream-300 p-6 sm:p-8">
              <h2 className="font-semibold text-ink-800 text-lg mb-4">説明</h2>
              <p className="text-ink-600 leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </div>
          )}

          {/* Screenshots */}
          {service.screenshots?.length > 0 && (
            <div className="bg-white rounded-2xl border border-cream-300 p-6 sm:p-8">
              <h2 className="font-semibold text-ink-800 text-lg mb-4">スクリーンショット</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.screenshots.map((src: string, i: number) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-cream-100">
                    <Image
                      src={src}
                      alt={`スクリーンショット${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Author */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-cream-300 p-5">
            <h3 className="text-sm font-semibold text-ink-500 uppercase tracking-wider mb-4">
              作者
            </h3>
            <Link
              href={`/users/${profile.slug || profile.username}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar
                src={profile.avatar_url}
                name={profile.username}
                size="md"
              />
              <div>
                <div className="font-semibold text-ink-800">
                  {profile.username}
                </div>
                <div className="text-sm text-ink-500">@{profile.username}</div>
              </div>
            </Link>
            {profile.bio && (
              <p className="text-sm text-ink-600 mt-3 leading-relaxed">{profile.bio}</p>
            )}
            {profile.tech_tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.tech_tags.map((tag: string) => (
                  <Badge key={tag} variant="warm">{tag}</Badge>
                ))}
              </div>
            )}
            <div className="mt-4 flex gap-2">
              {user?.id !== profile.id && (
                <FollowButton
                  targetUserId={profile.id}
                  currentUserId={user?.id || null}
                  initialFollowing={isFollowing}
                />
              )}
              <Link
                href={`/users/${profile.slug || profile.username}`}
                className="flex-1 text-center px-3 py-2 text-sm text-ink-600 hover:bg-cream-100 rounded-xl border border-cream-300 transition-colors"
              >
                プロフィールを見る
              </Link>
            </div>

            {/* Social links */}
            {(profile.github_url || profile.twitter_url || profile.website_url) && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-cream-200">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-ink-500 hover:text-ink-700 hover:bg-cream-100 rounded-lg transition-colors"
                  >
                    <GithubIcon size={16} />
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-ink-500 hover:text-ink-700 hover:bg-cream-100 rounded-lg transition-colors"
                  >
                    <XIcon size={16} />
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-ink-500 hover:text-ink-700 hover:bg-cream-100 rounded-lg transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

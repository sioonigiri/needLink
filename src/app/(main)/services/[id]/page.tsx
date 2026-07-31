import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Globe, ShoppingBag, Play, ExternalLink, Calendar, Pencil } from 'lucide-react'
import { GithubIcon, XIcon } from '@/components/ui/Icons'
import { Avatar, Badge, Button, Card } from '@/components/ui'
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

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase
    .from('services')
    .select('name, tagline')
    .eq('id', params.id)
    .single()

  const service = data as { name?: string; tagline?: string } | null
  if (!service) return { title: 'サービス' }

  return {
    title: service.name,
    description: service.tagline || undefined,
    alternates: {
      canonical: `/services/${params.id}`,
    },
    openGraph: {
      title: service.name,
      description: service.tagline || undefined,
      url: `/services/${params.id}`,
      type: 'website',
    },
  }
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
      <Card className="overflow-hidden mb-6">
        {service.thumbnail_url && (
          <div className="relative aspect-[16/6] bg-nl-beige">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-nl-text mb-2">
                {service.name}
              </h1>
              <p className="text-nl-muted text-lg">{service.tagline}</p>
            </div>
            {user && user.id === service.user_id ? (
              <div className="flex flex-col gap-2.5 shrink-0">
                <Button href={`/services/${service.id}/edit`} variant="secondary" size="sm">
                  <Pencil className="w-4 h-4" />
                  編集する
                </Button>
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

          {service.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {service.tags.map((tag: string) => (
                <TagChip key={tag} variant="clickable" label={tag} />
              ))}
            </div>
          )}

          {service.categories?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {getCategoriesByIds(service.categories).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/search?categories=${cat.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-nl-beige text-nl-muted hover:bg-nl-primary/10 hover:text-nl-primary transition-all duration-200"
                >
                  {cat.emoji} {cat.label}
                </Link>
              ))}
            </div>
          )}

          {links.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6">
              {links.map(({ icon: Icon, label, url }) => (
                <a
                  key={label}
                  href={url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-nl-beige hover:bg-nl-card-border text-nl-text text-sm font-medium rounded-nl-input transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <ExternalLink className="w-3 h-3 text-nl-muted" />
                </a>
              ))}
            </div>
          )}

          <p className="text-xs text-nl-muted mt-6 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(service.created_at)}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {service.description && (
            <Card className="p-6 sm:p-8">
              <h2 className="font-semibold text-nl-text text-lg mb-4">説明</h2>
              <p className="text-nl-muted leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </Card>
          )}

          {service.screenshots?.length > 0 && (
            <Card className="p-6 sm:p-8">
              <h2 className="font-semibold text-nl-text text-lg mb-4">スクリーンショット</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.screenshots.map((src: string, i: number) => (
                  <div key={i} className="relative aspect-video rounded-nl-input overflow-hidden bg-nl-beige">
                    <Image
                      src={src}
                      alt={`スクリーンショット${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-nl-muted uppercase tracking-wider mb-4">
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
                <div className="font-semibold text-nl-text">
                  {profile.username}
                </div>
                <div className="text-sm text-nl-muted">@{profile.username}</div>
              </div>
            </Link>
            {profile.bio && (
              <p className="text-sm text-nl-muted mt-3 leading-relaxed">{profile.bio}</p>
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
              <Button
                href={`/users/${profile.slug || profile.username}`}
                variant="secondary"
                size="sm"
                className="flex-1 rounded-nl-input"
              >
                プロフィールを見る
              </Button>
            </div>

            {(profile.github_url || profile.twitter_url || profile.website_url) && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-nl-card-border">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-nl-muted hover:text-nl-text hover:bg-nl-beige rounded-lg transition-all duration-200"
                  >
                    <GithubIcon size={16} />
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-nl-muted hover:text-nl-text hover:bg-nl-beige rounded-lg transition-all duration-200"
                  >
                    <XIcon size={16} />
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-nl-muted hover:text-nl-text hover:bg-nl-beige rounded-lg transition-all duration-200"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

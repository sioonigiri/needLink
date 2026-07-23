import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Globe } from 'lucide-react'
import { GithubIcon, XIcon } from '@/components/ui/Icons'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ServiceCard } from '@/components/service/ServiceCard'
import { FollowButton } from '@/components/profile/FollowButton'
import { ServiceWithProfile } from '@/types'

interface UserProfilePageProps {
  params: { username: string }
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const supabase = createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profileRaw) notFound()
  const profile = profileRaw as any

  const [
    { data: servicesRaw },
    { data: followersResult },
    { data: followingResult },
  ] = await Promise.all([
    supabase
      .from('services')
      .select(`*, profile:profiles(*), favorites_count:favorites(count)`)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('follows')
      .select('id', { count: 'exact' })
      .eq('following_id', profile.id),
    supabase
      .from('follows')
      .select('id', { count: 'exact' })
      .eq('follower_id', profile.id),
  ])

  let isFollowing = false
  let favoriteServiceIds: string[] = []
  if (currentUser) {
    const [{ data: follow }, { data: favs }] = await Promise.all([
      supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUser.id)
        .eq('following_id', profile.id)
        .single(),
      supabase
        .from('favorites')
        .select('service_id')
        .eq('user_id', currentUser.id),
    ])
    isFollowing = !!follow
    favoriteServiceIds = (favs as any[])?.map((f) => f.service_id) || []
  }

  const servicesWithFav: ServiceWithProfile[] = ((servicesRaw as any[]) || []).map((s) => ({
    ...s,
    favorites_count: s.favorites_count?.[0]?.count || 0,
    is_favorited: favoriteServiceIds.includes(s.id),
  }))

  const followersCount = followersResult?.length || 0
  const followingCount = followingResult?.length || 0

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-cream-300 shadow-soft p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar
            src={profile.avatar_url}
            name={profile.username}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-ink-800">
                  {profile.username}
                </h1>
                <p className="text-ink-500">@{profile.username}</p>
              </div>
              {currentUser && currentUser.id !== profile.id && (
                <FollowButton
                  targetUserId={profile.id}
                  currentUserId={currentUser.id}
                  initialFollowing={isFollowing}
                />
              )}
              {currentUser?.id === profile.id && (
                <Link
                  href="/settings/profile"
                  className="px-4 py-2 text-sm font-medium text-ink-600 bg-cream-100 hover:bg-cream-200 rounded-xl border border-cream-300 transition-colors"
                >
                  プロフィール編集
                </Link>
              )}
            </div>

            {profile.bio && (
              <p className="text-ink-600 mt-3 leading-relaxed">{profile.bio}</p>
            )}

            {profile.tech_tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.tech_tags.map((tag: string) => (
                  <Badge key={tag} variant="warm">{tag}</Badge>
                ))}
              </div>
            )}

            <div className="flex items-center gap-6 mt-4">
              <div className="text-sm">
                <span className="font-semibold text-ink-800">{servicesWithFav.length}</span>
                <span className="text-ink-500 ml-1">サービス</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-ink-800">{followersCount}</span>
                <span className="text-ink-500 ml-1">フォロワー</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-ink-800">{followingCount}</span>
                <span className="text-ink-500 ml-1">フォロー中</span>
              </div>
            </div>

            {/* Social links */}
            {(profile.github_url || profile.twitter_url || profile.website_url) && (
              <div className="flex gap-3 mt-4">
                {profile.github_url && (
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 transition-colors"
                  >
                    <GithubIcon size={16} />
                    GitHub
                  </a>
                )}
                {profile.twitter_url && (
                  <a
                    href={profile.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 transition-colors"
                  >
                    <XIcon size={16} />
                    X (Twitter)
                  </a>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xl font-bold text-ink-800 mb-5">
          投稿したサービス
        </h2>
        {servicesWithFav.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesWithFav.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                currentUserId={currentUser?.id || null}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-cream-200">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-ink-500">まだサービスを投稿していません</p>
            {currentUser?.id === profile.id && (
              <Link
                href="/services/new"
                className="inline-block mt-4 px-5 py-2.5 bg-warm-500 text-white rounded-xl text-sm font-medium hover:bg-warm-600 transition-colors"
              >
                最初のサービスを投稿する
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

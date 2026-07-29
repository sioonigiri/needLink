import { Suspense } from 'react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ServiceCard } from '@/components/service/ServiceCard'
import { SearchFilters } from '@/components/service/SearchFilters'
import { ServiceWithProfile } from '@/types'

export const metadata: Metadata = {
  title: 'サービスを探す',
  description: '個人開発者が公開したサービスを検索・発見できます。',
  alternates: {
    canonical: '/search',
  },
}

interface SearchPageProps {
  searchParams: {
    q?: string
    tags?: string
    status?: string
    categories?: string
    sort?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const query = searchParams.q || ''
  const tagFilter = searchParams.tags
    ? searchParams.tags.split(',').map((t) => t.trim()).filter(Boolean)
    : []
  const statusFilter = searchParams.status || ''
  const categoryFilter = searchParams.categories
    ? searchParams.categories.split(',').map((c) => c.trim()).filter(Boolean)
    : []
  const sort = searchParams.sort === 'favorites' ? 'favorites' : 'newest'

  let servicesQuery = supabase
    .from('services')
    .select(`*, profile:profiles(*), favorites_count:favorites(count)`)
    .order('created_at', { ascending: false })

  if (query) {
    servicesQuery = servicesQuery.or(
      `name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`
    )
  }

  if (tagFilter.length > 0) {
    servicesQuery = servicesQuery.contains('tags', tagFilter)
  }

  if (statusFilter) {
    servicesQuery = servicesQuery.eq('status', statusFilter)
  }

  if (categoryFilter.length > 0) {
    servicesQuery = (servicesQuery as any).overlaps('categories', categoryFilter)
  }

  const { data: services } = await servicesQuery

  let favoriteServiceIds: string[] = []
  if (user) {
    const { data: favs } = await supabase
      .from('favorites')
      .select('service_id')
      .eq('user_id', user.id)
    favoriteServiceIds = (favs as any[])?.map((f) => f.service_id) || []
  }

  let servicesWithFav: ServiceWithProfile[] = (services || []).map((s: any) => ({
    ...s,
    favorites_count: s.favorites_count?.[0]?.count || 0,
    is_favorited: favoriteServiceIds.includes(s.id),
  }))

  // お気に入り数順（同数なら新着順）
  if (sort === 'favorites') {
    servicesWithFav = [...servicesWithFav].sort((a, b) => {
      if (b.favorites_count !== a.favorites_count) {
        return b.favorites_count - a.favorites_count
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  const hasActiveFilter = !!(query || tagFilter.length > 0 || statusFilter || categoryFilter.length > 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Suspense fallback={
        <div className="mb-8">
          <div className="h-8 bg-cream-200 rounded-xl w-40 animate-pulse mb-5" />
          <div className="h-12 bg-cream-200 rounded-xl animate-pulse" />
        </div>
      }>
        <SearchFilters
          query={query}
          tags={tagFilter}
          status={statusFilter}
          categories={categoryFilter}
          sort={sort}
          resultCount={servicesWithFav.length}
        />
      </Suspense>

      {servicesWithFav.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesWithFav.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              currentUserId={user?.id || null}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-cream-200">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-ink-700 mb-2">
            {hasActiveFilter ? '検索結果が見つかりませんでした' : 'まだサービスがありません'}
          </h3>
          <p className="text-ink-500">
            {hasActiveFilter
              ? '別のキーワードやタグで試してみてください'
              : '最初の投稿者になりましょう！'}
          </p>
        </div>
      )}
    </div>
  )
}

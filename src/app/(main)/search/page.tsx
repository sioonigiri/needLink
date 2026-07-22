import { createClient } from '@/lib/supabase/server'
import { ServiceCard } from '@/components/service/ServiceCard'
import { ServiceWithProfile } from '@/types'
import { Search } from 'lucide-react'

interface SearchPageProps {
  searchParams: {
    q?: string
    tag?: string
    status?: string
  }
}

const STATUS_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'developing', label: '開発中' },
  { value: 'beta', label: 'ベータ' },
  { value: 'published', label: '公開中' },
  { value: 'paused', label: '休止中' },
]

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const query = searchParams.q || ''
  const tagFilter = searchParams.tag || ''
  const statusFilter = searchParams.status || ''

  let servicesQuery = supabase
    .from('services')
    .select(`*, profile:profiles(*), favorites_count:favorites(count)`)
    .order('created_at', { ascending: false })

  if (query) {
    servicesQuery = servicesQuery.or(
      `name.ilike.%${query}%,tagline.ilike.%${query}%,description.ilike.%${query}%`
    )
  }

  if (tagFilter) {
    servicesQuery = servicesQuery.contains('tags', [tagFilter])
  }

  if (statusFilter) {
    servicesQuery = servicesQuery.eq('status', statusFilter)
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

  const servicesWithFav: ServiceWithProfile[] = (services || []).map((s: any) => ({
    ...s,
    favorites_count: s.favorites_count?.[0]?.count || 0,
    is_favorited: favoriteServiceIds.includes(s.id),
  }))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-800 mb-5">サービスを探す</h1>

        {/* Search Form */}
        <form method="get" className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              name="q"
              type="text"
              defaultValue={query}
              placeholder="サービス名、タグ、技術で検索..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-400 focus:border-warm-400 focus:ring-2 focus:ring-warm-400/20 outline-none bg-white text-ink-800 placeholder:text-ink-300"
            />
          </div>
          <select
            name="status"
            defaultValue={statusFilter}
            className="px-3.5 py-2.5 rounded-xl border border-cream-400 focus:border-warm-400 outline-none bg-white text-ink-700"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-5 py-2.5 bg-warm-500 text-white rounded-xl text-sm font-medium hover:bg-warm-600 transition-colors"
          >
            検索
          </button>
        </form>

        {(query || tagFilter || statusFilter) && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-ink-500">
              {servicesWithFav.length}件の結果
            </span>
            {query && (
              <span className="px-2.5 py-1 bg-cream-200 text-ink-600 text-xs rounded-full">
                「{query}」
              </span>
            )}
            {tagFilter && (
              <span className="px-2.5 py-1 bg-cream-200 text-ink-600 text-xs rounded-full">
                #{tagFilter}
              </span>
            )}
            <a
              href="/search"
              className="text-xs text-warm-600 hover:underline ml-auto"
            >
              クリア
            </a>
          </div>
        )}
      </div>

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
            {query || tagFilter ? '検索結果が見つかりませんでした' : 'まだサービスがありません'}
          </h3>
          <p className="text-ink-500">
            {query || tagFilter ? '別のキーワードで試してみてください' : '最初の投稿者になりましょう！'}
          </p>
        </div>
      )}
    </div>
  )
}

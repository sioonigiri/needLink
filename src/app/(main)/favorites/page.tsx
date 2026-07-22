import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ServiceCard } from '@/components/service/ServiceCard'
import { ServiceWithProfile } from '@/types'
import Link from 'next/link'
import { Heart } from 'lucide-react'

export default async function FavoritesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      service_id,
      service:services(
        *,
        profile:profiles(*),
        favorites_count:favorites(count)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const services: ServiceWithProfile[] = (favorites || [])
    .map((f: any) => f.service)
    .filter(Boolean)
    .map((s: any) => ({
      ...s,
      favorites_count: s.favorites_count?.[0]?.count || 0,
      is_favorited: true,
    }))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-800">お気に入り</h1>
        <p className="text-ink-500 mt-1">{services.length}件保存済み</p>
      </div>

      {services.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              currentUserId={user.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-cream-200">
          <Heart className="w-12 h-12 text-cream-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-ink-700 mb-2">
            まだお気に入りがありません
          </h3>
          <p className="text-ink-500 mb-6">
            気になるサービスをお気に入りに追加しましょう
          </p>
          <Link
            href="/search"
            className="inline-block px-5 py-2.5 bg-warm-500 text-white rounded-xl text-sm font-medium hover:bg-warm-600 transition-colors"
          >
            サービスを探す
          </Link>
        </div>
      )}
    </div>
  )
}

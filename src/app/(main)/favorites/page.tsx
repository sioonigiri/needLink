import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ServiceCard } from '@/components/service/ServiceCard'
import { ServiceWithProfile } from '@/types'
import { EmptyState } from '@/components/ui'
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
        <h1 className="text-2xl font-bold text-nl-text">お気に入り</h1>
        <p className="text-nl-muted mt-1">{services.length}件保存済み</p>
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
        <EmptyState
          icon={<Heart className="w-12 h-12 text-nl-border" />}
          title="まだお気に入りがありません"
          description="気になるサービスをお気に入りに追加しましょう"
          actionLabel="サービスを探す"
          actionHref="/search"
        />
      )}
    </div>
  )
}

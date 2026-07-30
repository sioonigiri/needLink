import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { ServiceCard } from '@/components/service/ServiceCard'
import { Button } from '@/components/ui/Button'
import { ServiceWithProfile } from '@/types'
import { SITE } from '@/data/site'

export const metadata: Metadata = {
  alternates: {
    // 末尾スラッシュ付きで明示（GSCの正規URL統一用）
    canonical: `${SITE.url}/`,
  },
}

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 最新のサービスを取得
  const { data: services } = await supabase
    .from('services')
    .select(`
      *,
      profile:profiles(*),
      favorites_count:favorites(count)
    `)
    .order('created_at', { ascending: false })
    .limit(12)

  // 総件数を取得（Stats表示用）
  const [
    { count: totalServices },
    { count: totalProfiles },
  ] = await Promise.all([
    supabase.from('services').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  // お気に入り状態を取得
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
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-cream-50 to-cream-100 border-b border-cream-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-warm-100 text-warm-700 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            個人開発者のためのショーケース
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-ink-800 leading-tight mb-6">
            作ったものが、
            <br />
            <span className="text-warm-500">人と仕事をつなぐ。</span>
          </h1>
          <p className="text-lg sm:text-xl text-ink-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            NeedLinkは、個人開発者がサービスを公開し、
            <br className="hidden sm:block" />
            世界に発信できるプラットフォームです。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {user ? (
              <Button href="/services/new" size="lg">
                サービスを投稿する
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button href="/auth?tab=signup" size="lg">
                  無料ではじめる
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button href="/search" variant="secondary" size="lg">
                  サービスを探す
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-cream-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-ink-800">
                {totalServices ?? 0}
              </div>
              <div className="text-sm text-ink-500 mt-1">公開サービス</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-ink-800">
                {totalProfiles ?? 0}
              </div>
              <div className="text-sm text-ink-500 mt-1">開発者</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-ink-800">0円</div>
              <div className="text-sm text-ink-500 mt-1">完全無料</div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Services */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-ink-800">最新のサービス</h2>
            <p className="text-ink-500 mt-1">個人開発者が作った最新作品</p>
          </div>
          <Link
            href="/search"
            className="flex items-center gap-1.5 text-sm text-warm-600 hover:text-warm-700 font-medium transition-colors"
          >
            すべて見る
            <ArrowRight className="w-4 h-4" />
          </Link>
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
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-ink-700 mb-2">
              まだサービスが投稿されていません
            </h3>
            <p className="text-ink-500 mb-6">最初の投稿者になりましょう！</p>
            <Button href={user ? '/services/new' : '/auth?tab=signup'}>
              {user ? 'サービスを投稿する' : 'はじめる'}
            </Button>
          </div>
        )}
      </section>

      {/* CTA */}
      {!user && (
        <section className="bg-warm-500 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              あなたの作品を世界へ
            </h2>
            <p className="text-warm-100 text-lg mb-8">
              NeedLinkで、あなたが作ったサービスを発信しましょう。
            </p>
            <Button href="/auth?tab=signup" variant="secondary" size="lg">
              無料で始める
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}

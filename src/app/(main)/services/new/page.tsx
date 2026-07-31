import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ServiceForm } from '@/components/service/ServiceForm'

export default async function NewServicePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  // プロフィールが存在しない場合はプロフィール設定へ
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/settings/profile?from=new-service')

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-nl-text">サービスを投稿する</h1>
        <p className="text-nl-muted mt-1">あなたが作ったサービスを世界に公開しましょう</p>
      </div>
      <ServiceForm userId={user.id} />
    </div>
  )
}

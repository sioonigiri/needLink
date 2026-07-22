import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { ServiceForm } from '@/components/service/ServiceForm'

interface EditServicePageProps {
  params: { id: string }
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: serviceRaw } = await (supabase as any)
    .from('services')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!serviceRaw) notFound()
  const service = serviceRaw as any
  if (service.user_id !== user.id) redirect(`/services/${params.id}`)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-800">サービスを編集</h1>
        <p className="text-ink-500 mt-1">{service.name}</p>
      </div>
      <ServiceForm
        userId={user.id}
        initialData={{
          id: service.id,
          name: service.name,
          tagline: service.tagline,
          description: service.description || undefined,
          thumbnail_url: service.thumbnail_url || undefined,
          screenshots: service.screenshots,
          tags: service.tags,
          github_url: service.github_url || undefined,
          website_url: service.website_url || undefined,
          app_store_url: service.app_store_url || undefined,
          google_play_url: service.google_play_url || undefined,
          status: service.status as any,
        }}
      />
    </div>
  )
}

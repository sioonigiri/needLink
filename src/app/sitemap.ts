import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { SITE } from '@/data/site'

const BASE_URL = SITE.url

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    return staticPages
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const [{ data: services }, { data: profiles }] = await Promise.all([
    supabase
      .from('services')
      .select('id, updated_at')
      .order('updated_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('slug, username, updated_at')
      .order('updated_at', { ascending: false }),
  ])

  const servicePages: MetadataRoute.Sitemap = (services || []).map((s) => ({
    url: `${BASE_URL}/services/${s.id}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const profilePages: MetadataRoute.Sitemap = (profiles || [])
    .map((p) => {
      const handle = p.slug || p.username
      if (!handle) return null
      return {
        url: `${BASE_URL}/users/${encodeURIComponent(handle)}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)

  return [...staticPages, ...servicePages, ...profilePages]
}

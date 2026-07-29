import type { MetadataRoute } from 'next'
import { SITE } from '@/data/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NeedLink',
    short_name: 'NeedLink',
    description: '個人開発者が制作したサービスを公開・発見できるプラットフォーム。',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F5',
    theme_color: '#B8743A',
    lang: 'ja',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}

import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { SITE } from '@/data/site'
import { JsonLd } from '@/components/seo/JsonLd'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'NeedLink | 個人開発者とサービスをつなぐプラットフォーム',
    template: '%s | NeedLink',
  },
  description:
    '個人開発者が制作したサービスを公開・発見できるプラットフォーム。作品をポートフォリオとして公開し、ユーザーや企業との新しいつながりを生み出します。',
  applicationName: SITE.name,
  openGraph: {
    title: 'NeedLink',
    description: '個人開発者が制作したサービスを公開・発見できるプラットフォーム。',
    url: SITE.url,
    siteName: SITE.name,
    locale: 'ja_JP',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NeedLink',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeedLink',
    description: '個人開発者が制作したサービスを公開・発見できるプラットフォーム。',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', type: 'image/png' }],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cream-100 text-ink-800 min-h-screen antialiased">
        <JsonLd />
        {children}
        {process.env.NODE_ENV === 'production' && gaId && (
          <GoogleAnalytics gaId={gaId} />
        )}
      </body>
    </html>
  )
}

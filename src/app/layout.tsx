import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NeedLink - 個人開発者のためのショーケース',
  description: '作ったものが、人と仕事と次のサービスをつなぐ。個人開発者がサービスを公開・発見できるプラットフォーム。',
  openGraph: {
    title: 'NeedLink',
    description: '個人開発者のためのショーケース',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        {children}
      </body>
    </html>
  )
}

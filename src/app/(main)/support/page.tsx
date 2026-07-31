import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { SITE } from '@/data/site'
import { Card } from '@/components/ui'

export const metadata: Metadata = {
  title: 'サポート',
  description: 'NeedLinkへのお問い合わせ・サポート',
  alternates: {
    canonical: '/support',
  },
}

export default function SupportPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <Card className="p-8 sm:p-10">
        <h1 className="text-2xl font-bold text-nl-text mb-3">サポート</h1>
        <p className="text-nl-muted leading-relaxed mb-8">
          NeedLinkについてのご質問・不具合報告・ご要望などがありましたら、
          下記のメールアドレスまでお気軽にご連絡ください。
        </p>

        <div className="rounded-nl-card bg-nl-beige border border-nl-card-border p-6">
          <p className="text-xs font-semibold text-nl-muted uppercase tracking-wider mb-3">
            お問い合わせ先
          </p>
          <a
            href={`mailto:${SITE.supportEmail}`}
            className="inline-flex items-center gap-3 text-nl-text hover:text-nl-primary transition-all duration-200 group"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-nl-input bg-white border border-nl-border text-nl-primary group-hover:border-nl-primary/40 transition-all duration-200">
              <Mail className="w-5 h-5" />
            </span>
            <span className="text-lg font-medium break-all">{SITE.supportEmail}</span>
          </a>
        </div>

        <p className="text-sm text-nl-muted mt-6 leading-relaxed">
          通常、数日以内に返信いたします。お急ぎの場合も、内容をできるだけ詳しくお書きください。
        </p>
      </Card>
    </div>
  )
}

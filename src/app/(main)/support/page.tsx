import type { Metadata } from 'next'
import { Mail } from 'lucide-react'
import { SITE } from '@/data/site'

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
      <div className="bg-white rounded-2xl border border-cream-300 shadow-soft p-8 sm:p-10">
        <h1 className="text-2xl font-bold text-ink-800 mb-3">サポート</h1>
        <p className="text-ink-500 leading-relaxed mb-8">
          NeedLinkについてのご質問・不具合報告・ご要望などがありましたら、
          下記のメールアドレスまでお気軽にご連絡ください。
        </p>

        <div className="rounded-2xl bg-cream-50 border border-cream-200 p-6">
          <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">
            お問い合わせ先
          </p>
          <a
            href={`mailto:${SITE.supportEmail}`}
            className="inline-flex items-center gap-3 text-ink-800 hover:text-warm-600 transition-colors group"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-cream-300 text-warm-500 group-hover:border-warm-300 transition-colors">
              <Mail className="w-5 h-5" />
            </span>
            <span className="text-lg font-medium break-all">{SITE.supportEmail}</span>
          </a>
        </div>

        <p className="text-sm text-ink-400 mt-6 leading-relaxed">
          通常、数日以内に返信いたします。お急ぎの場合も、内容をできるだけ詳しくお書きください。
        </p>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/data/site'
import { Card } from '@/components/ui'

export const metadata: Metadata = {
  title: '利用規約',
  description: 'NeedLinkの利用規約。サービスのご利用条件について定めています。',
  alternates: {
    canonical: '/terms',
  },
}

const sections = [
  {
    title: '1. 適用',
    body: (
      <>
        <p>
          本利用規約（以下「本規約」）は、NeedLink（以下「本サービス」）の利用条件を定めるものです。
          ユーザーの皆さま（以下「ユーザー」）には、本規約に同意のうえ、本サービスをご利用いただきます。
        </p>
        <p>
          本サービスにアカウント登録し、または本サービスを利用した時点で、本規約に同意したものとみなします。
        </p>
      </>
    ),
  },
  {
    title: '2. アカウントについて',
    body: (
      <>
        <p>
          本サービスの一部機能を利用するには、メールアドレスまたはGoogleアカウント等による登録が必要です。
        </p>
        <ul>
          <li>登録情報は正確かつ最新の内容を維持してください。</li>
          <li>アカウントおよびパスワードの管理は、ユーザーご自身の責任で行ってください。</li>
          <li>第三者へのアカウント貸与・譲渡はできません。</li>
          <li>不正利用が疑われる場合、本サービスはアカウントの停止等の措置を取る場合があります。</li>
        </ul>
      </>
    ),
  },
  {
    title: '3. 投稿内容について',
    body: (
      <>
        <p>
          ユーザーは、自身が制作したサービスやサービスアイデア、プロフィール情報などを本サービス上に投稿できます。
          投稿内容については、投稿したユーザーが一切の責任を負うものとします。
        </p>
        <ul>
          <li>投稿にあたって必要な権利を有していること、または適法な許諾を得ていることを保証してください。</li>
          <li>虚偽の情報、誤解を招く表現、他者の権利を侵害する内容の投稿は禁止します。</li>
          <li>本サービスは、投稿内容の正確性・完全性・有用性を保証しません。</li>
        </ul>
      </>
    ),
  },
  {
    title: '4. 禁止事項',
    body: (
      <>
        <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
        <ul>
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>他のユーザーまたは第三者の権利（知的財産権、肖像権、プライバシー等）を侵害する行為</li>
          <li>虚偽の情報の登録・投稿</li>
          <li>不正アクセス、サーバーへの過度な負荷、システムの妨害</li>
          <li>本サービスの運営を妨げる行為</li>
          <li>他のユーザーへの嫌がらせ、誹謗中傷、迷惑行為</li>
          <li>反社会的勢力への利益供与その他これに準ずる行為</li>
          <li>その他、本サービスが不適切と判断する行為</li>
        </ul>
        <p>
          AIを利用して作成したコンテンツを投稿する場合であっても、投稿内容については投稿者自身が責任を負うものとします。
          他者の権利を侵害する内容や、虚偽・誤解を招く内容を投稿してはなりません。
        </p>
      </>
    ),
  },
  {
    title: '5. 知的財産権',
    body: (
      <>
        <p>
          本サービス上のコンテンツ（デザイン、ロゴ、テキスト、プログラム等）に関する知的財産権は、
          本サービスまたは正当な権利者に帰属します。
        </p>
        <p>
          ユーザーが投稿したサービス情報・画像・説明文等の著作権は、原則として当該ユーザーに帰属します。
          ただし、本サービスの提供・表示・広報・改善のために必要な範囲で、本サービスは投稿内容を利用できるものとします。
        </p>
      </>
    ),
  },
  {
    title: '6. サービス内容の変更・停止',
    body: (
      <>
        <p>
          本サービスは、事前の通知なく、サービス内容の変更、機能の追加・削除、提供の一時停止または終了を行うことがあります。
        </p>
        <p>
          これによりユーザーに生じた損害について、本サービスは法令上許容される範囲で責任を負いません。
        </p>
      </>
    ),
  },
  {
    title: '7. 免責事項',
    body: (
      <>
        <p>
          本サービスは、サービスやサービスアイデアの投稿・共有、サービスの検索、ならびに開発者・企業・ユーザー同士のつながりのきっかけを提供するプラットフォームです。
          掲載サービスの動作保証、収益保証、協業・採用・取引の成立、またはそれらの仲介を行うものではありません。
        </p>
        <ul>
          <li>ユーザー間またはユーザーと第三者との間で生じたトラブルについて、本サービスは責任を負いません。</li>
          <li>通信回線や外部サービスの障害など、本サービスの合理的な管理を超える事由による損害について責任を負いません。</li>
          <li>本サービスの利用により生じた損害について、本サービスに故意または重過失がある場合を除き、責任を負いません。</li>
        </ul>
      </>
    ),
  },
  {
    title: '8. 利用規約の変更',
    body: (
      <>
        <p>
          本サービスは、必要に応じて本規約を変更できます。変更後の規約は、本サービス上に掲載した時点から効力を生じます。
        </p>
        <p>
          変更後も本サービスを利用した場合、変更後の規約に同意したものとみなします。
          重要な変更がある場合は、可能な範囲で本サービス上での告知等を行います。
        </p>
      </>
    ),
  },
  {
    title: '9. お問い合わせ',
    body: (
      <>
        <p>本規約に関するお問い合わせは、下記までご連絡ください。</p>
        <p>
          サポートページ：{' '}
          <Link href="/support" className="text-nl-primary font-medium hover:underline">
            /support
          </Link>
          <br />
          メール：{' '}
          <a
            href={`mailto:${SITE.supportEmail}`}
            className="text-nl-primary font-medium hover:underline break-all"
          >
            {SITE.supportEmail}
          </a>
        </p>
      </>
    ),
  },
  {
    title: '10. 準拠法・裁判管轄',
    body: (
      <>
        <p>本規約の解釈および適用は、日本法に準拠するものとします。</p>
        <p>
          本サービスに関して紛争が生じた場合には、本サービス運営者の所在地を管轄する裁判所を、
          第一審の専属的合意管轄裁判所とします。
        </p>
        <p className="text-nl-muted text-[14px]">
          制定日：2026年7月31日
          <br />
          最終更新日：2026年7月31日
        </p>
      </>
    ),
  },
]

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <Card className="p-7 sm:p-10 md:p-12">
        <header className="mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-nl-text tracking-tight">
            利用規約
          </h1>
          <p className="mt-4 text-[15px] text-nl-muted leading-relaxed">
            NeedLink（{SITE.url.replace('https://', '')}）をご利用いただくための条件を定めています。
          </p>
        </header>

        <div className="space-y-10 sm:space-y-12">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-nl-text mb-4 pb-2 border-b border-nl-card-border">
                {section.title}
              </h2>
              <div className="space-y-3 text-[15px] text-nl-text/90 leading-[1.85] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_ul]:text-nl-muted [&_p]:text-nl-muted">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </Card>
    </div>
  )
}

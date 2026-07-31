import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE } from '@/data/site'
import { Card } from '@/components/ui'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description:
    'NeedLinkのプライバシーポリシー。取得する情報、利用目的、Cookie、セキュリティ等について説明します。',
  alternates: {
    canonical: '/privacy',
  },
}

const sections = [
  {
    title: '1. 取得する情報',
    body: (
      <>
        <p>
          NeedLink（以下「本サービス」）は、サービス提供のために以下の情報を取得することがあります。
        </p>
        <ul>
          <li>
            <span className="font-medium text-nl-text">Googleアカウント情報</span>
            <br />
            Googleログイン利用時に、認証に必要な識別子、表示名、メールアドレス、プロフィール画像等
          </li>
          <li>
            <span className="font-medium text-nl-text">メールアドレス</span>
            <br />
            メールでの会員登録・ログイン、重要なお知らせの送付のため
          </li>
          <li>
            <span className="font-medium text-nl-text">プロフィール情報</span>
            <br />
            ユーザーネーム、ユーザーID、自己紹介、技術タグ、外部リンク、アイコン画像等
          </li>
          <li>
            <span className="font-medium text-nl-text">投稿内容</span>
            <br />
            サービス名・説明・画像・タグ・カテゴリ・リンクなど、ユーザーが公開した情報
          </li>
          <li>
            <span className="font-medium text-nl-text">利用状況に関する情報</span>
            <br />
            アクセスログ、端末・ブラウザ情報、Cookie等を通じて取得する情報（該当する場合）
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '2. 利用目的',
    body: (
      <>
        <p>取得した情報は、以下の目的で利用します。</p>
        <ul>
          <li>
            <span className="font-medium text-nl-text">サービス提供</span>
            — アカウント管理、プロフィール・投稿の表示、お気に入り・フォロー等の機能提供
          </li>
          <li>
            <span className="font-medium text-nl-text">本人確認</span>
            — ログイン認証、不正利用の防止
          </li>
          <li>
            <span className="font-medium text-nl-text">お問い合わせ対応</span>
            — サポートへの返信、必要なご連絡
          </li>
          <li>
            <span className="font-medium text-nl-text">サービス改善</span>
            — 不具合の調査、利用状況の把握、機能改善・新機能の検討
          </li>
        </ul>
      </>
    ),
  },
  {
    title: '3. 第三者提供について',
    body: (
      <>
        <p>
          本サービスは、次の場合を除き、取得した個人情報を第三者に提供しません。
        </p>
        <ul>
          <li>ユーザーの同意がある場合</li>
          <li>法令に基づく場合</li>
          <li>
            サービス運営に必要な範囲で、業務委託先（ホスティング、認証・データベース、アクセス解析等）に預託する場合。
            この場合、委託先には適切な管理を求めます
          </li>
          <li>事業譲渡等に伴い情報が承継される場合</li>
        </ul>
        <p>
          本サービスの提供にあたり、現在は次のような外部サービスを利用しています。
          今後、運営上必要な範囲で外部サービスが追加・変更される場合があります。
        </p>
        <ul>
          <li>認証およびデータベース等：Supabase</li>
          <li>ホスティング：Vercel</li>
        </ul>
        <p>
          公開プロフィールおよび公開投稿は、仕様上、他のユーザーや訪問者に表示されます。
        </p>
      </>
    ),
  },
  {
    title: '4. Cookie等の利用',
    body: (
      <>
        <p>
          本サービスは、ログイン状態の維持、セキュリティ、利用状況の把握、サービス改善のため、
          Cookieおよび類似技術を利用する場合があります。
        </p>
        <p>
          アクセス解析（例：Google Analytics）を利用する場合、匿名化された利用データが収集されることがあります。
          ブラウザ設定によりCookieを無効にできますが、一部機能が利用できなくなる場合があります。
        </p>
      </>
    ),
  },
  {
    title: '5. セキュリティについて',
    body: (
      <>
        <p>
          本サービスは、取得した情報の漏えい・滅失・改ざん等を防止するため、合理的な安全管理措置を講じます。
          ただし、インターネット上の通信や外部サービスの性質上、完全な安全性を保証するものではありません。
        </p>
      </>
    ),
  },
  {
    title: '6. ユーザーの権利',
    body: (
      <>
        <p>
          ユーザーは、自身の登録情報・プロフィール情報について、サービス上で確認・更新できます。
          保有個人データの開示・訂正・削除等をご希望の場合は、お問い合わせ窓口までご連絡ください。
          本人確認のうえ、合理的な範囲で対応します。
        </p>
        <p>
          アカウント削除後も、法令上の義務の履行、紛争対応、不正利用の防止等のため、一定期間データを保持する場合があります。
          保持が不要となったデータは、合理的な期間内に削除または匿名化します。
        </p>
        <p>
          法令により対応できない場合や、他のユーザーの権利保護等のため対応を制限する場合があります。
        </p>
      </>
    ),
  },
  {
    title: '7. お問い合わせ',
    body: (
      <>
        <p>本ポリシーに関するお問い合わせは、下記までご連絡ください。</p>
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
        <p className="text-nl-muted text-[14px]">
          制定日：2026年7月31日
          <br />
          最終更新日：2026年7月31日
        </p>
      </>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <Card className="p-7 sm:p-10 md:p-12">
        <header className="mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-nl-text tracking-tight">
            プライバシーポリシー
          </h1>
          <p className="mt-4 text-[15px] text-nl-muted leading-relaxed">
            NeedLinkにおける個人情報の取り扱いについて説明します。
          </p>
        </header>

        <div className="space-y-10 sm:space-y-12">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-semibold text-nl-text mb-4 pb-2 border-b border-nl-card-border">
                {section.title}
              </h2>
              <div className="space-y-3 text-[15px] text-nl-text/90 leading-[1.85] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-3 [&_ul]:text-nl-muted [&_p]:text-nl-muted">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </Card>
    </div>
  )
}

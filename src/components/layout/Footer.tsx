import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-nl-card-border bg-nl-bg mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-lg font-bold text-nl-text mb-2">NeedLink</div>
            <p className="text-sm text-nl-muted leading-relaxed">
              作ったものが、人と仕事と<br />次のサービスをつなぐ。
            </p>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs font-semibold text-nl-muted uppercase tracking-wider mb-3">
                サービス
              </div>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-nl-muted hover:text-nl-text transition-all duration-200">
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="text-sm text-nl-muted hover:text-nl-text transition-all duration-200">
                    探す
                  </Link>
                </li>
                <li>
                  <Link href="/services/new" className="text-sm text-nl-muted hover:text-nl-text transition-all duration-200">
                    投稿する
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-nl-muted uppercase tracking-wider mb-3">
                アカウント
              </div>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth" className="text-sm text-nl-muted hover:text-nl-text transition-all duration-200">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/auth?tab=signup" className="text-sm text-nl-muted hover:text-nl-text transition-all duration-200">
                    新規登録
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-nl-muted uppercase tracking-wider mb-3">
                ヘルプ
              </div>
              <ul className="space-y-2">
                <li>
                  <Link href="/support" className="text-sm text-nl-muted hover:text-nl-text transition-all duration-200">
                    サポート
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-nl-muted hover:text-nl-text transition-all duration-200">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-sm text-nl-muted hover:text-nl-text transition-all duration-200">
                    プライバシーポリシー
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-nl-card-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-nl-muted">© 2026 NeedLink. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              href="/terms"
              className="text-xs text-nl-muted hover:text-nl-primary transition-all duration-200"
            >
              利用規約
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-nl-muted hover:text-nl-primary transition-all duration-200"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/support"
              className="text-xs text-nl-muted hover:text-nl-primary transition-all duration-200"
            >
              サポート
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-cream-200 bg-cream-50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="text-lg font-bold text-ink-800 mb-2">NeedLink</div>
            <p className="text-sm text-ink-500 leading-relaxed">
              作ったものが、人と仕事と<br />次のサービスをつなぐ。
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">
                サービス
              </div>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-sm text-ink-600 hover:text-ink-800 transition-colors">
                    ホーム
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="text-sm text-ink-600 hover:text-ink-800 transition-colors">
                    探す
                  </Link>
                </li>
                <li>
                  <Link href="/services/new" className="text-sm text-ink-600 hover:text-ink-800 transition-colors">
                    投稿する
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">
                アカウント
              </div>
              <ul className="space-y-2">
                <li>
                  <Link href="/auth" className="text-sm text-ink-600 hover:text-ink-800 transition-colors">
                    ログイン
                  </Link>
                </li>
                <li>
                  <Link href="/auth?tab=signup" className="text-sm text-ink-600 hover:text-ink-800 transition-colors">
                    新規登録
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">
                ヘルプ
              </div>
              <ul className="space-y-2">
                <li>
                  <Link href="/support" className="text-sm text-ink-600 hover:text-ink-800 transition-colors">
                    サポート
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cream-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-400">© 2026 NeedLink. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link
              href="/support"
              className="text-xs text-ink-500 hover:text-warm-600 transition-colors"
            >
              サポート
            </Link>
            <p className="text-xs text-ink-400">個人開発者のためのショーケース</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

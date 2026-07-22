import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl font-bold text-cream-300 mb-4">404</div>
      <h1 className="text-2xl font-bold text-ink-800 mb-2">
        ページが見つかりません
      </h1>
      <p className="text-ink-500 mb-8">
        お探しのページは存在しないか、移動された可能性があります。
      </p>
      <Link href="/">
        <Button>ホームに戻る</Button>
      </Link>
    </div>
  )
}

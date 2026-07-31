import { Button } from '@/components/ui'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl font-bold text-nl-card-border mb-4">404</div>
      <h1 className="text-2xl font-bold text-nl-text mb-2">
        ページが見つかりません
      </h1>
      <p className="text-nl-muted mb-8">
        お探しのページは存在しないか、移動された可能性があります。
      </p>
      <Button href="/">ホームに戻る</Button>
    </div>
  )
}

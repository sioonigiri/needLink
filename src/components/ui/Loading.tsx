import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'

interface LoadingProps {
  label?: string
  fullScreen?: boolean
  className?: string
}

export function Loading({
  label = '読み込み中…',
  fullScreen = false,
  className,
}: LoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 text-nl-muted',
        fullScreen ? 'min-h-screen' : 'py-20',
        className
      )}
    >
      <Spinner size="lg" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}

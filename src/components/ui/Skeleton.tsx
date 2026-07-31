import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
}

export function Skeleton({
  className,
  variant = 'rectangular',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-nl-beige',
        variant === 'text' && 'h-4 w-full rounded-md',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-nl-input',
        variant === 'card' && 'rounded-nl-card h-48 w-full',
        className
      )}
      {...props}
    />
  )
}

/** サービスカード用スケルトン */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-nl-card rounded-nl-card border border-nl-card-border shadow-nl-card overflow-hidden',
        className
      )}
    >
      <Skeleton variant="rectangular" className="aspect-[16/9] rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" className="w-2/3 h-5" />
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-4/5" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton variant="circular" className="w-6 h-6" />
          <Skeleton variant="text" className="w-24 h-3" />
        </div>
      </div>
    </div>
  )
}

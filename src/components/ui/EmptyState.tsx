import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'text-center py-16 sm:py-20 px-6 bg-nl-card rounded-nl-card border border-nl-card-border shadow-nl-card',
        className
      )}
    >
      {icon && (
        <div className="mx-auto mb-4 flex items-center justify-center text-nl-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-nl-text mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-nl-muted max-w-md mx-auto mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Button href={actionHref} size="md">
            {actionLabel}
          </Button>
        ) : (
          <Button type="button" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </div>
  )
}

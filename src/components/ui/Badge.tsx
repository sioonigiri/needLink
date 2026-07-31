import * as React from 'react'
import { cn } from '@/lib/utils'

/** 拡張しやすいバリアント定義 */
export const BADGE_VARIANTS = {
  default: 'bg-nl-beige text-nl-text',
  category: 'bg-nl-beige text-nl-text',
  popular: 'bg-orange-100 text-nl-primary',
  new: 'bg-emerald-50 text-emerald-700',
  developing: 'bg-sky-50 text-sky-700',
  beta: 'bg-amber-50 text-amber-700',
  published: 'bg-green-50 text-green-700',
  paused: 'bg-gray-100 text-gray-600',
  // legacy aliases
  warm: 'bg-orange-50 text-nl-primary',
  blue: 'bg-sky-50 text-sky-700',
  green: 'bg-green-50 text-green-700',
  amber: 'bg-amber-50 text-amber-700',
  gray: 'bg-gray-100 text-gray-600',
} as const

export type BadgeVariant = keyof typeof BADGE_VARIANTS

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-all duration-200',
        BADGE_VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

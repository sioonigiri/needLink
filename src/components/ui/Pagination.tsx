'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = pages.filter((p) => {
    if (totalPages <= 7) return true
    if (p === 1 || p === totalPages) return true
    return Math.abs(p - page) <= 1
  })

  const items: (number | 'ellipsis')[] = []
  visible.forEach((p, i) => {
    if (i > 0 && p - visible[i - 1] > 1) items.push('ellipsis')
    items.push(p)
  })

  return (
    <nav
      className={cn('flex items-center justify-center gap-1.5', className)}
      aria-label="ページネーション"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className={cn(
          'inline-flex items-center justify-center w-9 h-9 rounded-full border border-nl-border bg-white text-nl-muted',
          'transition-all duration-200 hover:bg-nl-beige hover:text-nl-text',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white'
        )}
        aria-label="前のページ"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {items.map((item, i) =>
        item === 'ellipsis' ? (
          <span key={`e-${i}`} className="w-9 text-center text-nl-muted text-sm">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              'inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium',
              'transition-all duration-200',
              item === page
                ? 'bg-nl-primary text-white shadow-sm'
                : 'bg-white border border-nl-border text-nl-muted hover:bg-nl-beige hover:text-nl-text'
            )}
          >
            {item}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className={cn(
          'inline-flex items-center justify-center w-9 h-9 rounded-full border border-nl-border bg-white text-nl-muted',
          'transition-all duration-200 hover:bg-nl-beige hover:text-nl-text',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white'
        )}
        aria-label="次のページ"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  )
}

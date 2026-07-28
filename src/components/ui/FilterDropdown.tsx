'use client'

import { useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FilterDropdownProps {
  label: string
  count?: number
  open: boolean
  onToggle: () => void
  onClose: () => void
  children: React.ReactNode
  dropdownClassName?: string
}

export function FilterDropdown({
  label,
  count,
  open,
  onToggle,
  onClose,
  children,
  dropdownClassName,
}: FilterDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
          open || (count && count > 0)
            ? 'bg-warm-50 border border-warm-400 text-warm-700'
            : 'bg-white border border-cream-300 text-ink-600 hover:border-warm-400 hover:text-warm-600'
        )}
      >
        {label}
        {count != null && count > 0 && (
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-warm-500 text-white text-[10px] font-bold leading-none">
            {count}
          </span>
        )}
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full left-0 mt-2 bg-white rounded-2xl border border-cream-300 shadow-lg z-50 overflow-hidden',
            dropdownClassName ?? 'w-72'
          )}
        >
          {children}
        </div>
      )}
    </div>
  )
}

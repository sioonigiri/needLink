'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterSelectOption {
  value: string
  label: string
}

interface FilterSelectProps {
  label: string
  value: string
  options: FilterSelectOption[]
  onChange: (value: string) => void
  /** デフォルト値。これ以外が選ばれているときハイライトする */
  defaultValue?: string
  dropdownClassName?: string
}

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  defaultValue = '',
  dropdownClassName,
}: FilterSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value) ?? options[0]
  const isActive = value !== defaultValue

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors',
          open || isActive
            ? 'bg-warm-50 border border-warm-400 text-warm-700'
            : 'bg-white border border-cream-300 text-ink-600 hover:border-warm-400 hover:text-warm-600'
        )}
      >
        <span className="text-ink-400 font-normal">{label}</span>
        <span>{selected?.label}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full left-0 mt-2 min-w-full bg-white rounded-2xl border border-cream-300 shadow-lg z-50 overflow-hidden py-1',
            dropdownClassName ?? 'w-44'
          )}
        >
          {options.map((opt) => {
            const active = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition-colors text-left',
                  active
                    ? 'bg-warm-50 text-warm-700 font-medium'
                    : 'text-ink-700 hover:bg-cream-50'
                )}
              >
                {opt.label}
                {active && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

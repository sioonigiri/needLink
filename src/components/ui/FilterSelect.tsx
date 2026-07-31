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
          'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
          open || isActive
            ? 'bg-nl-primary/10 border border-nl-primary text-nl-primary'
            : 'bg-white border border-nl-border text-nl-muted hover:border-nl-primary hover:text-nl-primary'
        )}
      >
        <span className="text-nl-muted font-normal">{label}</span>
        <span>{selected?.label}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full left-0 mt-2 min-w-full bg-nl-card rounded-nl-card border border-nl-card-border shadow-nl-card z-50 overflow-hidden py-1',
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
                  'w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition-all duration-200 text-left',
                  active
                    ? 'bg-nl-primary/10 text-nl-primary font-medium'
                    : 'text-nl-text hover:bg-nl-beige'
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

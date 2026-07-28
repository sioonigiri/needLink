'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormAccordionProps {
  label: string
  count?: number
  open: boolean
  onToggle: () => void
  /** アコーディオンの開閉に関わらず常に表示するエリア（選択済みチップなど） */
  chips?: React.ReactNode
  children: React.ReactNode
}

export function FormAccordion({
  label,
  count,
  open,
  onToggle,
  chips,
  children,
}: FormAccordionProps) {
  return (
    <div className="flex flex-col gap-2">
      {/* トリガーボタン */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors w-fit',
          open || (count != null && count > 0)
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

      {/* 常時表示エリア（選択済みチップ） */}
      {chips}

      {/* 展開エリア */}
      {open && (
        <div className="bg-cream-50 rounded-2xl border border-cream-200 p-4">
          {children}
        </div>
      )}
    </div>
  )
}

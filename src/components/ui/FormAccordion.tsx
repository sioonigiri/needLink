'use client'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Input / Select と揃えたトリガー用クラス */
export const formSelectTriggerClass = cn(
  'flex w-full h-[52px] items-center justify-between gap-2',
  'px-4 rounded-[14px] border bg-white',
  'text-[15px] font-medium text-left transition-all duration-200',
  'focus:outline-none focus-visible:border-nl-primary focus-visible:shadow-nl-focus'
)

interface FormAccordionProps {
  label: string
  count?: number
  open: boolean
  onToggle: () => void
  /** アコーディオンの開閉に関わらず常に表示するエリア（選択済みチップなど） */
  chips?: React.ReactNode
  children?: React.ReactNode
  className?: string
  /**
   * true のときトリガーボタンのみ描画（パネル・チップは親側で描画）
   * 横並びレイアウト用
   */
  triggerOnly?: boolean
}

export function FormAccordion({
  label,
  count,
  open,
  onToggle,
  chips,
  children,
  className,
  triggerOnly = false,
}: FormAccordionProps) {
  const active = open || (count != null && count > 0)

  const trigger = (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        formSelectTriggerClass,
        active
          ? 'bg-nl-primary/10 border-nl-primary text-nl-primary'
          : 'border-nl-border text-nl-text hover:border-nl-primary hover:text-nl-primary'
      )}
    >
      <span className="flex items-center gap-2 min-w-0">
        <span className="truncate">{label}</span>
        {count != null && count > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-nl-primary text-white text-[11px] font-bold leading-none shrink-0">
            {count}
          </span>
        )}
      </span>
      <ChevronDown
        className={cn(
          'w-4 h-4 shrink-0 text-current transition-transform duration-200',
          open && 'rotate-180'
        )}
      />
    </button>
  )

  if (triggerOnly) {
    return <div className={className}>{trigger}</div>
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {trigger}
      {chips}
      {open && children != null && (
        <div className="bg-nl-beige rounded-nl-card border border-nl-card-border p-4">
          {children}
        </div>
      )}
    </div>
  )
}

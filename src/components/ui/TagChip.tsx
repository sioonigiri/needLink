import * as React from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/** タグ表示のみ（非インタラクティブ） */
interface TagChipDisplayProps {
  variant: 'display'
  label: string
  className?: string
}

/** クリックでタグ検索へ遷移 */
interface TagChipClickableProps {
  variant: 'clickable'
  label: string
  currentTags?: string[]
  className?: string
}

/** × ボタン付き（TagInput 内部で使用） */
interface TagChipRemovableProps {
  variant: 'removable'
  label: string
  onRemove: () => void
  className?: string
}

/** 検索フィルタ用（× で絞り込みを外す） */
interface TagChipFilterProps {
  variant: 'filter'
  label: string
  onRemove: () => void
  className?: string
}

type TagChipProps =
  | TagChipDisplayProps
  | TagChipClickableProps
  | TagChipRemovableProps
  | TagChipFilterProps

const baseChip = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors'

export function TagChip(props: TagChipProps) {
  if (props.variant === 'display') {
    return (
      <span className={cn(baseChip, 'bg-cream-200 text-ink-600', props.className)}>
        {props.label}
      </span>
    )
  }

  if (props.variant === 'clickable') {
    const existing = props.currentTags ?? []
    const next = existing.includes(props.label)
      ? existing
      : [...existing, props.label]
    const href = `/search?tags=${next.join(',')}`
    return (
      <Link
        href={href}
        className={cn(
          baseChip,
          'bg-cream-200 text-ink-600 hover:bg-warm-100 hover:text-warm-700 cursor-pointer',
          props.className
        )}
      >
        {props.label}
      </Link>
    )
  }

  if (props.variant === 'removable') {
    return (
      <span className={cn(baseChip, 'bg-cream-200 text-ink-700 pr-1.5', props.className)}>
        {props.label}
        <button
          type="button"
          onClick={props.onRemove}
          className="ml-0.5 rounded-full p-0.5 hover:bg-cream-400 transition-colors"
          aria-label={`${props.label} を削除`}
        >
          <X className="w-3 h-3" />
        </button>
      </span>
    )
  }

  // filter variant
  return (
    <span className={cn(baseChip, 'bg-warm-100 text-warm-700 border border-warm-200 pr-1.5', props.className)}>
      {props.label}
      <button
        type="button"
        onClick={props.onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-warm-200 transition-colors"
        aria-label={`${props.label} フィルタを解除`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}

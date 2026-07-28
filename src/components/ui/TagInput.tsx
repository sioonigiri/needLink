'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { TagChip } from '@/components/ui/TagChip'
import { Plus } from 'lucide-react'

interface TagInputProps {
  label?: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  error?: string
  hint?: string
  maxTags?: number
}

export function TagInput({
  label,
  value,
  onChange,
  placeholder = 'タグを入力',
  error,
  hint,
  maxTags = 10,
}: TagInputProps) {
  const [input, setInput] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  function normalize(raw: string): string {
    return raw.trim()
  }

  function isDuplicate(tag: string): boolean {
    return value.some((t) => t.toLowerCase() === tag.toLowerCase())
  }

  function addTag(raw: string) {
    const tag = normalize(raw)
    if (!tag || isDuplicate(tag) || value.length >= maxTags) return
    onChange([...value, tag])
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink-700">{label}</label>
      )}

      {/* 追加済みタグ一覧 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1">
          {value.map((tag) => (
            <TagChip
              key={tag}
              variant="removable"
              label={tag}
              onRemove={() => onChange(value.filter((t) => t !== tag))}
            />
          ))}
        </div>
      )}

      {/* 入力エリア */}
      {value.length < maxTags && (
        <div
          className={cn(
            'flex items-center gap-2 w-full px-3 py-2 rounded-xl border bg-white',
            'transition-all duration-200',
            'border-cream-400 focus-within:border-warm-400 focus-within:ring-2 focus-within:ring-warm-400/20',
            error && 'border-red-400 focus-within:border-red-400'
          )}
          onClick={() => inputRef.current?.focus()}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 outline-none text-sm text-ink-800 placeholder:text-ink-300 bg-transparent"
          />
          <button
            type="button"
            onClick={() => addTag(input)}
            disabled={!input.trim()}
            className="flex items-center gap-1 text-xs text-warm-600 hover:text-warm-700 disabled:text-ink-300 disabled:cursor-not-allowed font-medium transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            追加
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
    </div>
  )
}

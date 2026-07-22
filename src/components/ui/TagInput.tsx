'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

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
  placeholder = 'タグを入力してEnter',
  error,
  hint,
  maxTags = 10,
}: TagInputProps) {
  const [input, setInput] = React.useState('')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const tag = input.trim().replace(/,/g, '')
      if (tag && !value.includes(tag) && value.length < maxTags) {
        onChange([...value, tag])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink-700">{label}</label>
      )}
      <div
        className={cn(
          'flex flex-wrap gap-2 w-full px-3 py-2.5 rounded-xl border bg-white',
          'transition-all duration-200',
          'border-cream-400 focus-within:border-warm-400 focus-within:ring-2 focus-within:ring-warm-400/20',
          error && 'border-red-400 focus-within:border-red-400'
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-cream-200 text-ink-700 text-xs rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-ink-900 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {value.length < maxTags && (
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] outline-none text-sm text-ink-800 placeholder:text-ink-300 bg-transparent"
          />
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
    </div>
  )
}

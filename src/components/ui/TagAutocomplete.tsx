'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { TagChip } from '@/components/ui/TagChip'
import { filterTagCategories } from '@/data/tags'
import { Search } from 'lucide-react'

interface TagAutocompleteProps {
  label?: string
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  error?: string
  hint?: string
  maxTags?: number
  hideChips?: boolean
}

export function TagAutocomplete({
  label,
  value,
  onChange,
  placeholder = 'タグを検索して追加',
  error,
  hint,
  maxTags = 10,
  hideChips = false,
}: TagAutocompleteProps) {
  const [input, setInput] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const filteredCategories = React.useMemo(
    () => filterTagCategories(input, value),
    [input, value],
  )

  // フラット化した候補リスト（キーボードナビ用）
  const flatOptions = React.useMemo(
    () => filteredCategories.flatMap((c) => c.tags),
    [filteredCategories],
  )

  function addTag(tag: string) {
    if (value.includes(tag) || value.length >= maxTags) return
    onChange([...value, tag])
    setInput('')
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag))
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value)
    setOpen(true)
    setActiveIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && e.key !== 'Escape') {
      setOpen(true)
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((i) => (i + 1) % flatOptions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((i) => (i <= 0 ? flatOptions.length - 1 : i - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0 && flatOptions[activeIndex]) {
          addTag(flatOptions[activeIndex])
        }
        break
      case 'Escape':
        setOpen(false)
        setActiveIndex(-1)
        break
      case 'Backspace':
        if (!input && value.length > 0) {
          onChange(value.slice(0, -1))
        }
        break
    }
  }

  // activeIndex が変わったらリスト内のアイテムを表示範囲内にスクロール
  React.useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const item = listRef.current.querySelector(
      `[data-index="${activeIndex}"]`,
    ) as HTMLElement | null
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // コンテナ外クリックで閉じる
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasOptions = filteredCategories.length > 0
  const showDropdown = open && (hasOptions || input.length > 0)
  const isAtMax = value.length >= maxTags

  // 各カテゴリの先頭タグがフラット配列の何番目か
  function getCategoryOffset(catIndex: number) {
    return filteredCategories
      .slice(0, catIndex)
      .reduce((acc, c) => acc + c.tags.length, 0)
  }

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && (
        <label className="text-sm font-medium text-nl-text">{label}</label>
      )}

      {/* 追加済みタグ */}
      {!hideChips && value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <TagChip
              key={tag}
              variant="removable"
              label={tag}
              onRemove={() => removeTag(tag)}
            />
          ))}
        </div>
      )}

      {/* 入力フィールド */}
      {!isAtMax && (
        <div className="relative">
          <div
            className={cn(
              'flex items-center gap-2 w-full px-3 py-2.5 rounded-nl-input border bg-white',
              'transition-all duration-200',
              open
                ? 'border-nl-primary shadow-nl-focus'
                : 'border-nl-border',
              error && 'border-red-400 focus-within:border-red-400',
            )}
            onClick={() => {
              inputRef.current?.focus()
              setOpen(true)
            }}
          >
            <Search className="w-4 h-4 text-nl-muted/60 shrink-0" />
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setOpen(true)}
              placeholder={placeholder}
              autoComplete="off"
              className="flex-1 outline-none text-sm text-nl-text placeholder:text-nl-muted/60 bg-transparent"
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-autocomplete="list"
            />
            {input && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => {
                  setInput('')
                  setActiveIndex(-1)
                  inputRef.current?.focus()
                }}
                className="text-nl-muted/60 hover:text-nl-muted transition-colors"
                aria-label="入力をクリア"
              >
                ✕
              </button>
            )}
          </div>

          {/* ドロップダウン */}
          {showDropdown && (
            <div
              className={cn(
                'absolute z-50 mt-1.5 w-full bg-white rounded-nl-card border border-nl-card-border',
                'shadow-lg shadow-nl-card max-h-72 overflow-y-auto',
              )}
            >
              {hasOptions ? (
                <ul ref={listRef} role="listbox" className="py-2">
                  {filteredCategories.map((cat, catIdx) => {
                    const offset = getCategoryOffset(catIdx)
                    return (
                      <li key={cat.id}>
                        <div className="px-3.5 pt-3 pb-1 text-[10px] font-semibold text-nl-muted uppercase tracking-wider">
                          {cat.label}
                        </div>
                        <ul>
                          {cat.tags.map((tag, tagIdx) => {
                            const flatIdx = offset + tagIdx
                            const isActive = flatIdx === activeIndex
                            return (
                              <li key={tag} data-index={flatIdx} role="option" aria-selected={isActive}>
                                <button
                                  type="button"
                                  className={cn(
                                    'w-full text-left px-3.5 py-2 text-sm transition-colors',
                                    isActive
                                      ? 'bg-nl-primary/10 text-nl-primary'
                                      : 'text-nl-text hover:bg-nl-beige',
                                  )}
                                  onMouseEnter={() => setActiveIndex(flatIdx)}
                                  onMouseDown={(e) => {
                                    e.preventDefault()
                                    addTag(tag)
                                  }}
                                >
                                  {tag}
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-nl-muted">
                  「{input}」に一致するタグが見つかりません
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isAtMax && (
        <p className="text-xs text-nl-muted">
          タグの上限（{maxTags}個）に達しました
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-nl-muted">{hint}</p>}
    </div>
  )
}

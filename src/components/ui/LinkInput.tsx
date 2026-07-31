'use client'

import * as React from 'react'
import { Plus, X, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LINK_SERVICES, getLinkService } from '@/data/links'
import type { ProfileLink } from '@/types'

interface LinkInputProps {
  label?: string
  value: ProfileLink[]
  onChange: (links: ProfileLink[]) => void
  error?: string
  hint?: string
}

export function LinkInput({ label, value, onChange, error, hint }: LinkInputProps) {
  const [showPicker, setShowPicker] = React.useState(false)
  const [pickerQuery, setPickerQuery] = React.useState('')
  const pickerRef = React.useRef<HTMLDivElement>(null)
  const pickerInputRef = React.useRef<HTMLInputElement>(null)
  const [pickerActive, setPickerActive] = React.useState(-1)

  // 未追加のサービス候補（クエリでフィルタリング）
  const addedTypes = value.map((l) => l.type)
  const availableServices = LINK_SERVICES.filter(
    (s) =>
      !addedTypes.includes(s.id) &&
      (pickerQuery === '' ||
        s.label.toLowerCase().includes(pickerQuery.toLowerCase())),
  )

  function addLink(type: string) {
    if (addedTypes.includes(type)) return
    onChange([...value, { type, url: '' }])
    setShowPicker(false)
    setPickerQuery('')
    setPickerActive(-1)
  }

  function removeLink(type: string) {
    onChange(value.filter((l) => l.type !== type))
  }

  function updateUrl(type: string, url: string) {
    onChange(value.map((l) => (l.type === type ? { ...l, url } : l)))
  }

  function handlePickerKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setPickerActive((i) => (i + 1) % availableServices.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setPickerActive((i) => (i <= 0 ? availableServices.length - 1 : i - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (pickerActive >= 0 && availableServices[pickerActive]) {
          addLink(availableServices[pickerActive].id)
        }
        break
      case 'Escape':
        setShowPicker(false)
        setPickerQuery('')
        break
    }
  }

  // pickerが開いたらinputにフォーカス
  React.useEffect(() => {
    if (showPicker) {
      pickerInputRef.current?.focus()
    }
  }, [showPicker])

  // 外側クリックで閉じる
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
        setPickerQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-nl-text">{label}</label>
      )}

      {/* 追加済みリンク一覧 */}
      {value.length > 0 && (
        <div className="flex flex-col gap-2">
          {value.map((link) => {
            const service = getLinkService(link.type)
            if (!service) return null
            return (
              <div
                key={link.type}
                className="flex items-center gap-2.5 bg-white border border-nl-border rounded-nl-input px-3 py-2.5"
              >
                <span className="text-base shrink-0 w-6 text-center select-none">
                  {service.emoji}
                </span>
                <span className="text-sm font-medium text-nl-text shrink-0 w-24">
                  {service.label}
                </span>
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateUrl(link.type, e.target.value)}
                  placeholder={service.placeholder}
                  className="flex-1 min-w-0 text-sm text-nl-text placeholder:text-nl-muted/60 bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeLink(link.type)}
                  className="shrink-0 p-1 rounded-full text-nl-muted/60 hover:text-nl-muted hover:bg-nl-beige transition-colors"
                  aria-label={`${service.label} を削除`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* リンクを追加ボタン + ピッカー */}
      <div className="relative" ref={pickerRef}>
        <button
          type="button"
          onClick={() => setShowPicker((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-nl-input border text-sm font-medium transition-all duration-200',
            showPicker
              ? 'border-nl-primary text-nl-primary bg-nl-primary/10 shadow-nl-focus'
              : 'border-nl-border text-nl-muted bg-white hover:border-nl-primary/40 hover:text-nl-primary hover:bg-nl-primary/10',
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          リンクを追加
        </button>

        {showPicker && (
          <div
            className={cn(
              'absolute z-50 mt-1.5 w-64 bg-white rounded-nl-card border border-nl-card-border',
              'shadow-lg shadow-nl-card',
            )}
          >
            {/* ピッカー内検索 */}
            <div className="px-3 pt-3 pb-2 border-b border-nl-card-border">
              <div className="flex items-center gap-2 bg-nl-beige rounded-lg px-2.5 py-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-nl-muted shrink-0" />
                <input
                  ref={pickerInputRef}
                  type="text"
                  value={pickerQuery}
                  onChange={(e) => {
                    setPickerQuery(e.target.value)
                    setPickerActive(-1)
                  }}
                  onKeyDown={handlePickerKeyDown}
                  placeholder="サービスを検索"
                  className="flex-1 text-xs text-nl-text placeholder:text-nl-muted bg-transparent outline-none"
                />
              </div>
            </div>

            {/* サービス一覧 */}
            {availableServices.length > 0 ? (
              <ul className="py-1.5 max-h-52 overflow-y-auto">
                {availableServices.map((service, idx) => (
                  <li key={service.id}>
                    <button
                      type="button"
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors',
                        idx === pickerActive
                          ? 'bg-nl-primary/10 text-nl-primary'
                          : 'text-nl-text hover:bg-nl-beige',
                      )}
                      onMouseEnter={() => setPickerActive(idx)}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        addLink(service.id)
                      }}
                    >
                      <span className="w-5 text-center shrink-0 text-base">
                        {service.emoji}
                      </span>
                      {service.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 text-center text-sm text-nl-muted">
                {pickerQuery
                  ? `「${pickerQuery}」に一致するサービスがありません`
                  : '追加できるサービスがありません'}
              </div>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-nl-muted">{hint}</p>}
    </div>
  )
}

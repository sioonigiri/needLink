'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { TagChip } from '@/components/ui/TagChip'
import { FilterDropdown } from '@/components/ui/FilterDropdown'
import { FilterSelect } from '@/components/ui/FilterSelect'
import { filterTagCategories } from '@/data/tags'
import { SERVICE_CATEGORIES } from '@/data/categories'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: '', label: 'すべて' },
  { value: 'developing', label: '開発中' },
  { value: 'beta', label: 'ベータ' },
  { value: 'published', label: '公開中' },
  { value: 'paused', label: '休止中' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: '新着順' },
  { value: 'favorites', label: 'お気に入り数順' },
]

interface SearchFiltersProps {
  query: string
  tags: string[]
  status: string
  categories: string[]
  sort: string
  resultCount: number
}

export function SearchFilters({
  query,
  tags,
  status,
  categories,
  sort,
  resultCount,
}: SearchFiltersProps) {
  const router = useRouter()
  const [tagInput, setTagInput] = useState('')
  const [tagOpen, setTagOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)

  const buildHref = useCallback(
    (overrides: {
      q?: string
      tags?: string[]
      status?: string
      categories?: string[]
      sort?: string
    }) => {
      const params = new URLSearchParams()
      const q = overrides.q ?? query
      const t = overrides.tags ?? tags
      const s = overrides.status ?? status
      const c = overrides.categories ?? categories
      const so = overrides.sort ?? sort
      if (q) params.set('q', q)
      if (t.length) params.set('tags', t.join(','))
      if (s) params.set('status', s)
      if (c.length) params.set('categories', c.join(','))
      if (so && so !== 'newest') params.set('sort', so)
      return `/search${params.toString() ? `?${params.toString()}` : ''}`
    },
    [query, tags, status, categories, sort]
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const q = fd.get('q') as string
    router.push(buildHref({ q }))
  }

  const hasFilters = query || tags.length > 0 || status || categories.length > 0 || sort !== 'newest'

  return (
    <div className="mb-8 space-y-4">
      <h1 className="text-2xl font-bold text-nl-text">サービスを探す</h1>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-nl-muted" />
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="サービス名、説明で検索..."
            className="w-full h-12 pl-10 pr-4 rounded-nl-input border border-nl-border focus:border-nl-primary focus:shadow-nl-focus outline-none bg-white text-nl-text placeholder:text-nl-muted/60 text-sm transition-all duration-200"
          />
        </div>
        <Button type="submit" size="md" className="shrink-0 h-12 rounded-nl-input">
          検索
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="カテゴリで絞り込む"
          count={categories.length}
          open={catOpen}
          onToggle={() => setCatOpen((v) => !v)}
          onClose={() => setCatOpen(false)}
          dropdownClassName="w-80"
        >
          <div className="p-3">
            <div className="flex flex-wrap gap-2">
              {SERVICE_CATEGORIES.map((cat) => {
                const active = categories.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    onClick={() =>
                      router.push(buildHref({
                        categories: active
                          ? categories.filter((c) => c !== cat.id)
                          : [...categories, cat.id],
                      }))
                    }
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-nl-primary text-white'
                        : 'bg-nl-beige text-nl-muted hover:bg-nl-primary/10 hover:text-nl-primary'
                    )}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </FilterDropdown>

        <FilterDropdown
          label="タグで絞り込む"
          count={tags.length}
          open={tagOpen}
          onToggle={() => setTagOpen((v) => !v)}
          onClose={() => setTagOpen(false)}
        >
          <div className="p-3 border-b border-nl-card-border">
            <input
              autoFocus
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="タグを検索..."
              className="w-full px-3 py-2 rounded-nl-input border border-nl-border text-sm outline-none focus:border-nl-primary bg-nl-beige transition-all duration-200"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-2">
            {filterTagCategories(tagInput, tags).length === 0 ? (
              <p className="text-sm text-nl-muted text-center py-4">候補なし</p>
            ) : (
              filterTagCategories(tagInput, tags).map((cat) => (
                <div key={cat.id} className="mb-3">
                  <p className="text-xs font-semibold text-nl-muted uppercase tracking-wider px-2 mb-1">
                    {cat.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {cat.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          if (!tags.includes(tag)) {
                            router.push(buildHref({ tags: [...tags, tag] }))
                          }
                          setTagInput('')
                          setTagOpen(false)
                        }}
                        className="px-2.5 py-1 rounded-full text-xs bg-nl-beige text-nl-text hover:bg-nl-primary/10 hover:text-nl-primary transition-all duration-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </FilterDropdown>

        <FilterSelect
          label="開発状況"
          value={status}
          options={STATUS_OPTIONS}
          defaultValue=""
          onChange={(v) => router.push(buildHref({ status: v }))}
        />

        <FilterSelect
          label="並び替え"
          value={sort}
          options={SORT_OPTIONS}
          defaultValue="newest"
          onChange={(v) => router.push(buildHref({ sort: v }))}
        />
      </div>

      {(categories.length > 0 || tags.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((catId) => {
            const cat = SERVICE_CATEGORIES.find((c) => c.id === catId)
            if (!cat) return null
            return (
              <TagChip
                key={catId}
                variant="filter"
                label={`${cat.emoji} ${cat.label}`}
                onRemove={() =>
                  router.push(buildHref({ categories: categories.filter((c) => c !== catId) }))
                }
              />
            )
          })}
          {tags.map((tag) => (
            <TagChip
              key={tag}
              variant="filter"
              label={`#${tag}`}
              onRemove={() => router.push(buildHref({ tags: tags.filter((t) => t !== tag) }))}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm text-nl-muted">{resultCount}件</span>
        {query && (
          <TagChip
            variant="filter"
            label={`「${query}」`}
            onRemove={() => router.push(buildHref({ q: '' }))}
          />
        )}
        {hasFilters && (
          <button
            onClick={() => router.push('/search')}
            className="text-xs text-nl-muted hover:text-nl-text ml-auto flex items-center gap-1 transition-all duration-200"
          >
            <X className="w-3 h-3" />
            すべてクリア
          </button>
        )}
      </div>
    </div>
  )
}

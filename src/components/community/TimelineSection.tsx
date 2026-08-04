'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, Card, Dialog, EmptyState } from '@/components/ui'
import { Toast } from '@/components/ui/Toast'
import { useUserRole } from '@/components/providers/ProfileProvider'
import { getDisplayError } from '@/lib/errors'
import { formatDateShort, cn } from '@/lib/utils'
import {
  createDevelopmentLog,
  updateDevelopmentLog,
  deleteDevelopmentLog,
  createUpdateHistory,
  updateUpdateHistory,
  deleteUpdateHistory,
} from '@/lib/actions/community'
import type { DevelopmentLog, UpdateHistory } from '@/types'

const PREVIEW_COUNT = 3

type LogMode = 'dev' | 'update'

interface BaseProps {
  serviceId: string
  isOwner: boolean
}

interface DevLogProps extends BaseProps {
  mode: 'dev'
  items: DevelopmentLog[]
}

interface UpdateProps extends BaseProps {
  mode: 'update'
  items: UpdateHistory[]
}

type TimelineSectionProps = DevLogProps | UpdateProps

export function TimelineSection(props: TimelineSectionProps) {
  const { serviceId, isOwner, mode } = props
  const role = useUserRole()
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [items, setItems] = useState(props.items)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [body, setBody] = useState('')
  const [version, setVersion] = useState('')
  const [dateValue, setDateValue] = useState(new Date().toISOString().slice(0, 10))
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const title = mode === 'dev' ? '開発ログ' : 'アップデート履歴'
  const emptyTitle = mode === 'dev' ? '開発ログはまだありません' : 'アップデート履歴はまだありません'
  const emptyDesc =
    mode === 'dev'
      ? '進捗や日記を残して、開発の過程を共有しましょう'
      : 'ユーザー向けの変更履歴を追加しましょう'

  const visible = showAll ? items : items.slice(0, PREVIEW_COUNT)

  function resetForm() {
    setFormOpen(false)
    setEditingId(null)
    setBody('')
    setVersion('')
    setDateValue(new Date().toISOString().slice(0, 10))
  }

  function startCreate() {
    resetForm()
    setFormOpen(true)
    setOpen(true)
  }

  function startEdit(item: DevelopmentLog | UpdateHistory) {
    setEditingId(item.id)
    setBody(item.body)
    if (mode === 'update') {
      setVersion((item as UpdateHistory).version)
      setDateValue((item as UpdateHistory).released_at)
    } else {
      setDateValue((item as DevelopmentLog).logged_at)
    }
    setFormOpen(true)
    setOpen(true)
  }

  function handleSave() {
    setError(null)
    startTransition(async () => {
      let result
      if (mode === 'dev') {
        if (editingId) {
          result = await updateDevelopmentLog(editingId, serviceId, body, dateValue)
        } else {
          result = await createDevelopmentLog(serviceId, body, dateValue)
        }
      } else {
        if (editingId) {
          result = await updateUpdateHistory(editingId, serviceId, version, body, dateValue)
        } else {
          result = await createUpdateHistory(serviceId, version, body, dateValue)
        }
      }

      if (!result.ok) {
        console.error(result.error)
        setError(getDisplayError(result.error, role, '保存できませんでした。'))
        return
      }
      resetForm()
      window.location.reload()
    })
  }

  function handleDelete() {
    if (!deleteId) return
    setError(null)
    startTransition(async () => {
      const result =
        mode === 'dev'
          ? await deleteDevelopmentLog(deleteId, serviceId)
          : await deleteUpdateHistory(deleteId, serviceId)

      if (!result.ok) {
        console.error(result.error)
        setError(getDisplayError(result.error, role, '削除できませんでした。'))
        return
      }
      setItems((prev) => prev.filter((item) => item.id !== deleteId) as typeof prev)
      setDeleteId(null)
    })
  }

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-6 sm:px-8 py-4 text-left hover:bg-nl-beige/60 transition-colors"
      >
        <span className="font-semibold text-nl-text text-lg">{title}</span>
        <span className="flex items-center gap-2 text-sm text-nl-muted">
          {items.length > 0 && <span>{items.length}</span>}
          <ChevronDown
            className={cn('w-5 h-5 transition-transform duration-200', open && 'rotate-180')}
          />
        </span>
      </button>

      {open && (
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 border-t border-nl-card-border">
          {isOwner && (
            <div className="flex justify-end pt-4 mb-2">
              <Button type="button" variant="secondary" size="sm" onClick={startCreate}>
                <Plus className="w-4 h-4" />
                追加
              </Button>
            </div>
          )}

          {formOpen && isOwner && (
            <div className="mt-2 mb-6 p-4 rounded-nl-input border border-nl-card-border bg-nl-beige/40 space-y-3">
              {mode === 'update' && (
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.2.0"
                  maxLength={40}
                  className="w-full h-11 rounded-nl-input border border-nl-border bg-white px-3 text-sm text-nl-text focus:outline-none focus:border-nl-primary"
                />
              )}
              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className="w-full h-11 rounded-nl-input border border-nl-border bg-white px-3 text-sm text-nl-text focus:outline-none focus:border-nl-primary"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={5000}
                placeholder={
                  mode === 'dev'
                    ? '進捗や日記を書く…'
                    : '・プロフィール追加\n・検索改善\n・不具合修正'
                }
                className="w-full rounded-nl-input border border-nl-border bg-white px-3 py-2.5 text-sm text-nl-text focus:outline-none focus:border-nl-primary resize-y"
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={resetForm} disabled={pending}>
                  キャンセル
                </Button>
                <Button
                  type="button"
                  size="sm"
                  loading={pending}
                  onClick={handleSave}
                  disabled={!body.trim() || (mode === 'update' && !version.trim())}
                >
                  保存
                </Button>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            <EmptyState
              title={emptyTitle}
              description={isOwner ? emptyDesc : undefined}
              className="py-10 shadow-none mt-2"
            />
          ) : (
            <ul className="mt-4 space-y-6">
              {visible.map((item) => {
                const date =
                  mode === 'dev'
                    ? (item as DevelopmentLog).logged_at
                    : (item as UpdateHistory).released_at
                return (
                  <li key={item.id} className="relative pl-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        {mode === 'update' && (
                          <div className="font-semibold text-nl-text mb-0.5">
                            {(item as UpdateHistory).version}
                          </div>
                        )}
                        <div className="text-sm text-nl-muted">{formatDateShort(date)}</div>
                      </div>
                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="p-1.5 text-nl-muted hover:text-nl-text hover:bg-nl-beige rounded-lg"
                            aria-label="編集"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(item.id)}
                            className="p-1.5 text-nl-muted hover:text-red-500 hover:bg-red-50 rounded-lg"
                            aria-label="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-nl-text leading-relaxed whitespace-pre-wrap">
                      {item.body}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}

          {items.length > PREVIEW_COUNT && !showAll && (
            <div className="mt-6 text-center">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAll(true)}>
                もっと見る
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={`${title}を削除`}
        description="この項目を削除しますか？この操作は取り消せません。"
        confirmLabel="削除する"
        variant="danger"
        loading={pending}
      />

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
    </Card>
  )
}

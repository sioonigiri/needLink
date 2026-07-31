'use client'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export interface DialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'primary'
  loading?: boolean
  error?: string | null
}

/** 削除確認など、2アクションの確認ダイアログ */
export function Dialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = '確認',
  cancelLabel = 'キャンセル',
  variant = 'danger',
  loading = false,
  error,
}: DialogProps) {
  return (
    <Modal open={open} onClose={() => !loading && onClose()} title={title} closeOnOverlay={!loading}>
      <p className="text-sm text-nl-muted leading-relaxed mb-6">{description}</p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-nl-input px-3 py-2 mb-4">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={loading}
          onClick={onClose}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

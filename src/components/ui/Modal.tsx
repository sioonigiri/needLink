'use client'

import { useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  /** false のとき背景クリックで閉じない */
  closeOnOverlay?: boolean
  /** center: 中央 / sheet: スマホは下から、PCは中央寄り */
  variant?: 'center' | 'sheet'
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  closeOnOverlay = true,
  variant = 'center',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  // 親の再レンダーで onClose 参照が変わっても effect を再実行しない
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    previouslyFocused.current = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const dialog = dialogRef.current
    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

    // オープン時のみ初期フォーカス（入力中の再フォーカスはしない）
    const closeBtn = dialog?.querySelector<HTMLElement>('button[aria-label="閉じる"]')
    ;(closeBtn || dialog)?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !dialog) return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
      )
      if (focusable.length === 0) {
        e.preventDefault()
        dialog.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
      previouslyFocused.current?.focus?.()
    }
  }, [open])

  if (!open) return null

  const isSheet = variant === 'sheet'

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex',
        isSheet
          ? 'items-end justify-center sm:items-center p-0 sm:p-4'
          : 'items-center justify-center p-4'
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <div
        className="absolute inset-0 bg-nl-text/40 backdrop-blur-sm transition-all duration-200"
        onClick={() => closeOnOverlay && onCloseRef.current()}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-nl-card border border-nl-card-border shadow-nl-card',
          'transition-all duration-200 outline-none',
          isSheet
            ? 'max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-nl-card flex flex-col p-0 overflow-hidden'
            : 'max-w-md rounded-nl-card p-6 sm:p-7',
          className
        )}
      >
        <div
          className={cn(
            'flex items-start justify-between gap-3 shrink-0',
            isSheet ? 'px-5 pt-5 pb-3 border-b border-nl-card-border' : 'mb-4'
          )}
        >
          {title ? (
            <h2 id={titleId} className="text-lg font-bold text-nl-text">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => onCloseRef.current()}
            className="p-1.5 -mr-1 rounded-full text-nl-muted hover:bg-nl-beige hover:text-nl-text transition-all duration-200"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {isSheet ? (
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'
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
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  closeOnOverlay = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'nl-modal-title' : undefined}
    >
      <div
        className="absolute inset-0 bg-nl-text/40 backdrop-blur-sm transition-all duration-200"
        onClick={() => closeOnOverlay && onClose()}
      />
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full max-w-md bg-nl-card rounded-nl-card border border-nl-card-border shadow-nl-card',
          'p-6 sm:p-7 transition-all duration-200',
          className
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          {title ? (
            <h2 id="nl-modal-title" className="text-lg font-bold text-nl-text">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1 rounded-full text-nl-muted hover:bg-nl-beige hover:text-nl-text transition-all duration-200"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

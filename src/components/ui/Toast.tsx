'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
  duration?: number
}

const typeStyles: Record<ToastType, string> = {
  success: 'bg-nl-text text-white',
  error: 'bg-red-600 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-sky-600 text-white',
}

const typeIcons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 shrink-0" />,
  error: <AlertCircle className="w-4 h-4 shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
  info: <Info className="w-4 h-4 shrink-0" />,
}

export function Toast({ message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  if (!mounted) return null

  return createPortal(
    <div
      role="status"
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]',
        'flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-nl-card text-sm font-medium',
        'transition-all duration-200',
        typeStyles[type]
      )}
    >
      {typeIcons[type]}
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-1 p-0.5 rounded-full opacity-70 hover:opacity-100 transition-all duration-200"
        aria-label="閉じる"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>,
    document.body
  )
}

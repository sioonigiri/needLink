'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Toast } from '@/components/ui/Toast'

const TOAST_KEY = 'needlink_toast'

export function setFlashToast(message: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(TOAST_KEY, message)
  }
}

export function ToastProvider() {
  const pathname = usePathname()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const msg = sessionStorage.getItem(TOAST_KEY)
    if (msg) {
      sessionStorage.removeItem(TOAST_KEY)
      setMessage(msg)
    }
  }, [pathname])

  if (!message) return null
  return <Toast message={message} onClose={() => setMessage(null)} />
}

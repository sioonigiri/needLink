'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { setFlashToast } from '@/components/ui/ToastProvider'
import { cn } from '@/lib/utils'

interface DeleteServiceButtonProps {
  serviceId: string
  userId: string
  /** 削除後の遷移先（ユーザートップ＝ホーム） */
  redirectTo?: string
}

export function DeleteServiceButton({
  serviceId,
  userId,
  redirectTo = '/',
}: DeleteServiceButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      setError('削除する権限がありません。')
      setDeleting(false)
      return
    }

    const { error: deleteError } = await (supabase as any)
      .from('services')
      .delete()
      .eq('id', serviceId)
      .eq('user_id', user.id)

    if (deleteError) {
      setError(`削除に失敗しました: ${deleteError.message}`)
      setDeleting(false)
      return
    }

    setFlashToast('サービスを削除しました。')
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen(true); setError(null) }}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl text-sm font-medium transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        削除する
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div
            className="absolute inset-0 bg-ink-800/40 backdrop-blur-sm"
            onClick={() => !deleting && setOpen(false)}
          />
          <div className="relative bg-white rounded-2xl border border-cream-300 shadow-xl max-w-md w-full p-6 sm:p-7">
            <h2 id="delete-dialog-title" className="text-lg font-bold text-ink-800 mb-2">
              サービスを削除
            </h2>
            <p className="text-ink-500 text-sm leading-relaxed mb-6">
              このサービスを削除しますか？この操作は取り消せません。
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-ink-600 bg-cream-100 hover:bg-cream-200 border border-cream-300 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { setFlashToast } from '@/components/ui/ToastProvider'
import { Button, Dialog } from '@/components/ui'
import { useUserRole } from '@/components/providers/ProfileProvider'
import { getDisplayError } from '@/lib/errors'

interface DeleteServiceButtonProps {
  serviceId: string
  userId: string
  redirectTo?: string
}

export function DeleteServiceButton({
  serviceId,
  userId,
  redirectTo = '/',
}: DeleteServiceButtonProps) {
  const router = useRouter()
  const role = useUserRole()
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
      console.error(deleteError)
      setError(getDisplayError(deleteError, role, 'エラーが発生しました。'))
      setDeleting(false)
      return
    }

    setFlashToast('サービスを削除しました。')
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size="sm"
        className="bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 hover:shadow-none"
        onClick={() => { setOpen(true); setError(null) }}
      >
        <Trash2 className="w-4 h-4" />
        削除する
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleDelete}
        title="サービスを削除"
        description="このサービスを削除しますか？この操作は取り消せません。"
        confirmLabel="削除する"
        cancelLabel="キャンセル"
        variant="danger"
        loading={deleting}
        error={error}
      />
    </>
  )
}

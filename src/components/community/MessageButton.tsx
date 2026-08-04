'use client'

import { useCallback, useState, useTransition } from 'react'
import { MessageSquare } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button, Modal } from '@/components/ui'
import { Toast } from '@/components/ui/Toast'
import { useUserRole } from '@/components/providers/ProfileProvider'
import { getDisplayError } from '@/lib/errors'
import { openConversationWith, startOrSendMessage } from '@/lib/actions/dm'

interface MessageButtonProps {
  recipientId: string
  recipientName: string
  currentUserId: string | null
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md'
  className?: string
  label?: string
}

/**
 * サービス詳細・プロフィール共通の DM 開始ボタン。
 * - 既存会話 / 相手フォロー済み → /messages/[id] へ直接遷移
 * - 未フォロー → メッセージリクエスト用の初回入力モーダル
 */
export function MessageButton({
  recipientId,
  recipientName,
  currentUserId,
  variant = 'secondary',
  size = 'sm',
  className,
  label = 'メッセージ',
}: MessageButtonProps) {
  const router = useRouter()
  const role = useUserRole()
  const [open, setOpen] = useState(false)
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const handleCloseModal = useCallback(() => {
    if (!pending) setOpen(false)
  }, [pending])

  function handleClick() {
    if (!currentUserId) {
      window.location.href = '/auth'
      return
    }
    setError(null)
    setInfo(null)

    startTransition(async () => {
      const result = await openConversationWith(recipientId)
      if (!result.ok) {
        console.error(result.error)
        setError(getDisplayError(result.error, role, 'メッセージを開始できませんでした。'))
        return
      }
      if (result.data.mode === 'dm') {
        router.push(`/messages/${result.data.conversationId}`)
        return
      }
      setOpen(true)
    })
  }

  function handleSend() {
    setError(null)
    startTransition(async () => {
      const result = await startOrSendMessage(recipientId, body)
      if (!result.ok) {
        console.error(result.error)
        setError(getDisplayError(result.error, role, 'メッセージを送信できませんでした。'))
        return
      }
      setBody('')
      setOpen(false)
      if (result.data.mode === 'dm' && result.data.conversationId) {
        router.push(`/messages/${result.data.conversationId}`)
      } else {
        setInfo('メッセージリクエストを送信しました。相手の許可後にチャットが始まります。')
      }
    })
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        loading={pending && !open}
        onClick={handleClick}
        className={className}
      >
        <MessageSquare className="w-4 h-4" />
        {label}
      </Button>

      <Modal
        open={open}
        onClose={handleCloseModal}
        title={`${recipientName}さんへメッセージ`}
      >
        <p className="text-sm text-nl-muted mb-3 leading-relaxed">
          相手があなたをフォローしていないため、メッセージリクエストとして送信されます。
        </p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          maxLength={5000}
          placeholder="メッセージを入力…"
          className="w-full rounded-nl-input border border-nl-border bg-white px-3 py-2.5 text-sm text-nl-text focus:outline-none focus:border-nl-primary resize-y mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
            キャンセル
          </Button>
          <Button type="button" size="sm" loading={pending} disabled={!body.trim()} onClick={handleSend}>
            送信
          </Button>
        </div>
      </Modal>

      {error && <Toast message={error} type="error" onClose={() => setError(null)} />}
      {info && <Toast message={info} type="info" onClose={() => setInfo(null)} />}
    </>
  )
}

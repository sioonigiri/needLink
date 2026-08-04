import {
  canSeeDetailedErrors,
  DEFAULT_USER_ROLE,
  type UserRole,
} from '@/types/roles'

/** エラーオブジェクトから詳細メッセージ文字列を取り出す */
export function getErrorDetail(error: unknown): string {
  if (!error) return ''
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message?: unknown }).message
    if (typeof msg === 'string') return msg
  }
  try {
    return JSON.stringify(error)
  } catch {
    return String(error)
  }
}

/**
 * ロールに応じた画面表示用エラーメッセージを返す。
 * - developer / admin: 詳細を付与
 * - user ほか: ユーザー向けメッセージのみ
 * console.error は呼び出し側で行うこと
 */
export function getDisplayError(
  error: unknown,
  role: UserRole | null | undefined,
  userMessage = 'エラーが発生しました。'
): string {
  const detail = getErrorDetail(error)
  if (canSeeDetailedErrors(role ?? DEFAULT_USER_ROLE)) {
    if (!detail) return userMessage
    // 既にユーザー向け文が含まれていればそのまま詳細を優先
    if (detail === userMessage) return detail
    return `${userMessage}（${detail}）`
  }
  return userMessage
}

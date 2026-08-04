/** アプリ内ユーザーロール。将来 admin を追加しやすいよう拡張可能なユニオン */
export type UserRole = 'user' | 'developer' | 'admin'

export const USER_ROLES = ['user', 'developer', 'admin'] as const satisfies readonly UserRole[]

export const DEFAULT_USER_ROLE: UserRole = 'user'

/** 詳細エラーを画面表示してよいロール */
const DETAILED_ERROR_ROLES: ReadonlySet<UserRole> = new Set(['developer', 'admin'])

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value)
}

export function normalizeUserRole(value: unknown): UserRole {
  return isUserRole(value) ? value : DEFAULT_USER_ROLE
}

export function canSeeDetailedErrors(role?: UserRole | null): boolean {
  return !!role && DETAILED_ERROR_ROLES.has(role)
}

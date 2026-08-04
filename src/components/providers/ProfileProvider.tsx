'use client'

import { createContext, useContext } from 'react'
import type { Profile } from '@/types'
import { DEFAULT_USER_ROLE, normalizeUserRole, type UserRole } from '@/types/roles'

const ProfileContext = createContext<Profile | null>(null)

export function ProfileProvider({
  profile,
  children,
}: {
  profile: Profile | null
  children: React.ReactNode
}) {
  return (
    <ProfileContext.Provider value={profile}>
      {children}
    </ProfileContext.Provider>
  )
}

/** ログイン中ユーザーのプロフィール。未ログイン時は null */
export function useProfile(): Profile | null {
  return useContext(ProfileContext)
}

/** ログイン中ユーザーの role。未ログイン・未設定時は user */
export function useUserRole(): UserRole {
  const profile = useProfile()
  return normalizeUserRole(profile?.role)
}

import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { ProfileProvider } from '@/components/providers/ProfileProvider'
import type { Profile } from '@/types'
import { normalizeUserRole } from '@/types/roles'
import { getUnreadCounts } from '@/lib/actions/notifications'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  let unreadNotifications = 0
  let unreadMessages = 0

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      const row = data as Profile
      profile = {
        ...row,
        role: normalizeUserRole(row.role),
      }
    }

    try {
      const counts = await getUnreadCounts()
      unreadNotifications = counts.notifications + counts.requests
      unreadMessages = counts.messages + counts.requests
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <ProfileProvider profile={profile}>
      <div className="flex flex-col min-h-screen">
        <Header
          profile={profile}
          unreadNotifications={unreadNotifications}
          unreadMessages={unreadMessages}
        />
        <main className="flex-1">{children}</main>
        <Footer />
        <ToastProvider />
      </div>
    </ProfileProvider>
  )
}

'use client'

import { Suspense } from 'react'
import ProfileSettingsForm from './ProfileSettingsForm'
import { Skeleton } from '@/components/ui'

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-48" />
      </div>
    }>
      <ProfileSettingsForm />
    </Suspense>
  )
}

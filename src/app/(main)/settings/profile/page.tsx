'use client'

import { Suspense } from 'react'
import ProfileSettingsForm from './ProfileSettingsForm'

export default function ProfileSettingsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cream-200 rounded-xl w-48" />
          <div className="h-48 bg-cream-200 rounded-2xl" />
        </div>
      </div>
    }>
      <ProfileSettingsForm />
    </Suspense>
  )
}

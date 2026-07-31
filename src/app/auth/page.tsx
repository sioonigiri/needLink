'use client'

import { Suspense } from 'react'
import AuthForm from './AuthForm'
import { Spinner } from '@/components/ui'

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-nl-bg flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <AuthForm />
    </Suspense>
  )
}

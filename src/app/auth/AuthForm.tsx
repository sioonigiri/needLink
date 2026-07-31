'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function AuthForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'login' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function switchTab(next: 'login' | 'signup') {
    setTab(next)
    setError('')
    setMessage('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    const supabase = createClient()

    if (tab === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })
      if (error) {
        if (error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already been registered')) {
          setError('このメールアドレスはすでに登録されています。ログインしてください。')
          switchTab('login')
        } else {
          setError(error.message)
        }
      } else {
        setMessage('確認メールを送信しました。メールをご確認ください。')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('メールアドレスまたはパスワードが正しくありません')
      } else {
        router.push('/settings/profile')
        router.refresh()
      }
    }
    setLoading(false)
  }

  async function handleGoogleAuth() {
    setGoogleLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: tab === 'signup' ? { prompt: 'select_account' } : {},
      },
    })
    setGoogleLoading(false)
  }

  return (
    <div className="min-h-screen bg-nl-bg flex flex-col items-center justify-center px-4 py-14 sm:px-6">
      <div className="w-full max-w-[420px]">
        {/* Brand */}
        <div className="text-center mb-11">
          <Link
            href="/"
            className="inline-block text-[28px] font-bold tracking-tight text-nl-text transition-colors duration-200 hover:text-nl-primary"
          >
            NeedLink
          </Link>
          <p className="mt-2.5 text-[15px] text-nl-muted leading-relaxed">
            個人開発者のためのショーケース
          </p>
        </div>

        {/* Card */}
        <div className="bg-nl-card rounded-nl-card border border-nl-card-border shadow-nl-card px-7 py-9 sm:px-10 sm:py-11">
          {/* Tabs */}
          <div
            role="tablist"
            aria-label="認証切替"
            className="flex p-1.5 mb-9 rounded-2xl bg-[#EFEBE4]"
          >
            {([
              { id: 'login' as const, label: 'ログイン' },
              { id: 'signup' as const, label: '新規登録' },
            ]).map((item) => {
              const active = tab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchTab(item.id)}
                  className={cn(
                    'flex-1 py-3 text-[15px] rounded-[14px] transition-all duration-200',
                    active
                      ? 'bg-white text-nl-primary font-semibold shadow-sm'
                      : 'text-[#6B6560] font-medium hover:text-nl-text'
                  )}
                >
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Google — secondary action */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className={cn(
              'w-full h-[52px] flex items-center justify-center gap-3 px-4',
              'bg-white text-[15px] font-medium text-nl-text rounded-2xl',
              'border border-[#D1D5DB]',
              'transition-all duration-200 ease-out',
              'hover:bg-[#F9FAFB] hover:border-[#9CA3AF]',
              'active:bg-[#F3F4F6]',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-nl-muted" />
            ) : (
              <GoogleIcon />
            )}
            {tab === 'login' ? 'Googleでログイン' : 'Googleで会員登録'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-9">
            <div className="flex-1 h-px bg-[#E5E0D8]" />
            <span className="shrink-0 text-[13px] font-medium text-[#7A746C]">
              またはメールで{tab === 'login' ? 'ログイン' : '登録'}
            </span>
            <div className="flex-1 h-px bg-[#E5E0D8]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="flex flex-col gap-2.5">
              <label htmlFor="auth-email" className="text-[14px] font-semibold text-nl-text">
                メールアドレス
              </label>
              <div
                className={cn(
                  'flex items-center h-[52px] rounded-2xl border bg-white',
                  'border-[#D1D5DB]',
                  'transition-all duration-200',
                  'focus-within:border-nl-primary focus-within:shadow-nl-focus'
                )}
              >
                <Mail className="w-[18px] h-[18px] text-[#9CA3AF] ml-4 shrink-0" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 h-full px-3 bg-transparent text-[15px] text-nl-text outline-none placeholder:text-[#A8A29E] min-w-0"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2.5">
              <label htmlFor="auth-password" className="text-[14px] font-semibold text-nl-text">
                パスワード
              </label>
              <div
                className={cn(
                  'flex items-center h-[52px] rounded-2xl border bg-white',
                  'border-[#D1D5DB]',
                  'transition-all duration-200',
                  'focus-within:border-nl-primary focus-within:shadow-nl-focus'
                )}
              >
                <Lock className="w-[18px] h-[18px] text-[#9CA3AF] ml-4 shrink-0" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="flex-1 h-full px-3 bg-transparent text-[15px] text-nl-text outline-none placeholder:text-[#A8A29E] min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="p-2.5 mr-1.5 text-[#9CA3AF] hover:text-nl-text transition-colors duration-200"
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                </button>
              </div>
              {tab === 'signup' && (
                <p className="text-[13px] text-[#7A746C]">8文字以上で設定してください</p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-[14px] text-red-700 leading-relaxed">
                {error}
              </div>
            )}
            {message && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-[14px] text-green-800 leading-relaxed">
                {message}
              </div>
            )}

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full h-[52px] mt-1 flex items-center justify-center gap-2',
                'text-white text-[15px] font-semibold rounded-full',
                'bg-nl-primary',
                'transition-all duration-200 ease-out',
                'hover:bg-nl-primary-hover hover:-translate-y-px hover:shadow-nl-btn',
                'active:translate-y-0 active:shadow-none',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none'
              )}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {tab === 'login' ? 'ログイン' : 'アカウントを作成'}
            </button>
          </form>
        </div>

        <p className="text-center text-[13px] text-[#7A746C] mt-9 leading-relaxed">
          登録することで、
          <Link href="/terms" className="font-medium text-nl-primary hover:underline transition-colors duration-200">
            利用規約
          </Link>
          と
          <Link href="/privacy" className="font-medium text-nl-primary hover:underline transition-colors duration-200">
            プライバシーポリシー
          </Link>
          に同意したものとみなします。
        </p>
      </div>
    </div>
  )
}

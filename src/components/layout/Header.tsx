'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, PlusCircle, Heart, User, LogOut, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useState, useEffect } from 'react'
import type { Profile } from '@/types'

interface HeaderProps {
  profile?: Profile | null
}

export function Header({ profile }: HeaderProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-cream-50/95 backdrop-blur-md border-b border-cream-300 shadow-soft'
          : 'bg-cream-50'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-ink-800 tracking-tight group-hover:text-warm-600 transition-colors">
              NeedLink
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/search"
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-ink-600 hover:text-ink-800 hover:bg-cream-200 rounded-lg transition-all"
            >
              <Search className="w-4 h-4" />
              探す
            </Link>

            {profile ? (
              <>
                <Link
                  href="/favorites"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-ink-600 hover:text-ink-800 hover:bg-cream-200 rounded-lg transition-all"
                >
                  <Heart className="w-4 h-4" />
                  お気に入り
                </Link>
                <Link
                  href="/services/new"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-warm-600 hover:text-warm-700 hover:bg-warm-50 rounded-lg transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  投稿する
                </Link>
                <div className="relative group ml-1">
                  <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-cream-200 transition-colors">
                    <Avatar
                      src={profile.avatar_url}
                      name={profile.username}
                      size="sm"
                    />
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-cream-300 shadow-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-1">
                      <Link
                        href={`/users/${profile.username}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-cream-100 rounded-lg"
                      >
                        <User className="w-4 h-4" />
                        プロフィール
                      </Link>
                      <Link
                        href="/settings/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 hover:bg-cream-100 rounded-lg"
                      >
                        設定
                      </Link>
                      <hr className="my-1 border-cream-200" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <LogOut className="w-4 h-4" />
                        ログアウト
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/auth')}>
                  ログイン
                </Button>
                <Button size="sm" onClick={() => router.push('/auth?tab=signup')}>
                  はじめる
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-cream-200 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-cream-200 py-3 space-y-1">
            <Link
              href="/search"
              className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-700 hover:bg-cream-200 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              <Search className="w-4 h-4" />
              探す
            </Link>
            {profile ? (
              <>
                <Link
                  href="/favorites"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-700 hover:bg-cream-200 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  <Heart className="w-4 h-4" />
                  お気に入り
                </Link>
                <Link
                  href="/services/new"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-warm-600 hover:bg-warm-50 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  <PlusCircle className="w-4 h-4" />
                  投稿する
                </Link>
                <Link
                  href={`/users/${profile.username}`}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-ink-700 hover:bg-cream-200 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  プロフィール
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2 px-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() => { router.push('/auth'); setMenuOpen(false) }}
                >
                  ログイン
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => { router.push('/auth?tab=signup'); setMenuOpen(false) }}
                >
                  はじめる
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

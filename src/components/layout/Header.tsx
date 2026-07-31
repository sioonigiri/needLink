'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, PlusCircle, Heart, User, LogOut, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button, Avatar } from '@/components/ui'
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

  const navLink =
    'flex items-center gap-1.5 px-3 py-2 text-sm text-nl-muted hover:text-nl-text hover:bg-nl-beige rounded-lg transition-all duration-200'
  const mobileLink =
    'flex items-center gap-2 px-3 py-2.5 text-sm text-nl-text hover:bg-nl-beige rounded-lg transition-all duration-200'

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-nl-bg/95 backdrop-blur-md border-b border-nl-card-border shadow-nl-card'
          : 'bg-nl-bg'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold text-nl-text tracking-tight group-hover:text-nl-primary transition-all duration-200">
              NeedLink
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link href="/search" className={navLink}>
              <Search className="w-4 h-4" />
              探す
            </Link>

            {profile ? (
              <>
                <Link href="/favorites" className={navLink}>
                  <Heart className="w-4 h-4" />
                  お気に入り
                </Link>
                <Link
                  href="/services/new"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-nl-primary hover:text-nl-primary-hover hover:bg-nl-primary/5 rounded-lg transition-all duration-200"
                >
                  <PlusCircle className="w-4 h-4" />
                  投稿する
                </Link>
                <div className="relative group ml-1">
                  <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-nl-beige transition-all duration-200">
                    <Avatar
                      src={profile.avatar_url}
                      name={profile.username}
                      size="sm"
                    />
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 bg-nl-card rounded-nl-input border border-nl-card-border shadow-nl-card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-1">
                      <Link
                        href={`/users/${profile.slug || profile.username}`}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-nl-text hover:bg-nl-beige rounded-lg"
                      >
                        <User className="w-4 h-4" />
                        プロフィール
                      </Link>
                      <Link
                        href="/settings/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-nl-text hover:bg-nl-beige rounded-lg"
                      >
                        設定
                      </Link>
                      <hr className="my-1 border-nl-card-border" />
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

          <button
            className="md:hidden p-2 rounded-lg hover:bg-nl-beige transition-all duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-nl-card-border py-3 space-y-1">
            <Link href="/search" className={mobileLink} onClick={() => setMenuOpen(false)}>
              <Search className="w-4 h-4" />
              探す
            </Link>
            {profile ? (
              <>
                <Link href="/favorites" className={mobileLink} onClick={() => setMenuOpen(false)}>
                  <Heart className="w-4 h-4" />
                  お気に入り
                </Link>
                <Link
                  href="/services/new"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-nl-primary hover:bg-nl-primary/5 rounded-lg"
                  onClick={() => setMenuOpen(false)}
                >
                  <PlusCircle className="w-4 h-4" />
                  投稿する
                </Link>
                <Link
                  href={`/users/${profile.slug || profile.username}`}
                  className={mobileLink}
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  プロフィール
                </Link>
                <Link
                  href="/settings/profile"
                  className={mobileLink}
                  onClick={() => setMenuOpen(false)}
                >
                  設定
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

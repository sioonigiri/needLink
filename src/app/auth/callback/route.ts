import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const response = NextResponse.redirect(`${origin}/settings/profile`)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !user) {
      console.error(error ?? 'exchangeCodeForSession: no user')
      return NextResponse.redirect(`${origin}/auth?error=google_login_failed`)
    }

    // プロフィールが既に存在するか確認
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .maybeSingle()

    if (profile) {
      // 既存ユーザー → ホームへ
      response.headers.set('Location', `${origin}/`)
    } else {
      // 新規ユーザー → プロフィール設定へ
      response.headers.set('Location', `${origin}/settings/profile`)
    }

    return response
  }

  return NextResponse.redirect(`${origin}/auth`)
}

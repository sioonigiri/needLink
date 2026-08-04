'use server'

import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'

export type FollowListKind = 'followers' | 'following'

export type FollowListItem = {
  followId: string
  createdAt: string
  profile: Profile
  isFollowing: boolean
}

const LIST_LIMIT = 100

/**
 * フォロワー / フォロー中一覧を JOIN で一括取得。
 * 閲覧者のフォロー状態もまとめて付与（N+1 回避）。
 */
export async function getFollowList(
  profileId: string,
  kind: FollowListKind
): Promise<{ ok: true; items: FollowListItem[] } | { ok: false; error: unknown }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    const query =
      kind === 'following'
        ? (supabase as any)
            .from('follows')
            .select(`
              id,
              created_at,
              profile:profiles!following_id(*)
            `)
            .eq('follower_id', profileId)
            .order('created_at', { ascending: false })
            .limit(LIST_LIMIT)
        : (supabase as any)
            .from('follows')
            .select(`
              id,
              created_at,
              profile:profiles!follower_id(*)
            `)
            .eq('following_id', profileId)
            .order('created_at', { ascending: false })
            .limit(LIST_LIMIT)

    const { data, error } = await query
    if (error) return { ok: false, error }

    const rows = (data || []) as Array<{
      id: string
      created_at: string
      profile: Profile | null
    }>

    const profiles = rows
      .filter((r) => r.profile)
      .map((r) => ({
        followId: r.id,
        createdAt: r.created_at,
        profile: r.profile as Profile,
      }))

    const ids = profiles.map((p) => p.profile.id)
    const followingSet = new Set<string>()

    if (user && ids.length > 0) {
      const { data: myFollows, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)
        .in('following_id', ids)

      if (followError) {
        console.error(followError)
      } else {
        for (const f of (myFollows || []) as Array<{ following_id: string }>) {
          followingSet.add(f.following_id)
        }
      }
    }

    return {
      ok: true,
      items: profiles.map((p) => ({
        ...p,
        isFollowing: followingSet.has(p.profile.id),
      })),
    }
  } catch (err) {
    console.error(err)
    return { ok: false, error: err }
  }
}

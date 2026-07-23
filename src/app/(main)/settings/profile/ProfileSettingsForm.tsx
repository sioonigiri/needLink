'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { TagInput } from '@/components/ui/TagInput'
import { Avatar } from '@/components/ui/Avatar'
import type { Profile } from '@/types'

const profileSchema = z.object({
  username: z
    .string()
    .min(3, '3文字以上で入力してください')
    .max(30, '30文字以内で入力してください')
    .regex(/^[a-z0-9_-]+$/, '英小文字・数字・ハイフン・アンダースコアのみ使用できます'),
  bio: z.string().max(300, '300文字以内で入力してください').optional(),
  github_url: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
  twitter_url: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
  website_url: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfileSettingsForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [techTags, setTechTags] = useState<string[]>([])
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // 初回作成か編集かの判定
  const isEditing = !!profile

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }
      setUserId(user.id)

      const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setTechTags(data.tech_tags || [])
        setAvatar(data.avatar_url)
        reset({
          username: data.username,
          bio: data.bio || '',
          github_url: data.github_url || '',
          twitter_url: data.twitter_url || '',
          website_url: data.website_url || '',
        })
      }
      setLoading(false)
    }
    loadProfile()
  }, [router, reset])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatar(URL.createObjectURL(file))
  }

  async function onSubmit(data: ProfileFormValues) {
    if (!userId) return
    setSubmitting(true)
    const supabase = createClient()

    let avatarUrl = profile?.avatar_url || null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const fileName = `avatars/${userId}.${ext}`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true })
      if (!error) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)
        avatarUrl = urlData.publicUrl
      }
    }

    const profileData = {
      id: userId,
      username: data.username,
      bio: data.bio || null,
      avatar_url: avatarUrl,
      // 編集モードのみ更新するフィールド
      ...(isEditing && {
        github_url: data.github_url || null,
        twitter_url: data.twitter_url || null,
        website_url: data.website_url || null,
        tech_tags: techTags,
      }),
      updated_at: new Date().toISOString(),
    }

    if (isEditing) {
      await (supabase as any).from('profiles').update(profileData).eq('id', userId)
    } else {
      await (supabase as any).from('profiles').insert({
        ...profileData,
        tech_tags: [],
        created_at: new Date().toISOString(),
      })
    }

    router.refresh()
    if (from === 'new-service') {
      router.push('/services/new')
    } else {
      router.push(`/users/${data.username}`)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cream-200 rounded-xl w-48" />
          <div className="h-48 bg-cream-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className={`mx-auto px-4 sm:px-6 py-10 ${isEditing ? 'max-w-2xl' : 'max-w-lg'}`}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink-800">
          {isEditing ? 'プロフィール設定' : 'はじめましょう 👋'}
        </h1>
        <p className="text-ink-500 mt-1">
          {isEditing
            ? 'プロフィールを編集できます'
            : 'まず簡単なプロフィールを設定してください'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Avatar */}
        <div className="bg-white rounded-2xl border border-cream-300 p-6">
          <p className="text-sm font-medium text-ink-700 mb-4">アイコン</p>
          <div className="flex items-center gap-4">
            <Avatar src={avatar} name={profile?.username} size="xl" />
            <div>
              <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-cream-100 hover:bg-cream-200 text-ink-700 text-sm font-medium rounded-xl border border-cream-300 transition-colors">
                <Upload className="w-4 h-4" />
                画像をアップロード
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
              <p className="text-xs text-ink-400 mt-1.5">PNG, JPG, WebP（最大2MB）</p>
            </div>
          </div>
        </div>

        {/* 基本情報（初回・編集共通） */}
        <div className="bg-white rounded-2xl border border-cream-300 p-6 space-y-5">
          <Input
            label="ユーザーネーム *"
            placeholder="例: taro_dev"
            hint="英小文字・数字・ハイフン・アンダースコア（3〜30文字）"
            error={errors.username?.message}
            {...register('username')}
          />
          <Textarea
            label="自己紹介"
            placeholder="どんな開発者ですか？作っているものや好きな技術を教えてください"
            rows={4}
            error={errors.bio?.message}
            {...register('bio')}
          />
        </div>

        {/* 編集モードのみ表示：技術タグ・リンク */}
        {isEditing && (
          <>
            <div className="bg-white rounded-2xl border border-cream-300 p-6">
              <TagInput
                label="使用技術タグ"
                value={techTags}
                onChange={setTechTags}
                placeholder="例: React, TypeScript, Next.js"
                hint="Enterまたはカンマで追加（最大15個）"
                maxTags={15}
              />
            </div>

            <div className="bg-white rounded-2xl border border-cream-300 p-6 space-y-5">
              <h2 className="font-semibold text-ink-800">SNS・リンク</h2>
              <Input
                label="GitHub"
                placeholder="https://github.com/username"
                error={errors.github_url?.message}
                {...register('github_url')}
              />
              <Input
                label="X (Twitter)"
                placeholder="https://x.com/username"
                error={errors.twitter_url?.message}
                {...register('twitter_url')}
              />
              <Input
                label="Website"
                placeholder="https://yoursite.com"
                error={errors.website_url?.message}
                {...register('website_url')}
              />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3">
          {isEditing && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push(`/users/${profile.username}`)}
            >
              キャンセル
            </Button>
          )}
          <Button type="submit" loading={submitting} size={isEditing ? 'md' : 'lg'} className={isEditing ? '' : 'w-full'}>
            {isEditing ? '保存する' : 'はじめる →'}
          </Button>
        </div>
      </form>
    </div>
  )
}

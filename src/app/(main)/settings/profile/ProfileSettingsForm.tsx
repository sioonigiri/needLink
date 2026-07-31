'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button, Card, Input, Textarea, Avatar, Skeleton } from '@/components/ui'
import { TagAutocomplete } from '@/components/ui/TagAutocomplete'
import { LinkInput } from '@/components/ui/LinkInput'
import { migrateOldLinks } from '@/data/links'
import type { ProfileLink } from '@/types'
import type { Profile } from '@/types'

const profileSchema = z.object({
  username: z
    .string()
    .min(3, '3文字以上で入力してください')
    .max(20, '20文字以内で入力してください'),
  slug: z
    .string()
    .min(3, '3文字以上で入力してください')
    .max(20, '20文字以内で入力してください')
    .regex(/^[a-z0-9_-]+$/, '英小文字・数字・ハイフン・アンダースコアのみ使用できます'),
  bio: z.string().max(300, '300文字以内で入力してください').optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>
type AvailStatus = 'idle' | 'checking' | 'available' | 'taken'

function useAvailCheck(
  value: string,
  field: 'username' | 'slug',
  currentUserId: string | null,
  initialValue: string,
) {
  const [status, setStatus] = useState<AvailStatus>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!value || value === initialValue) {
      setStatus('idle')
      return
    }
    setStatus('checking')
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const supabase = createClient()
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('id')
        .eq(field, value)
        .maybeSingle()
      if (error) {
        // カラムが存在しない場合などはチェックをスキップ
        setStatus('idle')
        return
      }
      if (data && data.id !== currentUserId) {
        setStatus('taken')
      } else {
        setStatus('available')
      }
    }, 500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [value, field, currentUserId, initialValue])

  return status
}

function AvailBadge({ status }: { status: AvailStatus }) {
  if (status === 'idle' || status === 'checking') return null
  if (status === 'taken') return (
    <p className="text-xs text-red-500 font-medium">このIDは使用済みです</p>
  )
  return (
    <p className="text-xs text-green-600 font-medium">使用できます</p>
  )
}

export default function ProfileSettingsForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [techTags, setTechTags] = useState<string[]>([])
  const [links, setLinks] = useState<ProfileLink[]>([])
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [initialUsername, setInitialUsername] = useState('')
  const [initialSlug, setInitialSlug] = useState('')

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  })

  const watchedUsername = useWatch({ control, name: 'username', defaultValue: '' })
  const watchedSlug = useWatch({ control, name: 'slug', defaultValue: '' })

  const usernameStatus = useAvailCheck(watchedUsername, 'username', userId, initialUsername)
  const slugStatus = useAvailCheck(watchedSlug, 'slug', userId, initialSlug)

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth'); return }
      setUserId(user.id)

      const { data } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setTechTags(data.tech_tags || [])
        const existingLinks: ProfileLink[] = data.links || []
        setLinks(existingLinks.length > 0 ? existingLinks : migrateOldLinks(data))
        setAvatar(data.avatar_url)
        setInitialUsername(data.username || '')
        setInitialSlug(data.slug || '')
        reset({
          username: data.username || '',
          slug: data.slug || '',
          bio: data.bio || '',
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
    if (usernameStatus === 'taken' || slugStatus === 'taken') {
      setSubmitError('使用済みのユーザーネームまたはユーザーIDがあります')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    const supabase = createClient()

    let avatarUrl = profile?.avatar_url || null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const fileName = `avatars/${userId}.${ext}`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, avatarFile, { upsert: true })
      if (!error) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName)
        avatarUrl = urlData.publicUrl
      }
    }

    const updateData = {
      username: data.username,
      bio: data.bio || null,
      avatar_url: avatarUrl,
      tech_tags: techTags,
      updated_at: new Date().toISOString(),
    }

    let saveError: any = null
    if (profile) {
      const { error } = await (supabase as any)
        .from('profiles').update(updateData).eq('id', userId)
      saveError = error
    } else {
      const { error } = await (supabase as any)
        .from('profiles')
        .insert({ id: userId, ...updateData, created_at: new Date().toISOString() })
      saveError = error
    }

    if (saveError) {
      setSubmitError(`保存に失敗しました: ${saveError.message}`)
      setSubmitting(false)
      return
    }

    // slug カラムが存在する場合のみ更新（存在しなくてもエラーにしない）
    await (supabase as any)
      .from('profiles')
      .update({ slug: data.slug })
      .eq('id', userId)

    // links カラムが存在する場合のみ更新
    if (links.length > 0) {
      await (supabase as any).from('profiles').update({ links }).eq('id', userId)
    }

    // slug が保存できていればslugで、なければusernameでリダイレクト
    const redirectSlug = data.slug || data.username
    window.location.href = from === 'new-service'
      ? '/services/new'
      : `/users/${redirectSlug}`
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="card" className="h-48" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-nl-text">
          {profile ? 'プロフィール設定' : 'プロフィールを設定する'}
        </h1>
        {!profile && (
          <p className="text-nl-muted mt-1">まずプロフィールを設定してください</p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar */}
        <Card className="p-6">
          <label className="text-sm font-medium text-nl-text block mb-4">アイコン</label>
          <div className="flex items-center gap-4">
            <Avatar src={avatar} name={profile?.username} size="xl" />
            <div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-nl-beige hover:bg-nl-card-border text-nl-text text-sm font-medium rounded-nl-input border border-nl-border transition-all duration-200">
                <Upload className="w-4 h-4" />
                画像をアップロード
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
              </label>
              <p className="text-xs text-nl-muted mt-1.5">PNG, JPG, WebP (最大2MB)</p>
            </div>
          </div>
        </Card>

        {/* Basic Info */}
        <Card className="p-6 space-y-5">
          <h2 className="font-semibold text-nl-text">基本情報</h2>

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <Input
              label="ユーザーネーム *"
              hint="画面に表示される名前です（3〜20文字）"
              error={errors.username?.message}
              {...register('username')}
            />
            <AvailBadge status={usernameStatus} />
          </div>

          {/* Slug = ユーザーID */}
          <div className="flex flex-col gap-1.5">
            <Input
              label="ユーザーID *"
              hint="URLに使われます。英小文字・数字・ハイフン・アンダースコアのみ（3〜20文字）"
              error={errors.slug?.message}
              {...register('slug')}
            />
            <AvailBadge status={slugStatus} />
          </div>

          <Textarea
            label="自己紹介"
            placeholder="どんな開発者ですか？使用技術や得意なことを書いてみましょう"
            rows={4}
            error={errors.bio?.message}
            {...register('bio')}
          />
          <TagAutocomplete
            label="使用技術タグ"
            value={techTags}
            onChange={setTechTags}
            hint="得意な技術を追加してください（最大15個）"
            maxTags={15}
          />
        </Card>

        {/* Links */}
        <Card className="p-6 space-y-5">
          <h2 className="font-semibold text-nl-text">リンク</h2>
          <LinkInput
            value={links}
            onChange={setLinks}
            hint="追加したいサービスを選んでURLを入力してください"
          />
        </Card>

        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-nl-input px-4 py-3">
            {submitError}
          </div>
        )}

        <div className="flex justify-end gap-3">
          {profile && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.location.href = `/users/${profile.slug || profile.username}`}
            >
              キャンセル
            </Button>
          )}
          <Button type="submit" loading={submitting}>
            {profile ? '保存する' : 'プロフィールを作成'}
          </Button>
        </div>
      </form>
    </div>
  )
}

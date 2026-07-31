'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button, Card, Input, Textarea } from '@/components/ui'
import { TagAutocomplete } from '@/components/ui/TagAutocomplete'
import { FormAccordion } from '@/components/ui/FormAccordion'
import { TagChip } from '@/components/ui/TagChip'
import { SERVICE_CATEGORIES, getCategoriesByIds } from '@/data/categories'
import { ServiceStatus } from '@/types'
import { cn } from '@/lib/utils'

const serviceSchema = z.object({
  name: z.string().min(1, 'サービス名は必須です').max(50, '50文字以内で入力してください'),
  tagline: z.string().min(1, 'キャッチコピーは必須です').max(50, '50文字以内で入力してください'),
  description: z.string().max(2000, '2000文字以内で入力してください').optional(),
  github_url: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
  website_url: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
  app_store_url: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
  google_play_url: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
  status: z.enum(['developing', 'beta', 'published', 'paused'] as const),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

interface ServiceFormProps {
  userId: string
  initialData?: Partial<ServiceFormValues & { id: string; thumbnail_url: string; screenshots: string[]; tags: string[]; categories: string[] }>
}

export function ServiceForm({ userId, initialData }: ServiceFormProps) {
  const router = useRouter()
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [categories, setCategories] = useState<string[]>(initialData?.categories || [])
  const [tagAccOpen, setTagAccOpen] = useState(false)
  const [catAccOpen, setCatAccOpen] = useState(false)
  const [thumbnail, setThumbnail] = useState<string | null>(initialData?.thumbnail_url || null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [screenshots, setScreenshots] = useState<string[]>(initialData?.screenshots || [])
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: initialData?.name || '',
      tagline: initialData?.tagline || '',
      description: initialData?.description || '',
      github_url: initialData?.github_url || '',
      website_url: initialData?.website_url || '',
      app_store_url: initialData?.app_store_url || '',
      google_play_url: initialData?.google_play_url || '',
      status: initialData?.status || 'developing',
    },
  })

  async function uploadImage(file: File, path: string): Promise<string | null> {
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const fileName = `${path}/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('service-images')
      .upload(fileName, file, { upsert: true })
    if (error) return null
    const { data } = supabase.storage.from('service-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbnailFile(file)
    setThumbnail(URL.createObjectURL(file))
  }

  function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (screenshots.length + files.length > 6) return
    const previews = files.map((f) => URL.createObjectURL(f))
    setScreenshotFiles((prev) => [...prev, ...files])
    setScreenshots((prev) => [...prev, ...previews])
  }

  function removeScreenshot(index: number) {
    setScreenshots((prev) => prev.filter((_, i) => i !== index))
    setScreenshotFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: ServiceFormValues) {
    setSubmitting(true)
    setSubmitError(null)
    const supabase = createClient()

    try {
      let thumbnailUrl = initialData?.thumbnail_url || null
      if (thumbnailFile) {
        thumbnailUrl = await uploadImage(thumbnailFile, `${userId}/thumbnails`)
        if (!thumbnailUrl) {
          setSubmitError('サムネイルのアップロードに失敗しました。')
          return
        }
      }

      const screenshotUrls: string[] = []
      for (const file of screenshotFiles) {
        const url = await uploadImage(file, `${userId}/screenshots`)
        if (url) screenshotUrls.push(url)
      }

      // 既存のスクリーンショットURL（Blobじゃないもの）を保持
      const existingScreenshots = screenshots.filter((s) => !s.startsWith('blob:'))
      const allScreenshots = [...existingScreenshots, ...screenshotUrls]

      const serviceData = {
        user_id: userId,
        name: data.name,
        tagline: data.tagline,
        description: data.description || null,
        thumbnail_url: thumbnailUrl,
        screenshots: allScreenshots,
        tags,
        categories,
        github_url: data.github_url || null,
        website_url: data.website_url || null,
        app_store_url: data.app_store_url || null,
        google_play_url: data.google_play_url || null,
        status: data.status,
        updated_at: new Date().toISOString(),
      }

      const categoriesMigrationHint =
        'カテゴリを保存できませんでした。Supabase の SQL Editor で次を実行してください: ' +
        "ALTER TABLE public.services ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}'; " +
        "NOTIFY pgrst, 'reload schema';"

      function formatSaveError(message: string) {
        if (/categories/i.test(message)) return categoriesMigrationHint
        return message
      }

      const client = supabase as any

      if (initialData?.id) {
        const { data: updated, error } = await client
          .from('services')
          .update(serviceData)
          .eq('id', initialData.id)
          .select('id, categories')
          .single()
        if (error) {
          setSubmitError(`更新に失敗しました: ${formatSaveError(error.message)}`)
          return
        }
        if (
          categories.length > 0 &&
          (!updated?.categories || updated.categories.length === 0)
        ) {
          setSubmitError(categoriesMigrationHint)
          return
        }
        router.push(`/services/${initialData.id}`)
      } else {
        const { data: newService, error } = await client
          .from('services')
          .insert(serviceData)
          .select('id, categories')
          .single()
        if (error) {
          setSubmitError(`投稿に失敗しました: ${formatSaveError(error.message)}`)
          return
        }
        if (!newService?.id) {
          setSubmitError('投稿に失敗しました。時間をおいて再度お試しください。')
          return
        }
        if (
          categories.length > 0 &&
          (!newService.categories || newService.categories.length === 0)
        ) {
          setSubmitError(categoriesMigrationHint)
          return
        }
        router.push(`/services/${newService.id}`)
      }
      router.refresh()
    } catch (err) {
      console.error(err)
      setSubmitError(
        err instanceof Error ? err.message : '予期しないエラーが発生しました。'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 基本情報 */}
      <Card className="p-6 space-y-5">
        <h2 className="font-semibold text-nl-text text-lg">基本情報</h2>
        <Input
          label="サービス名 *"
          placeholder=""
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="キャッチコピー *"
          placeholder=""
          hint="50文字以内"
          error={errors.tagline?.message}
          {...register('tagline')}
        />
        <Textarea
          label="説明"
          placeholder=""
          rows={5}
          error={errors.description?.message}
          {...register('description')}
        />
        {/* タグ / カテゴリ / 開発状況 — PC 3列 */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormAccordion
              label="タグを選択"
              count={tags.length}
              open={tagAccOpen}
              onToggle={() => setTagAccOpen((v) => !v)}
              triggerOnly
            />
            <FormAccordion
              label="カテゴリを選択"
              count={categories.length}
              open={catAccOpen}
              onToggle={() => setCatAccOpen((v) => !v)}
              triggerOnly
            />
            <div className="relative">
              <select
                aria-label="開発状況"
                className={cn(
                  'w-full h-[52px] appearance-none rounded-[14px] border bg-white',
                  'border-nl-border pl-4 pr-10',
                  'text-[15px] font-medium text-nl-text',
                  'transition-all duration-200 outline-none',
                  'hover:border-nl-primary',
                  'focus:border-nl-primary focus:shadow-nl-focus'
                )}
                {...register('status')}
              >
                <option value="developing">開発中</option>
                <option value="beta">ベータ</option>
                <option value="published">公開中</option>
                <option value="paused">休止中</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nl-muted" />
            </div>
          </div>

          {/* 選択済みチップ（閉じているとき） */}
          {tags.length > 0 && !tagAccOpen && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <TagChip
                  key={tag}
                  variant="removable"
                  label={tag}
                  onRemove={() => setTags((prev) => prev.filter((t) => t !== tag))}
                />
              ))}
            </div>
          )}
          {categories.length > 0 && !catAccOpen && (
            <div className="flex flex-wrap gap-2">
              {getCategoriesByIds(categories).map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-nl-primary/10 text-nl-primary"
                >
                  {cat.emoji} {cat.label}
                  <button
                    type="button"
                    onClick={() => setCategories((prev) => prev.filter((c) => c !== cat.id))}
                    className="text-nl-primary hover:text-nl-primary leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* 展開パネル（横幅いっぱい） */}
          {tagAccOpen && (
            <div className="bg-nl-beige rounded-nl-card border border-nl-card-border p-4">
              <TagAutocomplete
                value={tags}
                onChange={setTags}
                hideChips
                hint="技術スタックや特徴を追加してください（最大10個）"
              />
            </div>
          )}
          {catAccOpen && (
            <div className="bg-nl-beige rounded-nl-card border border-nl-card-border p-4">
              <div className="flex flex-wrap gap-2">
                {SERVICE_CATEGORIES.map((cat) => {
                  const selected = categories.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setCategories((prev) =>
                          selected ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]
                        )
                      }
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                        selected
                          ? 'bg-nl-primary text-white'
                          : 'bg-white border border-nl-card-border text-nl-muted hover:border-nl-primary hover:text-nl-primary'
                      )}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* メディア */}
      <Card className="p-6 space-y-5">
        <h2 className="font-semibold text-nl-text text-lg">メディア</h2>

        {/* Thumbnail */}
        <div>
          <label className="text-sm font-medium text-nl-text block mb-1.5">
            サムネイル
          </label>
          <div className="relative">
            {thumbnail ? (
              <div className="relative aspect-[16/9] rounded-nl-input overflow-hidden bg-nl-beige">
                <Image src={thumbnail} alt="サムネイル" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => { setThumbnail(null); setThumbnailFile(null) }}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-all duration-200"
                >
                  <X className="w-4 h-4 text-nl-muted" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[16/9] rounded-nl-input border-2 border-dashed border-nl-card-border hover:border-nl-primary/40 cursor-pointer transition-all duration-200 bg-nl-beige/50 hover:bg-nl-beige">
                <Upload className="w-8 h-8 text-nl-muted/50 mb-2" />
                <span className="text-sm text-nl-muted">クリックして画像をアップロード</span>
                <span className="text-xs text-nl-muted/60 mt-1">PNG, JPG, WebP (最大5MB)</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
              </label>
            )}
          </div>
        </div>

        {/* Screenshots */}
        <div>
          <label className="text-sm font-medium text-nl-text block mb-1.5">
            スクリーンショット
            <span className="text-xs text-nl-muted ml-2 font-normal">最大6枚</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {screenshots.map((src, i) => (
              <div key={i} className="relative aspect-video rounded-nl-input overflow-hidden bg-nl-beige">
                <Image src={src} alt={`スクリーンショット${i + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeScreenshot(i)}
                  className="absolute top-1.5 right-1.5 p-1 bg-white/80 rounded-full hover:bg-white transition-all duration-200"
                >
                  <X className="w-3 h-3 text-nl-muted" />
                </button>
              </div>
            ))}
            {screenshots.length < 6 && (
              <label className="flex flex-col items-center justify-center aspect-video rounded-nl-input border-2 border-dashed border-nl-card-border hover:border-nl-primary/40 cursor-pointer transition-all duration-200 bg-nl-beige/50 hover:bg-nl-beige">
                <Upload className="w-5 h-5 text-nl-muted/50 mb-1" />
                <span className="text-xs text-nl-muted">追加</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleScreenshotChange}
                />
              </label>
            )}
          </div>
        </div>
      </Card>

      {/* リンク */}
      <Card className="p-6 space-y-5">
        <h2 className="font-semibold text-nl-text text-lg">リンク</h2>
        <Input
          label="Webサイト"
          placeholder=""
          error={errors.website_url?.message}
          {...register('website_url')}
        />
        <Input
          label="GitHub"
          placeholder=""
          error={errors.github_url?.message}
          {...register('github_url')}
        />
        <Input
          label="App Store"
          placeholder=""
          error={errors.app_store_url?.message}
          {...register('app_store_url')}
        />
        <Input
          label="Google Play"
          placeholder=""
          error={errors.google_play_url?.message}
          {...register('google_play_url')}
        />
      </Card>

      {/* Submit */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-nl-input px-4 py-3">
          {submitError}
        </div>
      )}
      {Object.keys(errors).length > 0 && !submitError && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-nl-input px-4 py-3">
          入力内容を確認してください。未入力や形式エラーがある項目があります。
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          キャンセル
        </Button>
        <Button type="submit" loading={submitting}>
          {initialData?.id ? '更新する' : '投稿する'}
        </Button>
      </div>
    </form>
  )
}

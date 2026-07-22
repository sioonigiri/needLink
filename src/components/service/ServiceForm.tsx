'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { TagInput } from '@/components/ui/TagInput'
import { ServiceStatus } from '@/types'

const serviceSchema = z.object({
  name: z.string().min(1, 'サービス名は必須です').max(50, '50文字以内で入力してください'),
  tagline: z.string().min(1, 'キャッチコピーは必須です').max(100, '100文字以内で入力してください'),
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
  initialData?: Partial<ServiceFormValues & { id: string; thumbnail_url: string; screenshots: string[]; tags: string[] }>
}

export function ServiceForm({ userId, initialData }: ServiceFormProps) {
  const router = useRouter()
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [thumbnail, setThumbnail] = useState<string | null>(initialData?.thumbnail_url || null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [screenshots, setScreenshots] = useState<string[]>(initialData?.screenshots || [])
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

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
    const supabase = createClient()

    try {
      let thumbnailUrl = initialData?.thumbnail_url || null
      if (thumbnailFile) {
        thumbnailUrl = await uploadImage(thumbnailFile, `${userId}/thumbnails`)
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
        github_url: data.github_url || null,
        website_url: data.website_url || null,
        app_store_url: data.app_store_url || null,
        google_play_url: data.google_play_url || null,
        status: data.status,
        updated_at: new Date().toISOString(),
      }

      if (initialData?.id) {
        await (supabase as any)
          .from('services')
          .update(serviceData)
          .eq('id', initialData.id)
        router.push(`/services/${initialData.id}`)
      } else {
        const { data: newService } = await (supabase as any)
          .from('services')
          .insert(serviceData)
          .select()
          .single()
        if (newService) router.push(`/services/${newService.id}`)
      }
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* 基本情報 */}
      <section className="bg-white rounded-2xl border border-cream-300 p-6 space-y-5">
        <h2 className="font-semibold text-ink-800 text-lg">基本情報</h2>
        <Input
          label="サービス名 *"
          placeholder="例: MyAwesomeApp"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="キャッチコピー *"
          placeholder="例: チームのタスク管理をシンプルに"
          hint="100文字以内でサービスの魅力を一言で"
          error={errors.tagline?.message}
          {...register('tagline')}
        />
        <Textarea
          label="説明"
          placeholder="サービスの概要、作った背景、使い方などを自由に書いてください"
          rows={5}
          error={errors.description?.message}
          {...register('description')}
        />
        <TagInput
          label="タグ"
          value={tags}
          onChange={setTags}
          placeholder="例: React, 生産性, タスク管理"
          hint="Enterまたはカンマで追加（最大10個）"
        />
        <div>
          <label className="text-sm font-medium text-ink-700 block mb-1.5">開発状況</label>
          <select
            className="w-full px-3.5 py-2.5 rounded-xl border border-cream-400 focus:border-warm-400 focus:ring-2 focus:ring-warm-400/20 outline-none bg-white text-ink-800"
            {...register('status')}
          >
            <option value="developing">開発中</option>
            <option value="beta">ベータ</option>
            <option value="published">公開中</option>
            <option value="paused">休止中</option>
          </select>
        </div>
      </section>

      {/* メディア */}
      <section className="bg-white rounded-2xl border border-cream-300 p-6 space-y-5">
        <h2 className="font-semibold text-ink-800 text-lg">メディア</h2>

        {/* Thumbnail */}
        <div>
          <label className="text-sm font-medium text-ink-700 block mb-1.5">
            サムネイル
          </label>
          <div className="relative">
            {thumbnail ? (
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-cream-100">
                <Image src={thumbnail} alt="サムネイル" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => { setThumbnail(null); setThumbnailFile(null) }}
                  className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4 text-ink-600" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-[16/9] rounded-xl border-2 border-dashed border-cream-300 hover:border-warm-300 cursor-pointer transition-colors bg-cream-50 hover:bg-warm-50">
                <Upload className="w-8 h-8 text-ink-300 mb-2" />
                <span className="text-sm text-ink-400">クリックして画像をアップロード</span>
                <span className="text-xs text-ink-300 mt-1">PNG, JPG, WebP (最大5MB)</span>
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
          <label className="text-sm font-medium text-ink-700 block mb-1.5">
            スクリーンショット
            <span className="text-xs text-ink-400 ml-2 font-normal">最大6枚</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {screenshots.map((src, i) => (
              <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-cream-100">
                <Image src={src} alt={`スクリーンショット${i + 1}`} fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeScreenshot(i)}
                  className="absolute top-1.5 right-1.5 p-1 bg-white/80 rounded-full hover:bg-white transition-colors"
                >
                  <X className="w-3 h-3 text-ink-600" />
                </button>
              </div>
            ))}
            {screenshots.length < 6 && (
              <label className="flex flex-col items-center justify-center aspect-video rounded-xl border-2 border-dashed border-cream-300 hover:border-warm-300 cursor-pointer transition-colors bg-cream-50 hover:bg-warm-50">
                <Upload className="w-5 h-5 text-ink-300 mb-1" />
                <span className="text-xs text-ink-400">追加</span>
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
      </section>

      {/* リンク */}
      <section className="bg-white rounded-2xl border border-cream-300 p-6 space-y-5">
        <h2 className="font-semibold text-ink-800 text-lg">リンク</h2>
        <Input
          label="Webサイト"
          placeholder="https://example.com"
          error={errors.website_url?.message}
          {...register('website_url')}
        />
        <Input
          label="GitHub"
          placeholder="https://github.com/username/repo"
          error={errors.github_url?.message}
          {...register('github_url')}
        />
        <Input
          label="App Store"
          placeholder="https://apps.apple.com/..."
          error={errors.app_store_url?.message}
          {...register('app_store_url')}
        />
        <Input
          label="Google Play"
          placeholder="https://play.google.com/..."
          error={errors.google_play_url?.message}
          {...register('google_play_url')}
        />
      </section>

      {/* Submit */}
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

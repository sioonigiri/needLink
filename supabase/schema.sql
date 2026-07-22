-- NeedLink Phase 1 Database Schema
-- Supabaseのダッシュボード > SQL Editor で実行してください

-- ============================================================
-- 1. プロフィールテーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  tech_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. サービステーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  screenshots TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  github_url TEXT,
  website_url TEXT,
  app_store_url TEXT,
  google_play_url TEXT,
  status TEXT DEFAULT 'developing' CHECK (status IN ('developing', 'beta', 'published', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. お気に入りテーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

-- ============================================================
-- 4. フォローテーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- ============================================================
-- Row Level Security (RLS) の設定
-- ============================================================

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "プロフィールは誰でも閲覧可能"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "自分のプロフィールのみ作成可能"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "自分のプロフィールのみ更新可能"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "サービスは誰でも閲覧可能"
  ON public.services FOR SELECT USING (true);

CREATE POLICY "ログイン済みユーザーがサービスを作成可能"
  ON public.services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "自分のサービスのみ更新可能"
  ON public.services FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "自分のサービスのみ削除可能"
  ON public.services FOR DELETE
  USING (auth.uid() = user_id);

-- favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "お気に入りは誰でも閲覧可能"
  ON public.favorites FOR SELECT USING (true);

CREATE POLICY "自分のお気に入りのみ作成可能"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "自分のお気に入りのみ削除可能"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "フォローは誰でも閲覧可能"
  ON public.follows FOR SELECT USING (true);

CREATE POLICY "自分のフォローのみ作成可能"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "自分のフォローのみ削除可能"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================================
-- Storage Buckets の作成
-- ============================================================
-- Supabaseダッシュボード > Storage で以下を作成してください：
-- 1. "avatars" bucket (Public)
-- 2. "service-images" bucket (Public)

-- または以下のSQLで作成:
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "アバターは誰でも閲覧可能"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "認証済みユーザーがアバターをアップロード可能"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "自分のアバターのみ更新可能"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "サービス画像は誰でも閲覧可能"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'service-images');

CREATE POLICY "認証済みユーザーがサービス画像をアップロード可能"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'service-images' AND auth.role() = 'authenticated');

-- ============================================================
-- 自動プロフィール作成トリガー（任意）
-- ============================================================
-- 新規ユーザー登録時に自動的にプロフィールスロットを確保したい場合
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   -- ユーザーは自分でプロフィールを設定する方式なのでトリガーは不要
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

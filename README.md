# NeedLink

> 作ったものが、人と仕事と次のサービスをつなぐ。

個人開発者がサービスを公開・発見できるプラットフォームです。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseの設定

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `supabase/schema.sql` をSQL Editorで実行
3. Authentication > Providers で Google を有効化（任意）
4. Storage で `avatars` と `service-images` バケットを作成（Publicに設定）

### 3. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成し、Supabaseの値を設定：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

## デプロイ（Vercel）

1. GitHubにプッシュ
2. [Vercel](https://vercel.com) でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **認証・DB**: Supabase
- **フォーム**: React Hook Form + Zod
- **デプロイ**: Vercel

## Phase 1 機能

- ✅ メール認証 / Google ログイン
- ✅ プロフィール設定
- ✅ サービス投稿・編集
- ✅ サムネイル・スクリーンショット
- ✅ タグ機能
- ✅ 一覧ページ（カード形式）
- ✅ サービス詳細ページ
- ✅ 検索機能
- ✅ お気に入り機能
- ✅ フォロー機能
- ✅ レスポンシブ対応

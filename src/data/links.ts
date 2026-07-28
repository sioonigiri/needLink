export interface LinkService {
  /** 一意ID（DBに保存される値） */
  id: string
  /** 表示名 */
  label: string
  /** 絵文字アイコン */
  emoji: string
  /** URL入力欄のプレースホルダー */
  placeholder: string
}

export interface ProfileLink {
  type: string
  url: string
}

/**
 * サポートするリンクサービス一覧。
 * 今後ここにエントリーを追加するだけで新サービスに対応できます。
 */
export const LINK_SERVICES: LinkService[] = [
  { id: 'website',      label: 'Website',      emoji: '🌐', placeholder: 'https://yoursite.com' },
  { id: 'github',       label: 'GitHub',        emoji: '🐙', placeholder: 'https://github.com/username' },
  { id: 'twitter',      label: 'X',             emoji: '✕',  placeholder: 'https://x.com/username' },
  { id: 'instagram',    label: 'Instagram',     emoji: '📷', placeholder: 'https://instagram.com/username' },
  { id: 'linkedin',     label: 'LinkedIn',      emoji: '💼', placeholder: 'https://linkedin.com/in/username' },
  { id: 'qiita',        label: 'Qiita',         emoji: '📘', placeholder: 'https://qiita.com/username' },
  { id: 'zenn',         label: 'Zenn',          emoji: '📖', placeholder: 'https://zenn.dev/username' },
  { id: 'youtube',      label: 'YouTube',       emoji: '▶️', placeholder: 'https://youtube.com/@channel' },
  { id: 'tiktok',       label: 'TikTok',        emoji: '🎵', placeholder: 'https://tiktok.com/@username' },
  { id: 'discord',      label: 'Discord',       emoji: '💬', placeholder: 'https://discord.gg/invite' },
  { id: 'producthunt',  label: 'Product Hunt',  emoji: '🚀', placeholder: 'https://producthunt.com/@username' },
  { id: 'appstore',     label: 'App Store',     emoji: '🍎', placeholder: 'https://apps.apple.com/...' },
  { id: 'googleplay',   label: 'Google Play',   emoji: '▶',  placeholder: 'https://play.google.com/...' },
  // Phase 2+ で追加予定
  { id: 'threads',      label: 'Threads',       emoji: '@',  placeholder: 'https://threads.net/@username' },
  { id: 'bluesky',      label: 'Bluesky',       emoji: '🦋', placeholder: 'https://bsky.app/profile/username' },
  { id: 'note',         label: 'note',          emoji: '📝', placeholder: 'https://note.com/username' },
  { id: 'dribbble',     label: 'Dribbble',      emoji: '🏀', placeholder: 'https://dribbble.com/username' },
  { id: 'behance',      label: 'Behance',       emoji: '🎨', placeholder: 'https://behance.net/username' },
  { id: 'figma',        label: 'Figma',         emoji: '🖼',  placeholder: 'https://figma.com/@username' },
]

/** ID から LinkService を取得 */
export function getLinkService(id: string): LinkService | undefined {
  return LINK_SERVICES.find((s) => s.id === id)
}

/** 旧カラム形式からProfileLink配列へ変換（後方互換） */
export function migrateOldLinks(data: {
  github_url?: string | null
  twitter_url?: string | null
  website_url?: string | null
}): ProfileLink[] {
  const links: ProfileLink[] = []
  if (data.github_url)  links.push({ type: 'github',  url: data.github_url })
  if (data.twitter_url) links.push({ type: 'twitter', url: data.twitter_url })
  if (data.website_url) links.push({ type: 'website', url: data.website_url })
  return links
}

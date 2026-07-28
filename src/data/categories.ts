export interface ServiceCategory {
  id: string
  label: string
  emoji: string
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'ai',         label: 'AI',             emoji: '🤖' },
  { id: 'business',   label: 'ビジネス',         emoji: '💼' },
  { id: 'dev',        label: '開発',             emoji: '⚙️' },
  { id: 'education',  label: '教育',             emoji: '📚' },
  { id: 'game',       label: 'エンタメ',          emoji: '🎮' },
  { id: 'sns',        label: 'SNS・コミュニティ',  emoji: '💬' },
  { id: 'shopping',   label: 'ショッピング',        emoji: '🛍️' },
  { id: 'finance',    label: 'ファイナンス',        emoji: '💰' },
  { id: 'lifestyle',  label: 'ライフスタイル',      emoji: '❤️' },
  { id: 'tool',       label: 'ツール・ユーティリティ', emoji: '🛠️' },
  { id: 'other',      label: 'その他',            emoji: '📂' },
]

export function getCategoryById(id: string): ServiceCategory | undefined {
  return SERVICE_CATEGORIES.find((c) => c.id === id)
}

export function getCategoriesByIds(ids: string[]): ServiceCategory[] {
  return ids.map((id) => getCategoryById(id)).filter(Boolean) as ServiceCategory[]
}

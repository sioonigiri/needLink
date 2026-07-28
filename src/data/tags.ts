export interface TagCategory {
  id: string
  label: string
  tags: string[]
}

export const TAG_CATEGORIES: TagCategory[] = [
  {
    id: 'lang',
    label: 'Programming Languages',
    tags: [
      'Java', 'Python', 'JavaScript', 'TypeScript',
      'C', 'C++', 'C#', 'Go', 'Rust',
      'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart',
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    tags: [
      'React', 'Next.js', 'Vue', 'Nuxt', 'Angular',
      'Svelte', 'Tailwind CSS',
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    tags: [
      'Node.js', 'Express', 'Django', 'FastAPI',
      'Spring Boot', 'Laravel', 'Ruby on Rails',
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile',
    tags: ['Flutter', 'React Native', 'SwiftUI', 'Android', 'iOS'],
  },
  {
    id: 'database',
    label: 'Database',
    tags: ['PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Firebase', 'Supabase'],
  },
  {
    id: 'infra',
    label: 'Cloud / Infrastructure',
    tags: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Vercel', 'Cloudflare'],
  },
  {
    id: 'ai',
    label: 'AI',
    tags: ['ChatGPT', 'OpenAI API', 'Claude', 'Gemini', 'LangChain', 'Ollama', 'Stable Diffusion'],
  },
]

/** 全タグのフラット配列 */
export const ALL_TAGS: string[] = TAG_CATEGORIES.flatMap((c) => c.tags)

/** 入力文字列でタグ候補を絞り込み、カテゴリ構造を保って返す */
export function filterTagCategories(
  query: string,
  excludeTags: string[] = [],
): TagCategory[] {
  const q = query.trim().toLowerCase()
  return TAG_CATEGORIES.map((cat) => ({
    ...cat,
    tags: cat.tags.filter(
      (tag) =>
        !excludeTags.includes(tag) &&
        (q === '' || tag.toLowerCase().includes(q)),
    ),
  })).filter((cat) => cat.tags.length > 0)
}

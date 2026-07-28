import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']

export type ProfileLink = { type: string; url: string }

export type ServiceWithProfile = Service & {
  profile: Profile
  favorites_count: number
  is_favorited?: boolean
}

export type ServiceStatus = 'developing' | 'beta' | 'published' | 'paused'

export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  developing: '開発中',
  beta: 'ベータ',
  published: '公開中',
  paused: '休止中',
}

export const SERVICE_STATUS_COLORS: Record<ServiceStatus, string> = {
  developing: 'bg-blue-100 text-blue-700',
  beta: 'bg-amber-100 text-amber-700',
  published: 'bg-green-100 text-green-700',
  paused: 'bg-gray-100 text-gray-600',
}

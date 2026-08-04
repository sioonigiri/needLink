import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Service = Database['public']['Tables']['services']['Row']
export type Favorite = Database['public']['Tables']['favorites']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type Feedback = Database['public']['Tables']['feedback']['Row']
export type DevelopmentLog = Database['public']['Tables']['development_logs']['Row']
export type UpdateHistory = Database['public']['Tables']['update_histories']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type MessageRequest = Database['public']['Tables']['message_requests']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

export type FeedbackWithProfile = Feedback & { profile: Profile }
export type DevelopmentLogWithMeta = DevelopmentLog
export type UpdateHistoryWithMeta = UpdateHistory

export type ConversationWithPeer = Conversation & {
  peer: Profile
  last_message?: Message | null
  unread_count: number
}

export type MessageRequestWithSender = MessageRequest & {
  sender: Profile
}

export type NotificationWithActor = Notification & {
  actor?: Profile | null
}

export type { UserRole } from './roles'
export {
  USER_ROLES,
  DEFAULT_USER_ROLE,
  isUserRole,
  normalizeUserRole,
  canSeeDetailedErrors,
} from './roles'

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

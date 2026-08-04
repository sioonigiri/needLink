export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          slug: string | null
          bio: string | null
          avatar_url: string | null
          github_url: string | null
          twitter_url: string | null
          website_url: string | null
          tech_tags: string[]
          links: Array<{ type: string; url: string }>
          /** user | developer | admin */
          role: 'user' | 'developer' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          slug?: string | null
          bio?: string | null
          avatar_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          tech_tags?: string[]
          links?: Array<{ type: string; url: string }>
          role?: 'user' | 'developer' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          slug?: string | null
          bio?: string | null
          avatar_url?: string | null
          github_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          tech_tags?: string[]
          links?: Array<{ type: string; url: string }>
          role?: 'user' | 'developer' | 'admin'
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          user_id: string
          name: string
          tagline: string
          description: string | null
          thumbnail_url: string | null
          screenshots: string[]
          tags: string[]
          categories: string[]
          github_url: string | null
          website_url: string | null
          app_store_url: string | null
          google_play_url: string | null
          status: 'developing' | 'beta' | 'published' | 'paused'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          tagline: string
          description?: string | null
          thumbnail_url?: string | null
          screenshots?: string[]
          tags?: string[]
          categories?: string[]
          github_url?: string | null
          website_url?: string | null
          app_store_url?: string | null
          google_play_url?: string | null
          status?: 'developing' | 'beta' | 'published' | 'paused'
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          tagline?: string
          description?: string | null
          thumbnail_url?: string | null
          screenshots?: string[]
          tags?: string[]
          categories?: string[]
          github_url?: string | null
          website_url?: string | null
          app_store_url?: string | null
          google_play_url?: string | null
          status?: 'developing' | 'beta' | 'published' | 'paused'
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          service_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          service_id: string
          created_at?: string
        }
        Update: never
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: never
      }
      feedback: {
        Row: {
          id: string
          service_id: string
          user_id: string
          body: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          user_id: string
          body: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          body?: string
          updated_at?: string
        }
      }
      development_logs: {
        Row: {
          id: string
          service_id: string
          user_id: string
          body: string
          logged_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          user_id: string
          body: string
          logged_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          body?: string
          logged_at?: string
          updated_at?: string
        }
      }
      update_histories: {
        Row: {
          id: string
          service_id: string
          user_id: string
          version: string
          body: string
          released_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          service_id: string
          user_id: string
          version: string
          body: string
          released_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          version?: string
          body?: string
          released_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          participant_one: string
          participant_two: string
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          participant_one: string
          participant_two: string
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          last_message_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          body: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          body: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          read_at?: string | null
        }
      }
      message_requests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          body: string
          status: 'pending' | 'accepted' | 'rejected'
          conversation_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          body: string
          status?: 'pending' | 'accepted' | 'rejected'
          conversation_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          body?: string
          status?: 'pending' | 'accepted' | 'rejected'
          conversation_id?: string | null
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string | null
          type: 'feedback' | 'dm' | 'message_request'
          title: string
          body: string | null
          link: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id?: string | null
          type: 'feedback' | 'dm' | 'message_request'
          title: string
          body?: string | null
          link?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          read_at?: string | null
        }
      }
    }
  }
}

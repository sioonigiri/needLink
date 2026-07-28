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
    }
  }
}

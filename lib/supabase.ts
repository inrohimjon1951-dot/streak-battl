import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase env variables are not set. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required.')
  }
  _supabase = createClient(url, key, {
    realtime: { params: { eventsPerSecond: 10 } },
  })
  return _supabase
}

// Convenience export - use getSupabase() in server/build contexts
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export type Database = {
  public: {
    Tables: {
      daily_tasks: {
        Row: {
          id: string
          user_id: string
          date: string
          prayer: Record<string, unknown>
          quran: Record<string, unknown>
          hadith: Record<string, unknown>
          podcast: Record<string, unknown>
          book: Record<string, unknown>
          calisthenics: Record<string, unknown>
          zikr: Record<string, unknown>
          completed_count: number
          total_tasks: number
          momentum_points: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['daily_tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['daily_tasks']['Insert']>
      }
      custom_tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          date: string
          completed: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['custom_tasks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['custom_tasks']['Insert']>
      }
      reactions: {
        Row: {
          id: string
          from_user: string
          to_user: string
          task_type: string
          emoji: string
          date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['reactions']['Row'], 'id' | 'created_at'>
        Update: never
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          total_completed_days: number
          last_completed_date: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['streaks']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['streaks']['Insert']>
      }
    }
  }
}

export type UserID = 'muhammadyusuf' | 'shavkatjon'

export interface User {
  id: UserID
  name: string
  displayName: string
  color: 'cyan' | 'red'
  initials: string
}

export const USERS: Record<UserID, User> = {
  muhammadyusuf: {
    id: 'muhammadyusuf',
    name: 'Muhammadyusuf',
    displayName: 'MUHAMMADYUSUF',
    color: 'cyan',
    initials: 'MY',
  },
  shavkatjon: {
    id: 'shavkatjon',
    name: 'Shavkatjon',
    displayName: 'SHAVKATJON',
    color: 'red',
    initials: 'SH',
  },
}

export interface PrayerEntry {
  fajr: boolean
  dhuhr: boolean
  asr: boolean
  maghrib: boolean
  isha: boolean
  fajr_time?: string
  dhuhr_time?: string
  asr_time?: string
  maghrib_time?: string
  isha_time?: string
}

export interface QuranEntry {
  surah_name: string
  ayah_from: number
  ayah_to: number
  completed: boolean
}

export interface HadithEntry {
  text: string
  explained: boolean
  completed: boolean
}

export interface PodcastEntry {
  title: string
  link: string
  summary: string
  completed: boolean
}

export interface BookEntry {
  title: string
  author: string
  pages_from: number
  pages_to: number
  completed: boolean
}

export interface CalisthenicsEntry {
  exercises: string
  completed: boolean
}

export interface ZikrEntry {
  subhanallah: number
  alhamdulillah: number
  allahuakbar: number
  completed: boolean
}

export interface DailyTask {
  id: string
  user_id: UserID
  date: string
  prayer: PrayerEntry
  quran: QuranEntry
  hadith: HadithEntry
  podcast: PodcastEntry
  book: BookEntry
  calisthenics: CalisthenicsEntry
  zikr: ZikrEntry
  completed_count: number
  total_tasks: number
  momentum_points: number
}

export interface CustomTask {
  id: string
  user_id: UserID
  title: string
  date: string
  completed: boolean
  created_at: string
}

export interface Reaction {
  id: string
  from_user: UserID
  to_user: UserID
  task_type: string
  emoji: string
  date: string
  created_at: string
}

export interface StreakData {
  user_id: UserID
  current_streak: number
  longest_streak: number
  total_completed_days: number
  last_completed_date: string | null
}

export interface PrayerTimes {
  Fajr: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

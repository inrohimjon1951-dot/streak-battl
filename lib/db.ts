import { supabase } from './supabase'
import { UserID, DailyTask, CustomTask, Reaction, StreakData } from '@/types'
import { format } from 'date-fns'

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

// ─── DEFAULT TASK STRUCTURE ─────────────────────────────────────────────────
export function defaultDailyTask(userId: UserID, date: string): Omit<DailyTask, 'id'> {
  return {
    user_id: userId,
    date,
    prayer: {
      fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false,
      fajr_time: undefined, dhuhr_time: undefined, asr_time: undefined, maghrib_time: undefined, isha_time: undefined,
    },
    quran: { surah_name: '', ayah_from: 0, ayah_to: 0, completed: false },
    hadith: { text: '', explained: false, completed: false },
    podcast: { title: '', link: '', summary: '', completed: false },
    book: { title: '', author: '', pages_from: 0, pages_to: 0, completed: false },
    calisthenics: { exercises: '', completed: false },
    zikr: { subhanallah: 0, alhamdulillah: 0, allahuakbar: 0, completed: false },
    completed_count: 0,
    total_tasks: 7,
    momentum_points: 0,
  }
}

// ─── DAILY TASKS ─────────────────────────────────────────────────────────────
export async function getDailyTask(userId: UserID, date?: string): Promise<DailyTask | null> {
  const d = date || todayStr()
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', d)
    .single()

  if (error || !data) return null
  return data as DailyTask
}

export async function upsertDailyTask(task: Partial<DailyTask> & { user_id: UserID; date: string }): Promise<DailyTask | null> {
  const { data, error } = await supabase
    .from('daily_tasks')
    .upsert(task, { onConflict: 'user_id,date' })
    .select()
    .single()

  if (error) { console.error('upsertDailyTask:', error); return null }
  return data as DailyTask
}

export async function getWeeklyTasks(userId: UserID): Promise<DailyTask[]> {
  const { data } = await supabase
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(7)

  return (data || []) as DailyTask[]
}

// ─── CUSTOM TASKS ─────────────────────────────────────────────────────────────
export async function getCustomTasks(userId: UserID, date?: string): Promise<CustomTask[]> {
  const d = date || todayStr()
  const { data } = await supabase
    .from('custom_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('date', d)
    .order('created_at', { ascending: true })

  return (data || []) as CustomTask[]
}

export async function addCustomTask(userId: UserID, title: string): Promise<CustomTask | null> {
  const { data, error } = await supabase
    .from('custom_tasks')
    .insert({ user_id: userId, title, date: todayStr(), completed: false })
    .select()
    .single()

  if (error) { console.error('addCustomTask:', error); return null }
  return data as CustomTask
}

export async function toggleCustomTask(id: string, completed: boolean): Promise<void> {
  await supabase.from('custom_tasks').update({ completed }).eq('id', id)
}

export async function deleteCustomTask(id: string): Promise<void> {
  await supabase.from('custom_tasks').delete().eq('id', id)
}

// ─── REACTIONS ────────────────────────────────────────────────────────────────
export async function addReaction(
  fromUser: UserID,
  toUser: UserID,
  taskType: string,
  emoji: string
): Promise<void> {
  await supabase.from('reactions').insert({
    from_user: fromUser,
    to_user: toUser,
    task_type: taskType,
    emoji,
    date: todayStr(),
  })
}

export async function getTodayReactions(toUser: UserID): Promise<Reaction[]> {
  const { data } = await supabase
    .from('reactions')
    .select('*')
    .eq('to_user', toUser)
    .eq('date', todayStr())
    .order('created_at', { ascending: false })
    .limit(20)

  return (data || []) as Reaction[]
}

// ─── STREAKS ──────────────────────────────────────────────────────────────────
export async function getStreak(userId: UserID): Promise<StreakData | null> {
  const { data } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  return data as StreakData | null
}

export async function updateStreak(userId: UserID, completedToday: boolean): Promise<void> {
  const existing = await getStreak(userId)
  const today = todayStr()

  if (!existing) {
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: completedToday ? 1 : 0,
      longest_streak: completedToday ? 1 : 0,
      total_completed_days: completedToday ? 1 : 0,
      last_completed_date: completedToday ? today : null,
    })
    return
  }

  if (!completedToday) return

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = format(yesterday, 'yyyy-MM-dd')

  const isConsecutive = existing.last_completed_date === yesterdayStr
  const alreadyToday = existing.last_completed_date === today

  if (alreadyToday) return

  const newStreak = isConsecutive ? existing.current_streak + 1 : 1
  const newLongest = Math.max(newStreak, existing.longest_streak)

  await supabase.from('streaks').update({
    current_streak: newStreak,
    longest_streak: newLongest,
    total_completed_days: existing.total_completed_days + 1,
    last_completed_date: today,
  }).eq('user_id', userId)
}

// ─── MOMENTUM CALCULATION ─────────────────────────────────────────────────────
export function calculateMomentum(task: Partial<DailyTask>, streakDays: number): number {
  let points = 0
  const prayer = task.prayer as Record<string, boolean> | undefined
  if (prayer) {
    const prayersDone = ['fajr','dhuhr','asr','maghrib','isha'].filter(p => prayer[p]).length
    points += prayersDone * 20
  }
  if ((task.quran as { completed?: boolean })?.completed) points += 30
  if ((task.hadith as { completed?: boolean })?.completed) points += 25
  if ((task.podcast as { completed?: boolean })?.completed) points += 15
  if ((task.book as { completed?: boolean })?.completed) points += 20
  if ((task.calisthenics as { completed?: boolean })?.completed) points += 20
  if ((task.zikr as { completed?: boolean })?.completed) points += 15

  // Streak multiplier
  if (streakDays >= 7) points = Math.floor(points * 2)
  else if (streakDays >= 3) points = Math.floor(points * 1.5)

  return points
}

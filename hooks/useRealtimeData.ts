'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getDailyTask, getCustomTasks, getTodayReactions, getStreak, upsertDailyTask, defaultDailyTask, todayStr } from '@/lib/db'
import { DailyTask, CustomTask, Reaction, StreakData, UserID } from '@/types'

export interface RealtimeState {
  myTask: DailyTask | null
  partnerTask: DailyTask | null
  myCustomTasks: CustomTask[]
  partnerCustomTasks: CustomTask[]
  myReactions: Reaction[]
  partnerReactions: Reaction[]
  myStreak: StreakData | null
  partnerStreak: StreakData | null
  isLoading: boolean
  error: string | null
  lastUpdate: Date | null
}

export function useRealtimeData(myId: UserID, partnerId: UserID) {
  const [state, setState] = useState<RealtimeState>({
    myTask: null, partnerTask: null,
    myCustomTasks: [], partnerCustomTasks: [],
    myReactions: [], partnerReactions: [],
    myStreak: null, partnerStreak: null,
    isLoading: true, error: null, lastUpdate: null,
  })

  const fetchAll = useCallback(async () => {
    try {
      const today = todayStr()
      const [myTask, partnerTask, myCustom, partnerCustom, myReactions, partnerReactions, myStreak, partnerStreak] =
        await Promise.all([
          getDailyTask(myId, today).catch(() => null),
          getDailyTask(partnerId, today).catch(() => null),
          getCustomTasks(myId, today).catch(() => []),
          getCustomTasks(partnerId, today).catch(() => []),
          getTodayReactions(myId).catch(() => []),
          getTodayReactions(partnerId).catch(() => []),
          getStreak(myId).catch(() => null),
          getStreak(partnerId).catch(() => null),
        ])

      let finalMyTask = myTask
      if (!myTask) {
        finalMyTask = await upsertDailyTask(defaultDailyTask(myId, today)).catch(() => null)
      }
      let finalPartnerTask = partnerTask
      if (!partnerTask) {
        finalPartnerTask = await upsertDailyTask(defaultDailyTask(partnerId, today)).catch(() => null)
      }

      setState(prev => ({
        ...prev,
        myTask: finalMyTask,
        partnerTask: finalPartnerTask,
        myCustomTasks: myCustom,
        partnerCustomTasks: partnerCustom,
        myReactions: myReactions,
        partnerReactions: partnerReactions,
        myStreak: myStreak,
        partnerStreak: partnerStreak,
        isLoading: false,
        error: null,
        lastUpdate: new Date(),
      }))
    } catch (err) {
      console.error('fetchAll error:', err)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Supabase ga ulanishda xatolik. Sahifani yangilang.',
      }))
    }
  }, [myId, partnerId])

  useEffect(() => {
    fetchAll()

    try {
      const tasksChannel = supabase
        .channel('daily_tasks_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_tasks' }, (payload) => {
          const updated = payload.new as DailyTask
          if (!updated) return
          setState(prev => ({
            ...prev,
            myTask: updated.user_id === myId ? updated : prev.myTask,
            partnerTask: updated.user_id === partnerId ? updated : prev.partnerTask,
            lastUpdate: new Date(),
          }))
        })
        .subscribe()

      const customChannel = supabase
        .channel('custom_tasks_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'custom_tasks' }, () => {
          Promise.all([
            getCustomTasks(myId, todayStr()).catch(() => []),
            getCustomTasks(partnerId, todayStr()).catch(() => []),
          ]).then(([myCustom, partnerCustom]) => {
            setState(prev => ({ ...prev, myCustomTasks: myCustom, partnerCustomTasks: partnerCustom, lastUpdate: new Date() }))
          })
        })
        .subscribe()

      const reactionsChannel = supabase
        .channel('reactions_changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reactions' }, () => {
          Promise.all([
            getTodayReactions(myId).catch(() => []),
            getTodayReactions(partnerId).catch(() => []),
          ]).then(([myR, partnerR]) => {
            setState(prev => ({ ...prev, myReactions: myR, partnerReactions: partnerR, lastUpdate: new Date() }))
          })
        })
        .subscribe()

      return () => {
        supabase.removeChannel(tasksChannel)
        supabase.removeChannel(customChannel)
        supabase.removeChannel(reactionsChannel)
      }
    } catch (err) {
      console.error('Realtime setup error:', err)
    }
  }, [myId, partnerId, fetchAll])

  const refetch = useCallback(() => { fetchAll() }, [fetchAll])

  return { ...state, refetch }
}

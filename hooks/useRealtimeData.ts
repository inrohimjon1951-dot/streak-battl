'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { getDailyTask, getCustomTasks, getTodayReactions, getStreak, upsertDailyTask, defaultDailyTask, todayStr } from '@/lib/db'
import { DailyTask, CustomTask, Reaction, StreakData, UserID } from '@/types'
import { RealtimeChannel } from '@supabase/supabase-js'

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
  lastUpdate: Date | null
}

export function useRealtimeData(myId: UserID, partnerId: UserID) {
  const [state, setState] = useState<RealtimeState>({
    myTask: null,
    partnerTask: null,
    myCustomTasks: [],
    partnerCustomTasks: [],
    myReactions: [],
    partnerReactions: [],
    myStreak: null,
    partnerStreak: null,
    isLoading: true,
    lastUpdate: null,
  })

  const fetchAll = useCallback(async () => {
    const today = todayStr()
    const [myTask, partnerTask, myCustom, partnerCustom, myReactions, partnerReactions, myStreak, partnerStreak] =
      await Promise.all([
        getDailyTask(myId, today),
        getDailyTask(partnerId, today),
        getCustomTasks(myId, today),
        getCustomTasks(partnerId, today),
        getTodayReactions(myId),
        getTodayReactions(partnerId),
        getStreak(myId),
        getStreak(partnerId),
      ])

    // If my task doesn't exist yet, create it
    let finalMyTask = myTask
    if (!myTask) {
      finalMyTask = await upsertDailyTask(defaultDailyTask(myId, today))
    }
    let finalPartnerTask = partnerTask
    if (!partnerTask) {
      finalPartnerTask = await upsertDailyTask(defaultDailyTask(partnerId, today))
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
      lastUpdate: new Date(),
    }))
  }, [myId, partnerId])

  useEffect(() => {
    fetchAll()

    const channels: RealtimeChannel[] = []

    // Subscribe to daily_tasks changes
    const tasksChannel = supabase
      .channel('daily_tasks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_tasks',
      }, (payload) => {
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
    channels.push(tasksChannel)

    // Subscribe to custom_tasks changes
    const customChannel = supabase
      .channel('custom_tasks_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'custom_tasks',
      }, () => {
        // Refetch custom tasks on any change
        Promise.all([
          getCustomTasks(myId, todayStr()),
          getCustomTasks(partnerId, todayStr()),
        ]).then(([myCustom, partnerCustom]) => {
          setState(prev => ({
            ...prev,
            myCustomTasks: myCustom,
            partnerCustomTasks: partnerCustom,
            lastUpdate: new Date(),
          }))
        })
      })
      .subscribe()
    channels.push(customChannel)

    // Subscribe to reactions
    const reactionsChannel = supabase
      .channel('reactions_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reactions',
      }, () => {
        Promise.all([
          getTodayReactions(myId),
          getTodayReactions(partnerId),
        ]).then(([myR, partnerR]) => {
          setState(prev => ({
            ...prev,
            myReactions: myR,
            partnerReactions: partnerR,
            lastUpdate: new Date(),
          }))
        })
      })
      .subscribe()
    channels.push(reactionsChannel)

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch))
    }
  }, [myId, partnerId, fetchAll])

  const refetch = useCallback(() => {
    fetchAll()
  }, [fetchAll])

  return { ...state, refetch }
}

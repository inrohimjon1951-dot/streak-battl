'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { uz } from 'date-fns/locale'

interface ClockState {
  time: string
  date: string
  countdown: string
  isAM: boolean
}

export function useClock(): ClockState {
  const [state, setState] = useState<ClockState>({
    time: '00:00:00',
    date: '',
    countdown: '00:00:00',
    isAM: true,
  })

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const h = now.getHours()
      const m = now.getMinutes()
      const s = now.getSeconds()

      const timeStr = [h, m, s].map(n => String(n).padStart(2, '0')).join(':')

      // Uzbek date format
      const days = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
      const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
      const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`

      // Countdown to midnight
      const endOfDay = new Date(now)
      endOfDay.setHours(23, 59, 59, 999)
      const remaining = endOfDay.getTime() - now.getTime()
      const rh = Math.floor(remaining / 3600000)
      const rm = Math.floor((remaining % 3600000) / 60000)
      const rs = Math.floor((remaining % 60000) / 1000)
      const countdown = [rh, rm, rs].map(n => String(n).padStart(2, '0')).join(':')

      setState({
        time: timeStr,
        date: dateStr,
        countdown,
        isAM: h >= 5 && h < 18,
      })
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [])

  return state
}

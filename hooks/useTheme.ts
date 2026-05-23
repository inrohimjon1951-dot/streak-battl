'use client'

import { useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

function getAutoTheme(): Theme {
  const hour = new Date().getHours()
  // AM (5:00 - 17:59) = light, PM (18:00 - 4:59) = dark
  return hour >= 5 && hour < 18 ? 'light' : 'dark'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark')
  const [isManual, setIsManual] = useState(false)

  useEffect(() => {
    // Check saved preference
    const saved = localStorage.getItem('streak_theme')
    if (saved === 'dark' || saved === 'light') {
      setTheme(saved as Theme)
      setIsManual(true)
    } else {
      setTheme(getAutoTheme())
    }
  }, [])

  useEffect(() => {
    if (isManual) return
    // Auto-switch every minute based on time
    const interval = setInterval(() => {
      setTheme(getAutoTheme())
    }, 60000)
    return () => clearInterval(interval)
  }, [isManual])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setIsManual(true)
    localStorage.setItem('streak_theme', next)
  }

  const resetToAuto = () => {
    setIsManual(false)
    localStorage.removeItem('streak_theme')
    setTheme(getAutoTheme())
  }

  return { theme, toggleTheme, resetToAuto, isManual }
}

'use client'

import { useState, useEffect } from 'react'
import { PrayerEntry, PrayerTimes } from '@/types'
import { getPrayerTimes, getMinutesLate } from '@/lib/prayer'

interface PrayerTrackerProps {
  prayer: PrayerEntry
  onChange: (updated: PrayerEntry) => void
  color: 'cyan' | 'red'
  readOnly?: boolean
}

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
type PrayerKey = typeof PRAYERS[number]

const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Bomdod', dhuhr: 'Peshin', asr: 'Asr', maghrib: 'Shom', isha: 'Xufton'
}

const PRAYER_TIME_KEY: Record<PrayerKey, keyof PrayerTimes> = {
  fajr: 'Fajr', dhuhr: 'Dhuhr', asr: 'Asr', maghrib: 'Maghrib', isha: 'Isha'
}

export default function PrayerTracker({ prayer, onChange, color, readOnly }: PrayerTrackerProps) {
  const [times, setTimes] = useState<PrayerTimes | null>(null)
  const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
  const glow = color === 'cyan' ? 'var(--cyan-glow)' : 'var(--red-glow)'
  const bg = color === 'cyan' ? 'var(--cyan-bg)' : 'var(--red-bg)'
  const border = color === 'cyan' ? 'var(--cyan-border)' : 'var(--red-border)'

  useEffect(() => {
    getPrayerTimes().then(setTimes).catch(() => {})
  }, [])

  const toggle = (key: PrayerKey) => {
    if (readOnly) return
    const nowStr = new Date().toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })
    const newVal = !prayer[key]
    onChange({
      ...prayer,
      [key]: newVal,
      [`${key}_time`]: newVal ? nowStr : undefined,
    })
  }

  const done = PRAYERS.filter(p => prayer[p]).length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-faint)', fontWeight: 600 }}>NAMOZ — VODIL</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: accent, fontWeight: 700 }}>{done}/5</span>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {PRAYERS.map(key => {
          const isDone = !!prayer[key]
          const time = times?.[PRAYER_TIME_KEY[key]] ?? null
          const late = time && !isDone ? getMinutesLate(time) : 0
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              disabled={readOnly}
              style={{
                flex: 1, minHeight: 72, border: `2px solid ${isDone ? border : late > 0 ? 'rgba(255,100,0,0.4)' : 'var(--border)'}`,
                borderRadius: 10, background: isDone ? bg : late > 0 ? 'rgba(255,100,0,0.07)' : 'var(--bg-input)',
                boxShadow: isDone ? `0 0 12px ${glow}` : 'none',
                cursor: readOnly ? 'default' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                transition: 'all 0.2s', padding: '8px 4px',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isDone ? accent : 'transparent',
                border: `2px solid ${isDone ? accent : 'var(--border-hover)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: isDone ? (color === 'cyan' ? '#000' : '#fff') : 'transparent',
              }}>
                {isDone ? '✓' : ''}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: isDone ? accent : late > 0 ? '#ff6400' : 'var(--text-muted)', letterSpacing: 0.5 }}>
                {PRAYER_LABELS[key].slice(0, 3).toUpperCase()}
              </span>
              {time && <span style={{ fontSize: 8, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{time}</span>}
              {late > 0 && !isDone && <span style={{ fontSize: 8, color: '#ff6400', fontWeight: 700 }}>+{late}d</span>}
            </button>
          )
        })}
      </div>

      {!readOnly && (
        <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: 2, fontWeight: 600, marginBottom: 8 }}>📿 ZIKRLAR</div>
          {[['Subhanalloh', '33'], ['Alhamdulilloh', '33'], ['Allohu akbar', '34']].map(([label, count]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent, background: bg, border: `1px solid ${border}`, borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>×{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

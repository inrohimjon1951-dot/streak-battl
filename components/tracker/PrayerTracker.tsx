'use client'

import { useState, useEffect } from 'react'
import { PrayerEntry, PrayerTimes } from '@/types'
import { getPrayerTimes, PRAYER_NAMES_UZ, getMinutesLate } from '@/lib/prayer'

interface PrayerTrackerProps {
  prayer: PrayerEntry
  onChange: (updated: PrayerEntry) => void
  color: 'cyan' | 'red'
  readOnly?: boolean
}

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
type PrayerKey = typeof PRAYERS[number]

export default function PrayerTracker({ prayer, onChange, color, readOnly }: PrayerTrackerProps) {
  const [times, setTimes] = useState<PrayerTimes | null>(null)
  const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
  const glow = color === 'cyan' ? 'var(--cyan-glow)' : 'var(--red-glow)'
  const bg = color === 'cyan' ? 'var(--cyan-bg)' : 'var(--red-bg)'
  const border = color === 'cyan' ? 'var(--cyan-border)' : 'var(--red-border)'

  useEffect(() => {
    getPrayerTimes().then(setTimes)
  }, [])

  const togglePrayer = (key: PrayerKey) => {
    if (readOnly) return
    const nowStr = new Date().toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })
    onChange({
      ...prayer,
      [key]: !prayer[key],
      [`${key}_time`]: !prayer[key] ? nowStr : undefined,
    })
  }

  const donePrayers = PRAYERS.filter(p => prayer[p]).length

  const prayerTimeKey: Record<PrayerKey, keyof PrayerTimes> = {
    fajr: 'Fajr',
    dhuhr: 'Dhuhr',
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha',
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{
          fontSize: 11,
          letterSpacing: 2,
          color: 'var(--text-faint)',
          fontWeight: 600,
          textTransform: 'uppercase',
        }}>
          Namoz vaqtlari — Vodil
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          color: accent,
          fontWeight: 700,
        }}>
          {donePrayers}/5
        </div>
      </div>

      {/* Prayer dots */}
      <div style={{ display: 'flex', gap: 6 }}>
        {PRAYERS.map((key) => {
          const done = prayer[key]
          const time = times ? times[prayerTimeKey[key]] : null
          const lateMins = done && time ? 0 : (time ? getMinutesLate(time) : 0)
          const isLate = !done && lateMins > 0

          return (
            <div
              key={key}
              onClick={() => togglePrayer(key)}
              title={`${PRAYER_NAMES_UZ[prayerTimeKey[key]]}${time ? ` — ${time}` : ''}${isLate ? ` (+${lateMins} daqiqa)` : ''}`}
              style={{
                flex: 1,
                cursor: readOnly ? 'default' : 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {/* Dot */}
              <div style={{
                width: '100%',
                height: 6,
                borderRadius: 3,
                background: done ? accent : (isLate ? 'rgba(255,100,0,0.3)' : 'var(--border)'),
                boxShadow: done ? `0 0 8px ${glow}` : 'none',
                transition: 'all 0.3s ease',
              }} />

              {/* Label */}
              <div style={{
                fontSize: 9,
                letterSpacing: 0.5,
                color: done ? accent : (isLate ? '#ff6400' : 'var(--text-faint)'),
                fontWeight: 600,
                textTransform: 'uppercase',
                textAlign: 'center',
                lineHeight: 1,
              }}>
                {PRAYER_NAMES_UZ[prayerTimeKey[key]].substring(0, 3)}
              </div>

              {/* Time */}
              {time && (
                <div style={{
                  fontSize: 9,
                  color: 'var(--text-faint)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {time}
                </div>
              )}

              {/* Late indicator */}
              {isLate && (
                <div style={{
                  fontSize: 8,
                  color: '#ff6400',
                  fontWeight: 700,
                }}>
                  +{lateMins}d
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Zikr section below prayer */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: 1.5, marginBottom: 6, fontWeight: 600 }}>
          ZIKRLAR
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Subhanalloh × 33 &nbsp;|&nbsp; Alhamdulilloh × 33 &nbsp;|&nbsp; Allohu akbar × 34
        </div>
      </div>
    </div>
  )
}

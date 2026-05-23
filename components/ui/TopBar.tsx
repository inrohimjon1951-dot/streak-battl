'use client'

import { useClock } from '@/hooks/useClock'
import { useTheme } from '@/hooks/useTheme'
import { UserID, USERS } from '@/types'
import { clearSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { StreakData } from '@/types'

interface TopBarProps {
  currentUser: UserID
  myStreak: StreakData | null
  partnerStreak: StreakData | null
  lastUpdate: Date | null
}

export default function TopBar({ currentUser, myStreak, partnerStreak, lastUpdate }: TopBarProps) {
  const { time, date, countdown } = useClock()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  const maxStreak = Math.max(
    myStreak?.current_streak || 0,
    partnerStreak?.current_streak || 0
  )

  const handleLogout = () => {
    clearSession()
    router.replace('/login')
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 24px',
      height: 64,
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
      gap: 16,
    }}>
      {/* Logo */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: 4,
        background: 'linear-gradient(90deg, var(--cyan), var(--red))',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        flexShrink: 0,
      }}>
        STREAK
      </div>

      {/* Center: Clock + Countdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, justifyContent: 'center' }}>
        {/* Clock */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 2,
            color: 'var(--cyan)',
            lineHeight: 1,
          }}>
            {time}
          </div>
          <div style={{
            fontSize: 10,
            letterSpacing: 1.5,
            color: 'var(--text-muted)',
            marginTop: 3,
            fontWeight: 600,
          }}>
            {date}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 36, background: 'var(--border)' }} />

        {/* Countdown */}
        <div style={{
          background: 'rgba(255,23,68,0.1)',
          border: '1px solid rgba(255,23,68,0.3)',
          borderRadius: 10,
          padding: '8px 16px',
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--red)',
            letterSpacing: 2,
            lineHeight: 1,
          }}>
            {countdown}
          </div>
          <div style={{
            fontSize: 9,
            letterSpacing: 2,
            color: 'var(--red-dim)',
            marginTop: 3,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            kun yakuniga qadar
          </div>
        </div>

        {/* Live indicator */}
        {lastUpdate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--live)',
              animation: 'live-dot 1.4s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.5, fontWeight: 600 }}>
              LIVE
            </span>
          </div>
        )}
      </div>

      {/* Right: streak + theme + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {/* Streak badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--gold-bg)',
          border: '1px solid rgba(255,215,0,0.3)',
          borderRadius: 20,
          padding: '6px 14px',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--gold)',
          letterSpacing: 1,
        }}>
          🔥 {maxStreak} KUN
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: '6px 14px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontFamily: 'var(--font-main)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 1,
            transition: 'all 0.2s',
          }}
        >
          {theme === 'dark' ? '☀️ YORUG\'' : '🌙 QORONG\'U'}
        </button>

        {/* User indicator + logout */}
        <button
          onClick={handleLogout}
          title="Chiqish"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: `1.5px solid ${currentUser === 'muhammadyusuf' ? 'var(--cyan-border)' : 'var(--red-border)'}`,
            background: currentUser === 'muhammadyusuf' ? 'var(--cyan-bg)' : 'var(--red-bg)',
            color: currentUser === 'muhammadyusuf' ? 'var(--cyan)' : 'var(--red)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {USERS[currentUser].initials}
        </button>
      </div>
    </div>
  )
}

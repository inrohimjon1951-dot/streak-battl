'use client'

import { useClock } from '@/hooks/useClock'
import { useTheme } from '@/hooks/useTheme'
import { UserID, USERS } from '@/types'
import { clearSession } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { StreakData } from '@/types'
import Link from 'next/link'

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

  const maxStreak = Math.max(myStreak?.current_streak || 0, partnerStreak?.current_streak || 0)

  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '0 16px', height: 60,
      background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100, gap: 12,
    }}>
      {/* Logo */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, letterSpacing: 3, background: 'linear-gradient(90deg, var(--cyan), var(--red))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', flexShrink: 0 }}>
        STREAK
      </div>

      {/* Center */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'center', minWidth: 0 }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--cyan)', lineHeight: 1 }}>{time}</div>
          <div style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 2, letterSpacing: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{date}</div>
        </div>

        <div style={{ background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.3)', borderRadius: 8, padding: '6px 12px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--red)', lineHeight: 1 }}>{countdown}</div>
          <div style={{ fontSize: 8, color: 'var(--red-dim)', marginTop: 2, letterSpacing: 1 }}>YAKUNGA QADAR</div>
        </div>

        {lastUpdate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--live)', animation: 'live-dot 1.4s ease-in-out infinite' }} />
            <span style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: 1.5, fontWeight: 600 }}>LIVE</span>
          </div>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--gold-bg)', border: '1px solid rgba(255,215,0,0.3)', borderRadius: 16, padding: '5px 10px', fontSize: 12, fontWeight: 700, color: 'var(--gold)' }}>
          🔥 {maxStreak}
        </div>

        <Link href="/achievements" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: 11, fontWeight: 600, letterSpacing: 1 }}>
          🏆
        </Link>

        <button onClick={toggleTheme} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        <button onClick={() => { clearSession(); router.replace('/login') }}
          title="Chiqish"
          style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${currentUser === 'muhammadyusuf' ? 'var(--cyan-border)' : 'var(--red-border)'}`, background: currentUser === 'muhammadyusuf' ? 'var(--cyan-bg)' : 'var(--red-bg)', color: currentUser === 'muhammadyusuf' ? 'var(--cyan)' : 'var(--red)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {USERS[currentUser].initials}
        </button>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getStreak, getWeeklyTasks } from '@/lib/db'
import { StreakData, DailyTask, UserID, USERS } from '@/types'
import { useTheme } from '@/hooks/useTheme'
import Link from 'next/link'

export default function AchievementsPage() {
  const router = useRouter()
  const { toggleTheme, theme } = useTheme()
  const [data, setData] = useState<{
    myStreak: StreakData | null
    partnerStreak: StreakData | null
    myWeekly: DailyTask[]
    partnerWeekly: DailyTask[]
    currentUser: UserID | null
  }>({
    myStreak: null, partnerStreak: null,
    myWeekly: [], partnerWeekly: [], currentUser: null,
  })

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/login'); return }
    const myId = session.userId
    const partnerId: UserID = myId === 'muhammadyusuf' ? 'shavkatjon' : 'muhammadyusuf'

    Promise.all([
      getStreak(myId),
      getStreak(partnerId),
      getWeeklyTasks(myId),
      getWeeklyTasks(partnerId),
    ]).then(([myStreak, partnerStreak, myWeekly, partnerWeekly]) => {
      setData({ myStreak, partnerStreak, myWeekly, partnerWeekly, currentUser: myId })
    })
  }, [router])

  const { myStreak, partnerStreak, myWeekly, partnerWeekly, currentUser } = data
  if (!currentUser) return null

  const partnerId: UserID = currentUser === 'muhammadyusuf' ? 'shavkatjon' : 'muhammadyusuf'

  const myMomentumTotal = myWeekly.reduce((a, t) => a + (t.momentum_points || 0), 0)
  const partnerMomentumTotal = partnerWeekly.reduce((a, t) => a + (t.momentum_points || 0), 0)
  const myLeading = myMomentumTotal >= partnerMomentumTotal

  const users: { id: UserID; streak: StreakData | null; weekly: DailyTask[]; momentum: number }[] = [
    { id: currentUser, streak: myStreak, weekly: myWeekly, momentum: myMomentumTotal },
    { id: partnerId, streak: partnerStreak, weekly: partnerWeekly, momentum: partnerMomentumTotal },
  ].sort((a, b) => b.momentum - a.momentum)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 24px', height: 64,
        background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, letterSpacing: 4,
            background: 'linear-gradient(90deg, var(--cyan), var(--red))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>STREAK</div>
          <Link href="/dashboard" style={{
            fontSize: 12, letterSpacing: 2, color: 'var(--text-muted)',
            textDecoration: 'none', fontWeight: 600,
            border: '1px solid var(--border)', borderRadius: 8, padding: '6px 14px',
          }}>
            ← DASHBOARD
          </Link>
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 3, color: 'var(--text-muted)' }}>
          🏆 YUTUQLAR
        </div>
        <button onClick={toggleTheme} style={{
          background: 'var(--bg-panel)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '6px 14px', color: 'var(--text-muted)',
          cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: 12, fontWeight: 600,
        }}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Winner banner */}
        <div style={{
          background: myLeading
            ? 'linear-gradient(135deg, rgba(0,245,255,0.08), rgba(0,245,255,0.03))'
            : 'linear-gradient(135deg, rgba(255,23,68,0.08), rgba(255,23,68,0.03))',
          border: `1px solid ${myLeading ? 'var(--cyan-border)' : 'var(--red-border)'}`,
          borderRadius: 20, padding: '32px', textAlign: 'center', marginBottom: 32,
          boxShadow: `0 0 40px ${myLeading ? 'var(--cyan-glow)' : 'var(--red-glow)'}`,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 4,
            color: myLeading ? 'var(--cyan)' : 'var(--red)', fontWeight: 700, marginBottom: 8,
          }}>
            HOZIRCHA YETAKCHI
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700,
            color: myLeading ? 'var(--cyan)' : 'var(--red)', letterSpacing: 2,
          }}>
            {USERS[users[0].id].displayName}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            {users[0].momentum} Momentum bali bilan
          </div>
        </div>

        {/* Leaderboard */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          {users.map((u, rank) => {
            const user = USERS[u.id]
            const color = user.color
            const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
            const bg = color === 'cyan' ? 'var(--cyan-bg)' : 'var(--red-bg)'
            const border = color === 'cyan' ? 'var(--cyan-border)' : 'var(--red-border)'
            const glow = color === 'cyan' ? 'var(--cyan-glow)' : 'var(--red-glow)'

            const completedDays = u.weekly.filter(t => t.completed_count >= 7).length
            const avgCompletion = u.weekly.length > 0
              ? Math.round(u.weekly.reduce((a, t) => a + (t.completed_count / 7) * 100, 0) / u.weekly.length)
              : 0

            return (
              <div key={u.id} style={{
                background: 'var(--bg-card)', border: `1px solid ${border}`,
                borderRadius: 16, padding: '24px',
                boxShadow: rank === 0 ? `0 0 24px ${glow}` : 'none',
              }}>
                {/* Rank */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 700,
                    color: rank === 0 ? 'var(--gold)' : 'var(--text-faint)',
                  }}>
                    #{rank + 1}
                  </div>
                  {rank === 0 && <div style={{ fontSize: 24 }}>🏅</div>}
                </div>

                {/* User */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: bg, border: `1.5px solid ${border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: accent,
                    boxShadow: `0 0 12px ${glow}`,
                  }}>
                    {user.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: accent, letterSpacing: 1 }}>
                      {user.displayName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: 1.5 }}>
                      {u.id === currentUser ? 'SIZ' : 'RAQIB'}
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: 'MOMENTUM', val: u.momentum, color: accent },
                    { label: 'STREAK', val: `${u.streak?.current_streak || 0} kun`, color: 'var(--gold)' },
                    { label: 'UZUNROQ', val: `${u.streak?.longest_streak || 0} kun`, color: accent },
                    { label: "TO'LIQ KUNLAR", val: completedDays, color: accent },
                    { label: 'JAMI KUNLAR', val: u.streak?.total_completed_days || 0, color: 'var(--text-muted)' },
                    { label: "O'RTA %", val: `${avgCompletion}%`, color: accent },
                  ].map(({ label, val, color: c }) => (
                    <div key={label} style={{
                      background: 'var(--bg-input)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '12px 10px',
                    }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: c, lineHeight: 1 }}>
                        {val}
                      </div>
                      <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text-faint)', marginTop: 4, fontWeight: 600 }}>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 7-day streak visual */}
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text-faint)', marginBottom: 8, fontWeight: 600 }}>
                    SO&apos;NGGI 7 KUN
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: 7 }).map((_, i) => {
                      const dayTask = u.weekly[u.weekly.length - 7 + i]
                      const done = dayTask && dayTask.completed_count >= 7
                      const partial = dayTask && dayTask.completed_count > 0
                      return (
                        <div key={i} title={`D${i+1}: ${dayTask?.completed_count || 0}/7`} style={{
                          flex: 1, height: 28, borderRadius: 6,
                          background: done ? bg : (partial ? `${accent}20` : 'var(--border)'),
                          border: `1px solid ${done ? border : (partial ? `${accent}40` : 'transparent')}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, color: done ? accent : 'var(--text-faint)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                          {done ? '✓' : (dayTask?.completed_count || 0)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* 7-day rules reminder */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '24px',
        }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 16 }}>
            BELLASHUV QOIDALARI
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🎯', text: '7 ta tracker mavjud — har kuni barchasi bajarilishi kerak' },
              { icon: '⚠️', text: '2 ta task qolsa — progress 0 ga tushadi (streak buziladi)' },
              { icon: '🏆', text: 'Kim 7 kun ketma-ket to\'liq bajarsa — G\'OLIB!' },
              { icon: '🔥', text: '3+ kun — x1.5 Momentum; 7 kun — x2 Momentum' },
              { icon: '🕌', text: 'Namoz kechiktirilsa — diagrammada aks etadi' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

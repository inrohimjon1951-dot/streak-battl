'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { UserID } from '@/types'
import { useRealtimeData } from '@/hooks/useRealtimeData'
import { useTheme } from '@/hooks/useTheme'
import { getWeeklyTasks } from '@/lib/db'
import { DailyTask } from '@/types'
import TopBar from '@/components/ui/TopBar'
import UserPanel from '@/components/tracker/UserPanel'
import ToastContainer, { useToasts } from '@/components/ui/Toast'

export default function DashboardPage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { toasts, addToast, removeToast } = useToasts()

  const [currentUser, setCurrentUser] = useState<UserID | null>(null)
  const [myWeekly, setMyWeekly] = useState<DailyTask[]>([])
  const [partnerWeekly, setPartnerWeekly] = useState<DailyTask[]>([])

  useEffect(() => {
    const session = getSession()
    if (!session) { router.replace('/login'); return }
    setCurrentUser(session.userId)
  }, [router])

  const partnerId: UserID = currentUser === 'muhammadyusuf' ? 'shavkatjon' : 'muhammadyusuf'

  const {
    myTask, partnerTask,
    myCustomTasks, partnerCustomTasks,
    myReactions, partnerReactions,
    myStreak, partnerStreak,
    isLoading, error, lastUpdate, refetch,
  } = useRealtimeData(currentUser || 'muhammadyusuf', partnerId)

  useEffect(() => {
    if (!currentUser) return
    getWeeklyTasks(currentUser).then(setMyWeekly).catch(() => {})
    getWeeklyTasks(partnerId).then(setPartnerWeekly).catch(() => {})
  }, [currentUser, partnerId, lastUpdate])

  if (!currentUser || isLoading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg)',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, letterSpacing: 4,
          background: 'linear-gradient(90deg, var(--cyan), var(--red))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>STREAK</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 3 }}>YUKLANMOQDA...</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i === 0 ? 'var(--cyan)' : i === 1 ? 'var(--red)' : 'var(--gold)',
              animation: `live-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--bg)',
        flexDirection: 'column', gap: 16, padding: 24,
      }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--red)', letterSpacing: 2, textAlign: 'center' }}>
          {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px', borderRadius: 10, border: '1px solid var(--cyan-border)',
            background: 'var(--cyan-bg)', color: 'var(--cyan)', cursor: 'pointer',
            fontFamily: 'var(--font-main)', fontSize: 14, fontWeight: 700, letterSpacing: 2,
          }}
        >
          QAYTA URINISH
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        currentUser={currentUser}
        myStreak={myStreak}
        partnerStreak={partnerStreak}
        lastUpdate={lastUpdate}
      />
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1,
        borderTop: '1px solid var(--border)', overflow: 'hidden',
        minHeight: 'calc(100vh - 64px)',
      }}>
        <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
          <UserPanel
            userId={currentUser}
            currentUser={currentUser}
            task={myTask}
            customTasks={myCustomTasks}
            reactions={myReactions}
            streak={myStreak}
            weeklyData={myWeekly}
            onUpdate={refetch}
            onToast={addToast}
          />
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
          <UserPanel
            userId={partnerId}
            currentUser={currentUser}
            task={partnerTask}
            customTasks={partnerCustomTasks}
            reactions={partnerReactions}
            streak={partnerStreak}
            weeklyData={partnerWeekly}
            onUpdate={refetch}
            onToast={addToast}
          />
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

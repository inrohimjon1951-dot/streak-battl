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
  const [activeTab, setActiveTab] = useState<'me' | 'partner'>('me')

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, letterSpacing: 4, background: 'linear-gradient(90deg, var(--cyan), var(--red))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>STREAK</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 3 }}>YUKLANMOQDA...</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? 'var(--cyan)' : i === 1 ? 'var(--red)' : 'var(--gold)', animation: `live-dot 1.4s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16, padding: 24 }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ fontSize: 13, color: 'var(--red)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{error}</div>
        <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid var(--cyan-border)', background: 'var(--cyan-bg)', color: 'var(--cyan)', cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>
          QAYTA URINISH
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <TopBar currentUser={currentUser} myStreak={myStreak} partnerStreak={partnerStreak} lastUpdate={lastUpdate} />

      {/* Mobile tab switcher */}
      <div style={{ display: 'none' }} className="mobile-tabs">
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
          {(['me', 'partner'] as const).map(tab => {
            const label = tab === 'me' ? currentUser : partnerId
            const color = tab === 'me' ? (currentUser === 'muhammadyusuf' ? 'var(--cyan)' : 'var(--red)') : (partnerId === 'muhammadyusuf' ? 'var(--cyan)' : 'var(--red)')
            return (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '12px', background: 'none', border: 'none',
                borderBottom: activeTab === tab ? `2px solid ${color}` : '2px solid transparent',
                color: activeTab === tab ? color : 'var(--text-muted)',
                cursor: 'pointer', fontFamily: 'var(--font-main)', fontWeight: 700,
                fontSize: 13, letterSpacing: 1, transition: 'all 0.2s',
                textTransform: 'uppercase',
              }}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop: 2 panel | Mobile: tabs */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-tabs { display: block !important; }
          .desktop-only { display: none !important; }
          .mobile-panel-me { display: ${activeTab === 'me' ? 'block' : 'none'} !important; }
          .mobile-panel-partner { display: ${activeTab === 'partner' ? 'block' : 'none'} !important; }
        }
        @media (min-width: 769px) {
          .mobile-panel-me, .mobile-panel-partner { display: block !important; }
        }
      `}</style>

      <div className="desktop-only" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, borderTop: '1px solid var(--border)', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ borderRight: '1px solid var(--border)', overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
          <UserPanel userId={currentUser} currentUser={currentUser} task={myTask} customTasks={myCustomTasks} reactions={myReactions} streak={myStreak} weeklyData={myWeekly} onUpdate={refetch} onToast={addToast} />
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 64px)' }}>
          <UserPanel userId={partnerId} currentUser={currentUser} task={partnerTask} customTasks={partnerCustomTasks} reactions={partnerReactions} streak={partnerStreak} weeklyData={partnerWeekly} onUpdate={refetch} onToast={addToast} />
        </div>
      </div>

      {/* Mobile panels */}
      <div className="mobile-panel-me" style={{ display: 'none', overflowY: 'auto' }}>
        <UserPanel userId={currentUser} currentUser={currentUser} task={myTask} customTasks={myCustomTasks} reactions={myReactions} streak={myStreak} weeklyData={myWeekly} onUpdate={refetch} onToast={addToast} />
      </div>
      <div className="mobile-panel-partner" style={{ display: 'none', overflowY: 'auto' }}>
        <UserPanel userId={partnerId} currentUser={currentUser} task={partnerTask} customTasks={partnerCustomTasks} reactions={partnerReactions} streak={partnerStreak} weeklyData={partnerWeekly} onUpdate={refetch} onToast={addToast} />
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

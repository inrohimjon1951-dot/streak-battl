'use client'

import { useState, useCallback } from 'react'
import { DailyTask, CustomTask, Reaction, StreakData, UserID, USERS } from '@/types'
import { upsertDailyTask, addReaction, addCustomTask, toggleCustomTask, deleteCustomTask, calculateMomentum, todayStr } from '@/lib/db'
import TaskCard from '@/components/tracker/TaskCard'
import PrayerTracker from '@/components/tracker/PrayerTracker'
import ActivityChart from '@/components/charts/ActivityChart'

interface UserPanelProps {
  userId: UserID
  currentUser: UserID
  task: DailyTask | null
  customTasks: CustomTask[]
  reactions: Reaction[]
  streak: StreakData | null
  weeklyData: DailyTask[]
  onUpdate: () => void
  onToast: (msg: string, type: 'cyan' | 'red' | 'gold', emoji?: string) => void
}

export default function UserPanel({
  userId, currentUser, task, customTasks, reactions,
  streak, weeklyData, onUpdate, onToast
}: UserPanelProps) {
  const user = USERS[userId]
  const isOwner = currentUser === userId
  const color = user.color
  const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
  const glow = color === 'cyan' ? 'var(--cyan-glow)' : 'var(--red-glow)'
  const bg = color === 'cyan' ? 'var(--cyan-bg)' : 'var(--red-bg)'
  const border = color === 'cyan' ? 'var(--cyan-border)' : 'var(--red-border)'

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTask, setAddingTask] = useState(false)
  const [localTask, setLocalTask] = useState<DailyTask | null>(task)

  // Use prop task if local is null
  const t = localTask || task

  const updateTask = useCallback(async (updates: Partial<DailyTask>) => {
    if (!t) return
    const merged = { ...t, ...updates }
    // Count completed
    const prayerDone = ['fajr','dhuhr','asr','maghrib','isha'].every(p => (merged.prayer as unknown as Record<string,boolean>)[p])
    // Prayer counts as 1 of 7 only when all 5 done
    const completedCount = [
      prayerDone,
      (merged.quran as { completed?: boolean })?.completed,
      (merged.hadith as { completed?: boolean })?.completed,
      (merged.podcast as { completed?: boolean })?.completed,
      (merged.book as { completed?: boolean })?.completed,
      (merged.calisthenics as { completed?: boolean })?.completed,
      (merged.zikr as { completed?: boolean })?.completed,
    ].filter(Boolean).length

    const momentum = calculateMomentum(merged, streak?.current_streak || 0)

    const updated = {
      ...merged,
      completed_count: completedCount,
      momentum_points: momentum,
      user_id: userId,
      date: todayStr(),
    }
    setLocalTask(updated as DailyTask)
    await upsertDailyTask(updated)
    onUpdate()
  }, [t, userId, streak, onUpdate])

  const handleReaction = async (taskType: string, emoji: string) => {
    await addReaction(currentUser, userId, taskType, emoji)
    onToast(`${USERS[currentUser].name} reaksiya qoldirdi: ${emoji}`, color, emoji)
    onUpdate()
  }

  const handleAddCustomTask = async () => {
    if (!newTaskTitle.trim()) return
    await addCustomTask(userId, newTaskTitle.trim())
    setNewTaskTitle('')
    setAddingTask(false)
    onUpdate()
  }

  const handleToggleCustom = async (id: string, completed: boolean) => {
    await toggleCustomTask(id, !completed)
    onUpdate()
  }

  const handleDeleteCustom = async (id: string) => {
    await deleteCustomTask(id)
    onUpdate()
  }

  // Streak days
  const streakDays = streak?.current_streak || 0
  const completedCount = t?.completed_count || 0
  const momentum = t?.momentum_points || 0

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      borderTop: `3px solid ${accent}`,
      position: 'relative',
      overflow: 'hidden',
      minHeight: 0,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: -80,
        [color === 'cyan' ? 'left' : 'right']: -80,
        width: 300,
        height: 300,
        background: `radial-gradient(circle, ${color === 'cyan' ? 'rgba(0,245,255,0.06)' : 'rgba(255,23,68,0.06)'} 0%, transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ padding: '20px', position: 'relative', zIndex: 1, overflowY: 'auto' }}>

        {/* ── USER HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: bg,
            border: `1.5px solid ${border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700,
            color: accent,
            boxShadow: `0 0 16px ${glow}`,
          }}>
            {user.initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, color: accent, lineHeight: 1 }}>
              {user.displayName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: 1.5 }}>
              {isOwner ? '● SIZMIZ' : '● KUZATILMOQDA'}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: accent, lineHeight: 1
            }}>
              {momentum}
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: 'var(--text-faint)', marginTop: 4, fontWeight: 600 }}>
              MOMENTUM
            </div>
          </div>
        </div>

        {/* ── 7-DAY STREAK ROW ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase' }}>
            7 Kunlik Streak
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const done = i < streakDays
              const isToday = i === Math.min(streakDays, 6)
              return (
                <div key={i} style={{
                  flex: 1, height: 34, borderRadius: 6,
                  background: done ? bg : 'var(--bg-input)',
                  border: `1px solid ${done ? border : (isToday ? accent : 'var(--border)')}`,
                  borderStyle: isToday && !done ? 'dashed' : 'solid',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  color: done ? accent : (isToday ? accent : 'var(--text-faint)'),
                  boxShadow: done ? `0 0 8px ${glow}` : 'none',
                  animation: isToday ? 'pulse-border 2s ease-in-out infinite' : 'none',
                  transition: 'all 0.3s',
                }}>
                  {done ? '✓' : `D${i + 1}`}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[
            { val: completedCount, label: 'bajarildi', color: accent },
            { val: 7 - completedCount, label: 'qoldi', color: 'var(--gold)' },
            { val: `${Math.round((completedCount / 7) * 100)}%`, label: 'bugun', color: accent },
          ].map(({ val, label, color: c }) => (
            <div key={label} style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 10, padding: '12px 8px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: c, lineHeight: 1 }}>
                {val}
              </div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: 'var(--text-faint)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── TASK 1: NAMOZ ── */}
        <div style={{ marginBottom: 10 }}>
          <div style={{
            background: 'var(--bg-input)',
            border: `1px solid ${t?.prayer && ['fajr','dhuhr','asr','maghrib','isha'].every(p => (t.prayer as unknown as Record<string,boolean>)[p]) ? border : 'var(--border)'}`,
            borderRadius: 12, padding: 14,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                🕌 01 — 5 Vaqt Namoz + Zikrlar
              </div>
              {!isOwner && (
                <button
                  onClick={() => handleReaction('prayer', '🫡')}
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '3px 8px', fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  + ❤️
                </button>
              )}
            </div>
            {t && (
              <PrayerTracker
                prayer={t.prayer}
                onChange={p => updateTask({ prayer: p })}
                color={color}
                readOnly={!isOwner}
              />
            )}
          </div>
        </div>

        {/* ── TASK 2: QUR'ON ── */}
        <QuranCard
          task={t}
          color={color}
          isOwner={isOwner}
          onUpdate={updateTask}
          onReaction={(e) => handleReaction('quran', e)}
        />

        {/* ── TASK 3: HADIS ── */}
        <HadithCard
          task={t}
          color={color}
          isOwner={isOwner}
          onUpdate={updateTask}
          onReaction={(e) => handleReaction('hadith', e)}
        />

        {/* ── TASK 4: KITOB ── */}
        <BookCard
          task={t}
          color={color}
          isOwner={isOwner}
          onUpdate={updateTask}
          onReaction={(e) => handleReaction('book', e)}
        />

        {/* ── TASK 5: PODCAST ── */}
        <PodcastCard
          task={t}
          color={color}
          isOwner={isOwner}
          onUpdate={updateTask}
          onReaction={(e) => handleReaction('podcast', e)}
        />

        {/* ── TASK 6: CALISTHENICS ── */}
        <CalisthenicsCard
          task={t}
          color={color}
          isOwner={isOwner}
          onUpdate={updateTask}
          onReaction={(e) => handleReaction('calisthenics', e)}
        />

        {/* ── TASK 7: ZIKR (standalone) ── */}
        <ZikrCard
          task={t}
          color={color}
          isOwner={isOwner}
          onUpdate={updateTask}
          onReaction={(e) => handleReaction('zikr', e)}
        />

        {/* ── CUSTOM TASKS ── */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase' }}>
            Shaxsiy Tasklar
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {customTasks.map(ct => (
              <div key={ct.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: ct.completed ? bg : 'var(--bg-input)',
                border: `1px solid ${ct.completed ? border : 'var(--border)'}`,
                borderRadius: 10, padding: '10px 14px',
              }}>
                {isOwner && (
                  <button
                    onClick={() => handleToggleCustom(ct.id, ct.completed)}
                    style={{
                      width: 22, height: 22, borderRadius: '50%',
                      border: `1.5px solid ${ct.completed ? accent : 'var(--border-hover)'}`,
                      background: ct.completed ? accent : 'transparent',
                      cursor: 'pointer', fontSize: 11, color: ct.completed ? '#000' : 'transparent',
                      flexShrink: 0,
                    }}
                  >
                    {ct.completed ? '✓' : ''}
                  </button>
                )}
                <div style={{
                  flex: 1, fontSize: 13, fontWeight: 500,
                  color: ct.completed ? accent : 'var(--text)',
                  textDecoration: ct.completed ? 'line-through' : 'none',
                  opacity: ct.completed ? 0.7 : 1,
                }}>
                  {ct.title}
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleDeleteCustom(ct.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 14, padding: '0 4px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            {isOwner && (
              addingTask ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    autoFocus
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddCustomTask(); if (e.key === 'Escape') setAddingTask(false) }}
                    placeholder="Task nomini kiriting..."
                    style={{ flex: 1, fontSize: 13, padding: '8px 12px', borderRadius: 8, border: `1px solid ${border}` }}
                  />
                  <button
                    onClick={handleAddCustomTask}
                    style={{
                      padding: '8px 16px', borderRadius: 8, border: 'none',
                      background: accent, color: color === 'cyan' ? '#000' : '#fff',
                      cursor: 'pointer', fontWeight: 700, fontSize: 13,
                    }}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTask(true)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1px dashed var(--border)', background: 'none',
                    color: 'var(--text-faint)', cursor: 'pointer', fontSize: 12,
                    letterSpacing: 1, fontFamily: 'var(--font-main)', fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.color = accent }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-faint)' }}
                >
                  + Yangi shaxsiy task qo&apos;shish
                </button>
              )
            )}
          </div>
        </div>

        {/* ── REACTIONS received ── */}
        {reactions.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase' }}>
              Kelgan reaksiyalar
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {reactions.map(r => (
                <div key={r.id} style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '4px 10px', fontSize: 15,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {r.emoji}
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{USERS[r.from_user as UserID]?.initials}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHART ── */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: 3, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase' }}>
            Haftalik Faollik
          </div>
          <div style={{
            background: 'var(--bg-input)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 8px',
          }}>
            <ActivityChart weeklyData={weeklyData} color={color} />
          </div>
        </div>

      </div>
    </div>
  )
}

// ── SUB-CARDS ────────────────────────────────────────────────────────────────

function QuranCard({ task, color, isOwner, onUpdate, onReaction }: SubCardProps) {
  const q = task?.quran || { surah_name: '', ayah_from: 0, ayah_to: 0, completed: false }
  const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
  return (
    <TaskCard num="02" icon="📖" title="Qur'on — Har kuni 5 oyat" completed={q.completed} color={color}
      readOnly={!isOwner} onToggle={() => onUpdate({ quran: { ...q, completed: !q.completed } })}
      showReactions={!isOwner} onReaction={onReaction}>
      {isOwner && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input placeholder="Sura nomi (masalan: Al-Baqara)" value={q.surah_name}
            onChange={e => onUpdate({ quran: { ...q, surah_name: e.target.value } })}
            style={{ fontSize: 12, padding: '6px 10px' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" placeholder="Oyat dan" value={q.ayah_from || ''}
              onChange={e => onUpdate({ quran: { ...q, ayah_from: Number(e.target.value) } })}
              style={{ fontSize: 12, padding: '6px 10px' }} />
            <input type="number" placeholder="Oyat gacha" value={q.ayah_to || ''}
              onChange={e => onUpdate({ quran: { ...q, ayah_to: Number(e.target.value) } })}
              style={{ fontSize: 12, padding: '6px 10px' }} />
          </div>
        </div>
      )}
      {!isOwner && q.surah_name && (
        <div style={{ fontSize: 12, color: accent, marginTop: 4 }}>
          {q.surah_name} {q.ayah_from}—{q.ayah_to} oyat
        </div>
      )}
    </TaskCard>
  )
}

function HadithCard({ task, color, isOwner, onUpdate, onReaction }: SubCardProps) {
  const h = task?.hadith || { text: '', explained: false, completed: false }
  const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
  return (
    <TaskCard num="03" icon="📿" title="Hadis o'rganish" completed={h.completed} color={color}
      readOnly={!isOwner} onToggle={() => onUpdate({ hadith: { ...h, completed: !h.completed } })}
      showReactions={!isOwner} onReaction={onReaction}>
      {isOwner && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <textarea placeholder="Hadis matni..." value={h.text}
            onChange={e => onUpdate({ hadith: { ...h, text: e.target.value } })}
            rows={3} style={{ fontSize: 12, padding: '8px 10px', resize: 'vertical' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)' }}>
            <input type="checkbox" checked={h.explained} onChange={e => onUpdate({ hadith: { ...h, explained: e.target.checked } })}
              style={{ width: 'auto', cursor: 'pointer' }} />
            Video call orqali tushuntirildi
          </label>
        </div>
      )}
      {!isOwner && h.text && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
          &quot;{h.text.substring(0, 100)}{h.text.length > 100 ? '...' : ''}&quot;
        </div>
      )}
    </TaskCard>
  )
}

function BookCard({ task, color, isOwner, onUpdate, onReaction }: SubCardProps) {
  const b = task?.book || { title: '', author: '', pages_from: 0, pages_to: 0, completed: false }
  const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
  return (
    <TaskCard num="04" icon="📚" title="Badiiy kitob — Har kuni 10 bet" completed={b.completed} color={color}
      readOnly={!isOwner} onToggle={() => onUpdate({ book: { ...b, completed: !b.completed } })}
      showReactions={!isOwner} onReaction={onReaction}>
      {isOwner && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input placeholder="Kitob nomi" value={b.title}
            onChange={e => onUpdate({ book: { ...b, title: e.target.value } })}
            style={{ fontSize: 12, padding: '6px 10px' }} />
          <input placeholder="Muallif" value={b.author}
            onChange={e => onUpdate({ book: { ...b, author: e.target.value } })}
            style={{ fontSize: 12, padding: '6px 10px' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="number" placeholder="Bet dan" value={b.pages_from || ''}
              onChange={e => onUpdate({ book: { ...b, pages_from: Number(e.target.value) } })}
              style={{ fontSize: 12, padding: '6px 10px' }} />
            <input type="number" placeholder="Bet gacha" value={b.pages_to || ''}
              onChange={e => onUpdate({ book: { ...b, pages_to: Number(e.target.value) } })}
              style={{ fontSize: 12, padding: '6px 10px' }} />
          </div>
        </div>
      )}
      {!isOwner && b.title && (
        <div style={{ fontSize: 12, color: accent, marginTop: 4 }}>
          {b.title} {b.author ? `— ${b.author}` : ''} {b.pages_from && b.pages_to ? `(${b.pages_from}–${b.pages_to} bet)` : ''}
        </div>
      )}
    </TaskCard>
  )
}

function PodcastCard({ task, color, isOwner, onUpdate, onReaction }: SubCardProps) {
  const p = task?.podcast || { title: '', link: '', summary: '', completed: false }
  const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
  return (
    <TaskCard num="05" icon="🎧" title="Podcast / Maqola (haftada 1)" completed={p.completed} color={color}
      readOnly={!isOwner} onToggle={() => onUpdate({ podcast: { ...p, completed: !p.completed } })}
      showReactions={!isOwner} onReaction={onReaction}>
      {isOwner && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input placeholder="Sarlavha" value={p.title}
            onChange={e => onUpdate({ podcast: { ...p, title: e.target.value } })}
            style={{ fontSize: 12, padding: '6px 10px' }} />
          <input placeholder="Link (https://...)" value={p.link}
            onChange={e => onUpdate({ podcast: { ...p, link: e.target.value } })}
            style={{ fontSize: 12, padding: '6px 10px' }} />
          <textarea placeholder="Qisqa xulosa..." value={p.summary}
            onChange={e => onUpdate({ podcast: { ...p, summary: e.target.value } })}
            rows={2} style={{ fontSize: 12, padding: '6px 10px', resize: 'vertical' }} />
        </div>
      )}
      {!isOwner && p.title && (
        <div style={{ fontSize: 12, color: accent, marginTop: 4 }}>
          {p.title} {p.link && <a href={p.link} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>🔗</a>}
        </div>
      )}
    </TaskCard>
  )
}

function CalisthenicsCard({ task, color, isOwner, onUpdate, onReaction }: SubCardProps) {
  const c = task?.calisthenics || { exercises: '', completed: false }
  return (
    <TaskCard num="06" icon="💪" title="Calisthenics" completed={c.completed} color={color}
      readOnly={!isOwner} onToggle={() => onUpdate({ calisthenics: { ...c, completed: !c.completed } })}
      showReactions={!isOwner} onReaction={onReaction}>
      {isOwner && (
        <textarea placeholder="Mashqlar va takrorlar (masalan: Pull-up × 30, Dips × 40...)" value={c.exercises}
          onChange={e => onUpdate({ calisthenics: { ...c, exercises: e.target.value } })}
          rows={2} style={{ fontSize: 12, padding: '6px 10px', resize: 'vertical' }} />
      )}
      {!isOwner && c.exercises && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{c.exercises}</div>
      )}
    </TaskCard>
  )
}

function ZikrCard({ task, color, isOwner, onUpdate, onReaction }: SubCardProps) {
  const z = task?.zikr || { subhanallah: 0, alhamdulillah: 0, allahuakbar: 0, completed: false }
  const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
  return (
    <TaskCard num="07" icon="📿" title="Kunlik Zikrlar" completed={z.completed} color={color}
      readOnly={!isOwner} onToggle={() => onUpdate({ zikr: { ...z, completed: !z.completed } })}
      showReactions={!isOwner} onReaction={onReaction}>
      {isOwner ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { key: 'subhanallah', label: 'Subhanalloh', target: 33 },
            { key: 'alhamdulillah', label: 'Alhamdulilloh', target: 33 },
            { key: 'allahuakbar', label: 'Allohu akbar', target: 34 },
          ].map(({ key, label, target }) => {
            const val = (z as unknown as Record<string, number>)[key] || 0
            return (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: val >= target ? accent : 'var(--text-muted)' }}>
                    {val}/{target}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${Math.min((val / target) * 100, 100)}%`,
                      background: accent, borderRadius: 2, transition: 'width 0.3s',
                    }} />
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button
                      onClick={() => onUpdate({ zikr: { ...z, [key]: Math.max(0, val - 1) } })}
                      style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14 }}>
                      −
                    </button>
                    <button
                      onClick={() => onUpdate({ zikr: { ...z, [key]: val + 1 } })}
                      style={{ width: 24, height: 24, borderRadius: 6, border: `1px solid ${accent}`, background: 'transparent', cursor: 'pointer', color: accent, fontSize: 14, fontWeight: 700 }}>
                      +
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          Subhanalloh: {z.subhanallah}/33 &nbsp;|&nbsp; Alhamdulilloh: {z.alhamdulillah}/33 &nbsp;|&nbsp; Allohu akbar: {z.allahuakbar}/34
        </div>
      )}
    </TaskCard>
  )
}

interface SubCardProps {
  task: DailyTask | null
  color: 'cyan' | 'red'
  isOwner: boolean
  onUpdate: (updates: Partial<DailyTask>) => void
  onReaction: (emoji: string) => void
}

'use client'

import { useState, useCallback, useEffect } from 'react'
import { DailyTask, CustomTask, Reaction, StreakData, UserID, USERS } from '@/types'
import { upsertDailyTask, addReaction, addCustomTask, toggleCustomTask, deleteCustomTask, calculateMomentum, todayStr, getDailyTask, defaultDailyTask } from '@/lib/db'
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

export default function UserPanel({ userId, currentUser, task, customTasks, reactions, streak, weeklyData, onUpdate, onToast }: UserPanelProps) {
  const user = USERS[userId]
  const isOwner = currentUser === userId
  const color = user.color
  const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
  const glow = color === 'cyan' ? 'var(--cyan-glow)' : 'var(--red-glow)'
  const bg = color === 'cyan' ? 'var(--cyan-bg)' : 'var(--red-bg)'
  const border = color === 'cyan' ? 'var(--cyan-border)' : 'var(--red-border)'

  const [localTask, setLocalTask] = useState<DailyTask | null>(task)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTask, setAddingTask] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (task) setLocalTask(task)
  }, [task])

  const t = localTask

  const updateTask = useCallback(async (updates: Partial<DailyTask>) => {
    if (!t) return
    const merged = { ...t, ...updates }

    const prayerDone = ['fajr','dhuhr','asr','maghrib','isha'].every(p => (merged.prayer as unknown as Record<string,boolean>)[p])
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
    const updated = { ...merged, completed_count: completedCount, momentum_points: momentum, user_id: userId, date: todayStr() }

    setLocalTask(updated as DailyTask)
    setSaving(true)
    try {
      await upsertDailyTask(updated)
      onUpdate()
    } catch (e) {
      console.error('Save error:', e)
    } finally {
      setSaving(false)
    }
  }, [t, userId, streak, onUpdate])

  const handleReaction = async (taskType: string, emoji: string) => {
    await addReaction(currentUser, userId, taskType, emoji)
    onToast(`${USERS[currentUser].name}: ${emoji}`, color, emoji)
    onUpdate()
  }

  const handleAddCustom = async () => {
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

  const streakDays = streak?.current_streak || 0
  const completedCount = t?.completed_count || 0
  const momentum = t?.momentum_points || 0

  const inputStyle = {
    fontSize: 13, padding: '8px 10px', borderRadius: 8,
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    color: 'var(--text)', width: '100%', outline: 'none',
    fontFamily: 'var(--font-main)',
  }

  return (
    <div style={{ borderTop: `3px solid ${accent}`, position: 'relative' }}>
      {/* BG Glow */}
      <div style={{
        position: 'absolute', top: 0, [color === 'cyan' ? 'left' : 'right']: 0,
        width: 250, height: 250, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(circle, ${color === 'cyan' ? 'rgba(0,245,255,0.05)' : 'rgba(255,23,68,0.05)'} 0%, transparent 70%)`,
      }} />

      <div style={{ padding: '16px', position: 'relative', zIndex: 1 }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, background: bg,
            border: `1.5px solid ${border}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 14,
            fontWeight: 700, color: accent, boxShadow: `0 0 14px ${glow}`, flexShrink: 0,
          }}>{user.initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 2, color: accent }}>{user.displayName}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1.5, marginTop: 2 }}>
              {isOwner ? '● SIZMIZ' : '● KUZATILMOQDA'}
              {saving && <span style={{ marginLeft: 8, color: 'var(--gold)' }}>· SAQLANMOQDA...</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, color: accent }}>{momentum}</div>
            <div style={{ fontSize: 9, color: 'var(--text-faint)', letterSpacing: 2 }}>MOMENTUM</div>
          </div>
        </div>

        {/* ── 7-DAY STREAK ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 8 }}>7 KUNLIK STREAK</div>
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const done = i < streakDays
              const isToday = i === Math.min(streakDays, 6)
              return (
                <div key={i} style={{
                  flex: 1, height: 32, borderRadius: 6,
                  background: done ? bg : 'var(--bg-input)',
                  border: `1px solid ${done ? border : isToday ? accent : 'var(--border)'}`,
                  borderStyle: isToday && !done ? 'dashed' : 'solid',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                  color: done ? accent : isToday ? accent : 'var(--text-faint)',
                  boxShadow: done ? `0 0 6px ${glow}` : 'none',
                }}>
                  {done ? '✓' : `D${i + 1}`}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── STATS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
          {[
            { val: completedCount, label: 'bajarildi', c: accent },
            { val: 7 - completedCount, label: 'qoldi', c: 'var(--gold)' },
            { val: `${Math.round((completedCount / 7) * 100)}%`, label: 'bugun', c: accent },
          ].map(({ val, label, c }) => (
            <div key={label} style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: c }}>{val}</div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: 'var(--text-faint)', marginTop: 3, textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* ── TASK 1: NAMOZ ── */}
        <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 12, padding: 14, marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>🕌 01 — 5 Vaqt Namoz</span>
            {!isOwner && (
              <button onClick={() => handleReaction('prayer', '🫡')}
                style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '3px 8px', fontSize: 12, cursor: 'pointer', color: 'var(--text-muted)' }}>
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

        {/* ── TASK 2: QUR'ON ── */}
        <TaskCard num="02" icon="📖" title="Qur'on — Har kuni 5 oyat"
          completed={!!(t?.quran as { completed?: boolean })?.completed} color={color}
          readOnly={!isOwner} onToggle={() => { const q = (t?.quran || {}) as Record<string,unknown>; updateTask({ quran: { ...q, completed: !q['completed'] } as unknown as import('@/types').QuranEntry }) }}
          showReactions={!isOwner} onReaction={e => handleReaction('quran', e)}>
          {isOwner && t && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input style={inputStyle} placeholder="Sura nomi (masalan: Al-Baqara)"
                value={(t.quran as { surah_name?: string }).surah_name || ''}
                onChange={e => updateTask({ quran: { ...(t.quran as unknown as Record<string,unknown>), surah_name: e.target.value } as unknown as import('@/types').QuranEntry })} />
              <div style={{ display: 'flex', gap: 6 }}>
                <input style={inputStyle} type="number" placeholder="Oyat dan"
                  value={(t.quran as { ayah_from?: number }).ayah_from || ''}
                  onChange={e => updateTask({ quran: { ...(t.quran as unknown as Record<string,unknown>), ayah_from: Number(e.target.value) } as unknown as import('@/types').QuranEntry })} />
                <input style={inputStyle} type="number" placeholder="Oyat gacha"
                  value={(t.quran as { ayah_to?: number }).ayah_to || ''}
                  onChange={e => updateTask({ quran: { ...(t.quran as unknown as Record<string,unknown>), ayah_to: Number(e.target.value) } as unknown as import('@/types').QuranEntry })} />
              </div>
            </div>
          )}
          {!isOwner && t && (t.quran as { surah_name?: string }).surah_name && (
            <div style={{ fontSize: 12, color: accent, marginTop: 4 }}>
              {(t.quran as { surah_name?: string; ayah_from?: number; ayah_to?: number }).surah_name} — {(t.quran as { ayah_from?: number }).ayah_from}–{(t.quran as { ayah_to?: number }).ayah_to} oyat
            </div>
          )}
        </TaskCard>

        {/* ── TASK 3: HADIS ── */}
        <TaskCard num="03" icon="📿" title="Hadis o'rganish"
          completed={!!(t?.hadith as { completed?: boolean })?.completed} color={color}
          readOnly={!isOwner} onToggle={() => { const h = (t?.hadith || {}) as Record<string,unknown>; updateTask({ hadith: { ...h, completed: !h['completed'] } as unknown as import('@/types').HadithEntry }) }}
          showReactions={!isOwner} onReaction={e => handleReaction('hadith', e)}>
          {isOwner && t && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} placeholder="Hadis matni..."
                value={(t.hadith as { text?: string }).text || ''}
                onChange={e => updateTask({ hadith: { ...(t.hadith as unknown as Record<string,unknown>), text: e.target.value } as unknown as import('@/types').HadithEntry })} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>
                <input type="checkbox" style={{ width: 'auto' }}
                  checked={!!(t.hadith as { explained?: boolean }).explained}
                  onChange={e => updateTask({ hadith: { ...(t.hadith as unknown as Record<string,unknown>), explained: e.target.checked } as unknown as import('@/types').HadithEntry })} />
                Video call orqali tushuntirildi ✓
              </label>
            </div>
          )}
          {!isOwner && t && (t.hadith as { text?: string }).text && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
              &quot;{((t.hadith as { text?: string }).text || '').substring(0, 80)}...&quot;
            </div>
          )}
        </TaskCard>

        {/* ── TASK 4: KITOB ── */}
        <TaskCard num="04" icon="📚" title="Badiiy kitob — 10 bet"
          completed={!!(t?.book as { completed?: boolean })?.completed} color={color}
          readOnly={!isOwner} onToggle={() => { const b = (t?.book || {}) as Record<string,unknown>; updateTask({ book: { ...b, completed: !b['completed'] } as unknown as import('@/types').BookEntry }) }}
          showReactions={!isOwner} onReaction={e => handleReaction('book', e)}>
          {isOwner && t && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input style={inputStyle} placeholder="Kitob nomi"
                value={(t.book as { title?: string }).title || ''}
                onChange={e => updateTask({ book: { ...(t.book as unknown as Record<string,unknown>), title: e.target.value } as unknown as import('@/types').BookEntry })} />
              <input style={inputStyle} placeholder="Muallif"
                value={(t.book as { author?: string }).author || ''}
                onChange={e => updateTask({ book: { ...(t.book as unknown as Record<string,unknown>), author: e.target.value } as unknown as import('@/types').BookEntry })} />
              <div style={{ display: 'flex', gap: 6 }}>
                <input style={inputStyle} type="number" placeholder="Bet dan"
                  value={(t.book as { pages_from?: number }).pages_from || ''}
                  onChange={e => updateTask({ book: { ...(t.book as unknown as Record<string,unknown>), pages_from: Number(e.target.value) } as unknown as import('@/types').BookEntry })} />
                <input style={inputStyle} type="number" placeholder="Bet gacha"
                  value={(t.book as { pages_to?: number }).pages_to || ''}
                  onChange={e => updateTask({ book: { ...(t.book as unknown as Record<string,unknown>), pages_to: Number(e.target.value) } as unknown as import('@/types').BookEntry })} />
              </div>
            </div>
          )}
          {!isOwner && t && (t.book as { title?: string }).title && (
            <div style={{ fontSize: 12, color: accent, marginTop: 4 }}>
              {(t.book as { title?: string; author?: string; pages_from?: number; pages_to?: number }).title} — {(t.book as { author?: string }).author} ({(t.book as { pages_from?: number }).pages_from}–{(t.book as { pages_to?: number }).pages_to} bet)
            </div>
          )}
        </TaskCard>

        {/* ── TASK 5: PODCAST ── */}
        <TaskCard num="05" icon="🎧" title="Podcast / Maqola (haftada 1)"
          completed={!!(t?.podcast as { completed?: boolean })?.completed} color={color}
          readOnly={!isOwner} onToggle={() => { const p = (t?.podcast || {}) as Record<string,unknown>; updateTask({ podcast: { ...p, completed: !p['completed'] } as unknown as import('@/types').PodcastEntry }) }}
          showReactions={!isOwner} onReaction={e => handleReaction('podcast', e)}>
          {isOwner && t && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input style={inputStyle} placeholder="Sarlavha"
                value={(t.podcast as { title?: string }).title || ''}
                onChange={e => updateTask({ podcast: { ...(t.podcast as unknown as Record<string,unknown>), title: e.target.value } as unknown as import('@/types').PodcastEntry })} />
              <input style={inputStyle} placeholder="Link (https://...)"
                value={(t.podcast as { link?: string }).link || ''}
                onChange={e => updateTask({ podcast: { ...(t.podcast as unknown as Record<string,unknown>), link: e.target.value } as unknown as import('@/types').PodcastEntry })} />
              <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} placeholder="Qisqa xulosa..."
                value={(t.podcast as { summary?: string }).summary || ''}
                onChange={e => updateTask({ podcast: { ...(t.podcast as unknown as Record<string,unknown>), summary: e.target.value } as unknown as import('@/types').PodcastEntry })} />
            </div>
          )}
          {!isOwner && t && (t.podcast as { title?: string }).title && (
            <div style={{ fontSize: 12, color: accent, marginTop: 4 }}>{(t.podcast as { title?: string }).title}</div>
          )}
        </TaskCard>

        {/* ── TASK 6: CALISTHENICS ── */}
        <TaskCard num="06" icon="💪" title="Calisthenics"
          completed={!!(t?.calisthenics as { completed?: boolean })?.completed} color={color}
          readOnly={!isOwner} onToggle={() => { const c = (t?.calisthenics || {}) as Record<string,unknown>; updateTask({ calisthenics: { ...c, completed: !c['completed'] } as unknown as import('@/types').CalisthenicsEntry }) }}
          showReactions={!isOwner} onReaction={e => handleReaction('calisthenics', e)}>
          {isOwner && t && (
            <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2}
              placeholder="Mashqlar (masalan: Pull-up × 30, Dips × 40...)"
              value={(t.calisthenics as { exercises?: string }).exercises || ''}
              onChange={e => updateTask({ calisthenics: { ...(t.calisthenics as unknown as Record<string,unknown>), exercises: e.target.value } as unknown as import('@/types').CalisthenicsEntry })} />
          )}
          {!isOwner && t && (t.calisthenics as { exercises?: string }).exercises && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{(t.calisthenics as { exercises?: string }).exercises}</div>
          )}
        </TaskCard>

        {/* ── TASK 7: ZIKR (standalone) ── */}
        <TaskCard num="07" icon="📿" title="Kunlik Zikrlar"
          completed={!!(t?.zikr as { completed?: boolean })?.completed} color={color}
          readOnly={!isOwner} onToggle={() => { const z = (t?.zikr || {}) as Record<string,unknown>; updateTask({ zikr: { ...z, completed: !z['completed'] } as unknown as import('@/types').ZikrEntry }) }}
          showReactions={!isOwner} onReaction={e => handleReaction('zikr', e)}>
          {isOwner && t && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { key: 'subhanallah', label: 'Subhanalloh', target: 33 },
                { key: 'alhamdulillah', label: 'Alhamdulilloh', target: 33 },
                { key: 'allahuakbar', label: 'Allohu akbar', target: 34 },
              ].map(({ key, label, target }) => {
                const val = ((t.zikr as unknown as Record<string, number>)[key]) || 0
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: val >= target ? accent : 'var(--text-muted)', fontWeight: 700 }}>{val}/{target}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min((val / target) * 100, 100)}%`, background: accent, transition: 'width 0.3s' }} />
                      </div>
                      <button onClick={() => updateTask({ zikr: { ...(t.zikr as unknown as Record<string,unknown>), [key]: Math.max(0, val - 1) } })}
                        style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-input)', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>−</button>
                      <button onClick={() => updateTask({ zikr: { ...(t.zikr as unknown as Record<string,unknown>), [key]: val + 1 } })}
                        style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${accent}`, background: 'transparent', cursor: 'pointer', color: accent, fontSize: 16, fontWeight: 700 }}>+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {!isOwner && t && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Subhanalloh: {(t.zikr as { subhanallah?: number }).subhanallah}/33 &nbsp;|&nbsp;
              Alhamdulilloh: {(t.zikr as { alhamdulillah?: number }).alhamdulillah}/33 &nbsp;|&nbsp;
              Allohu akbar: {(t.zikr as { allahuakbar?: number }).allahuakbar}/34
            </div>
          )}
        </TaskCard>

        {/* ── SHAXSIY TASKLAR ── */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 10 }}>SHAXSIY TASKLAR</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {customTasks.map(ct => (
              <div key={ct.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: ct.completed ? bg : 'var(--bg-input)',
                border: `1px solid ${ct.completed ? border : 'var(--border)'}`,
                borderRadius: 10, padding: '10px 12px',
              }}>
                {isOwner && (
                  <button onClick={() => handleToggleCustom(ct.id, ct.completed)} style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${ct.completed ? accent : 'var(--border-hover)'}`,
                    background: ct.completed ? accent : 'transparent',
                    cursor: 'pointer', fontSize: 12,
                    color: ct.completed ? (color === 'cyan' ? '#000' : '#fff') : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{ct.completed ? '✓' : ''}</button>
                )}
                <span style={{ flex: 1, fontSize: 13, color: ct.completed ? accent : 'var(--text)', textDecoration: ct.completed ? 'line-through' : 'none', opacity: ct.completed ? 0.7 : 1 }}>
                  {ct.title}
                </span>
                {isOwner && (
                  <button onClick={() => handleDeleteCustom(ct.id)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}>✕</button>
                )}
              </div>
            ))}

            {isOwner && (
              addingTask ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input autoFocus value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddCustom(); if (e.key === 'Escape') setAddingTask(false) }}
                    placeholder="Task nomini kiriting..."
                    style={{ ...inputStyle, flex: 1 }} />
                  <button onClick={handleAddCustom} style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: accent, color: color === 'cyan' ? '#000' : '#fff',
                    cursor: 'pointer', fontWeight: 700, fontSize: 14, flexShrink: 0,
                  }}>+</button>
                </div>
              ) : (
                <button onClick={() => setAddingTask(true)} style={{
                  width: '100%', padding: '10px', borderRadius: 10,
                  border: '1px dashed var(--border)', background: 'none',
                  color: 'var(--text-faint)', cursor: 'pointer', fontSize: 13,
                  fontFamily: 'var(--font-main)', fontWeight: 600, transition: 'all 0.2s',
                }}>+ Yangi shaxsiy task qo&apos;shish</button>
              )
            )}
          </div>
        </div>

        {/* ── REAKSIYALAR ── */}
        {reactions.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 8 }}>KELGAN REAKSIYALAR</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {reactions.map(r => (
                <div key={r.id} style={{
                  background: 'var(--bg-input)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '4px 10px', fontSize: 15,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  {r.emoji}
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{USERS[r.from_user as UserID]?.initials}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CHART ── */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: 'var(--text-faint)', fontWeight: 600, marginBottom: 10 }}>HAFTALIK FAOLLIK</div>
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px' }}>
            <ActivityChart weeklyData={weeklyData} color={color} />
          </div>
        </div>
      </div>
    </div>
  )
}

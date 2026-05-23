'use client'

import { useState } from 'react'

interface TaskCardProps {
  num: string
  icon: string
  title: string
  completed: boolean
  color: 'cyan' | 'red'
  readOnly?: boolean
  onToggle?: () => void
  onReaction?: (emoji: string) => void
  showReactions?: boolean
  children?: React.ReactNode
}

const REACTIONS = ['❤️', '🔥', '👍🏻', '🫡', '✌🏼', '😂', '✊🏼', '💀', '🤫', '😮‍💨']

export default function TaskCard({ num, icon, title, completed, color, readOnly, onToggle, onReaction, showReactions, children }: TaskCardProps) {
  const [showPicker, setShowPicker] = useState(false)
  const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
  const glow = color === 'cyan' ? 'var(--cyan-glow)' : 'var(--red-glow)'
  const bg = color === 'cyan' ? 'var(--cyan-bg)' : 'var(--red-bg)'
  const border = color === 'cyan' ? 'var(--cyan-border)' : 'var(--red-border)'

  return (
    <div style={{
      background: completed ? bg : 'var(--bg-input)',
      border: `1.5px solid ${completed ? border : 'var(--border)'}`,
      borderRadius: 12, padding: 14,
      boxShadow: completed ? `0 0 12px ${glow}` : 'none',
      transition: 'all 0.25s', marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: 2, minWidth: 20 }}>{num}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: completed ? accent : 'var(--text)', marginBottom: children ? 10 : 0 }}>
            {icon} {title}
          </div>
          {children}
        </div>
        {!readOnly && onToggle && (
          <button
            onClick={onToggle}
            style={{
              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${completed ? accent : 'var(--border-hover)'}`,
              background: completed ? accent : 'transparent',
              color: completed ? (color === 'cyan' ? '#000' : '#fff') : 'transparent',
              cursor: 'pointer', fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {completed ? '✓' : ''}
          </button>
        )}
      </div>

      <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: completed ? '100%' : '0%', background: accent, borderRadius: 2, transition: 'width 0.5s' }} />
      </div>

      {showReactions && onReaction && (
        <div style={{ marginTop: 8 }}>
          <button
            onClick={() => setShowPicker(!showPicker)}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 10, padding: '3px 10px', fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            + Reaksiya
          </button>
          {showPicker && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {REACTIONS.map(emoji => (
                <button key={emoji} onClick={() => { onReaction(emoji); setShowPicker(false) }}
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 8px', fontSize: 16, cursor: 'pointer' }}>
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

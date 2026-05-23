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

export default function TaskCard({
  num, icon, title, completed, color, readOnly,
  onToggle, onReaction, showReactions, children
}: TaskCardProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false)

  const accent = color === 'cyan' ? 'var(--cyan)' : 'var(--red)'
  const glow = color === 'cyan' ? 'var(--cyan-glow)' : 'var(--red-glow)'
  const bg = color === 'cyan' ? 'var(--cyan-bg)' : 'var(--red-bg)'
  const border = color === 'cyan' ? 'var(--cyan-border)' : 'var(--red-border)'

  return (
    <div style={{
      background: completed ? bg : 'var(--bg-input)',
      border: `1px solid ${completed ? border : 'var(--border)'}`,
      borderRadius: 12,
      padding: '14px',
      boxShadow: completed ? `0 0 12px ${glow}` : 'none',
      transition: 'all 0.25s ease',
      position: 'relative',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* Number */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text-faint)',
          marginTop: 2,
          flexShrink: 0,
          width: 20,
        }}>
          {num}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 0.5,
            color: completed ? accent : 'var(--text)',
            lineHeight: 1.3,
          }}>
            {icon} {title}
          </div>

          {/* Children (sub-content like inputs) */}
          {children && (
            <div style={{ marginTop: 10 }}>
              {children}
            </div>
          )}
        </div>

        {/* Checkmark */}
        {!readOnly && (
          <button
            onClick={onToggle}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: `1.5px solid ${completed ? accent : 'var(--border-hover)'}`,
              background: completed ? accent : 'transparent',
              color: completed ? (color === 'cyan' ? '#000' : '#fff') : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
              transition: 'all 0.25s ease',
              animation: completed ? 'check-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'none',
            }}
          >
            {completed ? '✓' : ''}
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div style={{
        marginTop: 10,
        height: 2,
        background: 'var(--border)',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: completed ? '100%' : '0%',
          background: accent,
          borderRadius: 2,
          transition: 'width 0.5s ease',
          boxShadow: completed ? `0 0 6px ${glow}` : 'none',
        }} />
      </div>

      {/* Reaction button (for partner's panel) */}
      {showReactions && onReaction && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '4px 10px',
              fontSize: 11,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              letterSpacing: 1,
            }}
          >
            + Reaksiya
          </button>

          {showReactionPicker && (
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              marginTop: 8,
              animation: 'fade-in 0.2s ease',
            }}>
              {REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReaction(emoji)
                    setShowReactionPicker(false)
                  }}
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    padding: '4px 8px',
                    fontSize: 16,
                    cursor: 'pointer',
                    transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                >
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

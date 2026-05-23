'use client'

import { useEffect, useState } from 'react'

export interface Toast {
  id: string
  message: string
  type: 'cyan' | 'red' | 'gold'
  emoji?: string
}

interface ToastProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export default function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, 4500)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const colors = {
    cyan: { border: 'var(--cyan-border)', accent: 'var(--cyan)', bg: 'var(--cyan-bg)' },
    red: { border: 'var(--red-border)', accent: 'var(--red)', bg: 'var(--red-bg)' },
    gold: { border: 'rgba(255,215,0,0.4)', accent: 'var(--gold)', bg: 'var(--gold-bg)' },
  }
  const c = colors[toast.type]

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        padding: '14px 18px',
        maxWidth: 300,
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 16px ${c.bg}`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 0.3s, transform 0.3s',
        pointerEvents: 'all',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
      }}
      onClick={() => {
        setVisible(false)
        setTimeout(() => onRemove(toast.id), 300)
      }}
    >
      {toast.emoji && <span style={{ fontSize: 20, lineHeight: 1.2 }}>{toast.emoji}</span>}
      <div>
        <div style={{
          fontSize: 10,
          letterSpacing: 2,
          color: c.accent,
          fontWeight: 700,
          marginBottom: 4,
        }}>
          YANGILIK
        </div>
        <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.4 }}>
          {toast.message}
        </div>
      </div>
    </div>
  )
}

// Hook for managing toasts
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: Toast['type'] = 'cyan', emoji?: string) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type, emoji }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}

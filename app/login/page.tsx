'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { verifyPin, saveSession, getSession } from '@/lib/auth'
import { UserID, USERS } from '@/types'
import { useTheme } from '@/hooks/useTheme'

export default function LoginPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [selected, setSelected] = useState<UserID | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const pinRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const session = getSession()
    if (session) router.replace('/dashboard')
  }, [router])

  const handleSelectUser = (userId: UserID) => {
    setSelected(userId)
    setPin('')
    setError('')
    setTimeout(() => pinRef.current?.focus(), 100)
  }

  const handleLogin = () => {
    if (!selected) return
    if (pin.length < 4) {
      setError('Kamida 4 ta raqam kiriting')
      return
    }
    setLoading(true)
    const ok = verifyPin(selected, pin)
    if (ok) {
      saveSession(selected)
      router.replace('/dashboard')
    } else {
      setError('Noto\'g\'ri parol!')
      setPin('')
      setLoading(false)
    }
  }

  const isCyan = selected === 'muhammadyusuf'
  const accentColor = selected ? (isCyan ? 'var(--cyan)' : 'var(--red)') : 'var(--text-muted)'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '20px',
      position: 'relative',
    }}>
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute', top: 20, right: 20,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '8px 16px',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontFamily: 'var(--font-main)',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 1,
        }}
      >
        {theme === 'dark' ? '☀️ Yorug\'' : '🌙 Qorong\'u'}
      </button>

      {/* Background glow */}
      <div style={{
        position: 'absolute', top: '20%', left: '30%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(0,245,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '25%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(255,23,68,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 24,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 420,
        textAlign: 'center',
        animation: 'fade-in 0.5s ease forwards',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: 6,
          background: 'linear-gradient(90deg, var(--cyan), var(--red))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: 8,
        }}>
          STREAK
        </div>
        <div style={{
          fontSize: 11,
          letterSpacing: 3,
          color: 'var(--text-muted)',
          marginBottom: 40,
          fontWeight: 600,
        }}>
          7 KUNLIK INTIZOM BELLASHUVI
        </div>

        {/* User selection */}
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, letterSpacing: 1 }}>
          O&apos;zingizni tanlang
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 32 }}>
          {(['muhammadyusuf', 'shavkatjon'] as UserID[]).map(uid => {
            const user = USERS[uid]
            const isActive = selected === uid
            const color = uid === 'muhammadyusuf' ? 'var(--cyan)' : 'var(--red)'
            const bgColor = uid === 'muhammadyusuf' ? 'var(--cyan-bg)' : 'var(--red-bg)'
            const borderColor = uid === 'muhammadyusuf' ? 'var(--cyan-border)' : 'var(--red-border)'
            const glow = uid === 'muhammadyusuf' ? 'var(--cyan-glow)' : 'var(--red-glow)'

            return (
              <button
                key={uid}
                onClick={() => handleSelectUser(uid)}
                style={{
                  padding: '24px 16px',
                  borderRadius: 16,
                  border: `2px solid ${isActive ? color : 'var(--border)'}`,
                  background: isActive ? bgColor : 'transparent',
                  boxShadow: isActive ? `0 0 24px ${glow}` : 'none',
                  cursor: 'pointer',
                  color,
                  fontFamily: 'var(--font-main)',
                  fontWeight: 700,
                  fontSize: 15,
                  letterSpacing: 1,
                  transition: 'all 0.25s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: isActive ? `rgba(${uid === 'muhammadyusuf' ? '0,245,255' : '255,23,68'},0.15)` : 'var(--bg-input)',
                  border: `1.5px solid ${isActive ? color : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 16,
                  fontWeight: 700,
                  color,
                  letterSpacing: -1,
                }}>
                  {user.initials}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.3 }}>{user.name}</div>
              </button>
            )
          })}
        </div>

        {/* PIN input */}
        {selected && (
          <div style={{ animation: 'fade-in 0.3s ease forwards' }}>
            <div style={{
              fontSize: 11,
              letterSpacing: 2.5,
              color: 'var(--text-muted)',
              marginBottom: 12,
              fontWeight: 600,
            }}>
              MAXFIY KOD (MIN 4 TA RAQAM)
            </div>

            <input
              ref={pinRef}
              type="password"
              value={pin}
              onChange={e => { setPin(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              maxLength={8}
              placeholder="••••"
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: `1px solid ${error ? 'var(--red)' : accentColor}`,
                borderRadius: 12,
                padding: '16px',
                color: accentColor,
                fontFamily: 'var(--font-mono)',
                fontSize: 28,
                textAlign: 'center',
                letterSpacing: 12,
                outline: 'none',
                marginBottom: 8,
                transition: 'border-color 0.2s',
              }}
            />

            {error && (
              <div style={{
                color: 'var(--red)',
                fontSize: 12,
                marginBottom: 12,
                letterSpacing: 0.5,
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || pin.length < 4}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 12,
                border: 'none',
                background: isCyan ? 'var(--cyan)' : 'var(--red)',
                color: isCyan ? '#000' : '#fff',
                fontFamily: 'var(--font-main)',
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 3,
                cursor: pin.length >= 4 ? 'pointer' : 'not-allowed',
                opacity: pin.length < 4 ? 0.5 : 1,
                transition: 'all 0.25s',
                boxShadow: pin.length >= 4
                  ? `0 0 24px ${isCyan ? 'var(--cyan-glow)' : 'var(--red-glow)'}`
                  : 'none',
                marginTop: 8,
              }}
            >
              {loading ? 'KIRISH...' : 'KIRISH →'}
            </button>

            <div style={{
              marginTop: 14,
              fontSize: 11,
              color: 'var(--text-faint)',
              letterSpacing: 0.5,
            }}>
              Birinchi kirishda parol o&apos;rnatiladi
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

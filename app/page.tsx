'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    const session = getSession()
    if (session) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [router])
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: 4,
        background: 'linear-gradient(90deg, #00f5ff, #ff1744)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        STREAK
      </div>
    </div>
  )
}

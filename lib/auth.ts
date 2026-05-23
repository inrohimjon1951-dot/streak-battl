import { UserID, USERS } from '@/types'

// Store hashed PINs in localStorage (browser only)
// Format: streak_pin_muhammadyusuf, streak_pin_shavkatjon
const PIN_KEY_PREFIX = 'streak_pin_'
const SESSION_KEY = 'streak_session'

export function getPinKey(userId: UserID): string {
  return `${PIN_KEY_PREFIX}${userId}`
}

export function hashPin(pin: string): string {
  // Simple hash for client-side storage
  let hash = 0
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36) + pin.length.toString()
}

export function savePin(userId: UserID, pin: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(getPinKey(userId), hashPin(pin))
}

export function verifyPin(userId: UserID, pin: string): boolean {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(getPinKey(userId))
  if (!stored) {
    // First time - save the PIN
    savePin(userId, pin)
    return true
  }
  return stored === hashPin(pin)
}

export function hasPinSet(userId: UserID): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem(getPinKey(userId))
}

export interface Session {
  userId: UserID
  loginTime: number
}

export function saveSession(userId: UserID): void {
  if (typeof window === 'undefined') return
  const session: Session = {
    userId,
    loginTime: Date.now(),
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}

export function getCurrentUser() {
  const session = getSession()
  if (!session) return null
  return USERS[session.userId]
}

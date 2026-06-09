import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './auth.internal'
import type { AuthUser } from '@/types'

const AUTH_TOKEN_KEY = 'gymos_auth_token'
const AUTH_USER_KEY = 'gymos_auth_user'

function loadToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

function loadUser(): AuthUser | null {
  const stored = sessionStorage.getItem(AUTH_USER_KEY)
  if (!stored) return null

  try {
    return JSON.parse(stored) as AuthUser
  } catch {
    sessionStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

// ── Context ───────────────────────────────────────────────

// ── Provider ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(() => loadUser())
  const [token, setToken] = useState<string | null>(() => loadToken())
  const loading = false

  const login = useCallback((newToken: string, userData: AuthUser) => {
    sessionStorage.setItem(AUTH_TOKEN_KEY, newToken)
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    sessionStorage.removeItem(AUTH_USER_KEY)
    setToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const getToken = useCallback((): string | null => token ?? loadToken(), [token])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}


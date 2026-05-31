import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from './auth.internal'
import type { AuthUser } from '@/types'

// ── Module-level token store ──────────────────────────────
// Avoids localStorage per plan spec — survives re-renders
// but clears on full page refresh (expected behaviour for
// a management system where sessions shouldn't persist).
let _token: string | null = null

// ── Context ───────────────────────────────────────────────

// ── Provider ──────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [user,    setUser]    = useState<AuthUser | null>(null)
  const [token,   setToken]   = useState<string | null>(null)
  const loading = false
  // No rehydration from storage — sessions start fresh on
  // each page load as required by the plan.

  const login = useCallback((newToken: string, userData: AuthUser) => {
    _token = newToken
    setToken(newToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    _token = null
    setToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const getToken = useCallback((): string | null => _token, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}


import { createContext } from 'react'
import type { AuthUser } from '@/types'

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
  getToken: () => string | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)

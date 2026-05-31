import api from './api'
import type { AuthUser } from '@/types'

// ── Shapes ────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

// ── Calls ─────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Accepts both member and staff credentials.
 * Returns a signed JWT and the user's profile.
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const res = await api.post<{ data: AuthResponse }>('/auth/login', payload)
  return res.data.data
}

/**
 * POST /api/auth/register
 * Member self-registration only.
 * Returns a signed JWT and the newly created member profile.
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await api.post<{ data: AuthResponse }>('/auth/register', payload)
  return res.data.data
}

/**
 * GET /api/auth/me
 * Protected — requires a valid JWT in the Authorization header.
 * Used to rehydrate the logged-in user's profile.
 */
export async function getMe(): Promise<AuthUser> {
  const res = await api.get<{ data: AuthUser }>('/auth/me')
  return res.data.data
}
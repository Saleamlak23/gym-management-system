import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

// ── Base instance ─────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ── Token injection ───────────────────────────────────────
// Populated by AuthContext after login; avoids a circular
// import between the context and the service files.

let _getToken: (() => string | null) | null = null

export function setTokenGetter(fn: () => string | null): void {
  _getToken = fn
}

// ── Request interceptor — attach JWT ──────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = _getToken?.()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — normalise errors ───────────────
// Every rejected promise becomes a plain Error whose
// .message is the human-readable string from the backend,
// so callers only need to catch (err) and read err.message.

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: unknown[] }>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred'
    return Promise.reject(new Error(message))
  },
)

export default api
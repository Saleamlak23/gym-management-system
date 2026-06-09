import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { HOME_BY_ROLE } from '@/context/auth.constants'
import { loginUser } from '@/services/auth.service'
import { Button, Input } from '@/components'
import {
  validateEmail,
  validatePassword,
  validateForm,
  isValid,
} from '@/utils/validators'
import '@/components/components.css'

interface FormState {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
}

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { login } = useAuth()

  const [form, setForm]         = useState<FormState>({ email: '', password: '' })
  const [errors, setErrors]     = useState<FormErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)

  const set =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }))
      setErrors((er) => ({ ...er, [field]: undefined }))
    }

  const handleSubmit = async () => {
    const errs = validateForm(form, {
      email:    validateEmail,
      password: validatePassword,
    })

    if (!isValid(errs)) {
      setErrors(errs)
      return
    }

    setLoading(true)
    setApiError('')

    try {
      const { token, user } = await loginUser(form)
      login(token, user)

      // Redirect to where they were trying to go, or role home.
      // If the stored `from` points to a path the current user isn't
      // permitted to view (e.g. member -> /staff), fall back to their
      // role home to avoid an immediate 403 page.
      const from = (location.state as { from?: Location })?.from?.pathname
      const roleHome = HOME_BY_ROLE[user.role]

      const prefixAllowedRoles: Record<string, string[]> = {
        '/admin': ['enterprise_admin'],
        '/branch': ['enterprise_admin', 'branch_manager'],
        '/staff': ['staff', 'trainer', 'enterprise_admin'],
        '/member': ['member', 'enterprise_admin'],
      }

      const isAllowedForFrom = (path?: string) => {
        if (!path) return true
        // find the mapping key that matches the path prefix
        const key = Object.keys(prefixAllowedRoles).find((p) => path.startsWith(p))
        if (!key) return true // unknown routes — let routing decide
        return prefixAllowedRoles[key].includes(user.role)
      }

      const target = isAllowedForFrom(from) ? (from ?? roleHome) : roleHome
      navigate(target, { replace: true })
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Invalid email or password',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        {/* Brand */}
        <div className="auth-logo">GymOS</div>
        <div className="auth-tagline">Fitness Club Management</div>

        {/* Heading */}
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account to continue</p>

        {/* API error */}
        {apiError && (
          <div
            className="alert alert--danger"
            role="alert"
            aria-live="assertive"
          >
            {apiError}
          </div>
        )}

        {/* Form */}
        <div className="auth-form" onKeyDown={handleKeyDown}>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="current-password"
            required
          />
          <Button
            variant="neon"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            style={{ width: '100%' }}
          >
            Sign In
          </Button>
        </div>

        {/* Footer */}
        <p className="auth-footer">
          New member?{' '}
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}

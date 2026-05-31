import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { registerUser } from '@/services/auth.service'
import { Button, Input } from '@/components'
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
  validateForm,
  isValid,
} from '@/utils/validators'
import '@/components/components.css'

interface FormState {
  first_name: string
  last_name: string
  email: string
  password: string
  confirm_password: string
}

interface FormErrors {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  confirm_password?: string
}

export default function Register() {
  const navigate  = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState<FormState>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  })
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
    const errs: FormErrors = {
      ...validateForm(form, {
        first_name: validateRequired,
        last_name:  validateRequired,
        email:      validateEmail,
        password:   validatePassword,
      }),
    }

    // Confirm password cross-field check
    const confirmErr = validatePasswordMatch(form.password, form.confirm_password)
    if (confirmErr) errs.confirm_password = confirmErr

    if (!isValid(errs)) {
      setErrors(errs)
      return
    }

    setLoading(true)
    setApiError('')

    try {
      const { token, user } = await registerUser({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim(),
        password:   form.password,
      })
      login(token, user)
      navigate('/member', { replace: true })
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Registration failed. Please try again.',
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
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join as a new member</p>

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
          <div className="form-grid">
            <Input
              label="First Name"
              placeholder="John"
              value={form.first_name}
              onChange={set('first_name')}
              error={errors.first_name}
              autoComplete="given-name"
              required
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={form.last_name}
              onChange={set('last_name')}
              error={errors.last_name}
              autoComplete="family-name"
              required
            />
          </div>

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
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="new-password"
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={form.confirm_password}
            onChange={set('confirm_password')}
            error={errors.confirm_password}
            autoComplete="new-password"
            required
          />

          <Button
            variant="neon"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            style={{ width: '100%' }}
          >
            Create Account
          </Button>
        </div>

        {/* Footer */}
        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

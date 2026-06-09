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
  validatePhoneNumber,
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
  phone: string
}

interface FormErrors {
  first_name?: string
  last_name?: string
  email?: string
  password?: string
  confirm_password?: string
  phone?: string
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
    phone: '',
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
        phone:      validatePhoneNumber,
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
      // Normalize phone: accept 91-100-0001 or 911000001 and format as +251-91-100-0001
      const raw = form.phone.trim()
      const fullRe = /^\+251-\d{2}-\d{3}-\d{4}$/
      let phoneToSend = raw

      if (!fullRe.test(raw)) {
        const digits = raw.replace(/\D/g, '')
        if (digits.length === 9) {
          // format as XX-XXX-XXXX
          const national = `${digits.slice(0,2)}-${digits.slice(2,5)}-${digits.slice(5,9)}`
          phoneToSend = `+251-${national}`
        } else {
          // fallback: just prepend +251- to what user typed
          phoneToSend = `+251-${raw}`
        }
      }

      const { token, user } = await registerUser({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim(),
        password:   form.password,
        phone:      phoneToSend,
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

          {/* Phone input placed full-width (same as Email). User types 911000001 or 91-100-0001; +251- prefix is shown */}
          <div className="input-wrap">
            <label className="input-label" htmlFor="phone">
              Phone
              <span className="input-required">*</span>
            </label>

            <div className="input-prefix-wrap">
              <span className="input-prefix">+251</span>
              <input
                id="phone"
                className={`input-field with-prefix${errors.phone ? ' input-field--error' : ''}`}
                placeholder="911000001"
                value={form.phone}
                onChange={set('phone')}
                autoComplete="tel"
                required
              />
            </div>

            {errors.phone && (
              <span id={`phone-error`} className="input-error" role="alert" aria-live="polite">
                ⚠ {errors.phone}
              </span>
            )}
          </div>

          
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

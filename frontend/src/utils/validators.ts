/* ============================================================
   GymOS — Validators
   Pure functions that return error strings or undefined.
   Returning undefined means the value is valid.
   ============================================================ */

// ── Primitives ────────────────────────────────────────────

export function validateRequired(value: unknown): string | undefined {
  if (value === undefined || value === null) return 'This field is required'
  if (typeof value === 'string' && value.trim() === '') return 'This field is required'
  return undefined
}

export function validateEmail(value: string): string | undefined {
  if (!value) return 'Email is required'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(value)) return 'Enter a valid email address'
  return undefined
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required'
  if (value.length < 8) return 'Password must be at least 8 characters'
  return undefined
}

export function validatePasswordMatch(
  password: string,
  confirm: string,
): string | undefined {
  if (password !== confirm) return 'Passwords do not match'
  return undefined
}

export function validatePositiveNumber(value: string | number): string | undefined {
  const n = Number(value)
  if (isNaN(n) || n <= 0) return 'Must be a positive number'
  return undefined
}

export function validateMinLength(
  value: string,
  min: number,
): string | undefined {
  if (value.trim().length < min) return `Must be at least ${min} characters`
  return undefined
}

// ── Date ──────────────────────────────────────────────────

/**
 * Validates that a datetime string is at least 1 hour in
 * the future. Used for personal training session booking.
 */
export function validateAtLeastOneHourAhead(
  value: string,
): string | undefined {
  const diff = new Date(value).getTime() - Date.now()
  if (diff < 60 * 60 * 1000) return 'Must be at least 1 hour from now'
  return undefined
}

/**
 * Validates that end is after start.
 */
export function validateDateRange(
  start: string,
  end: string,
): string | undefined {
  if (new Date(end) <= new Date(start)) return 'End date must be after start date'
  return undefined
}

// ── Form object validator ─────────────────────────────────

type FieldValidators<T> = {
  [K in keyof T]?: (value: T[K]) => string | undefined
}

type FieldErrors<T> = {
  [K in keyof T]?: string
}

/**
 * Runs a map of field validators against a form object.
 * Returns an errors object — empty means all fields are valid.
 *
 * Usage:
 *   const errors = validateForm(form, {
 *     email:    validateEmail,
 *     password: validatePassword,
 *   })
 *   if (Object.keys(errors).length) { setErrors(errors); return }
 */
export function validateForm<T extends object>(
  form: T,
  validators: FieldValidators<T>,
): FieldErrors<T> {
  const errors: FieldErrors<T> = {}

  for (const key in validators) {
    const validate = validators[key]
    if (!validate) continue
    const error = validate(form[key] as T[typeof key])
    if (error) errors[key] = error
  }

  return errors
}

/**
 * Returns true when an errors object has no keys —
 * convenience helper for conditional submit guards.
 */
export function isValid<T>(errors: FieldErrors<T>): boolean {
  return Object.keys(errors).length === 0
}
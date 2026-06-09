import type { InputHTMLAttributes } from 'react'
import './components.css'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({
  label,
  error,
  id,
  required,
  className = '',
  ...rest
}: Props) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="input-wrap">
      {label && (
        <label className="input-label" htmlFor={inputId}>
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      <input
        id={inputId}
        className={`input-field${error ? ' input-field--error' : ''} ${className}`.trim()}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />

      {error && (
        <span
          id={`${inputId}-error`}
          className="input-error"
          role="alert"
          aria-live="polite"
        >
          ⚠ {error}
        </span>
      )}
    </div>
  )
}

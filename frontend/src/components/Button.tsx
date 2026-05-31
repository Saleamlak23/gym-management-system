import type { ReactNode, CSSProperties } from 'react'
import Spinner from './Spinner'
import './components.css'

interface Props {
  children: ReactNode
  variant?: 'primary' | 'neon' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
  style?: CSSProperties
  title?: string
  'aria-label'?: string
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  style,
  title,
  'aria-label': ariaLabel,
}: Props) {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${className}`.trim()}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      title={title}
      aria-label={ariaLabel}
      aria-busy={loading}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

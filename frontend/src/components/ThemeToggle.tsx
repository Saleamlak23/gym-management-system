import { useTheme } from '@/context/useTheme'
import './components.css'

interface Props {
  className?: string
}

export default function ThemeToggle({ className = '' }: Props) {
  const { theme, toggleTheme } = useTheme()
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      className={`theme-toggle btn btn--ghost btn--sm ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {theme === 'dark' ? '☀' : '☾'}
      </span>
      <span className="theme-toggle__label">{nextTheme}</span>
    </button>
  )
}

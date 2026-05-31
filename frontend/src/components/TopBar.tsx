import { useAuth } from '@/context/useAuth'
import { initials, titleCase } from '@/utils/formatters'
import './components.css'

interface Props {
  onMenuClick: () => void
}

export default function TopBar({ onMenuClick }: Props) {
  const { user } = useAuth()

  return (
    <header className="topbar">
      {/* Left — mobile hamburger */}
      <button
        className="btn btn--ghost btn--sm"
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
        style={{ display: 'none' }} // shown via CSS on mobile
      >
        ☰
      </button>

      {/* Spacer — pushes user info to the right on desktop */}
      <div />

      {/* Right — user info chip */}
      {user && (
        <div className="topbar__user" role="status" aria-label="Logged in user">
          <div className="topbar__avatar" aria-hidden="true">
            {initials(`${user.first_name} ${user.last_name}`)}
          </div>
          <div className="topbar__user-info">
            <span className="topbar__user-name">
              {user.first_name} {user.last_name}
            </span>
            <span className="topbar__user-role">
              {titleCase(user.role)}
            </span>
          </div>
        </div>
      )}
    </header>
  )
}

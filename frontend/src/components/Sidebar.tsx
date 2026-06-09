import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { titleCase } from '@/utils/formatters'
import type { UserRole } from '@/types'
import './components.css'

// ── Nav structure per role ────────────────────────────────

interface NavItem {
  to: string
  label: string
  icon: string
  end?: boolean  // exact match for root routes
}

interface NavSection {
  section: string
  items: NavItem[]
}

const NAV: Record<UserRole, NavSection[]> = {
  enterprise_admin: [
    {
      section: 'Overview',
      items: [
        { to: '/admin',            label: 'Dashboard', icon: '◈', end: true },
        { to: '/admin/analytics',  label: 'Analytics', icon: '◎' },
      ],
    },
    {
      section: 'Management',
      items: [
        { to: '/admin/members',  label: 'Members',  icon: '◉' },
        { to: '/admin/staff',    label: 'Staff',    icon: '◐' },
        { to: '/admin/payments', label: 'Payments', icon: '◑' },
        { to: '/admin/branches', label: 'Branches', icon: '◍' },
      ],
    },
  ],

  branch_manager: [
    {
      section: 'Overview',
      items: [
        { to: '/branch', label: 'Dashboard', icon: '◈', end: true },
      ],
    },
    {
      section: 'Operations',
      items: [
        { to: '/branch/classes',    label: 'Classes',    icon: '◉' },
        { to: '/branch/attendance', label: 'Attendance', icon: '◑' },
        { to: '/branch/equipment',  label: 'Equipment',  icon: '◐' },
      ],
    },
  ],

  staff: [
    {
      section: 'Operations',
      items: [
        { to: '/staff',         label: 'Home',     icon: '◈', end: true },
        { to: '/staff/checkin', label: 'Check-In', icon: '◉' },
      ],
    },
  ],

  trainer: [
    {
      section: 'Operations',
      items: [
        { to: '/staff',          label: 'Home',        icon: '◈', end: true },
        { to: '/staff/checkin',  label: 'Check-In',    icon: '◉' },
        { to: '/staff/training', label: 'My Sessions', icon: '◐' },
      ],
    },
  ],

  member: [
    {
      section: 'My Account',
      items: [
        { to: '/member',          label: 'Portal',   icon: '◈', end: true },
        { to: '/member/bookings', label: 'Bookings', icon: '◉' },
        { to: '/member/sessions', label: 'Training', icon: '◐' },
        { to: '/member/payments', label: 'Payments', icon: '◑' },
      ],
    },
  ],
}

// ── Props ─────────────────────────────────────────────────

interface Props {
  mobileOpen?: boolean
  onClose?: () => void
}

// ── Component ─────────────────────────────────────────────

export default function Sidebar({ mobileOpen = false, onClose }: Props) {
  const { user, logout } = useAuth()
  const role = user?.role ?? 'member'
  const sections = NAV[role] ?? NAV.member

  return (
    <nav
      className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo__text">GymOS</div>
        <div className="sidebar-logo__sub">Management Platform</div>
      </div>

      {/* Nav sections */}
      {sections.map((sec) => (
        <div key={sec.section} className="sidebar-section">
          <div className="sidebar-section__label">{sec.section}</div>

          {sec.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-item${isActive ? ' sidebar-item--active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-item__icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}

      {/* Footer — user info + logout */}
      <div className="sidebar-footer">
        {user && (
          <div style={{ marginBottom: 8, padding: '0 4px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>
              {user.first_name} {user.last_name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
              {titleCase(user.role)}
            </div>
          </div>
        )}

        <button
          className="sidebar-item"
          onClick={logout}
          aria-label="Sign out"
        >
          <span className="sidebar-item__icon" aria-hidden="true">⎋</span>
          Sign Out
        </button>
      </div>
    </nav>
  )
}

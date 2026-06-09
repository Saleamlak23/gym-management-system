import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { PageWrapper, Card } from '@/components'
import { titleCase } from '@/utils/formatters'

interface QuickLink {
  label: string
  description: string
  icon: string
  to: string
  roles: string[]
}

const QUICK_LINKS: QuickLink[] = [
  {
    label:       'Check-In Desk',
    description: 'Record member check-ins and check-outs',
    icon:        '◈',
    to:          '/staff/checkin',
    roles:       ['staff', 'trainer'],
  },
  {
    label:       'My Sessions',
    description: 'View and manage your personal training sessions',
    icon:        '◐',
    to:          '/staff/training',
    roles:       ['trainer'],
  },
]

export default function StaffHome() {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const role          = user?.role ?? 'staff'
  const visibleLinks  = QUICK_LINKS.filter((l) => l.roles.includes(role))

  const hour        = new Date().getHours()
  const greeting    = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <PageWrapper
      title="Home"
      subtitle={`${greeting}, ${user?.first_name ?? 'there'}`}
    >
      {/* Role badge */}
      <div style={{ marginBottom: 28 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            background: 'var(--neon-dim)',
            border: '1px solid var(--neon)',
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--neon)',
          }}
        >
          ● {titleCase(role)}
        </span>
      </div>

      {/* Quick links */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {visibleLinks.map((link) => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'border-color var(--transition), background var(--transition)',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--neon)'
              e.currentTarget.style.background  = 'var(--bg-elevated)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background  = 'var(--bg-card)'
            }}
          >
            <span
              style={{
                fontSize: 28,
                color: 'var(--neon)',
                opacity: 0.8,
              }}
              aria-hidden="true"
            >
              {link.icon}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                {link.label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                {link.description}
              </div>
            </div>
            <span
              style={{
                fontSize: 12,
                color: 'var(--neon)',
                marginTop: 4,
              }}
            >
              Open →
            </span>
          </button>
        ))}
      </div>

      {/* Info card */}
      <Card title="Your Account">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 20,
          }}
        >
          {([
            ['Name',   `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()],
            ['Email',  user?.email ?? '—'],
            ['Role',   titleCase(role)],
            ['Branch', user?.branch_id ? `Branch #${user.branch_id}` : '—'],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--text-3)',
                  marginBottom: 4,
                }}
              >
                {label}
              </div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{val || '—'}</div>
            </div>
          ))}
        </div>
      </Card>
    </PageWrapper>
  )
}

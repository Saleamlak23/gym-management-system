import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/useAuth'
import { PageWrapper, Card, Badge, Spinner } from '@/components'
import { getMemberSubscriptions } from '@/services/members.service'
import { getMemberSessions }      from '@/services/training.service'
import { getSchedules }           from '@/services/classes.service'
import { formatDate, formatDateTime, daysUntil } from '@/utils/formatters'
import type { Subscription, TrainingSession, ClassSchedule } from '@/types'

interface QuickLink {
  label:       string
  description: string
  icon:        string
  to:          string
  color:       string
}

const QUICK_LINKS: QuickLink[] = [
  { label: 'Browse Classes',  description: 'Book a class session',          icon: '◉', to: '/member/bookings',  color: 'var(--neon)'    },
  { label: 'Training',        description: 'View personal training sessions', icon: '◐', to: '/member/sessions',  color: 'var(--info)'    },
  { label: 'Payments',        description: 'Your payment history',           icon: '◑', to: '/member/payments',  color: 'var(--success)' },
]

export default function MemberPortal() {
  const navigate   = useNavigate()
  const { user }   = useAuth()
  const memberId   = user?.id ?? 0

  const [subs,       setSubs]       = useState<Subscription[]>([])
  const [sessions,   setSessions]   = useState<TrainingSession[]>([])
  const [schedules,  setSchedules]  = useState<ClassSchedule[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  useEffect(() => {
    Promise.all([
      getMemberSubscriptions(memberId),
      getMemberSessions(memberId),
      getSchedules(),
    ])
      .then(([s, tr, sc]) => {
        setSubs(s)
        setSessions(tr.filter((t) => t.status === 'scheduled' || t.status === 'confirmed').slice(0, 3))
        setSchedules(sc.slice(0, 5))
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [memberId])

  const activeSub = subs.find((s) => s.status === 'active')
  const days      = activeSub ? daysUntil(activeSub.end_date) : 0
  const fillPct   = activeSub ? Math.min(100, Math.max(0, (days / 30) * 100)) : 0
  const isExpiring = days <= 7 && days > 0

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <PageWrapper
      title="My Portal"
      subtitle={`${greeting}, ${user?.first_name ?? 'there'}`}
    >
      {error && <div className="alert alert--danger">{error}</div>}

      {/* Expiry warning */}
      {isExpiring && (
        <div className="alert alert--warning">
          ⚠ Your subscription expires in <strong>{days} day{days !== 1 ? 's' : ''}</strong>.
          Please renew to keep your access.
        </div>
      )}

      {!activeSub && !loading && !error && (
        <div className="alert alert--danger">
          ✕ You have no active subscription. Contact the front desk to sign up.
        </div>
      )}

      {/* Subscription card */}
      {activeSub && (
        <Card title="Active Subscription" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 1, marginBottom: 8 }}>
                {activeSub.type_name}
              </div>
              <div style={{ display: 'flex', gap: 20 }}>
                {([
                  ['Start',   formatDate(activeSub.start_date)],
                  ['End',     formatDate(activeSub.end_date)],
                  ['Status',  null],
                ] as [string, string | null][]).map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', fontWeight: 700, marginBottom: 3 }}>
                      {label}
                    </div>
                    {val
                      ? <div style={{ fontSize: 14, fontWeight: 600 }}>{val}</div>
                      : <Badge status={activeSub.status} />
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* Days remaining ring */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `conic-gradient(var(--neon) ${fillPct * 3.6}deg, var(--bg-elevated) 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1, color: isExpiring ? 'var(--warning)' : 'var(--neon)' }}>
                    {days}
                  </span>
                  <span style={{ fontSize: 8, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    days
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>remaining</div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick links */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {QUICK_LINKS.map((link) => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'border-color var(--transition)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = link.color)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <span style={{ fontSize: 24, color: link.color }} aria-hidden="true">
              {link.icon}
            </span>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{link.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{link.description}</div>
          </button>
        ))}
      </div>

      {/* Two-column bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Upcoming training sessions */}
        <Card
          title="Upcoming Training"
          action={
            <a href="/member/sessions" style={{ fontSize: 12, color: 'var(--neon)' }}>
              View All →
            </a>
          }
        >
          {sessions.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>
                      {s.trainer_name ?? `Trainer #${s.trainer_id}`}
                    </span>
                    <Badge status={s.status} />
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4 }}>
                    {formatDateTime(s.scheduled_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>No upcoming sessions.</p>
          )}
        </Card>

        {/* Available classes */}
        <Card
          title="Upcoming Classes"
          action={
            <a href="/member/bookings" style={{ fontSize: 12, color: 'var(--neon)' }}>
              Book →
            </a>
          }
        >
          {schedules.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {schedules.map((sc) => {
                const booked   = sc.bookings   ?? 0
                const capacity = sc.capacity   ?? 1
                const pct      = (booked / capacity) * 100
                const full     = pct >= 100
                return (
                  <div
                    key={sc.id}
                    style={{
                      padding: '10px 14px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius)',
                      border: `1px solid ${full ? 'var(--danger-dim)' : 'var(--border)'}`,
                      opacity: full ? 0.6 : 1,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{sc.class_name}</span>
                      {full
                        ? <span style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 700 }}>FULL</span>
                        : <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700 }}>{capacity - booked} spots</span>
                      }
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>
                      {formatDateTime(sc.start_time)}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>No classes available.</p>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}

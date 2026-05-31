import { useEffect, useState } from 'react'
import { useAuth } from '@/context/useAuth'
import { PageWrapper, StatCard, Card, Spinner } from '@/components'
import { getBranchAnalytics }   from '@/services/analytics.service'
import { getAttendanceHeatmap } from '@/services/attendance.service'
import { getOverdueEquipment }  from '@/services/equipment.service'
import { formatDateTime, formatCurrency } from '@/utils/formatters'
import type { BranchAnalytics, HeatmapCell, Equipment } from '@/types'

// ── Peak hours heatmap ────────────────────────────────────

function Heatmap({ data }: { data: HeatmapCell[] }) {
  const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const HOURS = Array.from({ length: 24 }, (_, i) => i)
  const max   = Math.max(...data.map((d) => d.avg_count), 1)

  const get = (day: number, hour: number) =>
    data.find((d) => d.day_of_week === day + 1 && d.hour === hour)?.avg_count ?? 0

  return (
    <div style={{ overflowX: 'auto' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '28px repeat(24, 22px)',
          gap: 2,
          fontSize: 9,
          alignItems: 'center',
          minWidth: 580,
        }}
      >
        {/* Hour headers */}
        <div />
        {HOURS.map((h) => (
          <div
            key={h}
            style={{
              textAlign: 'center',
              color: 'var(--text-3)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {h}
          </div>
        ))}

        {/* Rows */}
        {DAYS.map((day, di) => (
          <>
            <div
              key={`label-${di}`}
              style={{
                color: 'var(--text-2)',
                fontWeight: 700,
                fontSize: 8,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {day}
            </div>
            {HOURS.map((h) => {
              const val     = get(di, h)
              const opacity = Math.max(0.05, val / max)
              return (
                <div
                  key={`${di}-${h}`}
                  title={`${day} ${h}:00 — avg ${val.toFixed(1)} check-ins`}
                  style={{
                    width: 22,
                    height: 14,
                    borderRadius: 2,
                    background: `rgba(170, 255, 0, ${opacity})`,
                    cursor: 'default',
                  }}
                />
              )
            })}
          </>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 10,
          fontSize: 11,
          color: 'var(--text-2)',
        }}
      >
        <span>Less</span>
        {[0.05, 0.2, 0.4, 0.7, 1].map((o) => (
          <div
            key={o}
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: `rgba(170, 255, 0, ${o})`,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────

export default function BranchDashboard() {
  const { user } = useAuth()
  const branchId = user?.branch_id ?? 1

  const [analytics, setAnalytics] = useState<BranchAnalytics | null>(null)
  const [heatmap,   setHeatmap]   = useState<HeatmapCell[]>([])
  const [overdue,   setOverdue]   = useState<Equipment[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  useEffect(() => {
    Promise.all([
      getBranchAnalytics(branchId),
      getAttendanceHeatmap(branchId),
      getOverdueEquipment(),
    ])
      .then(([a, h, o]) => {
        setAnalytics(a)
        setHeatmap(h)
        setOverdue(o)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [branchId])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <PageWrapper title="Branch Dashboard" subtitle="Your branch at a glance">
      {error && <div className="alert alert--danger">{error}</div>}

      {/* Equipment alert */}
      {overdue.length > 0 && (
        <div className="alert alert--danger">
          ⚠&nbsp;
          <strong>{overdue.length} equipment item{overdue.length > 1 ? 's are' : ' is'} overdue for service.</strong>
          &nbsp;
          <a href="/branch/equipment" style={{ textDecoration: 'underline' }}>
            View Equipment →
          </a>
        </div>
      )}

      {/* KPIs */}
      <div className="kpi-grid">
        <StatCard
          label="Active Members"
          value={analytics?.activeMembers}
          icon="◉"
        />
        <StatCard
          label="Today's Check-Ins"
          value={analytics?.todayAttendance}
          icon="◈"
        />
        <StatCard
          label="Class Fill Rate"
          value={analytics?.classFillRate != null ? `${analytics.classFillRate}%` : null}
          icon="◐"
        />
        <StatCard
          label="Monthly Revenue"
          value={formatCurrency(analytics?.monthlyRevenue ?? 0)}
          icon="◑"
        />
        <StatCard
          label="Equipment Alerts"
          value={overdue.length}
          icon="⚙"
          trendDir={overdue.length > 0 ? 'down' : 'up'}
        />
      </div>

      {/* Today's class schedule */}
      <Card title="Today's Classes" style={{ marginBottom: 24 }}>
        {analytics?.todaysClasses?.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Time</th>
                  <th>Instructor</th>
                  <th>Bookings</th>
                </tr>
              </thead>
              <tbody>
                {analytics.todaysClasses.map((cls) => {
                  const booked   = cls.bookings   ?? 0
                  const capacity = cls.capacity   ?? 1
                  const pct      = (booked / capacity) * 100
                  const fill     = pct >= 90 ? 'high' : pct >= 60 ? 'mid' : 'low'
                  return (
                    <tr key={cls.id}>
                      <td style={{ fontWeight: 600 }}>{cls.class_name}</td>
                      <td className="mono">{formatDateTime(cls.start_time)}</td>
                      <td>{cls.instructor_name ?? '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className="mono">
                            {booked}/{capacity}
                          </span>
                          <div className="cap-bar">
                            <div
                              className={`cap-bar__fill cap-bar__fill--${fill}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            No classes scheduled today.
          </p>
        )}
      </Card>

      {/* Recent attendance */}
      <Card
        title="Today's Attendance"
        style={{ marginBottom: 24 }}
        action={
          <a href="/branch/attendance" style={{ fontSize: 12, color: 'var(--neon)' }}>
            View All →
          </a>
        }
      >
        {analytics?.recentAttendance?.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentAttendance.slice(0, 10).map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{a.member_name ?? '—'}</td>
                    <td className="mono">{formatDateTime(a.check_in)}</td>
                    <td className="mono">
                      {a.check_out
                        ? formatDateTime(a.check_out)
                        : <span style={{ color: 'var(--text-3)' }}>Still in</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            No check-ins yet today.
          </p>
        )}
      </Card>

      {/* Peak hours heatmap */}
      <Card title="Peak Hours — Last 30 Days">
        <p style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 16 }}>
          Average check-ins by day of week and hour
        </p>
        <Heatmap data={heatmap} />
      </Card>
    </PageWrapper>
  )
}

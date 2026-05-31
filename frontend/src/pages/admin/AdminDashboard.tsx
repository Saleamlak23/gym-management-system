import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper, StatCard, Card, Spinner } from '@/components'
import {
  getOverview,
  getRevenueTrend,
  getMemberGrowth,
} from '@/services/analytics.service'
import { formatCurrency } from '@/utils/formatters'
import type { OverviewAnalytics, RevenueDataPoint, GrowthDataPoint } from '@/types'

// ── SVG Line Chart ────────────────────────────────────────

function LineChart({ data }: { data: RevenueDataPoint[] }) {
  if (!data.length) return null
  const W = 540, H = 150, PX = 40, PY = 20
  const vals = data.map((d) => d.value)
  const max  = Math.max(...vals, 1)
  const min  = Math.min(...vals, 0)
  const rng  = max - min || 1

  const toX = (i: number) => PX + (i / (data.length - 1)) * (W - PX * 2)
  const toY = (v: number) => H - PY - ((v - min) / rng) * (H - PY * 2)
  const pts  = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
      {/* Grid lines */}
      {[0, 0.5, 1].map((t) => {
        const y = toY(min + t * rng)
        return (
          <g key={t}>
            <line x1={PX} y1={y} x2={W - PX} y2={y}
              stroke="var(--border)" strokeDasharray="4 4" />
            <text x={PX - 6} y={y + 4} fill="var(--text-3)"
              fontSize={10} textAnchor="end" fontFamily="var(--font-mono)">
              {formatCurrency(min + t * rng).replace('.00', '')}
            </text>
          </g>
        )
      })}
      {/* X axis labels */}
      {data.map((d, i) => (
        <text key={i} x={toX(i)} y={H} fill="var(--text-3)"
          fontSize={10} textAnchor="middle" fontFamily="var(--font-mono)">
          {d.month}
        </text>
      ))}
      {/* Line */}
      <polyline points={pts} fill="none" stroke="var(--neon)" strokeWidth={2} />
      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={toX(i)} cy={toY(d.value)} r={4}
          fill="var(--neon)" stroke="var(--bg-base)" strokeWidth={2}>
          <title>{d.month}: {formatCurrency(d.value)}</title>
        </circle>
      ))}
    </svg>
  )
}

// ── SVG Bar Chart ─────────────────────────────────────────

function BarChart({ data }: { data: GrowthDataPoint[] }) {
  if (!data.length) return null
  const W = 540, H = 150, PX = 40, PY = 20
  const max = Math.max(...data.map((d) => d.count), 1)
  const bw  = ((W - PX * 2) / data.length) - 4

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
      <line x1={PX} y1={H - PY} x2={W - PX} y2={H - PY}
        stroke="var(--border)" />
      {data.map((d, i) => {
        const bh = (d.count / max) * (H - PY * 2)
        const x  = PX + i * ((W - PX * 2) / data.length) + 2
        const y  = H - PY - bh
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh}
              fill="var(--neon-dim)" stroke="var(--neon)" strokeWidth={1} rx={2}>
              <title>{d.month}: {d.count} new members</title>
            </rect>
            <text x={x + bw / 2} y={H} fill="var(--text-3)"
              fontSize={10} textAnchor="middle" fontFamily="var(--font-mono)">
              {d.month}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── Main Page ─────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate()

  const [overview, setOverview] = useState<OverviewAnalytics | null>(null)
  const [revenue,  setRevenue]  = useState<RevenueDataPoint[]>([])
  const [growth,   setGrowth]   = useState<GrowthDataPoint[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    Promise.all([
      getOverview(),
      getRevenueTrend(),
      getMemberGrowth(),
    ])
      .then(([ov, rev, gr]) => {
        setOverview(ov)
        setRevenue(rev)
        setGrowth(gr)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <PageWrapper title="Dashboard" subtitle="Enterprise-wide overview">
      {error && <div className="alert alert--danger">{error}</div>}

      {/* KPI grid */}
      <div className="kpi-grid">
        <StatCard label="Active Members"         value={overview?.totalMembers}             icon="◉" />
        <StatCard label="Active Subscriptions"   value={overview?.activeSubscriptions}      icon="◍" />
        <StatCard label="Today's Check-Ins"      value={overview?.todayCheckIns}            icon="◈" />
        <StatCard label="Monthly Revenue"        value={formatCurrency(overview?.monthlyRevenue ?? 0)} icon="◑" />
        <StatCard label="Classes This Week"      value={overview?.classesThisWeek}          icon="◐" />
        <StatCard label="Equipment Maintenance"  value={overview?.equipmentUnderMaintenance} icon="⚙"
          trend={overview?.equipmentUnderMaintenance ? `${overview.equipmentUnderMaintenance} items` : undefined}
          trendDir="down"
        />
      </div>

      {/* Branch table */}
      <Card title="All Branches" style={{ marginBottom: 24 }}>
        {overview?.branches?.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Branch</th>
                  <th>Active Members</th>
                  <th>Today's Attendance</th>
                  <th>Monthly Revenue</th>
                  <th>Equipment Issues</th>
                </tr>
              </thead>
              <tbody>
                {overview.branches.map((b) => (
                  <tr
                    key={b.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/branch')}
                    title={`Go to ${b.name} dashboard`}
                  >
                    <td style={{ fontWeight: 600 }}>{b.name}</td>
                    <td className="mono">{b.activeMembers ?? '—'}</td>
                    <td className="mono">{b.todayAttendance ?? '—'}</td>
                    <td className="mono">{formatCurrency(b.monthlyRevenue ?? 0)}</td>
                    <td>
                      {b.equipmentIssues > 0 ? (
                        <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                          ⚠ {b.equipmentIssues}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--success)' }}>✓ Clear</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
            No branch data available.
          </p>
        )}
      </Card>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <Card title="Revenue — Last 6 Months">
          <LineChart data={revenue} />
        </Card>
        <Card title="New Members — This Year">
          <BarChart data={growth} />
        </Card>
      </div>
    </PageWrapper>
  )
}

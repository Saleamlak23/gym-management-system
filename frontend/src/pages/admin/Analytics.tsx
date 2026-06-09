import { useEffect, useState } from 'react'
import { PageWrapper, Card, Spinner } from '@/components'
import {
  getRevenueTrend,
  getMemberGrowth,
  getClassFillRates,
} from '@/services/analytics.service'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import type { RevenueDataPoint, GrowthDataPoint } from '@/types'
import type { ClassFillRate } from '@/services/analytics.service'

const W = 600, H = 180, PX = 48, PY = 24

function GridLines({ min, max }: { min: number; max: number }) {
  return (
    <>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = (H - PY) - t * (H - PY * 2)
        const v = min + t * (max - min)
        return (
          <g key={t}>
            <line x1={PX} y1={y} x2={W - PX} y2={y}
              stroke="var(--border)" strokeDasharray="4 4" />
            <text x={PX - 6} y={y + 4} fill="var(--text-3)"
              fontSize={9} textAnchor="end" fontFamily="var(--font-mono)">
              {v > 999 ? formatCurrency(v).replace('.00', '') : Math.round(v)}
            </text>
          </g>
        )
      })}
    </>
  )
}

function LineChart({ data }: { data: RevenueDataPoint[] }) {
  if (!data.length) return <p style={{ color: 'var(--text-2)', fontSize: 13 }}>No data</p>
  const vals = data.map((d) => d.value)
  const max  = Math.max(...vals, 1)
  const min  = Math.min(...vals, 0)
  const rng  = max - min || 1
  const toX  = (i: number) => PX + (i / Math.max(data.length - 1, 1)) * (W - PX * 2)
  const toY  = (v: number) => (H - PY) - ((v - min) / rng) * (H - PY * 2)
  const pts  = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ')
  const area = [`M ${toX(0)},${H - PY}`, ...data.map((d, i) => `L ${toX(i)},${toY(d.value)}`), `L ${toX(data.length - 1)},${H - PY}`, 'Z'].join(' ')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id="neon-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="var(--neon)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--neon)" stopOpacity="0"   />
        </linearGradient>
      </defs>
      <GridLines min={min} max={max} />
      <path d={area} fill="url(#neon-grad)" />
      <polyline points={pts} fill="none" stroke="var(--neon)" strokeWidth={2} />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={toX(i)} cy={toY(d.value)} r={4} fill="var(--neon)" stroke="var(--bg-base)" strokeWidth={2} />
          <text x={toX(i)} y={H + 2} fill="var(--text-3)" fontSize={9} textAnchor="middle" fontFamily="var(--font-mono)">{d.month}</text>
        </g>
      ))}
    </svg>
  )
}

function BarChart({ data }: { data: GrowthDataPoint[] }) {
  if (!data.length) return <p style={{ color: 'var(--text-2)', fontSize: 13 }}>No data</p>
  const max = Math.max(...data.map((d) => d.count), 1)
  const bw  = ((W - PX * 2) / data.length) - 6
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
      <GridLines min={0} max={max} />
      {data.map((d, i) => {
        const bh = (d.count / max) * (H - PY * 2)
        const x  = PX + i * ((W - PX * 2) / data.length) + 3
        const y  = (H - PY) - bh
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={bh} rx={3} fill="var(--neon-dim)" stroke="var(--neon)" strokeWidth={1}>
              <title>{d.month}: {d.count} new members</title>
            </rect>
            <text x={x + bw / 2} y={H + 2} fill="var(--text-3)" fontSize={9} textAnchor="middle" fontFamily="var(--font-mono)">{d.month}</text>
          </g>
        )
      })}
    </svg>
  )
}

function FillRateBar({ rate }: { rate: number }) {
  const pct       = Math.min(100, Math.max(0, rate))
  const fillClass = pct >= 85 ? 'high' : pct >= 50 ? 'mid' : 'low'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="cap-bar" style={{ width: 80 }}>
        <div className={`cap-bar__fill cap-bar__fill--${fillClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="mono" style={{ fontSize: 12 }}>{formatPercent(pct / 100)}</span>
    </div>
  )
}

type GroupBy = 'month' | 'week'

export default function Analytics() {
  const [revenue,   setRevenue]   = useState<RevenueDataPoint[]>([])
  const [growth,    setGrowth]    = useState<GrowthDataPoint[]>([])
  const [fillRates, setFillRates] = useState<ClassFillRate[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [groupBy,   setGroupBy]   = useState<GroupBy>('month')

  const revenueTotal = revenue.reduce((s, d) => s + d.value, 0)
  const memberTotal  = growth.reduce((s, d) => s + d.count, 0)

  useEffect(() => {
    setLoading(true)
    Promise.all([getRevenueTrend({ group_by: groupBy }), getMemberGrowth(), getClassFillRates()])
      .then(([rev, gr, fr]) => { setRevenue(rev); setGrowth(gr); setFillRates(fr) })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [groupBy])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <Spinner size="lg" />
    </div>
  )

  return (
    <PageWrapper title="Analytics" subtitle="Performance & insights">
      {error && <div className="alert alert--danger">{error}</div>}

      <Card title="Revenue Trend" style={{ marginBottom: 24 }}
        action={
          <div style={{ display: 'flex', gap: 4 }}>
            {(['month', 'week'] as GroupBy[]).map((g) => (
              <button key={g} className={`tab-btn${groupBy === g ? ' tab-btn--active' : ''}`}
                style={{ padding: '4px 10px', fontSize: 11 }} onClick={() => setGroupBy(g)}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </button>
            ))}
          </div>
        }
      >
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--neon)' }}>{formatCurrency(revenueTotal)}</span>
          <span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 8 }}>total over period</span>
        </div>
        <LineChart data={revenue} />
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <Card title="New Member Signups — This Year">
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 32 }}>{memberTotal}</span>
            <span style={{ fontSize: 12, color: 'var(--text-2)', marginLeft: 8 }}>new members</span>
          </div>
          <BarChart data={growth} />
        </Card>

        <Card title="Class Fill Rates">
          {fillRates.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Class</th><th>Branch</th><th>Fill Rate</th></tr></thead>
                <tbody>
                  {fillRates.sort((a, b) => b.avg_fill_rate - a.avg_fill_rate).map((fr) => (
                    <tr key={`${fr.class_id}-${fr.branch_id}`}>
                      <td style={{ fontWeight: 600 }}>{fr.class_name}</td>
                      <td style={{ color: 'var(--text-2)' }}>{fr.branch_name}</td>
                      <td><FillRateBar rate={fr.avg_fill_rate} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-2)', fontSize: 14 }}>No class data available.</p>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}

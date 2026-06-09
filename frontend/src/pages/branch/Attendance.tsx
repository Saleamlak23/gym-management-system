import { useEffect, useCallback, useState } from 'react'
import { useAuth } from '@/context/useAuth'
import { PageWrapper, Card, Table, StatCard } from '@/components'
import type { Column } from '@/components'
import { getBranchAttendance } from '@/services/attendance.service'
import { formatDateTime } from '@/utils/formatters'
import type { AttendanceRecord } from '@/types'

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default function Attendance() {
  const { user } = useAuth()
  const branchId = user?.branch_id ?? 1

  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [branchName, setBranchName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [date,    setDate]    = useState(toISODate(new Date()))

  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getBranchAttendance(branchId)
      setBranchName(response.branch?.branch_name || `Branch ${branchId}`)
      // Filter client-side by selected date
      const filtered = response.attendance.filter((r) => r.check_in.startsWith(date))
      setRecords(filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }, [branchId, date])

  useEffect(() => { fetchAttendance() }, [fetchAttendance])

  // ── Derived stats ──────────────────────────────────────
  const stillIn   = records.filter((r) => !r.check_out).length
  const checkedOut = records.filter((r) => !!r.check_out).length

  const avgDuration = (() => {
    const completed = records.filter((r) => r.check_out)
    if (!completed.length) return null
    const totalMs = completed.reduce((sum, r) => {
      return sum + (new Date(r.check_out!).getTime() - new Date(r.check_in).getTime())
    }, 0)
    const avgMin = Math.round(totalMs / completed.length / 60_000)
    const h = Math.floor(avgMin / 60)
    const m = avgMin % 60
    return h ? `${h}h ${m}m` : `${m}m`
  })()

  // ── Columns ────────────────────────────────────────────
  const columns: Column<AttendanceRecord>[] = [
    {
      key: 'member_name',
      label: 'Member',
      render: (v) => (
        <span style={{ fontWeight: 600 }}>{(v as string) ?? '—'}</span>
      ),
    },
    {
      key: 'check_in',
      label: 'Check In',
      render: (v) => (
        <span className="mono">{formatDateTime(v as string)}</span>
      ),
    },
    {
      key: 'check_out',
      label: 'Check Out',
      render: (v) =>
        v ? (
          <span className="mono">{formatDateTime(v as string)}</span>
        ) : (
          <span
            style={{
              color: 'var(--neon)',
              fontWeight: 600,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            ● Still In
          </span>
        ),
    },
    {
      key: 'check_in',
      label: 'Duration',
      sortable: false,
      render: (_, row) => {
        if (!row.check_out) return <span style={{ color: 'var(--text-3)' }}>—</span>
        const ms  = new Date(row.check_out).getTime() - new Date(row.check_in).getTime()
        const min = Math.round(ms / 60_000)
        const h   = Math.floor(min / 60)
        const m   = min % 60
        return (
          <span className="mono" style={{ fontSize: 12 }}>
            {h ? `${h}h ${m}m` : `${m}m`}
          </span>
        )
      },
    },
  ]

  return (
    <PageWrapper
      title="Attendance"
      subtitle={branchName ? `${branchName} — daily check-in log` : 'Daily check-in log'}
    >
      {error && <div className="alert alert--danger">{error}</div>}

      {/* KPI row */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard label="Total Today"   value={records.length} icon="◈" />
        <StatCard label="Still In"      value={stillIn}        icon="●"  />
        <StatCard label="Checked Out"   value={checkedOut}     icon="○"  />
        <StatCard label="Avg Duration"  value={avgDuration}    icon="◑"  />
      </div>

      <Card>
        {/* Date filter */}
        <div className="filters-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label
              htmlFor="att-date"
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-2)',
                whiteSpace: 'nowrap',
              }}
            >
              Date
            </label>
            <input
              id="att-date"
              type="date"
              className="input-field"
              style={{ width: 'auto' }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setDate(toISODate(new Date()))}
          >
            Today
          </button>

          <button
            className="btn btn--secondary btn--sm"
            onClick={fetchAttendance}
          >
            Refresh
          </button>

          <span style={{ fontSize: 13, color: 'var(--text-2)', marginLeft: 'auto' }}>
            {records.length} record{records.length !== 1 ? 's' : ''}
          </span>
        </div>

        <Table
          columns={columns}
          data={records}
          loading={loading}
          emptyMessage="No check-ins recorded for this date"
        />
      </Card>
    </PageWrapper>
  )
}

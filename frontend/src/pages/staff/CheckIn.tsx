import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/context/useAuth'
import { PageWrapper, Card, Button, StatCard } from '@/components'
import { checkIn, checkOut, getBranchAttendance } from '@/services/attendance.service'
import { formatDateTime } from '@/utils/formatters'
import type { AttendanceRecord } from '@/types'

type ActionResult = {
  type: 'success' | 'error'
  message: string
} | null

export default function CheckIn() {
  const { user }  = useAuth()
  const branchId  = user?.branch_id ?? 1

  const [memberId,   setMemberId]   = useState('')
  const [action,     setAction]     = useState<'checkin' | 'checkout'>('checkin')
  const [result,     setResult]     = useState<ActionResult>(null)
  const [processing, setProcessing] = useState(false)

  const [todayLog, setTodayLog]     = useState<AttendanceRecord[]>([])
  const [logLoading, setLogLoading] = useState(true)

  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus the ID field on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const fetchLog = async () => {
    setLogLoading(true)
    try {
      const response = await getBranchAttendance(branchId)
      setTodayLog(response.attendance.slice(0, 20))
    } finally {
      setLogLoading(false)
    }
  }

  useEffect(() => { fetchLog() }, [branchId])

  // Auto-clear result after 4 seconds
  useEffect(() => {
    if (!result) return
    const t = setTimeout(() => setResult(null), 4000)
    return () => clearTimeout(t)
  }, [result])

  const handleSubmit = async () => {
    const id = memberId.trim()
    if (!id || isNaN(Number(id))) {
      setResult({ type: 'error', message: 'Enter a valid numeric member ID' })
      return
    }

    setProcessing(true)
    setResult(null)

    try {
      const payload = { member_id: Number(id), branch_id: branchId }

      if (action === 'checkin') {
        const record = await checkIn(payload)
        setResult({
          type: 'success',
          message: `✓ Check-in recorded for member #${record.member_id} at ${formatDateTime(record.check_in)}`,
        })
      } else {
        const record = await checkOut(payload)
        setResult({
          type: 'success',
          message: `✓ Check-out recorded for member #${record.member_id}`,
        })
      }

      setMemberId('')
      await fetchLog()
    } catch (err) {
      setResult({
        type: 'error',
        message: err instanceof Error ? err.message : 'Operation failed',
      })
    } finally {
      setProcessing(false)
      // Re-focus for rapid sequential check-ins
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  const stillIn    = todayLog.filter((r) => !r.check_out).length
  const totalToday = todayLog.length

  return (
    <PageWrapper title="Check-In Desk" subtitle="Member access control">
      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard label="Today's Total"  value={totalToday} icon="◈" />
        <StatCard label="Currently In"   value={stillIn}    icon="●" />
        <StatCard label="Checked Out"    value={totalToday - stillIn} icon="○" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>

        {/* ── Action panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Member Action">
            {/* Toggle */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius)',
                padding: 4,
                gap: 4,
                marginBottom: 20,
              }}
            >
              {(['checkin', 'checkout'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAction(a)}
                  style={{
                    padding: '10px 0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: 'var(--font-body)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                    background: action === a ? 'var(--neon)' : 'transparent',
                    color: action === a ? 'var(--bg-base)' : 'var(--text-2)',
                  }}
                >
                  {a === 'checkin' ? 'Check In' : 'Check Out'}
                </button>
              ))}
            </div>

            {/* Member ID input */}
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="member-id-input"
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-2)',
                  marginBottom: 6,
                }}
              >
                Member ID <span style={{ color: 'var(--neon)' }}>*</span>
              </label>
              <input
                id="member-id-input"
                ref={inputRef}
                className="input-field"
                style={{ fontSize: 28, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textAlign: 'center' }}
                type="number"
                min="1"
                placeholder="0000"
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
            </div>

            <Button
              variant="neon"
              size="lg"
              loading={processing}
              onClick={handleSubmit}
              style={{ width: '100%' }}
            >
              {action === 'checkin' ? '▶ Check In' : '■ Check Out'}
            </Button>
          </Card>

          {/* Result feedback */}
          {result && (
            <div
              className={`alert alert--${result.type === 'success' ? 'success' : 'danger'} fade-in`}
              role="alert"
              aria-live="assertive"
            >
              {result.message}
            </div>
          )}

          {/* Keyboard hint */}
          <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center' }}>
            Press <kbd style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', fontSize: 11 }}>Enter</kbd> to submit
          </p>
        </div>

        {/* ── Today's log ── */}
        <Card title="Today's Log (Last 20)">
          {logLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
              <div className="spinner spinner--md" />
            </div>
          ) : todayLog.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayLog.map((r, i) => (
                    <tr key={i}>
                      <td>
                        <span style={{ fontWeight: 600 }}>{r.member_name ?? '—'}</span>
                        <span className="mono" style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 6 }}>
                          #{r.member_id}
                        </span>
                      </td>
                      <td className="mono" style={{ fontSize: 12 }}>
                        {formatDateTime(r.check_in)}
                      </td>
                      <td className="mono" style={{ fontSize: 12 }}>
                        {r.check_out ? formatDateTime(r.check_out) : '—'}
                      </td>
                      <td>
                        {r.check_out ? (
                          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Out</span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--neon)', fontWeight: 600 }}>● In</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: 'var(--text-2)', fontSize: 14, padding: '16px 0' }}>
              No check-ins recorded today yet.
            </p>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}

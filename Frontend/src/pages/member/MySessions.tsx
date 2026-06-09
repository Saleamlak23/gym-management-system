import { useEffect, useCallback, useState } from 'react'
import { useAuth } from '@/context/useAuth'
import { PageWrapper, Card, Table, Badge, Button, StatCard } from '@/components'
import type { Column } from '@/components'
import { getMemberSessions, cancelSession } from '@/services/training.service'
import { formatDateTime, formatDuration } from '@/utils/formatters'
import type { TrainingSession, TrainingStatus } from '@/types'

type TabFilter = TrainingStatus | 'all'

export default function MySessions() {
  const { user }  = useAuth()
  const memberId  = user?.id ?? 0

  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [tab,      setTab]      = useState<TabFilter>('all')
  const [success,  setSuccess]  = useState('')

  // Auto-clear success message
  useEffect(() => {
    if (!success) return
    const t = setTimeout(() => setSuccess(''), 4000)
    return () => clearTimeout(t)
  }, [success])

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMemberSessions(memberId)
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this training session?')) return
    try {
      await cancelSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
      setSuccess('Session cancelled successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed')
    }
  }

  // ── Derived data ───────────────────────────────────────
  const counts = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1
    return acc
  }, {})

  const filtered = tab === 'all'
    ? sessions
    : sessions.filter((s) => s.status === tab)

  const upcomingCount = (counts['scheduled'] ?? 0) + (counts['confirmed'] ?? 0)

  // ── Columns ────────────────────────────────────────────
  const columns: Column<TrainingSession>[] = [
    {
      key: 'trainer_name',
      label: 'Trainer',
      render: (v, row) => (
        <span style={{ fontWeight: 600 }}>
          {(v as string) ?? `Trainer #${row.trainer_id}`}
        </span>
      ),
    },
    {
      key: 'scheduled_at',
      label: 'Date & Time',
      render: (v) => (
        <span className="mono">{formatDateTime(v as string)}</span>
      ),
    },
    {
      key: 'duration_minutes',
      label: 'Duration',
      render: (v) => (
        <span className="mono">{formatDuration(v as number)}</span>
      ),
    },
    {
      key: 'notes',
      label: 'Notes',
      render: (v) => (v as string) || <span style={{ color: 'var(--text-3)' }}>—</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge status={v as string} />,
    },
    {
      key: 'id',
      label: '',
      sortable: false,
      render: (_, row) =>
        row.status === 'scheduled' || row.status === 'confirmed' ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleCancel(row.id!)}
          >
            Cancel
          </Button>
        ) : null,
    },
  ]

  return (
    <PageWrapper
      title="My Training"
      subtitle="Personal training sessions"
    >
      {error   && <div className="alert alert--danger"  role="alert">{error}</div>}
      {success && <div className="alert alert--success" role="alert">{success}</div>}

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard label="Total Sessions" value={sessions.length}          icon="◈" />
        <StatCard label="Upcoming"       value={upcomingCount}            icon="◐" />
        <StatCard label="Completed"      value={counts['completed'] ?? 0} icon="✓" />
        <StatCard label="Cancelled"      value={counts['cancelled'] ?? 0} icon="○" />
      </div>

      {/* Upcoming info banner */}
      {upcomingCount > 0 && (
        <div className="alert alert--info">
          ◐ You have{' '}
          <strong>
            {upcomingCount} upcoming session{upcomingCount !== 1 ? 's' : ''}
          </strong>
          . Contact the front desk to book additional sessions.
        </div>
      )}

      <Card>
        {/* Status tabs */}
        <div className="tabs">
          {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled'] as const).map((t) => (
            <button
              key={t}
              className={`tab-btn${tab === t ? ' tab-btn--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              {t !== 'all' && counts[t] != null && (
                <span
                  style={{
                    marginLeft: 6,
                    background: tab === t ? 'var(--neon)' : 'var(--bg-elevated)',
                    color:      tab === t ? 'var(--bg-base)' : 'var(--text-2)',
                    borderRadius: 99,
                    fontSize: 10,
                    padding: '1px 6px',
                    fontWeight: 700,
                  }}
                >
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        <Table
          columns={columns}
          data={filtered}
          loading={loading}
          emptyMessage={
            tab === 'all'
              ? 'No training sessions yet. Ask at the front desk to get started.'
              : `No ${tab} sessions.`
          }
        />
      </Card>
    </PageWrapper>
  )
}

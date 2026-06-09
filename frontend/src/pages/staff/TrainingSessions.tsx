import { useEffect, useCallback, useState } from 'react'
import { useAuth } from '@/context/useAuth'
import { PageWrapper, Card, Table, Badge, Button, Input, Modal, StatCard } from '@/components'
import type { Column } from '@/components'
import {
  getTrainerSessions,
  createSession,
  updateSessionStatus,
  cancelSession,
} from '@/services/training.service'
import { formatDateTime, formatDuration } from '@/utils/formatters'
import {
  validateRequired,
  validatePositiveNumber,
  validateAtLeastOneHourAhead,
  validateForm,
  isValid,
} from '@/utils/validators'
import type { TrainingSession, TrainingStatus } from '@/types'

const NEXT_STATUS: Partial<Record<TrainingStatus, TrainingStatus>> = {
  scheduled: 'confirmed',
  confirmed: 'completed',
}

const STATUS_LABEL: Record<string, string> = {
  scheduled: 'Confirm',
  confirmed: 'Mark Complete',
}

interface BookForm {
  member_id: string
  scheduled_at: string
  duration_minutes: string
  notes: string
}

interface BookErrors {
  member_id?: string
  scheduled_at?: string
  duration_minutes?: string
}

export default function TrainingSessions() {
  const { user }    = useAuth()
  const trainerId   = user?.id ?? 0

  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [tab,      setTab]      = useState<TrainingStatus | 'all'>('all')

  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState<BookForm>({ member_id: '', scheduled_at: '', duration_minutes: '60', notes: '' })
  const [formErrs, setFormErrs] = useState<BookErrors>({})
  const [apiError, setApiError] = useState('')
  const [saving,   setSaving]   = useState(false)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getTrainerSessions(trainerId)
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [trainerId])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const filtered = tab === 'all' ? sessions : sessions.filter((s) => s.status === tab)

  const counts = sessions.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1
    return acc
  }, {})

  const handleAdvance = async (session: TrainingSession) => {
    const next = NEXT_STATUS[session.status]
    if (!next) return
    try {
      const updated = await updateSessionStatus(session.id, { status: next })
      setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed')
    }
  }

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this training session?')) return
    try {
      await cancelSession(id)
      setSessions((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed')
    }
  }

  const handleBook = async () => {
    const errs: BookErrors = validateForm(
      { member_id: form.member_id, scheduled_at: form.scheduled_at, duration_minutes: form.duration_minutes },
      { member_id: validateRequired, scheduled_at: validateRequired, duration_minutes: validatePositiveNumber },
    )
    if (!errs.scheduled_at && form.scheduled_at) {
      const ahead = validateAtLeastOneHourAhead(form.scheduled_at)
      if (ahead) errs.scheduled_at = ahead
    }
    if (!isValid(errs)) { setFormErrs(errs); return }

    setSaving(true)
    setApiError('')
    try {
      await createSession({
        member_id:        Number(form.member_id),
        trainer_id:       trainerId,
        scheduled_at:     form.scheduled_at,
        duration_minutes: Number(form.duration_minutes),
        notes:            form.notes || undefined,
      })
      await fetchSessions()
      setModal(false)
      setForm({ member_id: '', scheduled_at: '', duration_minutes: '60', notes: '' })
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to book session')
    } finally {
      setSaving(false)
    }
  }

  const columns: Column<TrainingSession>[] = [
    {
      key: 'member_name',
      label: 'Member',
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{(v as string) ?? `Member #${row.member_id}`}</div>
          {row.notes && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{row.notes}</div>}
        </div>
      ),
    },
    {
      key: 'scheduled_at',
      label: 'Scheduled',
      render: (v) => <span className="mono">{formatDateTime(v as string)}</span>,
    },
    {
      key: 'duration_minutes',
      label: 'Duration',
      render: (v) => <span className="mono">{formatDuration(v as number)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (v) => <Badge status={v as string} />,
    },
    {
      key: 'id',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {NEXT_STATUS[row.status] && (
            <Button variant="secondary" size="sm" onClick={() => handleAdvance(row)}>
              {STATUS_LABEL[row.status]}
            </Button>
          )}
          {(row.status === 'scheduled' || row.status === 'confirmed') && (
            <Button variant="danger" size="sm" onClick={() => handleCancel(row.id!)}>
              Cancel
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <PageWrapper
      title="My Sessions"
      subtitle="Personal training schedule"
      actions={<Button variant="neon" size="sm" onClick={() => setModal(true)}>+ Book Session</Button>}
    >
      {error && <div className="alert alert--danger">{error}</div>}

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatCard label="Total"     value={sessions.length}          icon="◈" />
        <StatCard label="Scheduled" value={counts['scheduled'] ?? 0} icon="◐" />
        <StatCard label="Confirmed" value={counts['confirmed'] ?? 0} icon="◉" />
        <StatCard label="Completed" value={counts['completed'] ?? 0} icon="✓" />
      </div>

      <Card>
        <div className="tabs">
          {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled'] as const).map((t) => (
            <button
              key={t}
              className={`tab-btn${tab === t ? ' tab-btn--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
              {t !== 'all' && counts[t] != null && (
                <span style={{
                  marginLeft: 6,
                  background: tab === t ? 'var(--neon)' : 'var(--bg-elevated)',
                  color: tab === t ? 'var(--bg-base)' : 'var(--text-2)',
                  borderRadius: 99, fontSize: 10, padding: '1px 6px', fontWeight: 700,
                }}>
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
          emptyMessage={`No ${tab === 'all' ? '' : tab + ' '}sessions found`}
        />
      </Card>

      <Modal open={modal} onClose={() => { setModal(false); setApiError('') }} title="Book Training Session">
        {apiError && <div className="alert alert--danger">{apiError}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Member ID" placeholder="e.g. 42" value={form.member_id}
            onChange={(e) => { setForm((f) => ({ ...f, member_id: e.target.value })); setFormErrs((er) => ({ ...er, member_id: undefined })) }}
            error={formErrs.member_id} required />
          <div className="form-grid">
            <Input label="Date & Time" type="datetime-local" value={form.scheduled_at}
              onChange={(e) => { setForm((f) => ({ ...f, scheduled_at: e.target.value })); setFormErrs((er) => ({ ...er, scheduled_at: undefined })) }}
              error={formErrs.scheduled_at} required />
            <Input label="Duration (min)" type="number" min="15" step="15" value={form.duration_minutes}
              onChange={(e) => { setForm((f) => ({ ...f, duration_minutes: e.target.value })); setFormErrs((er) => ({ ...er, duration_minutes: undefined })) }}
              error={formErrs.duration_minutes} required />
          </div>
          <Input label="Notes (optional)" placeholder="Session focus, goals…" value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          <Button variant="neon" size="lg" loading={saving} onClick={handleBook} style={{ width: '100%' }}>
            Book Session
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}

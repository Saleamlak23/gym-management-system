import { useEffect, useCallback, useState } from 'react'
import { useAuth } from '@/context/useAuth'
import { PageWrapper, Button, Input, Modal, Spinner } from '@/components'
import {
  getSchedules,
  getClasses,
  createSchedule,
  deleteSchedule,
  getScheduleBookings,
} from '@/services/classes.service'
import { formatTime, formatDate } from '@/utils/formatters'
import {
  validateRequired,
  validateDateRange,
  validateForm,
  isValid,
} from '@/utils/validators'
import type { ClassSchedule, GymClass, ClassBooking } from '@/types'

// ── Helpers ───────────────────────────────────────────────

function getWeekDays(anchor: Date): Date[] {
  const day = anchor.getDay()
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function toISODate(d: Date): string {
  return d.toISOString().split('T')[0]
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ── Schedule form ─────────────────────────────────────────

interface ScheduleForm {
  class_id: string
  start_time: string
  end_time: string
  instructor_id: string
}

interface ScheduleFormErrors {
  class_id?: string
  start_time?: string
  end_time?: string
}

// ── Main page ─────────────────────────────────────────────

export default function ClassSchedule() {
  const { user } = useAuth()
  const branchId = user?.branch_id ?? 1

  const [schedules, setSchedules] = useState<ClassSchedule[]>([])
  const [classes,   setClasses]   = useState<GymClass[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')

  // Week navigation
  const [anchor, setAnchor] = useState(new Date())
  const weekDays = getWeekDays(anchor)
  const weekStart = toISODate(weekDays[0])

  // Add schedule modal
  const [addModal,    setAddModal]    = useState(false)
  const [addForm,     setAddForm]     = useState<ScheduleForm>({ class_id: '', start_time: '', end_time: '', instructor_id: '' })
  const [addErrors,   setAddErrors]   = useState<ScheduleFormErrors>({})
  const [addApiError, setAddApiError] = useState('')
  const [saving,      setSaving]      = useState(false)

  // Bookings modal
  const [bookingsModal,    setBookingsModal]    = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null)
  const [bookings,          setBookings]         = useState<ClassBooking[]>([])
  const [bookingsLoading,   setBookingsLoading]  = useState(false)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [sched, cls] = await Promise.all([
        getSchedules({ branch_id: branchId, week: weekStart }),
        getClasses(),
      ])
      setSchedules(sched)
      setClasses(cls)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }, [branchId, weekStart])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])

  const handleAdd = async () => {
    const errs: ScheduleFormErrors = validateForm(
      { class_id: addForm.class_id, start_time: addForm.start_time, end_time: addForm.end_time },
      { class_id: validateRequired, start_time: validateRequired, end_time: validateRequired },
    )
    if (!errs.start_time && !errs.end_time) {
      const rangeErr = validateDateRange(addForm.start_time, addForm.end_time)
      if (rangeErr) errs.end_time = rangeErr
    }
    if (!isValid(errs)) { setAddErrors(errs); return }

    setSaving(true)
    setAddApiError('')
    try {
      await createSchedule({
        class_id:      Number(addForm.class_id),
        branch_id:     branchId,
        instructor_id: addForm.instructor_id ? Number(addForm.instructor_id) : undefined,
        start_time:    addForm.start_time,
        end_time:      addForm.end_time,
      })
      await fetchSchedules()
      setAddModal(false)
      setAddForm({ class_id: '', start_time: '', end_time: '', instructor_id: '' })
    } catch (err) {
      setAddApiError(err instanceof Error ? err.message : 'Failed to create schedule')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Cancel this scheduled session?')) return
    try {
      await deleteSchedule(id)
      setSchedules((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel session')
    }
  }

  const openBookings = async (schedule: ClassSchedule) => {
    setSelectedSchedule(schedule)
    setBookingsModal(true)
    setBookingsLoading(true)
    try {
      const data = await getScheduleBookings(schedule.id)
      setBookings(data)
    } finally {
      setBookingsLoading(false)
    }
  }

  // ── Group schedules by day ─────────────────────────────

  const byDay = weekDays.map((day) => {
    const dateStr = toISODate(day)
    return schedules.filter((s) => s.start_time.startsWith(dateStr))
  })

  const prevWeek = () => { const d = new Date(anchor); d.setDate(d.getDate() - 7); setAnchor(d) }
  const nextWeek = () => { const d = new Date(anchor); d.setDate(d.getDate() + 7); setAnchor(d) }
  const thisWeek = () => setAnchor(new Date())

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <PageWrapper
      title="Class Schedule"
      subtitle={`Week of ${formatDate(weekDays[0])}`}
      actions={
        <Button variant="neon" size="sm" onClick={() => setAddModal(true)}>
          + Add Session
        </Button>
      }
    >
      {error && <div className="alert alert--danger">{error}</div>}

      {/* Week navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <Button variant="secondary" size="sm" onClick={prevWeek}>← Prev</Button>
        <Button variant="ghost"     size="sm" onClick={thisWeek}>Today</Button>
        <Button variant="secondary" size="sm" onClick={nextWeek}>Next →</Button>
        <span style={{ fontSize: 13, color: 'var(--text-2)', marginLeft: 8 }}>
          {formatDate(weekDays[0])} — {formatDate(weekDays[6])}
        </span>
      </div>

      {/* 7-column calendar grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 10,
        }}
      >
        {weekDays.map((day, di) => {
          const isToday = toISODate(day) === toISODate(new Date())
          return (
            <div key={di}>
              {/* Day header */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: 8,
                  padding: '6px 0',
                  borderRadius: 'var(--radius)',
                  background: isToday ? 'var(--neon-dim)' : 'transparent',
                  border: isToday ? '1px solid var(--neon)' : '1px solid transparent',
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isToday ? 'var(--neon)' : 'var(--text-2)' }}>
                  {DAY_LABELS[di]}
                </div>
                <div style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: isToday ? 'var(--neon)' : 'var(--text-1)' }}>
                  {day.getDate()}
                </div>
              </div>

              {/* Sessions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {byDay[di].length === 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', padding: '12px 0' }}>
                    —
                  </div>
                )}
                {byDay[di].map((s) => {
                  const booked   = s.bookings   ?? 0
                  const capacity = s.capacity   ?? 1
                  const pct      = (booked / capacity) * 100
                  const fill     = pct >= 90 ? 'high' : pct >= 60 ? 'mid' : 'low'
                  return (
                    <div
                      key={s.id}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '8px 10px',
                        fontSize: 12,
                      }}
                    >
                      <div style={{ fontWeight: 700, marginBottom: 2 }}>{s.class_name}</div>
                      <div className="mono" style={{ fontSize: 11, color: 'var(--text-2)' }}>
                        {formatTime(s.start_time)}
                      </div>
                      {s.instructor_name && (
                        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>
                          {s.instructor_name}
                        </div>
                      )}
                      {/* Capacity bar */}
                      <div style={{ marginTop: 6 }}>
                        <div className="cap-bar" style={{ width: '100%' }}>
                          <div className={`cap-bar__fill cap-bar__fill--${fill}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>
                          {booked}/{capacity} booked
                        </div>
                      </div>
                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ fontSize: 10, padding: '3px 6px' }}
                          onClick={() => openBookings(s)}
                        >
                          Bookings
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          style={{ fontSize: 10, padding: '3px 6px' }}
                          onClick={() => handleDelete(s.id)}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Session Modal */}
      <Modal
        open={addModal}
        onClose={() => { setAddModal(false); setAddApiError('') }}
        title="Add Scheduled Session"
      >
        {addApiError && <div className="alert alert--danger">{addApiError}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-wrap">
            <label className="input-label" htmlFor="class-select">
              Class <span className="input-required">*</span>
            </label>
            <select
              id="class-select"
              className={`input-field${addErrors.class_id ? ' input-field--error' : ''}`}
              value={addForm.class_id}
              onChange={(e) => {
                setAddForm((f) => ({ ...f, class_id: e.target.value }))
                setAddErrors((er) => ({ ...er, class_id: undefined }))
              }}
            >
              <option value="">Select class…</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.duration_minutes}min)</option>
              ))}
            </select>
            {addErrors.class_id && <span className="input-error">⚠ {addErrors.class_id}</span>}
          </div>

          <div className="form-grid">
            <Input
              label="Start Time"
              type="datetime-local"
              value={addForm.start_time}
              onChange={(e) => {
                setAddForm((f) => ({ ...f, start_time: e.target.value }))
                setAddErrors((er) => ({ ...er, start_time: undefined }))
              }}
              error={addErrors.start_time}
              required
            />
            <Input
              label="End Time"
              type="datetime-local"
              value={addForm.end_time}
              onChange={(e) => {
                setAddForm((f) => ({ ...f, end_time: e.target.value }))
                setAddErrors((er) => ({ ...er, end_time: undefined }))
              }}
              error={addErrors.end_time}
              required
            />
          </div>

          <Input
            label="Instructor ID (optional)"
            placeholder="e.g. 5"
            value={addForm.instructor_id}
            onChange={(e) => setAddForm((f) => ({ ...f, instructor_id: e.target.value }))}
          />

          <Button variant="neon" size="lg" loading={saving} onClick={handleAdd} style={{ width: '100%' }}>
            Schedule Session
          </Button>
        </div>
      </Modal>

      {/* Bookings Modal */}
      <Modal
        open={bookingsModal}
        onClose={() => setBookingsModal(false)}
        title={`Bookings — ${selectedSchedule?.class_name ?? ''}`}
      >
        {bookingsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Spinner size="md" />
          </div>
        ) : bookings.length ? (
          <table className="table">
            <thead>
              <tr><th>#</th><th>Member</th><th>Booked At</th></tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b.id}>
                  <td className="mono" style={{ color: 'var(--text-3)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{b.member_name ?? `Member #${b.member_id}`}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{formatDate(b.booked_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'var(--text-2)', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
            No bookings yet for this session.
          </p>
        )}
      </Modal>
    </PageWrapper>
  )
}

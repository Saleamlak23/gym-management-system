import { useEffect, useCallback, useState } from 'react'
import { useAuth } from '@/context/useAuth'
import { PageWrapper, Card, Button, Spinner, Badge } from '@/components'
import {
  getSchedules,
  createBooking,
  cancelBooking,
  getScheduleBookings,
} from '@/services/classes.service'
import { formatDateTime } from '@/utils/formatters'
import type { ClassSchedule, ClassBooking } from '@/types'

type ViewTab = 'browse' | 'my-bookings'

export default function MyBookings() {
  const { user }   = useAuth()
  const memberId   = user?.id ?? 0

  const [tab,          setTab]          = useState<ViewTab>('browse')
  const [schedules,    setSchedules]    = useState<ClassSchedule[]>([])
  const [myBookings,   setMyBookings]   = useState<ClassBooking[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [bookingId,    setBookingId]    = useState<number | null>(null)  // currently booking
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [successMsg,   setSuccessMsg]   = useState('')

  // Auto-clear success message
  useEffect(() => {
    if (!successMsg) return
    const t = setTimeout(() => setSuccessMsg(''), 4000)
    return () => clearTimeout(t)
  }, [successMsg])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const scheduleData = await getSchedules()
      setSchedules(scheduleData)

      // Fetch bookings for each schedule to find member's own bookings
      const allBookings: ClassBooking[] = []
      await Promise.all(
        scheduleData.map(async (s) => {
          const bookings = await getScheduleBookings(s.id).catch(() => [])
          const mine = bookings.filter((b) => b.member_id === memberId)
          allBookings.push(...mine)
        }),
      )
      setMyBookings(allBookings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const bookedScheduleIds = new Set(myBookings.map((b) => b.schedule_id))

  const handleBook = async (scheduleId: number) => {
    setBookingId(scheduleId)
    setError('')
    try {
      await createBooking({ schedule_id: scheduleId, member_id: memberId })
      setSuccessMsg('✓ Booking confirmed!')
      await fetchAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed')
    } finally {
      setBookingId(null)
    }
  }

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm('Cancel this booking?')) return
    setCancellingId(bookingId)
    setError('')
    try {
      await cancelBooking(bookingId)
      setSuccessMsg('Booking cancelled.')
      await fetchAll()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Spinner size="lg" />
      </div>
    )
  }

  // ── Schedule card ──────────────────────────────────────

  function ScheduleCard({ s }: { s: ClassSchedule }) {
    const booked      = s.bookings   ?? 0
    const capacity    = s.capacity   ?? 1
    const spotsLeft   = capacity - booked
    const full        = spotsLeft <= 0
    const alreadyIn   = bookedScheduleIds.has(s.id)
    const isBooking   = bookingId === s.id
    const pct         = (booked / capacity) * 100
    const fillClass   = pct >= 90 ? 'high' : pct >= 60 ? 'mid' : 'low'

    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${alreadyIn ? 'var(--neon)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{s.class_name}</div>
            {s.instructor_name && (
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                with {s.instructor_name}
              </div>
            )}
          </div>
          {alreadyIn && <Badge status="confirmed" />}
        </div>

        {/* Time & duration */}
        <div style={{ display: 'flex', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', fontWeight: 700 }}>When</div>
            <div className="mono" style={{ fontSize: 13, marginTop: 2 }}>{formatDateTime(s.start_time)}</div>
          </div>
          {s.id && (
            <div>
              <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)', fontWeight: 700 }}>Spots</div>
              <div style={{ fontSize: 13, marginTop: 2, fontWeight: 600, color: full ? 'var(--danger)' : 'var(--success)' }}>
                {full ? 'Full' : `${spotsLeft} left`}
              </div>
            </div>
          )}
        </div>

        {/* Capacity bar */}
        <div>
          <div className="cap-bar" style={{ width: '100%' }}>
            <div className={`cap-bar__fill cap-bar__fill--${fillClass}`} style={{ width: `${pct}%` }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
            {booked}/{capacity} booked
          </div>
        </div>

        {/* Action */}
        {alreadyIn ? (
          <Button variant="secondary" size="sm" onClick={() => {
            const booking = myBookings.find((b) => b.schedule_id === s.id)
            if (booking) handleCancel(booking.id)
          }}>
            Cancel Booking
          </Button>
        ) : (
          <Button
            variant={full ? 'secondary' : 'neon'}
            size="sm"
            disabled={full}
            loading={isBooking}
            onClick={() => handleBook(s.id)}
          >
            {full ? 'Class Full' : 'Book Now'}
          </Button>
        )}
      </div>
    )
  }

  // ── My bookings list ───────────────────────────────────

  function MyBookingCard({ b }: { b: ClassBooking }) {
    const schedule    = schedules.find((s) => s.id === b.schedule_id)
    const isCancelling = cancellingId === b.id

    return (
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>
            {schedule?.class_name ?? `Session #${b.schedule_id}`}
          </div>
          {schedule && (
            <div className="mono" style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 3 }}>
              {formatDateTime(schedule.start_time)}
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
            Booked on {formatDateTime(b.booked_at)}
          </div>
        </div>

        <Button
          variant="danger"
          size="sm"
          loading={isCancelling}
          onClick={() => handleCancel(b.id)}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <PageWrapper
      title="My Bookings"
      subtitle="Browse and manage class bookings"
    >
      {error      && <div className="alert alert--danger"  role="alert">{error}</div>}
      {successMsg && <div className="alert alert--success" role="alert">{successMsg}</div>}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab-btn${tab === 'browse' ? ' tab-btn--active' : ''}`}
          onClick={() => setTab('browse')}
        >
          Browse Classes
          <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-3)' }}>
            {schedules.length}
          </span>
        </button>
        <button
          className={`tab-btn${tab === 'my-bookings' ? ' tab-btn--active' : ''}`}
          onClick={() => setTab('my-bookings')}
        >
          My Bookings
          <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-3)' }}>
            {myBookings.length}
          </span>
        </button>
      </div>

      {/* Browse tab */}
      {tab === 'browse' && (
        schedules.length ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {schedules.map((s) => <ScheduleCard key={s.id} s={s} />)}
          </div>
        ) : (
          <Card>
            <p style={{ color: 'var(--text-2)', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
              No classes scheduled. Check back later.
            </p>
          </Card>
        )
      )}

      {/* My bookings tab */}
      {tab === 'my-bookings' && (
        myBookings.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myBookings.map((b) => <MyBookingCard key={b.id} b={b} />)}
          </div>
        ) : (
          <Card>
            <p style={{ color: 'var(--text-2)', fontSize: 14, textAlign: 'center', padding: '32px 0' }}>
              You have no bookings yet.{' '}
              <button
                onClick={() => setTab('browse')}
                style={{ color: 'var(--neon)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Browse classes →
              </button>
            </p>
          </Card>
        )
      )}
    </PageWrapper>
  )
}

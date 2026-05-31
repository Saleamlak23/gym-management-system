import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  PageWrapper, Card, Badge, Button, Input,
  Modal, Table, Spinner,
} from '@/components'
import type { Column } from '@/components'
import {
  getMember,
  updateMember,
  getMemberSubscriptions,
  createSubscription,
} from '@/services/members.service'
import { getMemberPayments }    from '@/services/payments.service'
import { getMemberAttendance }  from '@/services/attendance.service'
import { formatDate, formatDateTime, formatCurrency, daysUntil } from '@/utils/formatters'
import type { Member, Subscription, Payment, AttendanceRecord } from '@/types'

type Tab = 'Profile' | 'Subscriptions' | 'Payments' | 'Attendance'
const TABS: Tab[] = ['Profile', 'Subscriptions', 'Payments', 'Attendance']

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>()
  const memberId = Number(id)

  const [tab,        setTab]        = useState<Tab>('Profile')
  const [member,     setMember]     = useState<Member | null>(null)
  const [subs,       setSubs]       = useState<Subscription[]>([])
  const [payments,   setPayments]   = useState<Payment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')

  // Edit profile
  const [editing,  setEditing]  = useState(false)
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '' })
  const [saving,   setSaving]   = useState(false)

  // New subscription modal
  const [subModal,  setSubModal]  = useState(false)
  const [subForm,   setSubForm]   = useState({ membership_type_id: '', start_date: '' })
  const [subSaving, setSubSaving] = useState(false)
  const [subError,  setSubError]  = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [m, s, p, a] = await Promise.all([
          getMember(memberId),
          getMemberSubscriptions(memberId),
          getMemberPayments(memberId),
          getMemberAttendance(memberId),
        ])
        setMember(m)
        setSubs(s)
        setPayments(p)
        setAttendance(a)
        setEditForm({
          first_name: m.first_name,
          last_name:  m.last_name,
          email:      m.email,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load member')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [memberId])

  const saveProfile = async () => {
    if (!member) return
    setSaving(true)
    try {
      const updated = await updateMember(memberId, editForm)
      setMember(updated)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateSub = async () => {
    if (!subForm.membership_type_id || !subForm.start_date) {
      setSubError('All fields are required')
      return
    }
    setSubSaving(true)
    setSubError('')
    try {
      await createSubscription(memberId, {
        membership_type_id: Number(subForm.membership_type_id),
        start_date: subForm.start_date,
      })
      const updated = await getMemberSubscriptions(memberId)
      setSubs(updated)
      setSubModal(false)
      setSubForm({ membership_type_id: '', start_date: '' })
    } catch (err) {
      setSubError(err instanceof Error ? err.message : 'Failed to create subscription')
    } finally {
      setSubSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <Spinner size="lg" />
      </div>
    )
  }

  if (error && !member) {
    return <div className="alert alert--danger" style={{ margin: 32 }}>{error}</div>
  }

  if (!member) return null

  const activeSub = subs.find((s) => s.status === 'active')
  const days      = activeSub ? daysUntil(activeSub.end_date) : 0
  const fillPct   = activeSub ? Math.min(100, Math.max(0, (days / 30) * 100)) : 0

  // ── Column definitions ─────────────────────────────────

  const subCols: Column<Subscription>[] = [
    { key: 'type_name',  label: 'Plan',   render: (v) => <strong>{v as string}</strong> },
    { key: 'start_date', label: 'Start',  render: (v) => formatDate(v as string) },
    { key: 'end_date',   label: 'End',    render: (v) => formatDate(v as string) },
    { key: 'status',     label: 'Status', render: (v) => <Badge status={v as string} /> },
  ]

  const paymentCols: Column<Payment>[] = [
    { key: 'created_at', label: 'Date',   render: (v) => formatDateTime(v as string) },
    { key: 'amount',     label: 'Amount', render: (v) => <span className="mono">{formatCurrency(v as number)}</span> },
    { key: 'method',     label: 'Method', render: (v) => <span style={{ textTransform: 'capitalize' }}>{(v as string).replace('_', ' ')}</span> },
    { key: 'note',       label: 'Note',   render: (v) => (v as string) || '—' },
  ]

  const attCols: Column<AttendanceRecord>[] = [
    { key: 'check_in',    label: 'Check In',  render: (v) => formatDateTime(v as string) },
    { key: 'check_out',   label: 'Check Out', render: (v) => v ? formatDateTime(v as string) : <span style={{ color: 'var(--text-3)' }}>Still in</span> },
    { key: 'branch_name', label: 'Branch',    render: (v) => (v as string) || '—' },
  ]

  return (
    <PageWrapper
      title={`${member.first_name} ${member.last_name}`}
      subtitle={`Member #${memberId}`}
    >
      {error && <div className="alert alert--danger">{error}</div>}

      {/* Active subscription banner */}
      {activeSub && (
        <div className="alert alert--success">
          <span>◉</span>
          <div style={{ flex: 1 }}>
            <strong>{activeSub.type_name}</strong> subscription active —{' '}
            {days > 0 ? `${days} day${days !== 1 ? 's' : ''} remaining` : 'expires today'}
            <div style={{ marginTop: 6, height: 3, background: 'var(--bg-elevated)', borderRadius: 2, width: 180 }}>
              <div style={{ width: `${fillPct}%`, height: '100%', background: 'var(--success)', borderRadius: 2, transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab-btn${tab === t ? ' tab-btn--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Profile ── */}
      {tab === 'Profile' && (
        <Card
          title="Profile Information"
          action={
            editing ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                <Button variant="neon"  size="sm" loading={saving} onClick={saveProfile}>Save</Button>
              </div>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit</Button>
            )
          }
        >
          {editing ? (
            <div className="form-grid">
              <Input label="First Name" value={editForm.first_name}
                onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))} />
              <Input label="Last Name"  value={editForm.last_name}
                onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))} />
              <Input label="Email" type="email" value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {([
                ['First Name', member.first_name],
                ['Last Name',  member.last_name],
                ['Email',      member.email],
                ['Phone',      member.phone ?? '—'],
                ['Joined',     formatDate(member.join_date)],
              ] as [string, string][]).map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-2)', marginBottom: 6, fontWeight: 700 }}>
                    {label}
                  </div>
                  <div style={{ fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Subscriptions ── */}
      {tab === 'Subscriptions' && (
        <Card
          title="Subscription History"
          action={
            <Button variant="neon" size="sm" onClick={() => setSubModal(true)}>
              + New Subscription
            </Button>
          }
        >
          <Table columns={subCols} data={subs} emptyMessage="No subscriptions yet" />
        </Card>
      )}

      {/* ── Payments ── */}
      {tab === 'Payments' && (
        <Card title="Payment History">
          <Table columns={paymentCols} data={payments} emptyMessage="No payments recorded" />
        </Card>
      )}

      {/* ── Attendance ── */}
      {tab === 'Attendance' && (
        <Card title="Attendance Log">
          <Table columns={attCols} data={attendance} emptyMessage="No attendance records" />
        </Card>
      )}

      {/* New Subscription Modal */}
      <Modal
        open={subModal}
        onClose={() => { setSubModal(false); setSubError('') }}
        title="New Subscription"
      >
        {subError && <div className="alert alert--danger">{subError}</div>}
        <div className="form-grid-1" style={{ gap: 16 }}>
          <div className="input-wrap">
            <label className="input-label" htmlFor="plan-select">
              Membership Plan <span className="input-required">*</span>
            </label>
            <select
              id="plan-select"
              className="input-field"
              value={subForm.membership_type_id}
              onChange={(e) => setSubForm((f) => ({ ...f, membership_type_id: e.target.value }))}
            >
              <option value="">Select plan…</option>
              <option value="1">Monthly</option>
              <option value="2">Quarterly</option>
              <option value="3">Annual</option>
              <option value="4">Day Pass</option>
            </select>
          </div>

          <Input
            label="Start Date"
            type="date"
            value={subForm.start_date}
            onChange={(e) => setSubForm((f) => ({ ...f, start_date: e.target.value }))}
            required
          />

          <Button
            variant="neon"
            size="lg"
            loading={subSaving}
            onClick={handleCreateSub}
            style={{ width: '100%' }}
          >
            Create Subscription
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}

import { useEffect, useCallback, useState } from 'react'
import { PageWrapper, Card, Table, Button, Input, Modal } from '@/components'
import type { Column } from '@/components'
import {
  getPayments,
  createPayment,
  getPaymentSummary,
} from '@/services/payments.service'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import {
  validateRequired,
  validatePositiveNumber,
  validateForm,
  isValid,
} from '@/utils/validators'
import type { Payment, PaymentMethod, PaymentSummary } from '@/types'

const METHODS: PaymentMethod[] = ['cash', 'card', 'bank_transfer', 'mobile_money']

interface PaymentForm {
  member_id: string
  amount: string
  method: PaymentMethod
  note: string
}

interface PaymentFormErrors {
  member_id?: string
  amount?: string
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary,  setSummary]  = useState<PaymentSummary | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate,   setEndDate]   = useState('')
  const [method,    setMethod]    = useState<string>('all')
  const [search,    setSearch]    = useState('')

  // Modal
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState<PaymentForm>({
    member_id: '', amount: '', method: 'cash', note: '',
  })
  const [formErrors, setFormErrors] = useState<PaymentFormErrors>({})
  const [apiError,   setApiError]   = useState('')
  const [saving,     setSaving]     = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [p, s] = await Promise.all([
        getPayments({
          start_date: startDate || undefined,
          end_date:   endDate   || undefined,
          method:     method !== 'all' ? (method as PaymentMethod) : undefined,
          search:     search    || undefined,
        }),
        getPaymentSummary({
          start_date: startDate || undefined,
          end_date:   endDate   || undefined,
        }),
      ])
      setPayments(p)
      setSummary(s)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, method, search])

  useEffect(() => {
    const run = async () => { await fetchAll() }
    void run()
  }, [fetchAll])

  const handleCreate = async () => {
    const errs: PaymentFormErrors = validateForm(
      { member_id: form.member_id, amount: form.amount },
      {
        member_id: validateRequired,
        amount:    validatePositiveNumber,
      },
    )
    if (!isValid(errs)) { setFormErrors(errs); return }

    setSaving(true)
    setApiError('')
    try {
      await createPayment({
        member_id: Number(form.member_id),
        amount:    Number(form.amount),
        method:    form.method,
        note:      form.note || undefined,
      })
      await fetchAll()
      setModal(false)
      setForm({ member_id: '', amount: '', method: 'cash', note: '' })
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  const filteredTotal = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  const columns: Column<Payment>[] = [
    {
      key: 'first_name',
      label: 'Member',
      render: (_, row) => (
        <span style={{ fontWeight: 600 }}>
          {row.first_name} {row.last_name}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (v) => (
        <span className="mono" style={{ fontWeight: 700, color: 'var(--neon)' }}>
          {formatCurrency(v as number)}
        </span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      render: (v) => (
        <span style={{ textTransform: 'capitalize' }}>
          {(v as string).replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (v) => formatDateTime(v as string),
    },
    {
      key: 'note',
      label: 'Note',
      render: (v) => (v as string) || '—',
    },
  ]

  return (
    <PageWrapper
      title="Payments"
      subtitle="Transaction log"
      actions={
        <Button variant="neon" size="sm" onClick={() => setModal(true)}>
          + Record Payment
        </Button>
      }
    >
      {error && <div className="alert alert--danger">{error}</div>}

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          ['Total Revenue',     formatCurrency(summary?.totalRevenue ?? 0)],
          ['Filtered Total',    formatCurrency(filteredTotal)],
          ['Transactions',      payments.length.toString()],
        ].map(([label, val]) => (
          <div
            key={label}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '10px 20px',
            }}
          >
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-2)', fontWeight: 700 }}>
              {label}
            </div>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--neon)', marginTop: 2 }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      <Card>
        {/* Filters */}
        <div className="filters-bar">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            aria-label="Start date"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            aria-label="End date"
          />
          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            aria-label="Filter by payment method"
          >
            <option value="all">All Methods</option>
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
          <div style={{ flex: 1, maxWidth: 240 }}>
            <Input
              placeholder="Search member…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search by member name"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={payments}
          loading={loading}
          emptyMessage="No payments match your filters"
        />
      </Card>

      {/* Record Payment Modal */}
      <Modal
        open={modal}
        onClose={() => { setModal(false); setApiError('') }}
        title="Record Payment"
      >
        {apiError && <div className="alert alert--danger">{apiError}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Member ID"
            placeholder="e.g. 42"
            value={form.member_id}
            onChange={(e) => {
              setForm((f) => ({ ...f, member_id: e.target.value }))
              setFormErrors((er) => ({ ...er, member_id: undefined }))
            }}
            error={formErrors.member_id}
            required
          />

          <Input
            label="Amount (USD)"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => {
              setForm((f) => ({ ...f, amount: e.target.value }))
              setFormErrors((er) => ({ ...er, amount: undefined }))
            }}
            error={formErrors.amount}
            required
          />

          <div className="input-wrap">
            <label className="input-label" htmlFor="method-select">
              Payment Method <span className="input-required">*</span>
            </label>
            <select
              id="method-select"
              className="input-field"
              value={form.method}
              onChange={(e) =>
                setForm((f) => ({ ...f, method: e.target.value as PaymentMethod }))
              }
            >
              {METHODS.map((m) => (
                <option key={m} value={m}>
                  {m.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Note (optional)"
            placeholder="e.g. Monthly renewal"
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
          />

          <Button
            variant="neon"
            size="lg"
            loading={saving}
            onClick={handleCreate}
            style={{ width: '100%' }}
          >
            Record Payment
          </Button>
        </div>
      </Modal>
    </PageWrapper>
  )
}

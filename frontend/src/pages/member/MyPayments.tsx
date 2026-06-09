import { useEffect, useCallback, useState } from 'react'
import { useAuth } from '@/context/useAuth'
import { PageWrapper, Card, Table, StatCard } from '@/components'
import type { Column } from '@/components'
import { getMemberPayments } from '@/services/payments.service'
import { formatCurrency, formatDateTime } from '@/utils/formatters'
import type { Payment, PaymentMethod } from '@/types'

const METHOD_ICONS: Record<PaymentMethod, string> = {
  cash:          '💵',
  card:          '💳',
  bank_transfer: '🏦',
  mobile_money:  '📱',
}

export default function MyPayments() {
  const { user }  = useAuth()
  const memberId  = user?.id ?? 0

  const [payments, setPayments] = useState<Payment[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMemberPayments(memberId)
      setPayments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments')
    } finally {
      setLoading(false)
    }
  }, [memberId])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  // ── Derived stats ──────────────────────────────────────
  const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  const byMethod = payments.reduce<Record<string, number>>((acc, p) => {
    acc[p.method] = (acc[p.method] ?? 0) + Number(p.amount)
    return acc
  }, {})

  const mostUsedMethod = Object.entries(byMethod).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const lastPayment = payments.length
    ? formatDateTime(payments[0].created_at ?? payments[0].payment_date)
    : '—'

  // ── Columns ────────────────────────────────────────────
  const columns: Column<Payment>[] = [
    {
      key: 'created_at',
      label: 'Date',
      render: (v) => (
        <span className="mono" style={{ fontSize: 12 }}>
          {formatDateTime(v as string)}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (v) => (
        <span
          className="mono"
          style={{ fontWeight: 700, fontSize: 15, color: 'var(--neon)' }}
        >
          {formatCurrency(v as number)}
        </span>
      ),
    },
    {
      key: 'method',
      label: 'Method',
      render: (v) => {
        const method = v as PaymentMethod
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>{METHOD_ICONS[method] ?? '—'}</span>
            <span style={{ textTransform: 'capitalize' }}>
              {method.replace('_', ' ')}
            </span>
          </span>
        )
      },
    },
    {
      key: 'note',
      label: 'Note',
      render: (v) =>
        v ? (
          <span style={{ color: 'var(--text-2)', fontSize: 13 }}>{v as string}</span>
        ) : (
          <span style={{ color: 'var(--text-3)' }}>—</span>
        ),
    },
  ]

  return (
    <PageWrapper
      title="My Payments"
      subtitle="Your payment history"
    >
      {error && <div className="alert alert--danger">{error}</div>}

      {/* KPIs */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatCard
          label="Total Paid"
          value={formatCurrency(totalSpent)}
          icon="◑"
        />
        <StatCard
          label="Transactions"
          value={payments.length}
          icon="◈"
        />
        <StatCard
          label="Preferred Method"
          value={mostUsedMethod.replace('_', ' ')}
          icon="◐"
        />
      </div>

      {/* Breakdown by method */}
      {Object.keys(byMethod).length > 0 && (
        <Card title="Breakdown by Method" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {Object.entries(byMethod)
              .sort((a, b) => b[1] - a[1])
              .map(([method, total]) => {
                const pct = (total / totalSpent) * 100
                return (
                  <div
                    key={method}
                    style={{
                      flex: '1 1 140px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius)',
                      padding: '14px 18px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: 18, marginBottom: 6 }}>
                      {METHOD_ICONS[method as PaymentMethod] ?? '—'}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--text-2)',
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      {method.replace('_', ' ')}
                    </div>
                    <div
                      className="mono"
                      style={{ fontWeight: 700, fontSize: 16, color: 'var(--neon)' }}
                    >
                      {formatCurrency(total)}
                    </div>
                    {/* Mini bar */}
                    <div
                      style={{
                        marginTop: 8,
                        height: 3,
                        background: 'var(--bg-base)',
                        borderRadius: 2,
                      }}
                    >
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'var(--neon)',
                          borderRadius: 2,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                      {Math.round(pct)}% of total
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>
      )}

      {/* Last payment info */}
      {payments.length > 0 && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-3)',
            marginBottom: 12,
          }}
        >
          Last payment: <span style={{ color: 'var(--text-2)' }}>{lastPayment}</span>
        </div>
      )}

      {/* Full history table */}
      <Card title="All Transactions">
        <Table
          columns={columns}
          data={payments}
          loading={loading}
          emptyMessage="No payments recorded yet."
        />
      </Card>
    </PageWrapper>
  )
}

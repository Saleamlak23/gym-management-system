import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageWrapper, Card, Table, Badge, Button, Input } from '@/components'
import type { Column } from '@/components'
import { getMembers } from '@/services/members.service'
import { formatDate } from '@/utils/formatters'
import type { Member, SubscriptionStatus } from '@/types'

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active',       value: 'active' },
  { label: 'Expired',      value: 'expired' },
  { label: 'Cancelled',    value: 'cancelled' },
  { label: 'Frozen',       value: 'frozen' },
]

export default function MemberList() {
  const navigate = useNavigate()

  const [members, setMembers]   = useState<Member[]>([])
  const [loading, setLoading]   = useState(true)
  const [error,   setError]     = useState('')
  const [search,  setSearch]    = useState('')
  const [status,  setStatus]    = useState('all')
  const [debounced, setDebounced] = useState('')

  // Debounce search input by 300 ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getMembers({
        search: debounced || undefined,
        status: status !== 'all' ? (status as SubscriptionStatus) : undefined,
      })
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members')
    } finally {
      setLoading(false)
    }
  }, [debounced, status])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const columns: Column<Member>[] = [
    {
      key: 'first_name',
      label: 'Name',
      render: (_, row) => (
        <span style={{ fontWeight: 600 }}>
          {row.first_name} {row.last_name}
        </span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (v) => (
        <span className="mono" style={{ fontSize: 12 }}>
          {v as string}
        </span>
      ),
    },
    {
      key: 'join_date',
      label: 'Joined',
      render: (v) => formatDate(v as string),
    },
    {
      key: 'subscription_status',
      label: 'Status',
      render: (v) =>
        v ? <Badge status={v as string} /> : <Badge status="expired" />,
    },
    {
      key: 'id',
      label: '',
      sortable: false,
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/admin/members/${row.id}`)}
        >
          View →
        </Button>
      ),
    },
  ]

  return (
    <PageWrapper
      title="Members"
      subtitle={`${members.length} record${members.length !== 1 ? 's' : ''}`}
      actions={
        <Button variant="neon" size="sm" onClick={() => navigate('/register')}>
          + Add Member
        </Button>
      }
    >
      {error && <div className="alert alert--danger">{error}</div>}

      <Card>
        {/* Filters */}
        <div className="filters-bar">
          <div style={{ flex: 1, maxWidth: 320 }}>
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search members"
            />
          </div>

          <select
            className="input-field"
            style={{ width: 'auto' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by subscription status"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <Button variant="secondary" size="sm" onClick={fetchMembers}>
            Refresh
          </Button>
        </div>

        <Table
          columns={columns}
          data={members}
          loading={loading}
          emptyMessage="No members match your filters"
        />
      </Card>
    </PageWrapper>
  )
}

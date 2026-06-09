import { useState } from 'react'
import Spinner from './Spinner'
import EmptyState from './EmptyState'
import './components.css'

// ── Types ─────────────────────────────────────────────────

export interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
}

interface Props<T extends { id?: number | string }> {
  columns: Column<T>[]
  data: T[] | null
  loading?: boolean
  emptyMessage?: string
  pageSize?: number
}

// ── Component ─────────────────────────────────────────────

export default function Table<T extends { id?: number | string }>({
  columns,
  data,
  loading = false,
  emptyMessage = 'No records found',
  pageSize = 15,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page,    setPage]    = useState(1)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  // ── Loading state
  if (loading) {
    return (
      <div className="table-loading">
        <Spinner size="md" />
      </div>
    )
  }

  // ── Empty state
  if (!data || data.length === 0) {
    return <EmptyState message={emptyMessage} />
  }

  // ── Sort
  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = (a as Record<string, unknown>)[sortKey] ?? ''
        const bv = (b as Record<string, unknown>)[sortKey] ?? ''
        const cmp = String(av).localeCompare(String(bv), undefined, {
          numeric: true,
        })
        return sortDir === 'asc' ? cmp : -cmp
      })
    : data

  // ── Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paged      = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={col.sortable !== false ? 'sortable' : ''}
                  onClick={
                    col.sortable !== false
                      ? () => handleSort(String(col.key))
                      : undefined
                  }
                >
                  {col.label}
                  {sortKey === String(col.key) && (
                    <span style={{ marginLeft: 4, opacity: 0.6 }}>
                      {sortDir === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paged.map((row, i) => (
              <tr key={row.id ?? i}>
                {columns.map((col) => {
                  const value = (row as Record<string, unknown>)[
                    String(col.key)
                  ]
                  return (
                    <td key={String(col.key)}>
                      {col.render ? col.render(value, row) : (value as React.ReactNode) ?? '—'}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn--ghost btn--sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            aria-label="Previous page"
          >
            ←
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn--ghost btn--sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Next page"
          >
            →
          </button>
        </div>
      )}
    </div>
  )
}

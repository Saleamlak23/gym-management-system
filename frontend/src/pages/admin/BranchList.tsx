import { useEffect, useState } from 'react'
import { PageWrapper, Card, Spinner } from '@/components'
import { getOverview } from '@/services/analytics.service'
import { formatCurrency } from '@/utils/formatters'
import type { OverviewAnalytics } from '@/types'

export default function BranchList() {
  const [overview, setOverview] = useState<OverviewAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getOverview()
      .then((data) => setOverview(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageWrapper title="Branches" subtitle="Enterprise branch performance">
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {error && <div className="alert alert--danger">{error}</div>}

          <Card title="Branch list" style={{ marginBottom: 24 }}>
            {overview?.branches?.length ? (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Branch</th>
                      <th>Active Members</th>
                      <th>Today's Attendance</th>
                      <th>Monthly Revenue</th>
                      <th>Equipment Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.branches.map((branch) => {
                      const revenue =
                        typeof branch.monthlyRevenue === 'number'
                          ? branch.monthlyRevenue
                          : typeof branch.monthlyRevenue === 'string'
                          ? Number(branch.monthlyRevenue)
                          : NaN

                      return (
                        <tr key={branch.id}>
                          <td style={{ fontWeight: 600 }}>{branch.name}</td>
                          <td className="mono">{branch.activeMembers ?? '—'}</td>
                          <td className="mono">{branch.todayAttendance ?? '—'}</td>
                          <td className="mono">
                            {Number.isFinite(revenue) ? formatCurrency(revenue) : '—'}
                          </td>
                          <td>
                            {branch.equipmentIssues > 0 ? (
                              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>⚠ {branch.equipmentIssues}</span>
                            ) : (
                              <span style={{ color: 'var(--success)' }}>✓ Clear</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-2)', fontSize: 14 }}>
                No branch data available.
              </p>
            )}
          </Card>
        </>
      )}
    </PageWrapper>
  )
}

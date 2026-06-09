import type { ReactNode } from 'react'
import './components.css'

interface Props {
  message?: string
  icon?: string
  action?: ReactNode
}

export default function EmptyState({
  message = 'No records found',
  icon = '◎',
  action,
}: Props) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        {icon}
      </div>
      <p className="empty-state__msg">{message}</p>
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  )
}

import type { ReactNode } from 'react'
import './components.css'

interface Props {
  title: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
}

export default function PageWrapper({
  title,
  subtitle,
  actions,
  children,
}: Props) {
  return (
    <main className="page-wrapper fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="page-actions">{actions}</div>}
      </div>

      {children}
    </main>
  )
}

import type { ReactNode } from 'react'
import './components.css'

interface Props {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function Card({
  title,
  action,
  children,
  className = '',
  style,
}: Props) {
  return (
    <div className={`card ${className}`.trim()} style={style}>
      {title && (
        <div className="card__header">
          <span className="card__title">{title}</span>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="card__body">{children}</div>
    </div>
  )
}

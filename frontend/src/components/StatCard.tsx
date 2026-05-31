import './components.css'

interface Props {
  label: string
  value: string | number | null | undefined
  icon?: string
  trend?: string
  trendDir?: 'up' | 'down'
}

export default function StatCard({
  label,
  value,
  icon,
  trend,
  trendDir = 'up',
}: Props) {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        {icon && (
          <span className="stat-card__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <div className="stat-card__value">
        {value ?? '—'}
      </div>

      {trend && (
        <div className={`stat-card__trend stat-card__trend--${trendDir}`}>
          {trendDir === 'down' ? '↓' : '↑'} {trend}
        </div>
      )}
    </div>
  )
}

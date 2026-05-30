import '../styles/components.css';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: number;
}

export function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="stat-card">
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {trend !== undefined && (
          <p className={`stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </p>
        )}
      </div>
    </div>
  );
}

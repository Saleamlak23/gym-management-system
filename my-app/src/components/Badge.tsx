import '../styles/components.css';

interface BadgeProps {
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'completed' | 'confirmed' | 'scheduled' | 'maintenance' | 'retired';
  children?: string;
}

export function Badge({ status, children }: BadgeProps) {
  const statusMap: Record<string, string> = {
    active: 'badge-active',
    expired: 'badge-expired',
    cancelled: 'badge-cancelled',
    pending: 'badge-pending',
    completed: 'badge-completed',
    confirmed: 'badge-confirmed',
    scheduled: 'badge-scheduled',
    maintenance: 'badge-maintenance',
    retired: 'badge-retired',
  };

  return (
    <span className={`badge ${statusMap[status] || 'badge-default'}`}>
      {children || status}
    </span>
  );
}

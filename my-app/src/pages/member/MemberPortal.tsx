import { useNavigate } from 'react-router-dom';
import { PageWrapper, Card, StatCard } from '../../components';
import { useAuth } from '../../context/AuthContext';
import '../../styles/portal.css';

export function MemberPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock data - in real app, fetch from API
  const subscription = {
    type: 'Annual',
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    daysRemaining: 230,
    totalDays: 365,
  };

  const shortcut = (title: string, description: string, icon: string, path: string) => (
    <div
      className="shortcut-tile"
      onClick={() => navigate(path)}
    >
      <div className="shortcut-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );

  return (
    <PageWrapper title={`Welcome, ${user?.first_name}!`}>
      {/* Subscription Card */}
      <Card className="subscription-card">
        <h2>Active Subscription</h2>
        <div className="subscription-info">
          <div className="subscription-badge">{subscription.type}</div>
          <p className="subscription-dates">
            {subscription.startDate} → {subscription.endDate}
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${(subscription.daysRemaining / subscription.totalDays) * 100}%`,
              }}
            ></div>
          </div>
          <p className="days-remaining">
            {subscription.daysRemaining} days remaining
          </p>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="stats-grid">
        <StatCard label="Classes Booked" value="12" icon="📚" />
        <StatCard label="Training Sessions" value="8" icon="💪" />
        <StatCard label="Last Check-in" value="Today" icon="✓" />
        <StatCard label="Account Balance" value="$250" icon="💰" />
      </div>

      {/* Quick Links */}
      <Card>
        <h2>Quick Links</h2>
        <div className="shortcuts">
          {shortcut(
            'My Bookings',
            'View and manage class bookings',
            '📅',
            '/member/bookings'
          )}
          {shortcut(
            'Training Sessions',
            'Book personal training sessions',
            '🏋️',
            '/member/sessions'
          )}
          {shortcut(
            'Payment History',
            'View payment records and receipts',
            '💳',
            '/member/payments'
          )}
          {shortcut(
            'My Profile',
            'Update profile information',
            '👤',
            '/member'
          )}
        </div>
      </Card>
    </PageWrapper>
  );
}

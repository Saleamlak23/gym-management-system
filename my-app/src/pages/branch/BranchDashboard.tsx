import { PageWrapper, StatCard, Card, Table } from '../../components';
import '../../styles/dashboard.css';

export function BranchDashboard() {
  // Mock data - in real app, fetch from /api/analytics/branch/:id
  const branchKpis = {
    activeMembers: 180,
    todayCheckIns: 65,
    classFillRate: 78,
    equipmentAlerts: 1,
  };

  const todayClasses = [
    { id: 1, className: 'Yoga', time: '8:00 AM - 9:00 AM', bookings: 22, capacity: 30 },
    { id: 2, className: 'Spinning', time: '9:30 AM - 10:30 AM', bookings: 28, capacity: 30 },
    { id: 3, className: 'HIIT', time: '10:45 AM - 11:45 AM', bookings: 18, capacity: 25 },
    { id: 4, className: 'Pilates', time: '12:00 PM - 1:00 PM', bookings: 15, capacity: 20 },
  ];

  const classColumns = [
    { key: 'className', label: 'Class' },
    { key: 'time', label: 'Time' },
    {
      key: 'bookings',
      label: 'Bookings',
      render: (value: number, row: any) => `${value}/${row.capacity}`,
    },
  ];

  const attendanceData = [
    { member_name: 'John Doe', check_in: '6:00 AM', check_out: '7:30 AM', duration: '1h 30m' },
    { member_name: 'Jane Smith', check_in: '6:15 AM', check_out: '7:45 AM', duration: '1h 30m' },
    { member_name: 'Mike Johnson', check_in: '7:00 AM', check_out: '8:30 AM', duration: '1h 30m' },
    { member_name: 'Sarah Williams', check_in: '7:30 AM', check_out: null, duration: 'Still here' },
    { member_name: 'Tom Brown', check_in: '8:00 AM', check_out: null, duration: 'Still here' },
  ];

  const attendanceColumns = [
    { key: 'member_name', label: 'Member' },
    { key: 'check_in', label: 'Check In' },
    { key: 'check_out', label: 'Check Out' },
    { key: 'duration', label: 'Duration' },
  ];

  return (
    <PageWrapper title="Branch Dashboard">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard label="Active Members" value={branchKpis.activeMembers} icon="👥" />
        <StatCard label="Today's Check-ins" value={branchKpis.todayCheckIns} icon="📊" />
        <StatCard label="Class Fill Rate" value={`${branchKpis.classFillRate}%`} icon="📚" />
        <StatCard label="Equipment Alerts" value={branchKpis.equipmentAlerts} icon="⚠️" />
      </div>

      {/* Today's Classes */}
      <Card title="Today's Class Schedule">
        <Table columns={classColumns} data={todayClasses} />
      </Card>

      {/* Attendance Log */}
      <Card title="Today's Attendance (Last 10)">
        <Table columns={attendanceColumns} data={attendanceData} />
      </Card>

      {/* Equipment Alert */}
      <Card className="alert-card">
        <h3>⚠️ Equipment Alert</h3>
        <p>1 equipment item requires maintenance</p>
        <button className="action-link">View Details</button>
      </Card>

      {/* Attendance Heatmap */}
      <Card title="Peak Hours Heatmap">
        <div className="heatmap-placeholder">
          <p>7x24 attendance heatmap would be rendered here</p>
          <p>Showing average check-ins by hour and day of week</p>
        </div>
      </Card>
    </PageWrapper>
  );
}

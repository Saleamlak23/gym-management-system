import { PageWrapper, StatCard, Card, Table } from '../../components';
import '../../styles/dashboard.css';

export function AdminDashboard() {
  // Mock data - in real app, fetch from /api/analytics/overview
  const kpis = {
    totalMembers: 450,
    activeSubscriptions: 380,
    todayCheckIns: 125,
    monthlyRevenue: 15800,
    classesThisWeek: 28,
    equipmentUnderMaintenance: 3,
  };

  const branches = [
    {
      id: 1,
      name: 'Downtown Gym',
      activeMembers: 180,
      todayAttendance: 65,
      monthlyRevenue: 8500,
      equipmentIssues: 1,
    },
    {
      id: 2,
      name: 'Uptown Fitness',
      activeMembers: 160,
      todayAttendance: 42,
      monthlyRevenue: 7200,
      equipmentIssues: 2,
    },
    {
      id: 3,
      name: 'West Side Sports',
      activeMembers: 110,
      todayAttendance: 18,
      monthlyRevenue: 4100,
      equipmentIssues: 0,
    },
  ];

  const branchColumns = [
    { key: 'name', label: 'Branch' },
    { key: 'activeMembers', label: 'Active Members' },
    { key: 'todayAttendance', label: 'Today\'s Check-ins' },
    { key: 'monthlyRevenue', label: 'Monthly Revenue' },
    { key: 'equipmentIssues', label: 'Equipment Issues' },
  ];

  return (
    <PageWrapper title="Enterprise Dashboard">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <StatCard
          label="Total Members"
          value={kpis.totalMembers}
          icon="👥"
          trend={5}
        />
        <StatCard
          label="Active Subscriptions"
          value={kpis.activeSubscriptions}
          icon="✓"
          trend={3}
        />
        <StatCard
          label="Today's Check-ins"
          value={kpis.todayCheckIns}
          icon="📊"
          trend={12}
        />
        <StatCard
          label="Monthly Revenue"
          value={`$${kpis.monthlyRevenue}`}
          icon="💰"
          trend={8}
        />
        <StatCard
          label="Classes This Week"
          value={kpis.classesThisWeek}
          icon="📚"
          trend={-2}
        />
        <StatCard
          label="Equipment Issues"
          value={kpis.equipmentUnderMaintenance}
          icon="⚙️"
          trend={-1}
        />
      </div>

      {/* Branch Comparison */}
      <Card title="Branch Performance">
        <Table columns={branchColumns} data={branches} />
      </Card>

      {/* Revenue Chart */}
      <Card title="Revenue Trend (Last 6 Months)">
        <div className="chart-placeholder">
          <p>Revenue chart would be rendered here using SVG</p>
          <p>Monthly: Jan: $12,500 | Feb: $13,200 | Mar: $14,800 | Apr: $15,100 | May: $14,900 | Jun: $15,800</p>
        </div>
      </Card>

      {/* Member Growth Chart */}
      <Card title="New Members (Current Year)">
        <div className="chart-placeholder">
          <p>Member growth bar chart would be rendered here</p>
          <p>Jan: 45 | Feb: 38 | Mar: 52 | Apr: 48 | May: 42 | Jun: 35</p>
        </div>
      </Card>
    </PageWrapper>
  );
}

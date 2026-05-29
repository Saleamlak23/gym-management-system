import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, Activity, Zap, Wrench, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/button';
import { AnalyticsOverview } from '@/types';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo
    const mockAnalytics: AnalyticsOverview = {
      total_members: 156,
      active_subscriptions: 142,
      today_checkins: 47,
      monthly_revenue: 8450,
      classes_this_week: 28,
      equipment_under_maintenance: 3,
      subscriptions_expiring_soon: 8,
      branches: [
        { branch_id: 1, name: 'Addis Main', active_subscriptions: 89, today_checkins: 28 },
        { branch_id: 2, name: 'Addis West', active_subscriptions: 53, today_checkins: 19 },
      ],
    };
    setAnalytics(mockAnalytics);
    setLoading(false);
  }, []);

  if (loading || !analytics) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <PageWrapper title="Dashboard" description="Enterprise overview and key metrics">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <p className="text-slate-600">Welcome back, {user?.first_name}!</p>
        </div>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Members" value={analytics.total_members} icon={Users} />
        <StatCard label="Active Subscriptions" value={analytics.active_subscriptions} icon={Activity} />
        <StatCard label="Today's Check-ins" value={analytics.today_checkins} icon={Zap} />
        <StatCard label="Monthly Revenue" value={`${analytics.monthly_revenue}`} icon={CreditCard} />
        <StatCard label="Classes This Week" value={analytics.classes_this_week} icon={Briefcase} />
        <StatCard label="Equipment Under Maintenance" value={analytics.equipment_under_maintenance} icon={Wrench} />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link to="/admin/members">
          <div className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow cursor-pointer">
            <Users className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-1">Members</h3>
            <p className="text-sm text-slate-600">Manage member profiles and subscriptions</p>
          </div>
        </Link>
      </div>

      {/* Branches Overview */}
      <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Branch Overview</h2>
        <div className="space-y-4">
          {analytics.branches.map((branch) => (
            <div key={branch.branch_id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">{branch.name}</p>
                <p className="text-sm text-slate-600">{branch.active_subscriptions} active subscriptions</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">{branch.today_checkins}</p>
                <p className="text-sm text-slate-600">check-ins today</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
};

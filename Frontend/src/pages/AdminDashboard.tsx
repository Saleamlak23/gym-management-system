import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CreditCard, Activity, Zap, Wrench, Briefcase, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton, CardSkeleton } from '@/components/Skeleton';
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
    
    // Simulate network delay
    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 800);
  }, []);

  if (loading || !analytics) {
    return (
      <PageWrapper title="Dashboard" description="Enterprise overview and key metrics">
        <div className="mb-8">
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <CardSkeleton count={6} />
      </PageWrapper>
    );
  }

  const quickLinks = [
    { label: 'Members', icon: Users, path: '/admin/members' },
    { label: 'Classes', icon: Briefcase, path: '/admin/classes' },
    { label: 'Equipment', icon: Wrench, path: '/admin/equipment' },
    { label: 'Analytics', icon: TrendingUp, path: '/admin/analytics' },
  ];

  return (
    <PageWrapper title="Dashboard" description="Enterprise overview and key metrics">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <p className="text-slate-600">Welcome back, <span className="font-semibold">{user?.first_name}!</span></p>
          <p className="text-sm text-slate-500">You're logged in as {user?.role?.replace('_', ' ')}</p>
        </div>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Members" value={analytics.total_members} icon={Users} />
        <StatCard label="Active Subscriptions" value={analytics.active_subscriptions} icon={Activity} />
        <StatCard label="Today's Check-ins" value={analytics.today_checkins} icon={Zap} />
        <StatCard label="Monthly Revenue" value={`$${analytics.monthly_revenue}`} icon={DollarSign} />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Classes This Week</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.classes_this_week}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Equipment Maintenance</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.equipment_under_maintenance}</p>
            </div>
            <Wrench className="h-8 w-8 text-orange-600 opacity-20" />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Subscriptions Expiring</p>
              <p className="text-3xl font-bold text-slate-900">{analytics.subscriptions_expiring_soon}</p>
            </div>
            <CreditCard className="h-8 w-8 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path}>
                <div className="rounded-lg border border-slate-200 bg-white p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <Icon className="h-8 w-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-slate-900">{link.label}</h3>
                  <p className="text-sm text-slate-600">Manage {link.label.toLowerCase()}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Branches Overview */}
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Branch Overview</h2>
        <div className="space-y-4">
          {analytics.branches.map((branch) => (
            <div key={branch.branch_id} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
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

import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { StatCard } from '@/components/ui/StatCard';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

interface AnalyticsData {
  revenueData: Array<{ month: string; revenue: number }>;
  memberGrowth: Array<{ month: string; members: number }>;
  classOccupancy: Array<{ name: string; occupancy: number }>;
  topClasses: Array<{ class: string; bookings: number }>;
}

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockData: AnalyticsData = {
        revenueData: [
          { month: 'Jan', revenue: 8400 },
          { month: 'Feb', revenue: 9200 },
          { month: 'Mar', revenue: 8800 },
          { month: 'Apr', revenue: 10500 },
          { month: 'May', revenue: 11200 },
          { month: 'Jun', revenue: 12100 },
        ],
        memberGrowth: [
          { month: 'Jan', members: 120 },
          { month: 'Feb', members: 132 },
          { month: 'Mar', members: 145 },
          { month: 'Apr', members: 158 },
          { month: 'May', members: 172 },
          { month: 'Jun', members: 190 },
        ],
        classOccupancy: [
          { name: 'Yoga', occupancy: 85 },
          { name: 'CrossFit', occupancy: 92 },
          { name: 'Spin', occupancy: 78 },
          { name: 'Pilates', occupancy: 88 },
        ],
        topClasses: [
          { class: 'CrossFit', bookings: 156 },
          { class: 'Yoga', bookings: 142 },
          { class: 'Spin', bookings: 128 },
          { class: 'Pilates', bookings: 115 },
        ],
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  if (loading || !analytics) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <PageWrapper title="Analytics" description="Business intelligence and performance metrics">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Revenue" value="$48,400" icon={DollarSign} />
        <StatCard label="Total Members" value="190" icon={Users} />
        <StatCard label="Monthly Growth" value="+15.8%" icon={TrendingUp} />
        <StatCard label="Avg Occupancy" value="86%" icon={Activity} />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Member Growth Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Member Growth</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.memberGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="members" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Class Occupancy Pie Chart */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Class Occupancy Rate</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={analytics.classOccupancy} cx="50%" cy="50%" labelLine={false} label={({ name, occupancy }) => `${name}: ${occupancy}%`} outerRadius={80} fill="#8884d8" dataKey="occupancy">
                {analytics.classOccupancy.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Classes Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Classes by Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Class Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Total Bookings</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Progress</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topClasses.map((item) => (
                <tr key={item.class} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4 text-sm text-slate-900">{item.class}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-slate-900">{item.bookings}</td>
                  <td className="py-3 px-4">
                    <div className="w-32 bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(item.bookings / 156) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageWrapper>
  );
};

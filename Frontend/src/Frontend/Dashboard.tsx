import React from 'react';
import { TrendingUp, Users, Zap, Calendar, AlertCircle, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color }) => (
  <div className={`bg-white rounded-lg p-6 shadow-md border-l-4 ${color}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend !== undefined && (
          <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
          </p>
        )}
      </div>
      <div className="text-gray-300">{icon}</div>
    </div>
  </div>
);

export const GlobalDashboard: React.FC = () => {
  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 4000, members: 2400 },
    { month: 'Feb', revenue: 3000, members: 1398 },
    { month: 'Mar', revenue: 2000, members: 9800 },
    { month: 'Apr', revenue: 2780, members: 3908 },
    { month: 'May', revenue: 1890, members: 4800 },
    { month: 'Jun', revenue: 2390, members: 3800 }
  ];

  const classData = [
    { day: 'Mon', classes: 12, attendance: 85 },
    { day: 'Tue', classes: 15, attendance: 92 },
    { day: 'Wed', classes: 10, attendance: 78 },
    { day: 'Thu', classes: 18, attendance: 88 },
    { day: 'Fri', classes: 14, attendance: 95 },
    { day: 'Sat', classes: 8, attendance: 72 },
    { day: 'Sun', classes: 5, attendance: 60 }
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value="₹ 2,45,000"
          icon={<TrendingUp size={32} />}
          trend={12}
          color="border-blue-500"
        />
        <StatCard
          title="Total Members"
          value="1,234"
          icon={<Users size={32} />}
          trend={8}
          color="border-green-500"
        />
        <StatCard
          title="Equipment Health"
          value="94%"
          icon={<Zap size={32} />}
          trend={-2}
          color="border-yellow-500"
        />
        <StatCard
          title="Active Classes"
          value="48"
          icon={<Calendar size={32} />}
          trend={5}
          color="border-purple-500"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Peak Class Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">6:00 PM</p>
              <p className="text-xs text-gray-500 mt-1">Evening Yoga & CrossFit</p>
            </div>
            <Calendar size={32} className="text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Equipment Downtime</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">6%</p>
              <p className="text-xs text-gray-500 mt-1">2 machines under maintenance</p>
            </div>
            <AlertCircle size={32} className="text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Member Churn Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">3.2%</p>
              <p className="text-xs text-gray-500 mt-1">12 cancellations this month</p>
            </div>
            <Activity size={32} className="text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Members Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (₹)" />
              <Line type="monotone" dataKey="members" stroke="#10b981" name="New Members" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Class Attendance Chart */}
        <div className="bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Class Statistics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="classes" fill="#8b5cf6" name="Classes" />
              <Bar dataKey="attendance" fill="#ec4899" name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

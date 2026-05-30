import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, DollarSign, AlertCircle } from 'lucide-react';

export const ReportingModule: React.FC = () => {
  // Mock data for reports
  const revenueByMonthData = [
    { month: 'Jan', revenue: 150000, expenses: 45000 },
    { month: 'Feb', revenue: 165000, expenses: 48000 },
    { month: 'Mar', revenue: 155000, expenses: 46000 },
    { month: 'Apr', revenue: 200000, expenses: 55000 },
    { month: 'May', revenue: 245000, expenses: 60000 },
    { month: 'Jun', revenue: 230000, expenses: 58000 }
  ];

  const membershipDistributionData = [
    { name: 'Basic Monthly', value: 250 },
    { name: 'Premium Monthly', value: 180 },
    { name: 'Annual Plan', value: 120 },
    { name: 'Inactive', value: 60 }
  ];

  const classAttendanceData = [
    { day: 'Monday', attendance: 85, capacity: 100 },
    { day: 'Tuesday', attendance: 92, capacity: 100 },
    { day: 'Wednesday', attendance: 78, capacity: 100 },
    { day: 'Thursday', attendance: 88, capacity: 100 },
    { day: 'Friday', attendance: 95, capacity: 100 },
    { day: 'Saturday', attendance: 72, capacity: 100 },
    { day: 'Sunday', attendance: 60, capacity: 100 }
  ];

  const equipmentUtilizationData = [
    { equipment: 'Treadmill', utilization: 92 },
    { equipment: 'Dumbbells', utilization: 88 },
    { equipment: 'Bikes', utilization: 75 },
    { equipment: 'CrossTrainers', utilization: 68 },
    { equipment: 'Bench Press', utilization: 85 }
  ];

  const staffPerformanceData = [
    { name: 'Rajesh Kumar', classesHeld: 24, satisfaction: 4.8 },
    { name: 'Priya Sharma', classesHeld: 28, satisfaction: 4.9 },
    { name: 'Amit Singh', classesHeld: 20, satisfaction: 4.6 }
  ];

  const memberGrowthData = [
    { week: 'Week 1', newMembers: 15, churnedMembers: 2 },
    { week: 'Week 2', newMembers: 18, churnedMembers: 3 },
    { week: 'Week 3', newMembers: 12, churnedMembers: 1 },
    { week: 'Week 4', newMembers: 22, churnedMembers: 4 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue (6 months)</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹12,45,000</p>
              <p className="text-green-600 text-sm mt-2">↑ 8% from previous period</p>
            </div>
            <DollarSign size={32} className="text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">610</p>
              <p className="text-green-600 text-sm mt-2">↑ 12% growth</p>
            </div>
            <Users size={32} className="text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Class Occupancy</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">82%</p>
              <p className="text-green-600 text-sm mt-2">Healthy utilization</p>
            </div>
            <TrendingUp size={32} className="text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Member Churn Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">3.2%</p>
              <p className="text-red-600 text-sm mt-2">12 cancellations this month</p>
            </div>
            <AlertCircle size={32} className="text-red-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Expenses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByMonthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue (₹)" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Membership Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={membershipDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {membershipDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Class Attendance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Class Attendance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attendance" fill="#10b981" name="Attendance" />
              <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Equipment Utilization */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipment Utilization Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={equipmentUtilizationData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="equipment" type="category" width={190} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="utilization" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Staff Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Staff Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={staffPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="classesHeld" fill="#8b5cf6" name="Classes Held" />
              <Bar dataKey="satisfaction" fill="#06b6d4" name="Satisfaction Rating" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Member Growth */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Growth & Churn</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="newMembers" fill="#10b981" name="New Members" />
              <Bar dataKey="churnedMembers" fill="#ef4444" name="Churned Members" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Classes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Classes</h3>
          <div className="space-y-3">
            {[
              { name: 'Power Yoga', members: 28, rating: 4.8 },
              { name: 'CrossFit Bootcamp', members: 24, rating: 4.9 },
              { name: 'Zumba Fitness', members: 42, rating: 4.7 },
              { name: 'Pilates Core', members: 18, rating: 4.6 }
            ].map((cls, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{cls.name}</p>
                  <p className="text-xs text-gray-500">{cls.members} members</p>
                </div>
                <div className="text-right">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-gray-900">{cls.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Retention Insights */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Retention Insights</h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-sm font-medium text-blue-900">High Engagement</p>
              <p className="text-xs text-blue-700 mt-1">Members attending 3+ sessions/week have 95% retention rate</p>
            </div>
            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-sm font-medium text-green-900">Peak Hours Optimization</p>
              <p className="text-xs text-green-700 mt-1">Evening classes (6-8 PM) have 82% higher attendance</p>
            </div>
            <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
              <p className="text-sm font-medium text-orange-900">Seasonal Trend</p>
              <p className="text-xs text-orange-700 mt-1">New Year (Jan-Mar) and pre-summer (Apr-May) see 25% more sign-ups</p>
            </div>
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-sm font-medium text-red-900">At-Risk Segment</p>
              <p className="text-xs text-red-700 mt-1">Members inactive for 2+ weeks have 60% churn rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

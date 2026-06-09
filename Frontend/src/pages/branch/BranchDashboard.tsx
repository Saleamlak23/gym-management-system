import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { getBranchAnalytics } from '@/services/analytics.service';
import { Users, TrendingUp, Calendar, Zap } from 'lucide-react';

export const BranchDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.branch_id) return;

      try {
        setLoading(true);
        const response = await getBranchAnalytics(user.branch_id);
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch branch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.branch_id]);

  if (loading || !analytics) {
    return <PageWrapper title="Branch Dashboard">Loading...</PageWrapper>;
  }

  return (
    <PageWrapper title={`${analytics.branch_name} Dashboard`}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Active Members"
            value={analytics.active_members}
            icon={Users}
          />
          <StatCard
            label="Today's Check-Ins"
            value={analytics.today_checkins}
            icon={Users}
          />
          <StatCard
            label="Monthly Revenue"
            value={`Br ${analytics.monthly_revenue}`}
            icon={TrendingUp}
          />
          <StatCard
            label="Classes This Week"
            value={analytics.classes_this_week}
            icon={Calendar}
          />
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border hover:border-blue-500 cursor-pointer">
              <Calendar className="h-6 w-6 text-blue-600 mb-2" />
              <p className="font-medium">Class Schedule</p>
              <p className="text-sm text-gray-600">View and manage classes</p>
            </Card>
            <Card className="p-4 border hover:border-blue-500 cursor-pointer">
              <Users className="h-6 w-6 text-green-600 mb-2" />
              <p className="font-medium">Attendance Log</p>
              <p className="text-sm text-gray-600">Today's check-ins</p>
            </Card>
            <Card className="p-4 border hover:border-blue-500 cursor-pointer">
              <Zap className="h-6 w-6 text-yellow-600 mb-2" />
              <p className="font-medium">Equipment Status</p>
              <p className="text-sm text-gray-600">View maintenance</p>
            </Card>
          </div>
        </Card>

        {analytics.daily_attendance_week && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">This Week's Attendance</h3>
            <div className="space-y-2">
              {analytics.daily_attendance_week.map((day: any) => (
                <div key={day.date} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-20">{day.date}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(day.count / Math.max(...analytics.daily_attendance_week.map((d: any) => d.count))) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{day.count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

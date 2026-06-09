import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getBranchTodayAttendance, getHeatmapData } from '@/services/attendance.service';
import { formatDateTime, formatTime, formatDuration } from '@/utils/formatters';
import { useAuth } from '@/context/AuthContext';
import { Users } from 'lucide-react';

export const Attendance = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.branch_id) return;

      try {
        setLoading(true);
        const [todayRes, heatmapRes] = await Promise.all([
          getBranchTodayAttendance(user.branch_id),
          getHeatmapData(user.branch_id, 90),
        ]);
        setTodayAttendance(todayRes.data);
        setHeatmapData(heatmapRes.data);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.branch_id]);

  if (loading) {
    return <PageWrapper title="Attendance">Loading...</PageWrapper>;
  }

  // Prepare heatmap visualization data
  const heatmapChartData = heatmapData?.grid?.map((dayData: any) => {
    const data: any = { day: dayData.day_name };
    dayData.hours.forEach((hour: any) => {
      data[`${hour.hour_of_day}:00`] = hour.total_checkins;
    });
    return data;
  }) || [];

  return (
    <PageWrapper title="Attendance & Analytics">
      <div className="space-y-6">
        {/* Summary Stats */}
        {todayAttendance && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <p className="text-sm text-gray-600">Currently Inside</p>
              <p className="text-3xl font-bold">{todayAttendance.currently_inside}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600">Total Visits Today</p>
              <p className="text-3xl font-bold">{todayAttendance.total_visits}</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600">Branch</p>
              <p className="text-xl font-bold">{todayAttendance.branch?.branch_name}</p>
            </Card>
          </div>
        )}

        {/* Attendance List */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Check-Ins</h3>
          {todayAttendance?.attendance?.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No members checked in yet"
              message="Members will appear here as they check in."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left">Member</th>
                    <th className="px-4 py-2 text-left">Check In</th>
                    <th className="px-4 py-2 text-left">Check Out</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {todayAttendance?.attendance?.map((record: any) => (
                    <tr key={record.attendance_id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{record.member_name}</td>
                      <td className="px-4 py-3">{formatTime(record.check_in)}</td>
                      <td className="px-4 py-3">
                        {record.check_out ? formatTime(record.check_out) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            record.status === 'checked_in' ? 'default' : 'secondary'
                          }
                        >
                          {record.status === 'checked_in' ? 'Inside' : 'Left'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Peak Hours Heatmap */}
        {heatmapData && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Peak Hours (Last 90 Days)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={heatmapChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                {heatmapData.grid?.[0]?.hours?.map((hour: any, idx: number) => (
                  <Line
                    key={idx}
                    type="monotone"
                    dataKey={`${hour.hour_of_day}:00`}
                    stroke={`hsl(${(idx * 360) / heatmapData.grid[0].hours.length}, 70%, 50%)`}
                    dot={false}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
};

import { useState, useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { getClassSchedules } from '@/services/classes.service';
import { formatDateTime, formatTime } from '@/utils/formatters';
import { getClassCapacityColor, getClassCapacityLabel } from '@/utils/status-helpers';
import { Calendar, Plus } from 'lucide-react';

export const ClassSchedule = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        const response = await getClassSchedules({ date: selectedDate });
        setSchedules(response.data?.schedules || []);
      } catch (error) {
        console.error('Failed to fetch schedules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [selectedDate]);

  if (loading) {
    return <PageWrapper title="Class Schedule">Loading...</PageWrapper>;
  }

  // Group by time
  const groupedByTime = schedules.reduce((acc: any, schedule: any) => {
    const time = formatTime(schedule.start_time);
    if (!acc[time]) acc[time] = [];
    acc[time].push(schedule);
    return acc;
  }, {});

  return (
    <PageWrapper title="Class Schedule">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">This Week's Classes</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 px-3 py-2 border rounded"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Class
          </Button>
        </div>

        {schedules.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No classes scheduled"
            message="Create your first class session for this date."
            actionLabel="Schedule Class"
          />
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByTime).map(([time, timeSchedules]: [string, any]) => (
              <div key={time}>
                <h3 className="text-lg font-semibold mb-2">{time}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(timeSchedules as any[]).map((schedule) => (
                    <Card key={schedule.schedule_id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{schedule.class_name}</h4>
                        <Badge className={getClassCapacityColor(schedule.spots_remaining, schedule.capacity)}>
                          {schedule.spots_remaining}/{schedule.capacity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Instructor: {schedule.instructor_name}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {schedule.branch_name} · {schedule.bookings_count} booked
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        {formatDateTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Bookings
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600">
                          Cancel
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

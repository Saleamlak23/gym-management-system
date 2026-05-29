import React, { useEffect, useState } from 'react';
import { Calendar, Users, Clock, MapPin } from 'lucide-react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/Skeleton';
import { classesService } from '@/services/classes.service';

interface ClassSchedule {
  schedule_id: number;
  class_name: string;
  trainer_name: string;
  start_time: string;
  end_time: string;
  max_capacity: number;
  enrolled_count: number;
  branch_name: string;
  status: string;
}

export const ClassesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadSchedules();
  }, [selectedDate]);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const response = await classesService.getSchedules({
        date: selectedDate,
        limit: 50,
      });
      if (response.success && response.data) {
        setSchedules(response.data.schedules);
      }
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCapacityColor = (enrolled: number, max: number) => {
    const percent = (enrolled / max) * 100;
    if (percent >= 90) return 'text-red-600';
    if (percent >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      scheduled: 'bg-blue-100 text-blue-800',
      ongoing: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <CardSkeleton count={6} />;
  }

  return (
    <PageWrapper title="Class Schedules" description="View and manage gym classes">
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
        />
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">No classes scheduled for this date</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => (
            <div key={schedule.schedule_id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4 flex justify-between items-start">
                <h3 className="text-lg font-bold text-slate-900">{schedule.class_name}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(schedule.status)}`}>
                  {schedule.status}
                </span>
              </div>

              <div className="space-y-3 mb-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{schedule.trainer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(schedule.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(schedule.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{schedule.branch_name}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Enrollment</span>
                  <span className={`font-semibold ${getCapacityColor(schedule.enrolled_count, schedule.max_capacity)}`}>
                    {schedule.enrolled_count}/{schedule.max_capacity}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(schedule.enrolled_count / schedule.max_capacity) * 100}%` }}
                  />
                </div>
              </div>

              <Button className="w-full" variant={schedule.enrolled_count < schedule.max_capacity ? 'default' : 'outline'} disabled={schedule.enrolled_count >= schedule.max_capacity}>
                {schedule.enrolled_count >= schedule.max_capacity ? 'Class Full' : 'Book Class'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

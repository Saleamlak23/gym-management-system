import api from '@/lib/api';

export interface AttendanceRecord {
  attendance_id: number;
  member_id: number;
  member_name: string;
  branch_id: number;
  branch_name: string;
  check_in: string;
  check_out: string | null;
  duration_minutes?: number;
  status: 'checked_in' | 'checked_out';
}

export interface HeatmapData {
  branch: { branch_id: number; branch_name: string };
  analysis_period_days: number;
  max_checkins: number;
  grid: Array<{
    day_of_week: number;
    day_name: string;
    hours: Array<{
      hour_of_day: number;
      total_checkins: number;
      avg_per_week: number;
    }>;
  }>;
}

export const checkin = async (memberId: number, branchId: number) => {
  const response = await api.post('/attendance/checkin', {
    member_id: memberId,
    branch_id: branchId,
  });
  return response.data;
};

export const checkout = async (memberId: number, branchId: number) => {
  const response = await api.post('/attendance/checkout', {
    member_id: memberId,
    branch_id: branchId,
  });
  return response.data;
};

export const getAttendanceRecords = async (filters?: {
  branchId?: number;
  memberId?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/attendance', { params: filters });
  return response.data;
};

export const getMemberAttendance = async (
  memberId: number,
  page?: number,
  limit?: number
) => {
  const response = await api.get(`/attendance/member/${memberId}`, {
    params: { page, limit },
  });
  return response.data;
};

export const getBranchTodayAttendance = async (branchId: number) => {
  const response = await api.get(`/attendance/today/${branchId}`);
  return response.data;
};

export const getHeatmapData = async (
  branchId: number,
  days: number = 90
): Promise<{ success: boolean; data: HeatmapData }> => {
  const response = await api.get(`/attendance/heatmap/${branchId}`, {
    params: { days },
  });
  return response.data;
};

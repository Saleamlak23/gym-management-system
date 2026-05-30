import apiClient from '@/lib/api';

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

interface ClassResponse {
  success: boolean;
  data: {
    schedules: ClassSchedule[];
    pagination: {
      totalPages: number;
      currentPage: number;
      total: number;
    };
  };
  message?: string;
}

export const classesService = {
  getSchedules: async (params?: any): Promise<ClassResponse> => {
    const { data } = await apiClient.getClient().get('/classes/schedules', { params });
    return data;
  },

  getClassTemplates: async () => {
    const { data } = await apiClient.getClient().get('/classes');
    return data;
  },

  getScheduleBookings: async (scheduleId: number) => {
    const { data } = await apiClient.getClient().get(`/classes/schedules/${scheduleId}/bookings`);
    return data;
  },

  bookClass: async (scheduleId: number) => {
    const { data } = await apiClient.getClient().post('/classes/bookings', { schedule_id: scheduleId });
    return data;
  },

  cancelBooking: async (bookingId: number) => {
    const { data } = await apiClient.getClient().delete(`/classes/bookings/${bookingId}`);
    return data;
  },

  getMyBookings: async () => {
    const { data } = await apiClient.getClient().get('/classes/bookings/mine');
    return data;
  },

  createSchedule: async (scheduleData: any) => {
    const { data } = await apiClient.getClient().post('/classes/schedules', scheduleData);
    return data;
  },

  cancelSchedule: async (scheduleId: number) => {
    const { data } = await apiClient.getClient().delete(`/classes/schedules/${scheduleId}`);
    return data;
  },
};

// Export individual functions for convenience
export const getClasses = classesService.getClassTemplates;
export const getClassSchedules = classesService.getSchedules;
export const getMyBookings = classesService.getMyBookings;
export const cancelBooking = classesService.cancelBooking;
export const bookClass = classesService.bookClass;
export const getScheduleBookings = classesService.getScheduleBookings;

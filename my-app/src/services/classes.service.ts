import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

export const getClasses = async () => {
  const response = await api.get('/classes');
  return response.data;
};

export const getSchedules = async (branchId?: number, date?: string) => {
  const params = new URLSearchParams();
  if (branchId) params.append('branch_id', branchId.toString());
  if (date) params.append('date', date);
  const response = await api.get(`/schedules?${params}`);
  return response.data;
};

export const bookClass = async (data: any) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const cancelBooking = async (id: number) => {
  const response = await api.delete(`/bookings/${id}`);
  return response.data;
};

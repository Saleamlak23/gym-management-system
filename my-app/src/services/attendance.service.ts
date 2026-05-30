import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

export const checkIn = async (memberId: number) => {
  const response = await api.post('/attendance/checkin', { member_id: memberId });
  return response.data;
};

export const checkOut = async (memberId: number) => {
  const response = await api.post('/attendance/checkout', { member_id: memberId });
  return response.data;
};

export const getAttendanceRecords = async (date?: string, branchId?: number) => {
  const params = new URLSearchParams();
  if (date) params.append('date', date);
  if (branchId) params.append('branch_id', branchId.toString());
  const response = await api.get(`/attendance?${params}`);
  return response.data;
};

export const getMemberAttendance = async (memberId: number) => {
  const response = await api.get(`/attendance/member/${memberId}`);
  return response.data;
};

export const getHeatmap = async (branchId: number) => {
  const response = await api.get(`/attendance/heatmap/${branchId}`);
  return response.data;
};

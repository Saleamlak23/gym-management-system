import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

export const getStaff = async (branchId?: number, role?: string) => {
  const params = new URLSearchParams();
  if (branchId) params.append('branch_id', branchId.toString());
  if (role) params.append('role', role);
  const response = await api.get(`/staff?${params}`);
  return response.data;
};

export const getStaffDetail = async (id: number) => {
  const response = await api.get(`/staff/${id}`);
  return response.data;
};

export const getStaffRoles = async () => {
  const response = await api.get('/staff/roles');
  return response.data;
};

export const getStaffPayroll = async (id: number, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  const response = await api.get(`/staff/${id}/payroll?${params}`);
  return response.data;
};

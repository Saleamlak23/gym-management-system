import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

export const getEquipment = async (branchId?: number, category?: string, status?: string) => {
  const params = new URLSearchParams();
  if (branchId) params.append('branch_id', branchId.toString());
  if (category) params.append('category', category);
  if (status) params.append('status', status);
  const response = await api.get(`/equipment?${params}`);
  return response.data;
};

export const getEquipmentMaintenance = async (equipmentId: number) => {
  const response = await api.get(`/equipment/${equipmentId}/maintenance`);
  return response.data;
};

export const logMaintenance = async (equipmentId: number, data: any) => {
  const response = await api.post(`/equipment/${equipmentId}/maintenance`, data);
  return response.data;
};

export const getOverdueEquipment = async () => {
  const response = await api.get('/equipment/overdue');
  return response.data;
};

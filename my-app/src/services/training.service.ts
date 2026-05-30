import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

export const getTrainingSessions = async (filters?: any) => {
  const params = new URLSearchParams();
  if (filters?.trainerId) params.append('trainer_id', filters.trainerId);
  if (filters?.memberId) params.append('member_id', filters.memberId);
  const response = await api.get(`/training?${params}`);
  return response.data;
};

export const bookTrainingSession = async (data: any) => {
  const response = await api.post('/training', data);
  return response.data;
};

export const updateSessionStatus = async (id: number, status: string) => {
  const response = await api.patch(`/training/${id}/status`, { status });
  return response.data;
};

export const cancelTrainingSession = async (id: number) => {
  const response = await api.delete(`/training/${id}`);
  return response.data;
};

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const getMembersList = async (search?: string, status?: string) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  const response = await api.get(`/members?${params}`);
  return response.data;
};

export const getMemberDetail = async (id: number) => {
  const response = await api.get(`/members/${id}`);
  return response.data;
};

export const updateMember = async (id: number, data: any) => {
  const response = await api.put(`/members/${id}`, data);
  return response.data;
};

export const deleteMember = async (id: number) => {
  const response = await api.delete(`/members/${id}`);
  return response.data;
};

export const getMemberSubscriptions = async (id: number) => {
  const response = await api.get(`/members/${id}/subscriptions`);
  return response.data;
};

export const createMemberSubscription = async (id: number, data: any) => {
  const response = await api.post(`/members/${id}/subscriptions`, data);
  return response.data;
};

export const updateMemberSubscription = async (
  id: number,
  subId: number,
  data: any
) => {
  const response = await api.patch(`/members/${id}/subscriptions/${subId}`, data);
  return response.data;
};

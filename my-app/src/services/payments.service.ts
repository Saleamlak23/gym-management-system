import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
const api = axios.create({ baseURL: API_URL });

export const recordPayment = async (data: any) => {
  const response = await api.post('/payments', data);
  return response.data;
};

export const getPayments = async (startDate?: string, endDate?: string, method?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (method) params.append('method', method);
  const response = await api.get(`/payments?${params}`);
  return response.data;
};

export const getMemberPayments = async (id: number) => {
  const response = await api.get(`/payments/member/${id}`);
  return response.data;
};

export const getPaymentsSummary = async (startDate?: string, endDate?: string, branchId?: number) => {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  if (branchId) params.append('branch_id', branchId.toString());
  const response = await api.get(`/payments/summary?${params}`);
  return response.data;
};

import api from '@/lib/api';

export interface ChapaCheckoutResponse {
  tx_ref: string;
  checkout_url: string;
  amount: number;
  currency: string;
  membership: string;
  expires_in: string;
}

export interface ChapaVerifyResponse {
  tx_ref: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  amount: number;
  currency: string;
  membership: string;
  duration_days: number;
  subscription_id: number;
  start_date: string;
  end_date: string;
  processed_at: string;
}

export interface Bank {
  id: string;
  name: string;
  code: string;
}

export const initiatePayment = async (
  typeId: number
): Promise<{ success: boolean; data: ChapaCheckoutResponse }> => {
  const response = await api.post('/chapa/initiate', { type_id: typeId });
  return response.data;
};

export const verifyPayment = async (
  txRef: string
): Promise<{ success: boolean; data: ChapaVerifyResponse }> => {
  const response = await api.get(`/chapa/verify/${txRef}`);
  return response.data;
};

export const getBanks = async (): Promise<{
  success: boolean;
  data: { banks: Bank[] };
}> => {
  const response = await api.get('/chapa/banks');
  return response.data;
};

export const getPaymentIntents = async (filters?: {
  status?: string;
  memberId?: number;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/chapa/intents', { params: filters });
  return response.data;
};

export const getPaymentStatus = async (txRef: string) => {
  const response = await api.get(`/chapa/status/${txRef}`);
  return response.data;
};

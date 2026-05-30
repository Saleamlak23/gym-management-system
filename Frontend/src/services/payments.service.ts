import api from '@/lib/api';

export interface Payment {
  payment_id: number;
  member_id: number;
  member_name: string;
  amount: string;
  method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
  payment_date: string;
}

export interface PaymentSummary {
  period: { start_date: string; end_date: string };
  total_revenue: number;
  by_method: Array<{
    method: string;
    transaction_count: number;
    total: string;
    average: string;
  }>;
  by_month: Array<{
    month: string;
    transaction_count: number;
    total: string;
  }>;
  top_members: Array<{
    member_id: number;
    member_name: string;
    payment_count: number;
    total_paid: string;
  }>;
}

export const recordPayment = async (
  memberId: number,
  amount: number,
  method: string,
  paymentDate?: string
) => {
  const response = await api.post('/payments', {
    member_id: memberId,
    amount,
    method,
    payment_date: paymentDate,
  });
  return response.data;
};

export const getPayments = async (filters?: {
  startDate?: string;
  endDate?: string;
  method?: string;
  memberId?: number;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/payments', { params: filters });
  return response.data;
};

export const getPaymentSummary = async (
  startDate?: string,
  endDate?: string
) => {
  const response = await api.get('/payments/summary', {
    params: { start_date: startDate, end_date: endDate },
  });
  return response.data;
};

export const getMemberPayments = async (memberId: number) => {
  const response = await api.get(`/payments/member/${memberId}`);
  return response.data;
};

import api from '@/lib/api';

export interface AnalyticsOverview {
  total_members: number;
  active_subscriptions: number;
  today_checkins: number;
  monthly_revenue: number;
  classes_this_week: number;
  equipment_under_maintenance: number;
  subscriptions_expiring_soon: number;
  branches: Array<{
    branch_id: number;
    name: string;
    active_subscriptions: number;
    today_checkins: number;
  }>;
}

export interface BranchAnalytics {
  branch_id: number;
  branch_name: string;
  today_checkins: number;
  active_members: number;
  monthly_revenue: number;
  classes_this_week: number;
  top_class: string;
  daily_attendance_week: Array<{
    date: string;
    count: number;
  }>;
}

export interface RevenueData {
  grand_total: number;
  revenue: Array<{
    period: string;
    total_revenue: string;
  }>;
}

export interface MemberGrowth {
  monthly_growth: Array<{
    month: string;
    new_members: number;
    cumulative_total: number;
  }>;
}

export interface ClassFillRate {
  classes: Array<{
    class_name: string;
    avg_fill_rate_pct: string;
    sessions_count: number;
    branch_name: string;
  }>;
}

export const getOverviewAnalytics = async (): Promise<{
  success: boolean;
  data: AnalyticsOverview;
}> => {
  const response = await api.get('/analytics/overview');
  return response.data;
};

export const getBranchAnalytics = async (
  branchId: number
): Promise<{ success: boolean; data: BranchAnalytics }> => {
  const response = await api.get(`/analytics/branch/${branchId}`);
  return response.data;
};

export const getRevenueData = async (
  groupBy: 'day' | 'week' | 'month' = 'month',
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; data: RevenueData }> => {
  const response = await api.get('/analytics/revenue', {
    params: { group_by: groupBy, start_date: startDate, end_date: endDate },
  });
  return response.data;
};

export const getMemberGrowth = async (
  months: number = 12
): Promise<{ success: boolean; data: MemberGrowth }> => {
  const response = await api.get('/analytics/members/growth', {
    params: { months },
  });
  return response.data;
};

export const getClassFillRate = async (
  branchId?: number,
  startDate?: string,
  endDate?: string
): Promise<{ success: boolean; data: ClassFillRate }> => {
  const response = await api.get('/analytics/classes/fillrate', {
    params: { branch_id: branchId, start_date: startDate, end_date: endDate },
  });
  return response.data;
};

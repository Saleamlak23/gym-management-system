import api from './api'
import type {
  OverviewAnalytics,
  BranchAnalytics,
  RevenueDataPoint,
  GrowthDataPoint,
} from '@/types'

// ── Shapes ────────────────────────────────────────────────

export interface GetRevenueParams {
  group_by?: 'month' | 'week' | 'day'
  start_date?: string  // ISO date
  end_date?: string    // ISO date
  branch_id?: number
}

export interface ClassFillRate {
  class_id: number
  class_name: string
  branch_id: number
  branch_name: string
  avg_fill_rate: number  // 0–100 percentage
}

// ── Calls ─────────────────────────────────────────────────

/**
 * GET /api/analytics/overview
 * Returns enterprise-level KPIs across all branches:
 * total members, active subscriptions, today's check-ins,
 * monthly revenue, classes this week, equipment under
 * maintenance, and a per-branch summary array.
 * Accessible by enterprise_admin only.
 */
export async function getOverview(): Promise<OverviewAnalytics> {
  const res = await api.get<{ data: any }>('/analytics/overview')
  const raw = res.data.data

  return {
    totalMembers: raw.total_members,
    activeSubscriptions: raw.active_subscriptions,
    todayCheckIns: raw.today_checkins,
    monthlyRevenue: raw.monthly_revenue,
    classesThisWeek: raw.classes_this_week,
    equipmentUnderMaintenance: raw.equipment_under_maintenance,
    branches: (raw.branches || []).map((b: any) => ({
      id: b.branch_id,
      name: b.name,
      address: b.address ?? '',
      city: b.city ?? '',
      phone: b.phone ?? undefined,
      email: b.email ?? undefined,
      created_at: b.created_at ?? '',
      activeMembers: b.active_subscriptions,
      todayAttendance: b.today_checkins,
      monthlyRevenue: b.monthly_revenue_estimate,
      equipmentIssues: b.equipment_issues ?? 0,
    })),
  }
}

/**
 * GET /api/analytics/branch/:id
 * Returns the same KPI set scoped to a single branch.
 * Also includes today's class schedule and recent
 * attendance for the branch dashboard.
 * Accessible by branch_manager and enterprise_admin.
 */
export async function getBranchAnalytics(
  branchId: number,
): Promise<BranchAnalytics> {
  const res = await api.get<{ data: any }>(`/analytics/branch/${branchId}`)
  const raw = res.data.data || {}
  const b = raw.branch || {}
  return {
    id: b.branch_id,
    name: b.name,
    activeMembers: raw.active_members ?? raw.active_members_count ?? 0,
    todayAttendance: raw.today_checkins ?? 0,
    monthlyRevenue: raw.monthly_revenue ?? 0,
    equipmentIssues: raw.equipment?.under_maintenance ?? 0,
    classFillRate: raw.top_class?.avg_fill_rate_pct ?? undefined,
    todaysClasses: raw.todays_classes || [],
    recentAttendance: raw.daily_attendance_week || [],
  }
}

/**
 * GET /api/analytics/revenue
 * Returns revenue totals over time, grouped by month by default.
 * Used to render the line chart on the admin dashboard.
 * Response headers include Cache-Control: max-age=60.
 * Accessible by enterprise_admin only.
 */
export async function getRevenueTrend(
  params?: GetRevenueParams,
): Promise<RevenueDataPoint[]> {
  const res = await api.get<{ data: any }>('/analytics/revenue', { params })
  const raw = res.data.data || {}
  const rows = raw.revenue || []
  return rows.map((r: any) => ({ month: r.period, value: Number(r.total_revenue) }))
}

/**
 * GET /api/analytics/members/growth
 * Returns new member signup counts per month for the
 * current year. Used to render the bar chart on the
 * admin dashboard.
 * Accessible by enterprise_admin only.
 */
export async function getMemberGrowth(): Promise<GrowthDataPoint[]> {
  const res = await api.get<{ data: any }>('/analytics/members/growth')
  const raw = res.data.data || {}
  const rows = raw.monthly_growth || []
  return rows.map((r: any) => ({ month: r.month, count: r.new_members }))
}

/**
 * GET /api/analytics/classes/fillrate
 * Returns the average fill rate per class per branch.
 * Used to identify under-performing or over-subscribed
 * sessions.
 * Accessible by enterprise_admin only.
 */
export async function getClassFillRates(): Promise<ClassFillRate[]> {
  const res = await api.get<{ data: any }>('/analytics/classes/fillrate')
  const raw = res.data.data || {}
  const rows = raw.classes || []
  return rows.map((r: any) => ({
    class_id: r.class_id,
    class_name: r.class_name,
    branch_id: r.branch_id,
    branch_name: r.branch_name,
    avg_fill_rate: r.avg_fill_rate_pct,
  }))
}
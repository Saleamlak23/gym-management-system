/* ============================================================
   GymOS — Shared TypeScript Types
   Mirrors the 16-table database schema
   ============================================================ */

// ── Auth ──────────────────────────────────────────────────

export type UserRole =
  | 'enterprise_admin'
  | 'branch_manager'
  | 'staff'
  | 'trainer'
  | 'member'

export interface AuthUser {
  id: number
  first_name: string
  last_name: string
  email: string
  role: UserRole
  branch_id?: number
}

export interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
}

// ── API response wrapper ──────────────────────────────────

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  message: string
  errors?: { field: string; message: string }[]
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ── Branch ───────────────────────────────────────────────

export interface Branch {
  id: number
  name: string
  address: string
  city: string
  phone?: string
  email?: string
  created_at: string
}

// ── Staff ────────────────────────────────────────────────

export interface StaffRole {
  id: number
  role_name: string
  hourly_rate: number
}

export interface Staff {
  id: number
  first_name: string
  last_name: string
  email: string
  role_id: number
  role_name?: string
  branch_id: number
  branch_name?: string
  created_at: string
}

export interface PayrollSummary {
  staff_id: number
  name: string
  total_hours: number
  hourly_rate: number
  estimated_pay: number
  period: string
}

// ── Members ──────────────────────────────────────────────

export interface Member {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  join_date: string
  subscription_status?: SubscriptionStatus
}

// ── Membership & Subscriptions ────────────────────────────

export interface MembershipType {
  id: number
  name: string
  duration_days: number
  price: number
  description?: string
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'frozen'

export interface Subscription {
  id: number
  member_id: number
  membership_type_id: number
  type_name?: string
  start_date: string
  end_date: string
  status: SubscriptionStatus
  created_at: string
}

// ── Payments ─────────────────────────────────────────────

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'mobile_money'

export interface Payment {
  id: number
  member_id: number
  first_name?: string
  last_name?: string
  amount: number
  method: PaymentMethod
  note?: string
  payment_date: string
  created_at?: string
}

export interface PaymentSummary {
  totalRevenue: number
  byMethod: { method: PaymentMethod; total: number }[]
  byMonth: { month: string; total: number }[]
}

// ── Classes & Schedules ───────────────────────────────────

export interface GymClass {
  id: number
  name: string
  description?: string
  capacity: number
  duration_minutes: number
}

export interface ClassSchedule {
  id: number
  class_id: number
  class_name?: string
  branch_id: number
  branch_name?: string
  instructor_id?: number
  instructor_name?: string
  start_time: string
  end_time: string
  bookings?: number
  capacity?: number
}

export interface ClassBooking {
  id: number
  schedule_id: number
  member_id: number
  member_name?: string
  booked_at: string
}

// ── Personal Training ─────────────────────────────────────

export type TrainingStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled'

export interface TrainingSession {
  id: number
  member_id: number
  member_name?: string
  trainer_id: number
  trainer_name?: string
  scheduled_at: string
  duration_minutes: number
  status: TrainingStatus
  notes?: string
}

// ── Equipment ─────────────────────────────────────────────

export type EquipmentStatus = 'active' | 'maintenance' | 'retired'

export interface EquipmentCategory {
  id: number
  name: string
}

export interface Equipment {
  id: number
  model_number: string
  name: string
  category_id: number
  category_name?: string
  branch_id: number
  branch_name?: string
  purchase_date: string
  status: EquipmentStatus
  last_serviced_date?: string
}

export interface MaintenanceLog {
  id: number
  equipment_id: number
  service_date: string
  description: string
  cost: number
  created_at: string
}

// ── Attendance ────────────────────────────────────────────

export interface AttendanceRecord {
  id: number
  member_id: number
  member_name?: string
  branch_id: number
  branch_name?: string
  check_in: string
  check_out?: string
}

export interface HeatmapCell {
  day_of_week: number  // 1 = Monday … 7 = Sunday
  hour: number         // 0–23
  avg_count: number
}

// ── Analytics ─────────────────────────────────────────────

export interface OverviewAnalytics {
  totalMembers: number
  activeSubscriptions: number
  todayCheckIns: number
  monthlyRevenue: number
  classesThisWeek: number
  equipmentUnderMaintenance: number
  branches: BranchAnalytics[]
}

export interface BranchAnalytics {
  id: number
  name: string
  activeMembers: number
  todayAttendance: number
  monthlyRevenue: number
  equipmentIssues: number
  classFillRate?: number
  todaysClasses?: ClassSchedule[]
  recentAttendance?: AttendanceRecord[]
}

export interface RevenueDataPoint {
  month: string
  value: number
}

export interface GrowthDataPoint {
  month: string
  count: number
}


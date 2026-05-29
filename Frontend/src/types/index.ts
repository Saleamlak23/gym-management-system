// Authentication & User Types
export type UserRole = 'member' | 'enterprise_admin' | 'branch_manager' | 'trainer' | 'staff';

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  join_date?: string;
  branch_id?: number | null;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    user: AuthUser;
  };
}

// Member Types
export interface Member {
  member_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  join_date: string;
  is_active: boolean;
  subscription_id?: number;
  subscription_status: 'active' | 'expired' | 'cancelled' | 'frozen';
  subscription_start?: string;
  subscription_end?: string;
  membership_title?: string;
  membership_price?: string;
  total_visits?: number;
}

export interface MembersListResponse {
  success: boolean;
  data: {
    members: Member[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// Subscription Types
export interface Subscription {
  subscription_id: number;
  status: 'active' | 'expired' | 'cancelled' | 'frozen';
  start_date: string;
  end_date: string;
  membership_title: string;
  membership_price: string;
  duration_days: number;
}

export interface SubscriptionsResponse {
  success: boolean;
  data: {
    subscriptions: Subscription[];
  };
}

// Membership Type
export interface MembershipType {
  type_id: number;
  type_name: string;
  price: number;
  duration_days: number;
}

// Payment Types
export interface Payment {
  payment_id: number;
  member_id: number;
  member_name?: string;
  amount: string;
  method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
  payment_date: string;
}

export interface PaymentsResponse {
  success: boolean;
  data: {
    payments: Payment[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

// Class Types
export interface ClassTemplate {
  class_id: number;
  class_name: string;
  description?: string;
  capacity: number;
  upcoming_sessions?: number;
}

export interface ClassSchedule {
  schedule_id: number;
  start_time: string;
  end_time: string;
  class_name: string;
  capacity: number;
  branch_name: string;
  instructor_name: string;
  bookings_count: number;
  spots_remaining: number;
}

export interface ClassBooking {
  booking_id: number;
  booking_time: string;
  member_id: number;
  member_name: string;
  member_email: string;
}

// Training Session Types
export interface TrainingSession {
  session_id: number;
  scheduled_at: string;
  duration_min: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  member_id?: number;
  member_name?: string;
  member_email?: string;
  trainer_id?: number;
  trainer_name?: string;
  branch_name?: string;
}

// Equipment Types
export interface EquipmentCategory {
  category_id: number;
  category_name: string;
  equipment_count?: number;
}

export interface Equipment {
  equipment_id: number;
  branch_id: number;
  category_id: number;
  model_number: string;
  purchase_date: string;
  status: 'active' | 'maintenance' | 'retired';
  total_maintenance_cost?: string;
  last_service_date?: string;
  days_since_service?: number;
  is_overdue?: boolean;
  exceeds_cost?: boolean;
}

export interface MaintenanceLog {
  log_id: number;
  service_date: string;
  description: string;
  cost: string;
  cumulative_cost?: string;
}

// Attendance Types
export interface AttendanceRecord {
  attendance_id: number;
  check_in: string;
  check_out?: string;
  status: 'checked_in' | 'checked_out';
  member_id?: number;
  member_name?: string;
  duration_minutes?: number;
}

// Staff Types
export interface Staff {
  staff_id: number;
  branch_id: number;
  role_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface StaffRole {
  role_id: number;
  role_name: string;
  hourly_rate: number;
  staff_count?: number;
}

// Branch Types
export interface Branch {
  branch_id: number;
  branch_name: string;
  location: string;
  phone?: string;
}

// Analytics Types
export interface AnalyticsOverview {
  total_members: number;
  active_subscriptions: number;
  today_checkins: number;
  monthly_revenue: number;
  classes_this_week: number;
  equipment_under_maintenance: number;
  subscriptions_expiring_soon?: number;
  branches: Array<{
    branch_id: number;
    name: string;
    active_subscriptions: number;
    today_checkins: number;
  }>;
}

export interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsOverview;
}

// API Response Wrapper Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Form Types for Create/Update
export interface CreateMemberRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
}

export interface UpdateMemberRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface CreateSubscriptionRequest {
  type_id: number;
  start_date?: string;
}

export interface RecordPaymentRequest {
  member_id: number;
  amount: number;
  method: 'cash' | 'card' | 'bank_transfer' | 'mobile_money';
  payment_date?: string;
}

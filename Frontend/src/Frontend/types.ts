// Data Types for Gym Management System - Based on Backend Development Plan

// ==================== AUTHENTICATION ====================
export interface User {
  id: number;
  email: string;
  role: 'admin' | 'manager' | 'staff' | 'member';
}

export interface AuthResponse {
  success: boolean;
  data?: { token: string; user: User };
  message?: string;
  errors?: string[];
}

export interface JWTPayload {
  id: number;
  email: string;
  role: string;
}

// ==================== CORE ENTITIES ====================
export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface StaffRole {
  id: number;
  name: string; // Must include "trainer" if trainers
  permissions?: string[];
}

export interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  email: string; // UNIQUE
  phone?: string;
  roleId: number;
  branchId: number;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
}

// ==================== MEMBERSHIP MANAGEMENT ====================
export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  joinDate: string; // DEFAULT CURRENT_DATE
  branchId: number;
}

export interface MembershipType {
  id: number;
  name: string;
  duration: number; // in days
  price: number; // NUMERIC(10,2)
  description?: string;
}

export interface Subscription {
  id: number;
  memberId: number;
  membershipTypeId: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled'; // CHECK constraint
}

// ==================== PAYMENTS & BILLING ====================
export interface Payment {
  id: number;
  memberId: number;
  subscriptionId: number;
  amount: number; // NUMERIC(10,2)
  paymentDate: string; // TIMESTAMP
  method: 'cash' | 'card' | 'check' | 'bank_transfer';
  status: 'completed' | 'pending' | 'failed'; // CHECK constraint
}

export interface RevenueBreakdown {
  byMethod: Record<string, number>;
  byBranch: Record<string, number>;
  total: number;
}

// ==================== CLASSES & BOOKINGS ====================
export interface Class {
  id: number;
  name: string;
  description?: string;
  instructorId: number;
  capacity: number;
  duration: number; // in minutes
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ClassSchedule {
  id: number;
  classId: number;
  dayOfWeek: number; // 0-6 (Monday-Sunday)
  startTime: string; // HH:MM format
  endTime: string;
  instructorId: number;
  branchId: number;
  date?: string; // for specific instances
}

export interface ClassBooking {
  id: number;
  scheduleId: number;
  memberId: number;
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'attended';
}

export interface ClassCapacity {
  classId: number;
  total: number;
  booked: number;
  available: number;
  status: 'green' | 'amber' | 'red'; // Green: >50%, Amber: 25-50%, Red: <25%
}

// ==================== PERSONAL TRAINING ====================
export interface PersonalTrainingSession {
  id: number;
  memberId: number;
  trainerId: number; // Must have role name containing "trainer"
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled'; // CHECK constraint
}

// ==================== EQUIPMENT & MAINTENANCE ====================
export interface EquipmentCategory {
  id: number;
  name: string;
  description?: string;
}

export interface Equipment {
  id: number;
  name: string;
  categoryId: number;
  branchId: number;
  serialNumber: string;
  purchaseDate: string;
  lastMaintenanceDate: string;
  lifetimeMaintenanceCost: number; // Calculated
  isOverdue?: boolean; // lastMaintenanceDate > 90 days ago
  status: 'active' | 'maintenance' | 'retired'; // CHECK constraint
}

export interface MaintenanceLog {
  id: number;
  equipmentId: number;
  maintenanceDate: string;
  completionDate?: string;
  description: string;
  cost: number; // NUMERIC(10,2)
  notes?: string;
}

// ==================== ATTENDANCE & ACCESS CONTROL ====================
export interface AttendanceLog {
  id: number;
  memberId: number;
  checkInTime: string; // TIMESTAMP
  checkOutTime?: string; // TIMESTAMP
  date: string;
}

export interface AttendanceCheckIn {
  memberId: number;
  subscriptionStatus: 'active' | 'expired';
  subscriptionEndDate: string;
  canCheckIn: boolean;
  reason?: string;
}

// ==================== ANALYTICS & REPORTING ====================
export interface AttendanceHeatmap {
  // 7 (days) x 24 (hours) grid
  data: number[][]; // [day][hour] = average check-ins
  peak: { day: number; hour: number; count: number };
  total: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  method: string;
  branch: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalMembers: number;
  equipmentHealth: number;
  activeClasses: number;
  peakClassTime: string;
  equipmentDowntime: number;
  memberChurnRate: number;
}

// ==================== API RESPONSE STRUCTURE ====================
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field?: string; message: string }>;
}

// ==================== DEPRECATED (Kept for reference)
// These have been replaced with more accurate types above
export type OldMembershipPlan = MembershipType;
export type OldEquipmentStatus = Equipment;
export type OldPaymentHistory = Payment;

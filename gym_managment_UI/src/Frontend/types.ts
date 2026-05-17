// Data Types for Gym Management System

export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  roleId: number;
  branchId: number;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
}

export interface StaffRole {
  id: number;
  name: string;
  description: string;
  permissions: string[];
}

export interface Equipment {
  id: number;
  name: string;
  categoryId: number;
  branchId: number;
  serialNumber: string;
  purchaseDate: string;
  status: 'active' | 'maintenance' | 'retired';
  lastMaintenanceDate: string;
}

export interface EquipmentCategory {
  id: number;
  name: string;
  description: string;
}

export interface MaintenanceLog {
  id: number;
  equipmentId: number;
  equipmentName: string;
  maintenanceDate: string;
  completionDate?: string;
  description: string;
  cost: number;
  status: 'pending' | 'completed' | 'in_progress';
}

export interface ClassMaster {
  id: number;
  name: string;
  description: string;
  instructorId: number;
  maxCapacity: number;
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export interface DailySchedule {
  id: number;
  classId: number;
  className: string;
  date: string;
  startTime: string;
  endTime: string;
  instructorId: number;
  instructorName: string;
  branchId: number;
}

export interface ClassBooking {
  id: number;
  classId: number;
  memberId: number;
  bookingDate: string;
  status: 'confirmed' | 'cancelled' | 'attended';
}

export interface PersonalTrainingSession {
  id: number;
  memberId: number;
  trainerId: number;
  sessionDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  branchId: number;
}

export interface MembershipPlan {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
  features: string[];
}

export interface Subscription {
  id: number;
  memberId: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface PaymentHistory {
  id: number;
  memberId: number;
  subscriptionId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'card' | 'check' | 'bank_transfer';
  status: 'completed' | 'pending' | 'failed';
}

export interface AttendanceLog {
  id: number;
  memberId: number;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
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

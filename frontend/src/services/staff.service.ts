import api from './api'
import type { Staff, StaffRole, PayrollSummary } from '@/types'

// ── Shapes ────────────────────────────────────────────────

export interface GetStaffParams {
  branch_id?: number
  role_id?: number
  search?: string
}

export interface CreateStaffPayload {
  first_name: string
  last_name: string
  email: string
  password: string
  role_id: number
  branch_id: number
}

export interface UpdateStaffPayload {
  first_name?: string
  last_name?: string
  email?: string
  role_id?: number
  branch_id?: number
}

export interface CreateRolePayload {
  role_name: string
  hourly_rate: number
}

export interface UpdateRolePayload {
  role_name?: string
  hourly_rate?: number
}

export interface GetPayrollParams {
  start_date: string  // ISO date
  end_date: string    // ISO date
}

// ── Staff ─────────────────────────────────────────────────

/**
 * GET /api/staff
 * Returns all staff members with optional branch and role filters.
 * Accessible by enterprise_admin only.
 */
export async function getStaff(params?: GetStaffParams): Promise<Staff[]> {
  const res = await api.get<{ data: any }>('/staff', { params })
  const raw = res.data.data || {}
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.staff)) return raw.staff
  return []
}

/**
 * GET /api/staff/:id
 * Returns a single staff member's full profile.
 * Accessible by enterprise_admin only.
 */
export async function getStaffMember(id: number): Promise<Staff> {
  const res = await api.get<{ data: any }>(`/staff/${id}`)
  return res.data.data?.staff ?? res.data.data
}

/**
 * POST /api/staff
 * Creates a new staff record and account.
 * Accessible by enterprise_admin only.
 */
export async function createStaff(
  payload: CreateStaffPayload,
): Promise<Staff> {
  const res = await api.post<{ data: Staff }>('/staff', payload)
  return res.data.data
}

/**
 * PUT /api/staff/:id
 * Updates a staff member's profile fields.
 * Accessible by enterprise_admin only.
 */
export async function updateStaff(
  id: number,
  payload: UpdateStaffPayload,
): Promise<Staff> {
  const res = await api.put<{ data: Staff }>(`/staff/${id}`, payload)
  return res.data.data
}

// ── Roles ─────────────────────────────────────────────────

/**
 * GET /api/staff/roles
 * Returns all staff roles with their hourly rates.
 * Accessible by enterprise_admin only.
 */
export async function getRoles(): Promise<StaffRole[]> {
  const res = await api.get<{ data: any }>('/staff/roles')
  const raw = res.data.data || {}
  const roles = Array.isArray(raw) ? raw : Array.isArray(raw.roles) ? raw.roles : []

  return roles.map((role: any) => ({
    id:          role.id ?? role.role_id,
    role_name:   role.role_name,
    hourly_rate: role.hourly_rate,
  }))
}

/**
 * POST /api/staff/roles
 * Creates a new staff role.
 * Accessible by enterprise_admin only.
 */
export async function createRole(
  payload: CreateRolePayload,
): Promise<StaffRole> {
  const res = await api.post<{ data: StaffRole }>('/staff/roles', payload)
  return res.data.data
}

/**
 * PUT /api/staff/roles/:id
 * Updates a role's name or hourly rate.
 * Accessible by enterprise_admin only.
 */
export async function updateRole(
  id: number,
  payload: UpdateRolePayload,
): Promise<StaffRole> {
  const res = await api.put<{ data: StaffRole }>(`/staff/roles/${id}`, payload)
  return res.data.data
}

// ── Payroll ───────────────────────────────────────────────

/**
 * GET /api/staff/:id/payroll
 * Returns an estimated payroll for a staff member over a
 * date range: total_hours × hourly_rate = estimated_pay.
 * Accessible by enterprise_admin only.
 */
export async function getPayroll(
  id: number,
  params: GetPayrollParams,
): Promise<PayrollSummary> {
  const res = await api.get<{ data: PayrollSummary }>(
    `/staff/${id}/payroll`,
    { params },
  )
  return res.data.data
}
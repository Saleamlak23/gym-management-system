import api from './api'
import type { GymClass, ClassSchedule, ClassBooking } from '@/types'

// ── Shapes ────────────────────────────────────────────────

export interface GetSchedulesParams {
  branch_id?: number
  date?: string       // ISO date string — filters to a specific day
  week?: string       // ISO date string — filters to the week containing this date
}

export interface CreateClassPayload {
  name: string
  description?: string
  capacity: number
  duration_minutes: number
}

export interface CreateSchedulePayload {
  class_id: number
  branch_id: number
  instructor_id?: number
  start_time: string  // ISO datetime
  end_time: string    // ISO datetime
}

export interface CreateBookingPayload {
  schedule_id: number
  member_id: number
}

// ── Class templates ───────────────────────────────────────

/**
 * GET /api/classes
 * Returns all class templates (Yoga, HIIT, Spinning…).
 * Public — no auth required.
 */
export async function getClasses(): Promise<GymClass[]> {
  const res = await api.get<{ data: any }>('/classes')
  const raw = res.data.data || {}
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.classes)) return raw.classes
  return []
}

/**
 * POST /api/classes
 * Creates a new class template.
 * Accessible by enterprise_admin only.
 */
export async function createClass(
  payload: CreateClassPayload,
): Promise<GymClass> {
  const res = await api.post<{ data: GymClass }>('/classes', payload)
  return res.data.data
}

// ── Schedules ─────────────────────────────────────────────

/**
 * GET /api/classes/schedules
 * Returns upcoming scheduled sessions.
 * Optionally filtered by branch_id and/or date.
 * Public — no auth required.
 */
export async function getSchedules(
  params?: GetSchedulesParams,
): Promise<ClassSchedule[]> {
  const res = await api.get<{ data: { schedules: ClassSchedule[] } }>(
    '/classes/schedules',
    { params },
  )
  const raw = res.data.data || {}
  if (Array.isArray(raw.schedules)) return raw.schedules
  if (Array.isArray(raw)) return raw
  return []
}

/**
 * POST /api/classes/schedules
 * Creates a new scheduled session.
 * Accessible by enterprise_admin only.
 */
export async function createSchedule(
  payload: CreateSchedulePayload,
): Promise<ClassSchedule> {
  const res = await api.post<{ data: ClassSchedule }>('/classes/schedules', payload)
  return res.data.data
}

/**
 * DELETE /api/classes/schedules/:id
 * Cancels a scheduled session.
 * Accessible by enterprise_admin only.
 */
export async function deleteSchedule(id: number): Promise<void> {
  await api.delete(`/classes/schedules/${id}`)
}

/**
 * GET /api/classes/schedules/:id/bookings
 * Returns all bookings for a specific session.
 * Accessible by staff and enterprise_admin.
 */
export async function getScheduleBookings(
  scheduleId: number,
): Promise<ClassBooking[]> {
  const res = await api.get<{ data: any }>(`/classes/schedules/${scheduleId}/bookings`)
  const raw = res.data.data || {}
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.bookings)) return raw.bookings
  return []
}

// ── Bookings ──────────────────────────────────────────────

/**
 * POST /api/classes/bookings
 * Books a class session for a member.
 * Returns 409 if the session has reached capacity.
 * Accessible by members only.
 */
export async function createBooking(
  payload: CreateBookingPayload,
): Promise<ClassBooking> {
  const res = await api.post<{ data: any }>('/classes/bookings', payload)
  return res.data.data?.booking ?? res.data.data
}

/**
 * DELETE /api/classes/bookings/:id
 * Cancels an existing booking.
 * Accessible by the booking owner (member) only.
 */
export async function cancelBooking(id: number): Promise<void> {
  await api.delete(`/classes/bookings/${id}`)
}
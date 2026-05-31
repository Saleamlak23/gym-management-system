import api from './api'
import type { AttendanceRecord, HeatmapCell } from '@/types'

// ── Shapes ────────────────────────────────────────────────

export interface CheckInPayload {
  member_id: number
  branch_id: number
}

export interface CheckOutPayload {
  member_id: number
  branch_id: number
}

export interface GetAttendanceParams {
  branch_id?: number
  date?: string       // ISO date — defaults to today
  member_id?: number
}

// ── Calls ─────────────────────────────────────────────────

/**
 * POST /api/attendance/checkin
 * Records a member check-in at a branch.
 * Returns 403 if the member has no active subscription.
 * Accessible by staff and above.
 */
export async function checkIn(
  payload: CheckInPayload,
): Promise<AttendanceRecord> {
  const res = await api.post<{ data: AttendanceRecord }>(
    '/attendance/checkin',
    payload,
  )
  return res.data.data
}

/**
 * POST /api/attendance/checkout
 * Records a member check-out at a branch.
 * Accessible by staff and above.
 */
export async function checkOut(
  payload: CheckOutPayload,
): Promise<AttendanceRecord> {
  const res = await api.post<{ data: AttendanceRecord }>(
    '/attendance/checkout',
    payload,
  )
  return res.data.data
}

/**
 * GET /api/attendance
 * Returns attendance records across all branches
 * with optional filters.
 * Accessible by enterprise_admin only.
 */
export async function getAttendance(
  params?: GetAttendanceParams,
): Promise<AttendanceRecord[]> {
  const res = await api.get<{ data: any }>('/attendance', { params })
  const raw = res.data.data || {}
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.attendance)) return raw.attendance
  return []
}

/**
 * GET /api/attendance/member/:id
 * Returns the attendance history for one member.
 * Accessible by the member themselves and staff.
 */
export async function getMemberAttendance(
  memberId: number,
): Promise<AttendanceRecord[]> {
  const res = await api.get<{ data: any }>(`/attendance/member/${memberId}`)
  const raw = res.data.data || {}
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.attendance)) return raw.attendance
  return []
}

/**
 * GET /api/attendance/branch/:id
 * Returns today's attendance log for a specific branch.
 * Accessible by staff and above.
 */
export async function getBranchAttendance(
  branchId: number,
): Promise<AttendanceRecord[]> {
  const res = await api.get<{ data: any }>(`/attendance/branch/${branchId}`)
  const raw = res.data.data || {}
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.attendance)) return raw.attendance
  return []
}

/**
 * GET /api/attendance/heatmap/:branchId
 * Returns average check-ins grouped by day-of-week and hour.
 * Used to render the 7×24 peak hours heatmap.
 * Accessible by staff and above.
 */
export async function getAttendanceHeatmap(
  branchId: number,
): Promise<HeatmapCell[]> {
  const res = await api.get<{ data: any }>(`/attendance/heatmap/${branchId}`)
  const raw = res.data.data || {}
  // Backend returns a 7×24 grid under `grid` where each day has `hours` entries.
  if (Array.isArray(raw.grid)) {
    const flat: HeatmapCell[] = []
    raw.grid.forEach((day: any, di: number) => {
      const dayIdx = (day.day_of_week ?? di) // backend may use 0..6
      const hours = Array.isArray(day.hours) ? day.hours : []
      hours.forEach((h: any) => {
        flat.push({
          day_of_week: (dayIdx ?? di) + 1, // convert 0-based to 1-based
          hour: h.hour_of_day ?? h.hour ?? 0,
          avg_count: h.avg_per_week ?? h.avg_count ?? h.total_checkins ?? 0,
        })
      })
    })
    return flat
  }
  // Or backend may return a flat array
  if (Array.isArray(raw)) return raw
  return []
}
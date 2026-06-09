import api from './api'
import type { Equipment, EquipmentStatus, MaintenanceLog } from '@/types'

// ── Shapes ────────────────────────────────────────────────

export interface GetEquipmentParams {
  branch_id?: number
  category_id?: number
  status?: EquipmentStatus
}

export interface CreateEquipmentPayload {
  model_number: string
  name: string
  category_id: number
  branch_id: number
  purchase_date: string  // ISO date
}

export interface UpdateStatusPayload {
  status: EquipmentStatus
}

export interface LogMaintenancePayload {
  service_date: string   // ISO date
  description: string
  cost: number
}

// ── Calls ─────────────────────────────────────────────────

/**
 * GET /api/equipment
 * Returns all equipment with optional branch, category,
 * and status filters.
 * Accessible by staff and above.
 */
export async function getEquipment(
  params?: GetEquipmentParams,
): Promise<Equipment[]> {
  const res = await api.get<{ data: any }>('/equipment', { params })
  const raw = res.data.data || {}
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.equipment)) return raw.equipment
  return []
}

/**
 * POST /api/equipment
 * Adds a new equipment record to a branch.
 * Accessible by enterprise_admin only.
 */
export async function addEquipment(
  payload: CreateEquipmentPayload,
): Promise<Equipment> {
  const res = await api.post<{ data: any }>('/equipment', payload)
  return res.data.data?.equipment ?? res.data.data
}

/**
 * PATCH /api/equipment/:id/status
 * Updates the operational status of a piece of equipment.
 * Accessible by staff and above.
 */
export async function updateEquipmentStatus(
  id: number,
  payload: UpdateStatusPayload,
): Promise<Equipment> {
  const res = await api.patch<{ data: any }>(`/equipment/${id}/status`, payload)
  return res.data.data?.equipment ?? res.data.data
}

/**
 * GET /api/equipment/:id/maintenance
 * Returns the full maintenance history for one equipment item.
 * Accessible by staff and above.
 */
export async function getMaintenanceHistory(
  equipmentId: number,
): Promise<MaintenanceLog[]> {
  const res = await api.get<{ data: any }>(`/equipment/${equipmentId}/maintenance`)
  const raw = res.data.data || {}
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.maintenance_logs)) return raw.maintenance_logs
  return []
}

/**
 * POST /api/equipment/:id/maintenance
 * Logs a new maintenance event.
 * Also resets the equipment status to 'active' on the backend
 * if it was previously 'maintenance'.
 * Accessible by staff and above.
 */
export async function logMaintenance(
  equipmentId: number,
  payload: LogMaintenancePayload,
): Promise<MaintenanceLog> {
  const res = await api.post<{ data: any }>(`/equipment/${equipmentId}/maintenance`, payload)
  return res.data.data?.maintenance_log ?? res.data.data
}

/**
 * GET /api/equipment/overdue
 * Returns equipment whose last service date was more than
 * 90 days ago, or whose cumulative maintenance cost exceeds
 * the configured threshold.
 * Accessible by enterprise_admin only.
 */
export async function getOverdueEquipment(): Promise<Equipment[]> {
  const res = await api.get<{ data: any }>('/equipment/overdue')
  const raw = res.data.data || {}
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.overdue_equipment)) return raw.overdue_equipment
  return []
}
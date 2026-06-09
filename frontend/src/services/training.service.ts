import api from './api'
import type { TrainingSession, TrainingStatus } from '@/types'

// ── Shapes ────────────────────────────────────────────────

export interface GetTrainingParams {
  status?: TrainingStatus
  branch_id?: number
  from?: string   // ISO date
  to?: string     // ISO date
}

export interface CreateSessionPayload {
  member_id: number
  trainer_id: number
  scheduled_at: string  // ISO datetime — must be at least 1 hour ahead
  duration_minutes: number
  notes?: string
}

export interface UpdateStatusPayload {
  status: TrainingStatus
}

// ── Calls ─────────────────────────────────────────────────

/**
 * GET /api/training
 * Returns all personal training sessions with optional filters.
 * Accessible by staff and enterprise_admin.
 */
export async function getTrainingSessions(
  params?: GetTrainingParams,
): Promise<TrainingSession[]> {
  const res = await api.get<{ data: any }>('/training', { params })
  const raw = res.data.data || {}
  // Some endpoints return { sessions, pagination }
  if (Array.isArray(raw.sessions)) return raw.sessions
  if (Array.isArray(raw)) return raw as TrainingSession[]
  return []
}

/**
 * GET /api/training/trainer/:id
 * Returns all sessions assigned to a specific trainer.
 * Accessible by the trainer themselves and enterprise_admin.
 */
export async function getTrainerSessions(
  trainerId: number,
): Promise<TrainingSession[]> {
  const res = await api.get<{ data: any }>(`/training/trainer/${trainerId}`)
  const raw = res.data.data || {}
  // Backend returns { trainer, upcoming, past }
  const upcoming = Array.isArray(raw.upcoming) ? raw.upcoming : []
  const past = Array.isArray(raw.past) ? raw.past : []
  // Combine upcoming then past, newest first
  return [...upcoming, ...past]
}

/**
 * GET /api/training/member/:id
 * Returns all sessions booked by a specific member.
 * Accessible by the member themselves and staff.
 */
export async function getMemberSessions(
  memberId: number,
): Promise<TrainingSession[]> {
  const res = await api.get<{ data: { sessions: TrainingSession[] } }>(
    `/training/member/${memberId}`,
  )
  return res.data.data.sessions
}

/**
 * POST /api/training
 * Books a new personal training session.
 * Returns 409 if the trainer already has a session within ±1 hour.
 * Accessible by members and staff.
 */
export async function createSession(
  payload: CreateSessionPayload,
): Promise<TrainingSession> {
  const res = await api.post<{ data: any }>('/training', payload)
  return res.data.data?.session ?? res.data.data
}

/**
 * PATCH /api/training/:id/status
 * Moves a session through its workflow:
 * scheduled → confirmed → completed
 * Any status → cancelled
 * Accessible by trainer and enterprise_admin.
 */
export async function updateSessionStatus(
  id: number,
  payload: UpdateStatusPayload,
): Promise<TrainingSession> {
  const res = await api.patch<{ data: any }>(`/training/${id}/status`, payload)
  return res.data.data?.session ?? res.data.data
}

/**
 * DELETE /api/training/:id
 * Cancels a personal training session.
 * Accessible by the booking member and enterprise_admin.
 */
export async function cancelSession(id: number): Promise<void> {
  await api.delete(`/training/${id}`)
}
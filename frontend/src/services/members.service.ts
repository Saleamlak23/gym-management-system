import api from './api'
import type { Member, Subscription, SubscriptionStatus } from '@/types'

// ── Shapes ────────────────────────────────────────────────

export interface GetMembersParams {
  search?: string
  status?: SubscriptionStatus
  page?: number
}

export interface UpdateMemberPayload {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

export interface CreateSubscriptionPayload {
  membership_type_id: number
  start_date: string
}

export interface UpdateSubscriptionPayload {
  status: SubscriptionStatus
}

// ── Members ───────────────────────────────────────────────

/**
 * GET /api/members
 * Returns a paginated, filterable list of all members.
 * Accessible by branch_manager and enterprise_admin.
 */
export async function getMembers(params?: GetMembersParams): Promise<Member[]> {
  const res = await api.get<{ data: any }>('/members', { params })
  const raw = res.data.data || {}
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw.members)) return raw.members
  return []
}

/**
 * GET /api/members/:id
 * Returns a single member's full profile.
 * Accessible by staff and enterprise_admin.
 */
export async function getMember(id: number): Promise<Member> {
  const res = await api.get<{ data: any }>(`/members/${id}`)
  return res.data.data?.member ?? res.data.data
}

/**
 * PUT /api/members/:id
 * Updates editable profile fields.
 * Accessible by enterprise_admin only.
 */
export async function updateMember(
  id: number,
  payload: UpdateMemberPayload,
): Promise<Member> {
  const res = await api.put<{ data: Member }>(`/members/${id}`, payload)
  return res.data.data
}

/**
 * DELETE /api/members/:id
 * Soft-deletes a member (sets status to inactive).
 * Accessible by enterprise_admin only.
 */
export async function deleteMember(id: number): Promise<void> {
  await api.delete(`/members/${id}`)
}

// ── Subscriptions ─────────────────────────────────────────

/**
 * GET /api/members/:id/subscriptions
 * Returns the full subscription history for one member.
 * Accessible by staff and enterprise_admin.
 */
export async function getMemberSubscriptions(
  memberId: number,
): Promise<Subscription[]> {
  const res = await api.get<{ data: { subscriptions: Subscription[] } }>(
    `/members/${memberId}/subscriptions`,
  )
  return res.data.data.subscriptions
}

/**
 * POST /api/members/:id/subscriptions
 * Creates a new subscription for a member.
 * Returns 409 if the member already has an active subscription.
 * Accessible by staff and enterprise_admin.
 */
export async function createSubscription(
  memberId: number,
  payload: CreateSubscriptionPayload,
): Promise<Subscription> {
  const res = await api.post<{ data: Subscription }>(
    `/members/${memberId}/subscriptions`,
    payload,
  )
  return res.data.data
}

/**
 * PATCH /api/members/:memberId/subscriptions/:subId
 * Updates subscription status (freeze, cancel, reactivate).
 * Accessible by enterprise_admin only.
 */
export async function updateSubscription(
  memberId: number,
  subId: number,
  payload: UpdateSubscriptionPayload,
): Promise<Subscription> {
  const res = await api.patch<{ data: Subscription }>(
    `/members/${memberId}/subscriptions/${subId}`,
    payload,
  )
  return res.data.data
}
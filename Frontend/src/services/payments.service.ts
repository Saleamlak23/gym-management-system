import api from './api'
import type { Payment, PaymentMethod, PaymentSummary } from '@/types'
function normalizePayment(payment: Payment): Payment {
  return {
    ...payment,
    created_at: payment.created_at ?? payment.payment_date,
  }
}
// ── Shapes ────────────────────────────────────────────────

export interface GetPaymentsParams {
  start_date?: string
  end_date?: string
  method?: PaymentMethod
  search?: string
}

export interface CreatePaymentPayload {
  member_id: number
  amount: number
  method: PaymentMethod
  note?: string
}

export interface GetSummaryParams {
  start_date?: string
  end_date?: string
  branch_id?: number
}

// ── Calls ─────────────────────────────────────────────────

/**
 * GET /api/payments
 * Returns all payments with optional date range, method,
 * and member name filters.
 * Accessible by enterprise_admin only.
 */
export async function getPayments(params?: GetPaymentsParams): Promise<Payment[]> {
  const res = await api.get<{ data: { payments: Payment[] } }>('/payments', { params })
  return res.data.data.payments.map(normalizePayment)
}

/**
 * POST /api/payments
 * Records a new payment for a member.
 * Accessible by staff and enterprise_admin.
 */
export async function createPayment(
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const res = await api.post<{ data: { payment: Payment } }>('/payments', payload)
  return normalizePayment(res.data.data.payment)
}

/**
 * GET /api/payments/member/:id
 * Returns all payments made by a specific member.
 * Accessible by staff and enterprise_admin.
 */
export async function getMemberPayments(memberId: number): Promise<Payment[]> {
  const res = await api.get<{ data: { payments: Payment[] } }>(`/payments/member/${memberId}`)
  return res.data.data.payments.map(normalizePayment)
}

/**
 * GET /api/payments/summary
 * Returns aggregated revenue totals grouped by method,
 * branch, and month — ready for chart rendering.
 * Accessible by enterprise_admin only.
 */
export async function getPaymentSummary(
  params?: GetSummaryParams,
): Promise<PaymentSummary> {
  const res = await api.get<{ data: PaymentSummary }>('/payments/summary', {
    params,
  })
  return res.data.data
}
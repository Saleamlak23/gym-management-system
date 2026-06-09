/* ============================================================
   GymOS — Formatters
   Pure functions, no side effects, fully typed
   ============================================================ */

// ── Date & Time ───────────────────────────────────────────

/**
 * "Jan 15, 2025"
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * "Jan 15, 09:30 AM"
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * "09:30 AM"
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Returns the number of whole days between now and a future date.
 * Negative if the date is in the past.
 */
export function daysUntil(date: string | Date): number {
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * "2 hours ago" / "in 3 days"
 */
export function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const abs  = Math.abs(diff)
  const past = diff > 0

  const units: [number, string][] = [
    [60_000,        'minute'],
    [3_600_000,     'hour'],
    [86_400_000,    'day'],
    [2_592_000_000, 'month'],
  ]

  for (const [ms, label] of units.slice().reverse()) {
    if (abs >= ms) {
      const n = Math.floor(abs / ms)
      const str = `${n} ${label}${n > 1 ? 's' : ''}`
      return past ? `${str} ago` : `in ${str}`
    }
  }

  return 'just now'
}

// ── Currency ──────────────────────────────────────────────

/**
 * "$1,234.50"
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// ── Strings ───────────────────────────────────────────────

/**
 * "branch_manager" → "Branch Manager"
 */
export function titleCase(str: string): string {
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * "John Doe" → "JD"
 */
export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// ── Duration ──────────────────────────────────────────────

/**
 * 90  → "1h 30m"
 * 60  → "1h"
 * 45  → "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

// ── Numbers ───────────────────────────────────────────────

/**
 * Clamps a value between min and max (inclusive).
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * 0.734 → "73%"
 */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}
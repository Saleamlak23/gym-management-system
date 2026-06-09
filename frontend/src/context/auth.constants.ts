import type { UserRole } from '@/types'

export const HOME_BY_ROLE: Record<UserRole, string> = {
  enterprise_admin: '/admin',
  branch_manager:   '/branch',
  staff:            '/staff',
  trainer:          '/staff',
  member:           '/member',
}

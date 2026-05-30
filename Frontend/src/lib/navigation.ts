import { UserRole } from '@/types';

export const getDefaultPathForRole = (role?: UserRole | null) => {
  switch (role) {
    case 'enterprise_admin':
    case 'branch_manager':
      return '/admin';
    case 'trainer':
    case 'staff':
    case 'member':
      return '/admin/classes';
    default:
      return '/login';
  }
};

export const getSubscriptionStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    frozen: 'bg-blue-100 text-blue-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getSubscriptionStatusBadgeClass = (status: string): string => {
  const classMap: Record<string, string> = {
    active: 'bg-green-500',
    expired: 'bg-gray-500',
    cancelled: 'bg-red-500',
    frozen: 'bg-blue-500',
  };
  return classMap[status] || 'bg-gray-500';
};

export const getEquipmentStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    retired: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getTrainingStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const getPaymentMethodLabel = (method: string): string => {
  const labels: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    bank_transfer: 'Bank Transfer',
    mobile_money: 'Mobile Money',
  };
  return labels[method] || method;
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    enterprise_admin: 'Enterprise Admin',
    branch_manager: 'Branch Manager',
    staff: 'Staff',
    trainer: 'Trainer',
    member: 'Member',
  };
  return labels[role] || role;
};

export const getRoleIcon = (role: string): string => {
  const icons: Record<string, string> = {
    enterprise_admin: 'crown',
    branch_manager: 'building2',
    staff: 'users',
    trainer: 'user-check',
    member: 'user',
  };
  return icons[role] || 'user';
};

export const getClassCapacityColor = (spotsRemaining: number, capacity: number): string => {
  const percentage = (spotsRemaining / capacity) * 100;
  if (percentage > 33) return 'bg-green-100 text-green-800'; // > 33% space
  if (percentage > 0) return 'bg-yellow-100 text-yellow-800'; // 1-33% space
  return 'bg-red-100 text-red-800'; // Full
};

export const getClassCapacityLabel = (spotsRemaining: number): string => {
  if (spotsRemaining > 5) return 'Plenty of space';
  if (spotsRemaining > 0) return 'Filling up';
  return 'Full';
};

export const getAttendanceStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    checked_in: 'bg-green-100 text-green-800',
    checked_out: 'bg-gray-100 text-gray-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

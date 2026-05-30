import { format, formatDistance } from 'date-fns';

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), 'MMM dd, yyyy');
};

export const formatTime = (time: string | Date): string => {
  return format(new Date(time), 'HH:mm');
};

export const formatDateTime = (datetime: string | Date): string => {
  return format(new Date(datetime), 'MMM dd, yyyy HH:mm');
};

export const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `Br ${num.toFixed(2)}`;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

export const formatPhoneNumber = (phone: string): string => {
  // Basic formatting - adjust based on actual phone format requirements
  return phone || 'N/A';
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const formatSubscriptionStatus = (
  status: string
): 'active' | 'expired' | 'cancelled' | 'frozen' => {
  return (status || 'expired') as 'active' | 'expired' | 'cancelled' | 'frozen';
};

export const getMonthYear = (date: string | Date): string => {
  return format(new Date(date), 'MMMM yyyy');
};

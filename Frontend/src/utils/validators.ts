export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // Min 8 chars, at least 1 uppercase, at least 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const isValidPhone = (phone: string): boolean => {
  // Basic phone validation - adjust as needed
  const phoneRegex = /^(\+251|0)[0-9]{9}$/;
  return phoneRegex.test(phone);
};

export interface MemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  phone?: string;
}

export const validateMemberForm = (data: MemberFormData): string[] => {
  const errors: string[] = [];

  if (!data.first_name?.trim()) errors.push('First name is required');
  if (!data.last_name?.trim()) errors.push('Last name is required');
  if (!data.email?.trim()) errors.push('Email is required');
  else if (!isValidEmail(data.email)) errors.push('Email format is invalid');

  if (data.password) {
    if (!isValidPassword(data.password)) {
      errors.push('Password must be at least 8 characters with 1 uppercase and 1 number');
    }
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Phone number format is invalid');
  }

  return errors;
};

export interface PaymentFormData {
  member_id: number;
  amount: number;
  method: string;
  payment_date?: string;
}

export const validatePaymentForm = (data: PaymentFormData): string[] => {
  const errors: string[] = [];

  if (!data.member_id) errors.push('Member is required');
  if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
  if (!data.method) errors.push('Payment method is required');
  if (!['cash', 'card', 'bank_transfer', 'mobile_money'].includes(data.method)) {
    errors.push('Invalid payment method');
  }

  return errors;
};

export const validateTrainingSessionForm = (data: {
  trainer_id: number;
  scheduled_at: string;
  duration_min?: number;
}): string[] => {
  const errors: string[] = [];

  if (!data.trainer_id) errors.push('Trainer is required');
  if (!data.scheduled_at) errors.push('Date and time are required');
  if (data.duration_min && (data.duration_min < 30 || data.duration_min > 180)) {
    errors.push('Duration must be between 30 and 180 minutes');
  }

  return errors;
};

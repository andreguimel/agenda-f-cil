// Phone mask for Brazilian format: (XX) XXXXX-XXXX
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

// Validate Brazilian phone number
export const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  // Brazilian phone: 10-11 digits (2 DDD + 8-9 digits)
  return digits.length >= 10 && digits.length <= 11;
};

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format email (lowercase and trim)
export const formatEmail = (value: string): string => {
  return value.toLowerCase().trim();
};

// Form Validators

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validators = {
  email: (value: string): boolean => {
    return emailRegex.test(value);
  },

  password: (value: string): boolean => {
    return value.length >= 8;
  },

  strongPassword: (value: string): boolean => {
    return passwordRegex.test(value);
  },

  name: (value: string): boolean => {
    return value.length >= 2 && value.length <= 100;
  },

  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  date: (value: string): boolean => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  },

  notEmpty: (value: string): boolean => {
    return value.trim().length > 0;
  },

  minLength: (value: string, length: number): boolean => {
    return value.length >= length;
  },

  maxLength: (value: string, length: number): boolean => {
    return value.length <= length;
  },
};

export const getErrorMessage = (field: string, error: string): string => {
  const messages: Record<string, Record<string, string>> = {
    email: {
      required: 'Email is required',
      invalid: 'Please enter a valid email address',
    },
    password: {
      required: 'Password is required',
      weak: 'Password must be at least 8 characters',
      strong: 'Password must contain uppercase, lowercase, number, and special character',
    },
    name: {
      required: 'Name is required',
      invalid: 'Name must be between 2 and 100 characters',
    },
    date: {
      required: 'Date is required',
      invalid: 'Please enter a valid date',
    },
  };

  return messages[field]?.[error] || 'Invalid input';
};

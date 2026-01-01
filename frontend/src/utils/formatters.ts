// Date and Time Formatters

export const formatters = {
  date: (date: string | Date, locale: string = 'en-US'): string => {
    const d = new Date(date);
    return d.toLocaleDateString(locale);
  },

  time: (date: string | Date, locale: string = 'en-US'): string => {
    const d = new Date(date);
    return d.toLocaleTimeString(locale);
  },

  dateTime: (date: string | Date, locale: string = 'en-US'): string => {
    const d = new Date(date);
    return d.toLocaleString(locale);
  },

  relativeTime: (date: string | Date): string => {
    const now = new Date();
    const d = new Date(date);
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;

    return `${Math.floor(seconds / 31536000)}y ago`;
  },

  fileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  currency: (amount: number, currency: string = 'USD', locale: string = 'en-US'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  percentage: (value: number, decimals: number = 0): string => {
    return (value * 100).toFixed(decimals) + '%';
  },

  eventDate: (date: string | Date): string => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (d.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    return formatters.date(date);
  },
};

export const getDaysUntil = (date: string | Date): number => {
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);

  const timeDiff = d.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const isEventExpired = (expiresAt: string | Date): boolean => {
  return new Date(expiresAt) < new Date();
};

export const isEventToday = (date: string | Date): boolean => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

export const isEventUpcoming = (date: string | Date): boolean => {
  const d = new Date(date);
  const today = new Date();
  return d > today;
};

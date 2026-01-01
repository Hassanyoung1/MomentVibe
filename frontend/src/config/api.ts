// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REQUEST_PASSWORD_RESET: '/auth/request-password-reset',
    RESET_PASSWORD: '/auth/reset-password',
    CONFIRM_EMAIL: '/auth/confirm-email',
  },
  // Events
  EVENTS: {
    CREATE: '/events/create',
    GET: (id: string) => `/events/${id}`,
    UPDATE: (id: string) => `/events/${id}`,
    DELETE: (id: string) => `/events/${id}`,
    HOST_EVENTS: '/events/host/events',
    DATE_RANGE: '/events/events/date-range',
    PAGINATED: '/events/events/paginated',
    FILTER: '/events/events/filter',
    QR: (id: string) => `/events/${id}/qr`,
    GUEST_QR: (id: string) => `/events/${id}/guest-qr`,
    PERMISSIONS: (id: string) => `/events/${id}/permissions`,
    EXTEND_EXPIRATION: (id: string) => `/events/${id}/extend-expiration`,
    DOWNLOAD_ALL: (id: string) => `/events/${id}/download-all`,
    DOWNLOAD_PERMISSION: (id: string) => `/events/${id}/download-permission`,
  },
  // Media
  MEDIA: {
    UPLOAD: '/media/upload',
    GUEST_UPLOAD: '/media/guest/upload',
    GET_BY_EVENT: (eventId: string) => `/media/${eventId}`,
    APPROVE: (mediaId: string) => `/media/approve/${mediaId}`,
    LIVE: (eventId: string) => `/media/live/${eventId}`,
    VISIBILITY: (mediaId: string) => `/media/${mediaId}/visibility`,
    HOST: '/media/host',
    DOWNLOAD: (mediaId: string) => `/media/download/${mediaId}`,
    FILE: (fileId: string) => `/media/file/${fileId}`,
  },
  // Guests
  GUESTS: {
    REGISTER: '/guests/register',
  },
  // Albums
  ALBUMS: {
    CREATE: (eventId: string) => `/albums/${eventId}/create`,
    GET_BY_EVENT: (eventId: string) => `/albums/${eventId}`,
    UPDATE: (albumId: string) => `/albums/${albumId}`,
    DELETE: (albumId: string) => `/albums/${albumId}`,
    MOVE_MEDIA: '/albums/move-media',
  },
  // Guestbook
  GUESTBOOK: {
    ADD_MESSAGE: (eventId: string) => `/guestbook/${eventId}/add-message`,
    GET_MESSAGES: (eventId: string) => `/guestbook/${eventId}/messages`,
    ADD_REACTION: (messageId: string) => `/guestbook/${messageId}/react`,
  },
  // Host
  HOST: {
    GET: (hostId: string) => `/host/${hostId}`,
  },
  // Archived Events
  ARCHIVED_EVENTS: {
    GET: (eventId: string) => `/archived-events/${eventId}`,
  },
};

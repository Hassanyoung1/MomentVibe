// Type definitions for API responses and models

// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'host' | 'guest' | 'admin';
  createdAt: string;
  avatar?: string;
}

// Event Types
export interface Event {
  _id: string;
  name: string;
  description: string;
  date: string;
  location?: string;
  hostId: string;
  allowDownload: boolean;
  allowShare: boolean;
  createdAt: string;
  expiresAt: string;
  guestCount: number;
  mediaCount: number;
  status: 'active' | 'expired' | 'archived';
  thumbnail?: string;
}

// Media Types
export interface Media {
  _id: string;
  eventId: string;
  fileName: string;
  fileId: string;
  fileType: 'image' | 'video';
  caption?: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  uploadedAt: string;
  visibility: 'hidden' | 'visible';
  visibilityTime?: string;
  approved: boolean;
  albumId?: string;
  downloads: number;
  size: number;
  thumbnail?: string;
}

// Album Types
export interface Album {
  _id: string;
  eventId: string;
  name: string;
  description?: string;
  type: 'behind-the-scenes' | 'main-event' | 'custom';
  createdAt: string;
  mediaCount: number;
  coverImage?: string;
}

// Guest Types
export interface Guest {
  _id: string;
  eventId: string;
  name: string;
  email: string;
  registeredAt: string;
  mediaUploaded: number;
  lastActive: string;
}

// Guestbook Types
export interface GuestbookMessage {
  _id: string;
  eventId: string;
  guestName: string;
  guestEmail?: string;
  message: string;
  createdAt: string;
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

// Reaction Types
export interface Reaction {
  _id: string;
  messageId: string;
  emoji: string;
  userId: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateEventFormData {
  name: string;
  description: string;
  date: string;
  location?: string;
  allowDownload: boolean;
  allowShare: boolean;
}

export interface UpdateEventFormData extends Partial<CreateEventFormData> {}

// Query Parameters
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filter?: Record<string, any>;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Pagination Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

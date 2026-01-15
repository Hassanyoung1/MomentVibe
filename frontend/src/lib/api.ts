import axios, { AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
})

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// Helper function to handle API errors
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred'
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}

// API endpoint helpers
export const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  requestPasswordReset: '/auth/request-password-reset',
  resetPassword: '/auth/reset-password',
  confirmEmail: '/auth/confirm-email',
  
  // Events
  createEvent: '/events/create',
  getEvents: '/events',
  getEvent: (id: string) => `/events/${id}`,
  updateEvent: (id: string) => `/events/${id}`,
  deleteEvent: (id: string) => `/events/${id}`,
  extendExpiration: (id: string) => `/events/${id}/extend`,
  generateQR: (id: string) => `/events/${id}/qr`,
  
  // Media
  uploadMedia: (eventId: string) => `/media/${eventId}/upload`,
  guestUpload: '/media/guest/upload',
  getMedia: (eventId: string) => `/media/${eventId}`,
  updateMedia: (id: string) => `/media/${id}`,
  deleteMedia: (id: string) => `/media/${id}`,
  approveMedia: (id: string) => `/media/${id}/approve`,
  scheduleVisibility: (id: string) => `/media/${id}/schedule`,
  downloadMedia: (eventId: string) => `/media/${eventId}/download`,
  
  // Albums
  createAlbum: (eventId: string) => `/albums/${eventId}`,
  getAlbums: (eventId: string) => `/albums/${eventId}`,
  updateAlbum: (id: string) => `/albums/${id}`,
  deleteAlbum: (id: string) => `/albums/${id}`,
  addMediaToAlbum: (id: string) => `/albums/${id}/media`,
  
  // Guestbook
  addGuestbookEntry: (eventId: string) => `/guestbook/${eventId}`,
  getGuestbookEntries: (eventId: string) => `/guestbook/${eventId}`,
  
  // Reactions
  addReaction: '/reactions',
  getReactions: (mediaId: string) => `/reactions/${mediaId}`,
  
  // Guest
  registerGuest: '/guest/register',
  getGuestToken: '/guest/token',
}

import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS, API_BASE_URL } from '@/config/api';
import { authService } from './authService';

interface EventData {
  name: string;
  description: string;
  date: string;
  location?: string;
  allowDownload?: boolean;
  allowSharing?: boolean;
}

interface Event extends EventData {
  _id: string;
  hostId: string;
  createdAt: string;
  expiresAt: string;
  qrCode?: string;
  qrCodeUrl?: string;
  qrCodeImage?: string;
  guestViewUrl?: string;
  guests: string[];
  media: string[];
  albums: string[];
  guestbook: string[];
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const eventService = {
  async createEvent(data: EventData): Promise<Event> {
    const response = await axiosInstance.post(API_ENDPOINTS.EVENTS.CREATE, data);
    return response.data.event;
  },

  async getEvent(id: string): Promise<Event> {
    const response = await axiosInstance.get(API_ENDPOINTS.EVENTS.GET(id));
    return response.data;
  },

  async updateEvent(id: string, data: Partial<EventData>): Promise<Event> {
    const response = await axiosInstance.put(API_ENDPOINTS.EVENTS.UPDATE(id), data);
    return response.data.event;
  },

  async deleteEvent(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.EVENTS.DELETE(id));
  },

  async getHostEvents(): Promise<Event[]> {
    const response = await axiosInstance.get(API_ENDPOINTS.EVENTS.HOST_EVENTS);
    return response.data.events || response.data;
  },

  async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await axiosInstance.get(`${API_ENDPOINTS.EVENTS.DATE_RANGE}?${params}`);
    return response.data;
  },

  async getPaginatedEvents(page: number = 1, itemsPerPage: number = 10): Promise<{ events: Event[]; total: number; pages: number }> {
    const params = new URLSearchParams({ page: String(page), itemsPerPage: String(itemsPerPage) });
    const response = await axiosInstance.get(`${API_ENDPOINTS.EVENTS.PAGINATED}?${params}`);
    return response.data;
  },

  async filterEvents(filters: { name?: string; status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const response = await axiosInstance.get(`${API_ENDPOINTS.EVENTS.FILTER}?${params}`);
    return response.data;
  },

  async generateQRCode(eventId: string): Promise<{ qrUploadUrl: string; qrImage: string }> {
    const response = await axiosInstance.get(API_ENDPOINTS.EVENTS.QR(eventId));
    return { qrUploadUrl: response.data.qrUploadUrl, qrImage: response.data.qrImage };
  },

  async generateGuestQRCode(eventId: string, guestInfo?: { name?: string; email?: string }): Promise<{ qrUploadUrl: string; qrImage: string; guestToken: string }> {
    const response = await axiosInstance.post(API_ENDPOINTS.EVENTS.GUEST_QR(eventId), guestInfo);
    return response.data;
  },

  async updatePermissions(eventId: string, allowDownload: boolean, allowShare: boolean): Promise<Event> {
    const response = await axiosInstance.put(API_ENDPOINTS.EVENTS.PERMISSIONS(eventId), { allowDownload, allowShare });
    return response.data.event;
  },

  async extendExpiration(eventId: string, newExpirationDate: string): Promise<Event> {
    const response = await axiosInstance.put(API_ENDPOINTS.EVENTS.EXTEND_EXPIRATION(eventId), { expiresAt: newExpirationDate });
    return response.data.event;
  },

  async downloadAllMedia(eventId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.DOWNLOAD_ALL(eventId)}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to download media');
    return response.blob();
  },

  async updateDownloadPermission(eventId: string, allowDownload: boolean): Promise<void> {
    await axiosInstance.put(API_ENDPOINTS.EVENTS.DOWNLOAD_PERMISSION(eventId), { allowDownload });
  },
};

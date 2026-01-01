import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { authService } from './authService';

interface EventData {
  name: string;
  description: string;
  date: string;
  location?: string;
  allowDownload?: boolean;
  allowShare?: boolean;
}

interface Event extends EventData {
  _id: string;
  hostId: string;
  createdAt: string;
  expiresAt: string;
  qrCode?: string;
  guests: string[];
  media: string[];
  albums: string[];
  guestbook: string[];
}

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authService.getToken()}`,
});

export const eventService = {
  async createEvent(data: EventData): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.CREATE}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create event');
    const result = await response.json();
    return result.event;
  },

  async getEvent(id: string): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.GET(id)}`);
    if (!response.ok) throw new Error('Failed to fetch event');
    return response.json();
  },

  async updateEvent(id: string, data: Partial<EventData>): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.UPDATE(id)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update event');
    const result = await response.json();
    return result.event;
  },

  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.DELETE(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete event');
  },

  async getHostEvents(): Promise<Event[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.EVENTS.HOST_EVENTS}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch host events');
    return response.json();
  },

  async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.EVENTS.DATE_RANGE}?${params}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  async getPaginatedEvents(page: number = 1, itemsPerPage: number = 10): Promise<{ events: Event[]; total: number; pages: number }> {
    const params = new URLSearchParams({ page: String(page), itemsPerPage: String(itemsPerPage) });
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.EVENTS.PAGINATED}?${params}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  async filterEvents(filters: { name?: string; status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' }): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.EVENTS.FILTER}?${params}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to filter events');
    return response.json();
  },

  async generateQRCode(eventId: string): Promise<{ qrUploadUrl: string; qrImage: string }> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.EVENTS.QR(eventId)}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to generate QR code');
    const result = await response.json();
    return { qrUploadUrl: result.qrUploadUrl, qrImage: result.qrImage };
  },

  async generateGuestQRCode(eventId: string, guestInfo?: { name?: string; email?: string }): Promise<{ qrUploadUrl: string; qrImage: string; guestToken: string }> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.EVENTS.GUEST_QR(eventId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestInfo),
      }
    );
    if (!response.ok) throw new Error('Failed to generate guest QR code');
    return response.json();
  },

  async updatePermissions(eventId: string, allowDownload: boolean, allowShare: boolean): Promise<Event> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.EVENTS.PERMISSIONS(eventId)}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ allowDownload, allowShare }),
      }
    );
    if (!response.ok) throw new Error('Failed to update permissions');
    const result = await response.json();
    return result.event;
  },

  async extendExpiration(eventId: string, newExpirationDate: string): Promise<Event> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.EVENTS.EXTEND_EXPIRATION(eventId)}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ expiresAt: newExpirationDate }),
      }
    );
    if (!response.ok) throw new Error('Failed to extend expiration');
    const result = await response.json();
    return result.event;
  },

  async downloadAllMedia(eventId: string): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.EVENTS.DOWNLOAD_ALL(eventId)}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to download media');
    return response.blob();
  },

  async updateDownloadPermission(eventId: string, allowDownload: boolean): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.EVENTS.DOWNLOAD_PERMISSION(eventId)}`,
      {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ allowDownload }),
      }
    );
    if (!response.ok) throw new Error('Failed to update download permission');
  },
};

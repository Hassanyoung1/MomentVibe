import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { authService } from './authService';

interface MediaData {
  eventId: string;
  file: File;
  caption?: string;
  albumId?: string;
}

interface GuestMediaData {
  eventId: string;
  file: File;
  guestEmail?: string;
  guestName?: string;
}

interface Media {
  _id: string;
  eventId: string;
  fileName: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
  visibility: 'hidden' | 'visible';
  visibilityTime?: string;
  approved: boolean;
  albumId?: string;
  fileId: string;
  downloads: number;
}

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${authService.getToken()}`,
});

export const mediaService = {
  async uploadMedia(data: MediaData): Promise<Media> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('eventId', data.eventId);
    if (data.caption) formData.append('caption', data.caption);
    if (data.albumId) formData.append('albumId', data.albumId);

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA.UPLOAD}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload media');
    const result = await response.json();
    return result.media;
  },

  async uploadGuestMedia(data: GuestMediaData): Promise<Media> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('eventId', data.eventId);
    if (data.guestEmail) formData.append('guestEmail', data.guestEmail);
    if (data.guestName) formData.append('guestName', data.guestName);

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA.GUEST_UPLOAD}`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload guest media');
    const result = await response.json();
    return result.media;
  },

  async getEventMedia(eventId: string): Promise<Media[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA.GET_BY_EVENT(eventId)}`);
    if (!response.ok) throw new Error('Failed to fetch media');
    return response.json();
  },

  async approveMedia(mediaId: string): Promise<Media> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA.APPROVE(mediaId)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to approve media');
    const result = await response.json();
    return result.media;
  },

  async getLiveMedia(eventId: string, limit: number = 10): Promise<Media[]> {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.MEDIA.LIVE(eventId)}?limit=${limit}`
    );
    if (!response.ok) throw new Error('Failed to fetch live media');
    return response.json();
  },

  async updateMediaVisibility(mediaId: string, visibleAt: string): Promise<Media> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA.VISIBILITY(mediaId)}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibleAt }),
    });
    if (!response.ok) throw new Error('Failed to update media visibility');
    const result = await response.json();
    return result.media;
  },

  async getHostMedia(): Promise<Media[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA.HOST}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch host media');
    return response.json();
  },

  async downloadMedia(mediaId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA.DOWNLOAD(mediaId)}`);
    if (!response.ok) throw new Error('Failed to download media');
    return response.blob();
  },

  async getMediaFile(fileId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.MEDIA.FILE(fileId)}`);
    if (!response.ok) throw new Error('Failed to fetch media file');
    return response.blob();
  },
};

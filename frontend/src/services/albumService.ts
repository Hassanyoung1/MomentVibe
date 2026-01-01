import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';
import { authService } from './authService';

interface AlbumData {
  name: string;
  description?: string;
  type?: 'behind-the-scenes' | 'main-event' | 'custom';
}

interface Album extends AlbumData {
  _id: string;
  eventId: string;
  createdAt: string;
  mediaCount: number;
}

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${authService.getToken()}`,
});

export const albumService = {
  async createAlbum(eventId: string, data: AlbumData): Promise<Album> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ALBUMS.CREATE(eventId)}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create album');
    const result = await response.json();
    return result.album;
  },

  async getEventAlbums(eventId: string): Promise<Album[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ALBUMS.GET_BY_EVENT(eventId)}`);
    if (!response.ok) throw new Error('Failed to fetch albums');
    return response.json();
  },

  async updateAlbum(albumId: string, data: Partial<AlbumData>): Promise<Album> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ALBUMS.UPDATE(albumId)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update album');
    const result = await response.json();
    return result.album;
  },

  async deleteAlbum(albumId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ALBUMS.DELETE(albumId)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete album');
  },

  async moveMediaToAlbum(mediaId: string, albumId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ALBUMS.MOVE_MEDIA}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ mediaId, albumId }),
    });
    if (!response.ok) throw new Error('Failed to move media');
  },
};

import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

interface GuestData {
  name: string;
  email: string;
  eventId: string;
}

interface Guest extends GuestData {
  _id: string;
  registeredAt: string;
  mediaUploaded: number;
}

export const guestService = {
  async registerGuest(data: GuestData): Promise<Guest> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GUESTS.REGISTER}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to register guest');
    const result = await response.json();
    return result.guest;
  },
};

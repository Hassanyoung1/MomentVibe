import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

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
    const response = await axiosInstance.post(API_ENDPOINTS.GUESTS.REGISTER, data);
    return response.data.guest;
  },
};

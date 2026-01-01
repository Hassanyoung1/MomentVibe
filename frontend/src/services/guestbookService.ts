import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

interface GuestbookMessage {
  _id: string;
  eventId: string;
  guestName: string;
  guestEmail?: string;
  message: string;
  createdAt: string;
  reactions: Array<{ emoji: string; count: number }>;
}

export const guestbookService = {
  async addMessage(eventId: string, guestName: string, message: string, guestEmail?: string): Promise<GuestbookMessage> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GUESTBOOK.ADD_MESSAGE(eventId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestName, message, guestEmail }),
    });
    if (!response.ok) throw new Error('Failed to add guestbook message');
    const result = await response.json();
    return result.data;
  },

  async getMessages(eventId: string): Promise<GuestbookMessage[]> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GUESTBOOK.GET_MESSAGES(eventId)}`);
    if (!response.ok) throw new Error('Failed to fetch guestbook messages');
    return response.json();
  },

  async addReaction(messageId: string, reactionType: string): Promise<GuestbookMessage> {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GUESTBOOK.ADD_REACTION(messageId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionType }),
    });
    if (!response.ok) throw new Error('Failed to add reaction');
    const result = await response.json();
    return result.data;
  },
};

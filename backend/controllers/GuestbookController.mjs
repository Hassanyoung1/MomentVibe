/**
 * Guestbook Controller
 * --------------------
 * Handles guestbook message creation, retrieval, and reactions.
 */

import Guestbook from '../models/Guestbook.mjs';

class GuestbookController {
  /**
   * Add a guestbook message
   * --------------------
   * Allows guests to leave messages on an event page.
   */
  static async addMessage(req, res) {
    const { eventId } = req.params;
    const { guestName, message } = req.body;

    if (!guestName || !message) {
      return res.status(400).json({ error: 'Guest name and message are required.' });
    }

    try {
      const newMessage = new Guestbook({ eventId, guestName, message });
      await newMessage.save();
      res.status(201).json({ message: 'Guestbook entry added!', data: newMessage });
    } catch (error) {
      console.error('Error adding guestbook message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Fetch guestbook messages for an event
   * --------------------
   * Retrieves all messages left by guests for a specific event.
   */
  static async getMessages(req, res) {
    const { eventId } = req.params;
    
    try {
      const messages = await Guestbook.find({ eventId }).sort({ createdAt: -1 });
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching guestbook messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * React to a guestbook message
   * --------------------
   * Guests can add reactions to messages.
   */
  static async reactToMessage(req, res) {
    const { messageId } = req.params;
    const { reactionType } = req.body;

    if (!['like', 'love', 'laugh'].includes(reactionType)) {
      return res.status(400).json({ error: 'Invalid reaction type.' });
    }

    try {
      const updatedMessage = await Guestbook.findByIdAndUpdate(
        messageId,
        { $inc: { [`reactions.${reactionType}`]: 1 } }, // Increment reaction count
        { new: true }
      );

      if (!updatedMessage) {
        return res.status(404).json({ error: 'Message not found.' });
      }

      res.status(200).json({ message: 'Reaction added!', data: updatedMessage });
    } catch (error) {
      console.error('Error reacting to guestbook message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default GuestbookController;

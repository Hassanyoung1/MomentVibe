/**
 * Guestbook Model
 * --------------------
 * This model stores guest messages for an event.
 * Guests can leave text messages, and others can react to them.
 */

import mongoose from 'mongoose';

const GuestbookSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: false }, // Optional if guest isn't registered
  guestName: { type: String, required: true }, // For unregistered guests
  message: { type: String, required: true }, // Guest message content
  reactions: { // Stores reaction counts
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Guestbook', GuestbookSchema);

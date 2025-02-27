/**
 * Download Log Model
 * --------------------
 * Tracks who downloads media from an event.
 */

import mongoose from 'mongoose';

const DownloadLogSchema = new mongoose.Schema({
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: false }, // Optional for unregistered guests
  guestName: { type: String, required: false }, // Store guest name if they are unregistered
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model('DownloadLog', DownloadLogSchema);

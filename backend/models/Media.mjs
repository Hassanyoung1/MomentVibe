import mongoose from 'mongoose';

/**
 * Media Model
 * --------------------
 * Stores photos and videos uploaded by guests for an event.
 */


const MediaSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: false }, // ✅ Ensure guestId is present
  type: { type: String, enum: ['photo', 'video'], required: true },
  filename: { type: String, required: true }, // Original filename
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // GridFS file ID
  visibleAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },

});

export default mongoose.model('Media', MediaSchema);
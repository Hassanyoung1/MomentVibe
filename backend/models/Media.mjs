import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  type: { type: String, enum: ['photo', 'video'], required: true },
  filename: { type: String, required: true }, // Original filename
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // GridFS file ID
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Media', MediaSchema);
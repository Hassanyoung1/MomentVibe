import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  description: { type: String },
  media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }], // Photos & videos in the album
  visibility: { type: String, enum: ['public', 'private'], default: 'public' }, // Control who can see the album
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Album', albumSchema);

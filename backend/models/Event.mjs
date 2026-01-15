import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    default: '',
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  media: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media',
  }],
  visibility: { 
    type: String, 
    enum: ['public', 'private'], 
    default: 'public' 
  },
  guests: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Guest' 
  }],
  albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }], // Link to albums
  qrCodeUrl: { type: String }, // Guest upload URL
  qrCodeImage: { type: String }, // Base64 QR code image
  guestViewUrl: { type: String }, // Guest view gallery URL
  allowDownload: { type: Boolean, default: true }, // Controls if media can be downloaded
  allowSharing: { type: Boolean, default: true }, // Controls if guests can share media
  autoApproveGuestMedia: { type: Boolean, default: true }, // Auto-approve guest uploads (no manual review needed)
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // Defaults to 30 days

}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;

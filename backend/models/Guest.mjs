import mongoose from 'mongoose';

/**
 * Guest Model
 * --------------------
 * Stores guest details, including a unique token for tracking uploads.
 */


const GuestSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: false },  // Make name optional
  email: { type: String, required: false }, // Make email optional
  guestToken: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});


export default mongoose.model('Guest', GuestSchema);

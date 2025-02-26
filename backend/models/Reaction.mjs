import mongoose from 'mongoose';

const ReactionSchema = new mongoose.Schema({
  mediaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },
  type: { type: String, enum: ['like', 'comment'], required: true },
  comment: { type: String }, // Only required if type is 'comment'
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Reaction', ReactionSchema);

/**
 * Archived Event Model
 * --------------------
 * Stores expired events so they can be retrieved later.
 */

import mongoose from 'mongoose';

const archivedEventSchema = new mongoose.Schema({
  originalEventId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  media: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Media' }],
  archivedAt: { type: Date, default: Date.now }
});

export default mongoose.model('ArchivedEvent', archivedEventSchema);

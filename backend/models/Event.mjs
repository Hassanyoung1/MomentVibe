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
  qrCodeUrl: { type: String } 
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
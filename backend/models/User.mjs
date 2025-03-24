import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  confirmationToken: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['host', 'guest'],
    default: 'guest',
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
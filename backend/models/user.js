const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  priority: {
    type: Number,
    required: true,
    enum: [0, 1, 2], // Only 0, 1, and 2 are valid priorities for Twilio calling.
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;

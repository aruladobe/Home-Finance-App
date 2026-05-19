const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  relationship: {
    type: String,
    enum: ['Self', 'Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter', 'Spouse', 'Grandfather', 'Grandmother', 'Other'],
    default: 'Self'
  },
  role: { type: String, enum: ['admin', 'user', 'manager'], default: 'admin' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

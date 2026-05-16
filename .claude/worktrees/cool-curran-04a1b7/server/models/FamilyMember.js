const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  relationship: {
    type: String,
    enum: ['Self', 'Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter', 'Spouse', 'Grandfather', 'Grandmother', 'Other'],
    required: true
  },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  age: { type: Number },
  occupation: { type: String, default: '' },
  avatar: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('FamilyMember', familyMemberSchema);

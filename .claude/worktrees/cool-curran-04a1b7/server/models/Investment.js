const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  familyMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
  familyMemberName: { type: String, default: '' },
  type: {
    type: String,
    enum: ['Stocks', 'Mutual Funds', 'Fixed Deposit', 'Real Estate', 'Gold', 'Crypto', 'PPF', 'NPS', 'Other'],
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  expectedReturns: { type: Number, default: 0 },
  actualReturns: { type: Number, default: 0 },
  description: { type: String, default: '' },
  date: { type: Date, required: true, default: Date.now },
  maturityDate: { type: Date },
  period: { type: String, enum: ['daily', 'monthly', 'yearly'], default: 'monthly' },
  status: { type: String, enum: ['active', 'matured', 'withdrawn'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);

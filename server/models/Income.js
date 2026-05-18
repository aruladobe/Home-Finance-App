const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  familyMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
  familyMemberName: { type: String, default: '' },
  type: {
    type: String,
    enum: ['Salary', 'Earning', 'Interest', 'House Rent', 'Other Source'],
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  date: { type: Date, required: true, default: Date.now },
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly'], default: 'monthly' },
  effectiveFrom: { type: Date, default: null },
  effectiveTo: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Income', incomeSchema);

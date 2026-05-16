const mongoose = require('mongoose');

const plannedExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  familyMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
  familyMemberName: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Kids', 'Education', 'Transport', 'Grocery', 'Entertainment', 'Maintenance', 'Furniture', 'Medicine', 'Functions', 'Celebrations', 'Insurance', 'Loan Repayment', 'Bills', 'Fuel and Gas', 'Outing', 'Party'],
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  effectiveDate: { type: Date, required: true },
  period: { type: String, enum: ['daily', 'monthly', 'yearly'], default: 'monthly' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('PlannedExpense', plannedExpenseSchema);

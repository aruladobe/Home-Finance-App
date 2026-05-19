const mongoose = require('mongoose');

const plannedExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  familyMemberId: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', default: null },
  familyMemberName: { type: String, default: '' },
  category: {
    type: String,
    enum: ['Kids', 'Education', 'Transport', 'Grocery', 'Entertainment', 'Service and Maintenance', 'Furniture', 'Medicine', 'Functions and Celebrations', 'Insurance', 'Loan Repayment', 'Bills', 'Rent', 'Fuel and Gas', 'Outing', 'Party', 'Others'],
    required: true
  },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  effectiveDate: { type: Date, required: true },
  period: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'half-yearly', 'yearly'], default: 'monthly' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('PlannedExpense', plannedExpenseSchema);

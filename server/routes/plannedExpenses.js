const express = require('express');
const router = express.Router();
const PlannedExpense = require('../models/PlannedExpense');
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const items = await PlannedExpense.find({ userId: req.user.id }).sort({ effectiveDate: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const body = { ...req.body, userId: req.user.id };
    if (body.familyMemberId === '') body.familyMemberId = null;
    if (body.effectiveDate === '') body.effectiveDate = null;
    const item = new PlannedExpense(body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.familyMemberId === '') body.familyMemberId = null;
    if (body.effectiveDate === '') body.effectiveDate = null;
    const item = await PlannedExpense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      body, { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await PlannedExpense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Move a planned expense to actual expenses
router.post('/:id/move', auth, async (req, res) => {
  try {
    const planned = await PlannedExpense.findOne({ _id: req.params.id, userId: req.user.id });
    if (!planned) return res.status(404).json({ message: 'Not found' });

    const expense = new Expense({
      userId: planned.userId,
      familyMemberId: planned.familyMemberId,
      familyMemberName: planned.familyMemberName,
      category: planned.category,
      amount: planned.amount,
      description: planned.description,
      date: req.body.date ? new Date(req.body.date) : planned.effectiveDate,
      period: planned.period,
    });
    await expense.save();
    await PlannedExpense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    res.json({ expense });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

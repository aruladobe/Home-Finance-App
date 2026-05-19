const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { period, category, startDate, endDate, familyMemberId } = req.query;
    const filter = { userId: req.user.id };
    if (period) filter.period = period;
    if (category) filter.category = category;
    if (familyMemberId) filter.familyMemberId = familyMemberId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const body = { ...req.body, userId: req.user.id };
    if (body.familyMemberId === '') body.familyMemberId = null;
    if (body.effectiveFrom === '') body.effectiveFrom = null;
    if (body.effectiveTo === '') body.effectiveTo = null;
    const expense = new Expense(body);
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const body = { ...req.body };
    if (body.familyMemberId === '') body.familyMemberId = null;
    if (body.effectiveFrom === '') body.effectiveFrom = null;
    if (body.effectiveTo === '') body.effectiveTo = null;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      body, { new: true }
    );
    if (!expense) return res.status(404).json({ message: 'Not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

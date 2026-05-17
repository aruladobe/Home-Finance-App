const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { period, startDate, endDate, familyMemberId } = req.query;
    const filter = { userId: req.user.id };
    if (period) filter.period = period;
    if (familyMemberId) filter.familyMemberId = familyMemberId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    const income = await Income.find(filter).sort({ date: -1 });
    res.json(income);
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
    const income = new Income(body);
    await income.save();
    res.status(201).json(income);
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
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      body, { new: true }
    );
    if (!income) return res.status(404).json({ message: 'Not found' });
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!income) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

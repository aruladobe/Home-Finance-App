const express = require('express');
const router = express.Router();
const Investment = require('../models/Investment');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { period, type, status, familyMemberId } = req.query;
    const filter = { userId: req.user.id };
    if (period) filter.period = period;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (familyMemberId) filter.familyMemberId = familyMemberId;
    const investments = await Investment.find(filter).sort({ date: -1 });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const investment = new Investment({ ...req.body, userId: req.user.id });
    await investment.save();
    res.status(201).json(investment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body, { new: true }
    );
    if (!investment) return res.status(404).json({ message: 'Not found' });
    res.json(investment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!investment) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

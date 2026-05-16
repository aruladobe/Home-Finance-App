const express = require('express');
const router = express.Router();
const FamilyMember = require('../models/FamilyMember');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const members = await FamilyMember.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const member = new FamilyMember({ ...req.body, ownerId: req.user.id });
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const member = await FamilyMember.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.id },
      req.body, { new: true }
    );
    if (!member) return res.status(404).json({ message: 'Not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const member = await FamilyMember.findOneAndDelete({ _id: req.params.id, ownerId: req.user.id });
    if (!member) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

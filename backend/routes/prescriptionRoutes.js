const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Prescription = require('../models/Prescription');
const Pharmacy = require('../models/Pharmacy');

// Upload prescription
router.post('/upload', protect, authorize('user'), upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const prescription = await Prescription.create({
      user: req.user._id,
      pharmacy: req.body.pharmacy,
      imageUrl: `/uploads/prescriptions/${req.file.filename}`,
      notes: req.body.notes,
    });
    res.status(201).json({ success: true, data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user's prescriptions
router.get('/my', protect, authorize('user'), async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id })
      .populate('pharmacy', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get pharmacy's prescriptions to verify
router.get('/pharmacy', protect, authorize('pharmacy'), async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    const prescriptions = await Prescription.find({ pharmacy: pharmacy._id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: prescriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Verify / reject prescription
router.put('/:id/verify', protect, authorize('pharmacy'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status, rejectionReason, verifiedBy: req.user._id, verifiedAt: Date.now() },
      { new: true }
    ).populate('user', 'name email');
    res.json({ success: true, data: prescription });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

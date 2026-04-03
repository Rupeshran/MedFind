const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Reservation = require('../models/Reservation');
const Inventory = require('../models/Inventory');
const Prescription = require('../models/Prescription');

const adminOnly = [protect, authorize('admin')];

// ── Dashboard Stats ──────────────────────────────────────────────
router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalPharmacies, totalMedicines, totalReservations,
      pendingVerifications, pendingReservations] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Pharmacy.countDocuments(),
      Medicine.countDocuments({ isActive: true }),
      Reservation.countDocuments(),
      Pharmacy.countDocuments({ isVerified: false }),
      Reservation.countDocuments({ status: 'pending' }),
    ]);

    // Reservations by status
    const reservationsByStatus = await Reservation.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Monthly reservations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyReservations = await Reservation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top searched medicines
    const topMedicines = await Medicine.find()
      .sort({ searchCount: -1 })
      .limit(5)
      .select('name brand searchCount');

    // Low stock alerts across all pharmacies
    const lowStockCount = await Inventory.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    });

    res.json({
      success: true,
      stats: {
        totalUsers, totalPharmacies, totalMedicines, totalReservations,
        pendingVerifications, pendingReservations, lowStockCount,
      },
      reservationsByStatus,
      monthlyReservations,
      topMedicines,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Users ────────────────────────────────────────────────────────
router.get('/users', ...adminOnly, async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const users = await User.find(query).select('-password')
      .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    res.json({ success: true, data: users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/users/:id/toggle', ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Pharmacies ───────────────────────────────────────────────────
router.get('/pharmacies', ...adminOnly, async (req, res) => {
  try {
    const { verified, page = 1, limit = 20 } = req.query;
    const query = {};
    if (verified !== undefined) query.isVerified = verified === 'true';
    const pharmacies = await Pharmacy.find(query).populate('owner', 'name email phone')
      .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Pharmacy.countDocuments(query);
    res.json({ success: true, data: pharmacies, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/pharmacies/:id/verify', ...adminOnly, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id, { isVerified: true }, { new: true }
    );
    res.json({ success: true, data: pharmacy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/pharmacies/:id/reject', ...adminOnly, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id, { isVerified: false, isActive: false }, { new: true }
    );
    res.json({ success: true, data: pharmacy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Reservations ─────────────────────────────────────────────────
router.get('/reservations', ...adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    const reservations = await Reservation.find(query)
      .populate('user', 'name email')
      .populate('pharmacy', 'name')
      .populate('medicine', 'name brand')
      .skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await Reservation.countDocuments(query);
    res.json({ success: true, data: reservations, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Low Stock Alerts ─────────────────────────────────────────────
router.get('/low-stock', ...adminOnly, async (req, res) => {
  try {
    const items = await Inventory.find({ $expr: { $lte: ['$stock', '$lowStockThreshold'] } })
      .populate('medicine', 'name brand strength')
      .populate('pharmacy', 'name address');
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const Reservation = require('../models/Reservation');
const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const Notification = require('../models/Notification');
const { sendReservationEmail } = require('../utils/emailService');

// @POST /api/reservations
exports.createReservation = async (req, res) => {
  try {
    const { pharmacy, medicine, quantity, notes, prescription } = req.body;

    const inventoryItem = await Inventory.findOne({ pharmacy, medicine, isAvailable: true });
    if (!inventoryItem || inventoryItem.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      pharmacy,
      medicine,
      quantity,
      totalPrice: inventoryItem.price * quantity,
      notes,
      prescription,
      requiresPrescription: !!prescription,
    });

    await reservation.populate([
      { path: 'medicine', select: 'name brand strength requiresPrescription' },
      { path: 'pharmacy', select: 'name address phone' },
    ]);

    // Notify pharmacy owner
    const pharmacyDoc = await Pharmacy.findById(pharmacy);
    await Notification.create({
      user: pharmacyDoc.owner,
      title: 'New Reservation Request',
      message: `${req.user.name} has requested ${quantity} unit(s) of ${reservation.medicine.name}`,
      type: 'reservation',
    });

    // Send confirmation email
    sendReservationEmail(
      req.user.email,
      req.user.name,
      reservation.medicine.name,
      reservation.pharmacy.name
    );

    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/reservations/my
exports.getUserReservations = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const reservations = await Reservation.find(query)
      .populate('medicine', 'name brand strength image')
      .populate('pharmacy', 'name address phone')
      .populate('prescription')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Reservation.countDocuments(query);
    res.json({ success: true, data: reservations, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/reservations/pharmacy (pharmacy owner)
exports.getPharmacyReservations = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    const { status, page = 1, limit = 10 } = req.query;
    const query = { pharmacy: pharmacy._id };
    if (status) query.status = status;

    const reservations = await Reservation.find(query)
      .populate('user', 'name email phone')
      .populate('medicine', 'name brand strength requiresPrescription')
      .populate('prescription')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Reservation.countDocuments(query);
    res.json({ success: true, data: reservations, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/reservations/:id/status (pharmacy)
exports.updateReservationStatus = async (req, res) => {
  try {
    const { status, pharmacyNote } = req.body;
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    const reservation = await Reservation.findOneAndUpdate(
      { _id: req.params.id, pharmacy: pharmacy._id },
      { status, pharmacyNote, ...(status === 'completed' ? { completedAt: Date.now() } : {}) },
      { new: true }
    ).populate('user medicine pharmacy');

    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

    // Deduct stock when confirmed
    if (status === 'confirmed') {
      await Inventory.findOneAndUpdate(
        { pharmacy: pharmacy._id, medicine: reservation.medicine._id },
        { $inc: { stock: -reservation.quantity } }
      );
    }

    // Notify user
    await Notification.create({
      user: reservation.user._id,
      title: `Reservation ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your reservation for ${reservation.medicine.name} has been ${status}`,
      type: 'reservation',
    });

    res.json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/reservations/:id/cancel (user)
exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id, status: { $in: ['pending', 'confirmed'] } },
      { status: 'cancelled' },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ success: false, message: 'Cannot cancel this reservation' });
    res.json({ success: true, data: reservation });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const ExpiryTracker = require('../models/ExpiryTracker');
const Notification = require('../models/Notification');

// @GET /api/expiry-tracker
exports.getTrackedMedicines = async (req, res) => {
  try {
    const items = await ExpiryTracker.find({ user: req.user._id, isActive: true })
      .sort({ expiryDate: 1 });

    // Add status to each
    const now = new Date();
    const enriched = items.map(item => {
      const daysLeft = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
      let status, statusColor;
      if (daysLeft < 0) { status = 'expired'; statusColor = 'red'; }
      else if (daysLeft <= 7) { status = 'expiring_soon'; statusColor = 'red'; }
      else if (daysLeft <= 30) { status = 'expiring'; statusColor = 'yellow'; }
      else { status = 'good'; statusColor = 'green'; }

      return {
        ...item.toObject(),
        daysLeft,
        status,
        statusColor,
      };
    });

    res.json({ success: true, data: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/expiry-tracker
exports.addMedicine = async (req, res) => {
  try {
    const { medicineName, brand, batchNumber, expiryDate, quantity, notes, reminderDays } = req.body;

    if (!medicineName || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Medicine name and expiry date are required' });
    }

    const item = await ExpiryTracker.create({
      user: req.user._id,
      medicineName,
      brand,
      batchNumber,
      expiryDate: new Date(expiryDate),
      quantity,
      notes,
      reminderDays: reminderDays || [30, 7, 1],
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/expiry-tracker/:id
exports.updateMedicine = async (req, res) => {
  try {
    const item = await ExpiryTracker.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/expiry-tracker/:id
exports.removeMedicine = async (req, res) => {
  try {
    await ExpiryTracker.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isActive: false }
    );
    res.json({ success: true, message: 'Removed from tracker' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/expiry-tracker/alerts
exports.getAlerts = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const items = await ExpiryTracker.find({
      user: req.user._id,
      isActive: true,
      expiryDate: { $lte: thirtyDaysFromNow },
    }).sort({ expiryDate: 1 });

    const alerts = items.map(item => {
      const daysLeft = Math.ceil((new Date(item.expiryDate) - now) / (1000 * 60 * 60 * 24));
      let urgency, message;

      if (daysLeft < 0) {
        urgency = 'expired';
        message = `${item.medicineName} has EXPIRED ${Math.abs(daysLeft)} day(s) ago. Dispose safely.`;
      } else if (daysLeft === 0) {
        urgency = 'today';
        message = `${item.medicineName} expires TODAY. Do not use after today.`;
      } else if (daysLeft <= 7) {
        urgency = 'critical';
        message = `${item.medicineName} expires in ${daysLeft} day(s). Replace soon.`;
      } else {
        urgency = 'warning';
        message = `${item.medicineName} expires in ${daysLeft} day(s).`;
      }

      return { ...item.toObject(), daysLeft, urgency, message };
    });

    res.json({ success: true, data: alerts, total: alerts.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const Pharmacy = require('../models/Pharmacy');
const Inventory = require('../models/Inventory');
const Reservation = require('../models/Reservation');
const upload = require('../middleware/upload');

// @POST /api/pharmacies/register
exports.registerPharmacy = async (req, res) => {
  try {
    const exists = await Pharmacy.findOne({ owner: req.user._id });
    if (exists) return res.status(400).json({ success: false, message: 'Pharmacy already registered for this account' });

    const { name, registrationNumber, email, phone, address, location, timings, isOpen24Hours, description } = req.body;
    const pharmacy = await Pharmacy.create({
      owner: req.user._id,
      name, registrationNumber, email, phone, address,
      location: location || { type: 'Point', coordinates: [0, 0] },
      timings, isOpen24Hours, description,
    });
    res.status(201).json({ success: true, data: pharmacy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/pharmacies
exports.getPharmacies = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10000, verified, page = 1, limit = 20 } = req.query;
    let query = { isActive: true };
    if (verified) query.isVerified = verified === 'true';

    let pharmacies;
    if (lat && lng) {
      pharmacies = await Pharmacy.find({
        ...query,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(maxDistance),
          },
        },
      })
        .populate('owner', 'name email')
        .skip((page - 1) * limit)
        .limit(Number(limit));
    } else {
      pharmacies = await Pharmacy.find(query)
        .populate('owner', 'name email')
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });
    }

    res.json({ success: true, data: pharmacies, count: pharmacies.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/pharmacies/:id
exports.getPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).populate('owner', 'name email phone');
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    res.json({ success: true, data: pharmacy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/pharmacies/:id
exports.updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found or unauthorized' });
    res.json({ success: true, data: pharmacy });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/pharmacies/my/dashboard
exports.getMyPharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) return res.status(404).json({ success: false, message: 'No pharmacy found' });

    const totalInventory = await Inventory.countDocuments({ pharmacy: pharmacy._id });
    const lowStock = await Inventory.countDocuments({ pharmacy: pharmacy._id, stock: { $lte: 10 }, isAvailable: true });
    const pendingReservations = await Reservation.countDocuments({ pharmacy: pharmacy._id, status: 'pending' });
    const totalReservations = await Reservation.countDocuments({ pharmacy: pharmacy._id });

    res.json({
      success: true,
      pharmacy,
      stats: { totalInventory, lowStock, pendingReservations, totalReservations },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

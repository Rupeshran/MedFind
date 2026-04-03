const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');

// @GET /api/medicines?q=&category=&page=
exports.getMedicines = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (q) {
      query.$text = { $search: q };
      // Increment search count
      await Medicine.updateMany(
        { $text: { $search: q } },
        { $inc: { searchCount: 1 } }
      );
    }
    if (category) query.category = category;

    const medicines = await Medicine.find(query)
      .populate('category', 'name')
      .populate('substitutes', 'name brand strength')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ searchCount: -1 });

    const total = await Medicine.countDocuments(query);
    res.json({ success: true, data: medicines, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/medicines/:id
exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate('category', 'name')
      .populate('substitutes', 'name brand strength dosageForm manufacturer');
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });

    // Get pharmacy availability
    const inventory = await Inventory.find({ medicine: medicine._id, isAvailable: true, stock: { $gt: 0 } })
      .populate({ path: 'pharmacy', select: 'name address location timings isOpen24Hours rating phone isVerified' });

    res.json({ success: true, data: medicine, availability: inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/medicines/nearby?lat=&lng=&medicineName=&maxDistance=
exports.getNearbyAvailability = async (req, res) => {
  try {
    const { lat, lng, medicineId, maxDistance = 10000 } = req.query;

    const nearbyPharmacies = await Pharmacy.find({
      isVerified: true,
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).select('_id name address location timings isOpen24Hours phone rating');

    const pharmacyIds = nearbyPharmacies.map((p) => p._id);
    const inventory = await Inventory.find({
      pharmacy: { $in: pharmacyIds },
      medicine: medicineId,
      isAvailable: true,
      stock: { $gt: 0 },
    }).populate('pharmacy', 'name address location timings isOpen24Hours phone rating');

    res.json({ success: true, data: inventory, count: inventory.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/medicines (admin)
exports.createMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/medicines/:id (admin)
exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: medicine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/medicines/:id (admin)
exports.deleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Medicine deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

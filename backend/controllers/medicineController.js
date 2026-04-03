const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');

// ── Helper: Escape regex special characters ────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @GET /api/medicines?q=&category=&page=&limit=&sort=
exports.getMedicines = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 20, sort } = req.query;
    const query = { isActive: true };

    // ── Regex-based search across name, brand, composition ──
    if (q && q.trim()) {
      const safeQuery = escapeRegex(q.trim());
      const regex = new RegExp(safeQuery, 'i'); // case-insensitive partial match
      query.$or = [
        { name: { $regex: regex } },
        { brand: { $regex: regex } },
        { composition: { $regex: regex } },
      ];

      // Increment search count for matching medicines (fire-and-forget)
      Medicine.updateMany(
        { isActive: true, $or: [{ name: { $regex: regex } }, { brand: { $regex: regex } }, { composition: { $regex: regex } }] },
        { $inc: { searchCount: 1 } }
      ).catch(() => {}); // non-blocking, don't fail the request
    }

    if (category) query.category = category;

    // ── Sorting ──
    let sortOption = { searchCount: -1, createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));

    const [medicines, total] = await Promise.all([
      Medicine.find(query)
        .populate('category', 'name')
        .populate('substitutes', 'name brand strength')
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort(sortOption)
        .lean(),
      Medicine.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: medicines,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      query: q || null,
    });
  } catch (err) {
    console.error('getMedicines error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch medicines. Please try again.' });
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

// @GET /api/medicines/nearby?lat=&lng=&medicineId=&maxDistance=
exports.getNearbyAvailability = async (req, res) => {
  try {
    const { lat, lng, medicineId, maxDistance = 10000 } = req.query;

    if (!lat || !lng || !medicineId) {
      return res.status(400).json({ success: false, message: 'lat, lng, and medicineId are required' });
    }

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

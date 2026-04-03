const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');

// @GET /api/inventory/pharmacy/:pharmacyId
exports.getPharmacyInventory = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, lowStock } = req.query;
    let query = { pharmacy: req.params.pharmacyId };
    if (lowStock === 'true') query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };

    const inventory = await Inventory.find(query)
      .populate('medicine', 'name brand composition dosageForm strength requiresPrescription image')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ 'medicine.name': 1 });

    const total = await Inventory.countDocuments(query);
    res.json({ success: true, data: inventory, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/inventory
exports.addInventoryItem = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });

    const { medicine, stock, price, expiryDate, lowStockThreshold } = req.body;
    const existing = await Inventory.findOne({ pharmacy: pharmacy._id, medicine });
    if (existing) return res.status(400).json({ success: false, message: 'Medicine already in inventory. Update stock instead.' });

    const item = await Inventory.create({ pharmacy: pharmacy._id, medicine, stock, price, expiryDate, lowStockThreshold });
    await item.populate('medicine', 'name brand composition dosageForm strength');
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/inventory/:id
exports.updateInventoryItem = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });

    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, pharmacy: pharmacy._id },
      { ...req.body, lastUpdated: Date.now() },
      { new: true }
    ).populate('medicine', 'name brand composition dosageForm strength');

    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/inventory/:id
exports.deleteInventoryItem = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    await Inventory.findOneAndDelete({ _id: req.params.id, pharmacy: pharmacy._id });
    res.json({ success: true, message: 'Item removed from inventory' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/inventory/low-stock (pharmacy owner)
exports.getLowStockAlerts = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ owner: req.user._id });
    const items = await Inventory.find({
      pharmacy: pharmacy._id,
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    }).populate('medicine', 'name brand strength');
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

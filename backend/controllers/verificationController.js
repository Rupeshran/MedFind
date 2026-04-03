const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');

// @POST /api/verify/medicine
// Body: { verificationCode } or { batchNumber, pharmacyId }
exports.verifyMedicine = async (req, res) => {
  try {
    const { verificationCode, batchNumber, pharmacyId } = req.body;

    let inventory;

    if (verificationCode) {
      // Search by unique verification code
      inventory = await Inventory.findOne({ verificationCode })
        .populate('medicine', 'name brand composition manufacturer dosageForm strength')
        .populate('pharmacy', 'name address phone isVerified rating');
    } else if (batchNumber) {
      // Search by batch number (optionally filtered by pharmacy)
      const query = { batchNumber: { $regex: batchNumber, $options: 'i' } };
      if (pharmacyId) query.pharmacy = pharmacyId;

      inventory = await Inventory.findOne(query)
        .populate('medicine', 'name brand composition manufacturer dosageForm strength')
        .populate('pharmacy', 'name address phone isVerified rating');
    }

    if (!inventory) {
      return res.json({
        success: true,
        verified: false,
        status: 'unverified',
        message: 'This medicine could not be verified in our system. This does NOT necessarily mean it is fake — it may simply not be registered in our database.',
        icon: '⚠️',
        recommendation: 'Please verify with the pharmacy directly or check the manufacturer\'s website.',
      });
    }

    // Check if pharmacy is verified
    const isPharmacyVerified = inventory.pharmacy?.isVerified || false;

    // Check expiry
    const isExpired = inventory.expiryDate && new Date(inventory.expiryDate) < new Date();
    const daysToExpiry = inventory.expiryDate
      ? Math.ceil((new Date(inventory.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
      : null;

    let status, icon, message;

    if (isExpired) {
      status = 'expired';
      icon = '❌';
      message = `This medicine has EXPIRED on ${new Date(inventory.expiryDate).toLocaleDateString()}. Do NOT use it.`;
    } else if (!isPharmacyVerified) {
      status = 'unverified_pharmacy';
      icon = '⚠️';
      message = 'Medicine found, but the dispensing pharmacy is not yet verified on our platform.';
    } else {
      status = 'genuine';
      icon = '✅';
      message = 'This medicine is verified and registered with a verified pharmacy on MedFind.';
    }

    res.json({
      success: true,
      verified: status === 'genuine',
      status,
      icon,
      message,
      medicine: {
        name: inventory.medicine.name,
        brand: inventory.medicine.brand,
        composition: inventory.medicine.composition,
        manufacturer: inventory.medicine.manufacturer,
        dosageForm: inventory.medicine.dosageForm,
        strength: inventory.medicine.strength,
      },
      pharmacy: {
        name: inventory.pharmacy.name,
        address: inventory.pharmacy.address,
        phone: inventory.pharmacy.phone,
        isVerified: isPharmacyVerified,
        rating: inventory.pharmacy.rating,
      },
      batch: {
        batchNumber: inventory.batchNumber,
        verificationCode: inventory.verificationCode,
        expiryDate: inventory.expiryDate,
        isExpired,
        daysToExpiry,
        stock: inventory.stock,
      },
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/verify/qr/:code
exports.verifyByQR = async (req, res) => {
  try {
    const { code } = req.params;
    // Delegate to verifyMedicine
    req.body = { verificationCode: code };
    return exports.verifyMedicine(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

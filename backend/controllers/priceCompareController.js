const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');

// Helper to calculate distance between 2 geo points (km)
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// @GET /api/compare/medicine/:id?lat=&lng=
exports.comparePrices = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng } = req.query;

    const inventory = await Inventory.find({
      medicine: id,
      isAvailable: true,
      stock: { $gt: 0 },
    })
      .populate('medicine', 'name brand strength dosageForm manufacturer composition requiresPrescription')
      .populate({
        path: 'pharmacy',
        select: 'name address location timings isOpen24Hours phone rating isVerified totalRatings',
        match: { isActive: true, isVerified: true },
      });

    // Filter out items without a matched pharmacy
    const results = inventory
      .filter((item) => item.pharmacy)
      .map((item) => {
        let distance = null;
        if (lat && lng && item.pharmacy.location?.coordinates) {
          const [pLng, pLat] = item.pharmacy.location.coordinates;
          distance = getDistanceKm(parseFloat(lat), parseFloat(lng), pLat, pLng);
        }
        return {
          _id: item._id,
          pharmacy: item.pharmacy,
          medicine: item.medicine,
          price: item.price,
          stock: item.stock,
          expiryDate: item.expiryDate,
          distance: distance !== null ? Math.round(distance * 10) / 10 : null,
        };
      })
      .sort((a, b) => a.price - b.price);

    const prices = results.map((r) => r.price);
    const stats = prices.length > 0 ? {
      lowest: Math.min(...prices),
      highest: Math.max(...prices),
      average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      savings: Math.max(...prices) - Math.min(...prices),
      pharmacyCount: prices.length,
    } : null;

    res.json({ success: true, data: results, stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/compare/basket  body: { medicines: [id1, id2, ...], lat, lng }
exports.compareBasket = async (req, res) => {
  try {
    const { medicines, lat, lng } = req.body;

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ success: false, message: 'Provide at least one medicine ID' });
    }

    // Get all pharmacies that have any of these medicines
    const inventory = await Inventory.find({
      medicine: { $in: medicines },
      isAvailable: true,
      stock: { $gt: 0 },
    })
      .populate('medicine', 'name brand strength dosageForm')
      .populate({
        path: 'pharmacy',
        select: 'name address location timings isOpen24Hours phone rating isVerified',
        match: { isActive: true },
      });

    // Group by pharmacy
    const pharmacyMap = {};
    inventory
      .filter((item) => item.pharmacy)
      .forEach((item) => {
        const pid = item.pharmacy._id.toString();
        if (!pharmacyMap[pid]) {
          let distance = null;
          if (lat && lng && item.pharmacy.location?.coordinates) {
            const [pLng, pLat] = item.pharmacy.location.coordinates;
            distance = getDistanceKm(parseFloat(lat), parseFloat(lng), pLat, pLng);
          }
          pharmacyMap[pid] = {
            pharmacy: item.pharmacy,
            distance: distance !== null ? Math.round(distance * 10) / 10 : null,
            items: [],
            totalPrice: 0,
            availableCount: 0,
          };
        }
        pharmacyMap[pid].items.push({
          medicine: item.medicine,
          price: item.price,
          stock: item.stock,
        });
        pharmacyMap[pid].totalPrice += item.price;
        pharmacyMap[pid].availableCount++;
      });

    // Sort by total price
    const results = Object.values(pharmacyMap).sort((a, b) => {
      // Prioritize pharmacies with all medicines, then by price
      if (b.availableCount !== a.availableCount) return b.availableCount - a.availableCount;
      return a.totalPrice - b.totalPrice;
    });

    res.json({
      success: true,
      data: results,
      totalMedicines: medicines.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

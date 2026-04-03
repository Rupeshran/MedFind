const Medicine = require('../models/Medicine');
const Inventory = require('../models/Inventory');
const Pharmacy = require('../models/Pharmacy');
const Category = require('../models/Category');

// ── Symptom → Medicine mapping ─────────────────────────────────────
const symptomMap = {
  headache: ['Paracetamol', 'Ibuprofen', 'Combiflam', 'Naproxen'],
  fever: ['Paracetamol', 'Ibuprofen', 'Combiflam'],
  cold: ['Cetirizine', 'Paracetamol', 'Chlorpheniramine', 'Levocetirizine'],
  cough: ['Dextromethorphan', 'Ambroxol', 'Benadryl'],
  acidity: ['Omeprazole', 'Pantoprazole', 'Ranitidine', 'Rabeprazole'],
  allergy: ['Cetirizine', 'Levocetirizine', 'Fexofenadine', 'Chlorpheniramine'],
  pain: ['Ibuprofen', 'Diclofenac', 'Aceclofenac', 'Combiflam', 'Paracetamol'],
  diabetes: ['Metformin', 'Glimepiride', 'Sitagliptin', 'Gliclazide'],
  'blood pressure': ['Amlodipine', 'Losartan', 'Telmisartan', 'Atenolol'],
  hypertension: ['Amlodipine', 'Losartan', 'Telmisartan', 'Atenolol'],
  infection: ['Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Cefixime'],
  diarrhea: ['Loperamide', 'Ondansetron', 'Domperidone'],
  vomiting: ['Domperidone', 'Ondansetron'],
  nausea: ['Domperidone', 'Ondansetron'],
  anxiety: ['Alprazolam', 'Hydroxyzine', 'Escitalopram'],
  depression: ['Escitalopram', 'Amitriptyline'],
  'muscle pain': ['Thiocolchicoside', 'Chlorzoxazone', 'Tizanidine', 'Diclofenac'],
  'back pain': ['Thiocolchicoside', 'Tizanidine', 'Diclofenac', 'Aceclofenac'],
  migraine: ['Sumatriptan', 'Paracetamol', 'Ibuprofen', 'Naproxen'],
  asthma: ['Salbutamol', 'Budesonide', 'Montelukast', 'Theophylline'],
  cholesterol: ['Atorvastatin', 'Rosuvastatin'],
  'joint pain': ['Diclofenac', 'Aceclofenac', 'Etoricoxib', 'Ibuprofen'],
  'stomach pain': ['Omeprazole', 'Pantoprazole', 'Domperidone', 'Rabeprazole'],
  'skin infection': ['Clotrimazole', 'Mupirocin', 'Betamethasone'],
  acne: ['Adapalene', 'Doxycycline', 'Clotrimazole'],
  dandruff: ['Ketoconazole'],
  'dry eyes': ['Artificial Tears', 'Olopatadine'],
  'eye infection': ['Tobramycin', 'Moxifloxacin'],
  'vitamin deficiency': ['Multivitamin', 'Vitamin B Complex', 'Vitamin C', 'Vitamin D3'],
  weakness: ['Multivitamin', 'Vitamin B Complex', 'Iron'],
  anemia: ['Iron', 'Folic Acid'],
  thyroid: ['Levothyroxine'],
  toothache: ['Ibuprofen', 'Paracetamol', 'Combiflam', 'Diclofenac'],
  scabies: ['Permethrin'],
};

// ── Distance calculator (km) ──────────────────────────────────────
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Simulated online prices ───────────────────────────────────────
function generateOnlinePrices(basePrice) {
  const platforms = [
    { name: '1mg', discount: 0.12 + Math.random() * 0.06, delivery: '1-2 days', icon: '💊' },
    { name: 'PharmEasy', discount: 0.10 + Math.random() * 0.08, delivery: '1-3 days', icon: '🏥' },
    { name: 'Netmeds', discount: 0.08 + Math.random() * 0.07, delivery: '2-3 days', icon: '💉' },
    { name: 'Apollo Pharmacy', discount: 0.05 + Math.random() * 0.05, delivery: '1-2 days', icon: '🏪' },
    { name: 'Amazon Health', discount: 0.06 + Math.random() * 0.06, delivery: '2-4 days', icon: '📦' },
  ];

  return platforms.map((p) => {
    const price = Math.round(basePrice * (1 - p.discount));
    return {
      platform: p.name,
      price,
      delivery: p.delivery,
      icon: p.icon,
      discount: Math.round(p.discount * 100),
      url: `https://www.${p.name.toLowerCase().replace(/\s+/g, '')}.com`,
    };
  }).sort((a, b) => a.price - b.price);
}

// ── Check if query is a symptom ───────────────────────────────────
function isSymptom(query) {
  const q = query.toLowerCase().trim();
  return symptomMap[q] || null;
}

// ── Find closest alternative medicine names ───────────────────────
function findAlternativeNames(query) {
  const commonMedicines = [
    'Paracetamol', 'Amoxicillin', 'Azithromycin', 'Cetirizine',
    'Metformin', 'Omeprazole', 'Ibuprofen', 'Amlodipine',
    'Pantoprazole', 'Atorvastatin', 'Vitamin D3', 'Vitamin B Complex',
  ];
  const q = query.toLowerCase();
  return commonMedicines
    .filter((m) => {
      const ml = m.toLowerCase();
      // Simple fuzzy: shares at least 3 chars in sequence
      for (let i = 0; i <= q.length - 3; i++) {
        if (ml.includes(q.substring(i, i + 3))) return true;
      }
      return false;
    })
    .slice(0, 3);
}

// ── Main smart search endpoint ────────────────────────────────────
// @GET /api/smart-search?q=<name|symptom>&lat=&lng=
exports.smartSearch = async (req, res) => {
  try {
    const { q, lat, lng } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide a medicine name or symptom' });
    }

    const query = q.trim();
    let isSymptomSearch = false;
    let symptomMedicineNames = null;

    // Check if it's a symptom search
    symptomMedicineNames = isSymptom(query);
    if (symptomMedicineNames) {
      isSymptomSearch = true;
    }

    // Build medicine search query
    let medicines;
    if (isSymptomSearch) {
      // Search for medicines matching symptom-mapped names
      const regexPatterns = symptomMedicineNames.map((name) => new RegExp(name, 'i'));
      medicines = await Medicine.find({
        isActive: true,
        $or: regexPatterns.map((rx) => ({ name: { $regex: rx } })),
      })
        .populate('category', 'name')
        .populate('substitutes', 'name brand strength dosageForm manufacturer composition requiresPrescription')
        .limit(5);
    } else {
      // Text search by medicine name/brand/composition
      medicines = await Medicine.find({
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { brand: { $regex: query, $options: 'i' } },
          { composition: { $regex: query, $options: 'i' } },
        ],
      })
        .populate('category', 'name')
        .populate('substitutes', 'name brand strength dosageForm manufacturer composition requiresPrescription')
        .sort({ searchCount: -1 })
        .limit(5);
    }

    // If no medicines found
    if (!medicines || medicines.length === 0) {
      const alternatives = findAlternativeNames(query);
      return res.json({
        success: true,
        found: false,
        query,
        message: `No medicines found for "${query}".`,
        alternatives,
        isSymptomSearch,
      });
    }

    // Increment search count for top result
    if (!isSymptomSearch && medicines[0]) {
      await Medicine.updateOne({ _id: medicines[0]._id }, { $inc: { searchCount: 1 } });
    }

    // Build detailed results for each found medicine
    const results = [];

    for (const medicine of medicines) {
      // Get all inventory for this medicine
      const inventory = await Inventory.find({
        medicine: medicine._id,
        isAvailable: true,
        stock: { $gt: 0 },
      }).populate({
        path: 'pharmacy',
        select: 'name address location timings isOpen24Hours phone rating isVerified totalRatings',
        match: { isActive: true, isVerified: true },
      });

      const validInventory = inventory.filter((item) => item.pharmacy);

      // Calculate distances if lat/lng provided
      const stores = validInventory
        .map((item) => {
          let distance = null;
          if (lat && lng && item.pharmacy.location?.coordinates) {
            const [pLng, pLat] = item.pharmacy.location.coordinates;
            distance = getDistanceKm(parseFloat(lat), parseFloat(lng), pLat, pLng);
          }

          // Check if currently open
          let isOpen = item.pharmacy.isOpen24Hours;
          if (!isOpen && item.pharmacy.timings) {
            const now = new Date();
            const [oh, om] = item.pharmacy.timings.open.split(':').map(Number);
            const [ch, cm] = item.pharmacy.timings.close.split(':').map(Number);
            const cur = now.getHours() * 60 + now.getMinutes();
            isOpen = cur >= oh * 60 + om && cur <= ch * 60 + cm;
          }

          return {
            pharmacyId: item.pharmacy._id,
            name: item.pharmacy.name,
            address: `${item.pharmacy.address?.street || ''}, ${item.pharmacy.address?.city || ''}`,
            phone: item.pharmacy.phone,
            price: item.price,
            stock: item.stock,
            distance: distance !== null ? Math.round(distance * 10) / 10 : null,
            isOpen,
            rating: item.pharmacy.rating,
            isVerified: item.pharmacy.isVerified,
            timings: item.pharmacy.timings,
            coordinates: item.pharmacy.location?.coordinates || null,
            mapsUrl: item.pharmacy.location?.coordinates
              ? `https://www.google.com/maps/dir/?api=1&destination=${item.pharmacy.location.coordinates[1]},${item.pharmacy.location.coordinates[0]}`
              : null,
          };
        })
        .sort((a, b) => {
          // Prioritize stores under 3km if user has location
          if (a.distance !== null && b.distance !== null) {
            const aUnder3 = a.distance <= 3;
            const bUnder3 = b.distance <= 3;
            if (aUnder3 && !bUnder3) return -1;
            if (!aUnder3 && bUnder3) return 1;
          }
          return a.price - b.price;
        });

      // Price stats
      const prices = stores.map((s) => s.price);
      const cheapestStore = stores.length > 0 ? stores.reduce((min, s) => (s.price < min.price ? s : min), stores[0]) : null;

      // Generate online prices based on average pharmacy price or a default MRP
      const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
      const mrp = avgPrice > 0 ? Math.round(avgPrice * 1.15) : 0; // Simulate MRP as ~15% above avg
      const onlinePrices = mrp > 0 ? generateOnlinePrices(mrp) : [];

      // Find best deal overall (pharmacy vs online)
      let bestDeal = null;
      if (cheapestStore && onlinePrices.length > 0) {
        const cheapestOnline = onlinePrices[0];
        if (cheapestOnline.price < cheapestStore.price) {
          bestDeal = {
            type: 'online',
            platform: cheapestOnline.platform,
            price: cheapestOnline.price,
            delivery: cheapestOnline.delivery,
            savings: cheapestStore.price - cheapestOnline.price,
          };
        } else {
          bestDeal = {
            type: 'store',
            platform: cheapestStore.name,
            price: cheapestStore.price,
            delivery: cheapestStore.isOpen ? 'Available now' : 'When store opens',
            savings: onlinePrices.length > 0 ? onlinePrices[onlinePrices.length - 1].price - cheapestStore.price : 0,
          };
        }
      } else if (cheapestStore) {
        bestDeal = {
          type: 'store',
          platform: cheapestStore.name,
          price: cheapestStore.price,
          delivery: cheapestStore.isOpen ? 'Available now' : 'When store opens',
          savings: 0,
        };
      } else if (onlinePrices.length > 0) {
        bestDeal = {
          type: 'online',
          platform: onlinePrices[0].platform,
          price: onlinePrices[0].price,
          delivery: onlinePrices[0].delivery,
          savings: 0,
        };
      }

      // Generic/substitute recommendation
      let genericRecommendation = null;
      if (medicine.substitutes && medicine.substitutes.length > 0) {
        // Check if any substitute has a lower price
        for (const sub of medicine.substitutes) {
          const subInventory = await Inventory.find({
            medicine: sub._id,
            isAvailable: true,
            stock: { $gt: 0 },
          }).limit(1);

          if (subInventory.length > 0) {
            const subPrice = subInventory[0].price;
            if (cheapestStore && subPrice < cheapestStore.price) {
              genericRecommendation = {
                name: sub.name,
                brand: sub.brand,
                strength: sub.strength,
                composition: sub.composition,
                price: subPrice,
                savings: cheapestStore.price - subPrice,
                medicineId: sub._id,
              };
              break;
            }
          }
        }
      }

      results.push({
        medicine: {
          _id: medicine._id,
          name: medicine.name,
          brand: medicine.brand,
          composition: medicine.composition,
          dosageForm: medicine.dosageForm,
          strength: medicine.strength,
          manufacturer: medicine.manufacturer,
          requiresPrescription: medicine.requiresPrescription,
          category: medicine.category?.name || 'General',
          description: medicine.description,
          uses: medicine.uses,
          sideEffects: medicine.sideEffects,
        },
        nearbyStores: stores.slice(0, 5), // Top 5 stores
        onlinePrices,
        bestDeal,
        genericRecommendation,
        stats: {
          totalStores: stores.length,
          lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
          highestPrice: prices.length > 0 ? Math.max(...prices) : null,
          averagePrice: prices.length > 0 ? Math.round(avgPrice) : null,
          mrp,
        },
      });
    }

    res.json({
      success: true,
      found: true,
      query,
      isSymptomSearch,
      symptom: isSymptomSearch ? query : null,
      resultCount: results.length,
      results,
    });
  } catch (err) {
    console.error('Smart search error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

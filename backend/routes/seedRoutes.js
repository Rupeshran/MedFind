const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Category = require('../models/Category');
const Inventory = require('../models/Inventory');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const Order = require('../models/Order');

const { categories: catData, medicineData, users: userData, pharmacies: pharmaData } = require('../utils/seedData');

// @POST /api/seed — Seed the production database
// Protected by a simple secret to prevent abuse
router.post('/', async (req, res) => {
  try {
    const { secret } = req.body;
    
    // Simple protection — must provide the correct secret
    if (secret !== (process.env.SEED_SECRET || 'medfind_seed_2024')) {
      return res.status(403).json({ success: false, message: 'Invalid seed secret' });
    }

    // Check if already seeded
    const existingMeds = await Medicine.countDocuments();
    if (existingMeds > 0) {
      return res.json({ 
        success: true, 
        message: `Database already has ${existingMeds} medicines. Use force=true to re-seed.`,
        alreadySeeded: true,
        counts: {
          medicines: existingMeds,
          pharmacies: await Pharmacy.countDocuments(),
          users: await User.countDocuments(),
          categories: await Category.countDocuments(),
          inventory: await Inventory.countDocuments(),
        }
      });
    }

    console.log('🌱 Starting database seed...');

    // Clear all
    await Promise.all([
      User.deleteMany(), Pharmacy.deleteMany(), Medicine.deleteMany(),
      Category.deleteMany(), Inventory.deleteMany(), Reservation.deleteMany(),
      Notification.deleteMany(), Order.deleteMany(),
    ]);

    // ── Categories
    const categories = await Category.insertMany(catData);
    console.log(`✅ ${categories.length} Categories seeded`);

    // ── Users
    const hashedPass = await bcrypt.hash('password123', 12);
    const users = [];
    for (const u of userData) {
      const user = await User.create({ ...u, password: hashedPass, isActive: true });
      users.push(user);
    }
    console.log(`✅ ${users.length} Users seeded`);

    // ── Pharmacies
    const pharmacies = [];
    for (const p of pharmaData) {
      const pharmacy = await Pharmacy.create({
        owner: users[p.ownerIdx]._id,
        name: p.name,
        registrationNumber: p.regNo,
        email: p.email,
        phone: p.phone,
        address: p.address,
        location: { type: 'Point', coordinates: p.coords },
        timings: p.timings,
        isOpen24Hours: p.is24h,
        isVerified: p.verified,
        rating: p.rating,
        totalRatings: p.totalRatings,
        description: p.desc,
      });
      pharmacies.push(pharmacy);
    }
    console.log(`✅ ${pharmacies.length} Pharmacies seeded`);

    // ── Medicines
    const medicines = [];
    for (const m of medicineData) {
      const med = await Medicine.create({
        name: m[0], brand: m[1], composition: m[2],
        category: categories[m[3]]._id,
        dosageForm: m[4], strength: m[5], manufacturer: m[6],
        requiresPrescription: m[7], description: m[8],
        uses: m[9], sideEffects: m[10], precautions: m[11],
        searchCount: m[12],
      });
      medicines.push(med);
    }

    // Set substitutes
    const substitutePairs = [
      [0, 1], [2, 5], [3, 7], [8, 9], [10, 15], [11, 12],
      [16, 17], [24, 25], [26, 29], [31, 32], [33, 35],
      [34, 36], [39, 40], [45, 39], [47, 48], [49, 47],
      [53, 54], [31, 37],
    ];
    for (const [a, b] of substitutePairs) {
      if (medicines[a] && medicines[b]) {
        await Medicine.findByIdAndUpdate(medicines[a]._id, { $addToSet: { substitutes: medicines[b]._id } });
        await Medicine.findByIdAndUpdate(medicines[b]._id, { $addToSet: { substitutes: medicines[a]._id } });
      }
    }
    console.log(`✅ ${medicines.length} Medicines seeded with substitutes`);

    // ── Inventory
    const inventoryItems = [];
    const baseYear = 2027;

    for (let pIdx = 0; pIdx < pharmacies.length; pIdx++) {
      const stockRatio = 0.4 + Math.random() * 0.4;
      const medCount = Math.floor(medicines.length * stockRatio);
      const shuffled = [...medicines].sort(() => Math.random() - 0.5).slice(0, medCount);

      for (const med of shuffled) {
        const basePrices = {
          'Tablet': 35, 'Capsule': 45, 'Syrup': 85, 'Injection': 250,
          'Cream': 95, 'Drops': 120, 'Inhaler': 180, 'Other': 150,
        };
        const basePrice = basePrices[med.dosageForm] || 50;
        const variance = 0.7 + Math.random() * 0.6;
        const price = Math.round(basePrice * variance);
        const stock = Math.floor(Math.random() * 200) + 5;
        const month = Math.floor(Math.random() * 12) + 1;
        const expiryDate = new Date(`${baseYear}-${String(month).padStart(2, '0')}-01`);

        inventoryItems.push({
          pharmacy: pharmacies[pIdx]._id,
          medicine: med._id,
          stock, price, expiryDate,
          lowStockThreshold: 10,
          isAvailable: true,
        });
      }
    }

    await Inventory.insertMany(inventoryItems);
    console.log(`✅ ${inventoryItems.length} Inventory items seeded`);

    // ── Sample Reservations
    const regularUsers = users.filter(u => u.role === 'user');
    if (regularUsers.length >= 4 && medicines.length > 47) {
      await Reservation.insertMany([
        { user: regularUsers[0]._id, pharmacy: pharmacies[0]._id, medicine: medicines[8]._id, quantity: 2, totalPrice: 44, status: 'completed', reservationId: 'MF10000001AA', completedAt: new Date() },
        { user: regularUsers[0]._id, pharmacy: pharmacies[0]._id, medicine: medicines[24]._id, quantity: 1, totalPrice: 60, status: 'confirmed', requiresPrescription: true, reservationId: 'MF10000002BB' },
        { user: regularUsers[1]._id, pharmacy: pharmacies[1]._id, medicine: medicines[47]._id, quantity: 3, totalPrice: 114, status: 'pending', reservationId: 'MF10000003CC' },
        { user: regularUsers[2]._id, pharmacy: pharmacies[3]._id, medicine: medicines[16]._id, quantity: 1, totalPrice: 120, status: 'completed', reservationId: 'MF10000004DD', completedAt: new Date() },
        { user: regularUsers[3]._id, pharmacy: pharmacies[4]._id, medicine: medicines[31]._id, quantity: 2, totalPrice: 220, status: 'pending', requiresPrescription: true, reservationId: 'MF10000005EE' },
      ]);
    }

    // ── Notifications
    await Notification.insertMany([
      { user: regularUsers[0]?._id || users[0]._id, title: 'Reservation Confirmed', message: 'Your reservation for Metformin 500mg has been confirmed.', type: 'reservation', isRead: false },
      { user: users[1]._id, title: 'New Reservation Request', message: 'A user has placed a reservation for Paracetamol 650mg.', type: 'reservation', isRead: false },
      { user: users[0]._id, title: 'New Pharmacy Registration', message: 'HealthFirst Pharmacy has registered and is pending verification.', type: 'pharmacy', isRead: false },
    ]);

    console.log('🎉 Seed complete!');

    res.json({
      success: true,
      message: 'Database seeded successfully!',
      counts: {
        categories: categories.length,
        users: users.length,
        pharmacies: pharmacies.length,
        medicines: medicines.length,
        inventory: inventoryItems.length,
      }
    });

  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// @GET /api/seed/status — Check if database has data
router.get('/status', async (req, res) => {
  try {
    const counts = {
      medicines: await Medicine.countDocuments(),
      pharmacies: await Pharmacy.countDocuments(),
      users: await User.countDocuments(),
      categories: await Category.countDocuments(),
      inventory: await Inventory.countDocuments(),
    };
    res.json({ success: true, seeded: counts.medicines > 0, counts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

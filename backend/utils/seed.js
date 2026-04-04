require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const Category = require('../models/Category');
const Inventory = require('../models/Inventory');
const Reservation = require('../models/Reservation');
const Notification = require('../models/Notification');
const Order = require('../models/Order');

const { categories: catData, medicineData, users: userData, pharmacies: pharmaData } = require('./seedData');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear all
  await Promise.all([
    User.deleteMany(), Pharmacy.deleteMany(), Medicine.deleteMany(),
    Category.deleteMany(), Inventory.deleteMany(), Reservation.deleteMany(),
    Notification.deleteMany(), Order.deleteMany(),
  ]);
  console.log('Cleared existing data');

  // ── Categories ───────────────────────────────────────────────────
  const categories = await Category.insertMany(catData);
  console.log(`✅ ${categories.length} Categories seeded`);

  // ── Users ────────────────────────────────────────────────────────
  const users = [];

 for (const u of userData) {
  const user = await User.create({
    ...u,
    password: "password123",
    isActive: true,
  });

  users.push(user);
 }

console.log(`✅ ${users.length} Users seeded`);
  

  // ── Pharmacies ───────────────────────────────────────────────────
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

  // ── Medicines ────────────────────────────────────────────────────
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

  // Set substitutes (group medicines by category and link similar ones)
  const substitutePairs = [
    [0, 1],   // Amoxicillin <-> Azithromycin (antibiotics)
    [2, 5],   // Ciprofloxacin <-> Levofloxacin
    [3, 7],   // Cefixime <-> Augmentin
    [8, 9],   // Dolo 650 <-> Crocin (paracetamol)
    [10, 15], // Ibuprofen <-> Combiflam
    [11, 12], // Diclofenac <-> Aceclofenac
    [16, 17], // Vitamin D3 <-> Shelcal
    [24, 25], // Metformin 500 <-> Metformin 1000
    [26, 29], // Glimepiride <-> Gliclazide
    [31, 32], // Atorvastatin <-> Rosuvastatin (stat substitutes grouped later)
    [33, 35], // Amlodipine <-> Telmisartan-ish (both antihypertensives)
    [34, 36], // Losartan <-> Atenolol
    [39, 40], // Omeprazole <-> Pantoprazole
    [45, 39], // Rabeprazole <-> Omeprazole
    [47, 48], // Cetirizine <-> Levocetirizine
    [49, 47], // Fexofenadine <-> Cetirizine
    [53, 54], // Salbutamol <-> Budesonide (complementary)
    [31, 37], // Atorvastatin <-> Rosuvastatin
  ];
  for (const [a, b] of substitutePairs) {
    if (medicines[a] && medicines[b]) {
      await Medicine.findByIdAndUpdate(medicines[a]._id, { $addToSet: { substitutes: medicines[b]._id } });
      await Medicine.findByIdAndUpdate(medicines[b]._id, { $addToSet: { substitutes: medicines[a]._id } });
    }
  }
  console.log(`✅ ${medicines.length} Medicines seeded with substitutes`);

  // ── Inventory ────────────────────────────────────────────────────
  // Each pharmacy gets a random subset of medicines with varied pricing
  const inventoryItems = [];
  const baseYear = 2027;

  for (let pIdx = 0; pIdx < pharmacies.length; pIdx++) {
    // Each pharmacy stocks 40-80% of medicines
    const stockRatio = 0.4 + Math.random() * 0.4;
    const medCount = Math.floor(medicines.length * stockRatio);
    
    // Shuffle and pick
    const shuffled = [...medicines].sort(() => Math.random() - 0.5).slice(0, medCount);
    
    for (const med of shuffled) {
      // Base price varies by pharmacy (±15-30%)
      const basePrices = {
        'Tablet': 35, 'Capsule': 45, 'Syrup': 85, 'Injection': 250,
        'Cream': 95, 'Drops': 120, 'Inhaler': 180, 'Other': 150,
      };
      const basePrice = basePrices[med.dosageForm] || 50;
      const variance = 0.7 + Math.random() * 0.6; // 0.7 to 1.3x
      const price = Math.round(basePrice * variance);
      
      const stock = Math.floor(Math.random() * 200) + 5;
      const month = Math.floor(Math.random() * 12) + 1;
      const expiryDate = new Date(`${baseYear}-${String(month).padStart(2, '0')}-01`);

      inventoryItems.push({
        pharmacy: pharmacies[pIdx]._id,
        medicine: med._id,
        stock,
        price,
        expiryDate,
        lowStockThreshold: 10,
        isAvailable: true,
      });
    }
  }

  await Inventory.insertMany(inventoryItems);
  console.log(`✅ ${inventoryItems.length} Inventory items seeded`);

  // ── Sample Reservations ──────────────────────────────────────────
  const regularUsers = users.filter(u => u.role === 'user');
  await Reservation.insertMany([
    { user: regularUsers[0]._id, pharmacy: pharmacies[0]._id, medicine: medicines[8]._id, quantity: 2, totalPrice: 44, status: 'completed', reservationId: 'MF10000001AA', completedAt: new Date() },
    { user: regularUsers[0]._id, pharmacy: pharmacies[0]._id, medicine: medicines[24]._id, quantity: 1, totalPrice: 60, status: 'confirmed', requiresPrescription: true, reservationId: 'MF10000002BB' },
    { user: regularUsers[1]._id, pharmacy: pharmacies[1]._id, medicine: medicines[47]._id, quantity: 3, totalPrice: 114, status: 'pending', reservationId: 'MF10000003CC' },
    { user: regularUsers[2]._id, pharmacy: pharmacies[3]._id, medicine: medicines[16]._id, quantity: 1, totalPrice: 120, status: 'completed', reservationId: 'MF10000004DD', completedAt: new Date() },
    { user: regularUsers[3]._id, pharmacy: pharmacies[4]._id, medicine: medicines[31]._id, quantity: 2, totalPrice: 220, status: 'pending', requiresPrescription: true, reservationId: 'MF10000005EE' },
  ]);

  // ── Notifications ────────────────────────────────────────────────
  await Notification.insertMany([
    { user: regularUsers[0]._id, title: 'Reservation Confirmed', message: 'Your reservation for Metformin 500mg has been confirmed by City Medical Store.', type: 'reservation', isRead: false },
    { user: users[1]._id, title: 'New Reservation Request', message: 'Anita Verma has placed a reservation for Paracetamol 650mg.', type: 'reservation', isRead: false },
    { user: users[0]._id, title: 'New Pharmacy Registration', message: 'HealthFirst Pharmacy has registered and is pending verification.', type: 'pharmacy', isRead: false },
  ]);

  console.log('\n✅ Seed complete!\n');
  console.log('──────────────────────────────────────────');
  console.log('Login credentials (password: password123)');
  console.log('──────────────────────────────────────────');
  console.log('Admin       : admin@medfind.com');
  console.log('Pharmacy 1  : rajesh@citymedical.com');
  console.log('Pharmacy 2  : priya@lifeline.com');
  console.log('Pharmacy 3  : suresh@wellness.com');
  console.log('Pharmacy 4  : meena@apollopharmacy.com');
  console.log('Pharmacy 5  : vikram@medplus.com');
  console.log('Pharmacy 6  : sunita@frank.com');
  console.log('Pharmacy 7  : anil@netmeds.com');
  console.log('Pharmacy 8  : kavita@guardian.com');
  console.log('Pharmacy 9  : ramesh@medicare.com');
  console.log('Pharmacy 10 : deepa@healthfirst.com');
  console.log('Pharmacy 11 : biplab@agartalamedical.com');
  console.log('Pharmacy 12 : ritu@tripurapharma.com');
  console.log('Pharmacy 13 : suman@lifelineagt.com');
  console.log('Pharmacy 14 : papiya@apolloagt.com');
  console.log('Pharmacy 15 : arun@medseva.com');
  console.log('User 1      : anita@gmail.com');
  console.log('User 2      : mohan@gmail.com');
  console.log('User 3      : sneha@gmail.com');
  console.log('User 4      : rohit@gmail.com');
  console.log('User 5      : divya@gmail.com');
  console.log('──────────────────────────────────────────');
  console.log(`Total: ${medicines.length} medicines, ${pharmacies.length} pharmacies, ${inventoryItems.length} inventory items`);

  mongoose.connection.close();
};

seed().catch((err) => { console.error(err); process.exit(1); });

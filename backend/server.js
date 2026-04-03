const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/prescriptions', 'uploads/avatars', 'uploads/licenses'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://med-find-one.vercel.app' // your frontend URL
  ],
  credentials: true
}));

// Stripe Webhook needs the raw body
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), require('./controllers/paymentController').stripeWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/pharmacies', require('./routes/pharmacyRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/compare', require('./routes/priceCompareRoutes'));
app.use('/api/smart-search', require('./routes/smartSearchRoutes'));

// ── New Feature Routes ──────────────────────────────────────────
app.use('/api/interactions', require('./routes/drugInteractionRoutes'));    // Feature 4: Drug Interactions
app.use('/api/health-profile', require('./routes/healthProfileRoutes'));    // Feature 11: Health Profile
app.use('/api/ocr', require('./routes/ocrRoutes'));                        // Feature 3: Prescription OCR
app.use('/api/verify', require('./routes/verificationRoutes'));            // Feature 12: Fake Medicine Detection
app.use('/api/expiry-tracker', require('./routes/expiryTrackerRoutes'));   // Feature 13: Expiry Tracker
app.use('/api/demand', require('./routes/demandRoutes'));                  // Feature 9: Demand Prediction
app.use('/api/chatbot', require('./routes/chatbotRoutes'));                // Feature 10: Chatbot
app.use('/api/payments', require('./routes/paymentRoutes'));               // Payment Gateway Integration
app.use('/api/reminders', require('./routes/reminderRoutes'));             // Medicine Intake Reminders
app.use('/api/seed', require('./routes/seedRoutes'));                      // Database Seeding (production)
// Features 1,2,5,6,7,8 already handled by existing routes (smart-search, inventory, orders, compare, pharmacies)

// Initialize Schedulers
const initReminderScheduler = require('./utils/reminderScheduler');
initReminderScheduler();

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'MedFind API is running', version: '2.0', features: 15 }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// DB + Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error('MongoDB error:', err));

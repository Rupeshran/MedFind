const mongoose = require('mongoose');
const crypto = require('crypto');

const inventorySchema = new mongoose.Schema(
  {
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    stock: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true },
    expiryDate: { type: Date },
    lowStockThreshold: { type: Number, default: 10 },
    isAvailable: { type: Boolean, default: true },
    lastUpdated: { type: Date, default: Date.now },
    // ── Fake Medicine Detection (Feature 12) ──
    batchNumber: { type: String, trim: true },
    verificationCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

inventorySchema.index({ pharmacy: 1, medicine: 1 }, { unique: true });

// Auto-generate verification code if batch number is set
inventorySchema.pre('save', function (next) {
  if (this.batchNumber && !this.verificationCode) {
    this.verificationCode = 'MF-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);

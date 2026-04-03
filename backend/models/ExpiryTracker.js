const mongoose = require('mongoose');

const expiryTrackerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    medicineName: { type: String, required: true, trim: true },
    brand: { type: String, trim: true },
    batchNumber: { type: String, trim: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: String },
    notes: { type: String },
    reminderDays: { type: [Number], default: [30, 7, 1] },
    notifiedAt: {
      day30: { type: Boolean, default: false },
      day7: { type: Boolean, default: false },
      day1: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

expiryTrackerSchema.index({ user: 1, expiryDate: 1 });

module.exports = mongoose.model('ExpiryTracker', expiryTrackerSchema);

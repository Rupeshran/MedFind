const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
    quantity: { type: Number, required: true, default: 1 },
    totalPrice: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'ready', 'completed', 'cancelled', 'rejected'],
      default: 'pending',
    },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    requiresPrescription: { type: Boolean, default: false },
    notes: { type: String },
    pharmacyNote: { type: String },
    reservationId: { type: String, unique: true },
    pickupDate: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Auto-generate reservation ID
reservationSchema.pre('save', function (next) {
  if (!this.reservationId) {
    this.reservationId = 'MF' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);

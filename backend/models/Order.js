const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pharmacy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pharmacy', required: true },
    items: [orderItemSchema],
    orderType: { type: String, enum: ['pickup', 'delivery'], required: true },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    totalAmount: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cod', 'online'], default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    stripeSessionId: { type: String },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'completed', 'cancelled'],
      default: 'placed',
    },
    notes: { type: String },
    pharmacyNote: { type: String },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
    requiresPrescription: { type: Boolean, default: false },
    estimatedTime: { type: String },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

// Auto-generate order ID
orderSchema.pre('save', function (next) {
  if (!this.orderId) {
    this.orderId = 'ORD' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

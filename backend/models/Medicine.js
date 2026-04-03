const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true },
    composition: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    description: { type: String },
    dosageForm: { type: String, enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Other'], default: 'Tablet' },
    strength: { type: String }, // e.g., "500mg"
    manufacturer: { type: String },
    requiresPrescription: { type: Boolean, default: false },
    image: { type: String },
    uses: [{ type: String }],
    sideEffects: [{ type: String }],
    precautions: { type: String },
    storageInstructions: { type: String, default: 'Store in a cool, dry place away from direct sunlight.' },
    substitutes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' }],
    searchCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    // ── Drug Interaction tags (Feature 4) ──
    interactionTags: [{ type: String, trim: true, lowercase: true }],
    // ── Contraindications for health profile filtering (Feature 11) ──
    contraindications: [{ type: String, trim: true }], // e.g., ["asthma", "kidney disease", "sulfa allergy"]
  },
  { timestamps: true }
);

medicineSchema.index({ name: 'text', brand: 'text', composition: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);

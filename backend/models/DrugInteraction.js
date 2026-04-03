const mongoose = require('mongoose');

const drugInteractionSchema = new mongoose.Schema(
  {
    drug1: { type: String, required: true, trim: true, lowercase: true },
    drug2: { type: String, required: true, trim: true, lowercase: true },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'contraindicated'],
      required: true,
    },
    description: { type: String, required: true },
    recommendation: { type: String, required: true },
    mechanism: { type: String },
    onsetTime: { type: String }, // e.g., "Immediate", "Hours", "Days"
  },
  { timestamps: true }
);

drugInteractionSchema.index({ drug1: 1, drug2: 1 });
drugInteractionSchema.index({ drug1: 'text', drug2: 'text' });

module.exports = mongoose.model('DrugInteraction', drugInteractionSchema);

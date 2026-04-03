const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema(
  {
    query: { type: String, required: true, trim: true, lowercase: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['medicine', 'symptom', 'chatbot'], default: 'medicine' },
    resultsCount: { type: Number, default: 0 },
    location: {
      lat: Number,
      lng: Number,
      city: String,
    },
  },
  { timestamps: true }
);

searchLogSchema.index({ query: 1, createdAt: -1 });
searchLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SearchLog', searchLogSchema);

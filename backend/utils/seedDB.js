// Seed script for Drug Interactions
// Run: node utils/seedDB.js

require('dotenv').config();
const mongoose = require('mongoose');
const DrugInteraction = require('../models/DrugInteraction');
const { interactions } = require('./seedInteractions');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Clear existing
    await DrugInteraction.deleteMany({});
    console.log('Cleared existing interactions');

    // Insert seed data
    const result = await DrugInteraction.insertMany(interactions);
    console.log(`Seeded ${result.length} drug interactions:`);
    console.log(`  - Contraindicated: ${result.filter(r => r.severity === 'contraindicated').length}`);
    console.log(`  - Severe: ${result.filter(r => r.severity === 'severe').length}`);
    console.log(`  - Moderate: ${result.filter(r => r.severity === 'moderate').length}`);
    console.log(`  - Mild: ${result.filter(r => r.severity === 'mild').length}`);

    await mongoose.disconnect();
    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();

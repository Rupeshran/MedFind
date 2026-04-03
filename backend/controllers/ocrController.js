const Medicine = require('../models/Medicine');
const path = require('path');
const fs = require('fs');

// Simple OCR simulation using pattern matching
// In production, you'd use Tesseract.js or a cloud OCR API
// For demo, we accept image upload and simulate OCR with a text fallback

// Common medicine name patterns for regex extraction
const MEDICINE_PATTERNS = [
  // Common Indian medicine names
  /\b(paracetamol|crocin|dolo|combiflam|ibuprofen|brufen|amoxicillin|azithromycin|cetirizine|metformin|omeprazole|pantoprazole|atorvastatin|amlodipine|losartan|telmisartan|diclofenac|aceclofenac|ciprofloxacin|levofloxacin|cefixime|doxycycline|metronidazole|ranitidine|domperidone|ondansetron|rabeprazole|montelukast|salbutamol|prednisolone|levothyroxine|gabapentin|pregabalin|escitalopram|alprazolam|vitamin\s*[a-z0-9]+|multivitamin|calcium|iron|folic\s*acid|zinc|omega)/gi,
  // Branded names
  /\b(glycomet|lipitor|norvasc|cozaar|telma|tenormin|crestor|plavix|ecosprin|omez|pantop|zinetac|domstal|emeset|zyrtec|xyzal|allegra|montair|avil|atarax|asthalin|budecort|benadryl|mucolite|candid|betnovate|nizral|tobrex|vigamox|refresh|pataday|thyronorm|eltroxin|wysolone|dexona|gabapin|lyrica|tryptomer|nexito|alprax|suminat|myoril|flexon|sirdalud|arcoxia|januvia|lantus|diamicron|shelcal|becosules|autrin|supradyn|maxepa|limcee|zincovit|augmentin)\b/gi,
  // Dosage patterns that might indicate medicine names nearby
  /(\w+)\s*\d+\s*(mg|mcg|ml|iu|g)\b/gi,
];

// @POST /api/ocr/scan
exports.scanPrescription = async (req, res) => {
  try {
    // Check if text was directly provided (for demo/testing)
    const { text: directText } = req.body;
    let extractedText = directText || '';

    // If an image was uploaded, we simulate OCR
    // In production: use Tesseract.js here
    if (req.file && !directText) {
      // Simulate OCR by using filename hints or returning demo data
      extractedText = `Simulated OCR from uploaded prescription image: ${req.file.originalname}. ` +
        'For demo purposes, please also send the medicine names as text in the request body.';
    }

    if (!extractedText && !req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a prescription image or provide text' });
    }

    // Extract medicine names from text
    const foundNames = new Set();

    for (const pattern of MEDICINE_PATTERNS) {
      const matches = extractedText.matchAll(pattern);
      for (const match of matches) {
        const name = match[1] || match[0];
        if (name && name.length > 2) {
          foundNames.add(name.trim());
        }
      }
    }

    // Also try splitting by common delimiters and checking against DB
    const words = extractedText.split(/[\n\r,;]+/).map(w => w.trim()).filter(w => w.length > 2);

    // Search database for each extracted name
    const matchedMedicines = [];
    const unmatchedNames = [];

    for (const name of foundNames) {
      const medicines = await Medicine.find({
        isActive: true,
        $or: [
          { name: { $regex: name, $options: 'i' } },
          { brand: { $regex: name, $options: 'i' } },
          { composition: { $regex: name, $options: 'i' } },
        ],
      })
        .select('name brand composition dosageForm strength requiresPrescription manufacturer')
        .limit(3);

      if (medicines.length > 0) {
        matchedMedicines.push({
          extractedName: name,
          confidence: medicines[0].name.toLowerCase().includes(name.toLowerCase()) ? 0.95 :
            medicines[0].brand.toLowerCase().includes(name.toLowerCase()) ? 0.90 : 0.75,
          matches: medicines,
        });
      } else {
        unmatchedNames.push(name);
      }
    }

    // Sort by confidence
    matchedMedicines.sort((a, b) => b.confidence - a.confidence);

    res.json({
      success: true,
      extractedText: extractedText.substring(0, 500),
      totalExtracted: foundNames.size,
      matched: matchedMedicines.length,
      unmatched: unmatchedNames.length,
      medicines: matchedMedicines,
      unmatchedNames,
      imageUploaded: !!req.file,
      imageUrl: req.file ? `/uploads/prescriptions/${req.file.filename}` : null,
    });
  } catch (err) {
    console.error('OCR scan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/ocr/extract-text
// Just extracts text from common prescription formats
exports.extractText = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Provide prescription text' });
    }

    const foundNames = new Set();
    for (const pattern of MEDICINE_PATTERNS) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const name = match[1] || match[0];
        if (name && name.length > 2) foundNames.add(name.trim());
      }
    }

    res.json({
      success: true,
      extractedMedicines: [...foundNames],
      count: foundNames.size,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

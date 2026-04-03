const DrugInteraction = require('../models/DrugInteraction');
const Medicine = require('../models/Medicine');

// Helper: normalize drug name for matching
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

// Helper: extract key composition words
function extractDrugNames(composition) {
  // Remove dosage info and common suffixes
  return composition
    .toLowerCase()
    .replace(/\d+\s*(mg|mcg|ml|iu|g|%|w\/w|w\/v)/gi, '')
    .replace(/(hydrochloride|sodium|potassium|calcium|sulphate|besylate|maleate|fumarate|hyclate|trihydrate|valerate)/gi, '')
    .split(/[\+,\/]/)
    .map(s => s.trim())
    .filter(s => s.length > 2);
}

// @POST /api/interactions/check
// Body: { medicineIds: [id1, id2, ...] } or { medicines: ["name1", "name2"] }
exports.checkInteractions = async (req, res) => {
  try {
    const { medicineIds, medicines: medicineNames } = req.body;

    let drugNames = [];

    if (medicineIds && medicineIds.length > 0) {
      // Fetch medicines by ID and extract compositions
      const meds = await Medicine.find({ _id: { $in: medicineIds } }).select('name composition interactionTags');
      for (const med of meds) {
        const names = extractDrugNames(med.composition);
        drugNames.push({
          id: med._id,
          name: med.name,
          composition: med.composition,
          searchTerms: [...names, ...(med.interactionTags || [])],
        });
      }
    } else if (medicineNames && medicineNames.length > 0) {
      // Search by name
      for (const name of medicineNames) {
        const med = await Medicine.findOne({
          $or: [
            { name: { $regex: name, $options: 'i' } },
            { composition: { $regex: name, $options: 'i' } },
          ],
        }).select('name composition interactionTags');
        if (med) {
          const names = extractDrugNames(med.composition);
          drugNames.push({
            id: med._id,
            name: med.name,
            composition: med.composition,
            searchTerms: [...names, ...(med.interactionTags || [])],
          });
        } else {
          drugNames.push({
            id: null,
            name: name,
            composition: name,
            searchTerms: [name.toLowerCase()],
          });
        }
      }
    } else {
      return res.status(400).json({ success: false, message: 'Provide medicineIds or medicines array' });
    }

    if (drugNames.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 medicines required to check interactions' });
    }

    // Check all pairs
    const interactions = [];
    const allDbInteractions = await DrugInteraction.find({});

    for (let i = 0; i < drugNames.length; i++) {
      for (let j = i + 1; j < drugNames.length; j++) {
        const drug1Terms = drugNames[i].searchTerms;
        const drug2Terms = drugNames[j].searchTerms;

        for (const interaction of allDbInteractions) {
          const d1 = interaction.drug1;
          const d2 = interaction.drug2;

          const match1to1 = drug1Terms.some(t => d1.includes(t) || t.includes(d1));
          const match2to2 = drug2Terms.some(t => d2.includes(t) || t.includes(d2));
          const match1to2 = drug1Terms.some(t => d2.includes(t) || t.includes(d2));
          const match2to1 = drug2Terms.some(t => d1.includes(t) || t.includes(d1));

          if ((match1to1 && match2to2) || (match1to2 && match2to1)) {
            interactions.push({
              medicine1: { name: drugNames[i].name, composition: drugNames[i].composition },
              medicine2: { name: drugNames[j].name, composition: drugNames[j].composition },
              severity: interaction.severity,
              description: interaction.description,
              recommendation: interaction.recommendation,
              mechanism: interaction.mechanism,
              onsetTime: interaction.onsetTime,
            });
          }
        }
      }
    }

    // Sort by severity (most dangerous first)
    const severityOrder = { contraindicated: 0, severe: 1, moderate: 2, mild: 3 };
    interactions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Summary
    const summary = {
      totalChecked: drugNames.length,
      pairsChecked: (drugNames.length * (drugNames.length - 1)) / 2,
      interactionsFound: interactions.length,
      contraindicated: interactions.filter(i => i.severity === 'contraindicated').length,
      severe: interactions.filter(i => i.severity === 'severe').length,
      moderate: interactions.filter(i => i.severity === 'moderate').length,
      mild: interactions.filter(i => i.severity === 'mild').length,
      overallSafety: interactions.length === 0 ? 'safe' :
        interactions.some(i => i.severity === 'contraindicated') ? 'dangerous' :
        interactions.some(i => i.severity === 'severe') ? 'risky' :
        interactions.some(i => i.severity === 'moderate') ? 'caution' : 'generally_safe',
    };

    res.json({
      success: true,
      medicines: drugNames.map(d => ({ name: d.name, composition: d.composition })),
      summary,
      interactions,
      disclaimer: '⚠️ This is for educational purposes only. Always consult a healthcare professional before combining medications.',
    });
  } catch (err) {
    console.error('Drug interaction error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/interactions/search?q=aspirin
exports.searchInteractions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Provide search query' });

    const query = q.toLowerCase().trim();
    const interactions = await DrugInteraction.find({
      $or: [
        { drug1: { $regex: query, $options: 'i' } },
        { drug2: { $regex: query, $options: 'i' } },
      ],
    }).sort({ severity: 1 });

    res.json({ success: true, data: interactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

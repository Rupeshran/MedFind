const User = require('../models/User');
const Medicine = require('../models/Medicine');

// @GET /api/health-profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('healthProfile preferredLanguage');
    res.json({ success: true, data: user.healthProfile || {}, language: user.preferredLanguage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/health-profile
exports.updateProfile = async (req, res) => {
  try {
    const { allergies, conditions, bloodGroup, currentMedications, emergencyContact, dateOfBirth, gender, weight, height } = req.body;

    const updateData = {};
    if (allergies !== undefined) updateData['healthProfile.allergies'] = allergies;
    if (conditions !== undefined) updateData['healthProfile.conditions'] = conditions;
    if (bloodGroup !== undefined) updateData['healthProfile.bloodGroup'] = bloodGroup;
    if (currentMedications !== undefined) updateData['healthProfile.currentMedications'] = currentMedications;
    if (emergencyContact !== undefined) updateData['healthProfile.emergencyContact'] = emergencyContact;
    if (dateOfBirth !== undefined) updateData['healthProfile.dateOfBirth'] = dateOfBirth;
    if (gender !== undefined) updateData['healthProfile.gender'] = gender;
    if (weight !== undefined) updateData['healthProfile.weight'] = weight;
    if (height !== undefined) updateData['healthProfile.height'] = height;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updateData }, { new: true }).select('healthProfile');

    res.json({ success: true, data: user.healthProfile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/health-profile/check-safety
// Body: { medicineId } or { medicineName }
exports.checkSafety = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('healthProfile');
    const profile = user.healthProfile || {};
    const { medicineId, medicineName } = req.body;

    let medicine;
    if (medicineId) {
      medicine = await Medicine.findById(medicineId);
    } else if (medicineName) {
      medicine = await Medicine.findOne({
        $or: [
          { name: { $regex: medicineName, $options: 'i' } },
          { composition: { $regex: medicineName, $options: 'i' } },
        ],
      });
    }

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    const warnings = [];
    const isSafe = { overall: true, allergies: true, conditions: true, medications: true };

    // Check allergies against medicine composition and side effects
    if (profile.allergies && profile.allergies.length > 0) {
      for (const allergy of profile.allergies) {
        const allergyLower = allergy.toLowerCase();
        const compLower = medicine.composition.toLowerCase();
        const nameLower = medicine.name.toLowerCase();

        if (compLower.includes(allergyLower) || nameLower.includes(allergyLower)) {
          warnings.push({
            type: 'allergy',
            severity: 'high',
            message: `You have a known allergy to "${allergy}". This medicine contains ${medicine.composition}.`,
            icon: '🚨',
          });
          isSafe.allergies = false;
          isSafe.overall = false;
        }

        // Check common cross-allergies
        const crossAllergyMap = {
          'penicillin': ['amoxicillin', 'ampicillin', 'augmentin'],
          'sulfa': ['sulfamethoxazole', 'sulfasalazine'],
          'aspirin': ['ibuprofen', 'diclofenac', 'naproxen'],
          'nsaid': ['ibuprofen', 'diclofenac', 'naproxen', 'aspirin', 'aceclofenac'],
        };

        if (crossAllergyMap[allergyLower]) {
          for (const cross of crossAllergyMap[allergyLower]) {
            if (compLower.includes(cross) || nameLower.includes(cross)) {
              warnings.push({
                type: 'cross_allergy',
                severity: 'high',
                message: `You're allergic to "${allergy}". This medicine (${medicine.name}) may cause cross-allergic reaction.`,
                icon: '⚠️',
              });
              isSafe.allergies = false;
              isSafe.overall = false;
            }
          }
        }
      }
    }

    // Check conditions against contraindications
    if (profile.conditions && profile.conditions.length > 0 && medicine.contraindications) {
      for (const condition of profile.conditions) {
        const condLower = condition.toLowerCase();
        for (const contra of medicine.contraindications) {
          if (contra.toLowerCase().includes(condLower) || condLower.includes(contra.toLowerCase())) {
            warnings.push({
              type: 'condition',
              severity: 'medium',
              message: `You have "${condition}". This medicine may not be suitable for your condition.`,
              icon: '⚠️',
            });
            isSafe.conditions = false;
            isSafe.overall = false;
          }
        }
      }

      // Common condition-medicine conflicts
      const conditionConflicts = {
        'asthma': ['aspirin', 'ibuprofen', 'diclofenac', 'naproxen', 'atenolol', 'propranolol'],
        'kidney disease': ['ibuprofen', 'diclofenac', 'naproxen', 'metformin', 'lithium'],
        'liver disease': ['paracetamol', 'methotrexate', 'atorvastatin'],
        'peptic ulcer': ['aspirin', 'ibuprofen', 'diclofenac', 'naproxen', 'prednisolone'],
        'diabetes': ['prednisolone', 'dexamethasone', 'thiazide'],
        'pregnancy': ['methotrexate', 'warfarin', 'atorvastatin', 'losartan', 'isotretinoin'],
        'glaucoma': ['atropine', 'ipratropium'],
      };

      for (const condition of profile.conditions) {
        const condLower = condition.toLowerCase();
        if (conditionConflicts[condLower]) {
          for (const conflict of conditionConflicts[condLower]) {
            if (medicine.composition.toLowerCase().includes(conflict) || medicine.name.toLowerCase().includes(conflict)) {
              warnings.push({
                type: 'condition_conflict',
                severity: 'medium',
                message: `"${medicine.name}" may worsen your "${condition}". Consult your doctor.`,
                icon: '⚠️',
              });
              isSafe.conditions = false;
              isSafe.overall = false;
            }
          }
        }
      }
    }

    // Check current medications for duplicates
    if (profile.currentMedications && profile.currentMedications.length > 0) {
      for (const med of profile.currentMedications) {
        const medLower = med.toLowerCase();
        if (medicine.name.toLowerCase().includes(medLower) || medicine.composition.toLowerCase().includes(medLower)) {
          warnings.push({
            type: 'duplicate',
            severity: 'medium',
            message: `You're already taking "${med}". This could be a duplicate medication.`,
            icon: '💊',
          });
          isSafe.medications = false;
        }
      }
    }

    res.json({
      success: true,
      medicine: { name: medicine.name, composition: medicine.composition, brand: medicine.brand },
      isSafe,
      warnings,
      warningCount: warnings.length,
      disclaimer: 'This safety check is for guidance only. Always consult your doctor or pharmacist.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

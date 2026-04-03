const express = require('express');
const router = express.Router();
const {
  registerPharmacy, getPharmacies, getPharmacy,
  updatePharmacy, getMyPharmacy
} = require('../controllers/pharmacyController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getPharmacies);
router.get('/my/dashboard', protect, authorize('pharmacy'), getMyPharmacy);
router.get('/:id', getPharmacy);
router.post('/register', protect, authorize('pharmacy'), registerPharmacy);
router.put('/:id', protect, authorize('pharmacy'), updatePharmacy);

module.exports = router;

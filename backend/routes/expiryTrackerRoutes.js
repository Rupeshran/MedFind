const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTrackedMedicines, addMedicine, updateMedicine, removeMedicine, getAlerts } = require('../controllers/expiryTrackerController');

router.get('/', protect, getTrackedMedicines);
router.post('/', protect, addMedicine);
router.put('/:id', protect, updateMedicine);
router.delete('/:id', protect, removeMedicine);
router.get('/alerts', protect, getAlerts);

module.exports = router;

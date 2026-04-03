const express = require('express');
const router = express.Router();
const {
  getMedicines, getMedicine, getNearbyAvailability,
  createMedicine, updateMedicine, deleteMedicine
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getMedicines);
router.get('/nearby', getNearbyAvailability);
router.get('/:id', getMedicine);
router.post('/', protect, authorize('admin'), createMedicine);
router.put('/:id', protect, authorize('admin'), updateMedicine);
router.delete('/:id', protect, authorize('admin'), deleteMedicine);

module.exports = router;

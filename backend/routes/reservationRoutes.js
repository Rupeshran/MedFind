const express = require('express');
const router = express.Router();
const {
  createReservation, getUserReservations, getPharmacyReservations,
  updateReservationStatus, cancelReservation
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('user'), createReservation);
router.get('/my', protect, authorize('user'), getUserReservations);
router.get('/pharmacy', protect, authorize('pharmacy'), getPharmacyReservations);
router.put('/:id/status', protect, authorize('pharmacy'), updateReservationStatus);
router.put('/:id/cancel', protect, authorize('user'), cancelReservation);

module.exports = router;

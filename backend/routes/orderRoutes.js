const express = require('express');
const router = express.Router();
const {
  createOrder, getUserOrders, getPharmacyOrders,
  updateOrderStatus, cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('user'), createOrder);
router.get('/my', protect, authorize('user'), getUserOrders);
router.get('/pharmacy', protect, authorize('pharmacy'), getPharmacyOrders);
router.put('/:id/status', protect, authorize('pharmacy'), updateOrderStatus);
router.put('/:id/cancel', protect, authorize('user'), cancelOrder);

module.exports = router;

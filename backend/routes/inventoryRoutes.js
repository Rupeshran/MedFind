const express = require('express');
const router = express.Router();
const {
  getPharmacyInventory, addInventoryItem,
  updateInventoryItem, deleteInventoryItem, getLowStockAlerts
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.get('/pharmacy/:pharmacyId', getPharmacyInventory);
router.get('/low-stock', protect, authorize('pharmacy'), getLowStockAlerts);
router.post('/', protect, authorize('pharmacy'), addInventoryItem);
router.put('/:id', protect, authorize('pharmacy'), updateInventoryItem);
router.delete('/:id', protect, authorize('pharmacy'), deleteInventoryItem);

module.exports = router;

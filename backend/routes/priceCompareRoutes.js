const express = require('express');
const router = express.Router();
const { comparePrices, compareBasket } = require('../controllers/priceCompareController');

router.get('/medicine/:id', comparePrices);
router.post('/basket', compareBasket);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Route to create Stripe checkout session
router.post('/create-checkout-session', protect, paymentController.createCheckoutSession);

// Note: The webhook route must NOT use express.json()
// We'll configure that specifically in server.js before this router is mounted

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile, checkSafety } = require('../controllers/healthProfileController');

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/check-safety', protect, checkSafety);

module.exports = router;

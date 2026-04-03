const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkInteractions, searchInteractions } = require('../controllers/drugInteractionController');

router.post('/check', checkInteractions); // Public — anyone can check
router.get('/search', searchInteractions);

module.exports = router;

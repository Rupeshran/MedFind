const express = require('express');
const router = express.Router();
const { getTrending, getPredictions } = require('../controllers/demandController');

router.get('/trending', getTrending);
router.get('/predictions', getPredictions);

module.exports = router;

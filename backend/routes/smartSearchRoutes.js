const express = require('express');
const router = express.Router();
const { smartSearch } = require('../controllers/smartSearchController');

router.get('/', smartSearch);

module.exports = router;

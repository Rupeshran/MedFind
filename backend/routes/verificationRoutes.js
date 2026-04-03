const express = require('express');
const router = express.Router();
const { verifyMedicine, verifyByQR } = require('../controllers/verificationController');

router.post('/medicine', verifyMedicine);
router.get('/qr/:code', verifyByQR);

module.exports = router;

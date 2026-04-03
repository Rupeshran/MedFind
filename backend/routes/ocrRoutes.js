const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { scanPrescription, extractText } = require('../controllers/ocrController');

// Configure multer for prescription uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/prescriptions')),
  filename: (req, file, cb) => cb(null, `rx_${Date.now()}_${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|bmp|tiff|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

router.post('/scan', upload.single('prescription'), scanPrescription);
router.post('/extract-text', extractText);

module.exports = router;

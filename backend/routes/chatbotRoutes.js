const express = require('express');
const router = express.Router();
const { processQuery } = require('../controllers/chatbotController');

// Chatbot is public but optionally uses auth for personalized responses
const optionalAuth = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const User = require('../models/User');
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) { /* ignore auth errors */ }
  }
  next();
};

router.post('/query', optionalAuth, processQuery);

module.exports = router;

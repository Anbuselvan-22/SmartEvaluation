const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  verifyToken,
  registerValidation,
  loginValidation 
} = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Register user
router.post('/register', registerValidation, register);

// Login user
router.post('/login', loginValidation, login);

// Get current user
router.get('/me', auth, getMe);

// Verify token
router.get('/verify', auth, verifyToken);

module.exports = router;

const express = require('express');
const { 
  getMarks, 
  getPerformance, 
  getFeedback,
  getProfile 
} = require('../controllers/studentController');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication and student role
router.use(auth);
router.use(roleMiddleware(['student']));

// Get student marks
router.get('/marks/:studentId', getMarks);

// Get student performance
router.get('/performance/:studentId', getPerformance);

// Get feedback for specific evaluation
router.get('/feedback/:studentId/:evaluationId', getFeedback);

// Get student profile
router.get('/profile', getProfile);

module.exports = router;

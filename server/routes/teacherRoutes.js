const express = require('express');
const { 
  getStudents, 
  getAnalytics, 
  createSubject, 
  addStudentToSubject,
  getSubjects 
} = require('../controllers/teacherController');
const auth = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// All routes require authentication and teacher role
router.use(auth);
router.use(roleMiddleware(['teacher']));

// Get teacher's students
router.get('/students/:teacherId', getStudents);

// Get teacher analytics
router.get('/analytics/:teacherId', getAnalytics);

// Create subject
router.post('/subjects', createSubject);

// Add student to subject
router.post('/subjects/add-student', addStudentToSubject);

// Get teacher's subjects
router.get('/subjects', getSubjects);

module.exports = router;

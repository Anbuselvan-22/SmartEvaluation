const express = require('express');
const { 
  processUpload, 
  getResults, 
  assignToStudent, 
  deleteEvaluation,
  getTeacherEvaluations 
} = require('../controllers/evaluationController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Process uploaded answer sheets (teacher only)
router.post('/upload', upload.array('files', 10), processUpload);

// Get evaluation results (student and teacher)
router.get('/results/:studentId', getResults);

// Assign evaluation to student (teacher only)
router.post('/assign', assignToStudent);

// Delete evaluation (teacher only)
router.delete('/:evaluationId', deleteEvaluation);

// Get all evaluations for teacher
router.get('/teacher', getTeacherEvaluations);

module.exports = router;

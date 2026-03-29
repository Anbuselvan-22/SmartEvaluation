const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const authMiddleware = require('../middleware/authMiddleware');

// Test route for simple text evaluation (no auth for testing)
router.post('/submit', evaluationController.submitTextEvaluation);

// File upload route (already exists)
router.post('/upload', authMiddleware, evaluationController.processUpload);

// Get evaluation results (already exists)
router.get('/results/:studentId', authMiddleware, evaluationController.getResults);

// Get specific evaluation (already exists)
// router.get('/:evaluationId', authMiddleware, evaluationController.getEvaluationById);

// Assign evaluation to student (already exists)
router.post('/assign', authMiddleware, evaluationController.assignToStudent);

// Delete evaluation (already exists)
router.delete('/:evaluationId', authMiddleware, evaluationController.deleteEvaluation);

// Get all evaluations for teacher
router.get('/teacher', authMiddleware, evaluationController.getTeacherEvaluations);

module.exports = router;

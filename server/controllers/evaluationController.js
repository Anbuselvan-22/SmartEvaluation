const axios = require('axios');
const Marks = require('../models/Marks');
const User = require('../models/User');
const logger = require('../utils/logger');

// Process uploaded answer sheet
const processUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const teacherId = req.user.id;
    const results = [];

    for (const file of req.files) {
      try {
        // Step 1: Extract text using OCR service
        const ocrResponse = await axios.post('http://localhost:8001/ocr', {
          imageUrl: `/uploads/${file.filename}`,
          filename: file.filename,
        });

        const extractedText = ocrResponse.data.text;

        // Step 2: Evaluate using AI service
        const evaluationResponse = await axios.post('http://localhost:8002/evaluate', {
          text: extractedText,
          subject: req.body.subject || 'General',
        });

        const evaluation = evaluationResponse.data;

        // Step 3: Generate feedback using AI service
        const feedbackResponse = await axios.post('http://localhost:8003/feedback', {
          text: extractedText,
          score: evaluation.score,
          subject: req.body.subject || 'General',
        });

        const feedback = feedbackResponse.data;

        // Step 4: Save to database
        const mark = await Marks.create({
          studentId: req.body.studentId || null, // Will be updated later
          teacherId,
          subject: req.body.subject || 'General',
          marks: evaluation.score,
          feedback: feedback.overall,
          strengths: feedback.strengths,
          weaknesses: feedback.weaknesses,
          imageUrl: `/uploads/${file.filename}`,
          extractedText: extractedText,
          processingTime: Date.now() - req.startTime,
          isProcessed: true,
        });

        results.push({
          id: mark._id,
          evaluationId: mark.evaluationId,
          studentName: 'Unknown Student', // Will be updated when student is assigned
          subject: mark.subject,
          score: mark.marks,
          feedback: mark.feedback,
          strengths: mark.strengths,
          weaknesses: mark.weaknesses,
          date: mark.date.toLocaleDateString(),
        });

        logger.info(`Evaluation completed: ${mark.evaluationId}`);

      } catch (error) {
        logger.error(`Error processing file ${file.filename}:`, error);
        results.push({
          filename: file.filename,
          error: 'Processing failed',
        });
      }
    }

    res.status(200).json({
      success: true,
      data: results,
    });

  } catch (error) {
    logger.error('Process upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing upload'
    });
  }
};

// Get evaluation results
const getResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const marks = await Marks.find({ studentId })
      .populate('teacherId', 'name')
      .sort({ date: -1 });
    
    const results = marks.map(mark => ({
      id: mark._id,
      evaluationId: mark.evaluationId,
      studentName: mark.studentId?.name || 'Unknown',
      subject: mark.subject,
      score: mark.marks,
      feedback: mark.feedback,
      strengths: mark.strengths,
      weaknesses: mark.weaknesses,
      teacherName: mark.teacherId.name,
      date: mark.date.toLocaleDateString(),
      imageUrl: mark.imageUrl,
      extractedText: mark.extractedText,
    }));
    
    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    logger.error('Get evaluation results error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching results'
    });
  }
};

// Assign evaluation to student
const assignToStudent = async (req, res) => {
  try {
    const { evaluationId, studentId } = req.body;
    
    // Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Update evaluation
    const mark = await Marks.findOneAndUpdate(
      { evaluationId },
      { studentId },
      { new: true }
    ).populate('studentId', 'name');
    
    if (!mark) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation not found'
      });
    }
    
    logger.info(`Evaluation ${evaluationId} assigned to student ${studentId}`);
    
    res.status(200).json({
      success: true,
      data: mark,
    });
  } catch (error) {
    logger.error('Assign evaluation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while assigning evaluation'
    });
  }
};

// Delete evaluation
const deleteEvaluation = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    
    const mark = await Marks.findOne({ evaluationId });
    
    if (!mark) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation not found'
      });
    }
    
    // Check if user owns this evaluation
    if (mark.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    await Marks.deleteOne({ evaluationId });
    
    logger.info(`Evaluation ${evaluationId} deleted by teacher ${req.user.id}`);
    
    res.status(200).json({
      success: true,
      message: 'Evaluation deleted successfully'
    });
  } catch (error) {
    logger.error('Delete evaluation error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting evaluation'
    });
  }
};

// Get all evaluations for teacher
const getTeacherEvaluations = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    const evaluations = await Marks.find({ teacherId })
      .populate('studentId', 'name email')
      .sort({ date: -1 });
    
    res.status(200).json({
      success: true,
      data: evaluations,
    });
  } catch (error) {
    logger.error('Get teacher evaluations error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching evaluations'
    });
  }
};

module.exports = {
  processUpload,
  getResults,
  assignToStudent,
  deleteEvaluation,
  getTeacherEvaluations,
};

const User = require('../models/User');
const Marks = require('../models/Marks');
const Subject = require('../models/Subject');
const logger = require('../utils/logger');

// Get teacher's students
const getStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    // Get subjects taught by this teacher
    const subjects = await Subject.find({ teacherId }).populate('students');
    
    // Extract unique students
    const students = new Set();
    subjects.forEach(subject => {
      subject.students.forEach(student => {
        students.add(JSON.stringify(student));
      });
    });
    
    const uniqueStudents = Array.from(students).map(student => JSON.parse(student));
    
    res.status(200).json({
      success: true,
      data: uniqueStudents,
    });
  } catch (error) {
    logger.error('Get students error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching students'
    });
  }
};

// Get teacher analytics
const getAnalytics = async (req, res) => {
  try {
    const teacherId = req.user.id;
    
    // Get all evaluations by this teacher
    const evaluations = await Marks.find({ teacherId })
      .populate('studentId', 'name email')
      .sort({ date: -1 });
    
    // Calculate statistics
    const totalEvaluations = evaluations.length;
    const averageScore = evaluations.reduce((sum, evaluation) => sum + evaluation.marks, 0) / totalEvaluations || 0;
    
    // Get recent evaluations
    const recentEvaluations = evaluations.slice(0, 10).map(evaluation => ({
      studentName: evaluation.studentId.name,
      subject: evaluation.subject,
      score: evaluation.marks,
      date: evaluation.date.toLocaleDateString(),
    }));
    
    // Calculate performance trend
    const performanceTrend = evaluations
      .filter((_, index) => index % 10 === 0) // Sample every 10th evaluation
      .map(evaluation => ({
        date: evaluation.date.toLocaleDateString(),
        score: evaluation.marks,
      }))
      .reverse();
    
    // Count pending evaluations
    const pendingEvaluations = await Marks.countDocuments({ 
      teacherId, 
      isProcessed: false 
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalEvaluations,
        averageScore: Math.round(averageScore * 100) / 100,
        recentEvaluations,
        performanceTrend,
        pendingEvaluations,
      },
    });
  } catch (error) {
    logger.error('Get teacher analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching analytics'
    });
  }
};

// Create subject
const createSubject = async (req, res) => {
  try {
    const { name, code, description, maxMarks, passMarks } = req.body;
    
    const subject = await Subject.create({
      name,
      code,
      description,
      maxMarks,
      passMarks,
      teacherId: req.user.id,
    });
    
    logger.info(`Subject created: ${code} by teacher ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    logger.error('Create subject error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating subject'
    });
  }
};

// Add student to subject
const addStudentToSubject = async (req, res) => {
  try {
    const { subjectId, studentId } = req.body;
    
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }
    
    // Check if teacher owns this subject
    if (subject.teacherId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({
        success: false,
        error: 'Student not found'
      });
    }
    
    // Add student to subject if not already added
    if (!subject.students.includes(studentId)) {
      subject.students.push(studentId);
      await subject.save();
    }
    
    logger.info(`Student ${studentId} added to subject ${subjectId}`);
    
    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    logger.error('Add student to subject error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while adding student to subject'
    });
  }
};

// Get teacher's subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ 
      teacherId: req.user.id,
      isActive: true 
    }).populate('students', 'name email');
    
    res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    logger.error('Get subjects error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching subjects'
    });
  }
};

module.exports = {
  getStudents,
  getAnalytics,
  createSubject,
  addStudentToSubject,
  getSubjects,
};

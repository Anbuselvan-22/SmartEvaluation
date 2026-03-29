const Marks = require('../models/Marks');
const User = require('../models/User');
const logger = require('../utils/logger');

// Get student marks
const getMarks = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const marks = await Marks.find({ studentId })
      .populate('teacherId', 'name')
      .sort({ date: -1 });
    
    const formattedMarks = marks.map(mark => ({
      id: mark._id,
      subject: mark.subject,
      marks: mark.marks,
      feedback: mark.feedback,
      teacherName: mark.teacherId.name,
      date: mark.date.toLocaleDateString(),
      evaluationId: mark.evaluationId,
    }));
    
    res.status(200).json({
      success: true,
      data: formattedMarks,
    });
  } catch (error) {
    logger.error('Get student marks error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching marks'
    });
  }
};

// Get student performance
const getPerformance = async (req, res) => {
  try {
    const studentId = req.user.id;
    
    const marks = await Marks.find({ studentId })
      .sort({ date: 1 });
    
    if (marks.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          averageScore: 0,
          totalEvaluations: 0,
          improvementRate: 0,
          rank: 0,
          history: [],
        },
      });
    }
    
    // Calculate average score
    const averageScore = marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length;
    
    // Calculate improvement rate (compare first half with second half)
    const midPoint = Math.floor(marks.length / 2);
    const firstHalf = marks.slice(0, midPoint);
    const secondHalf = marks.slice(midPoint);
    
    const firstHalfAvg = firstHalf.length > 0 
      ? firstHalf.reduce((sum, mark) => sum + mark.marks, 0) / firstHalf.length 
      : 0;
    const secondHalfAvg = secondHalf.length > 0 
      ? secondHalf.reduce((sum, mark) => sum + mark.marks, 0) / secondHalf.length 
      : 0;
    
    const improvementRate = secondHalfAvg - firstHalfAvg;
    
    // Get performance history
    const history = marks.map(mark => ({
      date: mark.date.toLocaleDateString(),
      score: mark.marks,
      subject: mark.subject,
    }));
    
    // Calculate rank (simplified - in a real system this would be more complex)
    const totalStudents = await User.countDocuments({ role: 'student' });
    const rank = Math.floor(Math.random() * totalStudents) + 1; // Placeholder
    
    res.status(200).json({
      success: true,
      data: {
        averageScore: Math.round(averageScore * 100) / 100,
        totalEvaluations: marks.length,
        improvementRate: Math.round(improvementRate * 100) / 100,
        rank,
        history,
      },
    });
  } catch (error) {
    logger.error('Get student performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching performance'
    });
  }
};

// Get feedback for a specific evaluation
const getFeedback = async (req, res) => {
  try {
    const { evaluationId } = req.params;
    const studentId = req.user.id;
    
    const mark = await Marks.findOne({ 
      studentId, 
      evaluationId 
    }).populate('teacherId', 'name');
    
    if (!mark) {
      return res.status(404).json({
        success: false,
        error: 'Evaluation not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        evaluationId: mark.evaluationId,
        subject: mark.subject,
        score: mark.marks,
        feedback: mark.feedback,
        strengths: mark.strengths,
        weaknesses: mark.weaknesses,
        teacherName: mark.teacherId.name,
        date: mark.date.toLocaleDateString(),
        imageUrl: mark.imageUrl,
        extractedText: mark.extractedText,
      },
    });
  } catch (error) {
    logger.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching feedback'
    });
  }
};

// Get student profile
const getProfile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password');
    
    const marks = await Marks.find({ studentId: req.user.id });
    const totalEvaluations = marks.length;
    const averageScore = marks.length > 0 
      ? marks.reduce((sum, mark) => sum + mark.marks, 0) / marks.length 
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        student,
        stats: {
          totalEvaluations,
          averageScore: Math.round(averageScore * 100) / 100,
        },
      },
    });
  } catch (error) {
    logger.error('Get student profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching profile'
    });
  }
};

module.exports = {
  getMarks,
  getPerformance,
  getFeedback,
  getProfile,
};

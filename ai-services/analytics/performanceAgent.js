const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.ANALYTICS_PORT || 8004;

// Middleware
app.use(cors());
app.use(express.json());

// Mock analytics data processing
const generatePerformanceAnalytics = async (studentId, timeRange = 'all') => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));

  // Generate mock performance data
  const performanceData = {
    studentId,
    timeRange,
    summary: {
      averageScore: Math.floor(Math.random() * 30) + 70, // 70-100
      totalEvaluations: Math.floor(Math.random() * 20) + 5, // 5-25
      improvementRate: (Math.random() * 20 - 5).toFixed(1), // -5 to 15
      rank: Math.floor(Math.random() * 50) + 1, // 1-50
      percentile: Math.floor(Math.random() * 40) + 60, // 60-100
    },
    trends: {
      scores: generateTrendData(),
      subjects: generateSubjectData(),
      monthlyProgress: generateMonthlyData(),
    },
    insights: generateInsights(),
    predictions: generatePredictions(),
    recommendations: generateRecommendations(),
  };

  return performanceData;
};

const generateTrendData = () => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  months.forEach(month => {
    data.push({
      month,
      score: Math.floor(Math.random() * 20) + 75, // 75-95
      evaluations: Math.floor(Math.random() * 5) + 1, // 1-5
    });
  });
  
  return data;
};

const generateSubjectData = () => {
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
  
  return subjects.map(subject => ({
    subject,
    averageScore: Math.floor(Math.random() * 25) + 70, // 70-95
    evaluations: Math.floor(Math.random() * 10) + 1, // 1-10
    trend: Math.random() > 0.5 ? 'improving' : 'stable',
  }));
};

const generateMonthlyData = () => {
  const data = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    data.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      averageScore: Math.floor(Math.random() * 15) + 75, // 75-90
      totalEvaluations: Math.floor(Math.random() * 8) + 2, // 2-9
    });
  }
  
  return data;
};

const generateInsights = () => {
  const insights = [
    "Student shows consistent improvement in Mathematics",
    "Science scores have plateaued - consider new learning approaches",
    "English comprehension is excellent with room for creative writing improvement",
    "Historical analysis skills are developing well",
    "Overall performance trend is positive",
  ];
  
  return insights.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 insights
};

const generatePredictions = () => {
  return {
    nextMonthScore: Math.floor(Math.random() * 10) + 80, // 80-90
    examReadiness: Math.random() > 0.3 ? 'Good' : 'Needs Improvement',
    areasOfConcern: [
      "Practice more complex problems in Mathematics",
      "Focus on scientific terminology",
    ].slice(0, Math.floor(Math.random() * 2) + 1), // 1-2 areas
    strengthsToMaintain: [
      "Consistent study habits",
      "Strong analytical thinking",
    ],
  };
};

const generateRecommendations = () => {
  const allRecommendations = [
    "Increase practice time for Mathematics by 30%",
    "Join study groups for collaborative learning",
    "Focus on weak areas identified in recent evaluations",
    "Maintain current study schedule for strong subjects",
    "Consider additional resources for challenging topics",
    "Regular review of previous mistakes to avoid repetition",
  ];
  
  return allRecommendations.slice(0, Math.floor(Math.random() * 3) + 3); // 3-5 recommendations
};

// Analytics endpoint
app.post('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { timeRange = 'all' } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Student ID is required'
      });
    }

    console.log(`Generating analytics for student: ${studentId}`);

    const analytics = await generatePerformanceAnalytics(studentId, timeRange);

    res.json({
      success: true,
      data: analytics,
      metadata: {
        studentId,
        timeRange,
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Analytics Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Analytics generation failed',
      details: error.message,
    });
  }
});

// Class analytics endpoint
app.post('/class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const { timeRange = 'all' } = req.body;

    console.log(`Generating class analytics for: ${classId}`);

    // Generate mock class analytics
    const classAnalytics = {
      classId,
      timeRange,
      summary: {
        totalStudents: Math.floor(Math.random() * 30) + 20, // 20-50
        averageScore: Math.floor(Math.random() * 15) + 75, // 75-90
        topPerformer: "Student Name",
        improvementRate: (Math.random() * 10 + 5).toFixed(1), // 5-15%
      },
      distribution: {
        excellent: Math.floor(Math.random() * 10) + 5, // 5-15 students
        good: Math.floor(Math.random() * 15) + 10, // 10-25 students
        average: Math.floor(Math.random() * 10) + 5, // 5-15 students
        needsImprovement: Math.floor(Math.random() * 5) + 1, // 1-6 students
      },
      subjectPerformance: generateSubjectData(),
      trends: generateTrendData(),
    };

    res.json({
      success: true,
      data: classAnalytics,
      metadata: {
        classId,
        timeRange,
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Class Analytics Error:', error);
    res.status(500).json({
      success: false,
      error: 'Class analytics generation failed',
      details: error.message,
    });
  }
});

// Performance comparison endpoint
app.post('/compare', async (req, res) => {
  try {
    const { studentIds, timeRange = 'all' } = req.body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Student IDs array is required'
      });
    }

    console.log(`Comparing performance for ${studentIds.length} students`);

    const comparisons = await Promise.all(
      studentIds.map(async (studentId) => {
        const analytics = await generatePerformanceAnalytics(studentId, timeRange);
        return {
          studentId,
          averageScore: analytics.summary.averageScore,
          totalEvaluations: analytics.summary.totalEvaluations,
          improvementRate: analytics.summary.improvementRate,
        };
      })
    );

    // Sort by average score
    comparisons.sort((a, b) => b.averageScore - a.averageScore);

    res.json({
      success: true,
      data: {
        comparisons,
        ranking: comparisons.map((comp, index) => ({
          studentId: comp.studentId,
          rank: index + 1,
          score: comp.averageScore,
        })),
        summary: {
          highestScore: comparisons[0]?.averageScore || 0,
          lowestScore: comparisons[comparisons.length - 1]?.averageScore || 0,
          classAverage: comparisons.reduce((sum, comp) => sum + comp.averageScore, 0) / comparisons.length,
        },
      },
      metadata: {
        timeRange,
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Performance Comparison Error:', error);
    res.status(500).json({
      success: false,
      error: 'Performance comparison failed',
      details: error.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Analytics Service',
    port: PORT,
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Analytics Service running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;

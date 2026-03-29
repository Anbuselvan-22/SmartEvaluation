const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.TRAINER_PORT || 8005;

// Middleware
app.use(cors());
app.use(express.json());

// Mock study plan generation
const generateStudyPlan = async (studentProfile, performanceData, goals) => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1200));

  const studyPlan = {
    studentId: studentProfile.studentId,
    goals: goals,
    plan: {
      weekly: generateWeeklyPlan(studentProfile, performanceData),
      monthly: generateMonthlyPlan(studentProfile, performanceData),
      daily: generateDailySchedule(studentProfile, performanceData),
    },
    resources: generateResources(studentProfile, performanceData),
    milestones: generateMilestones(goals),
    tips: generateStudyTips(studentProfile, performanceData),
    tracking: generateTrackingPlan(),
  };

  return studyPlan;
};

const generateWeeklyPlan = (profile, performance) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography'];
  
  return days.map(day => ({
    day,
    focus: subjects[Math.floor(Math.random() * subjects.length)],
    duration: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
    activities: generateDayActivities(),
    breaks: generateBreaks(),
  }));
};

const generateMonthlyPlan = (profile, performance) => {
  const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  
  return weeks.map(week => ({
    week,
    objectives: generateWeekObjectives(),
    topics: generateWeekTopics(),
    assessments: generateWeekAssessments(),
    reviewDays: Math.floor(Math.random() * 2) + 1, // 1-2 review days
  }));
};

const generateDailySchedule = (profile, performance) => {
  return {
    morning: {
      time: '6:00 AM - 8:00 AM',
      activities: ['Light review', 'Quick exercises', 'Breakfast'],
    },
    school: {
      time: '8:00 AM - 3:00 PM',
      activities: ['School classes', 'Lunch break'],
    },
    afternoon: {
      time: '3:00 PM - 5:00 PM',
      activities: ['Homework', 'Subject practice', 'Short break'],
    },
    evening: {
      time: '5:00 PM - 9:00 PM',
      activities: ['Main study session', 'Dinner break', 'Revision'],
    },
    night: {
      time: '9:00 PM - 10:00 PM',
      activities: ['Light reading', 'Plan next day', 'Relaxation'],
    },
  };
};

const generateResources = (profile, performance) => {
  return {
    textbooks: [
      'NCERT Textbooks',
      'Reference Guides',
      'Workbooks',
    ],
    online: [
      'Khan Academy',
      'YouTube Educational Channels',
      'Educational Apps',
    ],
    practice: [
      'Sample Papers',
      'Previous Year Questions',
      'Mock Tests',
    ],
    support: [
      'Teacher Consultation',
      'Study Groups',
      'Online Forums',
    ],
  };
};

const generateMilestones = (goals) => {
  return [
    {
      milestone: 'Complete Mathematics Chapter 1',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 1 week
      status: 'pending',
    },
    {
      milestone: 'Score 80% in Science Test',
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 2 weeks
      status: 'pending',
    },
    {
      milestone: 'Complete English Essay Practice',
      targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 10 days
      status: 'pending',
    },
  ];
};

const generateStudyTips = (profile, performance) => {
  const allTips = [
    "Use the Pomodoro Technique: 25 minutes study, 5 minutes break",
    "Create mind maps for visual learning",
    "Practice active recall instead of passive reading",
    "Teach concepts to others to reinforce understanding",
    "Use mnemonics for memorization",
    "Review notes within 24 hours for better retention",
    "Stay hydrated and take regular breaks",
    "Create a dedicated study space",
    "Use flashcards for quick revision",
    "Practice previous year question papers",
  ];
  
  return allTips.slice(0, 6); // Return 6 tips
};

const generateTrackingPlan = () => {
  return {
    daily: {
      metrics: ['Study hours', 'Topics covered', 'Practice problems solved'],
      tools: ['Study journal', 'Mobile apps', 'Calendar'],
    },
    weekly: {
      metrics: ['Weekly test scores', 'Concepts mastered', 'Areas improved'],
      tools: ['Progress charts', 'Teacher feedback', 'Self-assessment'],
    },
    monthly: {
      metrics: ['Overall performance', 'Goal achievement', 'Study pattern analysis'],
      tools: ['Performance reports', 'Parent-teacher meetings', 'Goal review'],
    },
  };
};

const generateDayActivities = () => {
  const activities = [
    'Read textbook chapter',
    'Solve practice problems',
    'Watch educational video',
    'Review previous topics',
    'Take notes',
    'Practice diagrams',
  ];
  
  return activities.slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 activities
};

const generateBreaks = () => {
  return [
    { type: 'Short break', duration: '5 minutes', frequency: 'Every 25 minutes' },
    { type: 'Long break', duration: '15 minutes', frequency: 'Every 2 hours' },
  ];
};

const generateWeekObjectives = () => {
  const objectives = [
    'Complete 3 chapters',
    'Solve 50 practice problems',
    'Review weak areas',
    'Take weekly test',
    'Prepare for upcoming exam',
  ];
  
  return objectives.slice(0, Math.floor(Math.random() * 3) + 2); // 2-3 objectives
};

const generateWeekTopics = () => {
  const topics = [
    'Mathematics: Algebra',
    'Science: Chemistry',
    'English: Grammar',
    'History: Medieval Period',
    'Geography: Physical Features',
  ];
  
  return topics.slice(0, Math.floor(Math.random() * 3) + 2); // 2-3 topics
};

const generateWeekAssessments = () => {
  return [
    {
      type: 'Practice Test',
      subject: 'Mathematics',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    },
    {
      type: 'Quiz',
      subject: 'Science',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    },
  ];
};

// Study plan generation endpoint
app.post('/generate', async (req, res) => {
  try {
    const { studentProfile, performanceData, goals } = req.body;

    if (!studentProfile || !performanceData || !goals) {
      return res.status(400).json({
        success: false,
        error: 'Student profile, performance data, and goals are required'
      });
    }

    console.log(`Generating study plan for student: ${studentProfile.studentId}`);

    const studyPlan = await generateStudyPlan(studentProfile, performanceData, goals);

    res.json({
      success: true,
      data: studyPlan,
      metadata: {
        studentId: studentProfile.studentId,
        generatedAt: new Date().toISOString(),
        version: '1.0',
      }
    });

  } catch (error) {
    console.error('Study Plan Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Study plan generation failed',
      details: error.message,
    });
  }
});

// Update study plan endpoint
app.put('/update/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { updates } = req.body;

    if (!studentId || !updates) {
      return res.status(400).json({
        success: false,
        error: 'Student ID and updates are required'
      });
    }

    console.log(`Updating study plan for student: ${studentId}`);

    // In a real implementation, this would update the database
    const updatedPlan = {
      studentId,
      updates,
      lastUpdated: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: updatedPlan,
      message: 'Study plan updated successfully',
    });

  } catch (error) {
    console.error('Study Plan Update Error:', error);
    res.status(500).json({
      success: false,
      error: 'Study plan update failed',
      details: error.message,
    });
  }
});

// Get study progress endpoint
app.get('/progress/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { timeRange = 'week' } = req.query;

    console.log(`Getting study progress for student: ${studentId}`);

    // Generate mock progress data
    const progress = {
      studentId,
      timeRange,
      completion: {
        weekly: Math.floor(Math.random() * 40) + 60, // 60-100%
        monthly: Math.floor(Math.random() * 30) + 70, // 70-100%
      },
      activities: {
        completed: Math.floor(Math.random() * 20) + 10, // 10-30
        pending: Math.floor(Math.random() * 10) + 5, // 5-15
        overdue: Math.floor(Math.random() * 3), // 0-2
      },
      streaks: {
        current: Math.floor(Math.random() * 15) + 1, // 1-15 days
        longest: Math.floor(Math.random() * 30) + 15, // 15-45 days
      },
      achievements: [
        '7-Day Study Streak',
        'Mathematics Master',
        'Perfect Score',
      ].slice(0, Math.floor(Math.random() * 3) + 1), // 1-3 achievements
    };

    res.json({
      success: true,
      data: progress,
      metadata: {
        studentId,
        timeRange,
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Study Progress Error:', error);
    res.status(500).json({
      success: false,
      error: 'Study progress retrieval failed',
      details: error.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Study Planner Service',
    port: PORT,
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Study Planner Service running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;

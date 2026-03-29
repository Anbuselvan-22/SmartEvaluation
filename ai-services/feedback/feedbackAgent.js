const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.FEEDBACK_PORT || 8003;

// Middleware
app.use(cors());
app.use(express.json());

// Load feedback prompt
const loadPrompt = () => {
  try {
    const promptPath = path.join(__dirname, '../prompts/feedbackPrompt.txt');
    return fs.readFileSync(promptPath, 'utf8');
  } catch (error) {
    console.error('Error loading feedback prompt:', error);
    return getDefaultPrompt();
  }
};

const getDefaultPrompt = () => {
  return `
You are an expert educational feedback provider. Analyze the student's answer and score to provide:

1. Constructive overall feedback
2. Specific strengths to build upon
3. Actionable areas for improvement
4. Study recommendations

Focus on:
- Encouraging language
- Specific, actionable advice
- Growth mindset
- Clear next steps

Respond in JSON format:
{
  "overall": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "studyPlan": {
    "focus": ["string"],
    "resources": ["string"],
    "timeline": "string"
  }
}
`;
};

// Mock AI feedback generation (replace with actual AI integration)
const generateFeedback = async (text, score, subject) => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 800));

  let feedback, strengths, weaknesses, recommendations, studyPlan;

  // Generate feedback based on score ranges
  if (score >= 80) {
    feedback = "Outstanding work! You demonstrate excellent understanding of the material. Your answers are well-structured and show deep comprehension.";
    strengths = [
      "Clear and logical explanations",
      "Excellent use of subject terminology",
      "Comprehensive coverage of topics",
      "Strong analytical skills"
    ];
    weaknesses = [
      "Consider exploring advanced concepts",
      "Could include more real-world examples"
    ];
    recommendations = [
      "Challenge yourself with advanced problems",
      "Explore interdisciplinary connections",
      "Consider peer tutoring opportunities"
    ];
    studyPlan = {
      focus: ["Advanced topics", "Critical thinking", "Application skills"],
      resources: ["Advanced textbooks", "Research papers", "Online courses"],
      timeline: "Continue with current pace and explore enrichment activities"
    };
  } else if (score >= 60) {
    feedback = "Good effort! You understand the basic concepts well. With some additional practice and refinement, you can achieve excellent results.";
    strengths = [
      "Solid understanding of fundamentals",
      "Good attempt at problem-solving",
      "Relevant points included"
    ];
    weaknesses = [
      "Need more detailed explanations",
      "Structure could be improved",
      "Some concepts need clarification"
    ];
    recommendations = [
      "Practice explaining concepts in your own words",
      "Work on organizing answers logically",
      "Review and revise before submission"
    ];
    studyPlan = {
      focus: ["Concept clarity", "Answer structure", "Detail enhancement"],
      resources: ["Study guides", "Practice worksheets", "Video tutorials"],
      timeline: "2-3 weeks of focused practice"
    };
  } else {
    feedback = "Keep working! You're on the right track but need to strengthen your understanding of the fundamental concepts. Don't give up!";
    strengths = [
      "Willingness to attempt difficult questions",
      "Basic recognition of key terms"
    ];
    weaknesses = [
      "Lacks understanding of core concepts",
      "Answers are incomplete or unclear",
      "Needs better organization"
    ];
    recommendations = [
      "Review fundamental concepts thoroughly",
      "Practice with guided examples",
      "Seek help from teachers or tutors",
      "Form study groups"
    ];
    studyPlan = {
      focus: ["Basic concepts", "Fundamental skills", "Confidence building"],
      resources: ["Basic textbooks", "One-on-one tutoring", "Study groups"],
      timeline: "4-6 weeks of foundational work"
    };
  }

  // Add subject-specific feedback
  const subjectSpecific = getSubjectSpecificFeedback(subject, score);
  strengths.push(...subjectSpecific.strengths);
  weaknesses.push(...subjectSpecific.weaknesses);
  recommendations.push(...subjectSpecific.recommendations);

  return {
    overall: feedback,
    strengths: strengths.slice(0, 5), // Limit to 5 items
    weaknesses: weaknesses.slice(0, 5),
    recommendations: recommendations.slice(0, 5),
    studyPlan,
    processingTime: Date.now() - new Date().getTime()
  };
};

const getSubjectSpecificFeedback = (subject, score) => {
  const feedback = {
    Mathematics: {
      strengths: ["Good problem-solving approach", "Clear mathematical reasoning"],
      weaknesses: ["Show your work more clearly", "Check calculations carefully"],
      recommendations: ["Practice similar problems", "Review mathematical formulas"]
    },
    Science: {
      strengths: ["Scientific thinking", "Good observation skills"],
      weaknesses: ["Include more scientific terminology", "Explain processes more thoroughly"],
      recommendations: ["Conduct experiments", "Read scientific articles"]
    },
    History: {
      strengths: ["Good chronological understanding", "Relevant historical context"],
      weaknesses: ["Include more specific dates/events", "Analyze causes and effects"],
      recommendations: ["Create timelines", "Study primary sources"]
    },
    English: {
      strengths: ["Good vocabulary", "Creative expression"],
      weaknesses: ["Improve grammar and punctuation", "Develop stronger arguments"],
      recommendations: ["Read more literature", "Practice essay writing"]
    }
  };

  return feedback[subject] || feedback['General'] || {
    strengths: ["Good effort"],
    weaknesses: ["Needs improvement"],
    recommendations: ["Continue practicing"]
  };
};

// Feedback generation endpoint
app.post('/', async (req, res) => {
  try {
    const { text, score, subject = 'General' } = req.body;

    if (!text || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Text and score are required for feedback generation'
      });
    }

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        error: 'Score must be a number between 0 and 100'
      });
    }

    console.log(`Generating feedback for score: ${score} in subject: ${subject}`);

    const feedback = await generateFeedback(text, score, subject);

    res.json({
      success: true,
      data: feedback,
      metadata: {
        score,
        subject,
        textLength: text.length,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Feedback Generation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Feedback generation failed',
      details: error.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Feedback Service',
    port: PORT,
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Feedback Service running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;

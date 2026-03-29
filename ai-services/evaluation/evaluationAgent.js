const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.EVALUATION_PORT || 8002;

// Middleware
app.use(cors());
app.use(express.json());

// Load evaluation prompt
const loadPrompt = () => {
  try {
    const promptPath = path.join(__dirname, '../prompts/evaluationPrompt.txt');
    return fs.readFileSync(promptPath, 'utf8');
  } catch (error) {
    console.error('Error loading evaluation prompt:', error);
    return getDefaultPrompt();
  }
};

const getDefaultPrompt = () => {
  return `
You are an expert educational evaluator. Analyze the given student answer and provide:

1. A numerical score (0-100)
2. Detailed feedback
3. Key strengths
4. Areas for improvement

Consider:
- Accuracy of the answer
- Clarity and organization
- Depth of understanding
- Proper use of terminology
- Completeness

Respond in JSON format:
{
  "score": number,
  "feedback": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "analysis": "string"
}
`;
};

// Mock AI evaluation (replace with actual AI integration)
const evaluateAnswer = async (text, subject) => {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simple scoring logic based on text length and keywords
  let score = 50; // Base score
  
  // Length bonus
  if (text.length > 100) score += 10;
  if (text.length > 300) score += 10;
  
  // Subject-specific keyword analysis
  const keywords = {
    'Mathematics': ['equation', 'solve', 'calculate', 'formula', 'equals', 'variable'],
    'Science': ['process', 'explain', 'because', 'therefore', 'experiment', 'hypothesis'],
    'History': ['because', 'therefore', 'historical', 'period', 'century', 'event'],
    'English': ['therefore', 'however', 'because', 'analysis', 'theme', 'character'],
    'General': ['explain', 'because', 'therefore', 'example', 'important', 'reason']
  };

  const subjectKeywords = keywords[subject] || keywords['General'];
  const foundKeywords = subjectKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  score += foundKeywords.length * 3;

  // Cap the score at 100
  score = Math.min(100, Math.max(0, score));

  // Generate feedback based on score
  let feedback, strengths, weaknesses, analysis;

  if (score >= 80) {
    feedback = "Excellent answer! Demonstrates strong understanding of the topic with good explanations and relevant details.";
    strengths = ["Clear explanation", "Good use of terminology", "Comprehensive coverage"];
    weaknesses = ["Minor areas for deeper exploration"];
    analysis = "The student shows excellent grasp of the subject matter with well-structured responses.";
  } else if (score >= 60) {
    feedback = "Good answer with some areas for improvement. The basic concepts are understood but could be elaborated further.";
    strengths = ["Basic understanding demonstrated", "Relevant points mentioned"];
    weaknesses = ["Needs more detail", "Could use better examples", "Structure could be improved"];
    analysis = "The student understands the fundamentals but needs to develop more comprehensive explanations.";
  } else {
    feedback = "The answer needs significant improvement. Key concepts are missing or incorrectly explained.";
    strengths = ["Attempted to answer the question"];
    weaknesses = ["Lacks clarity", "Missing key concepts", "Incorrect information", "Poor structure"];
    analysis = "The student needs to review the fundamental concepts and practice explaining them clearly.";
  }

  return {
    score,
    feedback,
    strengths,
    weaknesses,
    analysis,
    processingTime: Date.now() - new Date().getTime()
  };
};

// Evaluation endpoint
app.post('/', async (req, res) => {
  try {
    const { text, subject = 'General' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No text provided for evaluation'
      });
    }

    console.log(`Evaluating answer for subject: ${subject}`);

    const evaluation = await evaluateAnswer(text, subject);

    res.json({
      success: true,
      data: evaluation,
      metadata: {
        subject,
        textLength: text.length,
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Evaluation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Evaluation processing failed',
      details: error.message,
    });
  }
});

// Batch evaluation endpoint
app.post('/batch', async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No answers provided for batch evaluation'
      });
    }

    console.log(`Processing batch evaluation for ${answers.length} answers`);

    const results = await Promise.all(
      answers.map(async (answer, index) => {
        try {
          const evaluation = await evaluateAnswer(answer.text, answer.subject || 'General');
          return {
            index,
            success: true,
            data: evaluation,
          };
        } catch (error) {
          return {
            index,
            success: false,
            error: error.message,
          };
        }
      })
    );

    res.json({
      success: true,
      data: results,
      summary: {
        total: answers.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      }
    });

  } catch (error) {
    console.error('Batch Evaluation Error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch evaluation failed',
      details: error.message,
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Evaluation Service',
    port: PORT,
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Evaluation Service running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;

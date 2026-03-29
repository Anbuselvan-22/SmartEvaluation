const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.AI_SERVICES_PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Import service routes
const ocrRoutes = require('./ocr/ocrAgent');
const evaluationRoutes = require('./evaluation/evaluationAgent');
const feedbackRoutes = require('./feedback/feedbackAgent');
const analyticsRoutes = require('./analytics/performanceAgent');
const trainerRoutes = require('./trainer/studyPlannerAgent');

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Services are running',
    services: {
      ocr: 'http://localhost:8001',
      evaluation: 'http://localhost:8002',
      feedback: 'http://localhost:8003',
      analytics: 'http://localhost:8004',
      trainer: 'http://localhost:8005'
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/ocr', ocrRoutes);
app.use('/evaluate', evaluationRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/trainer', trainerRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'AI Service endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('AI Services Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error in AI services'
  });
});

app.listen(PORT, () => {
  console.log(`AI Services Gateway running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
});

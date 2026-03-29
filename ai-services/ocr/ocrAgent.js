const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.OCR_PORT || 8001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// OCR processing endpoint
app.post('/extract', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided'
      });
    }

    const imagePath = req.file.path;
    
    console.log(`Processing OCR for: ${req.file.originalname}`);

    // Perform OCR using Tesseract
    const result = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: m => console.log(m),
      }
    );

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    // Extract and clean text
    const extractedText = result.data.text
      .replace(/\s+/g, ' ')
      .trim();

    res.json({
      success: true,
      data: {
        text: extractedText,
        confidence: result.data.confidence,
        words: result.data.words,
        lines: result.data.lines,
        paragraphs: result.data.paragraphs,
      },
      processingTime: Date.now() - req.startTime,
    });

  } catch (error) {
    console.error('OCR Error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: 'OCR processing failed',
      details: error.message,
    });
  }
});

// Legacy endpoint for backward compatibility
app.post('/', async (req, res) => {
  try {
    const { imageUrl, filename } = req.body;
    
    if (!imageUrl && !filename) {
      return res.status(400).json({
        success: false,
        error: 'No image source provided'
      });
    }

    // For now, return mock text - in production, this would process the actual image
    const mockText = `
    Question 1: What is the capital of France?
    Answer: Paris is the capital of France. It is located in the northern part of the country and is known for the Eiffel Tower.
    
    Question 2: Explain the process of photosynthesis.
    Answer: Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. This process occurs in the chloroplasts and is essential for life on Earth.
    
    Question 3: Solve for x: 2x + 5 = 15
    Answer: 2x + 5 = 15
    2x = 15 - 5
    2x = 10
    x = 5
    `;

    res.json({
      success: true,
      text: mockText.trim(),
      confidence: 0.95,
    });

  } catch (error) {
    console.error('OCR Legacy Error:', error);
    res.status(500).json({
      success: false,
      error: 'OCR processing failed',
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'OCR Service',
    port: PORT,
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`OCR Service running on port ${PORT}`);
  console.log(`Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;

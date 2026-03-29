const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required'],
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  marks: {
    type: Number,
    required: [true, 'Marks are required'],
    min: 0,
    max: 100,
  },
  feedback: {
    type: String,
    required: [true, 'Feedback is required'],
  },
  strengths: [{
    type: String,
  }],
  weaknesses: [{
    type: String,
  }],
  imageUrl: {
    type: String,
  },
  extractedText: {
    type: String,
  },
  evaluationId: {
    type: String,
    unique: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isProcessed: {
    type: Boolean,
    default: false,
  },
  processingTime: {
    type: Number, // in seconds
  },
}, {
  timestamps: true,
});

marksSchema.pre('save', function(next) {
  if (this.isNew && !this.evaluationId) {
    this.evaluationId = 'EVAL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  next();
});

marksSchema.index({ studentId: 1, date: -1 });
marksSchema.index({ teacherId: 1, date: -1 });
marksSchema.index({ subject: 1 });

module.exports = mongoose.model('Marks', marksSchema);

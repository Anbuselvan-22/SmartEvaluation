const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    trim: true,
    unique: true,
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher ID is required'],
  },
  maxMarks: {
    type: Number,
    default: 100,
    min: 1,
    max: 1000,
  },
  passMarks: {
    type: Number,
    default: 40,
    min: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

subjectSchema.index({ teacherId: 1 });
subjectSchema.index({ code: 1 });

module.exports = mongoose.model('Subject', subjectSchema);

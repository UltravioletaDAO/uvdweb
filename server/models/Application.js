const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  twitter: {
    type: String,
    required: true,
    trim: true
  },
  telegram: {
    type: String,
    required: true,
    trim: true
  },
  twitch: {
    type: String,
    trim: true
  },
  walletAddress: {
    type: String,
    required: true,
    trim: true
  },
  story: {
    type: String,
    required: true,
    minlength: 55
  },
  purpose: {
    type: String,
    required: true,
    minlength: 55
  },
  references: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'review', 'approved', 'rejected', 'waitlist'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
applicationSchema.index({ email: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Application', applicationSchema); 
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  fullName: String,
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
  experience: {
    type: String,
    required: true
  },
  references: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'review', 'approved', 'waitlist', 'rejected'],
    default: 'pending'
  },
  statusUpdatedAt: {
    type: Date,
    default: Date.now
  },
  statusMessage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'applications'
});

module.exports = mongoose.model('Application', applicationSchema, 'applications'); 
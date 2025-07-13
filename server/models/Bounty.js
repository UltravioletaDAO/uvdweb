const mongoose = require('mongoose');

const bountySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  reward: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'in_review', 'done'],
    default: 'todo'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  tags: [{
    type: String,
    trim: true
  }],
  requirements: {
    type: String,
    trim: true
  },
  deliverables: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
bountySchema.index({ status: 1 });
bountySchema.index({ createdBy: 1 });
bountySchema.index({ isActive: 1 });
bountySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Bounty', bountySchema); 
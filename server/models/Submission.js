const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  bounty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bounty',
    required: true,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  submitterName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  submissionContent: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  submissionType: {
    type: String,
    enum: ['url', 'text', 'file'], // Puedes expandir esto (e.g., 'youtube', 'x_thread')
    default: 'url',
  },
  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected'],
    default: 'submitted',
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
}, {
  timestamps: true,
});

submissionSchema.index({ bounty: 1 });
submissionSchema.index({ submittedBy: 1 });

module.exports = mongoose.model('Submission', submissionSchema); 
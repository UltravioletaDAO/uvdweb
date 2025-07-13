const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  wallet: {
    type: String,
    required: true,
    trim: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  validationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
walletSchema.index({ username: 1 });
walletSchema.index({ wallet: 1 });
walletSchema.index({ isValid: 1 });

module.exports = mongoose.model('Wallet', walletSchema); 
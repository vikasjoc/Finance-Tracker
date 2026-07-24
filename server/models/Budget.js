const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: [true, 'Please specify month'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Please specify year'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    plannedAmount: {
      type: Number,
      required: [true, 'Please provide planned amount'],
      min: [0, 'Amount cannot be negative'],
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    type: {
      type: String,
      default: 'monthly',
      enum: ['monthly', 'savings', 'emergency', 'investment'],
    },
  },
  {
    timestamps: true,
  }
);

budgetSchema.index({ user: 1, month: 1, year: 1 });

module.exports = mongoose.model('Budget', budgetSchema);


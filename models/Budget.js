const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    limit: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      default: 'monthly',
      index: true,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);

const mongoose = require('mongoose');

const recurringOperationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    comment: {
      type: String,
      default: '',
      trim: true,
    },
    interval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true,
      index: true,
    },
    nextDate: {
      type: Date,
      required: true,
      index: true,
    },
    lastExecuted: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.RecurringOperation ||
  mongoose.model('RecurringOperation', recurringOperationSchema);

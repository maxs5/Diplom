const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
      index: true,
    },
    icon: {
      type: String,
      default: 'other',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Review message is required'],
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters'],
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  eventType: {
    type: String,
    trim: true,
    default: '',
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);

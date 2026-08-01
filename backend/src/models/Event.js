const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['Temple Festival', 'Corporate', 'Public Event', 'Wedding', 'Private', 'Other'],
    default: 'Other',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['upcoming', 'past', 'draft'],
    default: 'upcoming',
  },
  membersCount: {
    type: Number,
    default: 0,
  },
  showOnHome: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    enum: ['manual', 'booking'],
    default: 'manual',
  },
  bookingRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);

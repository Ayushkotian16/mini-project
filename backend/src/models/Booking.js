const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    enum: ['Dakshina Kannada', 'Udupi', 'Kasargod', 'Other'],
  },
  venueAddress: {
    type: String,
    required: [true, 'Venue address is required'],
    trim: true,
  },
  venueLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    placeId: { type: String, default: '' },
    formattedAddress: { type: String, default: '' },
  },
  distanceFromKateel: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance cannot be negative'],
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: ['Temple Festival', 'Wedding Ceremony', 'Corporate Event', 'Private Celebration', 'Other'],
  },
  numberOfMembers: {
    type: Number,
    required: [true, 'Number of members is required'],
    min: [5, 'Minimum 5 members required'],
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  specialNotes: {
    type: String,
    trim: true,
    default: '',
  },
  estimatedPrice: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  adminNotes: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

// Calculate estimated price before saving
// Base = members × ₹1,000
// Surcharge: ≤5 km = ₹0 | >5 km = distance × ₹150
bookingSchema.pre('save', function (next) {
  const n = Math.max(this.numberOfMembers || 5, 5);
  const d = Math.max(this.distanceFromKateel || 0, 0);
  const base = 1000 * n;
  const surcharge = d > 5 ? Math.round(d * 150) : 0;
  this.estimatedPrice = base + surcharge;
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

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
  // Pricing — stored at time of booking submission
  pricePerMember: {
    type: Number,
    default: 1000,
  },
  distanceSurchargePerKm: {
    type: Number,
    default: 150,
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  estimatedPrice: {
    type: Number,
    default: 0,
  },
  finalPrice: {
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
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'advance_paid', 'fully_paid'],
    default: 'unpaid',
  },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
}, { timestamps: true });

// Calculate estimated price before saving
bookingSchema.pre('save', function (next) {
  const n = Math.max(this.numberOfMembers || 5, 5);
  const d = Math.max(this.distanceFromKateel || 0, 0);
  const ppm = this.pricePerMember || 1000;
  const spm = this.distanceSurchargePerKm || 150;
  const disc = Math.min(Math.max(this.discountPercent || 0, 0), 100);

  const base = ppm * n;
  const surcharge = d > 5 ? Math.round(d * spm) : 0;
  const subtotal = base + surcharge;
  const discountAmt = Math.round(subtotal * disc / 100);
  this.estimatedPrice = subtotal;
  this.finalPrice = subtotal - discountAmt;
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);

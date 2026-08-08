const Booking = require('../models/Booking');
const Event = require('../models/Event');
const SiteContent = require('../models/SiteContent');
const { generateOTP, storeOTP, verifyOTP, consumeVerifiedPhone } = require('../config/otpStore');
const { sendOtp, normalizeIndianPhoneNumber } = require('../config/sms');
const { sendBookingNotification } = require('../config/mailer');

// Helper: get current pricing settings from DB (fallback to defaults)
const getPricingSettings = async () => {
  try {
    const doc = await SiteContent.findOne({ section: 'pricing' });
    if (doc && doc.data) return doc.data;
  } catch (_) {}
  return { pricePerMember: 1000, distanceSurchargePerKm: 150, freeDistanceKm: 5 };
};

// Helper: get active offers and find best discount
const getBestDiscount = async () => {
  try {
    const doc = await SiteContent.findOne({ section: 'offers' });
    if (doc && doc.data && Array.isArray(doc.data.items)) {
      const now = new Date();
      const active = doc.data.items.filter((o) => {
        if (!o.active) return false;
        if (o.expiresAt && new Date(o.expiresAt) < now) return false;
        return true;
      });
      if (active.length === 0) return 0;
      return Math.max(...active.map((o) => Number(o.discountPercent) || 0));
    }
  } catch (_) {}
  return 0;
};

// @desc    Send OTP to phone
// @route   POST /api/bookings/send-otp
// @access  Public
const sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required.' });
    }
    const otp = generateOTP();
    await sendOtp({ to: phone, otp });
    storeOTP(normalizeIndianPhoneNumber(phone), otp);
    res.status(200).json({ success: true, message: 'OTP sent successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/bookings/verify-otp
// @access  Public
const verifyOTPHandler = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required.' });
    }
    const result = verifyOTP(normalizeIndianPhoneNumber(phone), otp);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }
    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current pricing + active offers (public — for booking form)
// @route   GET /api/bookings/pricing
// @access  Public
const getPricing = async (req, res, next) => {
  try {
    const pricing = await getPricingSettings();
    const discountPercent = await getBestDiscount();

    const offersDoc = await SiteContent.findOne({ section: 'offers' });
    const now = new Date();
    const activeOffers = offersDoc?.data?.items?.filter((o) => {
      if (!o.active) return false;
      if (o.expiresAt && new Date(o.expiresAt) < now) return false;
      return true;
    }) || [];

    const ownerDoc = await SiteContent.findOne({ section: 'owner' });
    const owner = ownerDoc?.data || { name: 'Kiran Anchan', phone1: '', phone2: '' };

    res.status(200).json({
      success: true,
      pricing,
      discountPercent,
      activeOffers,
      owner,
      otpRequired: pricing.otpRequired !== false, // default true
      advancePaymentEnabled: pricing.advancePaymentEnabled !== false, // default true
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check date/time availability (public — called when user picks a date)
// @route   GET /api/bookings/check-availability?date=YYYY-MM-DD
// @access  Public
const checkAvailability = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) return res.json({ success: true, available: true, conflicts: [] });

    const eventDateTime = new Date(date);
    const windowStart = new Date(eventDateTime.getTime() - 6 * 60 * 60 * 1000);
    const windowEnd   = new Date(eventDateTime.getTime() + 6 * 60 * 60 * 1000);

    const conflicts = await Booking.find({
      status: { $in: ['pending', 'approved'] },
      eventDate: { $gte: windowStart, $lte: windowEnd },
    }).select('eventDate eventType status');

    res.json({
      success: true,
      available: conflicts.length === 0,
      conflicts: conflicts.map((c) => ({
        eventDate: c.eventDate,
        eventType: c.eventType,
        status: c.status,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res, next) => {
  try {
    const {
      fullName, phone, district, venueAddress,
      distanceFromKateel, eventType, numberOfMembers,
      eventDate, specialNotes, venueLocation, selectedOfferId,
    } = req.body;

    // Check if OTP verification is required
    const pricing = await getPricingSettings();
    const otpRequired = pricing.otpRequired !== false;

    if (otpRequired && !consumeVerifiedPhone(normalizeIndianPhoneNumber(phone))) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your phone number with an OTP before submitting the booking.',
      });
    }
    // If OTP not required, just clear any stored OTP for this number (cleanup)
    if (!otpRequired) consumeVerifiedPhone(normalizeIndianPhoneNumber(phone));
    const eventDateTime = new Date(eventDate);
    const windowStart = new Date(eventDateTime.getTime() - 6 * 60 * 60 * 1000);
    const windowEnd   = new Date(eventDateTime.getTime() + 6 * 60 * 60 * 1000);

    const conflict = await Booking.findOne({
      status: { $in: ['pending', 'approved'] },
      eventDate: { $gte: windowStart, $lte: windowEnd },
    });

    if (conflict) {
      const conflictTime = new Date(conflict.eventDate).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      return res.status(409).json({
        success: false,
        message: `A booking already exists near this time (${conflictTime}). Please choose a date/time at least 6 hours apart.`,
      });
    }

    // Fetch live discount — use selected offer if provided, else 0
    let discountPercent = 0;
    if (selectedOfferId) {
      const offersDoc = await SiteContent.findOne({ section: 'offers' });
      const now = new Date();
      const offer = offersDoc?.data?.items?.find((o) => {
        if (o.id !== selectedOfferId) return false;
        if (!o.active) return false;
        if (o.expiresAt && new Date(o.expiresAt) < now) return false;
        return true;
      });
      discountPercent = offer ? Math.max(0, Number(offer.discountPercent) || 0) : 0;
    }

    const booking = await Booking.create({
      fullName, phone, district, venueAddress,
      distanceFromKateel, eventType, numberOfMembers,
      eventDate, specialNotes, otpVerified: true,
      venueLocation: venueLocation || {},
      pricePerMember: pricing.pricePerMember,
      distanceSurchargePerKm: pricing.distanceSurchargePerKm,
      discountPercent,
    });

    // Send email notification to admin (non-blocking)
    sendBookingNotification(booking);

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully. We will contact you soon.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/bookings
// @access  Private
const getAllBookings = async (req, res, next) => {
  try {
    const { status, eventType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (eventType) filter.eventType = eventType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({ success: true, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)), bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking (admin)
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Full update of a booking (admin) — edit any field
// @route   PUT /api/bookings/:id
// @access  Private
const updateBooking = async (req, res, next) => {
  try {
    const allowed = [
      'fullName', 'phone', 'district', 'venueAddress', 'distanceFromKateel',
      'eventType', 'numberOfMembers', 'eventDate', 'specialNotes',
      'pricePerMember', 'distanceSurchargePerKm', 'discountPercent',
      'status', 'adminNotes',
    ];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    Object.assign(booking, updates);
    await booking.save(); // triggers pre-save pricing recalculation

    res.status(200).json({ success: true, message: 'Booking updated.', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (admin)
// @route   PATCH /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.status = status;
    if (adminNotes !== undefined) booking.adminNotes = adminNotes;
    await booking.save();

    // When approved — auto-create an event entry
    if (status === 'approved') {
      const existing = await Event.findOne({ bookingRef: booking._id });
      if (!existing) {
        await Event.create({
          title: `${booking.eventType} — ${booking.fullName}`,
          description: booking.specialNotes || '',
          date: booking.eventDate,
          location: booking.venueAddress,
          category: booking.eventType === 'Temple Festival' ? 'Temple Festival'
            : booking.eventType === 'Wedding Ceremony' ? 'Wedding'
            : booking.eventType === 'Corporate Event' ? 'Corporate'
            : 'Other',
          status: new Date(booking.eventDate) > new Date() ? 'upcoming' : 'past',
          membersCount: booking.numberOfMembers,
          showOnHome: true,
          source: 'booking',
          bookingRef: booking._id,
        });
      } else {
        await Event.findByIdAndUpdate(existing._id, { showOnHome: true });
      }
    }

    if (status === 'rejected') {
      await Event.findOneAndUpdate({ bookingRef: booking._id }, { showOnHome: false });
    }

    res.status(200).json({ success: true, message: `Booking ${status}.`, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete booking (admin)
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.status(200).json({ success: true, message: 'Booking deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendOTP, verifyOTPHandler, getPricing, checkAvailability, createBooking,
  getAllBookings, getBookingById, updateBooking, updateBookingStatus, deleteBooking,
};

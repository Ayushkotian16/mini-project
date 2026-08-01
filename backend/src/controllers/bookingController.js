const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { generateOTP, storeOTP, verifyOTP, consumeVerifiedPhone } = require('../config/otpStore');
const { sendOtp, normalizeIndianPhoneNumber } = require('../config/sms');

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

    await sendOtp({
      to: phone,
      otp,
    });

    storeOTP(normalizeIndianPhoneNumber(phone), otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully.',
    });
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

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res, next) => {
  try {
    const {
      fullName, phone, district, venueAddress,
      distanceFromKateel, eventType, numberOfMembers,
      eventDate, specialNotes,
    } = req.body;

    if (!consumeVerifiedPhone(normalizeIndianPhoneNumber(phone))) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your phone number with an OTP before submitting the booking.',
      });
    }

    const booking = await Booking.create({
      fullName, phone, district, venueAddress,
      distanceFromKateel, eventType, numberOfMembers,
      eventDate, specialNotes, otpVerified: true,
    });

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

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      bookings,
    });
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

// @desc    Update booking status (admin)
// @route   PATCH /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // When approved — auto-create an event entry and show on home page
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
        // Re-show if it was hidden
        await Event.findByIdAndUpdate(existing._id, { showOnHome: true });
      }
    }

    // When rejected — hide from home if it was shown
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

module.exports = { sendOTP, verifyOTPHandler, createBooking, getAllBookings, getBookingById, updateBookingStatus, deleteBooking };

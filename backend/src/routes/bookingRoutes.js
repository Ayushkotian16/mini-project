const express = require('express');
const router = express.Router();
const {
  sendOTP, verifyOTPHandler, createBooking,
  getAllBookings, getBookingById, updateBookingStatus, deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPHandler);
router.post('/', createBooking);

// Admin routes
router.get('/', protect, getAllBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, updateBookingStatus);
router.delete('/:id', protect, deleteBooking);

module.exports = router;

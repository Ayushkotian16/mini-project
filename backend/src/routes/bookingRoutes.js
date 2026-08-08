const express = require('express');
const router = express.Router();
const {
  sendOTP, verifyOTPHandler, getPricing, checkAvailability, createBooking,
  getAllBookings, getBookingById, updateBooking, updateBookingStatus, deleteBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTPHandler);
router.get('/pricing', getPricing);
router.get('/check-availability', checkAvailability);
router.post('/', createBooking);

// Admin routes
router.get('/', protect, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, updateBooking);
router.patch('/:id/status', protect, updateBookingStatus);
router.delete('/:id', protect, deleteBooking);

module.exports = router;

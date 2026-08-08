const crypto = require('crypto');
const Booking = require('../models/Booking');

let razorpayInstance = null;

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  if (!razorpayInstance) {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

// @desc    Get Razorpay config (key_id + advance %) for frontend
// @route   GET /api/payments/config
// @access  Public
const getConfig = async (req, res) => {
  const enabled = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  // Read advance percent from DB pricing section (falls back to .env, then 20)
  let advancePercent = Number(process.env.RAZORPAY_ADVANCE_PERCENT) || 20;
  try {
    const SiteContent = require('../models/SiteContent');
    const doc = await SiteContent.findOne({ section: 'pricing' });
    if (doc?.data?.advancePercent !== undefined) {
      advancePercent = Number(doc.data.advancePercent);
    }
  } catch (_) {}
  res.json({
    success: true,
    enabled,
    keyId: enabled ? process.env.RAZORPAY_KEY_ID : null,
    advancePercent,
  });
};

// @desc    Create Razorpay order for advance payment
// @route   POST /api/payments/create-order
// @access  Public
const createOrder = async (req, res, next) => {
  try {
    const rz = getRazorpay();
    if (!rz) {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured.' });
    }

    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required.' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Get advance percent from DB, fallback to env, fallback to 20
    let dbAdvance = Number(process.env.RAZORPAY_ADVANCE_PERCENT) || 20;
    try {
      const SiteContent = require('../models/SiteContent');
      const doc = await SiteContent.findOne({ section: 'pricing' });
      if (doc?.data?.advancePercent !== undefined) dbAdvance = Number(doc.data.advancePercent);
    } catch (_) {}

    // Use finalPrice if set, otherwise fall back to estimatedPrice, then calculate from members
    const basePrice = booking.finalPrice || booking.estimatedPrice || (booking.numberOfMembers * (booking.pricePerMember || 1000));
    const advanceAmount = Math.max(1, Math.round((basePrice * dbAdvance) / 100));
    const amountPaise = advanceAmount * 100; // Razorpay needs paise, minimum 100 (₹1)

    console.log(`Creating Razorpay order: bookingId=${bookingId}, basePrice=${basePrice}, advance=${dbAdvance}%, amount=₹${advanceAmount}`);

    const order = await rz.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: bookingId.toString().slice(-40), // max 40 chars
      notes: {
        bookingId: bookingId.toString(),
        customerName: booking.fullName,
        eventType: booking.eventType,
      },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: amountPaise,
      advanceAmount,
      advancePct: dbAdvance,
      currency: 'INR',
      bookingId,
      customerName: booking.fullName,
      customerPhone: booking.phone,
    });
  } catch (error) {
    console.error('Razorpay createOrder error:', error?.error || error?.message || error);
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Public
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Mark booking as payment received
    await Booking.findByIdAndUpdate(bookingId, {
      $set: {
        paymentStatus: 'advance_paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      },
    });

    res.json({ success: true, message: 'Payment verified successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getConfig, createOrder, verifyPayment };

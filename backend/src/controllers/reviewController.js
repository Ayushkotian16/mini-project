const Review = require('../models/Review');

// @desc    Get approved reviews (public)
// @route   GET /api/reviews
// @access  Public
const getApprovedReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (admin)
// @route   GET /api/reviews/admin
// @access  Private
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a review (public)
// @route   POST /api/reviews
// @access  Public
const submitReview = async (req, res, next) => {
  try {
    const { name, message, rating, eventType } = req.body;
    const review = await Review.create({
      name,
      message,
      rating,
      eventType,
      isApproved: false,
    });
    res.status(201).json({
      success: true,
      message: 'Thank you for your review! It will be visible after approval.',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve review (admin)
// @route   PATCH /api/reviews/:id/approve
// @access  Private
const approveReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.status(200).json({ success: true, message: 'Review approved.', review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review (admin)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }
    res.status(200).json({ success: true, message: 'Review deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getApprovedReviews, getAllReviews, submitReview, approveReview, deleteReview };

const express = require('express');
const router = express.Router();
const { getApprovedReviews, getAllReviews, submitReview, approveReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public
router.get('/', getApprovedReviews);
router.post('/', submitReview);

// Admin
router.get('/admin/all', protect, getAllReviews);
router.patch('/:id/approve', protect, approveReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;

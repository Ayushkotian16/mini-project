const express = require('express');
const router = express.Router();
const { submitContact, getAllMessages, markAsRead, deleteMessage } = require('../controllers/contactController');
const { protect } = require('../middleware/auth');

// Public
router.post('/', submitContact);

// Admin
router.get('/', protect, getAllMessages);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteMessage);

module.exports = router;

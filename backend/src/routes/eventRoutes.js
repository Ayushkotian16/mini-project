const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { protect } = require('../middleware/auth');

// Public
router.get('/', getEvents);
router.get('/:id', getEventById);

// Admin
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;

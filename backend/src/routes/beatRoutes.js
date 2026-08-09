const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getBeats, getAllBeats, createBeat, updateBeat, deleteBeat } = require('../controllers/beatController');

// Public
router.get('/', getBeats);

// Admin
router.get('/admin/all', protect, getAllBeats);
router.post('/', protect, createBeat);
router.put('/:id', protect, updateBeat);
router.delete('/:id', protect, deleteBeat);

module.exports = router;

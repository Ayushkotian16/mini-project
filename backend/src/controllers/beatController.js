const Beat = require('../models/Beat');

// @desc    Get all active beats (public)
// @route   GET /api/beats
// @access  Public
const getBeats = async (req, res, next) => {
  try {
    const beats = await Beat.find({ status: 'active' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, beats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all beats including drafts (admin)
// @route   GET /api/beats/admin/all
// @access  Private
const getAllBeats = async (req, res, next) => {
  try {
    const beats = await Beat.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, beats });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a beat (admin)
// @route   POST /api/beats
// @access  Private
const createBeat = async (req, res, next) => {
  try {
    const beat = await Beat.create(req.body);
    res.status(201).json({ success: true, beat });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a beat (admin)
// @route   PUT /api/beats/:id
// @access  Private
const updateBeat = async (req, res, next) => {
  try {
    const beat = await Beat.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!beat) return res.status(404).json({ success: false, message: 'Beat not found.' });
    res.status(200).json({ success: true, beat });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a beat (admin)
// @route   DELETE /api/beats/:id
// @access  Private
const deleteBeat = async (req, res, next) => {
  try {
    const beat = await Beat.findByIdAndDelete(req.params.id);
    if (!beat) return res.status(404).json({ success: false, message: 'Beat not found.' });
    res.status(200).json({ success: true, message: 'Beat deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBeats, getAllBeats, createBeat, updateBeat, deleteBeat };

const Event = require('../models/Event');

// @desc    Get all events (public)
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const { status, category, showOnHome } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (showOnHome === 'true') filter.showOnHome = true;

    // Auto-update upcoming events that have passed to 'past'
    await Event.updateMany(
      { status: 'upcoming', date: { $lt: new Date() } },
      { $set: { status: 'past' } }
    );

    const events = await Event.find(filter).sort({ date: -1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// @desc    Create event (admin)
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, message: 'Event created.', event });
  } catch (error) {
    next(error);
  }
};

// @desc    Update event (admin)
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.status(200).json({ success: true, message: 'Event updated.', event });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete event (admin)
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.status(200).json({ success: true, message: 'Event deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };

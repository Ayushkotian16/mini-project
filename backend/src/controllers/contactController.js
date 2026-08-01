const Contact = require('../models/Contact');

// @desc    Submit contact message (public)
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const message = await Contact.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Your message has been sent. We will get back to you soon.',
      contact: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact messages (admin)
// @route   GET /api/contact
// @access  Private
const getAllMessages = async (req, res, next) => {
  try {
    const { isRead } = req.query;
    const filter = {};
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const messages = await Contact.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read (admin)
// @route   PATCH /api/contact/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    res.status(200).json({ success: true, message: 'Marked as read.', contact: message });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact message (admin)
// @route   DELETE /api/contact/:id
// @access  Private
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Contact.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    res.status(200).json({ success: true, message: 'Message deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitContact, getAllMessages, markAsRead, deleteMessage };

const TeamMember = require('../models/TeamMember');

// @desc    Get all team members (public - only active)
// @route   GET /api/team
// @access  Public
const getTeamMembers = async (req, res, next) => {
  try {
    // Sort by order ascending — lower order = shown first on public page
    const members = await TeamMember.find({ status: 'active' }).sort({ order: 1, joinedDate: 1 });
    res.status(200).json({ success: true, members });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all team members (admin - all statuses)
// @route   GET /api/team/admin
// @access  Private
const getAllTeamMembers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const members = await TeamMember.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, members });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single team member
// @route   GET /api/team/:id
// @access  Public
const getTeamMemberById = async (req, res, next) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found.' });
    }
    res.status(200).json({ success: true, member });
  } catch (error) {
    next(error);
  }
};

// @desc    Create team member (admin)
// @route   POST /api/team
// @access  Private
const createTeamMember = async (req, res, next) => {
  try {
    // If no order specified, put new member at the bottom
    if (req.body.order === undefined || req.body.order === null) {
      const count = await TeamMember.countDocuments();
      req.body.order = count;
    }
    const member = await TeamMember.create(req.body);
    res.status(201).json({ success: true, message: 'Team member added.', member });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team member (admin)
// @route   PUT /api/team/:id
// @access  Private
const updateTeamMember = async (req, res, next) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found.' });
    }
    res.status(200).json({ success: true, message: 'Team member updated.', member });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team member (admin)
// @route   DELETE /api/team/:id
// @access  Private
const deleteTeamMember = async (req, res, next) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found.' });
    }
    res.status(200).json({ success: true, message: 'Team member deleted.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit join application (public)
// @route   POST /api/team/apply
// @access  Public
const applyToJoin = async (req, res, next) => {
  try {
    // New applicants get high order number so they appear at bottom until admin promotes them
    const count = await TeamMember.countDocuments();
    const member = await TeamMember.create({ ...req.body, status: 'pending', order: count + 100 });
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. We will review and contact you.',
      member,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTeamMembers, getAllTeamMembers, getTeamMemberById, createTeamMember, updateTeamMember, deleteTeamMember, applyToJoin };

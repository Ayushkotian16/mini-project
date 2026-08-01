const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const generateToken = (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password.' });
    }
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const token = generateToken(admin._id, admin.username);
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      admin: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new admin
// @route   POST /api/auth/register
// @access  Public (first-time setup — locks after first admin exists)
const register = async (req, res, next) => {
  try {
    const { username, password, confirmPassword, secretKey } = req.body;

    // Basic validation
    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Secret key check — prevents random people from registering
    const REGISTER_SECRET = process.env.REGISTER_SECRET || 'nandini2024';
    if (secretKey !== REGISTER_SECRET) {
      return res.status(403).json({ success: false, message: 'Invalid registration secret key.' });
    }

    // Check if username already taken
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username already taken.' });
    }

    const admin = await Admin.create({ username, password });
    const token = generateToken(admin._id, admin.username);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully.',
      token,
      admin: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify token / get current admin
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    res.status(200).json({ success: true, admin });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, getMe };

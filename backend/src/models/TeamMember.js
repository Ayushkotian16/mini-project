const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  age: {
    type: Number,
    min: [10, 'Age must be at least 10'],
  },
  yearsOfExperience: {
    type: Number,
    default: 0,
    min: 0,
  },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    default: 'Beginner',
  },
  bio: {
    type: String,
    trim: true,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'pending',
  },
  performancesCompleted: {
    type: Number,
    default: 0,
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
  order: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);

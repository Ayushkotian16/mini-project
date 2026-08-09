const mongoose = require('mongoose');

const beatSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  audioUrl: { type: String, required: true },
  duration: { type: String, default: '' },
  category: { type: String, default: 'General' },
  status: { type: String, enum: ['active', 'draft'], default: 'active' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Beat', beatSchema);

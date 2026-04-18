const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  company: { type: String, trim: true },
  phone:   { type: String, trim: true },
  email:   { type: String, trim: true },
  service: { type: String, trim: true },
  notes:   { type: String },
  source:  { type: String, enum: ['referral', 'website', 'cold call', 'email', 'walk-in', 'other', 'manual', 'import'], default: 'manual' },
  status:  { type: String, enum: ['new', 'contacted', 'quoted', 'converted', 'closed'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', schema);

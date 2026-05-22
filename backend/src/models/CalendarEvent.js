const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  date:        { type: String, required: true }, // YYYY-MM-DD
  endDate:     { type: String },                 // YYYY-MM-DD (optional, for multi-day)
  type:        { type: String, enum: ['holiday', 'event'], default: 'event' },
  description: { type: String },
  color:       { type: String },
}, { timestamps: true });

module.exports = mongoose.model('CalendarEvent', schema);

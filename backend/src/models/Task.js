const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  assignedTo:  { type: [String], default: [] }, // usernames
  assignedBy:  { type: String },
  dueDate:     { type: String },                // YYYY-MM-DD
  status:      { type: String, enum: ['pending', 'in progress', 'completed'], default: 'pending' },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  jobRef:      { type: String },                // optional ATP number
}, { timestamps: true });

module.exports = mongoose.model('Task', schema);

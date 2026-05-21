const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  quoteId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', default: null },
  atpNumber:          { type: String, unique: true },
  clientName:         { type: String, required: true, trim: true },
  company:            { type: String, trim: true },
  jobName:            { type: String, trim: true },
  jobOwner:           { type: String, trim: true },
  designer:           { type: [String], default: [] },
  quotedHours:        { type: String },
  workedHours:        { type: String },
  status:             { type: String, enum: ['in progress', 'completed', 'on hold', 'cancelled'], default: 'in progress' },
  rajFeedback:        { type: String },
  startedDate:        { type: Date },
  expectedCompletion: { type: Date },
  releaseDate:        { type: Date },
  backupDate:         { type: Date },
  paymentStatus:      { type: String, enum: ['pending', 'partial', 'received'], default: 'pending' },
  paymentMode:        { type: String, enum: ['bank transfer', 'cheque', 'UPI', 'cash', 'other', ''] },
  paymentNotes:       { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Job', schema);

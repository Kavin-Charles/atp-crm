const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  enquiryId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Enquiry', default: null },
  clientName:   { type: String, required: true, trim: true },
  company:      { type: String, trim: true },
  jobName:      { type: String, trim: true },
  quoteDetails: { type: String },
  quotedHours:  { type: String },
  validUntil:   { type: Date },
  status:       { type: String, enum: ['pending', 'approved', 'rejected', 'converted'], default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('Quote', schema);

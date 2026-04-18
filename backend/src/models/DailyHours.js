const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  jobId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
  jobName:        { type: String, trim: true },
  designer:       { type: String, trim: true },
  date:           { type: Date },
  startTime:      { type: String },
  endTime:        { type: String },
  task:           { type: String },
  estimatedHours: { type: Number },
  actualHours:    { type: Number },
  remarks:        { type: String },
}, { timestamps: true });

module.exports = mongoose.model('DailyHours', schema);

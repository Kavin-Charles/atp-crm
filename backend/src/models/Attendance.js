const mongoose = require('mongoose');

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  role: {
    type: String,
  },
  loginTime: {
    type: Date,
    default: Date.now,
    required: true,
  },
  logoutTime: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'auto_closed'],
    default: 'active',
  },
  ipAddress: {
    type: String,
  },
}, {
  timestamps: true,
});

attendanceSchema.statics.autoCloseStaleSessions = async function(userId = null) {
  const cutoff = new Date(Date.now() - EIGHT_HOURS_MS);
  const filter = {
    status: 'active',
    loginTime: { $lte: cutoff },
  };
  if (userId) {
    filter.userId = userId;
  }

  const staleSessions = await this.find(filter);
  for (const session of staleSessions) {
    session.status = 'auto_closed';
    session.logoutTime = new Date(session.loginTime.getTime() + EIGHT_HOURS_MS);
    await session.save();
  }
};

module.exports = mongoose.model('Attendance', attendanceSchema);

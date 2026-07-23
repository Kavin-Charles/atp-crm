const Attendance = require('../models/Attendance');

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

exports.requireAuth = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Check 8-hour session expiration
  if (req.session.loginTime && (Date.now() - req.session.loginTime >= EIGHT_HOURS_MS)) {
    if (req.session.attendanceId) {
      try {
        const att = await Attendance.findById(req.session.attendanceId);
        if (att && att.status === 'active') {
          att.status = 'auto_closed';
          att.logoutTime = new Date(req.session.loginTime + EIGHT_HOURS_MS);
          await att.save();
        }
      } catch (err) {
        console.error('Error auto-closing attendance session in middleware:', err);
      }
    }
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Session expired after 8 hours. Please log in again.' });
  }

  next();
};

exports.requireRole = (...roles) => async (req, res, next) => {
  if (!req.session?.userId) return res.status(401).json({ error: 'Not authenticated' });

  // Check 8-hour session expiration
  if (req.session.loginTime && (Date.now() - req.session.loginTime >= EIGHT_HOURS_MS)) {
    if (req.session.attendanceId) {
      try {
        const att = await Attendance.findById(req.session.attendanceId);
        if (att && att.status === 'active') {
          att.status = 'auto_closed';
          att.logoutTime = new Date(req.session.loginTime + EIGHT_HOURS_MS);
          await att.save();
        }
      } catch (err) {
        console.error('Error auto-closing attendance session in middleware:', err);
      }
    }
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Session expired after 8 hours. Please log in again.' });
  }

  if (!roles.includes(req.session.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

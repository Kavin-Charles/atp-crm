const router = require('express').Router();
const Attendance = require('../models/Attendance');
const { requireAuth } = require('../middleware/auth');

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

// GET /api/attendance/current - get current user's active session
router.get('/current', requireAuth, async (req, res, next) => {
  try {
    await Attendance.autoCloseStaleSessions(req.session.userId);

    const active = await Attendance.findOne({
      userId: req.session.userId,
      status: 'active',
    }).sort({ loginTime: -1 });

    if (!active) {
      return res.json({ activeSession: null });
    }

    const elapsed = Date.now() - new Date(active.loginTime).getTime();
    const timeRemainingMs = Math.max(0, EIGHT_HOURS_MS - elapsed);

    res.json({
      activeSession: active,
      timeRemainingMs,
      elapsedMs: elapsed,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/attendance - list attendance logs
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { role, userId } = req.session;
    const { username, startDate, endDate, status } = req.query;

    await Attendance.autoCloseStaleSessions();

    let filter = {};

    // Non-admin/managers can only see their own logs
    if (role !== 'admin' && role !== 'manager') {
      filter.userId = userId;
    } else if (username) {
      filter.username = username.toLowerCase();
    }

    if (status) {
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.loginTime = {};
      if (startDate) {
        filter.loginTime.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.loginTime.$lte = end;
      }
    }

    const logs = await Attendance.find(filter).sort({ loginTime: -1 }).limit(500);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

const router = require('express').Router();
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { requireAuth } = require('../middleware/auth');

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = await User.findOne({ username: username.toLowerCase(), active: true });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Auto-close any existing active attendance session for this user
    await Attendance.autoCloseStaleSessions(user._id);

    const existingActive = await Attendance.findOne({ userId: user._id, status: 'active' });
    if (existingActive) {
      const elapsed = Date.now() - new Date(existingActive.loginTime).getTime();
      if (elapsed >= EIGHT_HOURS_MS) {
        existingActive.status = 'auto_closed';
        existingActive.logoutTime = new Date(new Date(existingActive.loginTime).getTime() + EIGHT_HOURS_MS);
      } else {
        existingActive.status = 'completed';
        existingActive.logoutTime = new Date();
      }
      await existingActive.save();
    }

    // Create a new attendance log entry for this login
    const now = new Date();
    const attendance = await Attendance.create({
      userId: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      loginTime: now,
      status: 'active',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    });

    req.session.userId = user._id;
    req.session.username = user.username;
    req.session.name = user.name;
    req.session.role = user.role;
    req.session.attendanceId = attendance._id;
    req.session.loginTime = now.getTime();

    res.json({ user: user.toSafe() });
  } catch (err) { next(err); }
});

router.post('/logout', async (req, res) => {
  try {
    if (req.session?.attendanceId) {
      const att = await Attendance.findById(req.session.attendanceId);
      if (att && att.status === 'active') {
        att.logoutTime = new Date();
        att.status = 'completed';
        await att.save();
      }
    }
  } catch (err) {
    console.error('Error closing attendance session on logout:', err);
  }
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'Session expired' });
    res.json({ user: user.toSafe() });
  } catch (err) { next(err); }
});

router.put('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'Session expired' });

    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(400).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

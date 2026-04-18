const router = require('express').Router();
const User = require('../models/User');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const users = await User.find({}, '-password').sort({ name: 1 });
    res.json(users);
  } catch (err) { next(err); }
});

router.post('/', requireRole('admin'), async (req, res, next) => {
  try {
    const { username, password, name, role } = req.body;
    if (!username || !password || !name) return res.status(400).json({ error: 'username, password, and name are required' });
    const user = new User({ username, password, name, role });
    await user.save();
    res.status(201).json(user.toSafe());
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Username already exists' });
    next(err);
  }
});

router.put('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    const { username, password, name, role, active } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (username) user.username = username;
    if (name) user.name = name;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;
    if (password) user.password = password;

    await user.save();
    res.json(user.toSafe());
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Username already exists' });
    next(err);
  }
});

router.delete('/:id', requireRole('admin'), async (req, res, next) => {
  try {
    if (req.session.userId.toString() === req.params.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

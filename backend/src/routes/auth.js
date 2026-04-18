const router = require('express').Router();
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const user = await User.findOne({ username: username.toLowerCase(), active: true });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.userId   = user._id;
    req.session.username = user.username;
    req.session.name     = user.name;
    req.session.role     = user.role;

    res.json({ user: user.toSafe() });
  } catch (err) { next(err); }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'Session expired' });
    res.json({ user: user.toSafe() });
  } catch (err) { next(err); }
});

module.exports = router;

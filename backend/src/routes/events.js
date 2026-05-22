const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const CalendarEvent = require('../models/CalendarEvent');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const events = await CalendarEvent.find().sort({ date: 1 });
    res.json(events);
  } catch (err) { next(err); }
});

router.post('/', requireAuth, requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const event = await CalendarEvent.create(req.body);
    res.status(201).json(event);
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ error: 'Not found' });
    res.json(event);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    await CalendarEvent.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

const router = require('express').Router();
const Job = require('../models/Job');
const Quote = require('../models/Quote');
const { requireAuth, requireRole } = require('../middleware/auth');
const { generateAtpNumber } = require('../utils/atpNumber');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { role, username } = req.session;
    const filter = (role === 'admin' || role === 'manager')
      ? {}
      : { $or: [{ designer: username }, { jobOwner: username }] };
    res.json(await Job.find(filter).sort({ createdAt: -1 }));
  } catch (err) { next(err); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const atpNumber = req.body.atpNumber || await generateAtpNumber();
    const job = await Job.create({ ...req.body, atpNumber });
    if (req.body.quoteId) {
      await Quote.findByIdAndUpdate(req.body.quoteId, { status: 'converted' });
    }
    res.status(201).json(job);
  } catch (err) { next(err); }
});

router.post('/bulk', requireAuth, async (req, res, next) => {
  try {
    const results = [];
    for (const item of req.body) {
      const atpNumber = item.atpNumber || await generateAtpNumber();
      const job = await Job.create({ ...item, atpNumber });
      results.push(job);
    }
    res.json({ count: results.length });
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const body = { ...req.body };
    // Auto-complete when both release and backup dates are set
    const existing = await Job.findById(req.params.id).lean();
    const releaseDate = body.releaseDate !== undefined ? body.releaseDate : existing?.releaseDate;
    const backupDate  = body.backupDate  !== undefined ? body.backupDate  : existing?.backupDate;
    if (releaseDate && backupDate && body.status !== 'cancelled') {
      body.status = 'completed';
    }
    const job = await Job.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ error: 'Not found' });
    res.json(job);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

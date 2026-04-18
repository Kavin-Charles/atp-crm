const router = require('express').Router();
const Enquiry = require('../models/Enquiry');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json(await Enquiry.find().sort({ createdAt: -1 }));
  } catch (err) { next(err); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const enq = await Enquiry.create(req.body);
    res.status(201).json(enq);
  } catch (err) { next(err); }
});

router.post('/bulk', requireAuth, async (req, res, next) => {
  try {
    const items = req.body.map((i) => ({ ...i, source: 'import' }));
    const result = await Enquiry.insertMany(items, { ordered: false });
    res.json({ count: result.length });
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const enq = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!enq) return res.status(404).json({ error: 'Not found' });
    res.json(enq);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

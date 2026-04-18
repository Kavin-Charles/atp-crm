const router = require('express').Router();
const Quote = require('../models/Quote');
const Enquiry = require('../models/Enquiry');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json(await Quote.find().sort({ createdAt: -1 }));
  } catch (err) { next(err); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const quote = await Quote.create(req.body);
    if (req.body.enquiryId) {
      await Enquiry.findByIdAndUpdate(req.body.enquiryId, { status: 'quoted' });
    }
    res.status(201).json(quote);
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quote) return res.status(404).json({ error: 'Not found' });
    res.json(quote);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

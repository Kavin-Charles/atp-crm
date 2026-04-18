const router = require('express').Router();
const mongoose = require('mongoose');
const { requireRole } = require('../middleware/auth');

const ALLOWED = new Set(['enquiries', 'quotes', 'jobs', 'dailyhours', 'users']);

router.get('/collections', requireRole('admin'), async (req, res, next) => {
  try {
    const cols = await mongoose.connection.db.listCollections().toArray();
    res.json(cols.map((c) => c.name).filter((n) => ALLOWED.has(n)));
  } catch (err) { next(err); }
});

router.get('/:collection', requireRole('admin'), async (req, res, next) => {
  try {
    const { collection } = req.params;
    if (!ALLOWED.has(collection)) return res.status(400).json({ error: 'Invalid collection' });
    const col = mongoose.connection.db.collection(collection);
    const docs = await col.find({}).toArray();
    res.json(docs);
  } catch (err) { next(err); }
});

module.exports = router;

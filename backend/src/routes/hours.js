const router = require('express').Router();
const DailyHours = require('../models/DailyHours');
const Job = require('../models/Job');
const { requireAuth, requireRole } = require('../middleware/auth');

// Recalculate and sync a job's workedHours from all its hour entries
async function syncJobHours(jobId) {
  if (!jobId) return;
  const result = await DailyHours.aggregate([
    { $match: { jobId: jobId } },
    { $group: { _id: null, total: { $sum: '$actualHours' } } },
  ]);
  const total = result.length ? result[0].total : 0;
  await Job.findByIdAndUpdate(jobId, { workedHours: String(total) });
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    res.json(await DailyHours.find().sort({ date: -1 }));
  } catch (err) { next(err); }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const entry = await DailyHours.create(req.body);
    await syncJobHours(entry.jobId);
    res.status(201).json(entry);
  } catch (err) { next(err); }
});

router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const old = await DailyHours.findById(req.params.id);
    if (!old) return res.status(404).json({ error: 'Not found' });

    const oldJobId = old.jobId;
    const entry = await DailyHours.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Sync the new job
    await syncJobHours(entry.jobId);
    // If the job changed, also sync the old job
    if (oldJobId && oldJobId.toString() !== entry.jobId?.toString()) {
      await syncJobHours(oldJobId);
    }

    res.json(entry);
  } catch (err) { next(err); }
});

router.delete('/:id', requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const entry = await DailyHours.findByIdAndDelete(req.params.id);
    if (entry) await syncJobHours(entry.jobId);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

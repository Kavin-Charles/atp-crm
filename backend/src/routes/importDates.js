const router = require('express').Router();
const Job = require('../models/Job');

const UPDATES = [
  { atp: 'ATP-26-001', release: '2026-08-01', backup: '2026-07-05' },
  { atp: 'ATP-26-005', release: '2026-09-01', backup: '2026-07-05' },
  { atp: 'ATP-26-006', release: '2026-02-20', backup: '2026-07-05' },
  { atp: 'ATP-26-008', release: '2026-11-03', backup: '2026-07-05' },
  { atp: 'ATP-26-009', release: '2026-02-02', backup: '2026-07-05' },
  { atp: 'ATP-26-010', release: '2026-02-27', backup: '2026-07-05' },
  { atp: 'ATP-26-011', release: '2026-12-02', backup: '2026-07-05' },
  { atp: 'ATP-26-020', release: '2026-03-16', backup: '2026-07-05' },
  { atp: 'ATP-26-023', release: '2026-04-02', backup: '2026-07-05' },
  { atp: 'ATP-26-024', release: '2026-01-30', backup: '2026-07-05' },
  { atp: 'ATP-26-025', release: '2026-06-04', backup: '2026-07-05' },
  { atp: 'ATP-26-026', release: '2026-10-02', backup: '2026-07-05' },
  { atp: 'ATP-26-027', release: '2026-09-03', backup: '2026-07-05' },
  { atp: 'ATP-26-028', release: '2026-03-28', backup: '2026-07-05' },
  { atp: 'ATP-26-030', release: '2026-03-27', backup: '2026-07-05' },
  { atp: 'ATP-26-031', release: '2026-03-19', backup: '2026-07-05' },
  { atp: 'ATP-26-032', release: '2026-03-23', backup: '2026-07-05' },
  { atp: 'ATP-26-033', release: '2026-11-03', backup: '2026-07-05' },
  { atp: 'ATP-26-038', release: '2026-02-20', backup: '2026-07-05' },
  { atp: 'ATP-26-039', release: '2026-10-05', backup: '2026-07-05' },
  { atp: 'ATP-26-040', release: '2026-03-24', backup: '2026-07-05' },
  { atp: 'ATP-26-042', release: '2026-02-26', backup: '2026-07-05' },
  { atp: 'ATP-26-043', release: '2026-02-25', backup: '2026-07-05' },
  { atp: 'ATP-26-049', release: '2026-03-19', backup: '2026-07-05' },
  { atp: 'ATP-26-052', release: '2026-09-04', backup: '2026-07-05' },
  { atp: 'ATP-26-053', release: '2026-09-03', backup: '2026-07-05' },
  { atp: 'ATP-26-054', release: '2026-04-16', backup: '2026-07-05' },
  { atp: 'ATP-26-057', release: '2026-03-31', backup: '2026-07-05' },
  { atp: 'ATP-26-059', release: '2026-03-23', backup: '2026-07-05' },
  { atp: 'ATP-26-060', release: '2026-03-19', backup: '2026-07-05' },
  { atp: 'ATP-26-063', release: '2026-04-16', backup: '2026-07-05' },
  { atp: 'ATP-26-070', release: '2026-04-05', backup: '2026-07-05' },
  { atp: 'ATP-26-071', release: '2026-09-04', backup: '2026-07-05' },
  { atp: 'ATP-26-074', release: '2026-05-13', backup: '2026-05-18' },
];

router.post('/', async (req, res, next) => {
  try {
    const results = [];
    for (const u of UPDATES) {
      const set = { updatedAt: new Date() };
      if (u.release) set.releaseDate = new Date(u.release);
      if (u.backup)  set.backupDate  = new Date(u.backup);
      if (u.release && u.backup) set.status = 'completed';
      const r = await Job.updateOne({ atpNumber: u.atp }, { $set: set });
      results.push({ atp: u.atp, matched: r.matchedCount, modified: r.modifiedCount });
    }
    const updated = results.filter(r => r.modified).length;
    const notFound = results.filter(r => !r.matched).length;
    res.json({ ok: true, updated, notFound, results });
  } catch (err) { next(err); }
});

module.exports = router;

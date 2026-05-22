const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://KavinCharles:jaya2005@cluster0.xaxng.mongodb.net/atp_crm';

const updates = [
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

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Atlas');
  const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }), 'jobs');
  let updated = 0, notFound = 0;
  for (const u of updates) {
    const set = { updatedAt: new Date() };
    if (u.release) set.releaseDate = new Date(u.release);
    if (u.backup)  set.backupDate  = new Date(u.backup);
    if (u.release && u.backup) set.status = 'completed';
    const r = await Job.updateOne({ atpNumber: u.atp }, { $set: set });
    if (r.matchedCount) { console.log(' ', u.atp, 'updated'); updated++; }
    else { console.log('  NOT FOUND:', u.atp); notFound++; }
  }
  console.log(`\nDone. Updated: ${updated}, Not found: ${notFound}`);
  await mongoose.disconnect();
}

main().catch(console.error);

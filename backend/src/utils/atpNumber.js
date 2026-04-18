const Job = require('../models/Job');

async function generateAtpNumber() {
  const year = new Date().getFullYear();
  const yy = String(year).slice(-2);
  const start = new Date(`${year}-01-01T00:00:00.000Z`);
  const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);
  const count = await Job.countDocuments({ createdAt: { $gte: start, $lt: end } });
  return `ATP-${yy}-${String(count + 1).padStart(3, '0')}`;
}

module.exports = { generateAtpNumber };

const User = require('../models/User');
const Job  = require('../models/Job');
const Quote = require('../models/Quote');

async function seedDatabase() {
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    const admin = new User({ username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' });
    await admin.save();
    console.log('✓ Default admin created (admin / admin123)');
  }

  const jobCount = await Job.countDocuments();
  if (jobCount > 0) return;

  const seedJobs = [
    { atpNumber: 'ATP-26-001', clientName: 'L3H',          company: 'L3Harris',      jobName: '1335473 Re. 02',       jobOwner: 'Nandakumar', designer: 'Sureshkumar', status: 'completed',   paymentStatus: 'received' },
    { atpNumber: 'ATP-26-002', clientName: 'Celestial AI',  company: 'CelestialAI',   jobName: 'PF-NIC',               jobOwner: 'Lawrence',   designer: '',            status: 'in progress', paymentStatus: 'pending'  },
    { atpNumber: 'ATP-26-003', clientName: 'Celestial AI',  company: 'CelestialAI',   jobName: 'WATV',                 jobOwner: 'Lawrence',   designer: '',            status: 'completed',   paymentStatus: 'received' },
    { atpNumber: 'ATP-26-004', clientName: 'FIT_FLEX',      company: 'FIT_FLEX',      jobName: 'FPC cable 106125',     jobOwner: 'Chandran',   designer: '',            status: 'completed',   paymentStatus: 'received' },
    { atpNumber: 'ATP-26-005', clientName: 'L3H',           company: 'L3Harris',      jobName: '966-6286-100 Rev. A',  jobOwner: 'Nandakumar', designer: 'Sureshkumar', status: 'in progress', paymentStatus: 'pending'  },
    { atpNumber: 'ATP-26-006', clientName: 'D-Matrix',      company: 'D-Matrix',      jobName: 'PCIe_Riser_Card_V3',  jobOwner: 'Manikandan', designer: '',            status: 'in progress', paymentStatus: 'partial'  },
    { atpNumber: 'ATP-26-007', clientName: 'Frore Systems', company: 'Frore Systems', jobName: 'BH4.51C1',            jobOwner: 'Chandran',   designer: '',            status: 'completed',   paymentStatus: 'pending'  },
    { atpNumber: 'ATP-26-008', clientName: 'Frore Systems', company: 'Frore Systems', jobName: 'TEST_BOARD_A2',       jobOwner: 'Nandakumar', designer: 'Sureshkumar', status: 'in progress', paymentStatus: 'pending'  },
    { atpNumber: 'ATP-26-009', clientName: 'Macom',         company: 'Macom',         jobName: 'PT-0043085A',         jobOwner: 'Nandakumar', designer: 'Vignesh',     status: 'completed',   paymentStatus: 'received' },
  ];
  await Job.insertMany(seedJobs);

  const seedQuotes = [
    { clientName: 'Macom',     company: 'Macom',     jobName: 'MAEQ-40904', quoteDetails: 'Substrate Complete package', quotedHours: '32 Hours', status: 'converted' },
    { clientName: 'fit4flex',  company: 'FIT_FLEX',  jobName: '106125',     quoteDetails: 'see mail',                   quotedHours: '',         status: 'converted' },
    { clientName: 'L3Harris',  company: 'L3Harris',  jobName: '1335473',    quoteDetails: 'CADXY from gerber',          quotedHours: '20 Hours', status: 'converted' },
  ];
  await Quote.insertMany(seedQuotes);

  console.log('✓ Sample data seeded');
}

module.exports = { seedDatabase };

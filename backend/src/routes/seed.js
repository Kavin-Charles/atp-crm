const User = require('../models/User');
const Job  = require('../models/Job');
const Quote = require('../models/Quote');
const CalendarEvent = require('../models/CalendarEvent');

async function seedDatabase() {
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    const admin = new User({ username: 'admin', password: 'admin123', name: 'Administrator', role: 'admin' });
    await admin.save();
    console.log('✓ Default admin created (admin / admin123)');
  }

  const namedAdmins = [
    { username: 'rajsundari', password: 'rajsundari123', name: 'Rajsundari' },
    { username: 'charles',    password: 'charles123',    name: 'Charles' },
    { username: 'sivakumar',  password: 'sivakumar123',  name: 'Sivakumar' },
  ];
  for (const a of namedAdmins) {
    const exists = await User.findOne({ username: a.username });
    if (!exists) {
      await new User({ ...a, role: 'admin' }).save();
      console.log(`✓ Admin created: ${a.username}`);
    }
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

async function seedHolidays() {
  const exists = await CalendarEvent.findOne({ type: 'holiday', date: '2026-01-26' });
  if (exists) return;
  const holidays = [
    { title: 'Republic Day',          date: '2026-01-26', type: 'holiday' },
    { title: 'Tamil New Year',        date: '2026-04-14', type: 'holiday' },
    { title: 'May Day',               date: '2026-05-01', type: 'holiday' },
    { title: 'USA Holiday',           date: '2026-05-23', type: 'holiday' },
    { title: 'Independence Day',      date: '2026-08-15', type: 'holiday' },
    { title: 'USA Holiday',           date: '2026-09-07', type: 'holiday' },
    { title: 'Vinayagar Chathurthi',  date: '2026-09-14', type: 'holiday' },
    { title: 'Gandhi Jayanthi',       date: '2026-10-02', type: 'holiday' },
    { title: 'Navarathiri (Optional)',date: '2026-10-16', type: 'holiday', description: 'Few people take day off' },
    { title: 'Deepavali',             date: '2026-11-06', type: 'holiday' },
    { title: 'Deepavali',             date: '2026-11-07', type: 'holiday' },
    { title: 'Deepavali',             date: '2026-11-08', type: 'holiday' },
    { title: 'Thanksgiving',          date: '2026-11-27', type: 'holiday' },
    { title: 'Thanksgiving',          date: '2026-11-28', type: 'holiday' },
    { title: 'Thanksgiving',          date: '2026-11-29', type: 'holiday' },
    { title: 'Christmas',             date: '2026-12-25', type: 'holiday' },
    { title: 'Christmas',             date: '2026-12-26', type: 'holiday' },
    { title: 'New Year',              date: '2027-01-01', type: 'holiday' },
  ];
  await CalendarEvent.insertMany(holidays);
  console.log('✓ Holidays seeded');
}

module.exports = { seedDatabase, seedHolidays };

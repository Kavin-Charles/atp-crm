const router = require('express').Router();
const Enquiry = require('../models/Enquiry');
const Quote   = require('../models/Quote');
const Job     = require('../models/Job');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const [
      enqTotal, enqNew, enqQuoted,
      qTotal, qPending, qApproved, qConverted,
      jTotal, jInProgress, jCompleted, jOnHold,
      pPending, pPartial, pReceived,
      jReleased, jBackedUp,
    ] = await Promise.all([
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'new' }),
      Enquiry.countDocuments({ status: 'quoted' }),
      Quote.countDocuments(),
      Quote.countDocuments({ status: 'pending' }),
      Quote.countDocuments({ status: 'approved' }),
      Quote.countDocuments({ status: 'converted' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'in progress' }),
      Job.countDocuments({ status: 'completed' }),
      Job.countDocuments({ status: 'on hold' }),
      Job.countDocuments({ paymentStatus: 'pending' }),
      Job.countDocuments({ paymentStatus: 'partial' }),
      Job.countDocuments({ paymentStatus: 'received' }),
      Job.countDocuments({ releaseDate: { $exists: true, $ne: null } }),
      Job.countDocuments({ backupDate:  { $exists: true, $ne: null } }),
    ]);

    res.json({
      enquiries: { total: enqTotal, new: enqNew, quoted: enqQuoted },
      quotes:    { total: qTotal, pending: qPending, approved: qApproved, converted: qConverted },
      jobs:      { total: jTotal, inProgress: jInProgress, completed: jCompleted, onHold: jOnHold, released: jReleased, backedUp: jBackedUp },
      payments:  { pending: pPending, partial: pPartial, received: pReceived },
    });
  } catch (err) { next(err); }
});

module.exports = router;

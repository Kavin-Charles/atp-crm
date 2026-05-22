const router = require('express').Router();
const { requireAuth, requireRole } = require('../middleware/auth');
const Task = require('../models/Task');

// GET — admin sees all, others see only tasks assigned to them
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { role, username } = req.session;
    const filter = (role === 'admin' || role === 'manager') ? {} : { assignedTo: username };
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { next(err); }
});

router.post('/', requireAuth, requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    const task = await Task.create({ ...req.body, assignedBy: req.session.username });
    res.status(201).json(task);
  } catch (err) { next(err); }
});

// PUT — admin/manager can edit all fields; assignee can only update status
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { role, username } = req.session;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });

    let update = req.body;
    if (role !== 'admin' && role !== 'manager') {
      if (!task.assignedTo.includes(username)) return res.status(403).json({ error: 'Forbidden' });
      update = { status: req.body.status }; // only status allowed
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', requireAuth, requireRole('admin', 'manager'), async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

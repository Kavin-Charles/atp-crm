const router = require('express').Router();
const User = require('../models/User');

const USERS = [
  // designers
  { username: 'manikandan',       name: 'Manikandan',       role: 'designer', password: 'manikandan123' },
  { username: 'nandakumar',       name: 'Nandakumar',       role: 'designer', password: 'nandakumar123' },
  { username: 'chandran',         name: 'Chandran',         role: 'designer', password: 'chandran123' },
  { username: 'vignesh',          name: 'Vignesh',          role: 'designer', password: 'vignesh123' },
  { username: 'suresh',           name: 'Suresh',           role: 'designer', password: 'suresh123' },
  { username: 'udhay',            name: 'Udhay',            role: 'designer', password: 'udhay123' },
  { username: 'tamilselvan',      name: 'Tamil Selvan',     role: 'designer', password: 'tamilselvan123' },
  { username: 'roshanjacob',      name: 'Roshan Jacob',     role: 'designer', password: 'roshanjacob123' },
  { username: 'savitha',          name: 'Savitha',          role: 'designer', password: 'savitha123' },
  { username: 'sajini',           name: 'Sajini',           role: 'designer', password: 'sajini123' },
  { username: 'lawrence',         name: 'Lawrence',         role: 'designer', password: 'lawrence123' },
  { username: 'seetha',           name: 'Seetha',           role: 'designer', password: 'seetha123' },
  // managers
  { username: 'devasenathipathi', name: 'Devasenathipathi', role: 'manager',  password: 'devasenathipathi123' },
  { username: 'punitha',          name: 'Punitha',          role: 'manager',  password: 'punitha123' },
  { username: 'usharani',         name: 'Usharani',         role: 'manager',  password: 'usharani123' },
  // admins (ensure correct role, create if missing)
  { username: 'charlie',          name: 'Charlie',          role: 'admin',    password: 'charlie123' },
  { username: 'sivakumar',        name: 'Sivakumar',        role: 'admin',    password: 'sivakumar123' },
  { username: 'rajsundari',       name: 'Rajsundari',       role: 'admin',    password: 'rajsundari123' },
];

router.post('/', async (req, res, next) => {
  try {
    const results = [];
    for (const u of USERS) {
      const existing = await User.findOne({ username: u.username });
      if (existing) {
        // Update role and name if changed
        existing.role = u.role;
        existing.name = u.name;
        await existing.save();
        results.push({ username: u.username, action: 'updated' });
      } else {
        const user = new User(u);
        await user.save();
        results.push({ username: u.username, action: 'created' });
      }
    }
    res.json({ ok: true, count: results.length, results });
  } catch (err) { next(err); }
});

module.exports = router;

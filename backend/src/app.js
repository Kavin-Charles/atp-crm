const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const enquiryRoutes = require('./routes/enquiries');
const quoteRoutes = require('./routes/quotes');
const jobRoutes = require('./routes/jobs');
const hoursRoutes = require('./routes/hours');
const statsRoutes = require('./routes/stats');
const dataRoutes = require('./routes/data');
const importJobDetailsRoutes = require('./routes/importJobDetails');

const app = express();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/atp_crm';
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: isProd ? false : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'atp_crm_dev_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: 'lax',
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/hours', hoursRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/import-job-details', importJobDetailsRoutes);

if (isProd) {
  const distPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;

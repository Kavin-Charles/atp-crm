require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const { seedDatabase, seedHolidays } = require('./src/routes/seed');

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/atp_crm';

async function bootstrap() {
  await mongoose.connect(MONGO_URI);
  console.log('✓ MongoDB connected');

  await seedDatabase();
  await seedHolidays();

  app.listen(PORT, () => {
    console.log(`✓ ATP CRM backend running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

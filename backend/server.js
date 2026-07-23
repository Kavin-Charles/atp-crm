require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const { seedDatabase, seedHolidays } = require('./src/routes/seed');

const PORT = process.env.PORT || 3001;
let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/atp_crm';

async function bootstrap() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log('✓ MongoDB connected to local instance');
  } catch (err) {
    console.log('Local MongoDB not running. Starting in-memory MongoDB server fallback...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    MONGO_URI = mongod.getUri();
    await mongoose.connect(MONGO_URI);
    console.log('✓ MongoDB connected to in-memory instance');
  }

  await seedDatabase();
  await seedHolidays();

  app.listen(PORT, () => {
    console.log(`✓ ATP CRM backend running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { seedInitialData } from './seed/initialData.js';
import { migrateLegacyRideLocations } from './services/rideLocationMigration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

async function startServer() {
  await connectDatabase();
  await seedInitialData();
  await migrateLegacyRideLocations();

  const app = createApp();

  app.listen(PORT, HOST, () => {
    console.log(`Lift API listening at http://${HOST}:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start Lift API:', error);
  process.exit(1);
});

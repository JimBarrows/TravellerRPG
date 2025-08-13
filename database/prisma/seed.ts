/**
 * Prisma Seed Script
 * 
 * This script is run by Prisma CLI to seed the database with initial data.
 */

import { seedDatabase } from '../src/seed';
import { disconnect } from '../src/client';

async function main() {
  console.log('Running Prisma seed script...');
  await seedDatabase();
}

main()
  .then(async () => {
    console.log('Seed script completed successfully.');
    await disconnect();
  })
  .catch(async (e) => {
    console.error('Seed script failed:', e);
    await disconnect();
    process.exit(1);
  });
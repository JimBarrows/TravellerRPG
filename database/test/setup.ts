/**
 * Jest Test Setup
 * 
 * Global setup for Jest tests, including database connection and cleanup.
 */

// Set up test environment variables
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://test:test@localhost:5432/travellerrpg_test?schema=public";
process.env.NODE_ENV = "test";

import { db, disconnect } from '../src/client';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global test database setup
beforeAll(async () => {
  // Ensure test database is available
  try {
    await db.$connect();
    console.log('Test database connected.');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
});

// Global test database cleanup
afterAll(async () => {
  await disconnect();
  console.log('Test database disconnected.');
});

// Clean up between tests to ensure isolation
afterEach(async () => {
  // Clean up test data between tests
  // Be careful not to delete seed data in development
  if (process.env.NODE_ENV === 'test') {
    const tablenames = await db.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await db.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
        } catch (error) {
          console.log(`Could not truncate table ${tablename}, continuing...`);
        }
      }
    }
  }
});
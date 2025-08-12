#!/usr/bin/env node

/**
 * Database Migration Deployment Script
 * 
 * Deploys Prisma schema to AWS RDS PostgreSQL instance.
 * Can be used for both development and production deployments.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Environment configuration
const ENVIRONMENTS = {
  development: {
    name: 'Development',
    url: process.env.DEV_DATABASE_URL || process.env.DATABASE_URL
  },
  production: {
    name: 'Production (AWS RDS)',
    url: `postgresql://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT || 5432}/${process.env.RDS_DB_NAME}?schema=public`
  },
  test: {
    name: 'Test',
    url: process.env.TEST_DATABASE_URL
  }
};

async function deployMigrations(environment = 'development') {
  const config = ENVIRONMENTS[environment];
  
  if (!config || !config.url) {
    console.error(`❌ Invalid environment or missing database URL for: ${environment}`);
    console.error('Available environments:', Object.keys(ENVIRONMENTS));
    process.exit(1);
  }

  console.log(`🚀 Deploying database schema to ${config.name}...`);
  console.log(`📍 Database URL: ${config.url.replace(/:[^:@]*@/, ':***@')}`); // Hide password

  try {
    // Set the database URL for this deployment
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = config.url;

    console.log('📋 Validating Prisma schema...');
    execSync('npx prisma validate', { stdio: 'inherit' });

    console.log('🔄 Pushing schema to database...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    console.log('🎯 Generating Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log(`✅ Successfully deployed schema to ${config.name}!`);

    // Restore original DATABASE_URL
    if (originalUrl) {
      process.env.DATABASE_URL = originalUrl;
    }

  } catch (error) {
    console.error(`❌ Deployment failed:`, error.message);
    process.exit(1);
  }
}

async function seedDatabase(environment = 'development') {
  const config = ENVIRONMENTS[environment];
  
  if (!config || !config.url) {
    console.error(`❌ Invalid environment: ${environment}`);
    process.exit(1);
  }

  console.log(`🌱 Seeding database in ${config.name}...`);

  try {
    // Set the database URL for seeding
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = config.url;

    // Run the seed script
    execSync('node -e "require(\\'./src/seed\\').seedDatabase().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); })"', { 
      stdio: 'inherit',
      cwd: path.dirname(__dirname)
    });

    console.log(`✅ Successfully seeded ${config.name} database!`);

    // Restore original DATABASE_URL
    if (originalUrl) {
      process.env.DATABASE_URL = originalUrl;
    }

  } catch (error) {
    console.error(`❌ Seeding failed:`, error.message);
    process.exit(1);
  }
}

async function resetDatabase(environment = 'development') {
  const config = ENVIRONMENTS[environment];
  
  if (!config || !config.url) {
    console.error(`❌ Invalid environment: ${environment}`);
    process.exit(1);
  }

  if (environment === 'production') {
    console.error('❌ Cannot reset production database. Use manual SQL scripts for production resets.');
    process.exit(1);
  }

  console.log(`🔄 Resetting database in ${config.name}...`);
  console.log('⚠️  This will delete all data!');

  try {
    // Set the database URL for reset
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = config.url;

    console.log('💥 Resetting database...');
    execSync('npx prisma db push --force-reset --accept-data-loss', { stdio: 'inherit' });

    console.log(`✅ Successfully reset ${config.name} database!`);

    // Restore original DATABASE_URL
    if (originalUrl) {
      process.env.DATABASE_URL = originalUrl;
    }

  } catch (error) {
    console.error(`❌ Reset failed:`, error.message);
    process.exit(1);
  }
}

// CLI Interface
const command = process.argv[2];
const environment = process.argv[3] || 'development';

async function main() {
  switch (command) {
    case 'deploy':
      await deployMigrations(environment);
      break;
    case 'seed':
      await seedDatabase(environment);
      break;
    case 'reset':
      await resetDatabase(environment);
      break;
    case 'full':
      console.log('🔄 Running full deployment: deploy + seed');
      await deployMigrations(environment);
      await seedDatabase(environment);
      break;
    default:
      console.log(`
Database Migration Tool

Usage:
  node scripts/deploy-migrations.js <command> [environment]

Commands:
  deploy  - Deploy schema to database
  seed    - Seed database with initial data
  reset   - Reset database (dev/test only)
  full    - Deploy schema + seed data

Environments:
  development (default)
  production
  test

Examples:
  node scripts/deploy-migrations.js deploy production
  node scripts/deploy-migrations.js seed development
  node scripts/deploy-migrations.js full test
      `);
      process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
#!/usr/bin/env node

/**
 * Full Database Deployment Script
 * 
 * Deploys complete database with schema, security, optimization, and seed data.
 * Supports both development and production environments with proper safeguards.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ENVIRONMENTS = {
  development: {
    name: 'Development',
    url: process.env.DEV_DATABASE_URL || process.env.DATABASE_URL,
    allowDestructive: true
  },
  production: {
    name: 'Production (AWS RDS)',
    url: `postgresql://${process.env.RDS_USERNAME}:${process.env.RDS_PASSWORD}@${process.env.RDS_HOSTNAME}:${process.env.RDS_PORT || 5432}/${process.env.RDS_DB_NAME}?schema=public`,
    allowDestructive: false
  },
  test: {
    name: 'Test',
    url: process.env.TEST_DATABASE_URL,
    allowDestructive: true
  }
};

function executeSQL(sqlFile, config) {
  const sqlPath = path.join(__dirname, '..', 'sql', sqlFile);
  
  if (!fs.existsSync(sqlPath)) {
    console.warn(`⚠️  SQL file not found: ${sqlPath}`);
    return;
  }

  console.log(`📋 Executing ${sqlFile}...`);
  
  try {
    // Use psql to execute SQL file
    const command = `psql "${config.url}" -f "${sqlPath}" -v ON_ERROR_STOP=1`;
    execSync(command, { 
      stdio: 'inherit',
      env: { ...process.env, PGPASSWORD: extractPassword(config.url) }
    });
    console.log(`✅ Successfully executed ${sqlFile}`);
  } catch (error) {
    console.error(`❌ Failed to execute ${sqlFile}:`, error.message);
    throw error;
  }
}

function extractPassword(url) {
  const match = url.match(/:([^:@]+)@/);
  return match ? match[1] : '';
}

async function deployComplete(environment = 'development', options = {}) {
  const config = ENVIRONMENTS[environment];
  
  if (!config || !config.url) {
    console.error(`❌ Invalid environment or missing database URL for: ${environment}`);
    console.error('Available environments:', Object.keys(ENVIRONMENTS));
    process.exit(1);
  }

  console.log(`🚀 Starting complete deployment to ${config.name}...`);
  console.log(`📍 Database URL: ${config.url.replace(/:[^:@]*@/, ':***@')}`);
  
  if (environment === 'production' && !options.confirmProduction) {
    console.log('⚠️  PRODUCTION DEPLOYMENT DETECTED!');
    console.log('This will make irreversible changes to the production database.');
    console.log('Add --confirm-production flag to proceed.');
    process.exit(1);
  }

  try {
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = config.url;

    // Step 1: Validate schema
    console.log('\n🔍 Step 1: Validating Prisma schema...');
    execSync('npx prisma validate', { stdio: 'inherit' });

    // Step 2: Deploy schema
    console.log('\n📊 Step 2: Deploying database schema...');
    if (options.reset && config.allowDestructive) {
      console.log('💥 Resetting database (DESTRUCTIVE)...');
      execSync('npx prisma db push --force-reset --accept-data-loss', { stdio: 'inherit' });
    } else {
      execSync('npx prisma db push', { stdio: 'inherit' });
    }

    // Step 3: Generate Prisma client
    console.log('\n⚙️  Step 3: Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Step 4: Apply security policies
    if (options.applySecurity) {
      console.log('\n🔒 Step 4: Applying security policies...');
      executeSQL('security.sql', config);
    }

    // Step 5: Apply performance optimizations
    if (options.applyOptimization) {
      console.log('\n⚡ Step 5: Applying performance optimizations...');
      executeSQL('optimization.sql', config);
    }

    // Step 6: Seed database
    if (options.seed) {
      console.log('\n🌱 Step 6: Seeding database...');
      execSync('node -e "require(\\'./src/seed\\').seedDatabase().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); })"', { 
        stdio: 'inherit',
        cwd: path.dirname(__dirname)
      });
    }

    // Step 7: Update statistics
    if (options.updateStats) {
      console.log('\n📈 Step 7: Updating database statistics...');
      executeSQL('maintenance.sql', config);
    }

    // Step 8: Create monitoring views
    if (options.setupMonitoring && environment === 'production') {
      console.log('\n📊 Step 8: Setting up monitoring...');
      executeSQL('monitoring.sql', config);
    }

    console.log(`\n✅ Complete deployment to ${config.name} successful!`);
    
    // Display post-deployment summary
    console.log('\n📋 Deployment Summary:');
    console.log(`   Environment: ${config.name}`);
    console.log(`   Schema: ✅ Deployed`);
    console.log(`   Security: ${options.applySecurity ? '✅ Applied' : '⏭️  Skipped'}`);
    console.log(`   Optimization: ${options.applyOptimization ? '✅ Applied' : '⏭️  Skipped'}`);
    console.log(`   Seed Data: ${options.seed ? '✅ Applied' : '⏭️  Skipped'}`);
    console.log(`   Monitoring: ${options.setupMonitoring ? '✅ Applied' : '⏭️  Skipped'}`);

    // Restore original DATABASE_URL
    if (originalUrl) {
      process.env.DATABASE_URL = originalUrl;
    }

  } catch (error) {
    console.error(`\n❌ Deployment failed:`, error.message);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('   1. Check database credentials and connectivity');
    console.error('   2. Ensure database user has sufficient privileges');
    console.error('   3. Check for syntax errors in SQL files');
    console.error('   4. Verify Prisma schema is valid');
    console.error('   5. Check logs above for specific error details');
    process.exit(1);
  }
}

async function validateEnvironment(environment = 'development') {
  const config = ENVIRONMENTS[environment];
  
  if (!config || !config.url) {
    console.error(`❌ Invalid environment: ${environment}`);
    process.exit(1);
  }

  console.log(`🔍 Validating ${config.name} environment...`);
  
  try {
    // Test database connection
    const testCommand = `psql "${config.url}" -c "SELECT version();" -t`;
    const result = execSync(testCommand, { 
      encoding: 'utf8',
      env: { ...process.env, PGPASSWORD: extractPassword(config.url) }
    });
    
    console.log('✅ Database connection: OK');
    console.log(`📊 PostgreSQL version: ${result.trim()}`);
    
    // Check if Prisma schema is valid
    const originalUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = config.url;
    
    execSync('npx prisma validate', { stdio: 'inherit' });
    console.log('✅ Prisma schema: Valid');
    
    if (originalUrl) {
      process.env.DATABASE_URL = originalUrl;
    }
    
    console.log(`✅ Environment ${config.name} is ready for deployment`);
    
  } catch (error) {
    console.error(`❌ Environment validation failed:`, error.message);
    process.exit(1);
  }
}

// CLI Interface
const command = process.argv[2];
const environment = process.argv[3] || 'development';

// Parse options
const options = {
  reset: process.argv.includes('--reset'),
  applySecurity: process.argv.includes('--security') || process.argv.includes('--full'),
  applyOptimization: process.argv.includes('--optimization') || process.argv.includes('--full'),
  seed: process.argv.includes('--seed') || process.argv.includes('--full'),
  updateStats: process.argv.includes('--stats') || process.argv.includes('--full'),
  setupMonitoring: process.argv.includes('--monitoring') || process.argv.includes('--full'),
  confirmProduction: process.argv.includes('--confirm-production')
};

async function main() {
  switch (command) {
    case 'validate':
      await validateEnvironment(environment);
      break;
      
    case 'deploy':
      await deployComplete(environment, options);
      break;
      
    case 'schema-only':
      await deployComplete(environment, { applySecurity: false, applyOptimization: false, seed: false });
      break;
      
    case 'security-only':
      await deployComplete(environment, { applySecurity: true, applyOptimization: false, seed: false });
      break;
      
    case 'optimization-only':
      await deployComplete(environment, { applySecurity: false, applyOptimization: true, seed: false });
      break;
      
    default:
      console.log(`
Traveller RPG Database Deployment Tool

Usage:
  node scripts/deploy-full.js <command> [environment] [options]

Commands:
  validate        - Validate environment and connectivity
  deploy          - Deploy with specified options
  schema-only     - Deploy schema only
  security-only   - Apply security policies only
  optimization-only - Apply performance optimizations only

Environments:
  development (default)
  production
  test

Options:
  --full            - Deploy everything (schema + security + optimization + seed + monitoring)
  --reset           - Reset database before deployment (dev/test only, DESTRUCTIVE)
  --security        - Apply security policies
  --optimization    - Apply performance optimizations
  --seed            - Load seed data
  --stats           - Update database statistics
  --monitoring      - Set up monitoring (production only)
  --confirm-production - Required for production deployments

Examples:
  # Full development setup
  node scripts/deploy-full.js deploy development --full

  # Production deployment (requires confirmation)
  node scripts/deploy-full.js deploy production --full --confirm-production

  # Schema only to test environment
  node scripts/deploy-full.js schema-only test

  # Apply security policies to development
  node scripts/deploy-full.js security-only development

  # Validate production environment
  node scripts/deploy-full.js validate production

⚠️  WARNING: Production deployments are irreversible. Always test in development first.
      `);
      process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
/**
 * Database connection handler for GraphQL resolvers
 * Manages Prisma client connection with AWS RDS PostgreSQL
 */

const { PrismaClient } = require('@prisma/client');
const { SecretsManager } = require('@aws-sdk/client-secrets-manager');

let prisma = null;
let dbConfig = null;

/**
 * Get database configuration from AWS Secrets Manager
 */
async function getDatabaseConfig() {
  if (dbConfig) return dbConfig;

  const secretsManager = new SecretsManager({});
  const secretArn = process.env.DATABASE_SECRET_ARN;
  
  if (!secretArn) {
    throw new Error('DATABASE_SECRET_ARN environment variable not set');
  }

  try {
    const response = await secretsManager.getSecretValue({ SecretId: secretArn });
    const secret = JSON.parse(response.SecretString);
    
    dbConfig = {
      host: secret.host,
      port: secret.port,
      database: secret.dbname || process.env.DATABASE_NAME,
      username: secret.username,
      password: secret.password,
    };
    
    return dbConfig;
  } catch (error) {
    console.error('Failed to retrieve database secret:', error);
    throw new Error('Database configuration error');
  }
}

/**
 * Get or create Prisma client instance
 */
async function getPrismaClient() {
  if (prisma) return prisma;

  const config = await getDatabaseConfig();
  const databaseUrl = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?schema=public`;

  prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

  // Test the connection
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw new Error('Database connection failed');
  }

  return prisma;
}

/**
 * Disconnect from database (for cleanup)
 */
async function disconnectDatabase() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
    console.log('Database disconnected');
  }
}

/**
 * Execute database operation with error handling
 */
async function withDatabase(operation) {
  let client;
  try {
    client = await getPrismaClient();
    return await operation(client);
  } catch (error) {
    console.error('Database operation failed:', error);
    
    // Check if it's a connection error and reset client
    if (error.code === 'P1001' || error.code === 'P1017') {
      await disconnectDatabase();
    }
    
    throw error;
  }
}

module.exports = {
  getPrismaClient,
  disconnectDatabase,
  withDatabase,
};
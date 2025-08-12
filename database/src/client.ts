/**
 * Database Client Configuration
 * 
 * Provides configured Prisma client instances for different environments
 * with connection pooling, logging, and error handling.
 */

import { PrismaClient } from './generated';

// Global Prisma client instance for serverless optimization
declare global {
  var __prisma: PrismaClient | undefined;
}

/**
 * Database client configuration options
 */
export interface DatabaseConfig {
  databaseUrl?: string;
  maxConnections?: number;
  enableLogging?: boolean;
  logQueries?: boolean;
  logSlowQueries?: boolean;
  slowQueryThreshold?: number;
}

/**
 * Create a configured Prisma client instance
 */
export function createDatabaseClient(config: DatabaseConfig = {}): PrismaClient {
  const {
    databaseUrl = process.env.DATABASE_URL,
    maxConnections = 20,
    enableLogging = process.env.NODE_ENV === 'development',
    logQueries = process.env.ENABLE_QUERY_LOGGING === 'true',
    logSlowQueries = true,
    slowQueryThreshold = 1000
  } = config;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const logLevel: any[] = [];
  if (enableLogging) {
    logLevel.push('info', 'warn', 'error');
  }
  if (logQueries) {
    logLevel.push('query');
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: logLevel.length > 0 ? logLevel : undefined,
  });

  // Add middleware for slow query logging
  if (logSlowQueries) {
    prisma.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const end = Date.now();
      const duration = end - start;

      if (duration > slowQueryThreshold) {
        console.warn(`Slow query detected (${duration}ms):`, {
          model: params.model,
          action: params.action,
          duration: `${duration}ms`
        });
      }

      return result;
    });
  }

  // Add error handling middleware
  prisma.$use(async (params, next) => {
    try {
      return await next(params);
    } catch (error) {
      console.error('Database error:', {
        model: params.model,
        action: params.action,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  });

  return prisma;
}

/**
 * Global database client instance (optimized for serverless environments)
 */
export const db = global.__prisma || createDatabaseClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = db;
}

/**
 * Health check function to verify database connectivity
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'unhealthy';
  details: {
    connection: boolean;
    latency: number;
    timestamp: string;
  };
}> {
  const start = Date.now();
  
  try {
    await db.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    
    return {
      status: 'healthy',
      details: {
        connection: true,
        latency,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    const latency = Date.now() - start;
    
    return {
      status: 'unhealthy',
      details: {
        connection: false,
        latency,
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Graceful shutdown function
 */
export async function disconnect(): Promise<void> {
  await db.$disconnect();
  if (global.__prisma) {
    global.__prisma = undefined;
  }
}
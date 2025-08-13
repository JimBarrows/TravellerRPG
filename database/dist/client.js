"use strict";
/**
 * Database Client Configuration
 *
 * Provides configured Prisma client instances for different environments
 * with connection pooling, logging, and error handling.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.createDatabaseClient = createDatabaseClient;
exports.healthCheck = healthCheck;
exports.disconnect = disconnect;
const generated_1 = require("./generated");
/**
 * Create a configured Prisma client instance
 */
function createDatabaseClient(config = {}) {
    const { databaseUrl = process.env.DATABASE_URL, maxConnections = 20, enableLogging = process.env.NODE_ENV === 'development', logQueries = process.env.ENABLE_QUERY_LOGGING === 'true', logSlowQueries = true, slowQueryThreshold = 1000 } = config;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL is required');
    }
    const logLevel = [];
    if (enableLogging) {
        logLevel.push('info', 'warn', 'error');
    }
    if (logQueries) {
        logLevel.push('query');
    }
    const prisma = new generated_1.PrismaClient({
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
        }
        catch (error) {
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
exports.db = global.__prisma || createDatabaseClient();
if (process.env.NODE_ENV !== 'production') {
    global.__prisma = exports.db;
}
/**
 * Health check function to verify database connectivity
 */
async function healthCheck() {
    const start = Date.now();
    try {
        await exports.db.$queryRaw `SELECT 1`;
        const latency = Date.now() - start;
        return {
            status: 'healthy',
            details: {
                connection: true,
                latency,
                timestamp: new Date().toISOString()
            }
        };
    }
    catch (error) {
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
async function disconnect() {
    await exports.db.$disconnect();
    if (global.__prisma) {
        global.__prisma = undefined;
    }
}

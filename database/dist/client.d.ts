/**
 * Database Client Configuration
 *
 * Provides configured Prisma client instances for different environments
 * with connection pooling, logging, and error handling.
 */
import { PrismaClient } from './generated';
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
export declare function createDatabaseClient(config?: DatabaseConfig): PrismaClient;
/**
 * Global database client instance (optimized for serverless environments)
 */
export declare const db: PrismaClient<import("./generated").Prisma.PrismaClientOptions, never, import("./generated/runtime/library").DefaultArgs>;
/**
 * Health check function to verify database connectivity
 */
export declare function healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
        connection: boolean;
        latency: number;
        timestamp: string;
    };
}>;
/**
 * Graceful shutdown function
 */
export declare function disconnect(): Promise<void>;

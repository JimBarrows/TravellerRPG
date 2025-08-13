/**
 * Database Seed Functions
 *
 * Provides functions to seed the database with initial data for development
 * and testing, including canonical Traveller universe data.
 */
/**
 * Seed canonical star systems and planets
 */
export declare function seedCanonicalSystems(): Promise<void>;
/**
 * Seed trade goods data
 */
export declare function seedTradeGoods(): Promise<void>;
/**
 * Create test users for development
 */
export declare function seedTestUsers(): Promise<void>;
/**
 * Create a test campaign with characters
 */
export declare function seedTestCampaign(): Promise<void>;
/**
 * Run all seed functions
 */
export declare function seedDatabase(): Promise<void>;
/**
 * Clear all data (for testing purposes)
 */
export declare function clearDatabase(): Promise<void>;

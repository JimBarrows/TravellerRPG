/**
 * GraphQL Caching Strategy
 * Implements caching directives and cache invalidation for AppSync
 */

/**
 * Cache configuration for different types
 */
const CACHE_CONFIG = {
  User: {
    ttl: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes
  },
  Campaign: {
    ttl: 180, // 3 minutes
    staleWhileRevalidate: 360, // 6 minutes
  },
  Character: {
    ttl: 120, // 2 minutes
    staleWhileRevalidate: 240, // 4 minutes
  },
  Session: {
    ttl: 60, // 1 minute
    staleWhileRevalidate: 120, // 2 minutes
  },
  DiceRoll: {
    ttl: 30, // 30 seconds
    staleWhileRevalidate: 60, // 1 minute
  },
  StarSystem: {
    ttl: 3600, // 1 hour (rarely changes)
    staleWhileRevalidate: 7200, // 2 hours
  },
  Planet: {
    ttl: 3600, // 1 hour
    staleWhileRevalidate: 7200, // 2 hours
  },
  TradeGood: {
    ttl: 1800, // 30 minutes
    staleWhileRevalidate: 3600, // 1 hour
  },
  Starship: {
    ttl: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes
  },
};

/**
 * Generate cache key for a record
 */
function generateCacheKey(typeName, id, userId = null) {
  const base = `${typeName}:${id}`;
  return userId ? `${base}:user:${userId}` : base;
}

/**
 * Generate cache key for lists
 */
function generateListCacheKey(typeName, params) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `${typeName}:list:${Buffer.from(sortedParams).toString('base64')}`;
}

/**
 * Get cache TTL for a type
 */
function getCacheTTL(typeName) {
  return CACHE_CONFIG[typeName]?.ttl || 60;
}

/**
 * Get stale-while-revalidate TTL for a type
 */
function getStaleWhileRevalidateTTL(typeName) {
  return CACHE_CONFIG[typeName]?.staleWhileRevalidate || 120;
}

/**
 * Create cache control directive for AppSync
 */
function createCacheControl(typeName, maxAge = null) {
  const ttl = maxAge || getCacheTTL(typeName);
  const swr = getStaleWhileRevalidateTTL(typeName);
  
  return {
    caching: {
      keys: ['id'],
      ttl: ttl,
      staleWhileRevalidate: swr,
    },
  };
}

/**
 * Create cache invalidation tags
 */
function createInvalidationTags(typeName, id, relatedTypes = []) {
  const tags = [`${typeName}:${id}`, `${typeName}:all`];
  
  // Add related type tags for cascade invalidation
  relatedTypes.forEach(relatedType => {
    tags.push(`${relatedType}:all`);
  });
  
  return tags;
}

/**
 * Cache invalidation strategies for mutations
 */
const INVALIDATION_STRATEGIES = {
  // User mutations
  updateUserProfile: (userId) => [
    `User:${userId}`,
    `User:all`,
  ],
  
  // Campaign mutations
  createCampaign: (campaignId, userId) => [
    `Campaign:all`,
    `User:${userId}`, // User's campaign list changes
  ],
  updateCampaign: (campaignId) => [
    `Campaign:${campaignId}`,
    `Campaign:all`,
    `Character:all`, // Characters belong to campaigns
    `Session:all`, // Sessions belong to campaigns
  ],
  deleteCampaign: (campaignId) => [
    `Campaign:${campaignId}`,
    `Campaign:all`,
    `Character:all`,
    `Session:all`,
    `DiceRoll:all`,
  ],
  
  // Character mutations
  createCharacter: (characterId, campaignId) => [
    `Character:all`,
    `Campaign:${campaignId}`, // Campaign character count changes
  ],
  updateCharacter: (characterId, campaignId) => [
    `Character:${characterId}`,
    `Character:all`,
    `Campaign:${campaignId}`,
  ],
  deleteCharacter: (characterId, campaignId) => [
    `Character:${characterId}`,
    `Character:all`,
    `Campaign:${campaignId}`,
    `DiceRoll:all`, // Character dice rolls
  ],
  
  // Session mutations
  createSession: (sessionId, campaignId) => [
    `Session:all`,
    `Campaign:${campaignId}`,
  ],
  updateSession: (sessionId, campaignId) => [
    `Session:${sessionId}`,
    `Session:all`,
    `Campaign:${campaignId}`,
  ],
  
  // Dice roll mutations
  rollDice: (diceRollId, campaignId) => [
    `DiceRoll:all`,
    `Campaign:${campaignId}`, // Real-time updates
  ],
  
  // World building mutations
  createStarSystem: (systemId, campaignId) => [
    `StarSystem:all`,
    `Campaign:${campaignId}`,
  ],
  updateStarSystem: (systemId, campaignId) => [
    `StarSystem:${systemId}`,
    `StarSystem:all`,
    `Planet:all`, // Planets belong to systems
    `TradeRoute:all`, // Trade routes use systems
  ],
  
  createPlanet: (planetId, systemId) => [
    `Planet:all`,
    `StarSystem:${systemId}`,
  ],
  updatePlanet: (planetId, systemId) => [
    `Planet:${planetId}`,
    `Planet:all`,
    `StarSystem:${systemId}`,
  ],
  
  // Starship mutations
  createStarship: (starshipId, campaignId) => [
    `Starship:all`,
    `Campaign:${campaignId}`,
  ],
  updateStarship: (starshipId) => [
    `Starship:${starshipId}`,
    `Starship:all`,
  ],
};

/**
 * Get invalidation tags for a mutation
 */
function getInvalidationTags(mutationName, ...args) {
  const strategy = INVALIDATION_STRATEGIES[mutationName];
  return strategy ? strategy(...args) : [];
}

/**
 * Cache directive for GraphQL schema
 */
function addCacheDirectives(schema) {
  // Add cache directives to schema types
  const cacheDirectives = `
    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }
  `;
  
  return schema + '\n' + cacheDirectives;
}

/**
 * Apply caching to query results
 */
function applyCaching(result, typeName, context) {
  if (!result) return result;
  
  const ttl = getCacheTTL(typeName);
  
  // Add cache headers for AppSync
  if (context && context.response) {
    context.response.headers = {
      ...context.response.headers,
      'Cache-Control': `max-age=${ttl}, stale-while-revalidate=${getStaleWhileRevalidateTTL(typeName)}`,
      'X-Cache-Type': typeName,
    };
  }
  
  return result;
}

/**
 * Invalidate cache for related entities
 */
async function invalidateCache(mutationName, ...args) {
  const tags = getInvalidationTags(mutationName, ...args);
  
  // In a real implementation, this would integrate with AppSync cache invalidation
  // or a distributed cache like Redis
  console.log(`Cache invalidation for ${mutationName}:`, tags);
  
  // For AppSync, cache invalidation is handled automatically based on mutations
  // This function serves as documentation and for potential future enhancements
  return tags;
}

/**
 * Middleware to automatically apply caching
 */
function cacheMiddleware(typeName) {
  return (resolver) => {
    return async (parent, args, context, info) => {
      const result = await resolver(parent, args, context, info);
      return applyCaching(result, typeName, context);
    };
  };
}

/**
 * Smart caching based on user permissions
 */
function createSmartCacheKey(typeName, id, userContext) {
  const baseKey = `${typeName}:${id}`;
  
  // Private data gets user-specific cache keys
  const privateTypes = ['User', 'Character', 'DiceRoll'];
  if (privateTypes.includes(typeName)) {
    return `${baseKey}:user:${userContext.id}`;
  }
  
  // Public data can use shared cache keys
  return baseKey;
}

module.exports = {
  CACHE_CONFIG,
  generateCacheKey,
  generateListCacheKey,
  getCacheTTL,
  getStaleWhileRevalidateTTL,
  createCacheControl,
  createInvalidationTags,
  getInvalidationTags,
  addCacheDirectives,
  applyCaching,
  invalidateCache,
  cacheMiddleware,
  createSmartCacheKey,
  INVALIDATION_STRATEGIES,
};
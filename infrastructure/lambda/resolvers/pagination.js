/**
 * GraphQL Pagination Utilities
 * Implements cursor-based pagination following GraphQL connection specification
 */

/**
 * Create cursor from record ID and timestamp
 */
function createCursor(id, timestamp = null) {
  const data = timestamp ? `${id}:${timestamp}` : id;
  return Buffer.from(data).toString('base64');
}

/**
 * Parse cursor to get ID and timestamp
 */
function parseCursor(cursor) {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString();
    const parts = decoded.split(':');
    return {
      id: parts[0],
      timestamp: parts[1] ? parseInt(parts[1]) : null,
    };
  } catch (error) {
    throw new Error('Invalid cursor format');
  }
}

/**
 * Create connection result with edges and page info
 */
function createConnection(nodes, hasNextPage, hasPreviousPage, totalCount = null) {
  const edges = nodes.map((node, index) => ({
    node,
    cursor: createCursor(node.id, node.createdAt?.getTime() || node.timestamp?.getTime()),
  }));

  return {
    edges,
    nodes,
    pageInfo: {
      hasNextPage,
      hasPreviousPage,
      startCursor: edges.length > 0 ? edges[0].cursor : null,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
    },
    totalCount,
  };
}

/**
 * Build Prisma query arguments for pagination
 */
function buildPaginationArgs(args) {
  const { first, last, after, before } = args;
  const limit = first || last || 20;
  const maxLimit = 100;
  
  // Validate pagination arguments
  if (first && last) {
    throw new Error('Cannot specify both first and last');
  }
  
  if (first && before) {
    throw new Error('Cannot specify both first and before');
  }
  
  if (last && after) {
    throw new Error('Cannot specify both last and after');
  }
  
  if (limit > maxLimit) {
    throw new Error(`Cannot request more than ${maxLimit} items`);
  }

  const queryArgs = {
    take: limit + 1, // Take one extra to determine if there's a next page
  };

  // Handle cursor-based pagination
  if (after) {
    const { id, timestamp } = parseCursor(after);
    if (timestamp) {
      queryArgs.cursor = { id };
      queryArgs.where = {
        ...queryArgs.where,
        OR: [
          { createdAt: { gt: new Date(timestamp) } },
          {
            createdAt: new Date(timestamp),
            id: { gt: id },
          },
        ],
      };
    } else {
      queryArgs.cursor = { id };
      queryArgs.skip = 1; // Skip the cursor item itself
    }
  }

  if (before) {
    const { id, timestamp } = parseCursor(before);
    if (timestamp) {
      queryArgs.where = {
        ...queryArgs.where,
        OR: [
          { createdAt: { lt: new Date(timestamp) } },
          {
            createdAt: new Date(timestamp),
            id: { lt: id },
          },
        ],
      };
    } else {
      queryArgs.where = {
        ...queryArgs.where,
        id: { lt: id },
      };
    }
  }

  // Set ordering
  if (last) {
    queryArgs.orderBy = [
      { createdAt: 'desc' },
      { id: 'desc' },
    ];
  } else {
    queryArgs.orderBy = [
      { createdAt: 'asc' },
      { id: 'asc' },
    ];
  }

  return { queryArgs, limit, isBackward: !!last };
}

/**
 * Execute paginated query and return connection
 */
async function executePaginatedQuery(prisma, model, args, where = {}) {
  const { queryArgs, limit, isBackward } = buildPaginationArgs(args);
  
  // Merge where conditions
  queryArgs.where = { ...queryArgs.where, ...where };
  
  // Execute query
  const results = await prisma[model].findMany(queryArgs);
  
  // Determine pagination info
  const hasMore = results.length > limit;
  const nodes = hasMore ? results.slice(0, limit) : results;
  
  // Reverse results if querying backwards
  if (isBackward) {
    nodes.reverse();
  }
  
  const hasNextPage = isBackward ? false : hasMore;
  const hasPreviousPage = isBackward ? hasMore : !!args.after;
  
  // Get total count if requested
  let totalCount = null;
  if (args.includeTotalCount) {
    totalCount = await prisma[model].count({ where });
  }
  
  return createConnection(nodes, hasNextPage, hasPreviousPage, totalCount);
}

/**
 * Paginated campaigns query
 */
async function getCampaignsPaginated(prisma, args, where = {}) {
  return await executePaginatedQuery(prisma, 'campaign', args, {
    ...where,
    isPublic: true, // Only show public campaigns by default
  });
}

/**
 * Paginated characters query
 */
async function getCharactersPaginated(prisma, args, where = {}) {
  return await executePaginatedQuery(prisma, 'character', args, where);
}

/**
 * Paginated sessions query
 */
async function getSessionsPaginated(prisma, args, where = {}) {
  return await executePaginatedQuery(prisma, 'session', args, where);
}

/**
 * Paginated dice rolls query
 */
async function getDiceRollsPaginated(prisma, args, where = {}) {
  const { queryArgs, limit, isBackward } = buildPaginationArgs(args);
  
  // For dice rolls, order by timestamp instead of createdAt
  queryArgs.orderBy = isBackward 
    ? [{ timestamp: 'desc' }, { id: 'desc' }]
    : [{ timestamp: 'asc' }, { id: 'asc' }];
  
  queryArgs.where = { ...queryArgs.where, ...where };
  
  const results = await prisma.diceRoll.findMany(queryArgs);
  
  const hasMore = results.length > limit;
  const nodes = hasMore ? results.slice(0, limit) : results;
  
  if (isBackward) {
    nodes.reverse();
  }
  
  const hasNextPage = isBackward ? false : hasMore;
  const hasPreviousPage = isBackward ? hasMore : !!args.after;
  
  let totalCount = null;
  if (args.includeTotalCount) {
    totalCount = await prisma.diceRoll.count({ where });
  }
  
  return createConnection(nodes, hasNextPage, hasPreviousPage, totalCount);
}

/**
 * Add connection types to GraphQL schema
 */
const connectionTypes = `
  # Connection types for pagination
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  type CampaignEdge {
    node: Campaign!
    cursor: String!
  }

  type CampaignConnection {
    edges: [CampaignEdge!]!
    nodes: [Campaign!]!
    pageInfo: PageInfo!
    totalCount: Int
  }

  type CharacterEdge {
    node: Character!
    cursor: String!
  }

  type CharacterConnection {
    edges: [CharacterEdge!]!
    nodes: [Character!]!
    pageInfo: PageInfo!
    totalCount: Int
  }

  type SessionEdge {
    node: Session!
    cursor: String!
  }

  type SessionConnection {
    edges: [SessionEdge!]!
    nodes: [Session!]!
    pageInfo: PageInfo!
    totalCount: Int
  }

  type DiceRollEdge {
    node: DiceRoll!
    cursor: String!
  }

  type DiceRollConnection {
    edges: [DiceRollEdge!]!
    nodes: [DiceRoll!]!
    pageInfo: PageInfo!
    totalCount: Int
  }

  # Updated query types with pagination
  extend type Query {
    campaignsPaginated(
      first: Int,
      last: Int,
      after: String,
      before: String,
      filter: CampaignFilter,
      includeTotalCount: Boolean
    ): CampaignConnection!

    charactersPaginated(
      campaignId: ID!,
      first: Int,
      last: Int,
      after: String,
      before: String,
      includeTotalCount: Boolean
    ): CharacterConnection!

    sessionsPaginated(
      campaignId: ID!,
      first: Int,
      last: Int,
      after: String,
      before: String,
      includeTotalCount: Boolean
    ): SessionConnection!

    diceRollsPaginated(
      campaignId: ID!,
      first: Int,
      last: Int,
      after: String,
      before: String,
      includeTotalCount: Boolean
    ): DiceRollConnection!
  }
`;

module.exports = {
  createCursor,
  parseCursor,
  createConnection,
  buildPaginationArgs,
  executePaginatedQuery,
  getCampaignsPaginated,
  getCharactersPaginated,
  getSessionsPaginated,
  getDiceRollsPaginated,
  connectionTypes,
};
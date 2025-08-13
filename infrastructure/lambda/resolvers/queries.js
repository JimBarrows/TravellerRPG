/**
 * GraphQL Query Resolvers
 * Implements all query operations for the Traveller RPG API
 */

const { withDatabase } = require('./database');
const { getUserFromEvent, requireCampaignAccess } = require('./auth');

/**
 * Query: getUser
 */
async function getUser(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: args.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        subscriptionTier: true,
        timezone: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    // Users can only see their own full profile or basic info of others
    if (dbUser.id === user.id) {
      return dbUser;
    } else {
      return {
        id: dbUser.id,
        displayName: dbUser.displayName,
        subscriptionTier: dbUser.subscriptionTier,
      };
    }
  });
}

/**
 * Query: getCurrentUser
 */
async function getCurrentUser(event) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    return dbUser;
  });
}

/**
 * Query: getCampaign
 */
async function getCampaign(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    // Check if user has access to this campaign
    await requireCampaignAccess(prisma, user, args.id);

    const campaign = await prisma.campaign.findUnique({
      where: { id: args.id },
      include: {
        gamemaster: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
        characters: {
          include: {
            player: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
        sessions: {
          orderBy: { date: 'desc' },
          take: 10, // Latest 10 sessions
        },
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return {
      ...campaign,
      players: campaign.members.map(m => m.user),
      settings: {
        houseRules: campaign.houseRules,
        allowedBooks: campaign.allowedBooks,
        maxPlayers: campaign.maxPlayers,
        isPublic: campaign.isPublic,
      },
    };
  });
}

/**
 * Query: listCampaigns
 */
async function listCampaigns(event, args) {
  return await withDatabase(async (prisma) => {
    const filter = args.filter || {};
    const where = {};

    // Only show public campaigns or use other filters
    if (filter.isPublic !== undefined) {
      where.isPublic = filter.isPublic;
    } else {
      where.isPublic = true; // Default to public campaigns only
    }

    if (filter.name) {
      where.name = {
        contains: filter.name,
        mode: 'insensitive',
      };
    }

    if (filter.gamemaster) {
      where.gamemasterId = filter.gamemaster;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        gamemaster: {
          select: {
            id: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            members: true,
            characters: true,
          },
        },
      },
      take: 50, // Limit results
      orderBy: { createdAt: 'desc' },
    });

    return campaigns.map(campaign => ({
      ...campaign,
      memberCount: campaign._count.members,
      characterCount: campaign._count.characters,
    }));
  });
}

/**
 * Query: listUserCampaigns
 */
async function listUserCampaigns(event) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    const memberships = await prisma.campaignMember.findMany({
      where: { userId: user.id },
      include: {
        campaign: {
          include: {
            gamemaster: {
              select: {
                id: true,
                displayName: true,
              },
            },
            _count: {
              select: {
                members: true,
                characters: true,
              },
            },
          },
        },
      },
    });

    return memberships.map(m => ({
      ...m.campaign,
      role: m.role,
      memberCount: m.campaign._count.members,
      characterCount: m.campaign._count.characters,
    }));
  });
}

/**
 * Query: getCharacter
 */
async function getCharacter(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    const character = await prisma.character.findUnique({
      where: { id: args.id },
      include: {
        player: {
          select: {
            id: true,
            displayName: true,
          },
        },
        campaign: true,
        characteristics: true,
        skills: true,
        equipment: true,
        lifeEvents: {
          orderBy: { age: 'asc' },
        },
      },
    });

    if (!character) {
      throw new Error('Character not found');
    }

    // Check if user has access to this character
    await requireCampaignAccess(prisma, user, character.campaignId);

    return {
      ...character,
      history: character.lifeEvents,
    };
  });
}

/**
 * Query: listCharacters
 */
async function listCharacters(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    // Check if user has access to this campaign
    await requireCampaignAccess(prisma, user, args.campaignId);

    const characters = await prisma.character.findMany({
      where: { campaignId: args.campaignId },
      include: {
        player: {
          select: {
            id: true,
            displayName: true,
          },
        },
        characteristics: true,
        _count: {
          select: {
            skills: true,
            equipment: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return characters;
  });
}

/**
 * Query: listUserCharacters
 */
async function listUserCharacters(event) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    const characters = await prisma.character.findMany({
      where: { playerId: user.id },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        characteristics: true,
      },
      orderBy: { name: 'asc' },
    });

    return characters;
  });
}

/**
 * Query: getSession
 */
async function getSession(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    const session = await prisma.session.findUnique({
      where: { id: args.id },
      include: {
        campaign: true,
        gamemaster: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Check if user has access to this session's campaign
    await requireCampaignAccess(prisma, user, session.campaignId);

    return session;
  });
}

/**
 * Query: listSessions
 */
async function listSessions(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    // Check if user has access to this campaign
    await requireCampaignAccess(prisma, user, args.campaignId);

    const sessions = await prisma.session.findMany({
      where: { campaignId: args.campaignId },
      include: {
        gamemaster: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    return sessions;
  });
}

/**
 * Query: listDiceRolls
 */
async function listDiceRolls(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    // Check if user has access to this campaign
    await requireCampaignAccess(prisma, user, args.campaignId);

    const limit = args.limit || 50;
    
    const diceRolls = await prisma.diceRoll.findMany({
      where: {
        campaignId: args.campaignId,
        // Only show public rolls and user's own private rolls
        OR: [
          { isPublic: true },
          { characterId: { in: await getUserCharacterIds(prisma, user.id, args.campaignId) } },
        ],
      },
      include: {
        character: {
          select: {
            id: true,
            name: true,
            player: {
              select: {
                id: true,
                displayName: true,
              },
            },
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    return diceRolls.map(roll => ({
      ...roll,
      roller: roll.character?.player || { id: 'unknown', displayName: 'Unknown' },
    }));
  });
}

/**
 * Helper: Get user's character IDs in a campaign
 */
async function getUserCharacterIds(prisma, userId, campaignId) {
  const characters = await prisma.character.findMany({
    where: {
      playerId: userId,
      campaignId,
    },
    select: { id: true },
  });
  
  return characters.map(c => c.id);
}

module.exports = {
  getUser,
  getCurrentUser,
  getCampaign,
  listCampaigns,
  listUserCampaigns,
  getCharacter,
  listCharacters,
  listUserCharacters,
  getSession,
  listSessions,
  listDiceRolls,
};
/**
 * GraphQL Subscription Resolvers
 * Handles real-time updates for campaigns, characters, dice rolls, and sessions
 */

const { withDatabase } = require('./database');
const { getUserFromEvent, requireCampaignAccess } = require('./auth');

/**
 * Subscription: onCampaignUpdate
 * Real-time updates when campaign data changes
 */
async function onCampaignUpdate(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    // Verify user has access to this campaign
    await requireCampaignAccess(prisma, user, args.campaignId);
    
    // The actual subscription filtering is handled by AppSync
    // This resolver just validates access
    return {
      campaignId: args.campaignId,
      authorized: true,
    };
  });
}

/**
 * Subscription: onCharacterUpdate
 * Real-time updates when character data changes
 */
async function onCharacterUpdate(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    // Get character to find campaign
    const character = await prisma.character.findUnique({
      where: { id: args.characterId },
      select: { campaignId: true },
    });
    
    if (!character) {
      throw new Error('Character not found');
    }
    
    // Verify user has access to this character's campaign
    await requireCampaignAccess(prisma, user, character.campaignId);
    
    return {
      characterId: args.characterId,
      authorized: true,
    };
  });
}

/**
 * Subscription: onDiceRoll
 * Real-time updates for dice rolls in a campaign
 */
async function onDiceRoll(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    // Verify user has access to this campaign
    await requireCampaignAccess(prisma, user, args.campaignId);
    
    return {
      campaignId: args.campaignId,
      authorized: true,
    };
  });
}

/**
 * Subscription: onSessionUpdate
 * Real-time updates for session changes
 */
async function onSessionUpdate(event, args) {
  const user = getUserFromEvent(event);
  
  return await withDatabase(async (prisma) => {
    // Verify user has access to this campaign
    await requireCampaignAccess(prisma, user, args.campaignId);
    
    return {
      campaignId: args.campaignId,
      authorized: true,
    };
  });
}

/**
 * Publish campaign update to subscribers
 * Called from mutations that modify campaign data
 */
async function publishCampaignUpdate(campaignId, updateData) {
  // In a real implementation, this would trigger the subscription
  // For AppSync, this is handled automatically by the @aws_subscribe directive
  console.log(`Publishing campaign update for ${campaignId}:`, updateData);
  return updateData;
}

/**
 * Publish character update to subscribers
 * Called from mutations that modify character data
 */
async function publishCharacterUpdate(characterId, updateData) {
  console.log(`Publishing character update for ${characterId}:`, updateData);
  return updateData;
}

/**
 * Publish dice roll to subscribers
 * Called when a new dice roll is created
 */
async function publishDiceRoll(campaignId, diceRollData) {
  console.log(`Publishing dice roll for campaign ${campaignId}:`, diceRollData);
  return diceRollData;
}

/**
 * Publish session update to subscribers
 * Called from session mutations
 */
async function publishSessionUpdate(campaignId, sessionData) {
  console.log(`Publishing session update for campaign ${campaignId}:`, sessionData);
  return sessionData;
}

module.exports = {
  onCampaignUpdate,
  onCharacterUpdate,
  onDiceRoll,
  onSessionUpdate,
  publishCampaignUpdate,
  publishCharacterUpdate,
  publishDiceRoll,
  publishSessionUpdate,
};
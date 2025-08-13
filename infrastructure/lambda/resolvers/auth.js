/**
 * Authentication utilities for GraphQL resolvers
 * Handles JWT validation and user context extraction
 */

const jwt = require('jsonwebtoken');

/**
 * Extract user information from AppSync event context
 */
function getUserFromEvent(event) {
  const identity = event.identity;
  
  if (!identity) {
    throw new Error('Authentication required');
  }

  // Handle Cognito User Pool authentication
  if (identity.cognitoIdentityPoolId && identity.cognitoIdentityId) {
    return {
      id: identity.cognitoIdentityId,
      username: identity.username,
      email: identity.claims?.email,
      groups: identity.claims?.['cognito:groups'] || [],
      isAuthenticated: true,
    };
  }

  // Handle API Key authentication (for development)
  if (identity.apiKeyId) {
    return {
      id: 'api-key-user',
      username: 'api-user',
      email: null,
      groups: ['api-user'],
      isAuthenticated: false, // API key is not fully authenticated
    };
  }

  throw new Error('Invalid authentication method');
}

/**
 * Check if user has required permissions
 */
function hasPermission(user, requiredGroups = []) {
  if (!requiredGroups.length) return true;
  
  const userGroups = user.groups || [];
  return requiredGroups.some(group => userGroups.includes(group));
}

/**
 * Check if user can access campaign
 */
async function canAccessCampaign(prisma, userId, campaignId) {
  const membership = await prisma.campaignMember.findFirst({
    where: {
      userId,
      campaignId,
    },
  });
  
  return !!membership;
}

/**
 * Check if user is gamemaster of campaign
 */
async function isGamemaster(prisma, userId, campaignId) {
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      gamemasterId: userId,
    },
  });
  
  return !!campaign;
}

/**
 * Check if user owns character
 */
async function ownsCharacter(prisma, userId, characterId) {
  const character = await prisma.character.findFirst({
    where: {
      id: characterId,
      playerId: userId,
    },
  });
  
  return !!character;
}

/**
 * Get user's campaigns
 */
async function getUserCampaigns(prisma, userId) {
  const memberships = await prisma.campaignMember.findMany({
    where: { userId },
    include: { campaign: true },
  });
  
  return memberships.map(m => m.campaign);
}

/**
 * Authorize campaign access or throw error
 */
async function requireCampaignAccess(prisma, user, campaignId) {
  const hasAccess = await canAccessCampaign(prisma, user.id, campaignId);
  if (!hasAccess) {
    throw new Error('Access denied: Not a member of this campaign');
  }
}

/**
 * Authorize gamemaster access or throw error
 */
async function requireGamemasterAccess(prisma, user, campaignId) {
  const isGM = await isGamemaster(prisma, user.id, campaignId);
  if (!isGM) {
    throw new Error('Access denied: Gamemaster access required');
  }
}

/**
 * Authorize character ownership or throw error
 */
async function requireCharacterOwnership(prisma, user, characterId) {
  const owns = await ownsCharacter(prisma, user.id, characterId);
  if (!owns) {
    throw new Error('Access denied: Character ownership required');
  }
}

module.exports = {
  getUserFromEvent,
  hasPermission,
  canAccessCampaign,
  isGamemaster,
  ownsCharacter,
  getUserCampaigns,
  requireCampaignAccess,
  requireGamemasterAccess,
  requireCharacterOwnership,
};
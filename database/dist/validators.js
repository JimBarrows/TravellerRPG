"use strict";
/**
 * Database Validation Functions
 *
 * Provides validation functions for database operations, ensuring data integrity
 * and business rule compliance before database writes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserProfile = validateUserProfile;
exports.validateCognitoUser = validateCognitoUser;
exports.validateCharacterCreate = validateCharacterCreate;
exports.validateCharacterSkill = validateCharacterSkill;
exports.validateCharacterEquipment = validateCharacterEquipment;
exports.validateCampaignCreate = validateCampaignCreate;
exports.validateCampaignMember = validateCampaignMember;
exports.validateStarSystemCreate = validateStarSystemCreate;
exports.validatePlanetCreate = validatePlanetCreate;
exports.validateDiceRoll = validateDiceRoll;
exports.validateCampaignPermission = validateCampaignPermission;
exports.validateCharacterPermission = validateCharacterPermission;
const zod_1 = require("zod");
const client_1 = require("./client");
const types_1 = require("./types");
const utilities_1 = require("./utilities");
// ============================================================================
// USER VALIDATION
// ============================================================================
/**
 * Validate user profile data
 */
async function validateUserProfile(data) {
    try {
        const validated = types_1.UserSchemas.profile.parse(data);
        // Check for unique email if updating
        if (validated.email) {
            const existingUser = await client_1.db.user.findUnique({
                where: { email: validated.email }
            });
            if (existingUser) {
                return {
                    success: false,
                    error: 'Email address is already in use',
                    code: 'EMAIL_EXISTS'
                };
            }
        }
        return {
            success: true,
            data: validated
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
                code: 'VALIDATION_ERROR'
            };
        }
        return {
            success: false,
            error: 'Unknown validation error',
            code: 'UNKNOWN_ERROR'
        };
    }
}
/**
 * Validate Cognito user registration data
 */
async function validateCognitoUser(data) {
    try {
        const validated = types_1.UserSchemas.cognitoUser.parse(data);
        // Check for unique Cognito user ID
        const existingUser = await client_1.db.user.findUnique({
            where: { cognitoUserId: validated.cognitoUserId }
        });
        if (existingUser) {
            return {
                success: false,
                error: 'Cognito user already exists',
                code: 'COGNITO_USER_EXISTS'
            };
        }
        return {
            success: true,
            data: validated
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
                code: 'VALIDATION_ERROR'
            };
        }
        return {
            success: false,
            error: 'Unknown validation error',
            code: 'UNKNOWN_ERROR'
        };
    }
}
// ============================================================================
// CHARACTER VALIDATION
// ============================================================================
/**
 * Validate character creation data
 */
async function validateCharacterCreate(data) {
    try {
        const validated = types_1.CharacterSchemas.create.parse(data);
        // Validate characteristics using game rules
        const charValidation = (0, utilities_1.validateCharacteristics)(validated.characteristics);
        if (!charValidation.isValid) {
            return {
                success: false,
                error: charValidation.errors.join(', '),
                code: 'INVALID_CHARACTERISTICS'
            };
        }
        // Check if player exists
        const player = await client_1.db.user.findUnique({
            where: { id: validated.playerId }
        });
        if (!player) {
            return {
                success: false,
                error: 'Player not found',
                code: 'PLAYER_NOT_FOUND'
            };
        }
        // Check if campaign exists
        const campaign = await client_1.db.campaign.findUnique({
            where: { id: validated.campaignId }
        });
        if (!campaign) {
            return {
                success: false,
                error: 'Campaign not found',
                code: 'CAMPAIGN_NOT_FOUND'
            };
        }
        // Check if player is a member of the campaign
        const membership = await client_1.db.campaignMember.findUnique({
            where: {
                campaignId_userId: {
                    campaignId: validated.campaignId,
                    userId: validated.playerId
                }
            }
        });
        if (!membership) {
            return {
                success: false,
                error: 'Player is not a member of this campaign',
                code: 'NOT_CAMPAIGN_MEMBER'
            };
        }
        // Check for duplicate character name within the campaign
        const existingCharacter = await client_1.db.character.findFirst({
            where: {
                name: validated.name,
                campaignId: validated.campaignId,
                playerId: validated.playerId
            }
        });
        if (existingCharacter) {
            return {
                success: false,
                error: 'Character name already exists for this player in this campaign',
                code: 'CHARACTER_NAME_EXISTS'
            };
        }
        return {
            success: true,
            data: validated
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
                code: 'VALIDATION_ERROR'
            };
        }
        return {
            success: false,
            error: 'Unknown validation error',
            code: 'UNKNOWN_ERROR'
        };
    }
}
/**
 * Validate character skill data
 */
function validateCharacterSkill(data) {
    try {
        const validated = types_1.CharacterSchemas.skill.parse(data);
        return {
            success: true,
            data: validated
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
                code: 'VALIDATION_ERROR'
            };
        }
        return {
            success: false,
            error: 'Unknown validation error',
            code: 'UNKNOWN_ERROR'
        };
    }
}
/**
 * Validate character equipment data
 */
function validateCharacterEquipment(data) {
    try {
        const validated = types_1.CharacterSchemas.equipment.parse(data);
        return {
            success: true,
            data: validated
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
                code: 'VALIDATION_ERROR'
            };
        }
        return {
            success: false,
            error: 'Unknown validation error',
            code: 'UNKNOWN_ERROR'
        };
    }
}
// ============================================================================
// CAMPAIGN VALIDATION
// ============================================================================
/**
 * Validate campaign creation data
 */
async function validateCampaignCreate(data, gamemasterId) {
    try {
        const validated = types_1.CampaignSchemas.create.parse(data);
        // Check if gamemaster exists
        const gamemaster = await client_1.db.user.findUnique({
            where: { id: gamemasterId }
        });
        if (!gamemaster) {
            return {
                success: false,
                error: 'Gamemaster not found',
                code: 'GAMEMASTER_NOT_FOUND'
            };
        }
        // Check subscription limits for campaign creation
        const existingCampaigns = await client_1.db.campaign.count({
            where: { gamemasterId }
        });
        const maxCampaigns = gamemaster.subscriptionTier === 'FREE' ? 2 :
            gamemaster.subscriptionTier === 'STANDARD' ? 10 : 50;
        if (existingCampaigns >= maxCampaigns) {
            return {
                success: false,
                error: `Maximum number of campaigns reached for ${gamemaster.subscriptionTier} tier (${maxCampaigns})`,
                code: 'CAMPAIGN_LIMIT_REACHED'
            };
        }
        return {
            success: true,
            data: validated
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
                code: 'VALIDATION_ERROR'
            };
        }
        return {
            success: false,
            error: 'Unknown validation error',
            code: 'UNKNOWN_ERROR'
        };
    }
}
/**
 * Validate campaign member addition
 */
async function validateCampaignMember(campaignId, userId, role = 'PLAYER') {
    try {
        const validated = types_1.CampaignSchemas.member.parse({ userId, role });
        // Check if campaign exists
        const campaign = await client_1.db.campaign.findUnique({
            where: { id: campaignId },
            include: { members: true }
        });
        if (!campaign) {
            return {
                success: false,
                error: 'Campaign not found',
                code: 'CAMPAIGN_NOT_FOUND'
            };
        }
        // Check if user exists
        const user = await client_1.db.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return {
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            };
        }
        // Check if user is already a member
        const existingMember = campaign.members.find(member => member.userId === userId);
        if (existingMember) {
            return {
                success: false,
                error: 'User is already a member of this campaign',
                code: 'ALREADY_MEMBER'
            };
        }
        // Check max players limit
        const playerCount = campaign.members.filter(member => member.role === 'PLAYER').length;
        if (role === 'PLAYER' && campaign.maxPlayers && playerCount >= campaign.maxPlayers) {
            return {
                success: false,
                error: `Campaign is full (max ${campaign.maxPlayers} players)`,
                code: 'CAMPAIGN_FULL'
            };
        }
        return {
            success: true,
            data: validated
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
                code: 'VALIDATION_ERROR'
            };
        }
        return {
            success: false,
            error: 'Unknown validation error',
            code: 'UNKNOWN_ERROR'
        };
    }
}
// ============================================================================
// STAR SYSTEM VALIDATION
// ============================================================================
/**
 * Validate star system creation data
 */
async function validateStarSystemCreate(data, campaignId) {
    try {
        const validated = types_1.StarSystemSchemas.create.parse(data);
        // Check for duplicate hex location within campaign or globally
        const existingSystem = await client_1.db.starSystem.findFirst({
            where: {
                hexLocation: validated.hexLocation,
                campaignId: campaignId || null
            }
        });
        if (existingSystem) {
            return {
                success: false,
                error: `Star system already exists at hex ${validated.hexLocation}`,
                code: 'HEX_OCCUPIED'
            };
        }
        // If campaign-specific, validate campaign exists
        if (campaignId) {
            const campaign = await client_1.db.campaign.findUnique({
                where: { id: campaignId }
            });
            if (!campaign) {
                return {
                    success: false,
                    error: 'Campaign not found',
                    code: 'CAMPAIGN_NOT_FOUND'
                };
            }
        }
        return {
            success: true,
            data: validated
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
                code: 'VALIDATION_ERROR'
            };
        }
        return {
            success: false,
            error: 'Unknown validation error',
            code: 'UNKNOWN_ERROR'
        };
    }
}
/**
 * Validate planet creation data
 */
function validatePlanetCreate(data) {
    try {
        const validated = types_1.StarSystemSchemas.planet.parse(data);
        // Validate UWP format and consistency
        const uwpData = (0, utilities_1.parseUWP)(validated.uwp);
        if (!uwpData) {
            return {
                success: false,
                error: 'Invalid UWP format',
                code: 'INVALID_UWP'
            };
        }
        // Check UWP consistency with individual fields
        if (uwpData.size !== validated.size ||
            uwpData.atmosphere !== validated.atmosphere ||
            uwpData.hydrographics !== validated.hydrographics ||
            uwpData.population !== validated.population ||
            uwpData.government !== validated.government ||
            uwpData.lawLevel !== validated.lawLevel ||
            uwpData.techLevel !== validated.techLevel ||
            uwpData.starport !== validated.starport) {
            return {
                success: false,
                error: 'UWP string does not match individual characteristics',
                code: 'UWP_MISMATCH'
            };
        }
        return {
            success: true,
            data: validated
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
                code: 'VALIDATION_ERROR'
            };
        }
        return {
            success: false,
            error: 'Unknown validation error',
            code: 'UNKNOWN_ERROR'
        };
    }
}
// ============================================================================
// DICE ROLL VALIDATION
// ============================================================================
/**
 * Validate dice roll data
 */
async function validateDiceRoll(data, rollerId, campaignId) {
    try {
        const validated = types_1.DiceRollSchemas.roll.parse(data);
        // Check if roller exists
        const roller = await client_1.db.user.findUnique({
            where: { id: rollerId }
        });
        if (!roller) {
            return {
                success: false,
                error: 'Roller not found',
                code: 'ROLLER_NOT_FOUND'
            };
        }
        // Check if campaign exists
        const campaign = await client_1.db.campaign.findUnique({
            where: { id: campaignId }
        });
        if (!campaign) {
            return {
                success: false,
                error: 'Campaign not found',
                code: 'CAMPAIGN_NOT_FOUND'
            };
        }
        // Check if roller is a member of the campaign
        const membership = await client_1.db.campaignMember.findUnique({
            where: {
                campaignId_userId: {
                    campaignId,
                    userId: rollerId
                }
            }
        });
        if (!membership) {
            return {
                success: false,
                error: 'Roller is not a member of this campaign',
                code: 'NOT_CAMPAIGN_MEMBER'
            };
        }
        return {
            success: true,
            data: validated
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
                code: 'VALIDATION_ERROR'
            };
        }
        return {
            success: false,
            error: 'Unknown validation error',
            code: 'UNKNOWN_ERROR'
        };
    }
}
// ============================================================================
// PERMISSION VALIDATION
// ============================================================================
/**
 * Check if user has permission to perform action on campaign
 */
async function validateCampaignPermission(userId, campaignId, requiredRole = 'PLAYER') {
    try {
        const membership = await client_1.db.campaignMember.findUnique({
            where: {
                campaignId_userId: {
                    campaignId,
                    userId
                }
            }
        });
        if (!membership || !membership.isActive) {
            return {
                success: false,
                error: 'User is not an active member of this campaign',
                code: 'NOT_CAMPAIGN_MEMBER'
            };
        }
        // Check role hierarchy (GAMEMASTER > PLAYER > OBSERVER)
        const roleHierarchy = { 'GAMEMASTER': 3, 'PLAYER': 2, 'OBSERVER': 1 };
        const userLevel = roleHierarchy[membership.role];
        const requiredLevel = roleHierarchy[requiredRole];
        if (userLevel < requiredLevel) {
            return {
                success: false,
                error: `Insufficient permissions. Required: ${requiredRole}, Current: ${membership.role}`,
                code: 'INSUFFICIENT_PERMISSIONS'
            };
        }
        return {
            success: true,
            data: { role: membership.role }
        };
    }
    catch (error) {
        return {
            success: false,
            error: 'Permission validation error',
            code: 'PERMISSION_ERROR'
        };
    }
}
/**
 * Check if user owns or has permission to modify a character
 */
async function validateCharacterPermission(userId, characterId) {
    try {
        const character = await client_1.db.character.findUnique({
            where: { id: characterId },
            include: {
                player: true,
                campaign: {
                    include: {
                        members: {
                            where: { userId }
                        }
                    }
                }
            }
        });
        if (!character) {
            return {
                success: false,
                error: 'Character not found',
                code: 'CHARACTER_NOT_FOUND'
            };
        }
        // Check if user owns the character
        if (character.playerId === userId) {
            return {
                success: true,
                data: { character }
            };
        }
        // Check if user is gamemaster of the campaign
        const membership = character.campaign.members[0];
        if (membership && membership.role === 'GAMEMASTER') {
            return {
                success: true,
                data: { character }
            };
        }
        return {
            success: false,
            error: 'Insufficient permissions to modify this character',
            code: 'INSUFFICIENT_PERMISSIONS'
        };
    }
    catch (error) {
        return {
            success: false,
            error: 'Character permission validation error',
            code: 'PERMISSION_ERROR'
        };
    }
}

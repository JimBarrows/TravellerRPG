"use strict";
/**
 * Database Types and Interfaces
 *
 * Provides TypeScript type definitions that complement the Prisma-generated types
 * with additional business logic types and validation schemas.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiceRollSchemas = exports.StarSystemSchemas = exports.CampaignSchemas = exports.CharacterSchemas = exports.UserSchemas = void 0;
const zod_1 = require("zod");
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
/**
 * User validation schemas
 */
exports.UserSchemas = {
    profile: zod_1.z.object({
        email: zod_1.z.string().email(),
        displayName: zod_1.z.string().min(2).max(50).optional(),
        timezone: zod_1.z.string().optional(),
        subscriptionTier: zod_1.z.enum(['FREE', 'STANDARD', 'PREMIUM']).optional()
    }),
    cognitoUser: zod_1.z.object({
        cognitoUserId: zod_1.z.string().min(1),
        email: zod_1.z.string().email(),
        emailVerified: zod_1.z.boolean().default(false)
    })
};
/**
 * Character validation schemas
 */
exports.CharacterSchemas = {
    characteristics: zod_1.z.object({
        strength: zod_1.z.number().min(1).max(15),
        dexterity: zod_1.z.number().min(1).max(15),
        endurance: zod_1.z.number().min(1).max(15),
        intelligence: zod_1.z.number().min(1).max(15),
        education: zod_1.z.number().min(1).max(15),
        socialStanding: zod_1.z.number().min(1).max(15)
    }),
    create: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        playerId: zod_1.z.string().cuid(),
        campaignId: zod_1.z.string().cuid(),
        characteristics: zod_1.z.object({
            strength: zod_1.z.number().min(1).max(15),
            dexterity: zod_1.z.number().min(1).max(15),
            endurance: zod_1.z.number().min(1).max(15),
            intelligence: zod_1.z.number().min(1).max(15),
            education: zod_1.z.number().min(1).max(15),
            socialStanding: zod_1.z.number().min(1).max(15)
        }),
        homeworld: zod_1.z.string().max(100).optional(),
        age: zod_1.z.number().min(18).max(100).optional(),
        gender: zod_1.z.string().max(50).optional(),
        species: zod_1.z.string().max(50).default('Human')
    }),
    skill: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        level: zod_1.z.number().min(0).max(6),
        specialization: zod_1.z.string().max(100).optional()
    }),
    equipment: zod_1.z.object({
        name: zod_1.z.string().min(1).max(200),
        description: zod_1.z.string().max(1000).optional(),
        weight: zod_1.z.number().min(0).optional(),
        cost: zod_1.z.number().min(0).optional(),
        quantity: zod_1.z.number().min(1).default(1),
        equipped: zod_1.z.boolean().default(false),
        category: zod_1.z.string().max(50).optional()
    })
};
/**
 * Campaign validation schemas
 */
exports.CampaignSchemas = {
    create: zod_1.z.object({
        name: zod_1.z.string().min(1).max(200),
        description: zod_1.z.string().max(2000).optional(),
        maxPlayers: zod_1.z.number().min(2).max(20).default(6),
        isPublic: zod_1.z.boolean().default(false),
        allowedBooks: zod_1.z.array(zod_1.z.string()).default([]),
        houseRules: zod_1.z.record(zod_1.z.any()).optional()
    }),
    member: zod_1.z.object({
        userId: zod_1.z.string().cuid(),
        role: zod_1.z.enum(['GAMEMASTER', 'PLAYER', 'OBSERVER']).default('PLAYER')
    })
};
/**
 * Star system validation schemas
 */
exports.StarSystemSchemas = {
    create: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        hexLocation: zod_1.z.string().regex(/^\d{4}$/, 'Must be 4-digit hex coordinates'),
        sector: zod_1.z.string().min(1).max(100),
        subsector: zod_1.z.string().max(10).optional(),
        allegiance: zod_1.z.string().max(50).optional(),
        starType: zod_1.z.string().max(20).optional(),
        gasGiants: zod_1.z.number().min(0).max(10).default(0)
    }),
    planet: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100),
        uwp: zod_1.z.string().regex(/^[A-EX][0-9A-F]{6}-[0-9A-F]+$/, 'Invalid UWP format'),
        size: zod_1.z.number().min(0).max(10),
        atmosphere: zod_1.z.number().min(0).max(15),
        hydrographics: zod_1.z.number().min(0).max(10),
        population: zod_1.z.number().min(0).max(12),
        government: zod_1.z.number().min(0).max(15),
        lawLevel: zod_1.z.number().min(0).max(18),
        techLevel: zod_1.z.number().min(0).max(15),
        starport: zod_1.z.enum(['A', 'B', 'C', 'D', 'E', 'X']),
        tradeCodes: zod_1.z.array(zod_1.z.string()).default([])
    })
};
/**
 * Dice roll validation schemas
 */
exports.DiceRollSchemas = {
    roll: zod_1.z.object({
        dice: zod_1.z.string().regex(/^\d+[dD]\d+([+-]\d+)?$/, 'Invalid dice notation'),
        modifiers: zod_1.z.array(zod_1.z.string()).default([]),
        description: zod_1.z.string().max(500).optional(),
        isPublic: zod_1.z.boolean().default(true),
        isGMOnly: zod_1.z.boolean().default(false),
        character: zod_1.z.string().max(100).optional(),
        skill: zod_1.z.string().max(100).optional()
    })
};

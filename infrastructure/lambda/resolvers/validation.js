/**
 * Input validation schemas using Zod
 * Validates GraphQL inputs against Traveller RPG business rules
 */

const { z } = require('zod');

// Traveller characteristics validation (1-15 range)
const characteristicsSchema = z.object({
  strength: z.number().int().min(1).max(15),
  dexterity: z.number().int().min(1).max(15),
  endurance: z.number().int().min(1).max(15),
  intelligence: z.number().int().min(1).max(15),
  education: z.number().int().min(1).max(15),
  socialStanding: z.number().int().min(1).max(15),
});

// Skill validation
const skillSchema = z.object({
  name: z.string().min(1).max(100),
  level: z.number().int().min(0).max(15),
  specialization: z.string().max(100).optional(),
});

// Equipment validation
const equipmentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  weight: z.number().min(0).optional(),
  cost: z.number().int().min(0).optional(),
  quantity: z.number().int().min(1),
  equipped: z.boolean(),
});

// Campaign validation schemas
const createCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  settings: z.object({
    houseRules: z.any().optional(), // JSON object
    allowedBooks: z.array(z.string()).optional(),
    maxPlayers: z.number().int().min(1).max(20).optional(),
    isPublic: z.boolean().optional(),
  }).optional(),
});

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  settings: z.object({
    houseRules: z.any().optional(),
    allowedBooks: z.array(z.string()).optional(),
    maxPlayers: z.number().int().min(1).max(20).optional(),
    isPublic: z.boolean().optional(),
  }).optional(),
});

// Character validation schemas
const createCharacterSchema = z.object({
  name: z.string().min(1).max(100),
  campaignId: z.string().cuid(),
  characteristics: characteristicsSchema,
  portrait: z.string().url().optional(),
});

const updateCharacterSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  characteristics: characteristicsSchema.optional(),
  skills: z.array(skillSchema).optional(),
  equipment: z.array(equipmentSchema).optional(),
  credits: z.number().int().min(0).optional(),
  notes: z.string().max(5000).optional(),
  portrait: z.string().url().optional(),
});

// Session validation schemas
const createSessionSchema = z.object({
  campaignId: z.string().cuid(),
  name: z.string().min(1).max(200),
  scheduledFor: z.string().datetime().optional(),
  duration: z.number().int().min(1).max(720).optional(), // Max 12 hours
});

const updateSessionSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  scheduledFor: z.string().datetime().optional(),
  duration: z.number().int().min(1).max(720).optional(),
  notes: z.string().max(5000).optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

// Dice roll validation
const rollDiceSchema = z.object({
  campaignId: z.string().cuid(),
  dice: z.string().regex(/^\d+d\d+(\+\d+)?(-\d+)?$/, 'Invalid dice notation'), // e.g., "2d6+1"
  modifiers: z.array(z.string()).optional(),
  isPublic: z.boolean(),
  description: z.string().max(500).optional(),
});

// User profile validation
const updateUserProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  timezone: z.string().max(50).optional(),
});

/**
 * Validate input against schema
 */
function validateInput(schema, input) {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
      throw new Error(`Validation failed: ${issues}`);
    }
    throw error;
  }
}

/**
 * Validate Traveller dice notation
 */
function validateDiceNotation(dice) {
  const match = dice.match(/^(\d+)d(\d+)([+-]\d+)?$/);
  if (!match) {
    throw new Error('Invalid dice notation. Use format like "2d6" or "3d6+1"');
  }

  const [, count, sides, modifier] = match;
  
  if (parseInt(count) > 100) {
    throw new Error('Too many dice (max 100)');
  }
  
  if (![4, 6, 8, 10, 12, 20, 100].includes(parseInt(sides))) {
    throw new Error('Invalid die type. Supported: d4, d6, d8, d10, d12, d20, d100');
  }
  
  return { count: parseInt(count), sides: parseInt(sides), modifier: parseInt(modifier || 0) };
}

/**
 * Validate characteristic value for Traveller
 */
function validateCharacteristic(value) {
  if (typeof value !== 'number' || value < 1 || value > 15) {
    throw new Error('Characteristics must be between 1 and 15');
  }
  return value;
}

/**
 * Validate skill level for Traveller
 */
function validateSkillLevel(level) {
  if (typeof level !== 'number' || level < 0 || level > 15) {
    throw new Error('Skill levels must be between 0 and 15');
  }
  return level;
}

module.exports = {
  characteristicsSchema,
  skillSchema,
  equipmentSchema,
  createCampaignSchema,
  updateCampaignSchema,
  createCharacterSchema,
  updateCharacterSchema,
  createSessionSchema,
  updateSessionSchema,
  rollDiceSchema,
  updateUserProfileSchema,
  validateInput,
  validateDiceNotation,
  validateCharacteristic,
  validateSkillLevel,
};
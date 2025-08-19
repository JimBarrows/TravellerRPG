import { z } from 'zod';
import type { 
  CharacterSheetData, 
  CharacterSheetSkill, 
  CharacterSheetEquipment,
  CharacterNote,
  StatusCondition,
  FinancialRecord,
  ExperienceRecord
} from '../types/characterSheet';

// Base validation schemas for common types
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const positiveNumberSchema = z.number().positive('Must be a positive number');
export const nonNegativeNumberSchema = z.number().nonnegative('Must be zero or positive');

// Characteristic validation (2-15 typical range for Traveller)
export const characteristicValueSchema = z
  .number()
  .int('Must be a whole number')
  .min(1, 'Characteristics must be at least 1')
  .max(18, 'Characteristics cannot exceed 18');

export const characteristicsSchema = z.object({
  strength: characteristicValueSchema,
  dexterity: characteristicValueSchema,
  endurance: characteristicValueSchema,
  intelligence: characteristicValueSchema,
  education: characteristicValueSchema,
  social: characteristicValueSchema,
});

// Character basics validation
export const characterBasicsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods'),
  
  age: z
    .number()
    .int('Age must be a whole number')
    .min(18, 'Age must be at least 18')
    .max(120, 'Age cannot exceed 120'),
  
  gender: z
    .string()
    .trim()
    .min(1, 'Gender is required')
    .max(50, 'Gender cannot exceed 50 characters'),
  
  species: z
    .string()
    .trim()
    .min(1, 'Species is required')
    .max(50, 'Species cannot exceed 50 characters'),
});

// Skill validation
export const skillLevelSchema = z
  .number()
  .int('Skill level must be a whole number')
  .min(0, 'Skill level cannot be negative')
  .max(6, 'Skill level cannot exceed 6');

export const skillCategorySchema = z.enum([
  'Personal',
  'Professional', 
  'Combat',
  'Vehicle',
  'Starship',
  'Psionic',
  'Background',
  'Specialty'
], {
  errorMap: () => ({ message: 'Invalid skill category' })
});

export const characteristicTypeSchema = z.enum([
  'strength',
  'dexterity', 
  'endurance',
  'intelligence',
  'education',
  'social'
], {
  errorMap: () => ({ message: 'Invalid characteristic type' })
});

export const skillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Skill name is required')
    .max(50, 'Skill name cannot exceed 50 characters'),
  
  level: skillLevelSchema,
  
  category: skillCategorySchema,
  
  characteristic: characteristicTypeSchema,
  
  isCareerSkill: z.boolean(),
  
  specialty: z
    .string()
    .trim()
    .max(50, 'Specialty cannot exceed 50 characters')
    .optional(),
  
  experiencePoints: z
    .number()
    .int('Experience points must be a whole number')
    .nonnegative('Experience points cannot be negative')
    .optional(),
  
  lastUsed: z
    .string()
    .datetime('Invalid date format')
    .optional(),
  
  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
});

// Equipment validation
export const equipmentLocationSchema = z.enum([
  'carried',
  'stored', 
  'equipped',
  'ship',
  'home'
], {
  errorMap: () => ({ message: 'Invalid equipment location' })
});

export const equipmentConditionSchema = z.enum([
  'excellent',
  'good',
  'fair', 
  'poor',
  'broken'
], {
  errorMap: () => ({ message: 'Invalid equipment condition' })
});

export const equipmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Equipment name is required')
    .max(100, 'Equipment name cannot exceed 100 characters'),
  
  type: z
    .string()
    .trim()
    .min(1, 'Equipment type is required')
    .max(50, 'Equipment type cannot exceed 50 characters'),
  
  description: z
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional(),
  
  quantity: z
    .number()
    .int('Quantity must be a whole number')
    .positive('Quantity must be at least 1'),
  
  weight: z
    .number()
    .nonnegative('Weight cannot be negative')
    .max(1000, 'Weight cannot exceed 1000 kg'),
  
  cost: z
    .number()
    .nonnegative('Cost cannot be negative')
    .max(1000000000, 'Cost cannot exceed 1 billion credits'),
  
  location: equipmentLocationSchema,
  
  condition: equipmentConditionSchema,
  
  techLevel: z
    .number()
    .int('Tech level must be a whole number')
    .min(0, 'Tech level cannot be negative')
    .max(20, 'Tech level cannot exceed 20')
    .optional(),
  
  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
  
  modifications: z
    .array(z.string().trim().max(100, 'Modification cannot exceed 100 characters'))
    .max(10, 'Cannot have more than 10 modifications')
    .optional(),
});

// Financial validation
export const creditAmountSchema = z
  .number()
  .min(-1000000000, 'Amount cannot be less than -1 billion credits')
  .max(1000000000, 'Amount cannot exceed 1 billion credits');

export const transactionTypeSchema = z.enum([
  'income',
  'expense',
  'transfer', 
  'adjustment'
], {
  errorMap: () => ({ message: 'Invalid transaction type' })
});

export const financialRecordSchema = z.object({
  id: uuidSchema,
  
  type: transactionTypeSchema,
  
  amount: creditAmountSchema,
  
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(200, 'Description cannot exceed 200 characters'),
  
  category: z
    .string()
    .trim()
    .min(1, 'Category is required')
    .max(50, 'Category cannot exceed 50 characters'),
  
  date: z
    .string()
    .datetime('Invalid date format'),
  
  relatedTo: z
    .string()
    .trim()
    .max(100, 'Related field cannot exceed 100 characters')
    .optional(),
});

export const financesSchema = z.object({
  currentCredits: creditAmountSchema,
  
  bankCredits: z
    .number()
    .nonnegative('Bank credits cannot be negative')
    .max(1000000000, 'Bank credits cannot exceed 1 billion'),
  
  debt: z
    .number()
    .nonnegative('Debt cannot be negative')
    .max(1000000000, 'Debt cannot exceed 1 billion'),
  
  monthlyIncome: z
    .number()
    .nonnegative('Monthly income cannot be negative')
    .max(100000000, 'Monthly income cannot exceed 100 million'),
  
  monthlyExpenses: z
    .number()
    .nonnegative('Monthly expenses cannot be negative')
    .max(100000000, 'Monthly expenses cannot exceed 100 million'),
  
  transactions: z
    .array(financialRecordSchema)
    .max(1000, 'Cannot have more than 1000 transactions'),
  
  assets: z
    .array(z.object({
      id: uuidSchema,
      name: z
        .string()
        .trim()
        .min(1, 'Asset name is required')
        .max(100, 'Asset name cannot exceed 100 characters'),
      type: z.enum(['property', 'investment', 'vehicle', 'ship', 'other']),
      value: creditAmountSchema,
      description: z
        .string()
        .trim()
        .max(500, 'Description cannot exceed 500 characters')
        .optional(),
    }))
    .max(100, 'Cannot have more than 100 assets'),
});

// Notes validation
export const noteCategorySchema = z.enum([
  'background',
  'roleplay',
  'session', 
  'personal',
  'mission'
], {
  errorMap: () => ({ message: 'Invalid note category' })
});

export const noteSchema = z.object({
  id: uuidSchema,
  
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  
  content: z
    .string()
    .trim()
    .min(1, 'Content is required')
    .max(10000, 'Content cannot exceed 10,000 characters'),
  
  category: noteCategorySchema,
  
  isPrivate: z.boolean(),
  
  createdAt: z
    .string()
    .datetime('Invalid date format'),
  
  updatedAt: z
    .string()
    .datetime('Invalid date format'),
  
  tags: z
    .array(z.string().trim().min(1).max(30, 'Tag cannot exceed 30 characters'))
    .max(10, 'Cannot have more than 10 tags')
    .optional(),
});

// Status conditions validation
export const conditionSeveritySchema = z.enum([
  'minor',
  'major', 
  'critical'
], {
  errorMap: () => ({ message: 'Invalid condition severity' })
});

export const conditionTypeSchema = z.enum([
  'physical',
  'mental',
  'social',
  'environmental'
], {
  errorMap: () => ({ message: 'Invalid condition type' })
});

export const conditionDurationSchema = z.enum([
  'temporary',
  'permanent',
  'until_treated'
], {
  errorMap: () => ({ message: 'Invalid condition duration' })
});

export const statusConditionSchema = z.object({
  id: uuidSchema,
  
  name: z
    .string()
    .trim()
    .min(1, 'Condition name is required')
    .max(50, 'Condition name cannot exceed 50 characters'),
  
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  
  severity: conditionSeveritySchema,
  
  type: conditionTypeSchema,
  
  duration: conditionDurationSchema,
  
  modifiers: z.object({
    characteristics: characteristicsSchema.partial().optional(),
    skills: z
      .array(z.object({
        name: z.string().trim().min(1),
        modifier: z.number().int().min(-10).max(10)
      }))
      .max(20, 'Cannot have more than 20 skill modifiers')
      .optional(),
    other: z
      .string()
      .trim()
      .max(200, 'Other modifiers cannot exceed 200 characters')
      .optional(),
  }).optional(),
  
  appliedAt: z
    .string()
    .datetime('Invalid date format'),
  
  expiresAt: z
    .string()
    .datetime('Invalid date format')
    .optional(),
  
  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional(),
});

// Experience and advancement validation
export const experienceTypeSchema = z.enum([
  'skill_improvement',
  'characteristic_improvement',
  'new_skill',
  'other'
], {
  errorMap: () => ({ message: 'Invalid experience type' })
});

export const experienceRecordSchema = z.object({
  id: uuidSchema,
  
  type: experienceTypeSchema,
  
  description: z
    .string()
    .trim()
    .min(1, 'Description is required')
    .max(200, 'Description cannot exceed 200 characters'),
  
  cost: z
    .number()
    .int('Cost must be a whole number')
    .positive('Cost must be positive'),
  
  skillName: z
    .string()
    .trim()
    .max(50, 'Skill name cannot exceed 50 characters')
    .optional(),
  
  characteristicName: characteristicTypeSchema.optional(),
  
  date: z
    .string()
    .datetime('Invalid date format'),
  
  sessionId: z
    .string()
    .trim()
    .max(50, 'Session ID cannot exceed 50 characters')
    .optional(),
});

export const advancementSchema = z.object({
  totalExperienceEarned: z
    .number()
    .int('Total experience must be a whole number')
    .nonnegative('Total experience cannot be negative'),
  
  totalExperienceSpent: z
    .number()
    .int('Spent experience must be a whole number')
    .nonnegative('Spent experience cannot be negative'),
  
  availableExperience: z
    .number()
    .int('Available experience must be a whole number')
    .nonnegative('Available experience cannot be negative'),
  
  records: z
    .array(experienceRecordSchema)
    .max(1000, 'Cannot have more than 1000 experience records'),
  
  goals: z
    .array(z.object({
      id: uuidSchema,
      description: z
        .string()
        .trim()
        .min(1, 'Goal description is required')
        .max(200, 'Goal description cannot exceed 200 characters'),
      estimatedCost: z
        .number()
        .int('Estimated cost must be a whole number')
        .positive('Estimated cost must be positive'),
      priority: z.enum(['low', 'medium', 'high']),
      targetDate: z
        .string()
        .datetime('Invalid date format')
        .optional(),
    }))
    .max(50, 'Cannot have more than 50 goals'),
});

// Complete character sheet validation
export const characterSheetSchema = z.object({
  id: uuidSchema,
  
  // Basic information
  name: characterBasicsSchema.shape.name,
  age: characterBasicsSchema.shape.age,
  gender: characterBasicsSchema.shape.gender,
  species: characterBasicsSchema.shape.species,
  
  // Core stats
  characteristics: characteristicsSchema,
  
  // Dynamic data
  skills: z
    .array(skillSchema)
    .max(200, 'Cannot have more than 200 skills'),
  
  equipment: z
    .array(equipmentSchema)
    .max(500, 'Cannot have more than 500 equipment items'),
  
  finances: financesSchema,
  
  conditions: z
    .array(statusConditionSchema)
    .max(50, 'Cannot have more than 50 status conditions'),
  
  notes: z
    .array(noteSchema)
    .max(200, 'Cannot have more than 200 notes'),
  
  advancement: advancementSchema,
  
  // Metadata
  lastModified: z
    .string()
    .datetime('Invalid date format'),
  
  version: z
    .number()
    .int('Version must be a whole number')
    .positive('Version must be positive'),
  
  isActive: z.boolean(),
  
  campaignId: z
    .string()
    .trim()
    .min(1, 'Campaign ID is required'),
}).strict();

// Partial schemas for specific updates
export const characterBasicsUpdateSchema = characterBasicsSchema.partial();
export const characteristicsUpdateSchema = characteristicsSchema.partial();
export const skillUpdateSchema = skillSchema.partial().extend({ 
  id: z.string().optional() // For identifying existing skills
});
export const equipmentUpdateSchema = equipmentSchema.partial().extend({
  id: z.string().optional() // For identifying existing equipment
});

// Field-specific validation functions
export const validateCharacteristicValue = (value: number): string[] => {
  const result = characteristicValueSchema.safeParse(value);
  return result.success ? [] : result.error.errors.map(e => e.message);
};

export const validateSkillLevel = (level: number): string[] => {
  const result = skillLevelSchema.safeParse(level);
  return result.success ? [] : result.error.errors.map(e => e.message);
};

export const validateCreditAmount = (amount: number): string[] => {
  const result = creditAmountSchema.safeParse(amount);
  return result.success ? [] : result.error.errors.map(e => e.message);
};

export const validateEquipmentWeight = (weight: number): string[] => {
  const result = equipmentSchema.shape.weight.safeParse(weight);
  return result.success ? [] : result.error.errors.map(e => e.message);
};

export const validateNoteContent = (content: string): string[] => {
  const result = noteSchema.shape.content.safeParse(content);
  return result.success ? [] : result.error.errors.map(e => e.message);
};

// Utility function for getting field-specific validation
export const getFieldValidation = (fieldPath: string, value: any): string[] => {
  try {
    switch (fieldPath) {
      case 'name':
        return characterBasicsSchema.shape.name.safeParse(value).success 
          ? [] 
          : characterBasicsSchema.shape.name.safeParse(value).error!.errors.map(e => e.message);
      
      case 'age':
        return characterBasicsSchema.shape.age.safeParse(value).success 
          ? [] 
          : characterBasicsSchema.shape.age.safeParse(value).error!.errors.map(e => e.message);
      
      case 'characteristics.strength':
      case 'characteristics.dexterity':
      case 'characteristics.endurance':
      case 'characteristics.intelligence':
      case 'characteristics.education':
      case 'characteristics.social':
        return validateCharacteristicValue(value);
        
      default:
        return [];
    }
  } catch (error) {
    return ['Validation error'];
  }
};

// Skills-specific validation helpers
export const validateSkillName = (name: string, existingSkills: CharacterSheetSkill[] = []): string[] => {
  const errors: string[] = [];
  
  // Basic name validation
  const nameResult = skillSchema.shape.name.safeParse(name);
  if (!nameResult.success) {
    errors.push(...nameResult.error.errors.map(e => e.message));
  }
  
  // Check for duplicates (considering specializations)
  const duplicate = existingSkills.find(skill => 
    skill.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    errors.push('A skill with this name already exists');
  }
  
  return errors;
};

export const validateSkillSpecialization = (
  skillName: string, 
  specialization: string | undefined, 
  existingSkills: CharacterSheetSkill[] = []
): string[] => {
  const errors: string[] = [];
  
  if (specialization) {
    // Basic specialization validation
    const specResult = skillSchema.shape.specialty.safeParse(specialization);
    if (!specResult.success) {
      errors.push(...specResult.error.errors.map(e => e.message));
    }
    
    // Check for duplicate skill+specialization combination
    const duplicate = existingSkills.find(skill => 
      skill.name.toLowerCase() === skillName.toLowerCase() && 
      skill.specialty?.toLowerCase() === specialization.toLowerCase()
    );
    if (duplicate) {
      errors.push('This skill specialization already exists');
    }
  }
  
  return errors;
};

export const validateSkillImprovement = (
  currentLevel: number, 
  targetLevel: number, 
  isCareerSkill: boolean,
  availableExperience: number
): { isValid: boolean; errors: string[]; cost?: number } => {
  const errors: string[] = [];
  
  // Level validation
  if (targetLevel <= currentLevel) {
    errors.push('Target level must be higher than current level');
  }
  
  if (targetLevel > 6) {
    errors.push('Skills cannot exceed level 6');
  }
  
  if (targetLevel - currentLevel > 1) {
    errors.push('Skills can only be improved one level at a time');
  }
  
  // Cost calculation using Traveller RPG rules
  const cost = calculateSkillImprovementCost(currentLevel, targetLevel, isCareerSkill);
  
  if (cost > availableExperience) {
    errors.push(`Insufficient experience points. Required: ${cost}, Available: ${availableExperience}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    cost: errors.length === 0 ? cost : undefined
  };
};

// Skill improvement cost calculation following Traveller RPG rules
export const calculateSkillImprovementCost = (
  currentLevel: number, 
  targetLevel: number, 
  isCareerSkill: boolean
): number => {
  let totalCost = 0;
  
  for (let level = currentLevel + 1; level <= targetLevel; level++) {
    let baseCost: number;
    
    if (level === 1) {
      // Level 0 to 1
      baseCost = isCareerSkill ? 1 : 2;
    } else {
      // Level X to X+1
      baseCost = level * (isCareerSkill ? 2 : 4);
    }
    
    totalCost += baseCost;
  }
  
  return totalCost;
};

// Skill usage tracking validation
export const validateSkillUsage = (skillUsage: {
  timesUsed: number;
  lastUsed?: string;
  successfulUses: number;
  failedUses: number;
}): string[] => {
  const errors: string[] = [];
  
  if (skillUsage.timesUsed < 0) {
    errors.push('Times used cannot be negative');
  }
  
  if (skillUsage.successfulUses < 0) {
    errors.push('Successful uses cannot be negative');
  }
  
  if (skillUsage.failedUses < 0) {
    errors.push('Failed uses cannot be negative');
  }
  
  if (skillUsage.successfulUses + skillUsage.failedUses > skillUsage.timesUsed) {
    errors.push('Total uses cannot exceed recorded uses');
  }
  
  if (skillUsage.lastUsed) {
    const lastUsedDate = new Date(skillUsage.lastUsed);
    if (isNaN(lastUsedDate.getTime())) {
      errors.push('Invalid last used date format');
    }
    
    if (lastUsedDate > new Date()) {
      errors.push('Last used date cannot be in the future');
    }
  }
  
  return errors;
};

// Experience gain calculation for skill usage
export const calculateExperienceGain = (
  skillLevel: number,
  wasSuccessful: boolean,
  difficulty: 'Easy' | 'Average' | 'Difficult' | 'Formidable' = 'Average'
): number => {
  let baseGain = 0;
  
  // Base experience gain
  if (wasSuccessful) {
    baseGain = 1;
  } else {
    // Learn from failure
    baseGain = 2;
  }
  
  // Difficulty modifier
  const difficultyMultiplier = {
    'Easy': 0.5,
    'Average': 1,
    'Difficult': 1.5,
    'Formidable': 2
  }[difficulty];
  
  // Higher level skills gain experience slower
  const levelModifier = Math.max(0.1, 1 - (skillLevel * 0.1));
  
  return Math.ceil(baseGain * difficultyMultiplier * levelModifier);
};

// Export validation types for TypeScript inference
export type CharacterBasicsValidation = z.infer<typeof characterBasicsSchema>;
export type CharacteristicsValidation = z.infer<typeof characteristicsSchema>;
export type SkillValidation = z.infer<typeof skillSchema>;
export type EquipmentValidation = z.infer<typeof equipmentSchema>;
export type FinancialRecordValidation = z.infer<typeof financialRecordSchema>;
export type StatusConditionValidation = z.infer<typeof statusConditionSchema>;
export type NoteValidation = z.infer<typeof noteSchema>;
export type CharacterSheetValidation = z.infer<typeof characterSheetSchema>;
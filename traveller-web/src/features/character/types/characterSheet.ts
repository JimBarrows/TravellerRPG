// Character sheet types extending the character creation types
import type { 
  CharacterCreationData, 
  CharacterCharacteristics, 
  CharacterSkill, 
  CharacterEquipment,
  LifeEvent,
  CareerTerm
} from './characterCreation';

// Enhanced characteristics tracking for sheet view
export interface CharacteristicModifier {
  id: string;
  source: 'equipment' | 'condition' | 'aging' | 'training' | 'augmentation' | 'temporary';
  type: 'damage' | 'enhancement' | 'drain';
  value: number;
  duration?: 'permanent' | 'temporary' | 'until_removed';
  expiresAt?: string;
  description: string;
  appliedAt: string;
}

export interface CharacteristicHistory {
  characteristic: keyof CharacterCharacteristics;
  originalValue: number;
  currentValue: number;
  modifiers: CharacteristicModifier[];
  improvementAttempts: number;
  pointsSpent: number;
  lastImprovement?: string;
  agingEffects: number; // Cumulative aging damage
}

export interface CharacteristicsExtended extends CharacterCharacteristics {
  // Track original rolled values vs current
  original: CharacterCharacteristics;
  // Track all modifiers applied
  modifiers: Record<keyof CharacterCharacteristics, CharacteristicModifier[]>;
  // Track improvement history
  history: Record<keyof CharacterCharacteristics, CharacteristicHistory>;
  // Track aging effects
  agingTable?: {
    nextAgingCheck: number; // Age when next check is due
    lastCheck: number; // Last age check was performed
    physicalDegradation: number; // Total physical characteristic loss from aging
  };
}

// Traveller RPG Condition Types
export type TravellerConditionType = 
  | 'physical' // Physical injuries and damage
  | 'mental' // Psychological conditions
  | 'social' // Social standing effects
  | 'environmental' // Radiation, vacuum, extreme weather
  | 'medical' // Disease, poison, addiction
  | 'fatigue' // Exhaustion and tiredness
  | 'aging' // Age-related degradation
  | 'augmentation'; // Cyberware and enhancement effects

export type TravellerConditionSeverity = 
  | 'minor' // -1 DM to related activities
  | 'moderate' // -2 DM to related activities
  | 'major' // -3 DM, potential unconsciousness
  | 'critical' // -4 DM, life-threatening
  | 'terminal'; // Character death imminent

export type TravellerConditionDuration = 
  | 'instant' // Immediate effect then gone
  | 'rounds' // Combat rounds (6 seconds each)
  | 'minutes' // Short term
  | 'hours' // Extended
  | 'days' // Long term recovery
  | 'weeks' // Serious conditions
  | 'permanent' // Requires surgery/treatment
  | 'until_treated' // Medical intervention required
  | 'until_healed'; // Natural healing over time

// Specific condition effects on game mechanics
export interface ConditionEffect {
  type: 'characteristic' | 'skill' | 'initiative' | 'movement' | 'endurance' | 'healing' | 'special';
  target?: string; // specific characteristic, skill, or mechanic affected
  modifier: number; // DM modifier (negative = penalty, positive = bonus)
  percentage?: number; // For percentage-based effects (like movement reduction)
  stackable: boolean; // Whether multiple instances of this effect stack
  description: string; // What this effect does
}

// Recovery and healing mechanics
export interface RecoveryCondition {
  method: 'natural' | 'medical' | 'surgery' | 'augmentation' | 'psionic' | 'special';
  timeRequired: number; // In the duration units specified
  timeUnit: TravellerConditionDuration;
  difficulty?: number; // Task difficulty if skill check required
  skillRequired?: string; // Required skill for treatment
  equipmentRequired?: string[]; // Medical equipment or drugs needed
  costCredits?: number; // Cost of treatment
  successChance?: number; // Base success chance (0-100)
  criticalFailureEffect?: string; // What happens on critical failure
  notes?: string;
}

// Enhanced status condition following Traveller RPG rules
export interface StatusCondition {
  id: string;
  name: string;
  description: string;
  
  // Traveller-specific classification
  severity: TravellerConditionSeverity;
  type: TravellerConditionType;
  duration: TravellerConditionDuration;
  
  // Game mechanics effects
  effects: ConditionEffect[];
  
  // Timing and application
  appliedAt: string;
  expiresAt?: string;
  durationValue?: number; // Numeric value for duration (e.g., 3 days)
  
  // Recovery and treatment
  recovery?: RecoveryCondition;
  treatmentAttempts?: number; // Track failed treatment attempts
  improvingNaturally?: boolean; // Whether natural healing is occurring
  
  // Condition progression
  canWorsen?: boolean; // Can this condition get worse over time?
  canImprove?: boolean; // Can this condition improve without treatment?
  worsenConditions?: string[]; // What makes this condition worse
  improveConditions?: string[]; // What makes this condition better
  
  // Source and causation
  source?: string; // What caused this condition
  relatedConditions?: string[]; // Other condition IDs that are related
  prerequisiteFor?: string[]; // Conditions this one can lead to
  
  // Player notes and customization
  notes?: string;
  isCustom?: boolean; // Player-created condition
  
  // Visual and UI
  icon?: string; // Icon to display
  colorClass?: string; // CSS class for styling
}

// Predefined Traveller RPG conditions
export interface TravellerConditionTemplate {
  name: string;
  description: string;
  type: TravellerConditionType;
  defaultSeverity: TravellerConditionSeverity;
  defaultDuration: TravellerConditionDuration;
  effects: ConditionEffect[];
  recovery?: Partial<RecoveryCondition>;
  canWorsen?: boolean;
  canImprove?: boolean;
  icon?: string;
  colorClass?: string;
  notes?: string;
}

// Condition management and tracking
export interface ConditionStatus {
  totalActive: number;
  byType: Record<TravellerConditionType, number>;
  bySeverity: Record<TravellerConditionSeverity, number>;
  totalPenalties: {
    characteristics: Partial<CharacterCharacteristics>;
    skills: Array<{ name: string; modifier: number }>;
    initiative: number;
    movement: number;
    endurance: number;
    healing: number;
    other: string[];
  };
  requiresImmediateAttention: StatusCondition[];
  treatable: StatusCondition[];
  naturallyHealing: StatusCondition[];
}

// Financial tracking
export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'adjustment';
  amount: number;
  description: string;
  category: string;
  date: string;
  relatedTo?: string; // ID of related equipment, mission, etc.
}

export interface CharacterFinances {
  currentCredits: number;
  bankCredits: number;
  debt: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  transactions: FinancialRecord[];
  assets: Array<{
    id: string;
    name: string;
    type: 'property' | 'investment' | 'vehicle' | 'ship' | 'other';
    value: number;
    description?: string;
  }>;
}

// Equipment categories following Traveller RPG
export type EquipmentCategory = 
  | 'weapon' 
  | 'armor' 
  | 'tool' 
  | 'survival' 
  | 'medical' 
  | 'computer' 
  | 'communication' 
  | 'vehicle'
  | 'augmentation'
  | 'clothing'
  | 'misc';

export type EquipmentLocation = 'carried' | 'stored' | 'equipped' | 'ship' | 'home';
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'broken';

// Equipment effects on character stats
export interface EquipmentEffect {
  type: 'characteristic' | 'skill' | 'protection' | 'damage' | 'special';
  target: string; // characteristic name, skill name, or special effect name
  modifier: number;
  condition?: string; // when this effect applies (e.g., "when worn", "when used")
  stackable?: boolean; // whether multiple instances stack
}

// Power and ammunition tracking
export interface PowerSource {
  type: 'battery' | 'power_cell' | 'fusion' | 'chemical' | 'manual';
  capacity: number; // total power/ammo capacity
  current: number; // current power/ammo remaining
  cost: number; // cost to refill/recharge
  rechargeable: boolean;
}

// Equipment enhancements for sheet view
export interface CharacterSheetEquipment extends CharacterEquipment {
  location: EquipmentLocation;
  condition: EquipmentCondition;
  notes?: string;
  modifications?: string[];
  techLevel: number;
  
  // Enhanced Traveller-specific properties
  category: EquipmentCategory;
  availability?: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'illegal';
  lawLevel?: number; // minimum law level where legal
  effects?: EquipmentEffect[]; // what this equipment does to character stats
  
  // Power/ammunition tracking
  powerSource?: PowerSource;
  ammunition?: {
    type: string;
    capacity: number;
    current: number;
    cost: number; // cost per round/reload
  };
  
  // Equipment condition affects performance
  conditionModifier?: number; // performance penalty/bonus based on condition
  
  // Special properties
  traits?: string[]; // weapon/armor traits
  damage?: string; // weapon damage
  protection?: number; // armor protection value
  range?: string; // weapon range
  magazine?: number; // weapon magazine size
  
  // Maintenance tracking
  lastMaintenance?: string;
  maintenanceRequired?: boolean;
  
  // Custom equipment (player-created)
  isCustom?: boolean;
  
  // Equipment bundling (kits, sets)
  parentId?: string; // if this is part of a kit
  childrenIds?: string[]; // if this contains other items
}

// Skill usage tracking interface
export interface SkillUsageTracker {
  timesUsed: number;
  successfulUses: number;
  failedUses: number;
  lastUsed?: string;
  experienceGained: number;
  averageDifficultyFaced: number;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  sessionUsage: Array<{
    sessionId: string;
    date: string;
    uses: number;
    successes: number;
    failures: number;
  }>;
}

// Skill improvement tracking
export interface SkillImprovement {
  fromLevel: number;
  toLevel: number;
  costPaid: number;
  dateImproved: string;
  methodUsed: 'training' | 'experience' | 'education' | 'practice';
  notes?: string;
}

// Skill enhancements for sheet view
export interface CharacterSheetSkill extends CharacterSkill {
  category: string;
  characteristic: keyof CharacterCharacteristics;
  isCareerSkill: boolean;
  experiencePoints?: number;
  lastUsed?: string;
  notes?: string;
  usage?: SkillUsageTracker;
  improvementHistory?: SkillImprovement[];
  defaultCharacteristic?: keyof CharacterCharacteristics; // For skills that can use different characteristics
  cascadeSkills?: string[]; // Related skills that benefit from this one
}

// Notes and background information
export type NoteCategory = 
  | 'background' 
  | 'personality' 
  | 'campaign' 
  | 'connections' 
  | 'rivals' 
  | 'goals' 
  | 'journal' 
  | 'roleplay' 
  | 'session' 
  | 'personal' 
  | 'mission';

export interface CharacterNote {
  id: string;
  title: string;
  content: string; // Rich text HTML content
  plainTextContent?: string; // Plain text version for search
  category: NoteCategory;
  subcategory?: string; // Custom subcategory for organization
  isPrivate: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  color?: string; // Hex color for visual organization
  metadata?: {
    wordCount?: number;
    characterCount?: number;
    readTimeMinutes?: number;
    lastAccessedAt?: string;
  };
  relations?: {
    characterIds?: string[]; // Related NPCs or characters
    locationIds?: string[]; // Related locations
    eventIds?: string[]; // Related events
  };
}

// Note search and filtering
export interface NoteFilter {
  category?: NoteCategory;
  subcategory?: string;
  tags?: string[];
  isPrivate?: boolean;
  isFavorite?: boolean;
  searchQuery?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface NoteSortOptions {
  field: 'title' | 'createdAt' | 'updatedAt' | 'category' | 'wordCount';
  direction: 'asc' | 'desc';
}

// Note organization and structure
export interface NoteCategoryDefinition {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  subcategories?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

export interface NotesConfiguration {
  categories: NoteCategoryDefinition[];
  defaultCategory: NoteCategoryDefinition;
  enableTags: boolean;
  enablePrivateNotes: boolean;
  enableMarkdownExport: boolean;
  autoSaveInterval: number; // milliseconds
  maxNoteLength: number;
}

// Experience sources and activities
export type ExperienceSource = 
  | 'skill_use_success' 
  | 'skill_use_critical' 
  | 'combat_survival' 
  | 'exploration_discovery' 
  | 'social_success' 
  | 'training_completion' 
  | 'mission_completion' 
  | 'research_breakthrough' 
  | 'teaching_others' 
  | 'milestone_achievement'
  | 'gm_award' 
  | 'other';

export type ExperienceSpendingType = 
  | 'skill_improvement' 
  | 'characteristic_improvement' 
  | 'new_skill' 
  | 'training_cost' 
  | 'education' 
  | 'enhancement' 
  | 'other';

// Milestone tracking for experience progression
export interface ExperienceMilestone {
  id: string;
  name: string;
  description: string;
  experienceThreshold: number;
  achieved: boolean;
  achievedAt?: string;
  rewards?: Array<{
    type: 'skill_discount' | 'characteristic_discount' | 'bonus_xp' | 'special_ability';
    description: string;
    value?: number;
  }>;
}

// Enhanced experience record
export interface ExperienceRecord {
  id: string;
  type: ExperienceSpendingType;
  source?: ExperienceSource;
  description: string;
  amount: number; // Positive for gains, negative for spending
  skillName?: string;
  characteristicName?: keyof CharacterCharacteristics;
  date: string;
  sessionId?: string;
  sessionName?: string;
  difficulty?: number; // Task difficulty that granted XP
  circumstance?: string; // Special circumstances
  rollResult?: number; // Die roll result if applicable
  witnesses?: string[]; // Other characters present
}

// Traveller RPG advancement costs and rules
export interface AdvancementCosts {
  skillImprovement: {
    // Base cost to increase skill from level N to N+1
    baseCost: (currentLevel: number, isCareerSkill: boolean) => number;
    // Training time in weeks
    trainingTime: (currentLevel: number) => number;
    // Age penalties (per decade over 30)
    agePenalty: (age: number) => number;
  };
  characteristicImprovement: {
    // Base cost to increase characteristic by 1
    baseCost: (currentValue: number, characteristic: keyof CharacterCharacteristics) => number;
    // Training time in weeks
    trainingTime: (currentValue: number) => number;
    // Age limitations
    ageLimit: (characteristic: keyof CharacterCharacteristics, age: number) => boolean;
  };
  newSkill: {
    // Cost to gain a new skill at level 0
    baseCost: (isCareerSkill: boolean) => number;
    // Training time in weeks
    trainingTime: () => number;
  };
}

// Training and advancement tracking
export interface TrainingSession {
  id: string;
  type: ExperienceSpendingType;
  targetSkill?: string;
  targetCharacteristic?: keyof CharacterCharacteristics;
  instructor?: string;
  facility?: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  difficulty: number;
  success: boolean;
  notes?: string;
}

export interface CharacterAdvancement {
  totalExperienceEarned: number;
  totalExperienceSpent: number;
  availableExperience: number;
  records: ExperienceRecord[];
  milestones: ExperienceMilestone[];
  trainingHistory: TrainingSession[];
  
  // Advancement goals and planning
  goals: Array<{
    id: string;
    description: string;
    estimatedCost: number;
    priority: 'low' | 'medium' | 'high';
    targetDate?: string;
    requiredMilestones?: string[];
  }>;
  
  // Activity tracking for experience gain
  activityTracking: {
    skillUsageSessionCount: number;
    combatEncountersCount: number;
    explorationHours: number;
    socialEncountersCount: number;
    researchHours: number;
    teachingHours: number;
    lastActivityDate?: string;
  };
  
  // Advancement preferences
  preferences: {
    autoTrackSkillUsage: boolean;
    showAdvancementSuggestions: boolean;
    preferredTrainingFacilities: string[];
    maxTrainingCostPerSession: number;
  };
}

// Character version history and backup system
export interface CharacterSnapshot {
  id: string;
  characterId: string;
  version: number;
  snapshotDate: string;
  description?: string;
  snapshotType: 'manual' | 'auto' | 'milestone' | 'session_end' | 'major_change';
  characterData: CharacterSheetData;
  metadata: {
    sessionId?: string;
    sessionName?: string;
    changesSummary?: string[];
    xpGained?: number;
    majorEvents?: string[];
    createdBy?: string;
  };
}

export interface CharacterHistory {
  snapshots: CharacterSnapshot[];
  currentVersion: number;
  autoSnapshotEnabled: boolean;
  autoSnapshotTriggers: {
    onLevelUp: boolean;
    onMilestone: boolean;
    onSessionEnd: boolean;
    onMajorChange: boolean;
    intervalDays?: number;
  };
  maxSnapshots: number;
  lastSnapshotDate?: string;
}

// Character sharing and permissions
export type SharingPermissionLevel = 
  | 'view_basic' // Name, level, basic stats only
  | 'view_full' // Full character sheet except private notes
  | 'view_all' // Everything including private notes
  | 'edit_limited' // Can edit notes and equipment
  | 'edit_full' // Can edit everything except advancement
  | 'owner'; // Full control including deletion

export interface CharacterSharingSettings {
  isPublic: boolean;
  allowComments: boolean;
  allowDownload: boolean;
  expirationDate?: string;
  accessCount?: number;
  maxAccessCount?: number;
  permissions: SharingPermissionLevel[];
  restrictedFields?: string[]; // Specific fields to hide
}

export interface CharacterShare {
  id: string;
  characterId: string;
  shareToken: string;
  qrCodeUrl?: string;
  createdAt: string;
  expiresAt?: string;
  settings: CharacterSharingSettings;
  accessLog: Array<{
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
    action: 'view' | 'download' | 'comment';
  }>;
  isActive: boolean;
}

// Character backup and export formats
export type ExportFormat = 'json' | 'pdf' | 'csv' | 'xml' | 'foundry' | 'roll20';

export interface CharacterBackup {
  id: string;
  characterId: string;
  backupDate: string;
  format: ExportFormat;
  size: number; // in bytes
  checksum: string;
  description?: string;
  isEncrypted: boolean;
  backupData: string | Uint8Array;
  metadata: {
    version: string;
    gameSystem: 'traveller';
    characterVersion: number;
    backupTrigger: 'manual' | 'auto' | 'scheduled';
  };
}

export interface BackupSettings {
  autoBackupEnabled: boolean;
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly' | 'on_change';
  maxBackups: number;
  preferredFormat: ExportFormat;
  encryptBackups: boolean;
  cloudSync: {
    enabled: boolean;
    provider?: 'google_drive' | 'dropbox' | 'onedrive' | 'custom';
    lastSyncDate?: string;
  };
}

// Complete character sheet data structure
export interface CharacterSheetData extends Omit<CharacterCreationData, 'skills' | 'equipment'> {
  id: string;
  
  // Enhanced data
  skills: CharacterSheetSkill[];
  equipment: CharacterSheetEquipment[];
  
  // Additional sheet data
  conditions: StatusCondition[];
  finances: CharacterFinances;
  notes: CharacterNote[];
  advancement: CharacterAdvancement;
  
  // Version control and history
  history: CharacterHistory;
  sharing: CharacterShare[];
  backups: CharacterBackup[];
  backupSettings: BackupSettings;
  
  // Sheet metadata
  lastModified: string;
  version: number;
  isActive: boolean;
  campaignId: string;
  
  // Display preferences
  sheetLayout?: {
    preferredSections: string[];
    collapsedSections: string[];
    customizations?: Record<string, any>;
  };
}

// Character sheet section types
export type CharacterSheetSection = 
  | 'basics'
  | 'skills'
  | 'equipment'
  | 'finances'
  | 'conditions'
  | 'notes'
  | 'advancement'
  | 'background';

export interface CharacterSheetSectionProps {
  character: CharacterSheetData;
  onUpdate: (updates: Partial<CharacterSheetData>) => void;
  readonly?: boolean;
}

// Navigation and layout types
export interface SheetTab {
  id: CharacterSheetSection;
  label: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

export const DEFAULT_SHEET_TABS: SheetTab[] = [
  { id: 'basics', label: 'Basics', icon: 'user' },
  { id: 'skills', label: 'Skills', icon: 'brain' },
  { id: 'equipment', label: 'Equipment', icon: 'package' },
  { id: 'finances', label: 'Finances', icon: 'credit-card' },
  { id: 'conditions', label: 'Conditions', icon: 'heart' },
  { id: 'notes', label: 'Notes', icon: 'file-text' },
  { id: 'advancement', label: 'XP', icon: 'trending-up' },
];

// Utility functions for character sheet following Traveller RPG rules
export const getCharacteristicModifier = (value: number): number => {
  // Traveller RPG rules: DM = floor((characteristic - 6) / 3)
  // Special cases: 0 = dead, 1 = unconscious
  if (value <= 0) return -3; // Dead
  if (value === 1) return -2; // Unconscious/disabled
  
  return Math.floor((value - 6) / 3);
};

export const getSkillCheckDM = (
  skill: CharacterSheetSkill, 
  characteristics: CharacterCharacteristics
): number => {
  const characteristicMod = getCharacteristicModifier(characteristics[skill.characteristic]);
  return skill.level + characteristicMod;
};

// Enhanced encumbrance calculation following Traveller RPG rules
export interface EncumbranceStatus {
  carried: number;
  equipped: number;
  total: number;
  normalCapacity: number;
  maxCapacity: number;
  encumbranceLevel: 'none' | 'light' | 'heavy' | 'overloaded';
  penalty: number; // DM penalty for being encumbered
  canMove: boolean;
}

export const calculateEncumbrance = (
  equipment: CharacterSheetEquipment[], 
  strength: number = 7, 
  endurance: number = 7
): EncumbranceStatus => {
  const carriedWeight = equipment
    .filter(item => item.location === 'carried')
    .reduce((total, item) => total + (item.weight * item.quantity), 0);
    
  const equippedWeight = equipment
    .filter(item => item.location === 'equipped')
    .reduce((total, item) => total + (item.weight * item.quantity), 0);
  
  const totalWeight = carriedWeight + equippedWeight;
  
  // Traveller encumbrance rules: STR + END = kg can carry normally
  // Can carry up to 2x normally without penalties
  // 2x-3x = light encumbrance (-1 DM)
  // 3x-4x = heavy encumbrance (-2 DM)  
  // 4x+ = overloaded (-3 DM, movement severely restricted)
  const normalCapacity = strength + endurance;
  const maxCapacity = normalCapacity * 4;
  
  let encumbranceLevel: EncumbranceStatus['encumbranceLevel'] = 'none';
  let penalty = 0;
  let canMove = true;
  
  if (totalWeight > normalCapacity * 3) {
    encumbranceLevel = 'overloaded';
    penalty = -3;
    canMove = totalWeight <= maxCapacity;
  } else if (totalWeight > normalCapacity * 2) {
    encumbranceLevel = 'heavy';
    penalty = -2;
  } else if (totalWeight > normalCapacity) {
    encumbranceLevel = 'light';
    penalty = -1;
  }
  
  return {
    carried: carriedWeight,
    equipped: equippedWeight,
    total: totalWeight,
    normalCapacity,
    maxCapacity,
    encumbranceLevel,
    penalty,
    canMove
  };
};

export const getConditionModifiers = (conditions: StatusCondition[]): {
  characteristics: Partial<CharacterCharacteristics>;
  skills: Array<{ name: string; modifier: number }>;
  initiative: number;
  movement: number;
  endurance: number;
  healing: number;
  other: string[];
} => {
  const result = {
    characteristics: {} as Partial<CharacterCharacteristics>,
    skills: [] as Array<{ name: string; modifier: number }>,
    initiative: 0,
    movement: 0,
    endurance: 0,
    healing: 0,
    other: [] as string[]
  };
  
  conditions.forEach(condition => {
    condition.effects.forEach(effect => {
      switch (effect.type) {
        case 'characteristic':
          if (effect.target === 'all') {
            // Apply to all characteristics
            const charKeys: (keyof CharacterCharacteristics)[] = [
              'strength', 'dexterity', 'endurance', 'intelligence', 'education', 'social'
            ];
            charKeys.forEach(key => {
              result.characteristics[key] = (result.characteristics[key] || 0) + effect.modifier;
            });
          } else if (effect.target === 'all_physical') {
            // Apply to physical characteristics
            ['strength', 'dexterity', 'endurance'].forEach(key => {
              const charKey = key as keyof CharacterCharacteristics;
              result.characteristics[charKey] = (result.characteristics[charKey] || 0) + effect.modifier;
            });
          } else if (effect.target === 'all_mental') {
            // Apply to mental characteristics
            ['intelligence', 'education'].forEach(key => {
              const charKey = key as keyof CharacterCharacteristics;
              result.characteristics[charKey] = (result.characteristics[charKey] || 0) + effect.modifier;
            });
          } else if (effect.target) {
            // Apply to specific characteristic
            const charKey = effect.target as keyof CharacterCharacteristics;
            if (['strength', 'dexterity', 'endurance', 'intelligence', 'education', 'social'].includes(charKey)) {
              result.characteristics[charKey] = (result.characteristics[charKey] || 0) + effect.modifier;
            }
          }
          break;

        case 'skill':
          if (effect.target) {
            const existingSkill = result.skills.find(s => s.name === effect.target);
            if (existingSkill && effect.stackable) {
              existingSkill.modifier += effect.modifier;
            } else if (!existingSkill) {
              result.skills.push({ name: effect.target, modifier: effect.modifier });
            }
          }
          break;

        case 'initiative':
          result.initiative += effect.modifier;
          break;

        case 'movement':
          if (effect.percentage) {
            // Percentage reduction
            result.movement = Math.min(result.movement, 100 - effect.percentage);
          } else {
            result.movement += effect.modifier;
          }
          break;

        case 'endurance':
          result.endurance += effect.modifier;
          break;

        case 'healing':
          result.healing += effect.modifier;
          break;

        case 'special':
          result.other.push(effect.description);
          break;
      }
    });
  });
  
  return result;
};

// Equipment effects calculation
export const getEquipmentModifiers = (equipment: CharacterSheetEquipment[]): {
  characteristics: Partial<CharacterCharacteristics>;
  skills: Array<{ name: string; modifier: number }>;
  protection: number;
  other: string[];
} => {
  const result = {
    characteristics: {} as Partial<CharacterCharacteristics>,
    skills: [] as Array<{ name: string; modifier: number }>,
    protection: 0,
    other: [] as string[]
  };
  
  // Only count equipped items for effects
  const equippedItems = equipment.filter(item => 
    item.location === 'equipped' && 
    item.condition !== 'broken' &&
    item.effects
  );
  
  equippedItems.forEach(item => {
    item.effects?.forEach(effect => {
      // Apply condition modifier based on equipment condition
      let conditionMultiplier = 1;
      switch (item.condition) {
        case 'poor':
          conditionMultiplier = 0.5;
          break;
        case 'fair':
          conditionMultiplier = 0.75;
          break;
        case 'good':
          conditionMultiplier = 1;
          break;
        case 'excellent':
          conditionMultiplier = 1.25;
          break;
      }
      
      const adjustedModifier = Math.floor(effect.modifier * conditionMultiplier);
      
      switch (effect.type) {
        case 'characteristic':
          const charKey = effect.target as keyof CharacterCharacteristics;
          if (charKey in result.characteristics) {
            result.characteristics[charKey] = (result.characteristics[charKey] || 0) + adjustedModifier;
          }
          break;
          
        case 'skill':
          // Check if skill modifier already exists and is stackable
          const existingSkillModifier = result.skills.find(s => s.name === effect.target);
          if (existingSkillModifier && effect.stackable) {
            existingSkillModifier.modifier += adjustedModifier;
          } else if (!existingSkillModifier) {
            result.skills.push({ name: effect.target, modifier: adjustedModifier });
          }
          break;
          
        case 'protection':
          result.protection += adjustedModifier;
          break;
          
        case 'special':
          result.other.push(`${effect.target}: ${adjustedModifier > 0 ? '+' : ''}${adjustedModifier}`);
          break;
      }
    });
  });
  
  return result;
};

// Equipment condition utility functions
export const getConditionDescription = (condition: EquipmentCondition): string => {
  const descriptions: Record<EquipmentCondition, string> = {
    excellent: 'Pristine condition, +25% effectiveness',
    good: 'Normal working condition',
    fair: 'Some wear, -25% effectiveness',
    poor: 'Poor condition, -50% effectiveness',
    broken: 'Non-functional, requires repair'
  };
  return descriptions[condition];
};

export const getConditionColorClass = (condition: EquipmentCondition): string => {
  const colors: Record<EquipmentCondition, string> = {
    excellent: 'text-purple-600',
    good: 'text-green-600',
    fair: 'text-yellow-600',
    poor: 'text-orange-600',
    broken: 'text-red-600'
  };
  return colors[condition];
};

export const getEquipmentLocationIcon = (location: EquipmentLocation): string => {
  const icons: Record<EquipmentLocation, string> = {
    carried: '🎒',
    equipped: '⚔️',
    stored: '📦',
    ship: '🚀',
    home: '🏠'
  };
  return icons[location];
};

export const getEquipmentCategoryIcon = (category: EquipmentCategory): string => {
  const icons: Record<EquipmentCategory, string> = {
    weapon: '⚔️',
    armor: '🛡️',
    tool: '🔧',
    survival: '🏕️',
    medical: '🏥',
    computer: '💻',
    communication: '📡',
    vehicle: '🚗',
    augmentation: '🦾',
    clothing: '👔',
    misc: '📦'
  };
  return icons[category];
};

// Enhanced characteristics utility functions
export const getCharacteristicAbbreviation = (characteristic: keyof CharacterCharacteristics): string => {
  const abbreviations: Record<keyof CharacterCharacteristics, string> = {
    strength: 'STR',
    dexterity: 'DEX',
    endurance: 'END',
    intelligence: 'INT',
    education: 'EDU',
    social: 'SOC',
  };
  return abbreviations[characteristic];
};

export const toUPP = (characteristics: CharacterCharacteristics): string => {
  const hexDigits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  const values = [
    characteristics.strength,
    characteristics.dexterity,
    characteristics.endurance,
    characteristics.intelligence,
    characteristics.education,
    characteristics.social,
  ];
  
  return values.map(val => hexDigits[Math.min(Math.max(val, 0), hexDigits.length - 1)]).join('');
};

export const getCharacteristicColorClass = (value: number): string => {
  if (value <= 0) return 'text-black'; // Dead
  if (value === 1) return 'text-red-900'; // Unconscious
  if (value <= 3) return 'text-red-600'; // Very poor
  if (value <= 5) return 'text-orange-600'; // Poor
  if (value <= 8) return 'text-gray-600'; // Average
  if (value <= 11) return 'text-blue-600'; // Good
  if (value <= 14) return 'text-green-600'; // Excellent
  return 'text-purple-600'; // Superhuman (15+)
};

export const getModifierColorClass = (modifier: number): string => {
  if (modifier > 0) return 'text-green-600';
  if (modifier < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getCharacteristicDescription = (characteristic: keyof CharacterCharacteristics): string => {
  const descriptions: Record<keyof CharacterCharacteristics, string> = {
    strength: 'Physical power, muscle mass, and lifting capacity',
    dexterity: 'Agility, reflexes, and hand-eye coordination', 
    endurance: 'Stamina, resilience, and physical constitution',
    intelligence: 'Reasoning ability, logic, and problem-solving',
    education: 'Knowledge, training, and learned skills',
    social: 'Charisma, leadership, and social standing',
  };
  return descriptions[characteristic];
};

export const calculateEffectiveCharacteristic = (
  baseValue: number,
  modifiers: CharacteristicModifier[]
): number => {
  const totalModifier = modifiers.reduce((sum, modifier) => {
    // Check if modifier is still active
    if (modifier.expiresAt && new Date(modifier.expiresAt) < new Date()) {
      return sum;
    }
    
    switch (modifier.type) {
      case 'damage':
      case 'drain':
        return sum - modifier.value;
      case 'enhancement':
        return sum + modifier.value;
      default:
        return sum;
    }
  }, 0);
  
  return Math.max(0, baseValue + totalModifier);
};

export const isCharacteristicSuperhuman = (value: number): boolean => {
  return value >= 15;
};

export const getCharacteristicRangeDescription = (value: number): string => {
  if (value <= 0) return 'Dead';
  if (value === 1) return 'Unconscious';
  if (value <= 3) return 'Very Poor';
  if (value <= 5) return 'Poor';
  if (value <= 8) return 'Average';
  if (value <= 11) return 'Good';
  if (value <= 14) return 'Excellent';
  return 'Superhuman';
};

export const canImproveCharacteristic = (
  characteristic: keyof CharacterCharacteristics,
  currentValue: number,
  age: number
): { canImprove: boolean; reason?: string } => {
  // Physical characteristics harder to improve with age
  const physicalCharacteristics: (keyof CharacterCharacteristics)[] = ['strength', 'dexterity', 'endurance'];
  
  if (currentValue >= 15) {
    return { canImprove: false, reason: 'Already at superhuman levels' };
  }
  
  if (physicalCharacteristics.includes(characteristic) && age > 50) {
    return { canImprove: false, reason: 'Physical characteristics difficult to improve after age 50' };
  }
  
  if (age > 70) {
    return { canImprove: false, reason: 'Characteristic improvement becomes very difficult in old age' };
  }
  
  return { canImprove: true };
};

// Conversion functions
export const convertCreationDataToSheetData = (
  creationData: CharacterCreationData,
  additionalData: Partial<CharacterSheetData> = {}
): CharacterSheetData => {
  const now = new Date().toISOString();
  
  return {
    ...creationData,
    id: additionalData.id || crypto.randomUUID(),
    
    // Convert skills with enhanced tracking
    skills: creationData.skills.map(skill => ({
      ...skill,
      category: 'General', // Would be determined by skill type
      characteristic: 'intelligence', // Would be determined by skill type
      isCareerSkill: false, // Would be determined by career history
      usage: {
        timesUsed: 0,
        successfulUses: 0,
        failedUses: 0,
        experienceGained: 0,
        averageDifficultyFaced: 0,
        consecutiveSuccesses: 0,
        consecutiveFailures: 0,
        sessionUsage: []
      },
      improvementHistory: []
    })),
    
    // Convert equipment with enhanced properties
    equipment: creationData.equipment.map(item => ({
      ...item,
      location: 'carried' as const,
      condition: 'good' as const,
      category: 'misc' as const,
      techLevel: 10
    })),
    
    // Initialize additional data
    conditions: [],
    finances: {
      currentCredits: creationData.startingCredits,
      bankCredits: 0,
      debt: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      transactions: [],
      assets: [],
    },
    notes: [],
    advancement: {
      totalExperienceEarned: 0,
      totalExperienceSpent: 0,
      availableExperience: 0,
      records: [],
      milestones: [],
      trainingHistory: [],
      goals: [],
      activityTracking: {
        skillUsageSessionCount: 0,
        combatEncountersCount: 0,
        explorationHours: 0,
        socialEncountersCount: 0,
        researchHours: 0,
        teachingHours: 0
      },
      preferences: {
        autoTrackSkillUsage: true,
        showAdvancementSuggestions: true,
        preferredTrainingFacilities: [],
        maxTrainingCostPerSession: 1000
      }
    },
    
    // Initialize history and sharing
    history: {
      snapshots: [],
      currentVersion: 1,
      autoSnapshotEnabled: true,
      autoSnapshotTriggers: {
        onLevelUp: true,
        onMilestone: true,
        onSessionEnd: false,
        onMajorChange: true,
        intervalDays: 7
      },
      maxSnapshots: 50
    },
    sharing: [],
    backups: [],
    backupSettings: {
      autoBackupEnabled: false,
      autoBackupFrequency: 'weekly',
      maxBackups: 10,
      preferredFormat: 'json',
      encryptBackups: false,
      cloudSync: {
        enabled: false
      }
    },
    
    // Metadata
    lastModified: now,
    version: 1,
    isActive: true,
    campaignId: additionalData.campaignId || 'default',
    
    ...additionalData,
  };
};

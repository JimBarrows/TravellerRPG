// Character creation types following Traveller RPG rules

export interface CharacterCharacteristics {
  strength: number;
  dexterity: number;
  endurance: number;
  intelligence: number;
  education: number;
  social: number;
}

// Universal World Profile (UWP) data structure
export interface UWP {
  starport: string;
  size: number;
  atmosphere: number;
  hydrosphere: number;
  population: number;
  government: number;
  lawLevel: number;
  techLevel: number;
}

export interface CharacterBackground {
  homeworld: string;
  uwp?: UWP;
  socialClass: 'Lower' | 'Middle' | 'Upper';
  upbringing: string;
  family: string;
  earlyLife: string;
  startingSkills: string[];
}

export interface LifeEvent {
  id: string;
  description: string;
  type: 'event' | 'mishap' | 'connection' | 'rival';
  skillGains?: string[];
  characteristicModifiers?: Partial<CharacterCharacteristics>;
  connections?: string[];
  rivals?: string[];
  details?: string;
}

export interface CareerTerm {
  termNumber: number;
  career: string;
  branch?: string;
  rank: number;
  rankTitle: string;
  survived: boolean;
  commissioned: boolean;
  advanced: boolean;
  qualificationRoll?: number;
  survivalRoll?: number;
  commissionRoll?: number;
  advancementRoll?: number;
  skillsGained: string[];
  events: LifeEvent[];
  mishap?: LifeEvent;
  reenlistRoll?: number;
  mustered: boolean;
  benefits: string[];
  cashReceived: number;
}

export interface CareerProgression {
  totalTerms: number;
  currentAge: number;
  retiredInvoluntarily: boolean;
  retiredVoluntarily: boolean;
  canReenlist: boolean;
  mustLeave: boolean;
  mustLeaveReason?: string;
}

export interface CharacterSkill {
  name: string;
  level: number;
  specialty?: string;
}

export interface CharacterEquipment {
  id: string;
  name: string;
  type: string;
  cost: number;
  weight: number;
  quantity: number;
}

export interface CharacterCreationData {
  // Basic Information
  name: string;
  species: 'Human' | 'Vargr' | 'Aslan' | 'Other';
  gender: string;
  age: number;
  
  // Characteristics
  characteristics: CharacterCharacteristics;
  
  // Background
  background: CharacterBackground;
  
  // Career History
  careers: CareerTerm[];
  careerProgression: CareerProgression;
  totalTerms: number;
  
  // Skills
  skills: CharacterSkill[];
  
  // Life Events and Connections
  lifeEvents: LifeEvent[];
  connections: string[];
  rivals: string[];
  
  // Equipment
  startingCredits: number;
  equipment: CharacterEquipment[];
  
  // Portrait
  portrait?: string;
  avatarSeed?: string;
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
  status: 'draft' | 'complete';
}

export interface WizardStepProps {
  data: CharacterCreationData;
  updateData: (updates: Partial<CharacterCreationData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
}

export const CreationStep = {
  BASIC_INFO: 0,
  CHARACTERISTICS: 1,
  BACKGROUND: 2,
  CAREER: 3,
  SKILLS: 4,
  EQUIPMENT: 5,
  PORTRAIT: 6,
  REVIEW: 7,
} as const;

export type CreationStep = typeof CreationStep[keyof typeof CreationStep];

export const CREATION_STEPS = [
  { id: CreationStep.BASIC_INFO, label: 'Basic Info', description: 'Name and species' },
  { id: CreationStep.CHARACTERISTICS, label: 'Characteristics', description: 'Roll or assign stats' },
  { id: CreationStep.BACKGROUND, label: 'Background', description: 'Homeworld and upbringing' },
  { id: CreationStep.CAREER, label: 'Career', description: 'Career path and events' },
  { id: CreationStep.SKILLS, label: 'Skills', description: 'Assign skill points' },
  { id: CreationStep.EQUIPMENT, label: 'Equipment', description: 'Starting gear' },
  { id: CreationStep.PORTRAIT, label: 'Portrait', description: 'Character appearance' },
  { id: CreationStep.REVIEW, label: 'Review', description: 'Finalize character' },
];
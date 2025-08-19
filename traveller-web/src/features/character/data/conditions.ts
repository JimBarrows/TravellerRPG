/**
 * Traveller RPG Condition Templates and Constants
 * Based on Traveller Core Rulebook and various supplements
 */

import type { TravellerConditionTemplate, ConditionEffect } from '../types/characterSheet';

// Common condition effects for reuse
const MINOR_PHYSICAL_PENALTY: ConditionEffect = {
  type: 'characteristic',
  target: 'all_physical',
  modifier: -1,
  stackable: false,
  description: 'All physical tasks at -1 DM'
};

const MAJOR_PHYSICAL_PENALTY: ConditionEffect = {
  type: 'characteristic', 
  target: 'all_physical',
  modifier: -2,
  stackable: false,
  description: 'All physical tasks at -2 DM'
};

const MINOR_MENTAL_PENALTY: ConditionEffect = {
  type: 'characteristic',
  target: 'all_mental', 
  modifier: -1,
  stackable: false,
  description: 'All mental tasks at -1 DM'
};

const MOVEMENT_REDUCTION_50: ConditionEffect = {
  type: 'movement',
  modifier: 0,
  percentage: 50,
  stackable: false,
  description: 'Movement reduced by 50%'
};

const ENDURANCE_DRAIN: ConditionEffect = {
  type: 'endurance',
  modifier: -1,
  stackable: true,
  description: 'Endurance tasks at -1 DM (cumulative)'
};

// Traveller RPG condition templates
export const TRAVELLER_CONDITIONS: Record<string, TravellerConditionTemplate> = {
  // Physical Injuries
  WOUNDED: {
    name: 'Wounded',
    description: 'Physical injury affecting performance. Severity depends on characteristic damage taken.',
    type: 'physical',
    defaultSeverity: 'minor',
    defaultDuration: 'days',
    effects: [MINOR_PHYSICAL_PENALTY],
    recovery: {
      method: 'natural',
      timeRequired: 1,
      timeUnit: 'days',
      notes: 'Natural healing restores 1 point per day with rest'
    },
    canWorsen: true,
    canImprove: true,
    icon: '🩹',
    colorClass: 'text-red-600'
  },

  BLEEDING: {
    name: 'Bleeding',
    description: 'Severe bleeding causing ongoing damage. Requires immediate medical attention.',
    type: 'physical',
    defaultSeverity: 'major',
    defaultDuration: 'minutes',
    effects: [
      {
        type: 'characteristic',
        target: 'endurance',
        modifier: -2,
        stackable: false,
        description: 'Endurance checks at -2 DM'
      },
      {
        type: 'special',
        modifier: -1,
        stackable: false,
        description: 'Lose 1 Endurance every 10 minutes until treated'
      }
    ],
    recovery: {
      method: 'medical',
      timeRequired: 1,
      timeUnit: 'minutes',
      skillRequired: 'Medic',
      difficulty: 8,
      equipmentRequired: ['Medical Kit']
    },
    canWorsen: true,
    canImprove: false,
    icon: '🩸',
    colorClass: 'text-red-800'
  },

  BROKEN_BONE: {
    name: 'Broken Bone',
    description: 'Fractured bone severely limiting physical activity.',
    type: 'physical',
    defaultSeverity: 'major',
    defaultDuration: 'weeks',
    effects: [
      MAJOR_PHYSICAL_PENALTY,
      MOVEMENT_REDUCTION_50
    ],
    recovery: {
      method: 'medical',
      timeRequired: 6,
      timeUnit: 'weeks',
      skillRequired: 'Medic',
      difficulty: 10,
      equipmentRequired: ['Medical Kit', 'Hospital']
    },
    canWorsen: true,
    canImprove: true,
    icon: '🦴',
    colorClass: 'text-orange-700'
  },

  UNCONSCIOUS: {
    name: 'Unconscious',
    description: 'Character is unconscious and cannot act. May be due to characteristic reaching 0.',
    type: 'physical',
    defaultSeverity: 'critical',
    defaultDuration: 'minutes',
    effects: [
      {
        type: 'special',
        modifier: 0,
        stackable: false,
        description: 'Cannot take any actions; completely helpless'
      }
    ],
    recovery: {
      method: 'natural',
      timeRequired: 10,
      timeUnit: 'minutes',
      notes: 'Regains consciousness when characteristic above 0'
    },
    canWorsen: true,
    canImprove: true,
    icon: '😵',
    colorClass: 'text-red-900'
  },

  // Fatigue and Exhaustion
  FATIGUED: {
    name: 'Fatigued',
    description: 'Tired from extended activity or lack of rest.',
    type: 'fatigue',
    defaultSeverity: 'minor',
    defaultDuration: 'hours',
    effects: [ENDURANCE_DRAIN],
    recovery: {
      method: 'natural',
      timeRequired: 8,
      timeUnit: 'hours',
      notes: 'Full rest removes fatigue'
    },
    canWorsen: true,
    canImprove: true,
    icon: '😴',
    colorClass: 'text-yellow-600'
  },

  EXHAUSTED: {
    name: 'Exhausted',
    description: 'Severe fatigue from overexertion or extended activity.',
    type: 'fatigue',
    defaultSeverity: 'major',
    defaultDuration: 'days',
    effects: [
      {
        type: 'characteristic',
        target: 'all_physical',
        modifier: -2,
        stackable: false,
        description: 'All physical activities at -2 DM'
      },
      {
        type: 'movement',
        modifier: 0,
        percentage: 75,
        stackable: false,
        description: 'Movement reduced to 25% of normal'
      }
    ],
    recovery: {
      method: 'natural',
      timeRequired: 24,
      timeUnit: 'hours',
      notes: 'Requires complete bed rest'
    },
    canWorsen: false,
    canImprove: true,
    icon: '🥱',
    colorClass: 'text-orange-600'
  },

  // Environmental Conditions
  IRRADIATED: {
    name: 'Irradiated',
    description: 'Exposure to dangerous radiation levels.',
    type: 'environmental',
    defaultSeverity: 'moderate',
    defaultDuration: 'days',
    effects: [
      {
        type: 'characteristic',
        target: 'endurance',
        modifier: -1,
        stackable: true,
        description: 'Endurance reduced by radiation exposure'
      }
    ],
    recovery: {
      method: 'medical',
      timeRequired: 7,
      timeUnit: 'days',
      skillRequired: 'Medic',
      difficulty: 12,
      equipmentRequired: ['Hospital', 'Anti-radiation drugs'],
      costCredits: 1000
    },
    canWorsen: true,
    canImprove: true,
    icon: '☢️',
    colorClass: 'text-green-600'
  },

  VACUUM_EXPOSURE: {
    name: 'Vacuum Exposure',
    description: 'Exposed to the vacuum of space without proper protection.',
    type: 'environmental',
    defaultSeverity: 'critical',
    defaultDuration: 'minutes',
    effects: [
      {
        type: 'characteristic',
        target: 'endurance',
        modifier: -3,
        stackable: false,
        description: 'Severe endurance strain from vacuum exposure'
      },
      {
        type: 'special',
        modifier: -1,
        stackable: false,
        description: 'Lose 1d6 Endurance per round without protection'
      }
    ],
    recovery: {
      method: 'medical',
      timeRequired: 1,
      timeUnit: 'hours',
      skillRequired: 'Medic',
      difficulty: 15,
      equipmentRequired: ['Medical Kit', 'Pressure suit or chamber']
    },
    canWorsen: true,
    canImprove: true,
    icon: '🌌',
    colorClass: 'text-purple-800'
  },

  EXTREME_COLD: {
    name: 'Extreme Cold',
    description: 'Suffering from hypothermia due to extreme cold exposure.',
    type: 'environmental',
    defaultSeverity: 'moderate',
    defaultDuration: 'hours',
    effects: [
      {
        type: 'characteristic',
        target: 'dexterity',
        modifier: -2,
        stackable: false,
        description: 'Dexterity tasks at -2 DM due to numbness'
      },
      MOVEMENT_REDUCTION_50
    ],
    recovery: {
      method: 'natural',
      timeRequired: 2,
      timeUnit: 'hours',
      notes: 'Requires warming and shelter'
    },
    canWorsen: true,
    canImprove: true,
    icon: '🥶',
    colorClass: 'text-blue-600'
  },

  EXTREME_HEAT: {
    name: 'Extreme Heat',
    description: 'Heat exhaustion from extreme temperature exposure.',
    type: 'environmental',
    defaultSeverity: 'moderate',
    defaultDuration: 'hours',
    effects: [
      ENDURANCE_DRAIN,
      {
        type: 'special',
        modifier: 0,
        stackable: false,
        description: 'Must make hourly Endurance checks or take damage'
      }
    ],
    recovery: {
      method: 'natural',
      timeRequired: 4,
      timeUnit: 'hours',
      notes: 'Requires cooling and hydration'
    },
    canWorsen: true,
    canImprove: true,
    icon: '🥵',
    colorClass: 'text-red-500'
  },

  // Medical Conditions
  DISEASED: {
    name: 'Diseased',
    description: 'Suffering from a biological disease or infection.',
    type: 'medical',
    defaultSeverity: 'moderate',
    defaultDuration: 'weeks',
    effects: [
      {
        type: 'characteristic',
        target: 'endurance',
        modifier: -2,
        stackable: false,
        description: 'Disease weakens constitution'
      }
    ],
    recovery: {
      method: 'medical',
      timeRequired: 2,
      timeUnit: 'weeks',
      skillRequired: 'Medic',
      difficulty: 10,
      equipmentRequired: ['Medical Kit', 'Antibiotics'],
      costCredits: 500
    },
    canWorsen: true,
    canImprove: true,
    icon: '🦠',
    colorClass: 'text-green-700'
  },

  POISONED: {
    name: 'Poisoned',
    description: 'Affected by toxic substances, drugs, or venoms.',
    type: 'medical',
    defaultSeverity: 'major',
    defaultDuration: 'hours',
    effects: [
      {
        type: 'characteristic',
        target: 'all',
        modifier: -2,
        stackable: false,
        description: 'Poison affects all abilities'
      }
    ],
    recovery: {
      method: 'medical',
      timeRequired: 6,
      timeUnit: 'hours',
      skillRequired: 'Medic',
      difficulty: 12,
      equipmentRequired: ['Medical Kit', 'Antitoxin'],
      costCredits: 200
    },
    canWorsen: true,
    canImprove: true,
    icon: '☠️',
    colorClass: 'text-purple-700'
  },

  ADDICTED: {
    name: 'Addicted',
    description: 'Physical or psychological dependence on a substance.',
    type: 'medical',
    defaultSeverity: 'minor',
    defaultDuration: 'permanent',
    effects: [
      {
        type: 'special',
        modifier: -1,
        stackable: false,
        description: '-1 DM to all tasks when not under influence'
      }
    ],
    recovery: {
      method: 'medical',
      timeRequired: 4,
      timeUnit: 'weeks',
      skillRequired: 'Medic',
      difficulty: 15,
      equipmentRequired: ['Medical facility', 'Detox treatment'],
      costCredits: 5000
    },
    canWorsen: true,
    canImprove: true,
    icon: '💊',
    colorClass: 'text-purple-600'
  },

  // Mental Conditions
  PANICKED: {
    name: 'Panicked',
    description: 'Overwhelmed by fear and unable to think clearly.',
    type: 'mental',
    defaultSeverity: 'major',
    defaultDuration: 'minutes',
    effects: [
      MINOR_MENTAL_PENALTY,
      {
        type: 'special',
        modifier: 0,
        stackable: false,
        description: 'Must make Morale checks to take dangerous actions'
      }
    ],
    recovery: {
      method: 'natural',
      timeRequired: 30,
      timeUnit: 'minutes',
      notes: 'Time or successful morale check removes panic'
    },
    canWorsen: false,
    canImprove: true,
    icon: '😱',
    colorClass: 'text-red-500'
  },

  CONFUSED: {
    name: 'Confused',
    description: 'Disoriented and unable to process information effectively.',
    type: 'mental',
    defaultSeverity: 'moderate',
    defaultDuration: 'minutes',
    effects: [
      {
        type: 'characteristic',
        target: 'intelligence',
        modifier: -3,
        stackable: false,
        description: 'Intelligence and Education tasks at -3 DM'
      },
      {
        type: 'characteristic', 
        target: 'education',
        modifier: -3,
        stackable: false,
        description: 'Intelligence and Education tasks at -3 DM'
      }
    ],
    recovery: {
      method: 'natural',
      timeRequired: 10,
      timeUnit: 'minutes',
      notes: 'Clear thinking returns with time'
    },
    canWorsen: false,
    canImprove: true,
    icon: '😵‍💫',
    colorClass: 'text-yellow-700'
  },

  // Social Conditions
  DISGRACED: {
    name: 'Disgraced',
    description: 'Social standing damaged by scandal or failure.',
    type: 'social',
    defaultSeverity: 'moderate',
    defaultDuration: 'weeks',
    effects: [
      {
        type: 'characteristic',
        target: 'social',
        modifier: -3,
        stackable: false,
        description: 'Social Standing effectively reduced'
      }
    ],
    recovery: {
      method: 'special',
      timeRequired: 6,
      timeUnit: 'weeks',
      notes: 'Requires specific actions to restore reputation'
    },
    canWorsen: true,
    canImprove: true,
    icon: '😞',
    colorClass: 'text-gray-600'
  },

  // Aging Effects
  AGING_DECLINE: {
    name: 'Aging Decline',
    description: 'Physical deterioration due to advanced age.',
    type: 'aging',
    defaultSeverity: 'minor',
    defaultDuration: 'permanent',
    effects: [
      {
        type: 'characteristic',
        target: 'all_physical',
        modifier: -1,
        stackable: true,
        description: 'Age-related decline in physical abilities'
      }
    ],
    recovery: {
      method: 'augmentation',
      timeRequired: 1,
      timeUnit: 'weeks',
      skillRequired: 'Medic',
      difficulty: 15,
      equipmentRequired: ['Advanced medical facility'],
      costCredits: 50000,
      notes: 'Only reversible with advanced anagathics or augmentation'
    },
    canWorsen: true,
    canImprove: false,
    icon: '👴',
    colorClass: 'text-gray-500'
  },

  // Augmentation Effects
  CYBERWARE_REJECTION: {
    name: 'Cyberware Rejection',
    description: 'Body rejecting implanted cybernetic augmentations.',
    type: 'augmentation',
    defaultSeverity: 'major',
    defaultDuration: 'weeks',
    effects: [
      {
        type: 'characteristic',
        target: 'endurance',
        modifier: -2,
        stackable: false,
        description: 'System shock from rejection syndrome'
      },
      {
        type: 'special',
        modifier: 0,
        stackable: false,
        description: 'Augmentations function at reduced efficiency'
      }
    ],
    recovery: {
      method: 'medical',
      timeRequired: 4,
      timeUnit: 'weeks',
      skillRequired: 'Medic',
      difficulty: 15,
      equipmentRequired: ['Advanced medical facility', 'Immunosuppressants'],
      costCredits: 10000
    },
    canWorsen: true,
    canImprove: true,
    icon: '🦾',
    colorClass: 'text-blue-500'
  }
};

// Condition categories for UI organization
export const CONDITION_CATEGORIES = {
  PHYSICAL: 'Physical Injuries',
  FATIGUE: 'Fatigue & Exhaustion',
  ENVIRONMENTAL: 'Environmental Hazards',
  MEDICAL: 'Medical Conditions',
  MENTAL: 'Mental Conditions',
  SOCIAL: 'Social Effects',
  AGING: 'Age-Related',
  AUGMENTATION: 'Augmentation Effects'
} as const;

// Severity descriptions and colors
export const SEVERITY_INFO = {
  minor: { 
    label: 'Minor', 
    description: 'Minor inconvenience, -1 DM to related tasks',
    color: 'text-yellow-600 bg-yellow-100',
    priority: 1
  },
  moderate: { 
    label: 'Moderate', 
    description: 'Noticeable impairment, -2 DM to related tasks',
    color: 'text-orange-600 bg-orange-100',
    priority: 2
  },
  major: { 
    label: 'Major', 
    description: 'Severe impairment, -3 DM to related tasks',
    color: 'text-red-600 bg-red-100',
    priority: 3
  },
  critical: { 
    label: 'Critical', 
    description: 'Life-threatening, -4 DM to related tasks',
    color: 'text-red-800 bg-red-200',
    priority: 4
  },
  terminal: { 
    label: 'Terminal', 
    description: 'Character death imminent without immediate intervention',
    color: 'text-red-900 bg-red-300',
    priority: 5
  }
} as const;

// Duration descriptions
export const DURATION_INFO = {
  instant: { label: 'Instant', description: 'Immediate effect' },
  rounds: { label: 'Rounds', description: 'Combat rounds (6 seconds each)' },
  minutes: { label: 'Minutes', description: 'Short term effect' },
  hours: { label: 'Hours', description: 'Extended duration' },
  days: { label: 'Days', description: 'Long term condition' },
  weeks: { label: 'Weeks', description: 'Serious condition requiring time' },
  permanent: { label: 'Permanent', description: 'Requires treatment to remove' },
  until_treated: { label: 'Until Treated', description: 'Medical intervention required' },
  until_healed: { label: 'Until Healed', description: 'Natural healing over time' }
} as const;

export default TRAVELLER_CONDITIONS;
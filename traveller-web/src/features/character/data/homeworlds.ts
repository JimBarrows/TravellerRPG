/**
 * Homeworld data for Traveller character creation
 */

export interface Homeworld {
  id: string;
  name: string;
  type: 'High Tech' | 'Industrial' | 'Agricultural' | 'Water World' | 'Desert' | 'Ice' | 'Garden' | 'Asteroid' | 'Space Station' | 'Low Tech';
  population: number;
  techLevel: number;
  description: string;
  traits: string[];
  skillBonuses?: {
    skill: string;
    bonus: number;
  }[];
}

export const HOMEWORLDS: Homeworld[] = [
  {
    id: 'terra',
    name: 'Terra',
    type: 'Garden',
    population: 10000000000,
    techLevel: 12,
    description: 'The cradle of humanity, Terra is a garden world with diverse ecosystems and cultures.',
    traits: ['Cosmopolitan', 'High Population', 'Cultural Center'],
    skillBonuses: [
      { skill: 'Diplomat', bonus: 1 },
      { skill: 'Education', bonus: 1 },
    ],
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'Industrial',
    population: 500000000,
    techLevel: 13,
    description: 'The first colony world, Mars has been terraformed into a major industrial center.',
    traits: ['Industrial', 'Mining', 'Terraformed'],
    skillBonuses: [
      { skill: 'Engineering', bonus: 1 },
      { skill: 'Vacc Suit', bonus: 1 },
    ],
  },
  {
    id: 'regina',
    name: 'Regina',
    type: 'High Tech',
    population: 700000000,
    techLevel: 14,
    description: 'A high-tech world known for advanced starship manufacturing and research.',
    traits: ['High Tech', 'Starport A', 'Trade Hub'],
    skillBonuses: [
      { skill: 'Computers', bonus: 1 },
      { skill: 'Electronics', bonus: 1 },
    ],
  },
  {
    id: 'efate',
    name: 'Efate',
    type: 'Agricultural',
    population: 90000000,
    techLevel: 10,
    description: 'A peaceful agricultural world providing food for surrounding systems.',
    traits: ['Agricultural', 'Low Population', 'Peaceful'],
    skillBonuses: [
      { skill: 'Animals', bonus: 1 },
      { skill: 'Survival', bonus: 1 },
    ],
  },
  {
    id: 'jenghe',
    name: 'Jenghe',
    type: 'Water World',
    population: 300000000,
    techLevel: 11,
    description: 'An ocean world with floating cities and underwater settlements.',
    traits: ['Water World', 'Aquatic Life', 'Tourism'],
    skillBonuses: [
      { skill: 'Seafarer', bonus: 1 },
      { skill: 'Athletics', bonus: 1 },
    ],
  },
  {
    id: 'valhalla',
    name: 'Valhalla',
    type: 'Ice',
    population: 50000000,
    techLevel: 9,
    description: 'A frozen world where inhabitants live in heated domed cities.',
    traits: ['Ice World', 'Harsh Environment', 'Mining'],
    skillBonuses: [
      { skill: 'Survival', bonus: 1 },
      { skill: 'Mechanic', bonus: 1 },
    ],
  },
  {
    id: 'nova-terra',
    name: 'Nova Terra',
    type: 'Garden',
    population: 2000000000,
    techLevel: 11,
    description: 'A recently colonized garden world with vast untamed wilderness.',
    traits: ['Frontier', 'Garden World', 'Expanding'],
    skillBonuses: [
      { skill: 'Gun Combat', bonus: 1 },
      { skill: 'Recon', bonus: 1 },
    ],
  },
  {
    id: 'ceres-station',
    name: 'Ceres Station',
    type: 'Space Station',
    population: 10000000,
    techLevel: 13,
    description: 'A massive space station serving as a trade hub between systems.',
    traits: ['Space Station', 'Zero-G', 'Trade Hub'],
    skillBonuses: [
      { skill: 'Zero-G', bonus: 1 },
      { skill: 'Broker', bonus: 1 },
    ],
  },
  {
    id: 'zephyr',
    name: 'Zephyr',
    type: 'Desert',
    population: 75000000,
    techLevel: 8,
    description: 'A harsh desert world with nomadic tribes and underground cities.',
    traits: ['Desert', 'Low Water', 'Nomadic Culture'],
    skillBonuses: [
      { skill: 'Survival', bonus: 1 },
      { skill: 'Navigation', bonus: 1 },
    ],
  },
  {
    id: 'belter-colonies',
    name: 'Belter Colonies',
    type: 'Asteroid',
    population: 5000000,
    techLevel: 12,
    description: 'A collection of asteroid mining colonies in the outer system.',
    traits: ['Asteroid Belt', 'Mining', 'Independent'],
    skillBonuses: [
      { skill: 'Vacc Suit', bonus: 1 },
      { skill: 'Pilot', bonus: 1 },
    ],
  },
];

export const SOCIAL_CLASSES = {
  'Lower': {
    description: 'Working class, struggling to make ends meet',
    startingCredits: 500,
    educationModifier: -2,
    traits: ['Resourceful', 'Street Smart', 'Hardworking'],
  },
  'Middle': {
    description: 'Comfortable lifestyle with access to education',
    startingCredits: 1000,
    educationModifier: 0,
    traits: ['Educated', 'Stable', 'Ambitious'],
  },
  'Upper': {
    description: 'Wealthy and influential family background',
    startingCredits: 2000,
    educationModifier: 2,
    traits: ['Connected', 'Privileged', 'Refined'],
  },
} as const;

export const UPBRINGING_OPTIONS = [
  'Traditional Family',
  'Single Parent',
  'Extended Family',
  'Orphanage',
  'Foster Care',
  'Military Family',
  'Merchant Family',
  'Noble Family',
  'Criminal Family',
  'Religious Community',
  'Nomadic Lifestyle',
  'Space-Born',
];

export const EARLY_LIFE_EVENTS = [
  'Witnessed a major historical event',
  'Lost a family member tragically',
  'Discovered a hidden talent',
  'Made a lifelong friend',
  'Survived a natural disaster',
  'Won a significant competition',
  'Had a brush with the law',
  'Traveled extensively off-world',
  'Received unexpected inheritance',
  'Suffered a serious injury',
  'Made a powerful enemy',
  'Discovered a family secret',
  'Saved someone\'s life',
  'Was betrayed by someone close',
  'Found a mentor',
  'Joined a youth organization',
  'Experienced first love',
  'Ran away from home',
  'Witnessed a crime',
  'Made a significant discovery',
];
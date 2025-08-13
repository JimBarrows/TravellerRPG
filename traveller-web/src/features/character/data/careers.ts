/**
 * Career data for Traveller character creation
 */

export interface CareerRequirement {
  characteristic: 'strength' | 'dexterity' | 'endurance' | 'intelligence' | 'education' | 'social';
  value: number;
}

export interface CareerBenefit {
  roll: number;
  cash: number;
  benefit?: string;
}

export interface CareerRank {
  rank: number;
  title: string;
  skill?: string;
}

export interface Career {
  id: string;
  name: string;
  description: string;
  qualification: CareerRequirement;
  survival: CareerRequirement;
  commission?: CareerRequirement;
  advancement?: CareerRequirement;
  skills: {
    personal: string[];
    service: string[];
    specialist?: string[];
    advanced?: string[];
  };
  ranks?: CareerRank[];
  benefits: CareerBenefit[];
  events: string[];
  mishaps: string[];
}

export const CAREERS: Career[] = [
  {
    id: 'navy',
    name: 'Navy',
    description: 'Member of the interstellar navy, operating warships and system defense boats.',
    qualification: { characteristic: 'intelligence', value: 8 },
    survival: { characteristic: 'endurance', value: 5 },
    commission: { characteristic: 'social', value: 9 },
    advancement: { characteristic: 'education', value: 8 },
    skills: {
      personal: ['Athletics', 'Vacc Suit', 'Electronics', 'Gun Combat', 'Mechanic', 'Melee'],
      service: ['Pilot', 'Gunner', 'Sensors', 'Navigation', 'Discipline', 'Admin'],
      specialist: ['Engineer', 'Astrogation', 'Medical', 'Tactics', 'Leadership', 'Comms'],
      advanced: ['Advocate', 'Broker', 'Computers', 'Diplomat', 'Investigation', 'Science'],
    },
    ranks: [
      { rank: 0, title: 'Crewman' },
      { rank: 1, title: 'Able Spacehand', skill: 'Mechanic' },
      { rank: 2, title: 'Petty Officer' },
      { rank: 3, title: 'Chief Petty Officer' },
      { rank: 4, title: 'Ensign', skill: 'Leadership' },
      { rank: 5, title: 'Lieutenant' },
      { rank: 6, title: 'Commander', skill: 'Tactics' },
    ],
    benefits: [
      { roll: 1, cash: 1000 },
      { roll: 2, cash: 5000, benefit: 'Blade' },
      { roll: 3, cash: 10000, benefit: 'Intelligence +1' },
      { roll: 4, cash: 20000, benefit: 'Education +1' },
      { roll: 5, cash: 50000, benefit: 'Weapon' },
      { roll: 6, cash: 100000, benefit: 'High Passage' },
      { roll: 7, cash: 200000, benefit: 'Ship Share' },
    ],
    events: [
      'You are given advanced training in a specialist field',
      'Your vessel participates in a notable military action',
      'You are posted to the frontier',
      'You are given special duty or a secret mission',
      'You are posted to a ship involved in piracy suppression',
      'Your vessel is ambushed by enemy vessels',
    ],
    mishaps: [
      'Severely injured in action',
      'Honorably discharged',
      'Ship destroyed in battle',
      'Court martialed for actions in combat',
      'Betrayed by a trusted comrade',
      'Captured and tortured by enemy forces',
    ],
  },
  {
    id: 'marines',
    name: 'Marines',
    description: 'Ground assault troops carried aboard naval vessels for boarding actions and planetary raids.',
    qualification: { characteristic: 'endurance', value: 6 },
    survival: { characteristic: 'strength', value: 6 },
    commission: { characteristic: 'intelligence', value: 8 },
    advancement: { characteristic: 'social', value: 8 },
    skills: {
      personal: ['Athletics', 'Vacc Suit', 'Tactics', 'Gun Combat', 'Melee', 'Heavy Weapons'],
      service: ['Battle Dress', 'Demolitions', 'Recon', 'Survival', 'Zero-G', 'Discipline'],
      specialist: ['Electronics', 'Engineer', 'Medical', 'Pilot', 'Sensors', 'Comms'],
      advanced: ['Advocate', 'Computers', 'Diplomat', 'Leadership', 'Navigation', 'Science'],
    },
    ranks: [
      { rank: 0, title: 'Marine' },
      { rank: 1, title: 'Lance Corporal', skill: 'Gun Combat' },
      { rank: 2, title: 'Corporal' },
      { rank: 3, title: 'Sergeant', skill: 'Leadership' },
      { rank: 4, title: 'Lieutenant' },
      { rank: 5, title: 'Captain' },
      { rank: 6, title: 'Major', skill: 'Tactics' },
    ],
    benefits: [
      { roll: 1, cash: 2000 },
      { roll: 2, cash: 5000, benefit: 'Blade' },
      { roll: 3, cash: 10000, benefit: 'Physical +1' },
      { roll: 4, cash: 20000, benefit: 'Education +1' },
      { roll: 5, cash: 50000, benefit: 'Weapon' },
      { roll: 6, cash: 100000, benefit: 'High Passage' },
      { roll: 7, cash: 200000, benefit: 'Social +2' },
    ],
    events: [
      'You are assigned to a black ops mission',
      'You participate in a notable boarding action',
      'You are assigned to protect a diplomat',
      'Your unit is deployed in a war zone',
      'You train local forces on a primitive world',
      'You are assigned to a military prison',
    ],
    mishaps: [
      'Unit decimated in battle',
      'Wounded and medically discharged',
      'Imprisoned by enemy forces',
      'Betrayed by commanding officer',
      'Failed mission leads to disgrace',
      'Friendly fire incident',
    ],
  },
  {
    id: 'merchant',
    name: 'Merchant',
    description: 'Commercial space traders operating freighters and cargo vessels across the stars.',
    qualification: { characteristic: 'intelligence', value: 4 },
    survival: { characteristic: 'education', value: 5 },
    advancement: { characteristic: 'intelligence', value: 8 },
    skills: {
      personal: ['Admin', 'Advocate', 'Broker', 'Comms', 'Computers', 'Vacc Suit'],
      service: ['Astrogation', 'Engineer', 'Gun Combat', 'Mechanic', 'Pilot', 'Steward'],
      specialist: ['Animals', 'Electronics', 'Investigate', 'Medic', 'Navigation', 'Persuade'],
      advanced: ['Deception', 'Diplomat', 'Language', 'Leadership', 'Science', 'Streetwise'],
    },
    ranks: [
      { rank: 0, title: 'Crewman' },
      { rank: 1, title: 'Senior Crewman', skill: 'Mechanic' },
      { rank: 2, title: 'Fourth Officer' },
      { rank: 3, title: 'Third Officer', skill: 'Pilot' },
      { rank: 4, title: 'Second Officer' },
      { rank: 5, title: 'First Officer', skill: 'Navigation' },
      { rank: 6, title: 'Captain', skill: 'Broker' },
    ],
    benefits: [
      { roll: 1, cash: 1000 },
      { roll: 2, cash: 5000, benefit: 'Blade' },
      { roll: 3, cash: 10000, benefit: 'Intelligence +1' },
      { roll: 4, cash: 20000, benefit: 'Gun' },
      { roll: 5, cash: 40000, benefit: 'Ship Share' },
      { roll: 6, cash: 80000, benefit: 'Two Ship Shares' },
      { roll: 7, cash: 160000, benefit: 'Free Trader' },
    ],
    events: [
      'Your ship discovers a new trade route',
      'You broker a major trade deal',
      'Pirates attack your vessel',
      'You transport a mysterious passenger',
      'Your ship is impounded by customs',
      'You discover valuable salvage',
    ],
    mishaps: [
      'Ship lost with all cargo',
      'Caught smuggling illegal goods',
      'Business rival ruins your reputation',
      'Mutiny aboard ship',
      'Bankrupted by bad deals',
      'Hijacked by pirates',
    ],
  },
  {
    id: 'scout',
    name: 'Scout',
    description: 'Explorers and surveyors mapping uncharted systems and making first contact.',
    qualification: { characteristic: 'intelligence', value: 5 },
    survival: { characteristic: 'endurance', value: 7 },
    skills: {
      personal: ['Athletics', 'Electronics', 'Jack-of-all-Trades', 'Medic', 'Navigation', 'Vacc Suit'],
      service: ['Astrogation', 'Computers', 'Engineer', 'Pilot', 'Sensors', 'Survival'],
      specialist: ['Admin', 'Diplomat', 'Gun Combat', 'Investigate', 'Mechanic', 'Science'],
      advanced: ['Advocate', 'Animals', 'Deception', 'Language', 'Recon', 'Streetwise'],
    },
    benefits: [
      { roll: 1, cash: 2000 },
      { roll: 2, cash: 5000, benefit: 'Blade' },
      { roll: 3, cash: 10000, benefit: 'Physical +1' },
      { roll: 4, cash: 20000, benefit: 'Mental +1' },
      { roll: 5, cash: 50000, benefit: 'Gun' },
      { roll: 6, cash: 100000, benefit: 'Scout Ship' },
      { roll: 7, cash: 200000, benefit: 'Ship Share x2' },
    ],
    events: [
      'You discover a new habitable world',
      'You make first contact with an alien species',
      'Your ship misjumps into unknown space',
      'You survey a dangerous anomaly',
      'You are assigned to courier duty',
      'You discover ancient alien ruins',
    ],
    mishaps: [
      'Ship lost in uncharted space',
      'Infected by alien disease',
      'Stranded on hostile world',
      'Psychological trauma from isolation',
      'Equipment failure causes injury',
      'Lost in jumpspace',
    ],
  },
  {
    id: 'army',
    name: 'Army',
    description: 'Ground forces responsible for planetary defense and surface warfare.',
    qualification: { characteristic: 'strength', value: 5 },
    survival: { characteristic: 'endurance', value: 5 },
    commission: { characteristic: 'education', value: 8 },
    advancement: { characteristic: 'social', value: 8 },
    skills: {
      personal: ['Athletics', 'Drive', 'Gun Combat', 'Heavy Weapons', 'Melee', 'Recon'],
      service: ['Battle Dress', 'Demolitions', 'Electronics', 'Mechanic', 'Medic', 'Tactics'],
      specialist: ['Admin', 'Computers', 'Engineer', 'Leadership', 'Navigation', 'Sensors'],
      advanced: ['Advocate', 'Diplomat', 'Investigate', 'Language', 'Science', 'Survival'],
    },
    ranks: [
      { rank: 0, title: 'Private' },
      { rank: 1, title: 'Lance Corporal', skill: 'Gun Combat' },
      { rank: 2, title: 'Corporal' },
      { rank: 3, title: 'Sergeant', skill: 'Leadership' },
      { rank: 4, title: 'Lieutenant' },
      { rank: 5, title: 'Captain', skill: 'Tactics' },
      { rank: 6, title: 'Major' },
    ],
    benefits: [
      { roll: 1, cash: 2000 },
      { roll: 2, cash: 5000, benefit: 'Blade' },
      { roll: 3, cash: 10000, benefit: 'Physical +1' },
      { roll: 4, cash: 20000, benefit: 'Education +1' },
      { roll: 5, cash: 50000, benefit: 'Weapon' },
      { roll: 6, cash: 100000, benefit: 'Mid Passage' },
      { roll: 7, cash: 200000, benefit: 'Social +1' },
    ],
    events: [
      'You participate in a major campaign',
      'Your unit is assigned peacekeeping duties',
      'You are deployed to a war-torn world',
      'You train rebel forces',
      'Your unit tests new equipment',
      'You are assigned to garrison duty',
    ],
    mishaps: [
      'Unit overrun by enemy forces',
      'Crippling injury in combat',
      'Captured and held as POW',
      'Friendly fire incident',
      'Failed to follow illegal orders',
      'Psychological trauma',
    ],
  },
];

export const TERM_EVENTS = [
  'Made a valuable contact',
  'Gained a rival',
  'Romantic relationship',
  'Brush with the law',
  'Saved someone important',
  'Life-changing experience',
  'Learned unusual skill',
  'Discovered a secret',
  'Inherited something valuable',
  'Involved in conspiracy',
  'Natural disaster',
  'False accusation',
  'Gambling debt',
  'Alien encounter',
  'Psionics awakening',
];

export const AGING_TABLE = {
  34: { check: false },
  38: { check: true, modifiers: { strength: -1 } },
  42: { check: true, modifiers: { strength: -1, dexterity: -1, endurance: -1 } },
  46: { check: true, modifiers: { strength: -2, dexterity: -2, endurance: -2 } },
  50: { check: true, modifiers: { strength: -2, dexterity: -2, endurance: -2, intelligence: -1 } },
  54: { check: true, modifiers: { strength: -3, dexterity: -3, endurance: -3, intelligence: -1 } },
  58: { check: true, modifiers: { strength: -3, dexterity: -3, endurance: -3, intelligence: -2 } },
};
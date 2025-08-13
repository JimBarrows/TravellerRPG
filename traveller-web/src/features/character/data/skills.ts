/**
 * Skills data for Traveller RPG
 */

export interface Skill {
  id: string;
  name: string;
  characteristic: 'strength' | 'dexterity' | 'endurance' | 'intelligence' | 'education' | 'social';
  description: string;
  specializations?: string[];
  difficulty?: 'Easy' | 'Average' | 'Difficult' | 'Formidable';
}

export const SKILLS: Skill[] = [
  // Basic Skills
  {
    id: 'admin',
    name: 'Admin',
    characteristic: 'education',
    description: 'Bureaucracy, administration, and paperwork',
    difficulty: 'Average',
  },
  {
    id: 'advocate',
    name: 'Advocate',
    characteristic: 'education',
    description: 'Law, legal matters, and debate',
    difficulty: 'Difficult',
  },
  {
    id: 'animals',
    name: 'Animals',
    characteristic: 'intelligence',
    description: 'Handling and caring for animals',
    specializations: ['Riding', 'Veterinary', 'Training', 'Farming'],
    difficulty: 'Average',
  },
  {
    id: 'athletics',
    name: 'Athletics',
    characteristic: 'strength',
    description: 'Physical fitness and sports',
    specializations: ['Coordination', 'Endurance', 'Strength', 'Flying'],
    difficulty: 'Average',
  },
  {
    id: 'art',
    name: 'Art',
    characteristic: 'intelligence',
    description: 'Creative and artistic endeavors',
    specializations: ['Acting', 'Dance', 'Holography', 'Instrument', 'Sculpting', 'Writing'],
    difficulty: 'Average',
  },
  {
    id: 'astrogation',
    name: 'Astrogation',
    characteristic: 'education',
    description: 'Plotting jumps and interstellar navigation',
    difficulty: 'Difficult',
  },
  {
    id: 'battle-dress',
    name: 'Battle Dress',
    characteristic: 'dexterity',
    description: 'Operating powered armor',
    difficulty: 'Difficult',
  },
  {
    id: 'broker',
    name: 'Broker',
    characteristic: 'intelligence',
    description: 'Trading and negotiating deals',
    difficulty: 'Average',
  },
  {
    id: 'carouse',
    name: 'Carouse',
    characteristic: 'social',
    description: 'Socializing and partying',
    difficulty: 'Easy',
  },
  {
    id: 'comms',
    name: 'Comms',
    characteristic: 'education',
    description: 'Communications equipment and protocols',
    difficulty: 'Average',
  },
  {
    id: 'computers',
    name: 'Computers',
    characteristic: 'education',
    description: 'Programming and computer operations',
    difficulty: 'Average',
  },
  {
    id: 'deception',
    name: 'Deception',
    characteristic: 'intelligence',
    description: 'Lying and misdirection',
    difficulty: 'Average',
  },
  {
    id: 'demolitions',
    name: 'Demolitions',
    characteristic: 'intelligence',
    description: 'Explosives and controlled destruction',
    difficulty: 'Difficult',
  },
  {
    id: 'diplomat',
    name: 'Diplomat',
    characteristic: 'social',
    description: 'Negotiation and diplomacy',
    difficulty: 'Difficult',
  },
  {
    id: 'discipline',
    name: 'Discipline',
    characteristic: 'endurance',
    description: 'Self-control and military bearing',
    difficulty: 'Average',
  },
  {
    id: 'drive',
    name: 'Drive',
    characteristic: 'dexterity',
    description: 'Operating ground vehicles',
    specializations: ['Hovercraft', 'Mole', 'Track', 'Walker', 'Wheel'],
    difficulty: 'Average',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    characteristic: 'education',
    description: 'Electronic systems and repair',
    specializations: ['Comms', 'Computers', 'Remote Ops', 'Sensors'],
    difficulty: 'Average',
  },
  {
    id: 'engineer',
    name: 'Engineer',
    characteristic: 'education',
    description: 'Engineering and technical work',
    specializations: ['M-Drive', 'J-Drive', 'Life Support', 'Power'],
    difficulty: 'Average',
  },
  {
    id: 'flyer',
    name: 'Flyer',
    characteristic: 'dexterity',
    description: 'Operating flying vehicles',
    specializations: ['Airship', 'Grav', 'Ornithopter', 'Rotor', 'Wing'],
    difficulty: 'Average',
  },
  {
    id: 'gambler',
    name: 'Gambler',
    characteristic: 'intelligence',
    description: 'Games of chance and skill',
    difficulty: 'Average',
  },
  {
    id: 'gun-combat',
    name: 'Gun Combat',
    characteristic: 'dexterity',
    description: 'Ranged weapon combat',
    specializations: ['Archaic', 'Energy', 'Slug'],
    difficulty: 'Average',
  },
  {
    id: 'gunner',
    name: 'Gunner',
    characteristic: 'dexterity',
    description: 'Ship and vehicle weapons',
    specializations: ['Turret', 'Ortillery', 'Screen', 'Capital'],
    difficulty: 'Average',
  },
  {
    id: 'heavy-weapons',
    name: 'Heavy Weapons',
    characteristic: 'dexterity',
    description: 'Portable support weapons',
    specializations: ['Artillery', 'Man Portable', 'Vehicle'],
    difficulty: 'Average',
  },
  {
    id: 'investigate',
    name: 'Investigate',
    characteristic: 'intelligence',
    description: 'Research and investigation',
    difficulty: 'Average',
  },
  {
    id: 'jack-of-all-trades',
    name: 'Jack-of-all-Trades',
    characteristic: 'education',
    description: 'General knowledge and versatility',
    difficulty: 'Difficult',
  },
  {
    id: 'language',
    name: 'Language',
    characteristic: 'education',
    description: 'Foreign language fluency',
    specializations: ['Anglic', 'Vilani', 'Zhodani', 'Aslan', 'Vargr'],
    difficulty: 'Average',
  },
  {
    id: 'leadership',
    name: 'Leadership',
    characteristic: 'social',
    description: 'Command and inspiration',
    difficulty: 'Average',
  },
  {
    id: 'mechanic',
    name: 'Mechanic',
    characteristic: 'education',
    description: 'Mechanical repair and maintenance',
    difficulty: 'Average',
  },
  {
    id: 'medic',
    name: 'Medic',
    characteristic: 'education',
    description: 'Medical treatment and first aid',
    difficulty: 'Average',
  },
  {
    id: 'melee',
    name: 'Melee',
    characteristic: 'strength',
    description: 'Close combat with weapons',
    specializations: ['Blade', 'Bludgeon', 'Natural', 'Unarmed'],
    difficulty: 'Average',
  },
  {
    id: 'navigation',
    name: 'Navigation',
    characteristic: 'intelligence',
    description: 'Finding your way and plotting courses',
    difficulty: 'Average',
  },
  {
    id: 'persuade',
    name: 'Persuade',
    characteristic: 'social',
    description: 'Convincing and influencing others',
    difficulty: 'Average',
  },
  {
    id: 'pilot',
    name: 'Pilot',
    characteristic: 'dexterity',
    description: 'Spacecraft operation',
    specializations: ['Small Craft', 'Spacecraft', 'Capital Ships'],
    difficulty: 'Average',
  },
  {
    id: 'recon',
    name: 'Recon',
    characteristic: 'intelligence',
    description: 'Scouting and observation',
    difficulty: 'Average',
  },
  {
    id: 'science',
    name: 'Science',
    characteristic: 'education',
    description: 'Scientific knowledge and research',
    specializations: ['Archaeology', 'Astronomy', 'Biology', 'Chemistry', 'Cosmology', 'Cybernetics', 'Economics', 'Genetics', 'History', 'Linguistics', 'Philosophy', 'Physics', 'Planetology', 'Psychology', 'Robotics', 'Sophontology', 'Xenology'],
    difficulty: 'Average',
  },
  {
    id: 'seafarer',
    name: 'Seafarer',
    characteristic: 'dexterity',
    description: 'Operating watercraft',
    specializations: ['Ocean Ships', 'Personal', 'Sail', 'Submarine'],
    difficulty: 'Average',
  },
  {
    id: 'sensors',
    name: 'Sensors',
    characteristic: 'intelligence',
    description: 'Operating detection equipment',
    difficulty: 'Average',
  },
  {
    id: 'stealth',
    name: 'Stealth',
    characteristic: 'dexterity',
    description: 'Moving unseen and unheard',
    difficulty: 'Average',
  },
  {
    id: 'steward',
    name: 'Steward',
    characteristic: 'education',
    description: 'Service and hospitality',
    difficulty: 'Easy',
  },
  {
    id: 'streetwise',
    name: 'Streetwise',
    characteristic: 'intelligence',
    description: 'Criminal contacts and urban survival',
    difficulty: 'Average',
  },
  {
    id: 'survival',
    name: 'Survival',
    characteristic: 'endurance',
    description: 'Wilderness and hostile environment survival',
    difficulty: 'Average',
  },
  {
    id: 'tactics',
    name: 'Tactics',
    characteristic: 'intelligence',
    description: 'Military strategy and small unit tactics',
    specializations: ['Military', 'Naval'],
    difficulty: 'Difficult',
  },
  {
    id: 'trade',
    name: 'Trade',
    characteristic: 'education',
    description: 'Professional trade skills',
    specializations: ['Biologicals', 'Civil Engineering', 'Hydroponics', 'Polymers', 'Space Construction'],
    difficulty: 'Average',
  },
  {
    id: 'vacc-suit',
    name: 'Vacc Suit',
    characteristic: 'dexterity',
    description: 'Operating in vacuum suits',
    difficulty: 'Average',
  },
  {
    id: 'zero-g',
    name: 'Zero-G',
    characteristic: 'dexterity',
    description: 'Movement in zero gravity',
    difficulty: 'Average',
  },
];

export const getSkillById = (id: string): Skill | undefined => {
  return SKILLS.find(skill => skill.id === id);
};

export const getSkillByName = (name: string): Skill | undefined => {
  return SKILLS.find(skill => skill.name.toLowerCase() === name.toLowerCase());
};

export const getSkillsByCharacteristic = (characteristic: string): Skill[] => {
  return SKILLS.filter(skill => skill.characteristic === characteristic);
};

export const getSkillDifficultyModifier = (difficulty?: string): number => {
  switch (difficulty) {
    case 'Easy': return 2;
    case 'Average': return 0;
    case 'Difficult': return -2;
    case 'Formidable': return -4;
    default: return 0;
  }
};
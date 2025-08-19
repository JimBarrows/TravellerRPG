/**
 * Equipment data for Traveller RPG
 */
import type { EquipmentCategory, EquipmentEffect } from '../types/characterSheet';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  cost: number;
  weight: number;
  techLevel: number;
  description: string;
  
  // Combat properties
  damage?: string;
  protection?: number;
  range?: string;
  magazine?: number;
  traits?: string[];
  
  // Equipment effects on character
  effects?: EquipmentEffect[];
  
  // Availability and legality
  availability?: 'common' | 'uncommon' | 'rare' | 'very_rare' | 'illegal';
  lawLevel?: number;
  
  // Power/ammunition
  powerSource?: {
    type: 'battery' | 'power_cell' | 'fusion' | 'chemical' | 'manual';
    capacity: number;
    cost: number;
    rechargeable: boolean;
  };
  
  ammunition?: {
    type: string;
    capacity: number;
    cost: number;
  };
  
  // Maintenance requirements
  requiresMaintenance?: boolean;
  maintenanceInterval?: number; // days between maintenance
}

export const WEAPONS: Equipment[] = [
  // Melee Weapons
  {
    id: 'blade',
    name: 'Blade',
    category: 'weapon',
    cost: 100,
    weight: 0.5,
    techLevel: 2,
    description: 'A sharp cutting weapon',
    damage: '2D',
    range: 'Melee',
    traits: ['Cutting'],
    availability: 'common',
    lawLevel: 2,
    effects: [
      {
        type: 'skill',
        target: 'Melee (Blade)',
        modifier: 0,
        condition: 'when equipped'
      }
    ]
  },
  {
    id: 'cutlass',
    name: 'Cutlass',
    category: 'weapon',
    cost: 200,
    weight: 1.5,
    techLevel: 3,
    description: 'A naval sword favored by pirates',
    damage: '3D',
    range: 'Melee',
    traits: ['Cutting', 'Parry'],
    availability: 'common',
    lawLevel: 3,
    effects: [
      {
        type: 'skill',
        target: 'Melee (Blade)',
        modifier: 1,
        condition: 'when equipped'
      }
    ]
  },
  {
    id: 'stunstick',
    name: 'Stunstick',
    category: 'weapon',
    cost: 300,
    weight: 0.5,
    techLevel: 8,
    description: 'Non-lethal shock weapon',
    damage: '2D stun',
    range: 'Melee',
    traits: ['Stun', 'Non-lethal'],
    availability: 'uncommon',
    lawLevel: 6,
    powerSource: {
      type: 'battery',
      capacity: 100,
      cost: 10,
      rechargeable: true
    },
    requiresMaintenance: true,
    maintenanceInterval: 30
  },
  // Slug Weapons
  {
    id: 'autopistol',
    name: 'Autopistol',
    category: 'weapon',
    cost: 200,
    weight: 0.75,
    techLevel: 5,
    description: 'Semi-automatic handgun',
    damage: '3D-3',
    range: '10/20',
    magazine: 15,
    traits: ['Auto 2'],
  },
  {
    id: 'revolver',
    name: 'Revolver',
    category: 'weapon',
    cost: 150,
    weight: 0.9,
    techLevel: 4,
    description: 'Reliable six-shooter',
    damage: '3D-3',
    range: '10/20',
    magazine: 6,
    traits: ['Reliable'],
  },
  {
    id: 'rifle',
    name: 'Rifle',
    category: 'weapon',
    cost: 300,
    weight: 3.5,
    techLevel: 5,
    description: 'Long-range rifle',
    damage: '3D',
    range: '250/500',
    magazine: 20,
    traits: ['Scope'],
  },
  {
    id: 'assault-rifle',
    name: 'Assault Rifle',
    category: 'weapon',
    cost: 500,
    weight: 4,
    techLevel: 7,
    description: 'Military automatic rifle',
    damage: '3D',
    range: '200/400',
    magazine: 30,
    traits: ['Auto 3'],
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    category: 'weapon',
    cost: 250,
    weight: 3.5,
    techLevel: 4,
    description: 'Close-range scatter weapon',
    damage: '4D',
    range: '10/25',
    magazine: 6,
    traits: ['Bulky', 'Scatter'],
  },
  {
    id: 'snub-pistol',
    name: 'Snub Pistol',
    category: 'weapon',
    cost: 150,
    weight: 0.5,
    techLevel: 8,
    description: 'Zero-G compatible pistol',
    damage: '3D-3',
    range: '5/10',
    magazine: 6,
    traits: ['Zero-G'],
  },
  // Energy Weapons
  {
    id: 'laser-pistol',
    name: 'Laser Pistol',
    category: 'weapon',
    cost: 2000,
    weight: 1.5,
    techLevel: 9,
    description: 'Energy sidearm',
    damage: '3D+3',
    range: '20/40',
    magazine: 100,
    traits: ['Zero-G', 'AP 5'],
  },
  {
    id: 'laser-rifle',
    name: 'Laser Rifle',
    category: 'weapon',
    cost: 3500,
    weight: 5,
    techLevel: 9,
    description: 'Military energy rifle',
    damage: '5D+3',
    range: '300/600',
    magazine: 100,
    traits: ['Zero-G', 'AP 8'],
  },
  {
    id: 'stunner',
    name: 'Stunner',
    category: 'weapon',
    cost: 500,
    weight: 0.5,
    techLevel: 10,
    description: 'Non-lethal energy weapon',
    damage: '2D stun',
    range: '5/10',
    magazine: 100,
    traits: ['Stun', 'Non-lethal', 'Silent'],
  },
];

export const ARMOR: Equipment[] = [
  {
    id: 'jack',
    name: 'Jack',
    category: 'armor',
    cost: 50,
    weight: 1,
    techLevel: 1,
    description: 'Natural or synthetic leather armor',
    protection: 1,
    traits: ['Primitive'],
    availability: 'common',
    lawLevel: 0,
    effects: [
      {
        type: 'protection',
        target: 'armor',
        modifier: 1,
        condition: 'when worn'
      }
    ]
  },
  {
    id: 'mesh',
    name: 'Mesh',
    category: 'armor',
    cost: 150,
    weight: 2,
    techLevel: 6,
    description: 'Flexible metal mesh armor',
    protection: 2,
    traits: ['Flexible'],
    availability: 'common',
    lawLevel: 2,
    effects: [
      {
        type: 'protection',
        target: 'armor',
        modifier: 2,
        condition: 'when worn'
      }
    ]
  },
  {
    id: 'cloth',
    name: 'Cloth',
    category: 'armor',
    cost: 250,
    weight: 2,
    techLevel: 7,
    description: 'Ballistic cloth armor',
    protection: 3,
    traits: ['Concealable'],
    availability: 'common',
    lawLevel: 3,
    effects: [
      {
        type: 'protection',
        target: 'armor',
        modifier: 3,
        condition: 'when worn'
      },
      {
        type: 'skill',
        target: 'Stealth',
        modifier: 1,
        condition: 'when worn',
        stackable: false
      }
    ]
  },
  {
    id: 'flak-jacket',
    name: 'Flak Jacket',
    category: 'armor',
    cost: 100,
    weight: 3,
    techLevel: 6,
    description: 'Military fragmentation protection',
    protection: 3,
    traits: ['Bulky'],
  },
  {
    id: 'ablat',
    name: 'Ablat',
    category: 'armor',
    cost: 200,
    weight: 2,
    techLevel: 9,
    description: 'Laser-reflective armor',
    protection: 1,
    traits: ['Laser Protection +6'],
  },
  {
    id: 'reflec',
    name: 'Reflec',
    category: 'armor',
    cost: 1500,
    weight: 0.5,
    techLevel: 10,
    description: 'Advanced laser protection',
    protection: 0,
    traits: ['Laser Immunity'],
  },
  {
    id: 'combat-armor',
    name: 'Combat Armor',
    category: 'armor',
    cost: 20000,
    weight: 6,
    techLevel: 11,
    description: 'Powered military armor',
    protection: 13,
    traits: ['Powered', 'Life Support', 'Comms'],
  },
  {
    id: 'vacc-suit',
    name: 'Vacc Suit',
    category: 'armor',
    cost: 10000,
    weight: 8,
    techLevel: 8,
    description: 'Vacuum-rated space suit',
    protection: 4,
    traits: ['Vacuum Protection', 'Life Support'],
  },
  {
    id: 'hostile-environment-suit',
    name: 'Hostile Environment Suit',
    category: 'armor',
    cost: 14000,
    weight: 10,
    techLevel: 8,
    description: 'Protection for extreme environments',
    protection: 5,
    traits: ['Vacuum Protection', 'Life Support', 'Climate Control'],
  },
];

export const EQUIPMENT: Equipment[] = [
  // Tools
  {
    id: 'toolkit-mechanical',
    name: 'Mechanical Toolkit',
    category: 'tool',
    cost: 1000,
    weight: 12,
    techLevel: 4,
    description: 'Tools for mechanical repairs',
    traits: ['Required for Mechanic skill'],
    availability: 'common',
    lawLevel: 0,
    effects: [
      {
        type: 'skill',
        target: 'Mechanic',
        modifier: 2,
        condition: 'when equipped',
        stackable: false
      }
    ]
  },
  {
    id: 'toolkit-electronics',
    name: 'Electronics Toolkit',
    category: 'tool',
    cost: 2000,
    weight: 5,
    techLevel: 7,
    description: 'Tools for electronic repairs',
    traits: ['Required for Electronics skill'],
    availability: 'common',
    lawLevel: 0,
    effects: [
      {
        type: 'skill',
        target: 'Electronics',
        modifier: 2,
        condition: 'when equipped',
        stackable: false
      }
    ]
  },
  {
    id: 'toolkit-engineering',
    name: 'Engineering Toolkit',
    category: 'tool',
    cost: 4000,
    weight: 12,
    techLevel: 7,
    description: 'Tools for starship engineering',
    traits: ['Required for Engineer skill'],
  },
  // Survival Gear
  {
    id: 'binoculars',
    name: 'Binoculars',
    category: 'survival',
    cost: 75,
    weight: 1,
    techLevel: 3,
    description: 'Optical magnification device',
    traits: ['10x magnification'],
  },
  {
    id: 'cold-weather-clothing',
    name: 'Cold Weather Clothing',
    category: 'survival',
    cost: 200,
    weight: 4,
    techLevel: 0,
    description: 'Insulated clothing for arctic conditions',
    traits: ['Temperature Protection'],
  },
  {
    id: 'filter-mask',
    name: 'Filter Mask',
    category: 'survival',
    cost: 10,
    weight: 0.5,
    techLevel: 3,
    description: 'Basic air filtration',
    traits: ['Tainted Atmosphere Protection'],
  },
  {
    id: 'respirator',
    name: 'Respirator',
    category: 'survival',
    cost: 100,
    weight: 1,
    techLevel: 5,
    description: 'Advanced breathing apparatus',
    traits: ['Toxic Atmosphere Protection'],
  },
  {
    id: 'artificial-gill',
    name: 'Artificial Gill',
    category: 'survival',
    cost: 4000,
    weight: 4,
    techLevel: 8,
    description: 'Underwater breathing device',
    traits: ['Underwater Breathing'],
  },
  // Medical Equipment
  {
    id: 'medikit',
    name: 'Medikit',
    category: 'medical',
    cost: 1000,
    weight: 2,
    techLevel: 7,
    description: 'First aid and medical supplies',
    traits: ['+1 to Medic checks'],
  },
  {
    id: 'medical-supplies',
    name: 'Medical Supplies',
    category: 'medical',
    cost: 20,
    weight: 0.5,
    techLevel: 5,
    description: 'Consumable medical items',
    traits: ['5 uses'],
  },
  {
    id: 'combat-drug',
    name: 'Combat Drug',
    category: 'medical',
    cost: 500,
    weight: 0.1,
    techLevel: 8,
    description: 'Military performance enhancer',
    traits: ['+2 Initiative, +1 Strength'],
    availability: 'rare',
    lawLevel: 8,
    effects: [
      {
        type: 'characteristic',
        target: 'strength',
        modifier: 1,
        condition: 'when used',
        stackable: false
      },
      {
        type: 'characteristic',
        target: 'dexterity',
        modifier: 2,
        condition: 'when used',
        stackable: false
      }
    ]
  },
  {
    id: 'anti-rad',
    name: 'Anti-Rad',
    category: 'medical',
    cost: 200,
    weight: 0.1,
    techLevel: 8,
    description: 'Radiation treatment drugs',
    traits: ['Radiation Protection'],
  },
  // Computers
  {
    id: 'hand-computer',
    name: 'Hand Computer',
    category: 'computer',
    cost: 1000,
    weight: 0.5,
    techLevel: 7,
    description: 'Portable computing device',
    traits: ['Computer/0'],
  },
  {
    id: 'computer-terminal',
    name: 'Computer Terminal',
    category: 'computer',
    cost: 2000,
    weight: 10,
    techLevel: 7,
    description: 'Desktop computer system',
    traits: ['Computer/1'],
  },
  // Communications
  {
    id: 'commdot',
    name: 'Commdot',
    category: 'communication',
    cost: 10,
    weight: 0,
    techLevel: 10,
    description: 'Short-range communicator',
    traits: ['5km range'],
  },
  {
    id: 'comm',
    name: 'Comm',
    category: 'communication',
    cost: 100,
    weight: 0.3,
    techLevel: 6,
    description: 'Medium-range communicator',
    traits: ['50km range'],
  },
  {
    id: 'long-range-comm',
    name: 'Long Range Comm',
    category: 'communication',
    cost: 500,
    weight: 1.5,
    techLevel: 6,
    description: 'Planetary-range communicator',
    traits: ['500km range'],
  },
  // Miscellaneous
  {
    id: 'rope',
    name: 'Rope (10m)',
    category: 'misc',
    cost: 5,
    weight: 2,
    techLevel: 1,
    description: 'Strong synthetic rope',
    traits: ['10 meters'],
  },
  {
    id: 'handcuffs',
    name: 'Handcuffs',
    category: 'misc',
    cost: 10,
    weight: 0.5,
    techLevel: 1,
    description: 'Restraint device',
    traits: ['TL appropriate'],
  },
  {
    id: 'flashlight',
    name: 'Flashlight',
    category: 'misc',
    cost: 10,
    weight: 0.25,
    techLevel: 3,
    description: 'Portable light source',
    traits: ['18 hour battery'],
  },
  {
    id: 'grappling-hook',
    name: 'Grappling Hook',
    category: 'misc',
    cost: 20,
    weight: 1,
    techLevel: 2,
    description: 'Climbing and boarding tool',
    traits: ['Requires rope'],
  },
  {
    id: 'tent',
    name: 'Tent (2-person)',
    category: 'misc',
    cost: 200,
    weight: 3,
    techLevel: 3,
    description: 'Portable shelter',
    traits: ['Basic weather protection'],
  },
];
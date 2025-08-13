/**
 * Dice rolling utilities for Traveller RPG
 */

export interface DiceRoll {
  dice: number;
  sides: number;
  modifier?: number;
  result: number;
  rolls: number[];
  total: number;
}

/**
 * Roll a single die
 */
export const rollDie = (sides: number): number => {
  return Math.floor(Math.random() * sides) + 1;
};

/**
 * Roll multiple dice
 */
export const rollDice = (dice: number, sides: number, modifier: number = 0): DiceRoll => {
  const rolls: number[] = [];
  
  for (let i = 0; i < dice; i++) {
    rolls.push(rollDie(sides));
  }
  
  const result = rolls.reduce((sum, roll) => sum + roll, 0);
  const total = result + modifier;
  
  return {
    dice,
    sides,
    modifier,
    result,
    rolls,
    total,
  };
};

/**
 * Standard Traveller characteristic roll (2d6)
 */
export const rollCharacteristic = (): number => {
  const roll = rollDice(2, 6);
  return roll.total;
};

/**
 * Roll all six characteristics
 */
export const rollAllCharacteristics = () => {
  return {
    strength: rollCharacteristic(),
    dexterity: rollCharacteristic(),
    endurance: rollCharacteristic(),
    intelligence: rollCharacteristic(),
    education: rollCharacteristic(),
    social: rollCharacteristic(),
  };
};

/**
 * Get characteristic modifier
 */
export const getCharacteristicModifier = (value: number): number => {
  if (value <= 0) return -3;
  if (value <= 2) return -2;
  if (value <= 5) return -1;
  if (value <= 8) return 0;
  if (value <= 11) return 1;
  if (value <= 14) return 2;
  return 3;
};

/**
 * Get characteristic abbreviation
 */
export const getCharacteristicAbbreviation = (characteristic: string): string => {
  const abbreviations: Record<string, string> = {
    strength: 'STR',
    dexterity: 'DEX',
    endurance: 'END',
    intelligence: 'INT',
    education: 'EDU',
    social: 'SOC',
  };
  return abbreviations[characteristic.toLowerCase()] || characteristic;
};

/**
 * Convert characteristics to UPP (Universal Personality Profile) string
 */
export const toUPP = (characteristics: Record<string, number>): string => {
  const hexDigits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  const values = [
    characteristics.strength,
    characteristics.dexterity,
    characteristics.endurance,
    characteristics.intelligence,
    characteristics.education,
    characteristics.social,
  ];
  
  return values.map(val => hexDigits[Math.min(val, hexDigits.length - 1)]).join('');
};
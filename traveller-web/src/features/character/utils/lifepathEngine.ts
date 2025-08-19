/**
 * Lifepath Engine for Traveller RPG Character Generation
 * Implements the classic Traveller lifepath system for generating character careers and backgrounds
 */

import type { 
  CareerTerm, 
  LifeEvent, 
  CharacterCharacteristics, 
  UWP 
} from '../types/characterCreation';
import type { Career } from '../data/careers';
import { rollDice, getCharacteristicModifier } from './diceRoller';
import { AGING_TABLE } from '../data/careers';

export interface QualificationResult {
  qualified: boolean;
  roll: number;
  dm: number;
  target: number;
}

export interface TermResolution {
  term: CareerTerm;
  qualificationRoll?: QualificationResult;
  survivalRoll?: number;
  commissionRoll?: number;
  advancementRoll?: number;
  characteristicChanges: Partial<CharacterCharacteristics>;
  skillsGained: string[];
  mustLeave: boolean;
  canReenlist: boolean;
  reenlistRoll?: number;
  agingEffects?: Partial<CharacterCharacteristics>;
  events: LifeEvent[];
  mishap?: LifeEvent;
}

export interface MusterOutResult {
  benefits: string[];
  cash: number;
  totalRolls: number;
}

export interface LifepathEngineOptions {
  allowPlayerChoice: boolean;
  autoAdvancement: boolean;
  strictAging: boolean;
}

/**
 * Core engine for generating Traveller character lifepaths
 */
export class LifepathEngine {
  private options: LifepathEngineOptions;

  constructor(options: Partial<LifepathEngineOptions> = {}) {
    this.options = {
      allowPlayerChoice: true,
      autoAdvancement: false,
      strictAging: true,
      ...options,
    };
    
    // Options are used to configure behavior in future implementations
    if (this.options.allowPlayerChoice) {
      // Player choice logic would go here
    }
  }

  /**
   * Check if character qualifies for a career
   */
  checkCareerQualification(
    career: Career,
    characteristics: CharacterCharacteristics,
    previousCareers: CareerTerm[]
  ): QualificationResult {
    const characteristicValue = characteristics[career.qualification.characteristic];
    const baseRoll = rollDice(2, 6);
    
    // Apply DMs for previous service
    let dm = 0;
    const hasServedInCareer = previousCareers.some(c => c.career === career.name);
    if (hasServedInCareer) {
      dm += 1; // +1 DM for having served in career before
    }
    
    // Apply characteristic modifier
    dm += getCharacteristicModifier(characteristicValue);
    
    const target = career.qualification.value;
    const total = baseRoll.total + dm;
    
    return {
      qualified: total >= target,
      roll: baseRoll.total,
      dm,
      target,
    };
  }

  /**
   * Generate a complete career term
   */
  generateCareerTerm(
    career: Career,
    characteristics: CharacterCharacteristics,
    termNumber: number,
    currentRank: number,
    isOfficer: boolean
  ): TermResolution {
    const term: CareerTerm = {
      termNumber,
      career: career.name,
      rank: currentRank,
      rankTitle: this.getRankTitle(career, currentRank, isOfficer),
      survived: true,
      commissioned: isOfficer,
      advanced: false,
      skillsGained: [],
      events: [],
      mustered: false,
      benefits: [],
      cashReceived: 0,
    };

    let characteristicChanges: Partial<CharacterCharacteristics> = {};
    const events: LifeEvent[] = [];
    let mishap: LifeEvent | undefined;
    let mustLeave = false;
    let canReenlist = true;

    // 1. Survival Roll
    const survivalRoll = this.rollSurvival(career, characteristics, currentRank);
    if (!survivalRoll.survived) {
      // Mishap occurred
      term.survived = false;
      mishap = this.generateMishap(career);
      term.mishap = mishap;
      mustLeave = true;
      canReenlist = false;
    } else {
      term.survivalRoll = survivalRoll.roll;

      // 2. Commission Roll (if not already commissioned and career supports it)
      if (!isOfficer && career.commission) {
        const commissionRoll = this.rollCommission(career, characteristics);
        term.commissionRoll = commissionRoll.roll;
        if (commissionRoll.success) {
          term.commissioned = true;
          term.rank = 4; // Start at officer rank 4
          term.rankTitle = this.getRankTitle(career, 4, true);
        }
      }

      // 3. Advancement Roll
      const advancementRoll = this.rollAdvancement(career, characteristics, isOfficer || term.commissioned);
      term.advancementRoll = advancementRoll.roll;
      if (advancementRoll.success) {
        term.advanced = true;
        term.rank = currentRank + 1;
        term.rankTitle = this.getRankTitle(career, term.rank, isOfficer || term.commissioned);
      }

      // 4. Skills and Training
      const skillsGained = this.determineSkillsGained(career, term, characteristics);
      term.skillsGained = skillsGained;

      // 5. Events
      const termEvents = this.generateEvents(career, termNumber);
      events.push(...termEvents);
      term.events = termEvents;

      // 6. Re-enlistment check
      const reenlistResult = this.checkReenlistment(career, characteristics, termNumber);
      term.reenlistRoll = reenlistResult.roll;
      canReenlist = reenlistResult.canReenlist;
      if (!reenlistResult.canReenlist) {
        mustLeave = true;
      }
    }

    // 7. Aging effects
    const age = 18 + (termNumber * 4);
    const agingEffects = this.applyAgingEffects(age, characteristics);
    characteristicChanges = { ...characteristicChanges, ...agingEffects };

    return {
      term,
      characteristicChanges,
      skillsGained: term.skillsGained,
      mustLeave,
      canReenlist,
      events,
      mishap,
      survivalRoll: term.survivalRoll,
      commissionRoll: term.commissionRoll,
      advancementRoll: term.advancementRoll,
      reenlistRoll: term.reenlistRoll,
      agingEffects,
    };
  }

  /**
   * Generate muster out benefits
   */
  musterOutBenefits(
    career: Career,
    highestRank: number,
    totalTerms: number,
    _characteristics: CharacterCharacteristics
  ): MusterOutResult {
    const rollsAllowed = totalTerms + (highestRank >= 5 ? 1 : 0); // +1 if rank 5+
    const benefits: string[] = [];
    let totalCash = 0;

    for (let i = 0; i < rollsAllowed; i++) {
      const benefitRoll = rollDice(1, 6);
      let benefitIndex = benefitRoll.total - 1;
      
      // Apply rank modifier for cash tables
      if (benefitIndex < career.benefits.length) {
        const benefit = career.benefits[benefitIndex];
        if (benefit.benefit) {
          benefits.push(benefit.benefit);
        }
        totalCash += benefit.cash;
      }
    }

    return {
      benefits,
      cash: totalCash,
      totalRolls: rollsAllowed,
    };
  }

  private rollSurvival(
    career: Career,
    characteristics: CharacterCharacteristics,
    rank: number
  ): { survived: boolean; roll: number } {
    const roll = rollDice(2, 6);
    const characteristicMod = getCharacteristicModifier(characteristics[career.survival.characteristic]);
    const rankMod = Math.floor(rank / 2); // +1 per 2 ranks
    
    const total = roll.total + characteristicMod + rankMod;
    const survived = total >= career.survival.value;
    
    return { survived, roll: roll.total };
  }

  private rollCommission(
    career: Career,
    characteristics: CharacterCharacteristics
  ): { success: boolean; roll: number } {
    if (!career.commission) {
      return { success: false, roll: 0 };
    }
    
    const roll = rollDice(2, 6);
    const characteristicMod = getCharacteristicModifier(characteristics[career.commission.characteristic]);
    
    const total = roll.total + characteristicMod;
    const success = total >= career.commission.value;
    
    return { success, roll: roll.total };
  }

  private rollAdvancement(
    career: Career,
    characteristics: CharacterCharacteristics,
    _isOfficer: boolean
  ): { success: boolean; roll: number } {
    const advancementReq = career.advancement;
    if (!advancementReq) {
      return { success: false, roll: 0 };
    }
    
    const roll = rollDice(2, 6);
    const characteristicMod = getCharacteristicModifier(characteristics[advancementReq.characteristic]);
    
    const total = roll.total + characteristicMod;
    const success = total >= advancementReq.value;
    
    return { success, roll: roll.total };
  }

  private determineSkillsGained(
    career: Career,
    term: CareerTerm,
    _characteristics: CharacterCharacteristics
  ): string[] {
    const skills: string[] = [];
    
    // Base skill for surviving the term
    skills.push(this.selectRandomSkill(career.skills.service));
    
    // Additional skill for advancement
    if (term.advanced) {
      if (term.commissioned) {
        // Officer gets advanced education skill
        skills.push(this.selectRandomSkill(career.skills.advanced || career.skills.service));
      } else {
        // Enlisted gets specialist skill
        skills.push(this.selectRandomSkill(career.skills.specialist || career.skills.service));
      }
    }

    // Rank skill if applicable
    const rankSkill = this.getRankSkill(career, term.rank, term.commissioned);
    if (rankSkill && !skills.includes(rankSkill)) {
      skills.push(rankSkill);
    }

    return skills;
  }

  private generateEvents(career: Career, termNumber: number): LifeEvent[] {
    const events: LifeEvent[] = [];
    
    // Generate one random event per term
    const eventRoll = rollDice(1, 6);
    let eventIndex = eventRoll.total - 1;
    
    if (eventIndex < career.events.length) {
      const eventDescription = career.events[eventIndex];
      events.push({
        id: `event-${career.id}-${termNumber}-${Date.now()}`,
        description: eventDescription,
        type: 'event',
        details: `Occurred during term ${termNumber} in ${career.name}`,
      });
    }
    
    return events;
  }

  private generateMishap(career: Career): LifeEvent {
    const mishapRoll = rollDice(1, 6);
    let mishapIndex = mishapRoll.total - 1;
    
    if (mishapIndex >= career.mishaps.length) {
      mishapIndex = career.mishaps.length - 1;
    }
    
    return {
      id: `mishap-${career.id}-${Date.now()}`,
      description: career.mishaps[mishapIndex],
      type: 'mishap',
      details: `Forced to leave ${career.name} due to mishap`,
    };
  }

  private checkReenlistment(
    _career: Career,
    _characteristics: CharacterCharacteristics,
    termNumber: number
  ): { canReenlist: boolean; roll: number } {
    // Mandatory retirement after 7 terms (age 46)
    if (termNumber >= 7) {
      return { canReenlist: false, roll: 0 };
    }
    
    const roll = rollDice(2, 6);
    const reenlistTarget = 6; // Standard reenlistment target
    
    return {
      canReenlist: roll.total >= reenlistTarget,
      roll: roll.total,
    };
  }

  private applyAgingEffects(
    age: number,
    _characteristics: CharacterCharacteristics
  ): Partial<CharacterCharacteristics> {
    const effects: Partial<CharacterCharacteristics> = {};
    
    for (const [ageThreshold, data] of Object.entries(AGING_TABLE)) {
      const threshold = parseInt(ageThreshold);
      if (age >= threshold && data.check) {
        // Apply aging effects
        if ('modifiers' in data && data.modifiers) {
          Object.entries(data.modifiers).forEach(([char, modifier]) => {
            const key = char as keyof CharacterCharacteristics;
            effects[key] = (effects[key] || 0) + (modifier as number);
          });
        }
      }
    }
    
    return effects;
  }

  private getRankTitle(career: Career, rank: number, _isOfficer: boolean): string {
    if (!career.ranks || career.ranks.length === 0) {
      return `Rank ${rank}`;
    }
    
    const rankData = career.ranks.find(r => r.rank === rank);
    return rankData?.title || `Rank ${rank}`;
  }

  private getRankSkill(career: Career, rank: number, _isOfficer: boolean): string | undefined {
    if (!career.ranks || career.ranks.length === 0) {
      return undefined;
    }
    
    const rankData = career.ranks.find(r => r.rank === rank);
    return rankData?.skill;
  }

  private selectRandomSkill(skillList: string[]): string {
    if (skillList.length === 0) {
      return 'Jack-of-all-Trades';
    }
    
    const index = Math.floor(Math.random() * skillList.length);
    return skillList[index];
  }
}

/**
 * Convert UWP object to hex string representation
 */
export const uwpToHex = (uwp: UWP): string => {
  const toHex = (value: number): string => {
    if (value < 10) return value.toString();
    return String.fromCharCode(65 + value - 10); // A=10, B=11, etc.
  };

  return [
    uwp.starport,
    toHex(uwp.size),
    toHex(uwp.atmosphere),
    toHex(uwp.hydrosphere),
    toHex(uwp.population),
    toHex(uwp.government),
    toHex(uwp.lawLevel),
    '-',
    toHex(uwp.techLevel),
  ].join('');
};

/**
 * Parse hex UWP string back to UWP object
 */
export const parseUWP = (uwpString: string): UWP => {
  const fromHex = (char: string): number => {
    const upper = char.toUpperCase();
    if (upper >= '0' && upper <= '9') return parseInt(upper);
    return upper.charCodeAt(0) - 65 + 10;
  };

  if (uwpString.length < 8) {
    throw new Error('Invalid UWP string format');
  }

  return {
    starport: uwpString[0],
    size: fromHex(uwpString[1]),
    atmosphere: fromHex(uwpString[2]),
    hydrosphere: fromHex(uwpString[3]),
    population: fromHex(uwpString[4]),
    government: fromHex(uwpString[5]),
    lawLevel: fromHex(uwpString[6]),
    techLevel: fromHex(uwpString[8]), // Skip the dash at position 7
  };
};

export default LifepathEngine;
// Character types
import type { BaseEntity } from '../../../shared/types';

export interface CharacterAttributes {
  strength: number;
  dexterity: number;
  endurance: number;
  intelligence: number;
  education: number;
  social: number;
}

export interface CharacterSkill {
  name: string;
  level: number;
  specialty?: string;
}

export interface Character extends BaseEntity {
  name: string;
  species: string;
  homeworld: string;
  attributes: CharacterAttributes;
  skills: CharacterSkill[];
  career?: string;
  rank?: string;
  terms: number;
  age: number;
  credits: number;
  equipment: string[];
  background: string;
  userId: string;
}

export interface CharacterFormData {
  name: string;
  species: string;
  homeworld: string;
  attributes: CharacterAttributes;
  background: string;
}
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CharacteristicsDisplay from '../CharacteristicsDisplay';
import type { CharacterSheetData } from '../../../../types/characterSheet';
import { getCharacteristicModifier, toUPP } from '../../../../types/characterSheet';

// Mock character data for testing
const mockCharacter: CharacterSheetData = {
  id: 'test-character',
  name: 'Test Character',
  species: 'Human',
  gender: 'Non-binary',
  age: 32,
  characteristics: {
    strength: 8,
    dexterity: 12,
    endurance: 7,
    intelligence: 13,
    education: 11,
    social: 9,
  },
  background: {
    homeworld: 'Terra',
    socialClass: 'Middle',
    upbringing: 'Urban',
    family: 'Nuclear',
    earlyLife: 'Student',
    startingSkills: [],
  },
  careers: [],
  careerProgression: {
    totalTerms: 0,
    currentAge: 32,
    retiredInvoluntarily: false,
    retiredVoluntarily: false,
    canReenlist: true,
    mustLeave: false,
  },
  totalTerms: 0,
  skills: [],
  lifeEvents: [],
  connections: [],
  rivals: [],
  startingCredits: 1000,
  equipment: [],
  conditions: [],
  finances: {
    currentCredits: 1000,
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
    goals: [],
  },
  lastModified: '2024-01-01',
  version: 1,
  isActive: true,
  campaignId: 'test-campaign',
  status: 'complete',
};

const mockOnUpdate = vi.fn();

describe('CharacteristicsDisplay', () => {
  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders all six characteristics correctly', () => {
    render(
      <CharacteristicsDisplay
        character={mockCharacter}
        onUpdate={mockOnUpdate}
        readonly={false}
        showAdvancedFeatures={true}
        allowCharacteristicEditing={true}
      />
    );

    // Check that all characteristic abbreviations are displayed
    expect(screen.getByText('STR')).toBeInTheDocument();
    expect(screen.getByText('DEX')).toBeInTheDocument();
    expect(screen.getByText('END')).toBeInTheDocument();
    expect(screen.getByText('INT')).toBeInTheDocument();
    expect(screen.getByText('EDU')).toBeInTheDocument();
    expect(screen.getByText('SOC')).toBeInTheDocument();

    // Check that characteristic values are displayed
    expect(screen.getByText('8')).toBeInTheDocument(); // STR
    expect(screen.getByText('12')).toBeInTheDocument(); // DEX
    expect(screen.getByText('7')).toBeInTheDocument(); // END
    expect(screen.getByText('13')).toBeInTheDocument(); // INT
    expect(screen.getByText('11')).toBeInTheDocument(); // EDU
    expect(screen.getByText('9')).toBeInTheDocument(); // SOC
  });

  it('calculates dice modifiers correctly according to Traveller rules', () => {
    render(
      <CharacteristicsDisplay
        character={mockCharacter}
        onUpdate={mockOnUpdate}
        readonly={false}
        showAdvancedFeatures={true}
        allowCharacteristicEditing={true}
      />
    );

    // Test Traveller RPG modifier calculation: DM = floor((characteristic - 6) / 3)
    const expectedModifiers = {
      strength: Math.floor((8 - 6) / 3), // 0
      dexterity: Math.floor((12 - 6) / 3), // 2
      endurance: Math.floor((7 - 6) / 3), // 0
      intelligence: Math.floor((13 - 6) / 3), // 2
      education: Math.floor((11 - 6) / 3), // 1
      social: Math.floor((9 - 6) / 3), // 1
    };

    // Check that modifiers are correctly displayed
    expect(screen.getByText('+0')).toBeInTheDocument(); // STR
    expect(screen.getByText('+2')).toBeInTheDocument(); // DEX and INT
    expect(screen.getByText('+1')).toBeInTheDocument(); // EDU and SOC

    // Verify calculation matches our utility function
    Object.entries(mockCharacter.characteristics).forEach(([key, value]) => {
      const calculated = getCharacteristicModifier(value);
      const expected = expectedModifiers[key as keyof typeof expectedModifiers];
      expect(calculated).toBe(expected);
    });
  });

  it('displays UPP in correct hexadecimal format', () => {
    render(
      <CharacteristicsDisplay
        character={mockCharacter}
        onUpdate={mockOnUpdate}
        readonly={false}
        showAdvancedFeatures={true}
        allowCharacteristicEditing={true}
      />
    );

    const expectedUPP = toUPP(mockCharacter.characteristics);
    // STR=8, DEX=12=C, END=7, INT=13=D, EDU=11=B, SOC=9
    // So UPP should be "8C7DB9"
    expect(expectedUPP).toBe('8C7DB9');
    expect(screen.getByText('8C7DB9')).toBeInTheDocument();
  });

  it('shows superhuman indicator for characteristics >= 15', () => {
    const superhumanCharacter = {
      ...mockCharacter,
      characteristics: {
        ...mockCharacter.characteristics,
        strength: 15,
        intelligence: 16,
      },
    };

    render(
      <CharacteristicsDisplay
        character={superhumanCharacter}
        onUpdate={mockOnUpdate}
        readonly={false}
        showAdvancedFeatures={true}
        allowCharacteristicEditing={true}
      />
    );

    // Check for superhuman indicators (★)
    const superhumanIndicators = screen.getAllByText('★');
    expect(superhumanIndicators).toHaveLength(2); // STR and INT
  });

  it('calculates total modifier correctly', () => {
    render(
      <CharacteristicsDisplay
        character={mockCharacter}
        onUpdate={mockOnUpdate}
        readonly={false}
        showAdvancedFeatures={true}
        allowCharacteristicEditing={true}
      />
    );

    // Calculate expected total DM
    const totalDM = Object.values(mockCharacter.characteristics)
      .reduce((sum, value) => sum + getCharacteristicModifier(value), 0);
    
    expect(totalDM).toBe(6); // 0 + 2 + 0 + 2 + 1 + 1
    expect(screen.getByText('+6')).toBeInTheDocument();
  });

  it('handles edge cases for characteristic values', () => {
    const edgeCaseCharacter = {
      ...mockCharacter,
      characteristics: {
        strength: 0, // Dead
        dexterity: 1, // Unconscious
        endurance: 2, // Very poor
        intelligence: 3, // Very poor
        education: 15, // Superhuman
        social: 18, // Maximum possible
      },
    };

    // Test modifier calculations for edge cases
    expect(getCharacteristicModifier(0)).toBe(-3); // Dead
    expect(getCharacteristicModifier(1)).toBe(-2); // Unconscious
    expect(getCharacteristicModifier(2)).toBe(-1); // floor((2-6)/3) = -1
    expect(getCharacteristicModifier(3)).toBe(-1); // floor((3-6)/3) = -1
    expect(getCharacteristicModifier(15)).toBe(3); // floor((15-6)/3) = 3
    expect(getCharacteristicModifier(18)).toBe(4); // floor((18-6)/3) = 4
  });

  it('allows editing when allowCharacteristicEditing is true', () => {
    render(
      <CharacteristicsDisplay
        character={mockCharacter}
        onUpdate={mockOnUpdate}
        readonly={false}
        showAdvancedFeatures={true}
        allowCharacteristicEditing={true}
      />
    );

    // Find and click the Edit button
    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    // Check that edit mode is active (button should change to "Done")
    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('shows characteristic details when clicked', () => {
    render(
      <CharacteristicsDisplay
        character={mockCharacter}
        onUpdate={mockOnUpdate}
        readonly={false}
        showAdvancedFeatures={true}
        allowCharacteristicEditing={true}
      />
    );

    // Click on strength characteristic
    const strengthCard = screen.getByText('strength').closest('div[role="button"]');
    expect(strengthCard).toBeInTheDocument();
    
    if (strengthCard) {
      fireEvent.click(strengthCard);
      
      // Check that details panel appears
      expect(screen.getByText('Strength Details')).toBeInTheDocument();
      expect(screen.getByText('Physical power, muscle mass, and lifting capacity')).toBeInTheDocument();
    }
  });

  it('is accessible with proper ARIA labels', () => {
    render(
      <CharacteristicsDisplay
        character={mockCharacter}
        onUpdate={mockOnUpdate}
        readonly={false}
        showAdvancedFeatures={true}
        allowCharacteristicEditing={true}
      />
    );

    // Check for proper ARIA labels on characteristic cards
    const strengthCard = screen.getByLabelText(/strength characteristic: 8, Average, modifier \+0/i);
    expect(strengthCard).toBeInTheDocument();

    const dexterityCard = screen.getByLabelText(/dexterity characteristic: 12, Excellent, modifier \+2/i);
    expect(dexterityCard).toBeInTheDocument();
  });

  it('displays correct range descriptions', () => {
    const testCharacter = {
      ...mockCharacter,
      characteristics: {
        strength: 1, // Unconscious
        dexterity: 3, // Very Poor
        endurance: 6, // Average
        intelligence: 12, // Good
        education: 15, // Excellent
        social: 16, // Superhuman
      },
    };

    render(
      <CharacteristicsDisplay
        character={testCharacter}
        onUpdate={mockOnUpdate}
        readonly={false}
        showAdvancedFeatures={true}
        allowCharacteristicEditing={true}
      />
    );

    expect(screen.getByText('Unconscious')).toBeInTheDocument();
    expect(screen.getByText('Very Poor')).toBeInTheDocument();
    expect(screen.getByText('Average')).toBeInTheDocument();
    expect(screen.getByText('Good')).toBeInTheDocument();
    expect(screen.getByText('Excellent')).toBeInTheDocument();
    expect(screen.getByText('Superhuman')).toBeInTheDocument();
  });
});
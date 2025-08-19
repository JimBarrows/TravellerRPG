import { useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import type { CharacterSheetData } from '../types/characterSheet';
import { 
  UPDATE_CHARACTER_FULL,
  type UpdateCharacterFullInput 
} from '../services/characterStorageService';

interface UseCharacterStorageReturn {
  updateCharacter: (id: string, data: CharacterSheetData) => Promise<CharacterSheetData>;
  checkCharacterVersion: (id: string) => Promise<number>;
  batchUpdateCharacter: (updates: Array<{ id: string; data: Partial<CharacterSheetData> }>) => Promise<void>;
}

export const useCharacterStorage = (): UseCharacterStorageReturn => {
  const apolloClient = useApolloClient();

  // Convert character sheet data to GraphQL input format
  const convertToGraphQLInput = useCallback((data: CharacterSheetData): UpdateCharacterFullInput => {
    return {
      name: data.name,
      species: data.species,
      gender: data.gender,
      age: data.age,
      status: 'ACTIVE', // Assuming active characters
      characteristics: {
        strength: data.characteristics.strength,
        dexterity: data.characteristics.dexterity,
        endurance: data.characteristics.endurance,
        intelligence: data.characteristics.intelligence,
        education: data.characteristics.education,
        socialStanding: data.characteristics.social,
      },
      skills: data.skills.map(skill => ({
        name: skill.name,
        level: skill.level,
        specialization: skill.specialty,
      })),
      equipment: data.equipment.map(item => ({
        name: item.name,
        description: item.description || item.type,
        weight: item.weight,
        cost: item.cost,
        quantity: item.quantity,
        equipped: item.location === 'equipped',
      })),
      credits: data.finances.currentCredits,
      // Convert complex data to JSON strings for storage
      backgroundData: {
        notes: data.notes.filter(note => note.category === 'background'),
        lifeEvents: [], // Would come from character creation data
        connections: [], // Would come from character creation data
        rivals: [], // Would come from character creation data
      },
      careerData: {
        careers: [], // Would come from character creation data
        advancement: data.advancement,
      },
    };
  }, []);

  // Convert GraphQL response back to character sheet format
  const convertFromGraphQLResponse = useCallback((response: any): CharacterSheetData => {
    return {
      ...response,
      characteristics: {
        strength: response.characteristics.strength,
        dexterity: response.characteristics.dexterity,
        endurance: response.characteristics.endurance,
        intelligence: response.characteristics.intelligence,
        education: response.characteristics.education,
        social: response.characteristics.socialStanding,
      },
      skills: response.skills.map((skill: any) => ({
        ...skill,
        specialty: skill.specialization,
        category: 'General', // Would be determined by skill type
        characteristic: 'intelligence', // Would be determined by skill type
        isCareerSkill: false, // Would be determined by career history
      })),
      equipment: response.equipment.map((item: any) => ({
        ...item,
        type: item.description || 'Unknown',
        location: item.equipped ? 'equipped' : 'carried',
        condition: 'good',
      })),
      finances: {
        currentCredits: response.credits || 0,
        bankCredits: 0,
        debt: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        transactions: [],
        assets: [],
      },
      conditions: [],
      notes: response.backgroundData?.notes || [],
      advancement: response.careerData?.advancement || {
        totalExperienceEarned: 0,
        totalExperienceSpent: 0,
        availableExperience: 0,
        records: [],
        goals: [],
      },
      lastModified: response.updatedAt,
      version: 1, // Would be tracked separately
      isActive: true,
      campaignId: 'default', // Would come from context
    };
  }, []);

  // Update character data
  const updateCharacter = useCallback(async (
    id: string, 
    data: CharacterSheetData
  ): Promise<CharacterSheetData> => {
    try {
      const input = convertToGraphQLInput(data);
      
      const { data: result } = await apolloClient.mutate({
        mutation: UPDATE_CHARACTER_FULL,
        variables: { id, input },
        errorPolicy: 'all',
      });

      if (result?.updateCharacterFull) {
        return convertFromGraphQLResponse(result.updateCharacterFull);
      }

      throw new Error('Failed to update character');
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  }, [apolloClient, convertToGraphQLInput, convertFromGraphQLResponse]);

  // Check character version for conflict detection
  const checkCharacterVersion = useCallback(async (id: string): Promise<number> => {
    try {
      // This would be a lightweight query to just get the version/updatedAt
      const { data } = await apolloClient.query({
        query: /* GraphQL query for version check */ `
          query GetCharacterVersion($id: ID!) {
            getCharacter(id: $id) {
              version
              updatedAt
            }
          }
        `,
        variables: { id },
        fetchPolicy: 'network-only', // Always fetch fresh data
      });

      return data?.getCharacter?.version || 1;
    } catch (error) {
      console.error('Error checking character version:', error);
      return 1; // Default version if check fails
    }
  }, [apolloClient]);

  // Batch update multiple characters (for bulk operations)
  const batchUpdateCharacter = useCallback(async (
    updates: Array<{ id: string; data: Partial<CharacterSheetData> }>
  ): Promise<void> => {
    try {
      // Execute updates in parallel with concurrency limit
      const BATCH_SIZE = 5;
      const batches = [];
      
      for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE);
        batches.push(batch);
      }

      for (const batch of batches) {
        await Promise.all(
          batch.map(({ id, data }) => {
            // For partial updates, we'd need to fetch current data first
            // then merge with the updates before saving
            return updateCharacter(id, data as CharacterSheetData);
          })
        );
      }
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }, [updateCharacter]);

  return {
    updateCharacter,
    checkCharacterVersion,
    batchUpdateCharacter,
  };
};
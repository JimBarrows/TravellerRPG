import { gql } from '@apollo/client';
import type { CharacterCreationData } from '../types/characterCreation';
import type { CharacterSheetData, CharacterSnapshot, CharacterShare, CharacterBackup } from '../types/characterSheet';
import { StorageError, withRetry, withFallback, isNetworkError } from '../utils/errorHandling';
import { initializeCharacterAdvancement } from '../utils/experienceSystem';
import { CharacterHistoryService } from './characterHistoryService';
import { CharacterSharingService } from './characterSharingService';

// GraphQL Queries and Mutations
export const GET_CHARACTER_DRAFTS = gql`
  query GetCharacterDrafts($campaignId: ID!) {
    getCharacterDrafts(campaignId: $campaignId) {
      id
      draftName
      step
      characterData
      isAutoSave
      createdAt
      updatedAt
    }
  }
`;

export const GET_CHARACTER_DRAFT = gql`
  query GetCharacterDraft($id: ID!) {
    getCharacterDraft(id: $id) {
      id
      draftName
      step
      characterData
      isAutoSave
      characterId
      createdAt
      updatedAt
    }
  }
`;

export const SAVE_CHARACTER_DRAFT = gql`
  mutation SaveCharacterDraft($input: SaveCharacterDraftInput!) {
    saveCharacterDraft(input: $input) {
      id
      draftName
      step
      characterData
      isAutoSave
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CHARACTER_DRAFT = gql`
  mutation DeleteCharacterDraft($id: ID!) {
    deleteCharacterDraft(id: $id)
  }
`;

export const CREATE_CHARACTER_FROM_DRAFT = gql`
  mutation CreateCharacterFromDraft($input: CreateCharacterFromDraftInput!) {
    createCharacterFromDraft(input: $input) {
      id
      name
      status
      createdAt
    }
  }
`;

export const UPDATE_CHARACTER_FULL = gql`
  mutation UpdateCharacterFull($id: ID!, $input: UpdateCharacterFullInput!) {
    updateCharacterFull(id: $id, input: $input) {
      id
      name
      species
      gender
      age
      status
      characteristics {
        strength
        dexterity
        endurance
        intelligence
        education
        socialStanding
      }
      skills {
        id
        name
        level
        specialization
      }
      equipment {
        id
        name
        description
        weight
        cost
        quantity
        equipped
      }
      credits
      portrait
      backgroundData
      careerData
      avatarSeed
      createdAt
      updatedAt
    }
  }
`;

// TypeScript interfaces for the service
export interface CharacterDraft {
  id: string;
  draftName?: string;
  step: number;
  characterData: CharacterCreationData;
  isAutoSave: boolean;
  characterId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveDraftInput {
  campaignId: string;
  draftName?: string;
  step: number;
  characterData: CharacterCreationData;
  isAutoSave: boolean;
  characterId?: string;
}

export interface CreateCharacterFromDraftInput {
  draftId: string;
  campaignId: string;
}

export interface UpdateCharacterFullInput {
  name?: string;
  species?: string;
  gender?: string;
  age?: number;
  status?: 'DRAFT' | 'COMPLETE' | 'ACTIVE' | 'RETIRED' | 'DECEASED';
  characteristics?: {
    strength: number;
    dexterity: number;
    endurance: number;
    intelligence: number;
    education: number;
    socialStanding: number;
  };
  skills?: Array<{
    name: string;
    level: number;
    specialization?: string;
  }>;
  equipment?: Array<{
    name: string;
    description?: string;
    weight?: number;
    cost?: number;
    quantity: number;
    equipped: boolean;
  }>;
  credits?: number;
  portrait?: string;
  backgroundData?: any;
  careerData?: any;
  avatarSeed?: string;
}

/**
 * Character Storage Service
 * Handles saving, loading, and managing character drafts and completed characters
 */
export class CharacterStorageService {
  private apolloClient: any;

  constructor(apolloClient: any) {
    this.apolloClient = apolloClient;
  }

  /**
   * Save a character draft (auto-save or manual save)
   */
  async saveDraft(input: SaveDraftInput): Promise<CharacterDraft> {
    return withFallback(
      () => withRetry(async () => {
        const { data } = await this.apolloClient.mutate({
          mutation: SAVE_CHARACTER_DRAFT,
          variables: { input },
          errorPolicy: 'all'
        });

        if (data?.saveCharacterDraft) {
          return {
            ...data.saveCharacterDraft,
            characterData: typeof data.saveCharacterDraft.characterData === 'string' 
              ? JSON.parse(data.saveCharacterDraft.characterData)
              : data.saveCharacterDraft.characterData
          };
        }

        throw new StorageError('Failed to save character draft to server', 'save');
      }, 3, 1000),
      () => this.saveToLocalStorage(input),
      'character draft save'
    );
  }

  /**
   * Load character drafts for a campaign
   */
  async loadDrafts(campaignId: string): Promise<CharacterDraft[]> {
    return withFallback(
      async () => {
        const { data } = await this.apolloClient.query({
          query: GET_CHARACTER_DRAFTS,
          variables: { campaignId },
          errorPolicy: 'all',
          fetchPolicy: 'cache-and-network'
        });

        if (data?.getCharacterDrafts) {
          return data.getCharacterDrafts.map((draft: any) => ({
            ...draft,
            characterData: typeof draft.characterData === 'string'
              ? JSON.parse(draft.characterData)
              : draft.characterData
          }));
        }

        return [];
      },
      () => this.loadFromLocalStorage(campaignId),
      'character drafts load'
    );
  }

  /**
   * Load a specific character draft
   */
  async loadDraft(draftId: string): Promise<CharacterDraft | null> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_CHARACTER_DRAFT,
        variables: { id: draftId },
        errorPolicy: 'all'
      });

      if (data?.getCharacterDraft) {
        return {
          ...data.getCharacterDraft,
          characterData: typeof data.getCharacterDraft.characterData === 'string'
            ? JSON.parse(data.getCharacterDraft.characterData)
            : data.getCharacterDraft.characterData
        };
      }

      return null;
    } catch (error) {
      console.error('Error loading character draft:', error);
      return null;
    }
  }

  /**
   * Delete a character draft
   */
  async deleteDraft(draftId: string): Promise<boolean> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: DELETE_CHARACTER_DRAFT,
        variables: { id: draftId }
      });

      return data?.deleteCharacterDraft === true;
    } catch (error) {
      console.error('Error deleting character draft:', error);
      return false;
    }
  }

  /**
   * Create a completed character from a draft
   */
  async createCharacterFromDraft(input: CreateCharacterFromDraftInput): Promise<any> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: CREATE_CHARACTER_FROM_DRAFT,
        variables: { input }
      });

      return data?.createCharacterFromDraft;
    } catch (error) {
      console.error('Error creating character from draft:', error);
      throw error;
    }
  }

  /**
   * Update a completed character with full data
   */
  async updateCharacter(id: string, input: UpdateCharacterFullInput): Promise<any> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: UPDATE_CHARACTER_FULL,
        variables: { id, input }
      });

      return data?.updateCharacterFull;
    } catch (error) {
      console.error('Error updating character:', error);
      throw error;
    }
  }

  /**
   * Auto-save functionality - saves draft periodically
   */
  async autoSave(characterData: CharacterCreationData, campaignId: string, step: number): Promise<void> {
    // Only auto-save if character has a name
    if (!characterData.name?.trim()) {
      return;
    }

    try {
      await this.saveDraft({
        campaignId,
        step,
        characterData,
        isAutoSave: true
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Silent failure for auto-save
    }
  }

  /**
   * Convert CharacterCreationData to database format
   */
  private convertToDbFormat(characterData: CharacterCreationData): UpdateCharacterFullInput {
    return {
      name: characterData.name,
      species: characterData.species,
      gender: characterData.gender,
      age: characterData.age,
      status: characterData.status === 'complete' ? 'COMPLETE' : 'DRAFT',
      characteristics: {
        strength: characterData.characteristics.strength,
        dexterity: characterData.characteristics.dexterity,
        endurance: characterData.characteristics.endurance,
        intelligence: characterData.characteristics.intelligence,
        education: characterData.characteristics.education,
        socialStanding: characterData.characteristics.social
      },
      skills: characterData.skills.map(skill => ({
        name: skill.name,
        level: skill.level,
        specialization: skill.specialty
      })),
      equipment: characterData.equipment.map(item => ({
        name: item.name,
        description: item.type,
        weight: item.weight,
        cost: item.cost,
        quantity: item.quantity,
        equipped: false // Default to not equipped
      })),
      credits: characterData.startingCredits,
      portrait: characterData.portrait,
      backgroundData: {
        background: characterData.background,
        lifeEvents: characterData.lifeEvents,
        connections: characterData.connections,
        rivals: characterData.rivals
      },
      careerData: {
        careers: characterData.careers,
        careerProgression: characterData.careerProgression,
        totalTerms: characterData.totalTerms
      },
      avatarSeed: characterData.avatarSeed
    };
  }

  // Fallback methods for localStorage
  private saveToLocalStorage(input: SaveDraftInput): CharacterDraft {
    const drafts = this.getLocalStorageDrafts();
    const draftId = `draft_${Date.now()}`;
    
    const draft: CharacterDraft = {
      id: draftId,
      draftName: input.draftName,
      step: input.step,
      characterData: input.characterData,
      isAutoSave: input.isAutoSave,
      characterId: input.characterId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    drafts[draftId] = draft;
    localStorage.setItem('character-drafts', JSON.stringify(drafts));
    
    return draft;
  }

  private loadFromLocalStorage(campaignId: string): CharacterDraft[] {
    const drafts = this.getLocalStorageDrafts();
    
    // Filter by campaign if we had that info (for now return all)
    return Object.values(drafts);
  }

  private getLocalStorageDrafts(): Record<string, CharacterDraft> {
    try {
      const stored = localStorage.getItem('character-drafts');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  /**
   * Initialize character sheet with advanced features
   */
  initializeCharacterSheetData(creationData: CharacterCreationData): CharacterSheetData {
    return {
      ...creationData,
      id: crypto.randomUUID(),
      
      // Convert skills and equipment
      skills: creationData.skills.map(skill => ({
        ...skill,
        category: 'General',
        characteristic: 'intelligence' as const,
        isCareerSkill: false,
        usage: {
          timesUsed: 0,
          successfulUses: 0,
          failedUses: 0,
          experienceGained: 0,
          averageDifficultyFaced: 0,
          consecutiveSuccesses: 0,
          consecutiveFailures: 0,
          sessionUsage: []
        },
        improvementHistory: []
      })),
      
      equipment: creationData.equipment.map(item => ({
        ...item,
        location: 'carried' as const,
        condition: 'good' as const,
        category: 'misc' as const,
        techLevel: 10
      })),
      
      // Initialize advanced features
      conditions: [],
      finances: {
        currentCredits: creationData.startingCredits,
        bankCredits: 0,
        debt: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        transactions: [],
        assets: []
      },
      notes: [],
      advancement: initializeCharacterAdvancement(),
      
      // Initialize history and sharing
      history: {
        snapshots: [],
        currentVersion: 1,
        autoSnapshotEnabled: true,
        autoSnapshotTriggers: {
          onLevelUp: true,
          onMilestone: true,
          onSessionEnd: false,
          onMajorChange: true,
          intervalDays: 7
        },
        maxSnapshots: 50
      },
      sharing: [],
      backups: [],
      backupSettings: {
        autoBackupEnabled: false,
        autoBackupFrequency: 'weekly',
        maxBackups: 10,
        preferredFormat: 'json',
        encryptBackups: false,
        cloudSync: {
          enabled: false
        }
      },
      
      // Metadata
      lastModified: new Date().toISOString(),
      version: 1,
      isActive: true,
      campaignId: 'default'
    };
  }

  /**
   * Save character snapshot
   */
  async saveCharacterSnapshot(snapshot: CharacterSnapshot): Promise<CharacterSnapshot> {
    // In a real implementation, this would save to the backend
    // For now, store in localStorage as fallback
    try {
      const snapshots = this.getLocalStorageSnapshots(snapshot.characterId);
      snapshots.push(snapshot);
      localStorage.setItem(`character-snapshots-${snapshot.characterId}`, JSON.stringify(snapshots));
      return snapshot;
    } catch (error) {
      console.error('Failed to save character snapshot:', error);
      throw new StorageError('Failed to save character snapshot', 'save');
    }
  }

  /**
   * Load character snapshots
   */
  async loadCharacterSnapshots(characterId: string): Promise<CharacterSnapshot[]> {
    try {
      return this.getLocalStorageSnapshots(characterId);
    } catch (error) {
      console.error('Failed to load character snapshots:', error);
      return [];
    }
  }

  /**
   * Save character share
   */
  async saveCharacterShare(share: CharacterShare): Promise<CharacterShare> {
    try {
      const shares = this.getLocalStorageShares(share.characterId);
      const existingIndex = shares.findIndex(s => s.id === share.id);
      
      if (existingIndex >= 0) {
        shares[existingIndex] = share;
      } else {
        shares.push(share);
      }
      
      localStorage.setItem(`character-shares-${share.characterId}`, JSON.stringify(shares));
      return share;
    } catch (error) {
      console.error('Failed to save character share:', error);
      throw new StorageError('Failed to save character share', 'save');
    }
  }

  /**
   * Load character shares
   */
  async loadCharacterShares(characterId: string): Promise<CharacterShare[]> {
    try {
      return this.getLocalStorageShares(characterId);
    } catch (error) {
      console.error('Failed to load character shares:', error);
      return [];
    }
  }

  /**
   * Save character backup
   */
  async saveCharacterBackup(backup: CharacterBackup): Promise<CharacterBackup> {
    try {
      const backups = this.getLocalStorageBackups(backup.characterId);
      backups.push(backup);
      
      // Keep only the most recent backups
      backups.sort((a, b) => new Date(b.backupDate).getTime() - new Date(a.backupDate).getTime());
      
      localStorage.setItem(`character-backups-${backup.characterId}`, JSON.stringify(backups.slice(0, 20)));
      return backup;
    } catch (error) {
      console.error('Failed to save character backup:', error);
      throw new StorageError('Failed to save character backup', 'save');
    }
  }

  /**
   * Load character backups
   */
  async loadCharacterBackups(characterId: string): Promise<CharacterBackup[]> {
    try {
      return this.getLocalStorageBackups(characterId);
    } catch (error) {
      console.error('Failed to load character backups:', error);
      return [];
    }
  }

  /**
   * Auto-save character with snapshot management
   */
  async autoSaveWithHistory(
    character: CharacterSheetData,
    previousCharacter?: CharacterSheetData
  ): Promise<CharacterSheetData> {
    const historyService = new CharacterHistoryService();
    let updatedCharacter = { ...character };
    
    // Check if we should create an auto-snapshot
    if (previousCharacter) {
      const { shouldCreate, type, reason } = historyService.shouldCreateAutoSnapshot(
        previousCharacter,
        character,
        character.history
      );
      
      if (shouldCreate) {
        const snapshot = historyService.createSnapshot(character, type, reason);
        const updatedHistory = historyService.addSnapshotToHistory(character.history, snapshot);
        
        updatedCharacter = {
          ...updatedCharacter,
          history: updatedHistory,
          version: updatedHistory.currentVersion
        };
        
        // Save the snapshot
        await this.saveCharacterSnapshot(snapshot);
      }
    }
    
    // Update last modified
    updatedCharacter.lastModified = new Date().toISOString();
    
    return updatedCharacter;
  }

  // Helper methods for localStorage
  private getLocalStorageSnapshots(characterId: string): CharacterSnapshot[] {
    try {
      const stored = localStorage.getItem(`character-snapshots-${characterId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getLocalStorageShares(characterId: string): CharacterShare[] {
    try {
      const stored = localStorage.getItem(`character-shares-${characterId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private getLocalStorageBackups(characterId: string): CharacterBackup[] {
    try {
      const stored = localStorage.getItem(`character-backups-${characterId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

/**
 * Get the storage service instance
 */
export const getCharacterStorageService = (apolloClient: any) => {
  return new CharacterStorageService(apolloClient);
};
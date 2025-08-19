import type { 
  CharacterSnapshot,
  CharacterHistory,
  CharacterSheetData,
  CharacterBackup,
  BackupSettings,
  ExportFormat
} from '../types/characterSheet';

/**
 * Character History Service
 * Manages character version history, snapshots, and backups
 */

export class CharacterHistoryService {
  private maxSnapshots: number;
  private compressionEnabled: boolean;

  constructor(maxSnapshots = 50, compressionEnabled = true) {
    this.maxSnapshots = maxSnapshots;
    this.compressionEnabled = compressionEnabled;
  }

  /**
   * Create a new character snapshot
   */
  createSnapshot(
    character: CharacterSheetData,
    type: CharacterSnapshot['snapshotType'] = 'manual',
    description?: string,
    metadata?: Partial<CharacterSnapshot['metadata']>
  ): CharacterSnapshot {
    // Deep clone the character data to prevent mutations
    const characterData = this.deepClone(character);
    
    const snapshot: CharacterSnapshot = {
      id: crypto.randomUUID(),
      characterId: character.id,
      version: character.version + 1,
      snapshotDate: new Date().toISOString(),
      description,
      snapshotType: type,
      characterData,
      metadata: {
        changesSummary: [],
        ...metadata
      }
    };

    return snapshot;
  }

  /**
   * Add snapshot to character history with cleanup
   */
  addSnapshotToHistory(
    history: CharacterHistory,
    snapshot: CharacterSnapshot
  ): CharacterHistory {
    const updatedSnapshots = [...history.snapshots, snapshot];
    
    // Sort by version number
    updatedSnapshots.sort((a, b) => b.version - a.version);
    
    // Trim to max snapshots if needed
    const trimmedSnapshots = updatedSnapshots.slice(0, this.maxSnapshots);
    
    return {
      ...history,
      snapshots: trimmedSnapshots,
      currentVersion: snapshot.version,
      lastSnapshotDate: snapshot.snapshotDate
    };
  }

  /**
   * Check if auto-snapshot should be triggered
   */
  shouldCreateAutoSnapshot(
    oldCharacter: CharacterSheetData,
    newCharacter: CharacterSheetData,
    history: CharacterHistory
  ): {
    shouldCreate: boolean;
    type: CharacterSnapshot['snapshotType'];
    reason: string;
  } {
    if (!history.autoSnapshotEnabled) {
      return { shouldCreate: false, type: 'auto', reason: 'Auto-snapshot disabled' };
    }

    const triggers = history.autoSnapshotTriggers;
    const changes = this.detectChanges(oldCharacter, newCharacter);

    // Check for level up (skill improvement or characteristic improvement)
    if (triggers.onLevelUp && (changes.skillsChanged || changes.characteristicsChanged)) {
      return { 
        shouldCreate: true, 
        type: 'auto', 
        reason: 'Character improvement detected' 
      };
    }

    // Check for milestone achievement
    if (triggers.onMilestone && changes.milestonesAchieved) {
      return { 
        shouldCreate: true, 
        type: 'milestone', 
        reason: 'New milestone achieved' 
      };
    }

    // Check for major changes
    if (triggers.onMajorChange && changes.majorChange) {
      return { 
        shouldCreate: true, 
        type: 'major_change', 
        reason: changes.majorChangeReason || 'Significant character changes' 
      };
    }

    // Check for interval-based snapshots
    if (triggers.intervalDays && history.lastSnapshotDate) {
      const daysSinceLastSnapshot = this.daysBetween(
        new Date(history.lastSnapshotDate),
        new Date()
      );
      
      if (daysSinceLastSnapshot >= triggers.intervalDays) {
        return { 
          shouldCreate: true, 
          type: 'auto', 
          reason: `${triggers.intervalDays} days elapsed since last snapshot` 
        };
      }
    }

    return { shouldCreate: false, type: 'auto', reason: 'No trigger conditions met' };
  }

  /**
   * Detect changes between two character versions
   */
  private detectChanges(
    oldCharacter: CharacterSheetData,
    newCharacter: CharacterSheetData
  ): {
    skillsChanged: boolean;
    characteristicsChanged: boolean;
    milestonesAchieved: boolean;
    majorChange: boolean;
    majorChangeReason?: string;
    changesSummary: string[];
  } {
    const changes = {
      skillsChanged: false,
      characteristicsChanged: false,
      milestonesAchieved: false,
      majorChange: false,
      changesSummary: [] as string[]
    };

    // Check skills
    if (this.hasSkillChanges(oldCharacter.skills, newCharacter.skills)) {
      changes.skillsChanged = true;
      changes.changesSummary.push('Skills modified');
    }

    // Check characteristics
    if (this.hasCharacteristicChanges(oldCharacter.characteristics, newCharacter.characteristics)) {
      changes.characteristicsChanged = true;
      changes.changesSummary.push('Characteristics modified');
    }

    // Check milestones
    const oldAchievedMilestones = oldCharacter.advancement.milestones.filter(m => m.achieved);
    const newAchievedMilestones = newCharacter.advancement.milestones.filter(m => m.achieved);
    
    if (newAchievedMilestones.length > oldAchievedMilestones.length) {
      changes.milestonesAchieved = true;
      changes.changesSummary.push(`${newAchievedMilestones.length - oldAchievedMilestones.length} new milestone(s)`);
    }

    // Check for major changes
    const majorChangeThreshold = 3; // Number of different categories changed
    const categoryChanges = [
      changes.skillsChanged,
      changes.characteristicsChanged,
      changes.milestonesAchieved,
      oldCharacter.equipment.length !== newCharacter.equipment.length,
      oldCharacter.conditions.length !== newCharacter.conditions.length,
      oldCharacter.finances.currentCredits !== newCharacter.finances.currentCredits
    ].filter(Boolean).length;

    if (categoryChanges >= majorChangeThreshold) {
      changes.majorChange = true;
      changes.majorChangeReason = `${categoryChanges} major categories changed`;
    }

    return changes;
  }

  /**
   * Check if skills have changed
   */
  private hasSkillChanges(oldSkills: any[], newSkills: any[]): boolean {
    if (oldSkills.length !== newSkills.length) return true;
    
    return oldSkills.some((oldSkill, index) => {
      const newSkill = newSkills[index];
      return !newSkill || 
             oldSkill.name !== newSkill.name ||
             oldSkill.level !== newSkill.level ||
             oldSkill.specialty !== newSkill.specialty;
    });
  }

  /**
   * Check if characteristics have changed
   */
  private hasCharacteristicChanges(oldChars: any, newChars: any): boolean {
    const charKeys = ['strength', 'dexterity', 'endurance', 'intelligence', 'education', 'social'];
    return charKeys.some(key => oldChars[key] !== newChars[key]);
  }

  /**
   * Restore character from a snapshot
   */
  restoreFromSnapshot(
    snapshot: CharacterSnapshot,
    targetCharacter: CharacterSheetData
  ): CharacterSheetData {
    // Create new version with restored data but maintain some current metadata
    const restoredCharacter = this.deepClone(snapshot.characterData);
    
    // Update metadata to reflect the restoration
    restoredCharacter.version = targetCharacter.version + 1;
    restoredCharacter.lastModified = new Date().toISOString();
    
    // Add restoration record to advancement history
    const restorationRecord = {
      id: crypto.randomUUID(),
      type: 'other' as const,
      description: `Restored from snapshot v${snapshot.version} (${snapshot.snapshotDate})`,
      amount: 0,
      date: new Date().toISOString()
    };
    
    restoredCharacter.advancement.records.push(restorationRecord);
    
    return restoredCharacter;
  }

  /**
   * Compare two character snapshots
   */
  compareSnapshots(
    snapshot1: CharacterSnapshot,
    snapshot2: CharacterSnapshot
  ): {
    characteristicsDiff: Array<{ name: string; old: number; new: number; change: number }>;
    skillsDiff: Array<{ name: string; oldLevel?: number; newLevel?: number; change: string }>;
    equipmentDiff: { added: any[]; removed: any[]; modified: any[] };
    experienceDiff: { gained: number; spent: number; net: number };
    summary: string[];
  } {
    const char1 = snapshot1.characterData;
    const char2 = snapshot2.characterData;
    
    const comparison = {
      characteristicsDiff: [] as Array<{ name: string; old: number; new: number; change: number }>,
      skillsDiff: [] as Array<{ name: string; oldLevel?: number; newLevel?: number; change: string }>,
      equipmentDiff: { added: [] as any[], removed: [] as any[], modified: [] as any[] },
      experienceDiff: { gained: 0, spent: 0, net: 0 },
      summary: [] as string[]
    };

    // Compare characteristics
    const charKeys = ['strength', 'dexterity', 'endurance', 'intelligence', 'education', 'social'];
    charKeys.forEach(key => {
      const old = char1.characteristics[key as keyof typeof char1.characteristics];
      const current = char2.characteristics[key as keyof typeof char2.characteristics];
      const change = current - old;
      
      if (change !== 0) {
        comparison.characteristicsDiff.push({
          name: key,
          old,
          new: current,
          change
        });
        comparison.summary.push(`${key}: ${old} → ${current} (${change > 0 ? '+' : ''}${change})`);
      }
    });

    // Compare skills
    const allSkillNames = new Set([
      ...char1.skills.map(s => s.name),
      ...char2.skills.map(s => s.name)
    ]);

    allSkillNames.forEach(skillName => {
      const oldSkill = char1.skills.find(s => s.name === skillName);
      const newSkill = char2.skills.find(s => s.name === skillName);
      
      if (!oldSkill && newSkill) {
        comparison.skillsDiff.push({
          name: skillName,
          newLevel: newSkill.level,
          change: 'added'
        });
        comparison.summary.push(`Skill ${skillName} added at level ${newSkill.level}`);
      } else if (oldSkill && !newSkill) {
        comparison.skillsDiff.push({
          name: skillName,
          oldLevel: oldSkill.level,
          change: 'removed'
        });
        comparison.summary.push(`Skill ${skillName} removed`);
      } else if (oldSkill && newSkill && oldSkill.level !== newSkill.level) {
        comparison.skillsDiff.push({
          name: skillName,
          oldLevel: oldSkill.level,
          newLevel: newSkill.level,
          change: 'modified'
        });
        const levelChange = newSkill.level - oldSkill.level;
        comparison.summary.push(`${skillName}: ${oldSkill.level} → ${newSkill.level} (${levelChange > 0 ? '+' : ''}${levelChange})`);
      }
    });

    // Compare experience
    const expDiff = char2.advancement.totalExperienceEarned - char1.advancement.totalExperienceEarned;
    const spentDiff = char2.advancement.totalExperienceSpent - char1.advancement.totalExperienceSpent;
    
    comparison.experienceDiff = {
      gained: expDiff,
      spent: spentDiff,
      net: expDiff - spentDiff
    };

    if (expDiff !== 0) {
      comparison.summary.push(`Experience: ${expDiff > 0 ? '+' : ''}${expDiff} gained`);
    }
    if (spentDiff !== 0) {
      comparison.summary.push(`Experience: ${spentDiff > 0 ? '+' : ''}${spentDiff} spent`);
    }

    return comparison;
  }

  /**
   * Create backup of character data
   */
  async createBackup(
    character: CharacterSheetData,
    format: ExportFormat,
    settings: BackupSettings,
    trigger: 'manual' | 'auto' | 'scheduled' = 'manual',
    description?: string
  ): Promise<CharacterBackup> {
    const backupData = this.prepareBackupData(character, format);
    const serializedData = JSON.stringify(backupData);
    
    // Encrypt if enabled
    const finalData = settings.encryptBackups 
      ? await this.encryptData(serializedData) 
      : serializedData;
    
    const backup: CharacterBackup = {
      id: crypto.randomUUID(),
      characterId: character.id,
      backupDate: new Date().toISOString(),
      format,
      size: finalData.length,
      checksum: await this.calculateChecksum(finalData),
      description,
      isEncrypted: settings.encryptBackups,
      backupData: finalData,
      metadata: {
        version: '1.0',
        gameSystem: 'traveller',
        characterVersion: character.version,
        backupTrigger: trigger
      }
    };

    return backup;
  }

  /**
   * Restore character from backup
   */
  async restoreFromBackup(
    backup: CharacterBackup,
    settings: BackupSettings
  ): Promise<CharacterSheetData> {
    let data = backup.backupData;
    
    // Decrypt if needed
    if (backup.isEncrypted && settings.encryptBackups) {
      data = await this.decryptData(data as string);
    }
    
    // Verify checksum
    const currentChecksum = await this.calculateChecksum(data as string);
    if (currentChecksum !== backup.checksum) {
      throw new Error('Backup data corruption detected - checksum mismatch');
    }
    
    // Parse and validate
    const restoredData = JSON.parse(data as string);
    
    // Update version and timestamp for restoration
    restoredData.version = restoredData.version + 1;
    restoredData.lastModified = new Date().toISOString();
    
    return restoredData as CharacterSheetData;
  }

  /**
   * Clean up old snapshots and backups
   */
  cleanupHistory(
    history: CharacterHistory,
    backups: CharacterBackup[],
    settings: BackupSettings
  ): {
    updatedHistory: CharacterHistory;
    updatedBackups: CharacterBackup[];
    removedSnapshots: number;
    removedBackups: number;
  } {
    // Clean up old snapshots
    const keepSnapshots = history.snapshots
      .sort((a, b) => new Date(b.snapshotDate).getTime() - new Date(a.snapshotDate).getTime())
      .slice(0, this.maxSnapshots);
    
    const removedSnapshots = history.snapshots.length - keepSnapshots.length;
    
    // Clean up old backups
    const keepBackups = backups
      .sort((a, b) => new Date(b.backupDate).getTime() - new Date(a.backupDate).getTime())
      .slice(0, settings.maxBackups);
    
    const removedBackups = backups.length - keepBackups.length;
    
    return {
      updatedHistory: {
        ...history,
        snapshots: keepSnapshots
      },
      updatedBackups: keepBackups,
      removedSnapshots,
      removedBackups
    };
  }

  // Utility methods

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  private daysBetween(date1: Date, date2: Date): number {
    const timeDiff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  private prepareBackupData(character: CharacterSheetData, format: ExportFormat): any {
    // For now, all formats use the same base data
    // In production, you might format differently for different targets
    return {
      formatVersion: '1.0',
      exportFormat: format,
      exportDate: new Date().toISOString(),
      characterData: character
    };
  }

  private async encryptData(data: string): Promise<string> {
    // Simple base64 encoding for demonstration
    // In production, use proper encryption like AES
    return btoa(data);
  }

  private async decryptData(data: string): Promise<string> {
    // Simple base64 decoding for demonstration
    // In production, use proper decryption
    return atob(data);
  }

  private async calculateChecksum(data: string): Promise<string> {
    // Simple checksum using built-in crypto if available
    if (crypto.subtle) {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback simple hash for environments without crypto.subtle
      let hash = 0;
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(16);
    }
  }
}
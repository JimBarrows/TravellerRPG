import type { 
  CharacterShare, 
  CharacterSharingSettings, 
  SharingPermissionLevel,
  CharacterSheetData,
  ExportFormat
} from '../types/characterSheet';

/**
 * Character Sharing Service
 * Handles character sharing, QR code generation, and access management
 */

export class CharacterSharingService {
  private baseUrl: string;

  constructor(baseUrl: string = window.location.origin) {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a shareable link for a character
   */
  async createShare(
    character: CharacterSheetData,
    settings: CharacterSharingSettings
  ): Promise<CharacterShare> {
    const shareToken = this.generateShareToken();
    const shareId = crypto.randomUUID();
    
    const share: CharacterShare = {
      id: shareId,
      characterId: character.id,
      shareToken,
      createdAt: new Date().toISOString(),
      expiresAt: settings.expirationDate,
      settings,
      accessLog: [],
      isActive: true
    };

    // Generate QR code URL
    const shareUrl = this.getShareUrl(shareToken);
    share.qrCodeUrl = await this.generateQRCode(shareUrl);

    return share;
  }

  /**
   * Generate a secure sharing token
   */
  private generateShareToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Get the full sharing URL
   */
  getShareUrl(shareToken: string): string {
    return `${this.baseUrl}/character/shared/${shareToken}`;
  }

  /**
   * Generate QR code for sharing URL
   */
  async generateQRCode(url: string): Promise<string> {
    // Simple QR code generation using a canvas approach
    // In a real implementation, you might use a library like qrcode.js
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = 200;
    
    canvas.width = size;
    canvas.height = size;
    
    if (!ctx) {
      throw new Error('Could not create canvas context for QR code');
    }
    
    // Simple placeholder QR code pattern
    // In production, use a proper QR code library
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = 'black';
    const moduleSize = size / 25;
    
    // Create a simple pattern that represents the URL
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        // Simple hash-based pattern for demonstration
        const hash = this.simpleHash(url + i + j);
        if (hash % 3 === 0) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }
    
    return canvas.toDataURL('image/png');
  }

  /**
   * Simple hash function for QR code pattern
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Filter character data based on permission level
   */
  filterCharacterDataByPermissions(
    character: CharacterSheetData,
    permissionLevel: SharingPermissionLevel,
    restrictedFields: string[] = []
  ): Partial<CharacterSheetData> {
    const filtered: any = {};

    switch (permissionLevel) {
      case 'view_basic':
        filtered.name = character.name;
        filtered.species = character.species;
        filtered.age = character.age;
        filtered.characteristics = character.characteristics;
        filtered.skills = character.skills.map(skill => ({
          name: skill.name,
          level: skill.level,
          specialty: skill.specialty
        }));
        break;

      case 'view_full':
        Object.assign(filtered, character);
        // Remove private notes
        filtered.notes = character.notes.filter(note => !note.isPrivate);
        break;

      case 'view_all':
        Object.assign(filtered, character);
        break;

      case 'edit_limited':
      case 'edit_full':
      case 'owner':
        Object.assign(filtered, character);
        break;

      default:
        throw new Error(`Unknown permission level: ${permissionLevel}`);
    }

    // Remove restricted fields
    restrictedFields.forEach(field => {
      delete filtered[field];
    });

    return filtered;
  }

  /**
   * Log access to a shared character
   */
  logAccess(
    share: CharacterShare,
    action: 'view' | 'download' | 'comment',
    request?: {
      ip?: string;
      userAgent?: string;
    }
  ): CharacterShare {
    const accessEntry = {
      timestamp: new Date().toISOString(),
      ipAddress: request?.ip,
      userAgent: request?.userAgent,
      action
    };

    const updatedShare = {
      ...share,
      accessLog: [...share.accessLog, accessEntry],
      settings: {
        ...share.settings,
        accessCount: (share.settings.accessCount || 0) + 1
      }
    };

    return updatedShare;
  }

  /**
   * Check if a share is still valid
   */
  isShareValid(share: CharacterShare): { valid: boolean; reason?: string } {
    if (!share.isActive) {
      return { valid: false, reason: 'Share has been deactivated' };
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return { valid: false, reason: 'Share has expired' };
    }

    if (share.settings.maxAccessCount && 
        (share.settings.accessCount || 0) >= share.settings.maxAccessCount) {
      return { valid: false, reason: 'Maximum access count reached' };
    }

    return { valid: true };
  }

  /**
   * Revoke a character share
   */
  revokeShare(share: CharacterShare): CharacterShare {
    return {
      ...share,
      isActive: false
    };
  }

  /**
   * Update sharing settings
   */
  updateSharingSettings(
    share: CharacterShare,
    newSettings: Partial<CharacterSharingSettings>
  ): CharacterShare {
    return {
      ...share,
      settings: {
        ...share.settings,
        ...newSettings
      }
    };
  }

  /**
   * Export character data in various formats
   */
  async exportCharacterData(
    character: Partial<CharacterSheetData>,
    format: ExportFormat
  ): Promise<{ data: string | Uint8Array; mimeType: string; filename: string }> {
    const timestamp = new Date().toISOString().split('T')[0];
    const baseName = `${character.name || 'character'}_${timestamp}`;

    switch (format) {
      case 'json':
        return {
          data: JSON.stringify(character, null, 2),
          mimeType: 'application/json',
          filename: `${baseName}.json`
        };

      case 'csv':
        const csvData = this.convertToCSV(character);
        return {
          data: csvData,
          mimeType: 'text/csv',
          filename: `${baseName}.csv`
        };

      case 'xml':
        const xmlData = this.convertToXML(character);
        return {
          data: xmlData,
          mimeType: 'application/xml',
          filename: `${baseName}.xml`
        };

      case 'pdf':
        // This would require a PDF generation library
        throw new Error('PDF export not yet implemented');

      case 'foundry':
        const foundryData = this.convertToFoundryVTT(character);
        return {
          data: JSON.stringify(foundryData, null, 2),
          mimeType: 'application/json',
          filename: `${baseName}_foundry.json`
        };

      case 'roll20':
        const roll20Data = this.convertToRoll20(character);
        return {
          data: JSON.stringify(roll20Data, null, 2),
          mimeType: 'application/json',
          filename: `${baseName}_roll20.json`
        };

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Convert character data to CSV format
   */
  private convertToCSV(character: Partial<CharacterSheetData>): string {
    const rows = [
      ['Field', 'Value'],
      ['Name', character.name || ''],
      ['Species', character.species || ''],
      ['Age', (character.age || 0).toString()],
      ['Gender', character.gender || '']
    ];

    // Add characteristics
    if (character.characteristics) {
      Object.entries(character.characteristics).forEach(([key, value]) => {
        rows.push([key.charAt(0).toUpperCase() + key.slice(1), value.toString()]);
      });
    }

    // Add skills
    if (character.skills) {
      character.skills.forEach(skill => {
        rows.push([`Skill: ${skill.name}`, `Level ${skill.level}${skill.specialty ? ` (${skill.specialty})` : ''}`]);
      });
    }

    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Convert character data to XML format
   */
  private convertToXML(character: Partial<CharacterSheetData>): string {
    const escape = (str: string) => str.replace(/[<>&"']/g, char => {
      const escapeChars: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;'
      };
      return escapeChars[char];
    });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<character>\n';
    
    xml += `  <name>${escape(character.name || '')}</name>\n`;
    xml += `  <species>${escape(character.species || '')}</species>\n`;
    xml += `  <age>${character.age || 0}</age>\n`;
    xml += `  <gender>${escape(character.gender || '')}</gender>\n`;

    if (character.characteristics) {
      xml += '  <characteristics>\n';
      Object.entries(character.characteristics).forEach(([key, value]) => {
        xml += `    <${key}>${value}</${key}>\n`;
      });
      xml += '  </characteristics>\n';
    }

    if (character.skills) {
      xml += '  <skills>\n';
      character.skills.forEach(skill => {
        xml += '    <skill>\n';
        xml += `      <name>${escape(skill.name)}</name>\n`;
        xml += `      <level>${skill.level}</level>\n`;
        if (skill.specialty) {
          xml += `      <specialty>${escape(skill.specialty)}</specialty>\n`;
        }
        xml += '    </skill>\n';
      });
      xml += '  </skills>\n';
    }

    xml += '</character>';
    return xml;
  }

  /**
   * Convert character data to Foundry VTT format
   */
  private convertToFoundryVTT(character: Partial<CharacterSheetData>): any {
    return {
      name: character.name,
      type: 'character',
      system: {
        characteristics: character.characteristics,
        skills: character.skills?.reduce((acc, skill) => {
          acc[skill.name.toLowerCase().replace(/\s+/g, '')] = {
            value: skill.level,
            specialty: skill.specialty || ''
          };
          return acc;
        }, {} as Record<string, any>),
        details: {
          species: character.species,
          age: character.age,
          gender: character.gender
        }
      }
    };
  }

  /**
   * Convert character data to Roll20 format
   */
  private convertToRoll20(character: Partial<CharacterSheetData>): any {
    const roll20Data: any = {
      schema_version: 1,
      type: 'character',
      name: character.name
    };

    if (character.characteristics) {
      Object.entries(character.characteristics).forEach(([key, value]) => {
        roll20Data[`${key}_score`] = value;
        roll20Data[`${key}_modifier`] = Math.floor((value - 6) / 3);
      });
    }

    if (character.skills) {
      character.skills.forEach((skill, index) => {
        roll20Data[`skill_${index}_name`] = skill.name;
        roll20Data[`skill_${index}_level`] = skill.level;
        roll20Data[`skill_${index}_specialty`] = skill.specialty || '';
      });
    }

    return roll20Data;
  }

  /**
   * Generate sharing analytics
   */
  generateSharingAnalytics(shares: CharacterShare[]): {
    totalShares: number;
    activeShares: number;
    totalAccess: number;
    accessByAction: Record<'view' | 'download' | 'comment', number>;
    popularShares: Array<{ shareId: string; accessCount: number; characterName?: string }>;
  } {
    const analytics = {
      totalShares: shares.length,
      activeShares: shares.filter(s => s.isActive).length,
      totalAccess: 0,
      accessByAction: { view: 0, download: 0, comment: 0 } as Record<'view' | 'download' | 'comment', number>,
      popularShares: [] as Array<{ shareId: string; accessCount: number; characterName?: string }>
    };

    shares.forEach(share => {
      const accessCount = share.settings.accessCount || 0;
      analytics.totalAccess += accessCount;

      share.accessLog.forEach(log => {
        analytics.accessByAction[log.action]++;
      });

      analytics.popularShares.push({
        shareId: share.id,
        accessCount,
        characterName: share.characterId // Would need to be resolved from character data
      });
    });

    analytics.popularShares.sort((a, b) => b.accessCount - a.accessCount);

    return analytics;
  }
}
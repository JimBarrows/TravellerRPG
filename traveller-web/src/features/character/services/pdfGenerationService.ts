import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { CharacterCreationData } from '../types/characterCreation';
import { getCharacteristicModifier, toUPP } from '../utils/diceRoller';
import { PDFGenerationError, handleAsyncError } from '../utils/errorHandling';

export type PDFLayout = 'compact' | 'detailed' | 'official' | 'printable';

interface PDFGenerationOptions {
  layout: PDFLayout;
  includePortrait: boolean;
  includeBackground: boolean;
  includeCareerHistory: boolean;
  includeEquipment: boolean;
  colorScheme: 'color' | 'grayscale' | 'print';
}

/**
 * PDF Generation Service for Traveller Character Sheets
 */
export class PDFGenerationService {
  private readonly pageWidth = 210; // A4 width in mm
  private readonly pageHeight = 297; // A4 height in mm
  private readonly margin = 15;
  private readonly contentWidth = this.pageWidth - (this.margin * 2);

  /**
   * Generate PDF character sheet
   */
  async generateCharacterSheet(
    character: CharacterCreationData,
    options: PDFGenerationOptions = {
      layout: 'detailed',
      includePortrait: true,
      includeBackground: true,
      includeCareerHistory: true,
      includeEquipment: true,
      colorScheme: 'color'
    }
  ): Promise<Blob> {
    try {
      // Validate character data
      if (!character) {
        throw new PDFGenerationError('Character data is required', options.layout);
      }

      if (!character.name?.trim()) {
        throw new PDFGenerationError('Character name is required for PDF generation', options.layout);
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      switch (options.layout) {
        case 'compact':
          await this.generateCompactLayout(pdf, character, options);
          break;
        case 'detailed':
          await this.generateDetailedLayout(pdf, character, options);
          break;
        case 'official':
          await this.generateOfficialLayout(pdf, character, options);
          break;
        case 'printable':
          await this.generatePrintableLayout(pdf, character, options);
          break;
        default:
          await this.generateDetailedLayout(pdf, character, options);
      }

      return pdf.output('blob');
    } catch (error) {
      if (error instanceof PDFGenerationError) {
        throw error;
      }
      throw new PDFGenerationError(
        `Failed to generate ${options.layout} PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        options.layout,
        { originalError: error }
      );
    }
  }

  /**
   * Generate and download PDF
   */
  async downloadCharacterSheet(
    character: CharacterCreationData,
    options?: PDFGenerationOptions
  ): Promise<void> {
    try {
      const blob = await this.generateCharacterSheet(character, options);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${character.name.replace(/\s+/g, '_')}_character_sheet.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw new Error('Failed to generate character sheet PDF');
    }
  }

  /**
   * Compact layout - single page with essential information
   */
  private async generateCompactLayout(
    pdf: jsPDF,
    character: CharacterCreationData,
    options: PDFGenerationOptions
  ): Promise<void> {
    let yPos = this.margin;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TRAVELLER CHARACTER SHEET', this.pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Character basic info
    pdf.setFontSize(16);
    pdf.text(character.name, this.pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const basicInfo = `${character.species} • ${character.gender} • Age ${character.age} • ${character.background.homeworld}`;
    pdf.text(basicInfo, this.pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // UPP and characteristics in a compact format
    const upp = toUPP(character.characteristics);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`UPP: ${upp}`, this.margin, yPos);
    yPos += 8;

    // Characteristics grid
    const charData = [
      ['STR', 'DEX', 'END', 'INT', 'EDU', 'SOC'],
      [
        character.characteristics.strength.toString(),
        character.characteristics.dexterity.toString(),
        character.characteristics.endurance.toString(),
        character.characteristics.intelligence.toString(),
        character.characteristics.education.toString(),
        character.characteristics.social.toString()
      ],
      [
        this.formatModifier(getCharacteristicModifier(character.characteristics.strength)),
        this.formatModifier(getCharacteristicModifier(character.characteristics.dexterity)),
        this.formatModifier(getCharacteristicModifier(character.characteristics.endurance)),
        this.formatModifier(getCharacteristicModifier(character.characteristics.intelligence)),
        this.formatModifier(getCharacteristicModifier(character.characteristics.education)),
        this.formatModifier(getCharacteristicModifier(character.characteristics.social))
      ]
    ];

    this.drawTable(pdf, this.margin, yPos, this.contentWidth, charData);
    yPos += 25;

    // Skills in compact format
    if (character.skills.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('SKILLS', this.margin, yPos);
      yPos += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      const skillsPerRow = 3;
      const skillText = character.skills.map(skill => `${skill.name}-${skill.level}`);
      
      for (let i = 0; i < skillText.length; i += skillsPerRow) {
        const rowSkills = skillText.slice(i, i + skillsPerRow);
        const skillRow = rowSkills.join(' • ');
        pdf.text(skillRow, this.margin, yPos);
        yPos += 4;
      }
    }

    yPos += 10;

    // Career summary
    if (character.careers.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('CAREER HISTORY', this.margin, yPos);
      yPos += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      character.careers.forEach(career => {
        const careerText = `${career.career} - ${career.rankTitle} (Rank ${career.rank})`;
        pdf.text(careerText, this.margin, yPos);
        yPos += 4;
      });
    }

    yPos += 10;

    // Equipment summary
    if (options.includeEquipment && character.equipment.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text('EQUIPMENT', this.margin, yPos);
      yPos += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      character.equipment.forEach(item => {
        const itemText = item.quantity > 1 ? `${item.name} x${item.quantity}` : item.name;
        pdf.text(itemText, this.margin, yPos);
        yPos += 4;
      });
    }

    // Credits
    yPos += 5;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(`Credits: ${character.startingCredits} Cr`, this.margin, yPos);
  }

  /**
   * Detailed layout - multi-page with comprehensive information
   */
  private async generateDetailedLayout(
    pdf: jsPDF,
    character: CharacterCreationData,
    options: PDFGenerationOptions
  ): Promise<void> {
    let yPos = this.margin;

    // Page 1: Basic Character Information
    this.addHeader(pdf, 'TRAVELLER CHARACTER SHEET', yPos);
    yPos += 15;

    // Character name and basic info
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(character.name, this.margin, yPos);
    yPos += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    
    const infoLines = [
      `Species: ${character.species}`,
      `Gender: ${character.gender}`,
      `Age: ${character.age}`,
      `Homeworld: ${character.background.homeworld}`,
      `Social Class: ${character.background.socialClass}`
    ];

    infoLines.forEach(line => {
      pdf.text(line, this.margin, yPos);
      yPos += 6;
    });

    yPos += 10;

    // UPP
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`UPP: ${toUPP(character.characteristics)}`, this.margin, yPos);
    yPos += 15;

    // Detailed characteristics table
    this.addCharacteristicsTable(pdf, character.characteristics, yPos);
    yPos += 60;

    // Skills section
    if (character.skills.length > 0) {
      this.addSkillsSection(pdf, character.skills, yPos);
      yPos += Math.max(50, character.skills.length * 6 + 20);
    }

    // Check if we need a new page
    if (yPos > this.pageHeight - 50) {
      pdf.addPage();
      yPos = this.margin;
    }

    // Career History
    if (options.includeCareerHistory && character.careers.length > 0) {
      this.addCareerHistorySection(pdf, character.careers, yPos);
      yPos += character.careers.length * 15 + 30;
    }

    // Background story
    if (options.includeBackground) {
      if (yPos > this.pageHeight - 80) {
        pdf.addPage();
        yPos = this.margin;
      }
      this.addBackgroundSection(pdf, character.background, yPos);
      yPos += 60;
    }

    // Equipment
    if (options.includeEquipment && character.equipment.length > 0) {
      if (yPos > this.pageHeight - 60) {
        pdf.addPage();
        yPos = this.margin;
      }
      this.addEquipmentSection(pdf, character.equipment, character.startingCredits, yPos);
    }
  }

  /**
   * Official layout - mimics the official Traveller character sheet
   */
  private async generateOfficialLayout(
    pdf: jsPDF,
    character: CharacterCreationData,
    options: PDFGenerationOptions
  ): Promise<void> {
    // This would implement the official Traveller character sheet layout
    // For now, use detailed layout as base
    await this.generateDetailedLayout(pdf, character, options);
  }

  /**
   * Printable layout - optimized for black and white printing
   */
  private async generatePrintableLayout(
    pdf: jsPDF,
    character: CharacterCreationData,
    options: PDFGenerationOptions
  ): Promise<void> {
    const printOptions = { ...options, colorScheme: 'print' as const };
    await this.generateDetailedLayout(pdf, character, printOptions);
  }

  /**
   * Helper Methods
   */
  private addHeader(pdf: jsPDF, title: string, yPos: number): void {
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, this.pageWidth / 2, yPos, { align: 'center' });
    
    // Add decorative line
    pdf.setLineWidth(0.5);
    pdf.line(this.margin, yPos + 3, this.pageWidth - this.margin, yPos + 3);
  }

  private addCharacteristicsTable(
    pdf: jsPDF,
    characteristics: CharacterCreationData['characteristics'],
    yPos: number
  ): void {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CHARACTERISTICS', this.margin, yPos);
    yPos += 8;

    const charData = [
      ['Characteristic', 'Value', 'Modifier'],
      ['Strength', characteristics.strength.toString(), this.formatModifier(getCharacteristicModifier(characteristics.strength))],
      ['Dexterity', characteristics.dexterity.toString(), this.formatModifier(getCharacteristicModifier(characteristics.dexterity))],
      ['Endurance', characteristics.endurance.toString(), this.formatModifier(getCharacteristicModifier(characteristics.endurance))],
      ['Intelligence', characteristics.intelligence.toString(), this.formatModifier(getCharacteristicModifier(characteristics.intelligence))],
      ['Education', characteristics.education.toString(), this.formatModifier(getCharacteristicModifier(characteristics.education))],
      ['Social Standing', characteristics.social.toString(), this.formatModifier(getCharacteristicModifier(characteristics.social))]
    ];

    this.drawTable(pdf, this.margin, yPos, this.contentWidth, charData);
  }

  private addSkillsSection(pdf: jsPDF, skills: CharacterCreationData['skills'], yPos: number): void {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SKILLS', this.margin, yPos);
    yPos += 8;

    const skillData = [['Skill', 'Level', 'Specialty']];
    
    skills.forEach(skill => {
      skillData.push([
        skill.name,
        skill.level.toString(),
        skill.specialty || '-'
      ]);
    });

    this.drawTable(pdf, this.margin, yPos, this.contentWidth, skillData);
  }

  private addCareerHistorySection(
    pdf: jsPDF,
    careers: CharacterCreationData['careers'],
    yPos: number
  ): void {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CAREER HISTORY', this.margin, yPos);
    yPos += 8;

    careers.forEach(career => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.text(`${career.career} - Term ${career.termNumber}`, this.margin, yPos);
      yPos += 5;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.text(`Rank: ${career.rankTitle} (${career.rank})`, this.margin + 5, yPos);
      yPos += 4;
      
      if (career.skillsGained.length > 0) {
        pdf.text(`Skills Gained: ${career.skillsGained.join(', ')}`, this.margin + 5, yPos);
        yPos += 4;
      }
      
      yPos += 3;
    });
  }

  private addBackgroundSection(
    pdf: jsPDF,
    background: CharacterCreationData['background'],
    yPos: number
  ): void {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BACKGROUND', this.margin, yPos);
    yPos += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    const backgroundInfo = [
      `Homeworld: ${background.homeworld}`,
      `Social Class: ${background.socialClass}`,
      `Upbringing: ${background.upbringing}`,
      `Family: ${background.family}`,
      `Early Life: ${background.earlyLife}`
    ];

    backgroundInfo.forEach(info => {
      pdf.text(info, this.margin, yPos);
      yPos += 5;
    });
  }

  private addEquipmentSection(
    pdf: jsPDF,
    equipment: CharacterCreationData['equipment'],
    credits: number,
    yPos: number
  ): void {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('EQUIPMENT', this.margin, yPos);
    yPos += 8;

    const equipmentData = [['Item', 'Quantity', 'Weight (kg)', 'Cost (Cr)']];
    
    equipment.forEach(item => {
      equipmentData.push([
        item.name,
        item.quantity.toString(),
        item.weight.toString(),
        (item.cost * item.quantity).toString()
      ]);
    });

    this.drawTable(pdf, this.margin, yPos, this.contentWidth, equipmentData);
    
    const tableHeight = equipmentData.length * 6;
    yPos += tableHeight + 10;

    pdf.setFont('helvetica', 'bold');
    pdf.text(`Remaining Credits: ${credits} Cr`, this.margin, yPos);
  }

  private drawTable(
    pdf: jsPDF,
    x: number,
    y: number,
    width: number,
    data: string[][]
  ): void {
    const rowHeight = 6;
    const colWidth = width / data[0].length;

    pdf.setFontSize(9);

    data.forEach((row, rowIndex) => {
      const isHeader = rowIndex === 0;
      
      if (isHeader) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFillColor(240, 240, 240);
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setFillColor(255, 255, 255);
      }

      // Draw row background
      pdf.rect(x, y + (rowIndex * rowHeight), width, rowHeight, 'F');
      
      // Draw cell borders
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(x, y + (rowIndex * rowHeight), width, rowHeight, 'D');

      // Draw cell content
      row.forEach((cell, colIndex) => {
        const cellX = x + (colIndex * colWidth) + 2;
        const cellY = y + (rowIndex * rowHeight) + 4;
        pdf.text(cell, cellX, cellY);
        
        // Draw vertical lines
        if (colIndex > 0) {
          pdf.line(
            x + (colIndex * colWidth),
            y + (rowIndex * rowHeight),
            x + (colIndex * colWidth),
            y + ((rowIndex + 1) * rowHeight)
          );
        }
      });
    });
  }

  private formatModifier(modifier: number): string {
    return modifier >= 0 ? `+${modifier}` : modifier.toString();
  }

  /**
   * Generate PDF from HTML element (for complex layouts)
   */
  async generateFromHTML(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Failed to generate PDF from HTML:', error);
      throw new Error('Failed to generate PDF from HTML element');
    }
  }
}

/**
 * Get the PDF generation service instance
 */
export const getPDFGenerationService = () => {
  return new PDFGenerationService();
};
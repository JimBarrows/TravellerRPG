import { useState } from 'react';
import type { WizardStepProps } from '../../../types/characterCreation';
import Button from '../../../../../shared/components/atoms/Button';
import Card from '../../../../../shared/components/molecules/Card';
import { getCharacteristicModifier, toUPP } from '../../../utils/diceRoller';
import { getPDFGenerationService, type PDFLayout } from '../../../services/pdfGenerationService';

const ReviewStep = ({ data }: WizardStepProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [selectedPDFLayout, setSelectedPDFLayout] = useState<PDFLayout>('detailed');
  const [showPDFOptions, setShowPDFOptions] = useState(false);
  
  const pdfService = getPDFGenerationService();

  const handleSaveCharacter = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would save to the database via GraphQL
      console.log('Saving character:', data);
      
      // Save to localStorage for now
      const characters = JSON.parse(localStorage.getItem('characters') || '[]');
      characters.push({ ...data, id: Date.now().toString(), createdAt: new Date().toISOString() });
      localStorage.setItem('characters', JSON.stringify(characters));
      
      // Clear draft
      localStorage.removeItem('character-draft');
      
      alert('Character saved successfully!');
    } catch (error) {
      console.error('Failed to save character:', error);
      alert('Failed to save character. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async (layout: PDFLayout = selectedPDFLayout) => {
    setIsGeneratingPDF(true);
    try {
      await pdfService.downloadCharacterSheet(data, {
        layout,
        includePortrait: true,
        includeBackground: true,
        includeCareerHistory: true,
        includeEquipment: true,
        colorScheme: 'color'
      });
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
      setShowPDFOptions(false);
    }
  };

  const handleQuickPDF = () => {
    handleGeneratePDF('compact');
  };

  const handleDetailedPDF = () => {
    handleGeneratePDF('detailed');
  };

  const handleCustomPDF = () => {
    setShowPDFOptions(!showPDFOptions);
  };

  const upp = toUPP(data.characteristics);
  const totalSkills = data.skills?.length || 0;
  const totalEquipment = data.equipment?.length || 0;
  const totalWeight = data.equipment?.reduce((sum: number, item: { weight: number; quantity: number }) => sum + (item.weight * item.quantity), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Character Review</h2>
        <p className="text-muted-foreground">
          Review your character details before finalizing.
        </p>
      </div>

      {/* Character Summary */}
      <Card>
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Portrait */}
            <div className="flex-shrink-0">
              {data.portrait || data.avatarSeed ? (
                <img
                  src={data.portrait || `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.avatarSeed}`}
                  alt="Character portrait"
                  className="w-32 h-32 rounded-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">No portrait</span>
                </div>
              )}
            </div>
            
            {/* Basic Info */}
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-1">{data.name}</h3>
              <p className="text-muted-foreground mb-4">
                {data.species} • {data.gender} • Age {data.age}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">UPP</div>
                  <div className="font-mono font-bold text-lg">{upp}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Homeworld</div>
                  <div className="font-medium">{data.background.homeworld}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Social Class</div>
                  <div className="font-medium">{data.background.socialClass}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Characteristics */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-4">Characteristics</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(data.characteristics).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-xs text-muted-foreground uppercase">{key.slice(0, 3)}</div>
                <div className="text-2xl font-bold">{value as number}</div>
                <div className="text-sm font-mono">
                  {getCharacteristicModifier(value as number) >= 0 ? '+' : ''}
                  {getCharacteristicModifier(value as number)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Career History */}
      {data.careers.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-4">Career History</h3>
            <div className="space-y-2">
              {data.careers.map((career, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <div>
                    <span className="font-medium">{career.career}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      {career.rankTitle} (Rank {career.rank})
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {career.skillsGained.length} skills gained
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t text-sm">
              <span className="text-muted-foreground">Total Terms Served:</span>{' '}
              <span className="font-medium">{data.totalTerms}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-4">Skills ({totalSkills})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {data.skills.map((skill: { name: string; level: number }, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="font-mono font-bold">{skill.level}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Equipment */}
      {data.equipment.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-4">Equipment ({totalEquipment} items, {totalWeight.toFixed(1)}kg)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {data.equipment.map((item, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <span className="text-sm">
                    {item.name} {item.quantity > 1 && `x${item.quantity}`}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {item.cost * item.quantity} Cr
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Remaining Credits:</span>
                <span className="font-medium">{data.startingCredits} Cr</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Background Story */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-4">Background Story</h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Homeworld:</span>{' '}
              <span>{data.background.homeworld}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Upbringing:</span>{' '}
              <span>{data.background.upbringing}</span>
            </div>
            {data.background.family && (
              <div>
                <span className="text-muted-foreground">Family:</span>{' '}
                <span>{data.background.family}</span>
              </div>
            )}
            {data.background.earlyLife && (
              <div>
                <span className="text-muted-foreground">Early Life Event:</span>{' '}
                <span>{data.background.earlyLife}</span>
              </div>
            )}
            {data.careers.map((career) => 
              career.events?.map((event, idx: number) => (
                <div key={`${career.career}-${idx}`}>
                  <span className="text-muted-foreground">{career.career} Event:</span>{' '}
                  <span>{event.description}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Actions */}
      <Card className="bg-primary/5 border-primary">
        <div className="p-6">
          <h3 className="font-semibold mb-4">Finalize Character</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Save your character to the database and generate professional PDF character sheets.
          </p>
          
          <div className="space-y-4">
            {/* Save Character */}
            <div>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveCharacter}
                disabled={isSaving}
                loading={isSaving}
                className="w-full sm:w-auto"
              >
                Save Character
              </Button>
            </div>

            {/* PDF Generation Options */}
            <div>
              <h4 className="font-medium mb-3">Download Character Sheet</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleQuickPDF}
                  disabled={isGeneratingPDF}
                  loading={isGeneratingPDF && selectedPDFLayout === 'compact'}
                  size="sm"
                >
                  Quick PDF (1 page)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDetailedPDF}
                  disabled={isGeneratingPDF}
                  loading={isGeneratingPDF && selectedPDFLayout === 'detailed'}
                  size="sm"
                >
                  Detailed PDF
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCustomPDF}
                  disabled={isGeneratingPDF}
                  size="sm"
                >
                  Custom Options
                </Button>
              </div>

              {/* Custom PDF Options */}
              {showPDFOptions && (
                <Card className="p-4 bg-background">
                  <h5 className="font-medium mb-3">PDF Layout Options</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Layout Style</label>
                      <select
                        value={selectedPDFLayout}
                        onChange={(e) => setSelectedPDFLayout(e.target.value as PDFLayout)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="compact">Compact (1 page, essential info)</option>
                        <option value="detailed">Detailed (multi-page, comprehensive)</option>
                        <option value="official">Official (classic Traveller layout)</option>
                        <option value="printable">Print-friendly (black & white)</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => handleGeneratePDF()}
                        disabled={isGeneratingPDF}
                        loading={isGeneratingPDF}
                        size="sm"
                      >
                        Generate PDF
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPDFOptions(false)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                PDF generation includes characteristics, skills, equipment, and career history.
                {selectedPDFLayout === 'compact' && ' Compact layout fits everything on one page.'}
                {selectedPDFLayout === 'detailed' && ' Detailed layout provides comprehensive character information.'}
                {selectedPDFLayout === 'official' && ' Official layout mimics the classic Traveller character sheet.'}
                {selectedPDFLayout === 'printable' && ' Print-friendly layout optimized for black and white printing.'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReviewStep;

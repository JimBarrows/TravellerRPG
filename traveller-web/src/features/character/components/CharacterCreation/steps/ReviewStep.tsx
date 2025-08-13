import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import type { WizardStepProps } from '../../../types/characterCreation';
import Button from '../../../../../shared/components/atoms/Button';
import Card from '../../../../../shared/components/molecules/Card';
import { getCharacteristicModifier, toUPP } from '../../../utils/diceRoller';

const ReviewStep = ({ data }: WizardStepProps) => {
  const { handleSubmit } = useFormContext();
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // In a real app, this would generate a PDF using a library like jsPDF
      console.log('Generating PDF for character:', data);
      
      // For now, we'll create a simple text representation
      const characterSheet = `
TRAVELLER CHARACTER SHEET
=========================

BASIC INFORMATION
-----------------
Name: ${data.name}
Species: ${data.species}
Gender: ${data.gender}
Age: ${data.age}

CHARACTERISTICS
---------------
STR: ${data.characteristics.strength} (${getCharacteristicModifier(data.characteristics.strength) >= 0 ? '+' : ''}${getCharacteristicModifier(data.characteristics.strength)})
DEX: ${data.characteristics.dexterity} (${getCharacteristicModifier(data.characteristics.dexterity) >= 0 ? '+' : ''}${getCharacteristicModifier(data.characteristics.dexterity)})
END: ${data.characteristics.endurance} (${getCharacteristicModifier(data.characteristics.endurance) >= 0 ? '+' : ''}${getCharacteristicModifier(data.characteristics.endurance)})
INT: ${data.characteristics.intelligence} (${getCharacteristicModifier(data.characteristics.intelligence) >= 0 ? '+' : ''}${getCharacteristicModifier(data.characteristics.intelligence)})
EDU: ${data.characteristics.education} (${getCharacteristicModifier(data.characteristics.education) >= 0 ? '+' : ''}${getCharacteristicModifier(data.characteristics.education)})
SOC: ${data.characteristics.social} (${getCharacteristicModifier(data.characteristics.social) >= 0 ? '+' : ''}${getCharacteristicModifier(data.characteristics.social)})

UPP: ${toUPP(data.characteristics)}

BACKGROUND
----------
Homeworld: ${data.background.homeworld}
Social Class: ${data.background.socialClass}
Upbringing: ${data.background.upbringing}
Family: ${data.background.family}
Early Life: ${data.background.earlyLife}

CAREER HISTORY
--------------
${data.careers.map((career: any) => `${career.career} - Rank ${career.rank}`).join('\n')}
Total Terms: ${data.totalTerms}

SKILLS
------
${data.skills.map((skill: any) => `${skill.name}-${skill.level}`).join('\n')}

EQUIPMENT
---------
${data.equipment.map((item: any) => `${item.name} x${item.quantity}`).join('\n')}

Credits: ${data.startingCredits} Cr
`;
      
      // Create a blob and download it
      const blob = new Blob([characterSheet], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.name.replace(/\s+/g, '_')}_character_sheet.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const upp = toUPP(data.characteristics);
  const totalSkills = data.skills?.length || 0;
  const totalEquipment = data.equipment?.length || 0;
  const totalWeight = data.equipment?.reduce((sum: number, item: any) => sum + (item.weight * item.quantity), 0) || 0;

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
              {data.careers.map((career: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                  <div>
                    <span className="font-medium">{career.career}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Rank {career.rank}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {career.skills.length} skills gained
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
              {data.skills.map((skill: any, index: number) => (
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
              {data.equipment.map((item: any, index: number) => (
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
            {data.careers.map((career: any) => 
              career.events?.map((event: string, idx: number) => (
                <div key={`${career.career}-${idx}`}>
                  <span className="text-muted-foreground">{career.career} Event:</span>{' '}
                  <span>{event}</span>
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
            Save your character to the database and optionally generate a PDF character sheet.
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveCharacter}
              disabled={isSaving}
              loading={isSaving}
            >
              Save Character
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              loading={isGeneratingPDF}
            >
              Download Character Sheet
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReviewStep;

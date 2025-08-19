import { useState, useCallback } from 'react';
import type { CharacterSheetSectionProps } from '../../../types/characterSheet';
import { 
  characterBasicsSchema
} from '../../../validation/schemas';
import { EditableText, EditableNumber } from '../../EditableFields';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';
import Button from '../../../../../shared/components/atoms/Button';
import ValidationFeedback from '../../Feedback/ValidationFeedback';
import FormErrorBoundary from '../../ErrorBoundary/FormErrorBoundary';
import CharacteristicsDisplay from './CharacteristicsDisplay';

const CharacterBasics = ({ character, onUpdate, readonly }: CharacterSheetSectionProps) => {
  const [validationErrors, setValidationErrors] = useState<Array<{field: string, messages: string[]}>>([]);
  
  // Handle field updates with validation
  const handleFieldUpdate = useCallback((field: string, value: any) => {
    onUpdate({ [field]: value });
  }, [onUpdate]);

  // Handle validation feedback
  const handleValidation = useCallback((field: string, isValid: boolean, errors: string[]) => {
    setValidationErrors(prev => {
      const filtered = prev.filter(error => error.field !== field);
      if (!isValid && errors.length > 0) {
        filtered.push({ field, messages: errors });
      }
      return filtered;
    });
  }, []);
  
  return (
    <FormErrorBoundary>
      <div className="space-y-6">
        {/* Validation Feedback */}
        {validationErrors.length > 0 && (
          <ValidationFeedback
            errors={validationErrors}
            showFieldNames
            onDismiss={(field) => setValidationErrors(prev => prev.filter(e => e.field !== field))}
            onDismissAll={() => setValidationErrors([])}
          />
        )}
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            {!readonly && (
              <div className="text-xs text-muted-foreground">
                Changes save automatically
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Portrait/Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center border-4 border-border">
                {character.portrait ? (
                  <img
                    src={character.portrait}
                    alt={`${character.name} portrait`}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="text-4xl text-muted-foreground">
                    {character.name ? character.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              
              {!readonly && (
                <Button variant="outline" size="sm">
                  Change Portrait
                </Button>
              )}
            </div>
            
            {/* Basic Details */}
            <div className="space-y-4">
              <div className="space-y-4">
                <EditableText
                  label="Name"
                  value={character.name}
                  onChange={(value) => handleFieldUpdate('name', value)}
                  onValidation={(isValid, errors) => handleValidation('name', isValid, errors)}
                  validation={characterBasicsSchema.shape.name}
                  placeholder="Character name"
                  readonly={readonly}
                  required
                  maxLength={100}
                />
                
                <EditableNumber
                  label="Age"
                  value={character.age}
                  onChange={(value) => handleFieldUpdate('age', value)}
                  onValidation={(isValid, errors) => handleValidation('age', isValid, errors)}
                  validation={characterBasicsSchema.shape.age}
                  readonly={readonly}
                  required
                  min={18}
                  max={120}
                  showSteppers
                />
                
                <EditableText
                  label="Gender"
                  value={character.gender}
                  onChange={(value) => handleFieldUpdate('gender', value)}
                  onValidation={(isValid, errors) => handleValidation('gender', isValid, errors)}
                  validation={characterBasicsSchema.shape.gender}
                  placeholder="Gender"
                  readonly={readonly}
                  required
                  maxLength={50}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Enhanced Characteristics Display */}
      <CharacteristicsDisplay
        character={character}
        onUpdate={onUpdate}
        readonly={readonly}
        showAdvancedFeatures={true}
        allowCharacteristicEditing={true}
      />
      
      {/* Career Summary */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Career History</h2>
          <p className="text-sm text-muted-foreground">
            Professional background and service record
          </p>
        </CardHeader>
        
        <CardContent>
          {character.careers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-lg font-medium mb-2">No Career History</div>
              <div className="text-sm">This character has no recorded career history</div>
            </div>
          ) : (
            <div className="space-y-4">
              {character.careers.map((career, index) => (
                <div
                  key={`${career.career}-${career.termNumber}`}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border"
                >
                  <div>
                    <div className="font-medium">
                      {career.career}
                      {career.branch && ` (${career.branch})`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Term {career.termNumber} • {career.rankTitle}
                      {career.rank > 0 && ` (Rank ${career.rank})`}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {career.skillsGained.length} skills gained
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cr{career.cashReceived.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Career Summary */}
              <div className="pt-4 border-t border-border">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Terms</div>
                    <div className="text-lg font-bold">{character.careers.length}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Final Age</div>
                    <div className="text-lg font-bold">{character.age}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Cash</div>
                    <div className="text-lg font-bold">
                      Cr{character.careers.reduce((sum, career) => sum + career.cashReceived, 0).toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Life Events</div>
                    <div className="text-lg font-bold">{character.lifeEvents.length}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </FormErrorBoundary>
  );
};

export default CharacterBasics;

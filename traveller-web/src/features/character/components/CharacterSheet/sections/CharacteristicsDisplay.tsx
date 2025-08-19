import { useState, useCallback, useMemo } from 'react';
import type { CharacterSheetSectionProps } from '../../../types/characterSheet';
import type { CharacterCharacteristics } from '../../../types/characterCreation';
import type { CharacteristicModifier } from '../../../types/characterSheet';
import {
  getCharacteristicModifier,
  getCharacteristicAbbreviation,
  toUPP,
  getCharacteristicColorClass,
  getModifierColorClass,
  getCharacteristicDescription,
  calculateEffectiveCharacteristic,
  isCharacteristicSuperhuman,
  getCharacteristicRangeDescription,
  canImproveCharacteristic,
} from '../../../types/characterSheet';
import { 
  characteristicValueSchema
} from '../../../validation/schemas';
import { EditableNumber } from '../../EditableFields';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';
import Button from '../../../../../shared/components/atoms/Button';
import ValidationFeedback from '../../Feedback/ValidationFeedback';
import FormErrorBoundary from '../../ErrorBoundary/FormErrorBoundary';
import UPPDisplay from '../components/UPPDisplay';
import { useCharacteristicsWithConditions, useVitalityChecks } from '../../../hooks';

interface CharacteristicsDisplayProps extends CharacterSheetSectionProps {
  showAdvancedFeatures?: boolean;
  allowCharacteristicEditing?: boolean;
}

const CharacteristicsDisplay = ({ 
  character, 
  onUpdate, 
  readonly,
  showAdvancedFeatures = false,
  allowCharacteristicEditing = false
}: CharacteristicsDisplayProps) => {
  const [validationErrors, setValidationErrors] = useState<Array<{field: string, messages: string[]}>>([]);
  const [isEditingCharacteristics, setIsEditingCharacteristics] = useState(false);
  const [selectedCharacteristic, setSelectedCharacteristic] = useState<keyof CharacterCharacteristics | null>(null);
  const [showConditionEffects, setShowConditionEffects] = useState(false);

  // Get characteristics with condition effects applied
  const { 
    effectiveCharacteristics, 
    getEffectiveValue, 
    getConditionPenalty, 
    getCharacteristicStatus 
  } = useCharacteristicsWithConditions(character.characteristics, character.conditions || []);

  // Get vitality checks
  const vitalityChecks = useVitalityChecks(effectiveCharacteristics);
  
  // Handle field updates with validation
  const handleCharacteristicUpdate = useCallback((characteristic: keyof CharacterCharacteristics, value: number) => {
    const newCharacteristics = {
      ...character.characteristics,
      [characteristic]: value
    };
    onUpdate({ characteristics: newCharacteristics });
  }, [character.characteristics, onUpdate]);

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
  
  // Calculate derived values
  const characteristics = character.characteristics;
  const derivedStats = useMemo(() => {
    const totalCharacteristicPoints = Object.values(characteristics).reduce((sum, val) => sum + val, 0);
    const averageCharacteristic = totalCharacteristicPoints / 6;
    const totalModifiers = Object.values(characteristics).reduce((sum, val) => sum + getCharacteristicModifier(val), 0);
    const upp = toUPP(characteristics);
    
    return {
      totalCharacteristicPoints,
      averageCharacteristic,
      totalModifiers,
      upp
    };
  }, [characteristics]);

  // Mock function to get modifiers (in real implementation this would come from character data)
  const getCharacteristicModifiers = (characteristic: keyof CharacterCharacteristics): CharacteristicModifier[] => {
    // This would normally come from character.characteristicsExtended?.modifiers[characteristic] || []
    return [];
  };

  const characteristicEntries = Object.entries(characteristics) as [keyof CharacterCharacteristics, number][];

  // Handle characteristic improvement (placeholder)
  const handleImproveCharacteristic = (characteristic: keyof CharacterCharacteristics) => {
    // This would integrate with experience point system
    console.log(`Attempting to improve ${characteristic}`);
  };

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

        {/* Main Characteristics Display */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Characteristics</h2>
                <p className="text-sm text-muted-foreground">
                  Core attributes that define your character's capabilities
                </p>
              </div>
              <div className="flex gap-2">
                {showAdvancedFeatures && !readonly && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCharacteristic(selectedCharacteristic ? null : 'strength')}
                  >
                    {selectedCharacteristic ? 'Hide Details' : 'Show Details'}
                  </Button>
                )}
                {allowCharacteristicEditing && !readonly && (
                  <Button
                    variant={isEditingCharacteristics ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setIsEditingCharacteristics(!isEditingCharacteristics)}
                  >
                    {isEditingCharacteristics ? 'Done' : 'Edit'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Characteristics Grid */}
            {/* Vitality Warnings */}
            {vitalityChecks.needsImmediateAttention && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-red-800">
                  <span className="text-lg">🚨</span>
                  <div>
                    <div className="font-medium">Critical Health Alert</div>
                    <div className="text-sm">
                      {vitalityChecks.isDead && 'Character has died from characteristic damage!'}
                      {vitalityChecks.isUnconscious && !vitalityChecks.isDead && 'Character is unconscious!'}
                      {!vitalityChecks.isUnconscious && !vitalityChecks.isDead && 'Imminent unconsciousness/death risk!'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Condition Effects Toggle */}
            {(character.conditions?.length || 0) > 0 && (
              <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">
                  {character.conditions?.length} condition{(character.conditions?.length || 0) !== 1 ? 's' : ''} affecting characteristics
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConditionEffects(!showConditionEffects)}
                >
                  {showConditionEffects ? 'Hide' : 'Show'} Effects
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {characteristicEntries.map(([name, value]) => {
                const effectiveValue = getEffectiveValue(name);
                const conditionPenalty = getConditionPenalty(name);
                const characteristicStatus = getCharacteristicStatus(name);
                const modifier = getCharacteristicModifier(effectiveValue);
                const abbreviation = getCharacteristicAbbreviation(name);
                const isSuperhuman = isCharacteristicSuperhuman(effectiveValue);
                const rangeDescription = getCharacteristicRangeDescription(effectiveValue);
                const improvementCheck = canImproveCharacteristic(name, effectiveValue, character.age);
                
                // Determine card styling based on status
                let cardClassName = 'bg-muted/50 rounded-lg p-4 text-center border transition-colors cursor-pointer';
                if (selectedCharacteristic === name) cardClassName += ' ring-2 ring-primary';
                if (isSuperhuman) cardClassName += ' border-purple-300 bg-purple-50/20';
                
                switch (characteristicStatus.status) {
                  case 'dead':
                    cardClassName += ' border-red-800 bg-red-100';
                    break;
                  case 'unconscious':
                    cardClassName += ' border-red-600 bg-red-50';
                    break;
                  case 'critical':
                    cardClassName += ' border-orange-500 bg-orange-50';
                    break;
                  case 'low':
                    cardClassName += ' border-yellow-400 bg-yellow-50';
                    break;
                  default:
                    cardClassName += ' border-border hover:border-primary/50';
                }
                
                return (
                  <div
                    key={name}
                    className={cardClassName}
                    onClick={() => setSelectedCharacteristic(selectedCharacteristic === name ? null : name)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedCharacteristic(selectedCharacteristic === name ? null : name);
                      }
                    }}
                    aria-label={`${name} characteristic: ${effectiveValue}, ${rangeDescription}, modifier ${modifier >= 0 ? '+' : ''}${modifier}`}
                  >
                    {/* Characteristic Header */}
                    <div className="text-xs font-medium text-muted-foreground uppercase mb-1">
                      {abbreviation}
                      {isSuperhuman && (
                        <span className="ml-1 text-purple-600" title="Superhuman level">★</span>
                      )}
                      {characteristicStatus.status === 'dead' && (
                        <span className="ml-1 text-red-800" title="Dead">💀</span>
                      )}
                      {characteristicStatus.status === 'unconscious' && (
                        <span className="ml-1 text-red-600" title="Unconscious">😵</span>
                      )}
                      {characteristicStatus.status === 'critical' && (
                        <span className="ml-1 text-orange-600" title="Critical">⚠️</span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-muted-foreground mb-2 capitalize">
                      {name}
                    </div>
                    
                    {/* Value Display or Editor */}
                    {isEditingCharacteristics && allowCharacteristicEditing && !readonly ? (
                      <div className="space-y-2">
                        <EditableNumber
                          value={value}
                          onChange={(newValue) => handleCharacteristicUpdate(name, newValue)}
                          onValidation={(isValid, errors) => handleValidation(`characteristics.${name}`, isValid, errors)}
                          validation={characteristicValueSchema}
                          min={0}
                          max={25}
                          showSteppers
                          className="w-20 mx-auto text-center"
                          aria-label={`Edit ${name} characteristic`}
                        />
                        {value !== effectiveValue && (
                          <div className="text-xs text-muted-foreground">
                            Effective: {effectiveValue}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Base Value */}
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="text-lg text-muted-foreground">{value}</span>
                          {conditionPenalty !== 0 && (
                            <>
                              <span className="text-sm text-muted-foreground">→</span>
                              <span className={`text-2xl font-bold ${getCharacteristicColorClass(effectiveValue)}`}>
                                {effectiveValue}
                              </span>
                            </>
                          )}
                          {conditionPenalty === 0 && (
                            <span className={`text-2xl font-bold ${getCharacteristicColorClass(effectiveValue)}`}>
                              {effectiveValue}
                            </span>
                          )}
                        </div>
                        
                        {/* Condition Effects */}
                        {conditionPenalty !== 0 && (
                          <div className={`text-xs px-2 py-1 rounded mb-1 ${
                            conditionPenalty < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            Conditions: {conditionPenalty >= 0 ? '+' : ''}{conditionPenalty}
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Modifier Display */}
                    <div className={`text-sm font-medium ${getModifierColorClass(modifier)}`}>
                      {modifier >= 0 ? '+' : ''}{modifier}
                    </div>
                    
                    {/* Range Description */}
                    <div className="text-xs text-muted-foreground mt-1">
                      {rangeDescription}
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-background rounded-full h-2 mt-3">
                      <div
                        className={`
                          h-2 rounded-full transition-all duration-300
                          ${isSuperhuman ? 'bg-purple-500' : 'bg-primary'}
                        `}
                        style={{ width: `${Math.min((effectiveValue / 15) * 100, 100)}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    
                    {/* Modifier Indicators */}
                    {modifiers.length > 0 && (
                      <div className="flex justify-center mt-2 space-x-1">
                        {modifiers.slice(0, 3).map((mod, index) => (
                          <div
                            key={mod.id}
                            className={`
                              w-2 h-2 rounded-full
                              ${mod.type === 'enhancement' ? 'bg-green-400' : 'bg-red-400'}
                            `}
                            title={mod.description}
                          />
                        ))}
                        {modifiers.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{modifiers.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Detailed Information Panel */}
            {selectedCharacteristic && showAdvancedFeatures && (
              <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                <h3 className="text-lg font-semibold mb-2 capitalize">
                  {selectedCharacteristic} Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-2">
                      {getCharacteristicDescription(selectedCharacteristic)}
                    </p>
                    
                    <div className="space-y-1">
                      <div>
                        <span className="font-medium">Base Value:</span> {characteristics[selectedCharacteristic]}
                      </div>
                      <div>
                        <span className="font-medium">Effective Value:</span> {
                          calculateEffectiveCharacteristic(
                            characteristics[selectedCharacteristic], 
                            getCharacteristicModifiers(selectedCharacteristic)
                          )
                        }
                      </div>
                      <div>
                        <span className="font-medium">Dice Modifier:</span> {
                          getCharacteristicModifier(
                            calculateEffectiveCharacteristic(
                              characteristics[selectedCharacteristic], 
                              getCharacteristicModifiers(selectedCharacteristic)
                            )
                          )
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {/* Improvement Information */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Improvement</h4>
                      {canImproveCharacteristic(selectedCharacteristic, characteristics[selectedCharacteristic], character.age).canImprove ? (
                        <div>
                          <p className="text-green-600 text-sm mb-2">Can be improved</p>
                          {!readonly && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleImproveCharacteristic(selectedCharacteristic)}
                            >
                              Spend XP to Improve
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-red-600 text-sm">
                          {canImproveCharacteristic(selectedCharacteristic, characteristics[selectedCharacteristic], character.age).reason}
                        </p>
                      )}
                    </div>
                    
                    {/* Active Modifiers */}
                    {getCharacteristicModifiers(selectedCharacteristic).length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Active Modifiers</h4>
                        <div className="space-y-1">
                          {getCharacteristicModifiers(selectedCharacteristic).map((modifier) => (
                            <div key={modifier.id} className="text-sm">
                              <span className={`font-medium ${modifier.type === 'enhancement' ? 'text-green-600' : 'text-red-600'}`}>
                                {modifier.type === 'enhancement' ? '+' : '-'}{modifier.value}
                              </span>
                              <span className="ml-2 text-muted-foreground">
                                {modifier.description} ({modifier.source})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Total Points</div>
                <div className="text-xl font-bold">{derivedStats.totalCharacteristicPoints}</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Average</div>
                <div className="text-xl font-bold">{derivedStats.averageCharacteristic.toFixed(1)}</div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">UPP</div>
                <UPPDisplay 
                  characteristics={characteristics}
                  showBreakdown={true}
                  size="md"
                />
              </div>
              
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Total DM</div>
                <div className={`text-xl font-bold ${getModifierColorClass(derivedStats.totalModifiers)}`}>
                  {derivedStats.totalModifiers >= 0 ? '+' : ''}{derivedStats.totalModifiers}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </FormErrorBoundary>
  );
};

export default CharacteristicsDisplay;
import { useState } from 'react';
import type { CharacterSheetSectionProps } from '../../../types/characterSheet';
import type { CharacterCharacteristics } from '../../../types/characterCreation';
import type { CharacteristicModifier } from '../../../types/characterSheet';
import {
  getCharacteristicModifier,
  getCharacteristicColorClass,
  getModifierColorClass,
  canImproveCharacteristic,
} from '../../../types/characterSheet';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';
import Button from '../../../../../shared/components/atoms/Button';
import FormErrorBoundary from '../../ErrorBoundary/FormErrorBoundary';

interface CharacteristicsAdvancedProps extends CharacterSheetSectionProps {
  onImproveCharacteristic?: (characteristic: keyof CharacterCharacteristics, cost: number) => void;
  onAddModifier?: (characteristic: keyof CharacterCharacteristics, modifier: CharacteristicModifier) => void;
  onRemoveModifier?: (modifierId: string) => void;
  availableExperience?: number;
}

const CharacteristicsAdvanced = ({ 
  character, 
  onUpdate, 
  readonly,
  onImproveCharacteristic,
  onAddModifier,
  onRemoveModifier,
  availableExperience = 0
}: CharacteristicsAdvancedProps) => {
  const [selectedTab, setSelectedTab] = useState<'modifiers' | 'aging' | 'improvement'>('modifiers');
  
  const characteristics = character.characteristics;
  
  // Mock function to get modifiers (in real implementation this would come from character data)
  const getCharacteristicModifiers = (characteristic: keyof CharacterCharacteristics): CharacteristicModifier[] => {
    // This would normally come from character.characteristicsExtended?.modifiers[characteristic] || []
    return [];
  };

  const getAllModifiers = (): CharacteristicModifier[] => {
    const allModifiers: CharacteristicModifier[] = [];
    Object.keys(characteristics).forEach(char => {
      const modifiers = getCharacteristicModifiers(char as keyof CharacterCharacteristics);
      allModifiers.push(...modifiers);
    });
    return allModifiers;
  };

  // Calculate improvement costs (standard Traveller rules: current value * 5 XP)
  const getImprovementCost = (currentValue: number): number => {
    return currentValue * 5;
  };

  // Calculate aging effects (physical characteristics decline with age)
  const getAgingEffects = () => {
    const age = character.age;
    const physicalCharacteristics = ['strength', 'dexterity', 'endurance'] as const;
    
    // Aging checks start at age 34, then every 4 years
    const agingChecks = Math.max(0, Math.floor((age - 34) / 4));
    
    return {
      checksRequired: agingChecks,
      nextCheckAge: 34 + (agingChecks * 4) + 4,
      affectedCharacteristics: physicalCharacteristics,
      riskLevel: age < 50 ? 'low' : age < 66 ? 'moderate' : 'high'
    };
  };

  const agingInfo = getAgingEffects();

  const characteristicEntries = Object.entries(characteristics) as [keyof CharacterCharacteristics, number][];

  const tabs = [
    { id: 'modifiers' as const, label: 'Modifiers', icon: '⚡' },
    { id: 'aging' as const, label: 'Aging', icon: '⏳' },
    { id: 'improvement' as const, label: 'Improvement', icon: '📈' },
  ];

  return (
    <FormErrorBoundary>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Advanced Characteristics</h3>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-muted rounded-lg p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`
                    px-3 py-1 rounded-md text-sm font-medium transition-colors
                    ${selectedTab === tab.id 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <span className="mr-1">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Modifiers Tab */}
          {selectedTab === 'modifiers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Active Modifiers</h4>
                {!readonly && (
                  <Button variant="outline" size="sm">
                    Add Modifier
                  </Button>
                )}
              </div>
              
              {getAllModifiers().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-lg font-medium mb-2">No Active Modifiers</div>
                  <div className="text-sm">No temporary or permanent modifiers are currently affecting characteristics</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {getAllModifiers().map((modifier) => (
                    <div key={modifier.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium ${modifier.type === 'enhancement' ? 'text-green-600' : 'text-red-600'}`}>
                            {modifier.type === 'enhancement' ? '+' : '-'}{modifier.value}
                          </span>
                          <span className="font-medium">to characteristic</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {modifier.description} ({modifier.source})
                        </div>
                        {modifier.expiresAt && (
                          <div className="text-xs text-muted-foreground">
                            Expires: {new Date(modifier.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {!readonly && onRemoveModifier && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveModifier(modifier.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Aging Tab */}
          {selectedTab === 'aging' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Aging Status</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Age:</span>
                      <span className="font-medium">{character.age}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Aging Checks Required:</span>
                      <span className="font-medium">{agingInfo.checksRequired}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Next Check at Age:</span>
                      <span className="font-medium">{agingInfo.nextCheckAge}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Risk Level:</span>
                      <span className={`font-medium capitalize ${
                        agingInfo.riskLevel === 'low' ? 'text-green-600' :
                        agingInfo.riskLevel === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {agingInfo.riskLevel}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Physical Characteristics</h4>
                  <div className="text-sm text-muted-foreground mb-2">
                    Affected by aging (STR, DEX, END)
                  </div>
                  
                  <div className="space-y-2">
                    {agingInfo.affectedCharacteristics.map((char) => {
                      const value = characteristics[char];
                      const modifier = getCharacteristicModifier(value);
                      
                      return (
                        <div key={char} className="flex items-center justify-between">
                          <span className="capitalize">{char}:</span>
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${getCharacteristicColorClass(value)}`}>
                              {value}
                            </span>
                            <span className={`text-sm ${getModifierColorClass(modifier)}`}>
                              ({modifier >= 0 ? '+' : ''}{modifier})
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {character.age >= 34 && !readonly && (
                <div className="pt-4 border-t border-border">
                  <Button variant="outline" size="sm">
                    Perform Aging Check
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Improvement Tab */}
          {selectedTab === 'improvement' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Characteristic Improvement</h4>
                <div className="text-sm text-muted-foreground">
                  Available XP: {availableExperience}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characteristicEntries.map(([name, value]) => {
                  const improvementCheck = canImproveCharacteristic(name, value, character.age);
                  const cost = getImprovementCost(value);
                  const canAfford = availableExperience >= cost;
                  
                  return (
                    <div key={name} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium capitalize">{name}</span>
                          <span className={`text-lg font-bold ${getCharacteristicColorClass(value)}`}>
                            {value}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Cost: {cost} XP
                        </div>
                      </div>
                      
                      {improvementCheck.canImprove ? (
                        <div className="space-y-2">
                          <div className="text-sm text-green-600">
                            Can be improved to {value + 1}
                          </div>
                          {!readonly && onImproveCharacteristic && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!canAfford}
                              onClick={() => onImproveCharacteristic(name, cost)}
                              className="w-full"
                            >
                              {canAfford ? 'Improve' : 'Insufficient XP'}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          {improvementCheck.reason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </FormErrorBoundary>
  );
};

export default CharacteristicsAdvanced;
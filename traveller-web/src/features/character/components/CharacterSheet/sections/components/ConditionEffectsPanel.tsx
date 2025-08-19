/**
 * Condition Effects Panel Component
 * Shows the cumulative effects of all active conditions on character stats
 */

import React from 'react';
import type { CharacterCharacteristics } from '../../../../types/characterSheet';
import { getCharacteristicModifier, getCharacteristicAbbreviation } from '../../../../types/characterSheet';

interface ConditionEffectsPanelProps {
  totalPenalties: {
    characteristics: Partial<CharacterCharacteristics>;
    skills: Array<{ name: string; modifier: number }>;
    initiative: number;
    movement: number;
    endurance: number;
    healing: number;
    other: string[];
  };
  characteristics: CharacterCharacteristics;
}

const ConditionEffectsPanel: React.FC<ConditionEffectsPanelProps> = ({
  totalPenalties,
  characteristics
}) => {
  // Calculate effective characteristics after condition modifiers
  const getEffectiveCharacteristic = (
    characteristic: keyof CharacterCharacteristics
  ): { current: number; modified: number; modifier: number } => {
    const current = characteristics[characteristic];
    const modifier = totalPenalties.characteristics[characteristic] || 0;
    const modified = Math.max(0, current + modifier);
    
    return { current, modified, modifier };
  };

  const hasAnyEffects = 
    Object.keys(totalPenalties.characteristics).length > 0 ||
    totalPenalties.skills.length > 0 ||
    totalPenalties.initiative !== 0 ||
    totalPenalties.movement !== 0 ||
    totalPenalties.endurance !== 0 ||
    totalPenalties.healing !== 0 ||
    totalPenalties.other.length > 0;

  if (!hasAnyEffects) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
        <div className="text-center">
          <div className="text-green-700 font-medium">No Condition Effects</div>
          <div className="text-sm text-green-600">
            Active conditions are not currently affecting character performance
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-muted/50 border border-border rounded-lg mb-4">
      <h4 className="font-medium mb-3 text-foreground">Active Condition Effects</h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Characteristic Effects */}
        {Object.keys(totalPenalties.characteristics).length > 0 && (
          <div>
            <h5 className="text-sm font-medium mb-2 text-muted-foreground">Characteristic Modifiers</h5>
            <div className="space-y-2">
              {(Object.keys(totalPenalties.characteristics) as Array<keyof CharacterCharacteristics>).map(char => {
                const effect = getEffectiveCharacteristic(char);
                const dmModifier = getCharacteristicModifier(effect.modified) - getCharacteristicModifier(effect.current);
                
                return (
                  <div key={char} className="flex items-center justify-between p-2 bg-background rounded border">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{getCharacteristicAbbreviation(char)}</span>
                      <span className="text-xs text-muted-foreground capitalize">({char})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{effect.current}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className={`font-medium ${effect.modified < effect.current ? 'text-red-600' : 'text-green-600'}`}>
                        {effect.modified}
                      </span>
                      <span className={`text-xs px-1 py-0.5 rounded ${
                        effect.modifier < 0 ? 'bg-red-100 text-red-700' : 
                        effect.modifier > 0 ? 'bg-green-100 text-green-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {effect.modifier >= 0 ? '+' : ''}{effect.modifier}
                      </span>
                      {dmModifier !== 0 && (
                        <span className={`text-xs px-1 py-0.5 rounded ${
                          dmModifier < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          DM {dmModifier >= 0 ? '+' : ''}{dmModifier}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Other Effects */}
        <div className="space-y-4">
          {/* Skill Effects */}
          {totalPenalties.skills.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Skill Modifiers</h5>
              <div className="space-y-1">
                {totalPenalties.skills.map((skill, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-background rounded border text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      skill.modifier < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {skill.modifier >= 0 ? '+' : ''}{skill.modifier} DM
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combat and Movement Effects */}
          {(totalPenalties.initiative !== 0 || totalPenalties.movement !== 0) && (
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Combat & Movement</h5>
              <div className="space-y-1">
                {totalPenalties.initiative !== 0 && (
                  <div className="flex items-center justify-between p-2 bg-background rounded border text-sm">
                    <span className="font-medium">Initiative</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      totalPenalties.initiative < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {totalPenalties.initiative >= 0 ? '+' : ''}{totalPenalties.initiative} DM
                    </span>
                  </div>
                )}
                
                {totalPenalties.movement !== 0 && (
                  <div className="flex items-center justify-between p-2 bg-background rounded border text-sm">
                    <span className="font-medium">Movement</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      totalPenalties.movement < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {totalPenalties.movement >= 0 ? '+' : ''}{totalPenalties.movement}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recovery Effects */}
          {(totalPenalties.endurance !== 0 || totalPenalties.healing !== 0) && (
            <div>
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Recovery & Healing</h5>
              <div className="space-y-1">
                {totalPenalties.endurance !== 0 && (
                  <div className="flex items-center justify-between p-2 bg-background rounded border text-sm">
                    <span className="font-medium">Endurance Tasks</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      totalPenalties.endurance < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {totalPenalties.endurance >= 0 ? '+' : ''}{totalPenalties.endurance} DM
                    </span>
                  </div>
                )}
                
                {totalPenalties.healing !== 0 && (
                  <div className="flex items-center justify-between p-2 bg-background rounded border text-sm">
                    <span className="font-medium">Healing Rate</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      totalPenalties.healing < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {totalPenalties.healing >= 0 ? '+' : ''}{totalPenalties.healing} DM
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Special Effects */}
      {totalPenalties.other.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-medium mb-2 text-muted-foreground">Special Effects</h5>
          <div className="space-y-1">
            {totalPenalties.other.map((effect, index) => (
              <div key={index} className="p-2 bg-background rounded border text-sm">
                <span className="text-muted-foreground">{effect}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Warning */}
      {Object.keys(totalPenalties.characteristics).length > 2 || totalPenalties.skills.length > 3 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="text-yellow-800 text-sm">
            <strong>Warning:</strong> Multiple conditions are significantly affecting performance. 
            Consider prioritizing treatment and recovery.
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionEffectsPanel;
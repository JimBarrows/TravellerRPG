/**
 * Individual Condition Card Component
 * Displays a single condition with all its details and action buttons
 */

import React from 'react';
import type { StatusCondition } from '../../../../types/characterSheet';
import Button from '../../../../../../shared/components/atoms/Button';
import { SEVERITY_INFO } from '../../../../data/conditions';
import { 
  formatConditionDuration, 
  getConditionDMPenalty,
  getConditionPriority 
} from '../../../../utils/conditionUtils';

interface ConditionCardProps {
  condition: StatusCondition;
  readonly?: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  onAttemptRecovery?: () => void;
  showRecoveryButton?: boolean;
}

const ConditionCard: React.FC<ConditionCardProps> = ({
  condition,
  readonly = false,
  onEdit,
  onRemove,
  onAttemptRecovery,
  showRecoveryButton = false
}) => {
  const severityInfo = SEVERITY_INFO[condition.severity];
  const dmPenalty = getConditionDMPenalty(condition);
  const priority = getConditionPriority(condition);

  // Determine card border and background based on severity
  const getCardStyling = () => {
    switch (condition.severity) {
      case 'terminal':
        return 'border-red-800 bg-red-50/50 shadow-red-100';
      case 'critical':
        return 'border-red-600 bg-red-50/30 shadow-red-50';
      case 'major':
        return 'border-orange-500 bg-orange-50/30';
      case 'moderate':
        return 'border-yellow-500 bg-yellow-50/30';
      case 'minor':
        return 'border-yellow-400 bg-yellow-50/20';
      default:
        return 'border-gray-300 bg-gray-50/20';
    }
  };

  const formatEffects = () => {
    const effects: string[] = [];
    
    condition.effects.forEach(effect => {
      switch (effect.type) {
        case 'characteristic':
          if (effect.target === 'all') {
            effects.push(`All characteristics ${effect.modifier >= 0 ? '+' : ''}${effect.modifier} DM`);
          } else if (effect.target === 'all_physical') {
            effects.push(`Physical characteristics ${effect.modifier >= 0 ? '+' : ''}${effect.modifier} DM`);
          } else if (effect.target === 'all_mental') {
            effects.push(`Mental characteristics ${effect.modifier >= 0 ? '+' : ''}${effect.modifier} DM`);
          } else {
            effects.push(`${effect.target} ${effect.modifier >= 0 ? '+' : ''}${effect.modifier} DM`);
          }
          break;
        case 'skill':
          effects.push(`${effect.target} skill ${effect.modifier >= 0 ? '+' : ''}${effect.modifier} DM`);
          break;
        case 'movement':
          if (effect.percentage) {
            effects.push(`Movement ${100 - effect.percentage}% of normal`);
          } else {
            effects.push(`Movement ${effect.modifier >= 0 ? '+' : ''}${effect.modifier} DM`);
          }
          break;
        case 'initiative':
          effects.push(`Initiative ${effect.modifier >= 0 ? '+' : ''}${effect.modifier} DM`);
          break;
        case 'endurance':
          effects.push(`Endurance tasks ${effect.modifier >= 0 ? '+' : ''}${effect.modifier} DM`);
          break;
        case 'healing':
          effects.push(`Healing ${effect.modifier >= 0 ? '+' : ''}${effect.modifier} DM`);
          break;
        case 'special':
          effects.push(effect.description);
          break;
      }
    });
    
    return effects.length > 0 ? effects.join(', ') : 'No mechanical effects';
  };

  const getTimeRemaining = () => {
    if (!condition.expiresAt) return null;
    
    const now = new Date();
    const expires = new Date(condition.expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    if (hours > 0) return `${hours}h ${minutes % 60}m remaining`;
    return `${minutes}m remaining`;
  };

  return (
    <div className={`p-4 border rounded-lg ${getCardStyling()}`}>
      {/* Condition Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {/* Condition Icon */}
            {condition.icon && (
              <span className="text-lg" title={condition.name}>
                {condition.icon}
              </span>
            )}
            
            {/* Condition Name */}
            <h3 className="font-semibold text-lg">{condition.name}</h3>
            
            {/* Severity Badge */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityInfo.color}`}>
              {severityInfo.label}
            </span>
            
            {/* Type Badge */}
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">
              {condition.type}
            </span>
            
            {/* DM Penalty Badge */}
            {dmPenalty !== 0 && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                dmPenalty < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {dmPenalty >= 0 ? '+' : ''}{dmPenalty} DM
              </span>
            )}
          </div>
          
          {/* Priority indicator for high-priority conditions */}
          {priority > 5000 && (
            <div className="text-xs text-red-600 font-medium mb-1">
              ⚠️ High Priority Condition
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {!readonly && (
          <div className="flex gap-1 ml-4">
            {showRecoveryButton && (
              <Button
                variant="outline"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
                onClick={onAttemptRecovery}
                title="Attempt recovery/treatment"
              >
                Treat
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-700"
              onClick={onEdit}
              title="Edit condition"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={onRemove}
              title="Remove condition"
            >
              Remove
            </Button>
          </div>
        )}
      </div>
      
      {/* Condition Description */}
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
        {condition.description}
      </p>
      
      {/* Game Effects */}
      <div className="mb-3">
        <span className="text-sm font-medium text-foreground">Game Effects: </span>
        <span className="text-sm text-muted-foreground">
          {formatEffects()}
        </span>
      </div>
      
      {/* Duration and Timing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div>
          <span className="font-medium">Applied: </span>
          {new Date(condition.appliedAt).toLocaleDateString()} {new Date(condition.appliedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        {condition.expiresAt && (
          <div>
            <span className="font-medium">Duration: </span>
            {getTimeRemaining() || formatConditionDuration(condition)}
          </div>
        )}
        
        {condition.duration === 'permanent' && (
          <div className="text-orange-600 font-medium">
            ⚠️ Permanent condition
          </div>
        )}
      </div>
      
      {/* Recovery Information */}
      {condition.recovery && (
        <div className="mt-3 p-2 bg-muted/40 rounded text-xs">
          <div className="font-medium mb-1">Recovery Information:</div>
          <div className="space-y-1">
            <div>
              <span className="font-medium">Method: </span>
              {condition.recovery.method} 
              {condition.recovery.skillRequired && ` (${condition.recovery.skillRequired} skill)`}
            </div>
            
            {condition.recovery.timeRequired && (
              <div>
                <span className="font-medium">Time: </span>
                {condition.recovery.timeRequired} {condition.recovery.timeUnit}
              </div>
            )}
            
            {condition.recovery.difficulty && (
              <div>
                <span className="font-medium">Difficulty: </span>
                {condition.recovery.difficulty}+
              </div>
            )}
            
            {condition.recovery.costCredits && (
              <div>
                <span className="font-medium">Cost: </span>
                {condition.recovery.costCredits} credits
              </div>
            )}
            
            {condition.recovery.equipmentRequired && condition.recovery.equipmentRequired.length > 0 && (
              <div>
                <span className="font-medium">Required: </span>
                {condition.recovery.equipmentRequired.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Source and Notes */}
      {(condition.source || condition.notes) && (
        <div className="mt-3 pt-2 border-t border-border/50">
          {condition.source && (
            <div className="text-xs text-muted-foreground mb-1">
              <span className="font-medium">Source: </span>
              {condition.source}
            </div>
          )}
          
          {condition.notes && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Notes: </span>
              {condition.notes}
            </div>
          )}
        </div>
      )}
      
      {/* Treatment Attempts */}
      {condition.treatmentAttempts && condition.treatmentAttempts > 0 && (
        <div className="mt-2 text-xs text-orange-600">
          Previous treatment attempts: {condition.treatmentAttempts}
        </div>
      )}
      
      {/* Condition Progression Indicators */}
      <div className="flex items-center gap-4 mt-2 text-xs">
        {condition.canWorsen && (
          <div className="text-red-600" title="This condition can get worse over time">
            ⬇️ Can worsen
          </div>
        )}
        
        {condition.canImprove && (
          <div className="text-green-600" title="This condition can improve naturally">
            ⬆️ Can improve
          </div>
        )}
        
        {condition.improvingNaturally && (
          <div className="text-blue-600" title="This condition is currently healing naturally">
            🔄 Healing naturally
          </div>
        )}
      </div>
    </div>
  );
};

export default ConditionCard;
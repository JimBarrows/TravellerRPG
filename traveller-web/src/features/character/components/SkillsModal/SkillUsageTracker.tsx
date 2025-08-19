import React, { useState } from 'react';
import type { CharacterSheetSkill, CharacterSheetData } from '../../../types/characterSheet';
import { updateSkillUsage, calculateExperienceGain } from '../../../utils/skillsCalculations';
import Modal from '../../../../../shared/components/molecules/Modal';
import Button from '../../../../../shared/components/atoms/Button';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';

interface SkillUsageTrackerProps {
  skill: CharacterSheetSkill;
  character: CharacterSheetData;
  onUpdateSkill: (updates: Partial<CharacterSheetSkill>) => void;
  onClose: () => void;
}

const SkillUsageTracker: React.FC<SkillUsageTrackerProps> = ({
  skill,
  character,
  onUpdateSkill,
  onClose
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('Average');
  const [additionalModifiers, setAdditionalModifiers] = useState(0);
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [wasSuccessful, setWasSuccessful] = useState<boolean | null>(null);
  const [sessionId, setSessionId] = useState('current-session');
  const [notes, setNotes] = useState('');
  
  const difficulties = [
    { name: 'Simple', modifier: 4, description: 'Almost automatic' },
    { name: 'Easy', modifier: 2, description: 'Straightforward task' },
    { name: 'Average', modifier: 0, description: 'Standard difficulty' },
    { name: 'Difficult', modifier: -2, description: 'Challenging task' },
    { name: 'Very Difficult', modifier: -4, description: 'Formidable challenge' },
    { name: 'Impossible', modifier: -6, description: 'Nearly impossible' }
  ];
  
  const getDifficultyModifier = (difficultyName: string): number => {
    const difficulty = difficulties.find(d => d.name === difficultyName);
    return difficulty?.modifier || 0;
  };
  
  const getCharacteristicModifier = (value: number): number => {
    if (value <= 0) return -3;
    if (value === 1) return -2;
    return Math.floor((value - 6) / 3);
  };
  
  const calculateTotalDM = (): number => {
    const skillDM = skill.level;
    const characteristicValue = character.characteristics[skill.characteristic];
    const characteristicDM = getCharacteristicModifier(characteristicValue);
    const difficultyDM = getDifficultyModifier(selectedDifficulty);
    
    return skillDM + characteristicDM + difficultyDM + additionalModifiers;
  };
  
  const calculateTargetNumber = (): number => {
    const totalDM = calculateTotalDM();
    return Math.max(2, 8 - totalDM);
  };
  
  const handleRoll = () => {
    // Simulate 2d6 roll
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    
    setRollResult(total);
    
    const targetNumber = calculateTargetNumber();
    const success = total >= targetNumber;
    setWasSuccessful(success);
  };
  
  const handleManualResult = (success: boolean) => {
    setWasSuccessful(success);
    setRollResult(null); // Clear roll if manually setting result
  };
  
  const handleRecordUsage = () => {
    if (wasSuccessful === null) {
      alert('Please roll dice or set the result manually');
      return;
    }
    
    // Update skill usage
    const updatedUsage = updateSkillUsage(
      skill.usage,
      wasSuccessful,
      selectedDifficulty,
      sessionId
    );
    
    // Calculate experience gain
    const experienceGained = calculateExperienceGain(
      skill.level,
      wasSuccessful,
      selectedDifficulty,
      false // Not training
    );
    
    updatedUsage.experienceGained = (updatedUsage.experienceGained || 0) + experienceGained;
    
    // Update skill
    onUpdateSkill({
      usage: updatedUsage,
      lastUsed: new Date().toISOString(),
      experiencePoints: (skill.experiencePoints || 0) + experienceGained
    });
    
    // Reset form
    setRollResult(null);
    setWasSuccessful(null);
    setNotes('');
    
    onClose();
  };
  
  const getSuccessRate = (): number => {
    // Calculate probability of success on 2d6 based on target number
    const targetNumber = calculateTargetNumber();
    let successfulOutcomes = 0;
    
    for (let die1 = 1; die1 <= 6; die1++) {
      for (let die2 = 1; die2 <= 6; die2++) {
        if (die1 + die2 >= targetNumber) {
          successfulOutcomes++;
        }
      }
    }
    
    return (successfulOutcomes / 36) * 100;
  };
  
  const currentUsage = skill.usage || {
    timesUsed: 0,
    successfulUses: 0,
    failedUses: 0,
    experienceGained: 0,
    averageDifficultyFaced: 0,
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    sessionUsage: []
  };
  
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Use Skill: ${skill.name}${skill.specialty ? ` (${skill.specialty})` : ''}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Skill Info */}
        <Card>
          <CardHeader>
            <h3 className="font-medium">Skill Check Information</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">{skill.level}</div>
                <div className="text-sm text-muted-foreground">Skill Level</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">
                  {getCharacteristicModifier(character.characteristics[skill.characteristic]) >= 0 ? '+' : ''}
                  {getCharacteristicModifier(character.characteristics[skill.characteristic])}
                </div>
                <div className="text-sm text-muted-foreground">
                  {skill.characteristic.toUpperCase()} Modifier
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-primary">
                  {calculateTotalDM() >= 0 ? '+' : ''}{calculateTotalDM()}
                </div>
                <div className="text-sm text-muted-foreground">Total DM</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {getSuccessRate().toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Task Setup */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              {difficulties.map(difficulty => (
                <option key={difficulty.name} value={difficulty.name}>
                  {difficulty.name} ({difficulty.modifier >= 0 ? '+' : ''}{difficulty.modifier}) - {difficulty.description}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Additional Modifiers</label>
            <input
              type="number"
              value={additionalModifiers}
              onChange={(e) => setAdditionalModifiers(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              placeholder="Equipment, circumstances, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Session ID</label>
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              placeholder="Session identifier for tracking"
            />
          </div>
        </div>
        
        {/* Target Number Display */}
        <Card>
          <CardContent>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Target Number (2d6)</div>
              <div className="text-3xl font-bold">
                {calculateTargetNumber()}+
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                You need to roll {calculateTargetNumber()} or higher on 2d6
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Roll Result */}
        <div className="text-center space-y-4">
          <Button
            variant="primary"
            onClick={handleRoll}
            size="lg"
          >
            Roll 2d6
          </Button>
          
          {rollResult !== null && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold mb-2">
                Rolled: {rollResult}
              </div>
              <div className={`text-lg font-medium ${wasSuccessful ? 'text-green-600' : 'text-red-600'}`}>
                {wasSuccessful ? 'Success!' : 'Failure'}
              </div>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">Or set result manually:</div>
          <div className="flex gap-2 justify-center">
            <Button
              variant={wasSuccessful === true ? 'primary' : 'ghost'}
              onClick={() => handleManualResult(true)}
            >
              Success
            </Button>
            <Button
              variant={wasSuccessful === false ? 'primary' : 'ghost'}
              onClick={() => handleManualResult(false)}
            >
              Failure
            </Button>
          </div>
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            rows={3}
            placeholder="Additional notes about this skill use..."
          />
        </div>
        
        {/* Current Usage Stats */}
        <Card>
          <CardHeader>
            <h3 className="font-medium">Current Usage Statistics</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold">{currentUsage.timesUsed}</div>
                <div className="text-muted-foreground">Times Used</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{currentUsage.successfulUses}</div>
                <div className="text-muted-foreground">Successes</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {currentUsage.timesUsed > 0 
                    ? Math.round((currentUsage.successfulUses / currentUsage.timesUsed) * 100)
                    : 0}%
                </div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">{currentUsage.experienceGained || 0}</div>
                <div className="text-muted-foreground">XP Gained</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleRecordUsage}
            disabled={wasSuccessful === null}
          >
            Record Usage
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SkillUsageTracker;
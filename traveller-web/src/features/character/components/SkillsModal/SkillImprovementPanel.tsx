import React, { useState, useMemo } from 'react';
import type { CharacterSheetSkill, CharacterSheetData } from '../../../types/characterSheet';
import { 
  calculateSkillImprovementCost, 
  calculateMultiLevelImprovementCost,
  getRecommendedSkillImprovements,
  getSkillEffectiveness
} from '../../../utils/skillsCalculations';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';
import Button from '../../../../../shared/components/atoms/Button';
import Modal from '../../../../../shared/components/molecules/Modal';

interface SkillImprovementPanelProps {
  character: CharacterSheetData;
  onUpdateCharacter: (updates: Partial<CharacterSheetData>) => void;
  readonly?: boolean;
}

const SkillImprovementPanel: React.FC<SkillImprovementPanelProps> = ({
  character,
  onUpdateCharacter,
  readonly = false
}) => {
  const [selectedSkill, setSelectedSkill] = useState<CharacterSheetSkill | null>(null);
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [targetLevel, setTargetLevel] = useState(1);
  
  // Get skills that can be improved
  const improvableSkills = useMemo(() => {
    return character.skills
      .filter(skill => skill.level < 6)
      .map(skill => {
        const cost = calculateSkillImprovementCost(skill.level, skill.level + 1, skill.isCareerSkill);
        const effectiveness = getSkillEffectiveness(skill, character.characteristics);
        return {
          ...skill,
          improvementCost: cost,
          canAfford: cost <= character.advancement.availableExperience,
          effectiveness
        };
      })
      .sort((a, b) => {
        // Sort by affordability first, then by cost
        if (a.canAfford !== b.canAfford) {
          return a.canAfford ? -1 : 1;
        }
        return a.improvementCost - b.improvementCost;
      });
  }, [character.skills, character.characteristics, character.advancement.availableExperience]);
  
  // Get recommended improvements
  const recommendations = useMemo(() => {
    return getRecommendedSkillImprovements(
      character.skills,
      character.advancement.availableExperience,
      ['combat', 'pilot', 'engineer'] // Example career focus - this would come from character data
    );
  }, [character.skills, character.advancement.availableExperience]);
  
  const handleSkillImprovement = (skill: CharacterSheetSkill, fromLevel: number, toLevel: number) => {
    if (readonly) return;
    
    const { totalCost } = calculateMultiLevelImprovementCost(fromLevel, toLevel, skill.isCareerSkill);
    
    if (totalCost > character.advancement.availableExperience) {
      alert('Insufficient experience points');
      return;
    }
    
    if (!window.confirm(`Improve ${skill.name} from level ${fromLevel} to ${toLevel} for ${totalCost} XP?`)) {
      return;
    }
    
    // Find skill index
    const skillIndex = character.skills.findIndex(s => 
      s.name === skill.name && s.specialty === skill.specialty
    );
    
    if (skillIndex === -1) return;
    
    // Update skill
    const updatedSkills = [...character.skills];
    updatedSkills[skillIndex] = {
      ...skill,
      level: toLevel,
      improvementHistory: [
        ...(skill.improvementHistory || []),
        {
          fromLevel,
          toLevel,
          costPaid: totalCost,
          dateImproved: new Date().toISOString(),
          methodUsed: 'experience'
        }
      ]
    };
    
    // Update advancement
    const updatedAdvancement = {
      ...character.advancement,
      totalExperienceSpent: character.advancement.totalExperienceSpent + totalCost,
      availableExperience: character.advancement.availableExperience - totalCost,
      records: [
        ...character.advancement.records,
        {
          id: crypto.randomUUID(),
          type: 'skill_improvement' as const,
          description: `Improved ${skill.name}${skill.specialty ? ` (${skill.specialty})` : ''} from ${fromLevel} to ${toLevel}`,
          cost: totalCost,
          skillName: skill.name,
          date: new Date().toISOString()
        }
      ]
    };
    
    onUpdateCharacter({
      skills: updatedSkills,
      advancement: updatedAdvancement
    });
    
    setShowImprovementModal(false);
    setSelectedSkill(null);
  };
  
  const openImprovementModal = (skill: CharacterSheetSkill) => {
    setSelectedSkill(skill);
    setTargetLevel(skill.level + 1);
    setShowImprovementModal(true);
  };
  
  const getImprovementPreview = (skill: CharacterSheetSkill, toLevel: number) => {
    const { levelCosts, totalCost } = calculateMultiLevelImprovementCost(skill.level, toLevel, skill.isCareerSkill);
    return { levelCosts, totalCost };
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Medium': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Experience Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Experience Points</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {character.advancement.availableExperience}
              </div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {character.advancement.totalExperienceSpent}
              </div>
              <div className="text-sm text-muted-foreground">Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {character.advancement.totalExperienceEarned}
              </div>
              <div className="text-sm text-muted-foreground">Total Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recommended Improvements */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-medium">Recommended Improvements</h3>
            <p className="text-sm text-muted-foreground">
              Based on skill usage and career focus
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 5).map((rec, index) => (
                <div 
                  key={`${rec.skill.name}-${rec.skill.specialty || 'base'}`}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rec.skill.name}</span>
                      {rec.skill.specialty && (
                        <span className="text-sm text-muted-foreground">({rec.skill.specialty})</span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {rec.reason}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold">
                        {rec.skill.level} → {rec.skill.level + 1}
                      </div>
                      <div className="text-xs text-muted-foreground">Level</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        {rec.cost} XP
                      </div>
                      <div className="text-xs text-muted-foreground">Cost</div>
                    </div>
                    
                    {!readonly && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSkillImprovement(rec.skill, rec.skill.level, rec.skill.level + 1)}
                        disabled={rec.cost > character.advancement.availableExperience}
                      >
                        Improve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* All Improvable Skills */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">All Skills Available for Improvement</h3>
          <p className="text-sm text-muted-foreground">
            {improvableSkills.filter(s => s.canAfford).length} of {improvableSkills.length} skills can be afforded
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {improvableSkills.map((skill) => (
              <div 
                key={`${skill.name}-${skill.specialty || 'base'}`}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  skill.canAfford 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{skill.name}</span>
                    {skill.specialty && (
                      <span className="text-sm text-muted-foreground">({skill.specialty})</span>
                    )}
                    {skill.isCareerSkill && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Career
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Current effectiveness: {skill.effectiveness.rating} ({skill.effectiveness.description})
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {skill.level} → {skill.level + 1}
                    </div>
                    <div className="text-xs text-muted-foreground">Level</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold ${skill.canAfford ? 'text-green-600' : 'text-red-600'}`}>
                      {skill.improvementCost} XP
                    </div>
                    <div className="text-xs text-muted-foreground">Cost</div>
                  </div>
                  
                  {!readonly && (
                    <div className="flex gap-1">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSkillImprovement(skill, skill.level, skill.level + 1)}
                        disabled={!skill.canAfford}
                      >
                        +1
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openImprovementModal(skill)}
                        disabled={!skill.canAfford}
                      >
                        Multi
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Multi-Level Improvement Modal */}
      {selectedSkill && (
        <Modal
          isOpen={showImprovementModal}
          onClose={() => setShowImprovementModal(false)}
          title={`Improve ${selectedSkill.name}${selectedSkill.specialty ? ` (${selectedSkill.specialty})` : ''}`}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target Level</label>
              <input
                type="range"
                min={selectedSkill.level + 1}
                max={6}
                value={targetLevel}
                onChange={(e) => setTargetLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>Level {selectedSkill.level + 1}</span>
                <span>Level 6</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                Level {selectedSkill.level} → {targetLevel}
              </div>
            </div>
            
            {(() => {
              const preview = getImprovementPreview(selectedSkill, targetLevel);
              return (
                <div>
                  <h4 className="font-medium mb-2">Cost Breakdown</h4>
                  <div className="space-y-1">
                    {preview.levelCosts.map(({ level, cost }) => (
                      <div key={level} className="flex justify-between text-sm">
                        <span>Level {level - 1} → {level}</span>
                        <span>{cost} XP</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-medium">
                    <span>Total Cost</span>
                    <span className={preview.totalCost <= character.advancement.availableExperience ? 'text-green-600' : 'text-red-600'}>
                      {preview.totalCost} XP
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Available: {character.advancement.availableExperience} XP
                  </div>
                </div>
              );
            })()}
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={() => setShowImprovementModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSkillImprovement(selectedSkill, selectedSkill.level, targetLevel)}
                disabled={getImprovementPreview(selectedSkill, targetLevel).totalCost > character.advancement.availableExperience}
              >
                Improve Skill
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SkillImprovementPanel;
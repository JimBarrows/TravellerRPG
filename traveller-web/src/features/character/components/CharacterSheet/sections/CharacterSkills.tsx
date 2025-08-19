import { useState } from 'react';
import type { CharacterSheetSectionProps, CharacterSheetSkill } from '../../../types/characterSheet';
import SkillsManagement from './SkillsManagement';
import AddEditSkillModal from '../../SkillsModal/AddEditSkillModal';
import SkillImprovementPanel from '../../SkillsModal/SkillImprovementPanel';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';
import Button from '../../../../../shared/components/atoms/Button';

type SkillsView = 'overview' | 'improvement' | 'detailed';

const CharacterSkills = ({ character, onUpdate, readonly }: CharacterSheetSectionProps) => {
  const [currentView, setCurrentView] = useState<SkillsView>('overview');
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<CharacterSheetSkill | null>(null);
  
  const handleAddSkill = (skillData: Omit<CharacterSheetSkill, 'id'>) => {
    const newSkill: CharacterSheetSkill = {
      ...skillData,
      id: crypto.randomUUID(),
    };
    
    const updatedSkills = [...character.skills, newSkill];
    onUpdate({ skills: updatedSkills });
    setShowAddSkillModal(false);
  };
  
  const handleEditSkill = (skillData: Omit<CharacterSheetSkill, 'id'>) => {
    if (!editingSkill) return;
    
    const skillIndex = character.skills.findIndex(s => s.id === editingSkill.id);
    if (skillIndex === -1) return;
    
    const updatedSkills = [...character.skills];
    updatedSkills[skillIndex] = {
      ...skillData,
      id: editingSkill.id,
    };
    
    onUpdate({ skills: updatedSkills });
    setEditingSkill(null);
  };
  
  const handleSkillUpdate = (updates: Partial<CharacterSheetSkill>) => {
    if (!editingSkill) return;
    
    const skillIndex = character.skills.findIndex(s => s.id === editingSkill.id);
    if (skillIndex === -1) return;
    
    const updatedSkills = [...character.skills];
    updatedSkills[skillIndex] = { ...updatedSkills[skillIndex], ...updates };
    
    onUpdate({ skills: updatedSkills });
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Skills</h2>
              <p className="text-sm text-muted-foreground">
                {character.skills.length} total skills • {character.skills.filter(s => s.isCareerSkill).length} career skills
                {character.advancement && (
                  <span> • {character.advancement.availableExperience} XP available</span>
                )}
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setCurrentView('overview')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentView === 'overview' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setCurrentView('detailed')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    currentView === 'detailed' 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Detailed
                </button>
                {!readonly && (
                  <button
                    onClick={() => setCurrentView('improvement')}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      currentView === 'improvement' 
                        ? 'bg-background text-foreground shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Improve
                  </button>
                )}
              </div>
              
              {!readonly && currentView !== 'improvement' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddSkillModal(true)}
                >
                  Add Skill
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Content Based on View */}
      {currentView === 'overview' && (
        <SkillsManagement
          character={character}
          onUpdate={onUpdate}
          readonly={readonly}
          showAdvancedFeatures={false}
          enableUsageTracking={false}
        />
      )}
      
      {currentView === 'detailed' && (
        <SkillsManagement
          character={character}
          onUpdate={onUpdate}
          readonly={readonly}
          showAdvancedFeatures={true}
          enableUsageTracking={true}
        />
      )}
      
      {currentView === 'improvement' && !readonly && (
        <SkillImprovementPanel
          character={character}
          onUpdateCharacter={onUpdate}
          readonly={readonly}
        />
      )}
      
      {/* Add/Edit Skill Modal */}
      <AddEditSkillModal
        isOpen={showAddSkillModal || editingSkill !== null}
        onClose={() => {
          setShowAddSkillModal(false);
          setEditingSkill(null);
        }}
        onSave={editingSkill ? handleEditSkill : handleAddSkill}
        editingSkill={editingSkill || undefined}
        existingSkills={character.skills}
        characteristics={character.characteristics}
      />
    </div>
  );
};

export default CharacterSkills;

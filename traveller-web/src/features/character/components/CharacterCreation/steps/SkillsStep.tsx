import { useState, useEffect, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import type { WizardStepProps, CharacterSkill } from '../../../types/characterCreation';
import Button from '../../../../../shared/components/atoms/Button';
import Input from '../../../../../shared/components/atoms/Input';
import Card from '../../../../../shared/components/molecules/Card';
import { 
  SKILLS, 
  SKILL_CATEGORIES,
  type Skill, 
  type SkillCategory,
  getSkillsByCategory,
  parseSkillName,
  formatSkillDisplay,
  getSkillById
} from '../../../data/skills';
import { getCharacteristicModifier } from '../../../utils/diceRoller';

interface SkillAssignment {
  skillId: string;
  specialization?: string;
  level: number;
  source: 'career' | 'background' | 'manual';
}

const SkillsStep = ({ data, updateData }: WizardStepProps) => {
  const { setValue, watch } = useFormContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [skillAssignments, setSkillAssignments] = useState<SkillAssignment[]>([]);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [showSpecializationModal, setShowSpecializationModal] = useState<{
    skillId: string;
    callback: (specialization: string) => void;
  } | null>(null);

  const characteristics = watch('characteristics') || data.characteristics;
  
  // Calculate starting skill points based on Education and Intelligence
  const baseSkillPoints = useMemo(() => {
    const educationBonus = Math.max(0, characteristics.education - 8);
    const intelligenceBonus = Math.max(0, characteristics.intelligence - 8);
    return educationBonus + intelligenceBonus + 10; // Base 10 points plus bonuses
  }, [characteristics]);

  // Initialize skill assignments from career and background skills
  useEffect(() => {
    const assignments: SkillAssignment[] = [];
    let usedPoints = 0;

    // Add background skills
    if (data.background?.startingSkills) {
      data.background.startingSkills.forEach(skillName => {
        const parsed = parseSkillName(skillName);
        if (parsed) {
          assignments.push({
            skillId: parsed.skillId,
            specialization: parsed.specialization,
            level: 1,
            source: 'background'
          });
          usedPoints += 1;
        }
      });
    }

    // Add career skills
    data.careers?.forEach(career => {
      career.skillsGained?.forEach(skillName => {
        const parsed = parseSkillName(skillName);
        if (parsed) {
          const existing = assignments.find(
            a => a.skillId === parsed.skillId && a.specialization === parsed.specialization
          );
          if (existing) {
            existing.level = Math.min(existing.level + 1, 5);
          } else {
            assignments.push({
              skillId: parsed.skillId,
              specialization: parsed.specialization,
              level: 1,
              source: 'career'
            });
          }
          usedPoints += 1;
        }
      });
    });

    setSkillAssignments(assignments);
    setAvailablePoints(baseSkillPoints - usedPoints);
  }, [data.background, data.careers, baseSkillPoints]);

  // Filter skills based on search and category
  const filteredSkills = useMemo(() => {
    let filtered = SKILLS;

    if (selectedCategory !== 'all') {
      filtered = getSkillsByCategory(selectedCategory);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(term) ||
        skill.description.toLowerCase().includes(term) ||
        skill.specializations?.some(spec => spec.toLowerCase().includes(term))
      );
    }

    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [searchTerm, selectedCategory]);

  // Get current skill level
  const getSkillLevel = (skillId: string, specialization?: string): number => {
    const assignment = skillAssignments.find(
      a => a.skillId === skillId && a.specialization === specialization
    );
    return assignment?.level || 0;
  };

  // Check if skill can be increased
  const canIncreaseSkill = (skillId: string, specialization?: string): boolean => {
    const currentLevel = getSkillLevel(skillId, specialization);
    const skill = getSkillById(skillId);
    const maxLevel = skill?.maxLevel || 5;
    
    return availablePoints > 0 && currentLevel < maxLevel;
  };

  // Check if skill can be decreased (only manual assignments)
  const canDecreaseSkill = (skillId: string, specialization?: string): boolean => {
    const assignment = skillAssignments.find(
      a => a.skillId === skillId && a.specialization === specialization
    );
    return assignment?.source === 'manual' && assignment.level > 0;
  };

  // Increase skill level
  const increaseSkill = (skillId: string, specialization?: string) => {
    if (!canIncreaseSkill(skillId, specialization)) return;

    const skill = getSkillById(skillId);
    if (!skill) return;

    // If skill has specializations and no specialization selected, show modal
    if (skill.hasSpecializations && !specialization && skill.specializations) {
      setShowSpecializationModal({
        skillId,
        callback: (selectedSpec) => {
          increaseSkillWithSpecialization(skillId, selectedSpec);
          setShowSpecializationModal(null);
        }
      });
      return;
    }

    increaseSkillWithSpecialization(skillId, specialization);
  };

  const increaseSkillWithSpecialization = (skillId: string, specialization?: string) => {
    setSkillAssignments(prev => {
      const existing = prev.find(
        a => a.skillId === skillId && a.specialization === specialization
      );

      if (existing) {
        return prev.map(a => 
          a.skillId === skillId && a.specialization === specialization
            ? { ...a, level: a.level + 1 }
            : a
        );
      } else {
        return [...prev, {
          skillId,
          specialization,
          level: 1,
          source: 'manual' as const
        }];
      }
    });

    setAvailablePoints(prev => prev - 1);
  };

  // Decrease skill level
  const decreaseSkill = (skillId: string, specialization?: string) => {
    if (!canDecreaseSkill(skillId, specialization)) return;

    setSkillAssignments(prev => {
      const updated = prev.map(a => {
        if (a.skillId === skillId && a.specialization === specialization && a.source === 'manual') {
          return { ...a, level: a.level - 1 };
        }
        return a;
      });

      // Remove assignments with level 0
      return updated.filter(a => a.level > 0);
    });

    setAvailablePoints(prev => prev + 1);
  };

  // Get characteristic modifier for skill
  const getCharacteristicBonus = (skill: Skill): number => {
    return getCharacteristicModifier(characteristics[skill.characteristic]);
  };

  // Update form data when skills change
  useEffect(() => {
    const characterSkills: CharacterSkill[] = skillAssignments.map(assignment => ({
      name: formatSkillDisplay(assignment.skillId, assignment.specialization),
      level: assignment.level,
      specialty: assignment.specialization,
    }));

    setValue('skills', characterSkills);
    updateData({ skills: characterSkills });
  }, [skillAssignments, setValue, updateData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Skill Assignment</h2>
        <p className="text-muted-foreground mb-4">
          Assign your remaining skill points. Your career and background have already provided some skills.
        </p>
        
        <div className="bg-muted p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Available Points:</span> {availablePoints}
            </div>
            <div>
              <span className="font-medium">Total Points:</span> {baseSkillPoints}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="sm:w-48">
          <select 
            className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | 'all')}
          >
            <option value="all">All Categories</option>
            {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
              <option key={key} value={key}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Skills Summary */}
      {skillAssignments.length > 0 && (
        <Card className="mb-6">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-3">Current Skills</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {skillAssignments
                .filter(a => a.level > 0)
                .sort((a, b) => {
                  const skillA = getSkillById(a.skillId);
                  const skillB = getSkillById(b.skillId);
                  return (skillA?.name || '').localeCompare(skillB?.name || '');
                })
                .map((assignment, index) => {
                  const skill = getSkillById(assignment.skillId);
                  if (!skill) return null;

                  const displayName = formatSkillDisplay(
                    assignment.skillId, 
                    assignment.specialization, 
                    assignment.level
                  );

                  return (
                    <div 
                      key={`${assignment.skillId}-${assignment.specialization}-${index}`}
                      className={`flex items-center justify-between p-2 rounded text-sm ${{
                        career: 'bg-blue-50 text-blue-800',
                        background: 'bg-green-50 text-green-800',
                        manual: 'bg-gray-50 text-gray-800'
                      }[assignment.source]}`}
                    >
                      <span>{displayName}</span>
                      <span className="text-xs opacity-75 capitalize">
                        {assignment.source}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>
      )}

      {/* Skills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSkills.map(skill => {
          const currentLevel = getSkillLevel(skill.id);
          const charBonus = getCharacteristicBonus(skill);
          const totalBonus = currentLevel + charBonus;

          return (
            <Card key={skill.id} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{skill.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {skill.characteristic.toUpperCase()} {charBonus >= 0 ? '+' : ''}{charBonus}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => decreaseSkill(skill.id)}
                      disabled={!canDecreaseSkill(skill.id)}
                      className="w-8 h-8 p-0"
                    >
                      -
                    </Button>
                    
                    <span className="min-w-[2rem] text-center font-mono text-sm">
                      {currentLevel > 0 ? `${currentLevel} (+${totalBonus})` : '0'}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => increaseSkill(skill.id)}
                      disabled={!canIncreaseSkill(skill.id)}
                      className="w-8 h-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {skill.description}
                </p>

                {skill.usage && (
                  <p className="text-xs text-muted-foreground italic">
                    {skill.usage}
                  </p>
                )}

                {skill.specializations && skill.specializations.length > 0 && (
                  <div className="text-xs">
                    <span className="font-medium">Specializations:</span>
                    <span className="text-muted-foreground ml-1">
                      {skill.specializations.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Specialization Selection Modal */}
      {showSpecializationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                Choose Specialization
              </h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                This skill requires a specialization. Choose one:
              </p>

              <div className="space-y-2 mb-6">
                {getSkillById(showSpecializationModal.skillId)?.specializations?.map(spec => (
                  <Button
                    key={spec}
                    variant="outline"
                    fullWidth
                    onClick={() => showSpecializationModal.callback(spec)}
                    className="justify-start"
                  >
                    {spec}
                  </Button>
                ))}
              </div>

              <Button
                variant="ghost"
                fullWidth
                onClick={() => setShowSpecializationModal(null)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {filteredSkills.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No skills found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default SkillsStep;
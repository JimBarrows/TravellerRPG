import React, { useState, useMemo, useCallback } from 'react';
import type { CharacterSheetSectionProps, CharacterSheetSkill } from '../../../types/characterSheet';
import { getCharacteristicModifier, getSkillCheckDM } from '../../../types/characterSheet';
import { getCharacteristicAbbreviation } from '../../../utils/diceRoller';
import { SKILLS, SKILL_CATEGORIES, getSkillById, type SkillCategory } from '../../../data/skills';
import { 
  skillSchema, 
  validateSkillName, 
  validateSkillSpecialization,
  validateSkillImprovement,
  calculateSkillImprovementCost 
} from '../../../validation/schemas';
import SkillUsageTracker from '../../SkillsModal/SkillUsageTracker';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';
import Button from '../../../../../shared/components/atoms/Button';
import Input from '../../../../../shared/components/atoms/Input';
import { EditableNumber, EditableSelect, EditableText } from '../../EditableFields';

type SkillSortOption = 'name' | 'level' | 'category' | 'totalDM' | 'usage' | 'lastUsed';
type SkillFilterOption = 'all' | 'career' | 'personal' | 'specialty' | 'level0' | 'level1plus' | 'level3plus';

interface SkillsManagementProps extends CharacterSheetSectionProps {
  showAdvancedFeatures?: boolean;
  enableUsageTracking?: boolean;
}

const SkillsManagement: React.FC<SkillsManagementProps> = ({ 
  character, 
  onUpdate, 
  readonly = false,
  showAdvancedFeatures = true,
  enableUsageTracking = true
}) => {
  const [sortBy, setSortBy] = useState<SkillSortOption>('name');
  const [filterBy, setFilterBy] = useState<SkillFilterOption>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['combat', 'personal', 'professional'])
  );
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<CharacterSheetSkill | null>(null);
  const [showUsageDetails, setShowUsageDetails] = useState<string | null>(null);
  const [showUsageTracker, setShowUsageTracker] = useState(false);
  const [skillBeingUsed, setSkillBeingUsed] = useState<CharacterSheetSkill | null>(null);
  
  // Filter and sort skills
  const filteredAndSortedSkills = useMemo(() => {
    let filtered = character.skills;
    
    // Apply filters
    switch (filterBy) {
      case 'career':
        filtered = filtered.filter(skill => skill.isCareerSkill);
        break;
      case 'personal':
        filtered = filtered.filter(skill => !skill.isCareerSkill);
        break;
      case 'specialty':
        filtered = filtered.filter(skill => skill.specialty);
        break;
      case 'level0':
        filtered = filtered.filter(skill => skill.level === 0);
        break;
      case 'level1plus':
        filtered = filtered.filter(skill => skill.level >= 1);
        break;
      case 'level3plus':
        filtered = filtered.filter(skill => skill.level >= 3);
        break;
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(skill => 
        skill.name.toLowerCase().includes(term) ||
        skill.specialty?.toLowerCase().includes(term) ||
        skill.category.toLowerCase().includes(term) ||
        skill.notes?.toLowerCase().includes(term)
      );
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'level':
          return b.level - a.level;
        case 'category':
          return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
        case 'totalDM':
          const aDM = getSkillCheckDM(a, character.characteristics);
          const bDM = getSkillCheckDM(b, character.characteristics);
          return bDM - aDM;
        case 'usage':
          const aUsage = a.usage?.timesUsed || 0;
          const bUsage = b.usage?.timesUsed || 0;
          return bUsage - aUsage;
        case 'lastUsed':
          const aLastUsed = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
          const bLastUsed = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
          return bLastUsed - aLastUsed;
        default:
          return 0;
      }
    });
  }, [character.skills, character.characteristics, sortBy, filterBy, selectedCategory, searchTerm]);
  
  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const groups: Record<string, CharacterSheetSkill[]> = {};
    filteredAndSortedSkills.forEach(skill => {
      if (!groups[skill.category]) {
        groups[skill.category] = [];
      }
      groups[skill.category].push(skill);
    });
    return groups;
  }, [filteredAndSortedSkills]);
  
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };
  
  const handleSkillUpdate = useCallback((skillIndex: number, updates: Partial<CharacterSheetSkill>) => {
    const updatedSkills = [...character.skills];
    updatedSkills[skillIndex] = { ...updatedSkills[skillIndex], ...updates };
    onUpdate({ skills: updatedSkills });
  }, [character.skills, onUpdate]);
  
  const handleAddSkill = (newSkill: Omit<CharacterSheetSkill, 'id'>) => {
    const skillToAdd: CharacterSheetSkill = {
      ...newSkill,
      id: crypto.randomUUID(),
    };
    
    const updatedSkills = [...character.skills, skillToAdd];
    onUpdate({ skills: updatedSkills });
    setShowAddSkillModal(false);
  };
  
  const handleRemoveSkill = (skillIndex: number) => {
    if (window.confirm('Are you sure you want to remove this skill?')) {
      const updatedSkills = character.skills.filter((_, index) => index !== skillIndex);
      onUpdate({ skills: updatedSkills });
    }
  };
  
  const handleImproveSkill = (skillIndex: number) => {
    const skill = character.skills[skillIndex];
    const improvementValidation = validateSkillImprovement(
      skill.level,
      skill.level + 1,
      skill.isCareerSkill,
      character.advancement.availableExperience
    );
    
    if (!improvementValidation.isValid) {
      alert(improvementValidation.errors.join('\n'));
      return;
    }
    
    const cost = improvementValidation.cost!;
    if (window.confirm(`Improve ${skill.name} from level ${skill.level} to ${skill.level + 1} for ${cost} XP?`)) {
      // Update skill level
      const updatedSkills = [...character.skills];
      updatedSkills[skillIndex] = {
        ...skill,
        level: skill.level + 1,
        improvementHistory: [
          ...(skill.improvementHistory || []),
          {
            fromLevel: skill.level,
            toLevel: skill.level + 1,
            costPaid: cost,
            dateImproved: new Date().toISOString(),
            methodUsed: 'experience'
          }
        ]
      };
      
      // Update experience points
      const updatedAdvancement = {
        ...character.advancement,
        totalExperienceSpent: character.advancement.totalExperienceSpent + cost,
        availableExperience: character.advancement.availableExperience - cost,
        records: [
          ...character.advancement.records,
          {
            id: crypto.randomUUID(),
            type: 'skill_improvement' as const,
            description: `Improved ${skill.name} from ${skill.level} to ${skill.level + 1}`,
            cost,
            skillName: skill.name,
            date: new Date().toISOString()
          }
        ]
      };
      
      onUpdate({ 
        skills: updatedSkills,
        advancement: updatedAdvancement
      });
    }
  };
  
  const handleSkillUsed = (skillIndex: number, wasSuccessful: boolean) => {
    if (!enableUsageTracking) return;
    
    const skill = character.skills[skillIndex];
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
    
    const updatedUsage = {
      ...currentUsage,
      timesUsed: currentUsage.timesUsed + 1,
      successfulUses: wasSuccessful ? currentUsage.successfulUses + 1 : currentUsage.successfulUses,
      failedUses: wasSuccessful ? currentUsage.failedUses : currentUsage.failedUses + 1,
      consecutiveSuccesses: wasSuccessful ? currentUsage.consecutiveSuccesses + 1 : 0,
      consecutiveFailures: wasSuccessful ? 0 : currentUsage.consecutiveFailures + 1,
      lastUsed: new Date().toISOString()
    };
    
    const updatedSkills = [...character.skills];
    updatedSkills[skillIndex] = {
      ...skill,
      usage: updatedUsage,
      lastUsed: new Date().toISOString()
    };
    
    onUpdate({ skills: updatedSkills });
  };
  
  const handleOpenUsageTracker = (skill: CharacterSheetSkill) => {
    setSkillBeingUsed(skill);
    setShowUsageTracker(true);
  };
  
  const handleSkillUsageUpdate = (updates: Partial<CharacterSheetSkill>) => {
    if (!skillBeingUsed) return;
    
    const skillIndex = character.skills.findIndex(s => 
      s.name === skillBeingUsed.name && s.specialty === skillBeingUsed.specialty
    );
    
    if (skillIndex === -1) return;
    
    const updatedSkills = [...character.skills];
    updatedSkills[skillIndex] = { ...updatedSkills[skillIndex], ...updates };
    
    onUpdate({ skills: updatedSkills });
    setShowUsageTracker(false);
    setSkillBeingUsed(null);
  };
  
  const getSkillLevelName = (level: number): string => {
    if (level === 0) return 'Untrained';
    if (level === 1) return 'Novice';
    if (level === 2) return 'Experienced';
    if (level === 3) return 'Veteran';
    if (level >= 4) return 'Expert';
    return 'Unknown';
  };
  
  const getSkillLevelColor = (level: number): string => {
    if (level === 0) return 'text-gray-500';
    if (level === 1) return 'text-blue-600';
    if (level === 2) return 'text-green-600';
    if (level === 3) return 'text-yellow-600';
    if (level >= 4) return 'text-red-600';
    return 'text-gray-500';
  };
  
  const getSuccessRate = (skill: CharacterSheetSkill): string => {
    if (!skill.usage || skill.usage.timesUsed === 0) return 'N/A';
    const rate = (skill.usage.successfulUses / skill.usage.timesUsed) * 100;
    return `${rate.toFixed(0)}%`;
  };
  
  const formatLastUsed = (dateString?: string): string => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Skills Management</h2>
              <p className="text-sm text-muted-foreground">
                {character.skills.length} total skills • {character.skills.filter(s => s.isCareerSkill).length} career skills
                {showAdvancedFeatures && (
                  <span> • {character.advancement.availableExperience} XP available</span>
                )}
              </p>
            </div>
            
            {!readonly && (
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowAddSkillModal(true)}
                >
                  Add Skill
                </Button>
                {showAdvancedFeatures && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUsageDetails(showUsageDetails ? null : 'summary')}
                  >
                    {showUsageDetails ? 'Hide' : 'Show'} Analytics
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search skills by name, specialty, category, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | 'all')}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="all">All Categories</option>
                {Object.entries(SKILL_CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>{category.name}</option>
                ))}
              </select>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as SkillFilterOption)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="all">All Skills</option>
                <option value="career">Career Skills</option>
                <option value="personal">Personal Skills</option>
                <option value="specialty">Specializations</option>
                <option value="level0">Level 0</option>
                <option value="level1plus">Level 1+</option>
                <option value="level3plus">Expert (3+)</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SkillSortOption)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="level">Sort by Level</option>
                <option value="category">Sort by Category</option>
                <option value="totalDM">Sort by Total DM</option>
                {enableUsageTracking && (
                  <>
                    <option value="usage">Sort by Usage</option>
                    <option value="lastUsed">Sort by Last Used</option>
                  </>
                )}
              </select>
            </div>
          </div>
          
          {/* Usage Analytics Summary */}
          {showAdvancedFeatures && enableUsageTracking && showUsageDetails && (
            <div className="mb-6 p-4 border border-border rounded-lg bg-muted/50">
              <h3 className="font-medium mb-3">Skills Analytics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-semibold">{character.skills.filter(s => s.usage?.timesUsed).length}</div>
                  <div className="text-muted-foreground">Skills Used</div>
                </div>
                <div>
                  <div className="font-semibold">
                    {character.skills.reduce((sum, s) => sum + (s.usage?.timesUsed || 0), 0)}
                  </div>
                  <div className="text-muted-foreground">Total Uses</div>
                </div>
                <div>
                  <div className="font-semibold">
                    {character.skills.reduce((sum, s) => sum + (s.usage?.successfulUses || 0), 0)}
                  </div>
                  <div className="text-muted-foreground">Successes</div>
                </div>
                <div>
                  <div className="font-semibold">
                    {(() => {
                      const totalUses = character.skills.reduce((sum, s) => sum + (s.usage?.timesUsed || 0), 0);
                      const successes = character.skills.reduce((sum, s) => sum + (s.usage?.successfulUses || 0), 0);
                      return totalUses > 0 ? `${Math.round((successes / totalUses) * 100)}%` : 'N/A';
                    })()}
                  </div>
                  <div className="text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Skills List */}
      {Object.keys(skillsByCategory).length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-lg font-medium mb-2">No skills found</div>
              <div className="text-sm text-muted-foreground">
                {searchTerm || filterBy !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'This character has no skills yet'
                }
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <Card key={category}>
              <CardHeader>
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <h3 className="text-lg font-medium">{category}</h3>
                    <p className="text-sm text-muted-foreground">
                      {skills.length} skills
                      {enableUsageTracking && (
                        <span> • {skills.filter(s => s.usage?.timesUsed).length} used</span>
                      )}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedCategories.has(category) ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </CardHeader>
              
              {expandedCategories.has(category) && (
                <CardContent>
                  <div className="space-y-3">
                    {skills.map((skill, skillIndex) => {
                      const globalIndex = character.skills.findIndex(s => 
                        s.name === skill.name && s.specialty === skill.specialty
                      );
                      const characteristicMod = getCharacteristicModifier(character.characteristics[skill.characteristic]);
                      const totalDM = getSkillCheckDM(skill, character.characteristics);
                      const canImprove = showAdvancedFeatures && 
                                       skill.level < 6 && 
                                       character.advancement.availableExperience >= 
                                       calculateSkillImprovementCost(skill.level, skill.level + 1, skill.isCareerSkill);
                      
                      return (
                        <div
                          key={`${skill.name}-${skill.specialty || 'base'}`}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
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
                              {getCharacteristicAbbreviation(skill.characteristic)} 
                              ({characteristicMod >= 0 ? '+' : ''}{characteristicMod})
                              {enableUsageTracking && skill.usage && (
                                <span className="ml-2">
                                  • Used {skill.usage.timesUsed} times ({getSuccessRate(skill)} success)
                                  • Last: {formatLastUsed(skill.lastUsed)}
                                </span>
                              )}
                              {skill.notes && (
                                <span className="ml-2">• {skill.notes}</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            {/* Level Display */}
                            <div className="text-center">
                              <div className={`text-lg font-bold ${getSkillLevelColor(skill.level)}`}>
                                {skill.level}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {getSkillLevelName(skill.level)}
                              </div>
                            </div>
                            
                            {/* Total DM Display */}
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary">
                                {totalDM >= 0 ? '+' : ''}{totalDM}
                              </div>
                              <div className="text-xs text-muted-foreground">Total DM</div>
                            </div>
                            
                            {/* Action Buttons */}
                            {!readonly && (
                              <div className="flex flex-col gap-1">
                                <div className="flex gap-1">
                                  {showAdvancedFeatures && canImprove && (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={() => handleImproveSkill(globalIndex)}
                                      title={`Improve to level ${skill.level + 1} (${calculateSkillImprovementCost(skill.level, skill.level + 1, skill.isCareerSkill)} XP)`}
                                    >
                                      ↑
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSkillUpdate(globalIndex, { level: Math.min(skill.level + 1, 6) })}
                                    disabled={skill.level >= 6}
                                    title="Increase level"
                                  >
                                    +
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleSkillUpdate(globalIndex, { level: Math.max(skill.level - 1, 0) })}
                                    disabled={skill.level <= 0}
                                    title="Decrease level"
                                  >
                                    -
                                  </Button>
                                </div>
                                <div className="flex gap-1">
                                  {enableUsageTracking && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenUsageTracker(skill)}
                                        className="text-blue-600 hover:text-blue-700"
                                        title="Use skill with dice rolling"
                                      >
                                        🎲
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSkillUsed(globalIndex, true)}
                                        className="text-green-600 hover:text-green-700"
                                        title="Mark as successfully used"
                                      >
                                        ✓
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSkillUsed(globalIndex, false)}
                                        className="text-red-600 hover:text-red-700"
                                        title="Mark as failed use"
                                      >
                                        ✗
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSkill(skill)}
                                    title="Edit skill"
                                  >
                                    ⚙
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveSkill(globalIndex)}
                                    className="text-red-600 hover:text-red-700"
                                    title="Remove skill"
                                  >
                                    ×
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Skills Summary */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Skills Summary</h3>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{character.skills.length}</div>
              <div className="text-sm text-muted-foreground">Total Skills</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{character.skills.filter(s => s.isCareerSkill).length}</div>
              <div className="text-sm text-muted-foreground">Career Skills</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{character.skills.filter(s => s.level >= 3).length}</div>
              <div className="text-sm text-muted-foreground">Expert Level (3+)</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{character.skills.filter(s => s.specialty).length}</div>
              <div className="text-sm text-muted-foreground">Specializations</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Usage Tracker Modal */}
      {showUsageTracker && skillBeingUsed && (
        <SkillUsageTracker
          skill={skillBeingUsed}
          character={character}
          onUpdateSkill={handleSkillUsageUpdate}
          onClose={() => {
            setShowUsageTracker(false);
            setSkillBeingUsed(null);
          }}
        />
      )}
    </div>
  );
};

export default SkillsManagement;
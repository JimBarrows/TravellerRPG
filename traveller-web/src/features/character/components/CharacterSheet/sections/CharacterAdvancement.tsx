import { useState, useMemo } from 'react';
import type { 
  CharacterSheetSectionProps,
  ExperienceSource,
  ExperienceMilestone,
  CharacterSnapshot,
  CharacterShare,
  SharingPermissionLevel,
  CharacterCharacteristics
} from '../../../types/characterSheet';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';
import Button from '../../../../../shared/components/atoms/Button';
import Input from '../../../../../shared/components/atoms/Input';
import Modal from '../../../../../shared/components/molecules/Modal';
import { 
  awardExperience, 
  spendExperience, 
  calculateSkillImprovementCost, 
  calculateCharacteristicImprovementCost,
  generateAdvancementSuggestions,
  EXPERIENCE_REWARDS
} from '../../../utils/experienceSystem';
import { CharacterSharingService } from '../../../services/characterSharingService';
import { CharacterHistoryService } from '../../../services/characterHistoryService';

const CharacterAdvancement = ({ character, onUpdate, readonly }: CharacterSheetSectionProps) => {
  const advancement = character.advancement;
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'history' | 'sharing' | 'advancement'>('overview');
  const [showAddXPModal, setShowAddXPModal] = useState(false);
  const [showAdvancementModal, setShowAdvancementModal] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [selectedAdvancement, setSelectedAdvancement] = useState<{
    type: 'skill' | 'characteristic';
    target: string;
    cost: number;
  } | null>(null);

  // Services
  const sharingService = useMemo(() => new CharacterSharingService(), []);
  const historyService = useMemo(() => new CharacterHistoryService(), []);

  // Calculate advancement suggestions
  const suggestions = useMemo(() => {
    if (readonly || !character) return [];
    return generateAdvancementSuggestions(character).slice(0, 5);
  }, [character, readonly]);

  // Get milestone progress
  const milestoneProgress = useMemo(() => {
    const achieved = advancement.milestones.filter(m => m.achieved).length;
    const total = advancement.milestones.length;
    return { achieved, total, percentage: (achieved / total) * 100 };
  }, [advancement.milestones]);

  const handleAddExperience = async (source: ExperienceSource, amount: number, description: string) => {
    if (readonly) return;
    
    const { updatedAdvancement, newMilestones } = awardExperience(
      source,
      description,
      { amount },
      advancement
    );

    await onUpdate({ advancement: updatedAdvancement });
    setShowAddXPModal(false);

    // Show milestone achievements
    if (newMilestones.length > 0) {
      alert(`Congratulations! You've achieved: ${newMilestones.map(m => m.name).join(', ')}`);
    }
  };

  const handleSpendExperience = async (type: 'skill' | 'characteristic', target: string, cost: number) => {
    if (readonly || !selectedAdvancement) return;
    
    try {
      const { updatedAdvancement } = spendExperience(
        type === 'skill' ? 'skill_improvement' : 'characteristic_improvement',
        target,
        cost,
        `Improved ${target}`,
        advancement
      );

      // Update the actual character data based on the advancement type
      let updatedCharacter = { ...character };
      
      if (type === 'skill') {
        const skillIndex = updatedCharacter.skills.findIndex(s => s.name === target);
        if (skillIndex >= 0) {
          updatedCharacter.skills[skillIndex] = {
            ...updatedCharacter.skills[skillIndex],
            level: updatedCharacter.skills[skillIndex].level + 1
          };
        }
      } else {
        updatedCharacter.characteristics = {
          ...updatedCharacter.characteristics,
          [target]: updatedCharacter.characteristics[target as keyof typeof updatedCharacter.characteristics] + 1
        };
      }

      updatedCharacter.advancement = updatedAdvancement;
      await onUpdate(updatedCharacter);
      setShowAdvancementModal(false);
      setSelectedAdvancement(null);
    } catch (error) {
      alert(`Failed to spend experience: ${(error as Error).message}`);
    }
  };

  const handleCreateSnapshot = () => {
    if (readonly) return;
    
    const snapshot = historyService.createSnapshot(
      character,
      'manual',
      'Manual snapshot created by user'
    );

    const updatedHistory = historyService.addSnapshotToHistory(
      character.history,
      snapshot
    );

    onUpdate({ 
      history: updatedHistory,
      version: character.version + 1
    });
  };

  const handleCreateShare = async (settings: any) => {
    if (readonly) return;
    
    try {
      const share = await sharingService.createShare(character, settings);
      
      onUpdate({
        sharing: [...character.sharing, share]
      });
      
      setShowSharingModal(false);
      alert('Character share created successfully!');
    } catch (error) {
      alert(`Failed to create share: ${(error as Error).message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'milestones', label: 'Milestones', icon: '🎯' },
          { id: 'history', label: 'History', icon: '📚' },
          { id: 'sharing', label: 'Sharing', icon: '🔗' },
          { id: 'advancement', label: 'Advancement', icon: '⬆️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Experience Overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Experience & Advancement</h2>
                  <p className="text-sm text-muted-foreground">
                    Track character growth and development
                  </p>
                </div>
                {!readonly && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAddXPModal(true)}
                    >
                      Add XP
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowAdvancementModal(true)}
                    >
                      Advance
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {advancement.totalExperienceEarned}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Total XP Earned</div>
                </div>
                
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {advancement.totalExperienceSpent}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">XP Spent</div>
                </div>
                
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {advancement.availableExperience}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Available XP</div>
                </div>
                
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {milestoneProgress.achieved}/{milestoneProgress.total}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">Milestones</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${milestoneProgress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advancement Suggestions */}
          {!readonly && suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-medium">Advancement Suggestions</h3>
                <p className="text-sm text-muted-foreground">
                  Recommended improvements based on your character's activity
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {suggestion.type === 'skill' ? '📈' : '💪'} 
                            Improve {suggestion.target}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                            suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {suggestion.priority}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {suggestion.reason} • Cost: {suggestion.cost} XP
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAdvancement({
                            type: suggestion.type,
                            target: suggestion.target,
                            cost: suggestion.cost
                          });
                          setShowAdvancementModal(true);
                        }}
                        disabled={suggestion.cost > advancement.availableExperience}
                      >
                        {suggestion.cost > advancement.availableExperience ? 'Not enough XP' : 'Advance'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advancement Goals */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Advancement Goals</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan your character's future development
                  </p>
                </div>
                
                {!readonly && (
                  <Button variant="primary" size="sm">
                    Add Goal
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              {advancement.goals.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-lg font-medium mb-2">No Goals Set</div>
                  <div className="text-sm text-muted-foreground">
                    Set advancement goals to plan your character's development
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {advancement.goals.map((goal, index) => (
                    <div
                      key={goal.id}
                      className="p-3 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{goal.description}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                              goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {goal.priority} priority
                            </span>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            Estimated cost: {goal.estimatedCost} XP
                            {goal.targetDate && (
                              <> • Target: {new Date(goal.targetDate).toLocaleDateString()}</>
                            )}
                          </div>
                        </div>
                        
                        {!readonly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Experience History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Experience History</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveTab('history')}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {advancement.records.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-lg font-medium mb-2">No Experience Records</div>
                  <div className="text-sm text-muted-foreground">
                    Experience gains and expenditures will appear here
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {advancement.records.slice(-5).reverse().map((record) => (
                    <div
                      key={record.id}
                      className="p-3 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{record.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.source ? `${record.source.replace('_', ' ')} • ` : ''}
                            {record.type.replace('_', ' ')} • {new Date(record.date).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className={`text-lg font-bold ${
                          record.amount < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {record.amount > 0 ? '+' : ''}{record.amount} XP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Character Milestones</h3>
              <p className="text-sm text-muted-foreground">
                Major achievements unlock special rewards and bonuses
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {advancement.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className={`p-4 border rounded-lg ${
                      milestone.achieved 
                        ? 'bg-green-50 border-green-200' 
                        : advancement.totalExperienceEarned >= milestone.experienceThreshold
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {milestone.achieved ? '🏆' : 
                             advancement.totalExperienceEarned >= milestone.experienceThreshold ? '⭐' : '⚪'}
                          </span>
                          <h4 className="font-medium">{milestone.name}</h4>
                          {milestone.achieved && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Achieved
                            </span>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {milestone.description}
                        </p>
                        
                        <div className="text-sm">
                          <span className="font-medium">Required XP:</span> {milestone.experienceThreshold}
                          {milestone.achieved && milestone.achievedAt && (
                            <span className="ml-4 text-muted-foreground">
                              Achieved: {new Date(milestone.achievedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        {milestone.rewards && milestone.rewards.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm font-medium">Rewards:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {milestone.rewards.map((reward, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                >
                                  {reward.description}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {!milestone.achieved && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ 
                              width: `${Math.min(100, (advancement.totalExperienceEarned / milestone.experienceThreshold) * 100)}%` 
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {advancement.totalExperienceEarned} / {milestone.experienceThreshold} XP
                          ({milestone.experienceThreshold - advancement.totalExperienceEarned} needed)
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Character History & Versions</h3>
                  <p className="text-sm text-muted-foreground">
                    Track character changes and restore previous versions
                  </p>
                </div>
                
                {!readonly && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={handleCreateSnapshot}
                  >
                    Create Snapshot
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {character.history?.snapshots?.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-lg font-medium mb-2">No Snapshots</div>
                    <div className="text-sm text-muted-foreground">
                      Create snapshots to track character changes over time
                    </div>
                  </div>
                ) : (
                  character.history?.snapshots?.slice(0, 10).map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className="p-4 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              v{snapshot.version}
                            </span>
                            <span className={`text-sm px-2 py-1 rounded ${
                              snapshot.snapshotType === 'milestone' ? 'bg-purple-100 text-purple-800' :
                              snapshot.snapshotType === 'session_end' ? 'bg-green-100 text-green-800' :
                              snapshot.snapshotType === 'major_change' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {snapshot.snapshotType.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(snapshot.snapshotDate).toLocaleString()}
                            </span>
                          </div>
                          
                          {snapshot.description && (
                            <p className="text-sm mb-2">{snapshot.description}</p>
                          )}
                          
                          {snapshot.metadata?.changesSummary && snapshot.metadata.changesSummary.length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Changes: {snapshot.metadata.changesSummary.join(', ')}
                            </div>
                          )}
                        </div>
                        
                        {!readonly && (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Compare
                            </Button>
                            <Button variant="outline" size="sm">
                              Restore
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Full Experience History */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Complete Experience History</h3>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {advancement.records.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-lg font-medium mb-2">No Experience Records</div>
                    <div className="text-sm text-muted-foreground">
                      Experience gains and expenditures will appear here
                    </div>
                  </div>
                ) : (
                  advancement.records.slice().reverse().map((record) => (
                    <div
                      key={record.id}
                      className="p-3 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{record.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.source && (
                              <span className="mr-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {record.source.replace('_', ' ')}
                              </span>
                            )}
                            {record.type.replace('_', ' ')} •
                            {new Date(record.date).toLocaleString()}
                            {record.sessionName && ` • ${record.sessionName}`}
                          </div>
                          {(record.difficulty || record.circumstance) && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {record.difficulty && `Difficulty: ${record.difficulty}`}
                              {record.circumstance && ` • ${record.circumstance}`}
                            </div>
                          )}
                        </div>
                        
                        <div className={`text-lg font-bold ${
                          record.amount < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {record.amount > 0 ? '+' : ''}{record.amount} XP
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sharing Tab */}
      {activeTab === 'sharing' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Character Sharing</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your character with others via links or QR codes
                  </p>
                </div>
                
                {!readonly && (
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => setShowSharingModal(true)}
                  >
                    Create Share
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {character.sharing?.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-lg font-medium mb-2">No Active Shares</div>
                    <div className="text-sm text-muted-foreground">
                      Create shareable links to show your character to others
                    </div>
                  </div>
                ) : (
                  character.sharing?.filter(s => s.isActive).map((share) => (
                    <div
                      key={share.id}
                      className="p-4 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">Shared Link</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              share.settings.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {share.settings.isPublic ? 'Public' : 'Private'}
                            </span>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mb-2">
                            Created: {new Date(share.createdAt).toLocaleDateString()}
                            {share.expiresAt && (
                              <> • Expires: {new Date(share.expiresAt).toLocaleDateString()}</>
                            )}
                          </div>
                          
                          <div className="text-sm">
                            Access count: {share.settings.accessCount || 0}
                            {share.settings.maxAccessCount && ` / ${share.settings.maxAccessCount}`}
                          </div>
                          
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm font-mono break-all">
                            {sharingService.getShareUrl(share.shareToken)}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          {share.qrCodeUrl && (
                            <img 
                              src={share.qrCodeUrl} 
                              alt="QR Code" 
                              className="w-20 h-20 border rounded"
                            />
                          )}
                          
                          {!readonly && (
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm">
                                Copy
                              </Button>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                Revoke
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advancement Tab */}
      {activeTab === 'advancement' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Character Advancement Options</h3>
              <p className="text-sm text-muted-foreground">
                Improve your character's skills and characteristics
              </p>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {/* Skill Advancement */}
                <div>
                  <h4 className="font-medium mb-3">Skill Advancement</h4>
                  <div className="space-y-2">
                    {character.skills.map((skill) => {
                      const costInfo = calculateSkillImprovementCost(skill, character);
                      return (
                        <div
                          key={skill.name}
                          className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30"
                        >
                          <div>
                            <span className="font-medium">{skill.name}</span>
                            <span className="ml-2 text-muted-foreground">Level {skill.level}</span>
                            {skill.specialty && (
                              <span className="ml-2 text-sm text-blue-600">({skill.specialty})</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {costInfo.totalCost} XP • {costInfo.trainingWeeks}w
                            </span>
                            
                            {!readonly && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAdvancement({
                                    type: 'skill',
                                    target: skill.name,
                                    cost: costInfo.totalCost
                                  });
                                  setShowAdvancementModal(true);
                                }}
                                disabled={!costInfo.canImprove}
                                title={costInfo.restrictions.join(', ')}
                              >
                                {costInfo.canImprove ? 'Improve' : 'Cannot Improve'}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Characteristic Advancement */}
                <div>
                  <h4 className="font-medium mb-3">Characteristic Advancement</h4>
                  <div className="space-y-2">
                    {Object.entries(character.characteristics).map(([charName, value]) => {
                      const costInfo = calculateCharacteristicImprovementCost(
                        charName as keyof typeof character.characteristics,
                        value,
                        character
                      );
                      return (
                        <div
                          key={charName}
                          className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30"
                        >
                          <div>
                            <span className="font-medium capitalize">{charName}</span>
                            <span className="ml-2 text-muted-foreground">{value}</span>
                            <span className="ml-2 text-sm text-blue-600">
                              (DM: {Math.floor((value - 6) / 3) > 0 ? '+' : ''}{Math.floor((value - 6) / 3)})
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {costInfo.totalCost} XP • {costInfo.trainingWeeks}w
                            </span>
                            
                            {!readonly && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedAdvancement({
                                    type: 'characteristic',
                                    target: charName,
                                    cost: costInfo.totalCost
                                  });
                                  setShowAdvancementModal(true);
                                }}
                                disabled={!costInfo.canImprove}
                                title={costInfo.restrictions.join(', ')}
                              >
                                {costInfo.canImprove ? 'Improve' : 'Cannot Improve'}
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modals */}
      {showAddXPModal && (
        <AddExperienceModal
          isOpen={showAddXPModal}
          onClose={() => setShowAddXPModal(false)}
          onAdd={handleAddExperience}
        />
      )}

      {showAdvancementModal && selectedAdvancement && (
        <AdvancementModal
          isOpen={showAdvancementModal}
          onClose={() => {
            setShowAdvancementModal(false);
            setSelectedAdvancement(null);
          }}
          advancement={selectedAdvancement}
          character={character}
          onConfirm={() => handleSpendExperience(
            selectedAdvancement.type,
            selectedAdvancement.target,
            selectedAdvancement.cost
          )}
        />
      )}

      {showSharingModal && (
        <SharingModal
          isOpen={showSharingModal}
          onClose={() => setShowSharingModal(false)}
          character={character}
          onCreateShare={handleCreateShare}
        />
      )}
    </div>
  );
};

// Modal Components
const AddExperienceModal = ({ 
  isOpen, 
  onClose, 
  onAdd 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onAdd: (source: ExperienceSource, amount: number, description: string) => void; 
}) => {
  const [source, setSource] = useState<ExperienceSource>('gm_award');
  const [amount, setAmount] = useState('1');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(source, parseInt(amount), description);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Experience Points">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Source</label>
          <select 
            value={source} 
            onChange={(e) => setSource(e.target.value as ExperienceSource)}
            className="w-full p-2 border border-border rounded"
          >
            {Object.keys(EXPERIENCE_REWARDS).map(key => (
              <option key={key} value={key}>
                {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this experience was gained from..."
            required
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Add XP</Button>
        </div>
      </form>
    </Modal>
  );
};

const AdvancementModal = ({ 
  isOpen, 
  onClose, 
  advancement, 
  character, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  advancement: { type: 'skill' | 'characteristic'; target: string; cost: number };
  character: any;
  onConfirm: () => void; 
}) => {
  const costInfo = advancement.type === 'skill' 
    ? calculateSkillImprovementCost(
        character.skills.find((s: any) => s.name === advancement.target), 
        character
      )
    : calculateCharacteristicImprovementCost(
        advancement.target as keyof CharacterCharacteristics,
        character.characteristics[advancement.target as keyof CharacterCharacteristics],
        character
      );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Improve ${advancement.target}`}>
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium mb-2">Advancement Details</h4>
          <div className="text-sm space-y-1">
            <div>Type: {advancement.type === 'skill' ? 'Skill' : 'Characteristic'} Improvement</div>
            <div>Target: {advancement.target}</div>
            <div>Cost: {costInfo.totalCost} XP</div>
            <div>Training Time: {costInfo.trainingWeeks} weeks</div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          This will spend {costInfo.totalCost} experience points to improve your {advancement.target}.
          {advancement.type === 'skill' ? ' Your skill level will increase by 1.' : ' Your characteristic will increase by 1.'}
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={onConfirm}
            disabled={!costInfo.canImprove}
          >
            Confirm Improvement
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const SharingModal = ({ 
  isOpen, 
  onClose, 
  character, 
  onCreateShare 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  character: any;
  onCreateShare: (settings: any) => void; 
}) => {
  const [settings, setSettings] = useState({
    isPublic: false,
    allowComments: false,
    allowDownload: false,
    expirationDate: '',
    maxAccessCount: '',
    permissions: ['view_full'] as SharingPermissionLevel[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateShare({
      ...settings,
      maxAccessCount: settings.maxAccessCount ? parseInt(settings.maxAccessCount) : undefined
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Character Share">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={settings.isPublic}
              onChange={(e) => setSettings({...settings, isPublic: e.target.checked})}
            />
            Make publicly discoverable
          </label>
          
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={settings.allowComments}
              onChange={(e) => setSettings({...settings, allowComments: e.target.checked})}
            />
            Allow comments
          </label>
          
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={settings.allowDownload}
              onChange={(e) => setSettings({...settings, allowDownload: e.target.checked})}
            />
            Allow download
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Expiration Date (optional)</label>
          <Input
            type="date"
            value={settings.expirationDate}
            onChange={(e) => setSettings({...settings, expirationDate: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Max Access Count (optional)</label>
          <Input
            type="number"
            value={settings.maxAccessCount}
            onChange={(e) => setSettings({...settings, maxAccessCount: e.target.value})}
            min="1"
            placeholder="Unlimited"
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Create Share</Button>
        </div>
      </form>
    </Modal>
  );
};

export default CharacterAdvancement;
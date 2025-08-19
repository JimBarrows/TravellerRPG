import React, { useState, useMemo } from 'react';
import type { CharacterSheetSectionProps } from '../../../types/characterSheet';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';
import Button from '../../../../../shared/components/atoms/Button';
import { useConditions } from '../../../hooks/useConditions';
import { SEVERITY_INFO, CONDITION_CATEGORIES } from '../../../data/conditions';
import {
  sortConditionsByPriority,
  formatConditionDuration,
  generateConditionAlerts,
  getConditionDMPenalty
} from '../../../utils/conditionUtils';
import ConditionCard from './components/ConditionCard';
import ConditionEffectsPanel from './components/ConditionEffectsPanel';
import AddConditionModal from './components/AddConditionModal';
import RecoveryPanel from './components/RecoveryPanel';
import ConditionAlertsPanel from './components/ConditionAlertsPanel';

type ViewMode = 'all' | 'priority' | 'type' | 'severity';
type FilterType = 'all' | 'physical' | 'mental' | 'social' | 'environmental' | 'medical' | 'fatigue' | 'aging' | 'augmentation';
type FilterSeverity = 'all' | 'minor' | 'moderate' | 'major' | 'critical' | 'terminal';

const CharacterConditions = ({ character, onUpdate, readonly }: CharacterSheetSectionProps) => {
  const {
    conditionStatus,
    activeConditions,
    totalPenalties,
    addCondition,
    updateCondition,
    removeCondition,
    attemptRecovery,
    getConditionWarnings,
    validateConditionCompatibility
  } = useConditions(character, onUpdate);

  const [viewMode, setViewMode] = useState<ViewMode>('priority');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterSeverity, setFilterSeverity] = useState<FilterSeverity>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [showRecoveryPanel, setShowRecoveryPanel] = useState(false);
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);

  // Filter and sort conditions based on current settings
  const displayConditions = useMemo(() => {
    let filtered = activeConditions;
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(condition => condition.type === filterType);
    }
    
    // Apply severity filter
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(condition => condition.severity === filterSeverity);
    }
    
    // Sort based on view mode
    switch (viewMode) {
      case 'priority':
        return sortConditionsByPriority(filtered);
      case 'severity':
        return filtered.sort((a, b) => {
          const severityOrder = { terminal: 5, critical: 4, major: 3, moderate: 2, minor: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        });
      case 'type':
        return filtered.sort((a, b) => a.type.localeCompare(b.type));
      default:
        return filtered;
    }
  }, [activeConditions, viewMode, filterType, filterSeverity]);

  // Get condition alerts
  const alerts = useMemo(() => 
    generateConditionAlerts(activeConditions, character.characteristics),
    [activeConditions, character.characteristics]
  );

  const handleConditionEdit = (conditionId: string) => {
    setSelectedConditionId(conditionId);
    setShowAddModal(true);
  };

  const handleConditionRemove = (conditionId: string) => {
    if (window.confirm('Are you sure you want to remove this condition?')) {
      removeCondition(conditionId);
    }
  };

  const handleRecoveryAttempt = (conditionId: string) => {
    setSelectedConditionId(conditionId);
    setShowRecoveryPanel(true);
  };

  return (
    <div className="space-y-6">
      {/* Condition Alerts */}
      {alerts.length > 0 && (
        <ConditionAlertsPanel alerts={alerts} />
      )}

      {/* Condition Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Status Conditions</h2>
              <p className="text-sm text-muted-foreground">
                {conditionStatus.totalActive} active condition{conditionStatus.totalActive !== 1 ? 's' : ''} affecting your character
              </p>
            </div>
            
            {!readonly && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEffectsPanel(!showEffectsPanel)}
                >
                  {showEffectsPanel ? 'Hide' : 'Show'} Effects
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Condition
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Quick Stats */}
          {conditionStatus.totalActive > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Active</div>
                <div className="text-lg font-semibold">{conditionStatus.totalActive}</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Critical/Terminal</div>
                <div className="text-lg font-semibold text-red-600">
                  {(conditionStatus.bySeverity.critical || 0) + (conditionStatus.bySeverity.terminal || 0)}
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Treatable</div>
                <div className="text-lg font-semibold text-blue-600">
                  {conditionStatus.treatable.length}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-muted-foreground">Healing</div>
                <div className="text-lg font-semibold text-green-600">
                  {conditionStatus.naturallyHealing.length}
                </div>
              </div>
            </div>
          )}

          {/* View Controls */}
          {conditionStatus.totalActive > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">View:</span>
                <select 
                  value={viewMode} 
                  onChange={(e) => setViewMode(e.target.value as ViewMode)}
                  className="text-sm border border-border rounded px-2 py-1"
                >
                  <option value="priority">Priority</option>
                  <option value="severity">Severity</option>
                  <option value="type">Type</option>
                  <option value="all">All</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Type:</span>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="text-sm border border-border rounded px-2 py-1"
                >
                  <option value="all">All Types</option>
                  <option value="physical">Physical</option>
                  <option value="mental">Mental</option>
                  <option value="social">Social</option>
                  <option value="environmental">Environmental</option>
                  <option value="medical">Medical</option>
                  <option value="fatigue">Fatigue</option>
                  <option value="aging">Aging</option>
                  <option value="augmentation">Augmentation</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Severity:</span>
                <select 
                  value={filterSeverity} 
                  onChange={(e) => setFilterSeverity(e.target.value as FilterSeverity)}
                  className="text-sm border border-border rounded px-2 py-1"
                >
                  <option value="all">All Severities</option>
                  <option value="terminal">Terminal</option>
                  <option value="critical">Critical</option>
                  <option value="major">Major</option>
                  <option value="moderate">Moderate</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
            </div>
          )}

          {/* Condition Effects Panel */}
          {showEffectsPanel && (
            <ConditionEffectsPanel 
              totalPenalties={totalPenalties} 
              characteristics={character.characteristics}
            />
          )}

          {/* Conditions List */}
          {displayConditions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg font-medium mb-2">
                {conditionStatus.totalActive === 0 ? 'No Active Conditions' : 'No Conditions Match Filter'}
              </div>
              <div className="text-sm text-muted-foreground">
                {conditionStatus.totalActive === 0 
                  ? 'Your character is currently in good health with no status effects'
                  : 'Try adjusting your filter settings to see more conditions'
                }
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {displayConditions.map((condition) => (
                <ConditionCard
                  key={condition.id}
                  condition={condition}
                  readonly={readonly}
                  onEdit={() => handleConditionEdit(condition.id)}
                  onRemove={() => handleConditionRemove(condition.id)}
                  onAttemptRecovery={() => handleRecoveryAttempt(condition.id)}
                  showRecoveryButton={!!condition.recovery}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recovery Management */}
      {conditionStatus.treatable.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Recovery & Treatment</h3>
            <p className="text-sm text-muted-foreground">
              {conditionStatus.treatable.length} condition{conditionStatus.treatable.length !== 1 ? 's' : ''} can be treated
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conditionStatus.treatable.map((condition) => (
                <div key={condition.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="font-medium">{condition.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {condition.recovery?.method} • {formatConditionDuration(condition)}
                      {condition.recovery?.costCredits && (
                        <> • {condition.recovery.costCredits} credits</>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRecoveryAttempt(condition.id)}
                    disabled={readonly}
                  >
                    Treat
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddConditionModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setSelectedConditionId(null);
          }}
          onAddCondition={addCondition}
          existingCondition={selectedConditionId ? activeConditions.find(c => c.id === selectedConditionId) : undefined}
          validateCompatibility={validateConditionCompatibility}
        />
      )}

      {showRecoveryPanel && selectedConditionId && (
        <RecoveryPanel
          isOpen={showRecoveryPanel}
          onClose={() => {
            setShowRecoveryPanel(false);
            setSelectedConditionId(null);
          }}
          condition={activeConditions.find(c => c.id === selectedConditionId)!}
          character={character}
          onAttemptRecovery={attemptRecovery}
        />
      )}
    </div>
  );
};

export default CharacterConditions;

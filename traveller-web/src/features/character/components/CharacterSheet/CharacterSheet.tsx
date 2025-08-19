import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { 
  CharacterSheetData, 
  CharacterSheetSection,
  SheetTab
} from '../../types/characterSheet';
import { DEFAULT_SHEET_TABS } from '../../types/characterSheet';
import { useCharacterForm } from '../../hooks/useCharacterForm';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import { useAppContext } from '../../../../shared/contexts/AppContext';
import Card from '../../../../shared/components/molecules/Card';
import Button from '../../../../shared/components/atoms/Button';
import SaveStatus from '../Feedback/SaveStatus';
import ConflictResolver from '../ConflictResolution/ConflictResolver';
import FormErrorBoundary from '../ErrorBoundary/FormErrorBoundary';
import CharacterBasics from './sections/CharacterBasics';
import CharacterSkills from './sections/CharacterSkills';
import CharacterEquipment from './sections/CharacterEquipment';
import CharacterFinances from './sections/CharacterFinances';
import CharacterConditions from './sections/CharacterConditions';
import CharacterNotes from './sections/CharacterNotes';
import CharacterAdvancement from './sections/CharacterAdvancement';
import SheetNavigation from './SheetNavigation';

interface CharacterSheetProps {
  character?: CharacterSheetData;
  readonly?: boolean;
  onUpdate?: (updates: Partial<CharacterSheetData>) => void;
  onSave?: (character: CharacterSheetData) => Promise<void>;
}

const CharacterSheet = ({ 
  character: initialCharacter,
  readonly = false,
  onUpdate: externalOnUpdate,
  onSave
}: CharacterSheetProps) => {
  const { characterId } = useParams<{ characterId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addNotification, setLoading } = useAppContext();
  
  const [character, setCharacter] = useState<CharacterSheetData | null>(initialCharacter || null);
  const [activeSection, setActiveSection] = useState<CharacterSheetSection>(
    (searchParams.get('section') as CharacterSheetSection) || 'basics'
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConflictResolver, setShowConflictResolver] = useState(false);
  const [conflictData, setConflictData] = useState<{
    local: CharacterSheetData;
    server: CharacterSheetData;
  } | null>(null);
  
  // Form management
  const {
    formState,
    updateField,
    validateForm,
    saveForm,
    resetForm,
    getFieldError,
    canSave
  } = useCharacterForm(character!, {
    autoSave: !readonly,
    debounceMs: 500,
    enableOptimisticUpdates: true,
    onSaveSuccess: (savedCharacter) => {
      setCharacter(savedCharacter);
      setSaveError(null);
      onSave?.(savedCharacter);
    },
    onSaveError: (error) => {
      setSaveError(error.message);
    },
    onConflict: (localData, serverData) => {
      setConflictData({ local: localData, server: serverData });
      setShowConflictResolver(true);
    },
  });

  // Undo/Redo functionality
  const {
    currentData: undoRedoData,
    canUndo,
    canRedo,
    undo,
    redo,
    createCheckpoint
  } = useUndoRedo(character!, {
    maxHistorySize: 50,
    enableKeyboardShortcuts: !readonly,
  });

  // Load character data if not provided
  useEffect(() => {
    if (!initialCharacter && characterId) {
      // TODO: Load character from storage service
      console.log('Loading character:', characterId);
    }
  }, [characterId, initialCharacter]);
  
  // Update URL when section changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('section', activeSection);
    setSearchParams(params, { replace: true });
  }, [activeSection, searchParams, setSearchParams]);
  
  // Handle character updates
  const handleUpdate = useCallback((updates: Partial<CharacterSheetData>) => {
    if (!character || readonly) return;
    
    // Update form state
    Object.entries(updates).forEach(([field, value]) => {
      updateField(field, value);
    });
    
    // Update local character state
    const updatedCharacter = {
      ...character,
      ...updates,
      lastModified: new Date().toISOString(),
      version: character.version + 1
    };
    
    setCharacter(updatedCharacter);
    
    // Call external update handler if provided
    externalOnUpdate?.(updates);
  }, [character, readonly, updateField, externalOnUpdate]);
  
  // Manual save
  const handleSave = async () => {
    if (!character || readonly) return;
    
    try {
      await saveForm();
      setSaveError(null);
    } catch (error) {
      console.error('Save failed:', error);
      setSaveError(error instanceof Error ? error.message : 'Save failed');
    }
  };

  // Handle undo/redo actions
  const handleUndo = useCallback(() => {
    if (!canUndo || readonly) return;
    const previousData = undo();
    if (previousData) {
      setCharacter(previousData);
    }
  }, [canUndo, readonly, undo]);

  const handleRedo = useCallback(() => {
    if (!canRedo || readonly) return;
    const nextData = redo();
    if (nextData) {
      setCharacter(nextData);
    }
  }, [canRedo, readonly, redo]);

  // Handle conflict resolution
  const handleConflictResolve = useCallback((
    resolvedData: CharacterSheetData,
    strategy: 'local' | 'server' | 'merge'
  ) => {
    setCharacter(resolvedData);
    setShowConflictResolver(false);
    setConflictData(null);
    
    // Create checkpoint after conflict resolution
    createCheckpoint(`Conflict resolved using ${strategy} strategy`);
    
    addNotification({
      type: 'success',
      title: 'Conflict resolved',
      message: `Successfully resolved conflicts using ${strategy} strategy.`,
    });
  }, [createCheckpoint, addNotification]);
  
  
  // Handle section navigation
  const handleSectionChange = (section: CharacterSheetSection) => {
    setActiveSection(section);
  };
  
  // Calculate navigation badges
  const getTabBadge = (tabId: CharacterSheetSection): string | number | undefined => {
    if (!character) return undefined;
    
    switch (tabId) {
      case 'conditions':
        return character.conditions.length > 0 ? character.conditions.length : undefined;
      case 'advancement':
        return character.advancement.availableExperience > 0 ? character.advancement.availableExperience : undefined;
      case 'notes':
        return character.notes.length > 0 ? character.notes.length : undefined;
      default:
        return undefined;
    }
  };
  
  const tabs: SheetTab[] = DEFAULT_SHEET_TABS.map(tab => ({
    ...tab,
    badge: getTabBadge(tab.id)
  }));
  
  // Render section content
  const renderSection = () => {
    if (!character) {
      return (
        <Card className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Loading character...</div>
            <div className="text-sm text-muted-foreground">Please wait while we load your character sheet</div>
          </div>
        </Card>
      );
    }
    
    const sectionProps = {
      character,
      onUpdate: handleUpdate,
      readonly
    };
    
    switch (activeSection) {
      case 'basics':
        return <CharacterBasics {...sectionProps} />;
      case 'skills':
        return <CharacterSkills {...sectionProps} />;
      case 'equipment':
        return <CharacterEquipment {...sectionProps} />;
      case 'finances':
        return <CharacterFinances {...sectionProps} />;
      case 'conditions':
        return <CharacterConditions {...sectionProps} />;
      case 'notes':
        return <CharacterNotes {...sectionProps} />;
      case 'advancement':
        return <CharacterAdvancement {...sectionProps} />;
      default:
        return (
          <Card className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-lg font-medium mb-2">Section not found</div>
              <div className="text-sm text-muted-foreground">The requested section could not be found</div>
            </div>
          </Card>
        );
    }
  };
  
  
  // Don't render if no character data
  if (!character) {
    return (
      <Card className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No character selected</div>
          <div className="text-sm text-muted-foreground">Please select a character to view their sheet</div>
        </div>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold truncate">
                {character?.name || 'Character Sheet'}
              </h1>
              
              {character && (
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{character.species}</span>
                  <span>•</span>
                  <span>Age {character.age}</span>
                  {character.careers.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{character.careers[character.careers.length - 1].career}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Save status and controls */}
              {!readonly && (
                <div className="hidden sm:flex items-center gap-3">
                  {/* Undo/Redo buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUndo}
                      disabled={!canUndo}
                      title="Undo (Ctrl+Z)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRedo}
                      disabled={!canRedo}
                      title="Redo (Ctrl+Y)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
                      </svg>
                    </Button>
                  </div>
                  
                  {/* Save status */}
                  <SaveStatus
                    isSaving={formState.isSaving}
                    hasUnsavedChanges={formState.hasUnsavedChanges}
                    lastSaved={formState.lastSaved}
                    saveError={saveError}
                    conflictDetected={showConflictResolver}
                    onRetry={handleSave}
                    onResolveConflict={() => setShowConflictResolver(true)}
                  />
                </div>
              )}
              
              {/* Save button */}
              {!readonly && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={!canSave}
                  loading={formState.isSaving}
                >
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <SheetNavigation
          tabs={tabs}
          activeTab={activeSection}
          onTabChange={handleSectionChange}
        />
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FormErrorBoundary>
          <div className="space-y-6">
            {renderSection()}
          </div>
        </FormErrorBoundary>
      </div>
      
      {/* Conflict Resolution Modal */}
      {showConflictResolver && conflictData && (
        <ConflictResolver
          localData={conflictData.local}
          serverData={conflictData.server}
          isOpen={showConflictResolver}
          onResolve={handleConflictResolve}
          onCancel={() => {
            setShowConflictResolver(false);
            setConflictData(null);
          }}
        />
      )}
    </div>
  );
};

export default CharacterSheet;

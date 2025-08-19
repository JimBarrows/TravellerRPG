import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApolloClient } from '@apollo/client';
import * as z from 'zod';
import type { CharacterCreationData } from '../../types/characterCreation';
import { 
  CreationStep, 
  CREATION_STEPS 
} from '../../types/characterCreation';
import { useAppContext } from '../../../../shared/contexts/AppContext';
import { getCharacterStorageService } from '../../services/characterStorageService';
import { handleAsyncError, validateStep, formatValidationErrors } from '../../utils/errorHandling';
import WizardProgress from './WizardProgress';
import BasicInfoStep from './steps/BasicInfoStep';
import CharacteristicsStep from './steps/CharacteristicsStep';
import BackgroundStep from './steps/BackgroundStep';
import CareerStep from './steps/CareerStep';
import SkillsStep from './steps/SkillsStep';
import EquipmentStep from './steps/EquipmentStep';
import PortraitStep from './steps/PortraitStep';
import ReviewStep from './steps/ReviewStep';
import Button from '../../../../shared/components/atoms/Button';
import Card from '../../../../shared/components/molecules/Card';

// Validation schema for the entire character
const characterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  species: z.enum(['Human', 'Vargr', 'Aslan', 'Other']),
  gender: z.string().min(1),
  age: z.number().min(18).max(100),
  characteristics: z.object({
    strength: z.number().min(1).max(15),
    dexterity: z.number().min(1).max(15),
    endurance: z.number().min(1).max(15),
    intelligence: z.number().min(1).max(15),
    education: z.number().min(1).max(15),
    social: z.number().min(1).max(15),
  }),
  background: z.object({
    homeworld: z.string().min(1),
    uwp: z.object({
      starport: z.string(),
      size: z.number(),
      atmosphere: z.number(),
      hydrosphere: z.number(),
      population: z.number(),
      government: z.number(),
      lawLevel: z.number(),
      techLevel: z.number(),
    }).optional(),
    socialClass: z.enum(['Lower', 'Middle', 'Upper']),
    upbringing: z.string(),
    family: z.string(),
    earlyLife: z.string(),
    startingSkills: z.array(z.string()),
  }),
  careers: z.array(z.object({
    termNumber: z.number(),
    career: z.string(),
    branch: z.string().optional(),
    rank: z.number(),
    rankTitle: z.string(),
    survived: z.boolean(),
    commissioned: z.boolean(),
    advanced: z.boolean(),
    qualificationRoll: z.number().optional(),
    survivalRoll: z.number().optional(),
    commissionRoll: z.number().optional(),
    advancementRoll: z.number().optional(),
    skillsGained: z.array(z.string()),
    events: z.array(z.object({
      id: z.string(),
      description: z.string(),
      type: z.enum(['event', 'mishap', 'connection', 'rival']),
      skillGains: z.array(z.string()).optional(),
      characteristicModifiers: z.any().optional(),
      connections: z.array(z.string()).optional(),
      rivals: z.array(z.string()).optional(),
      details: z.string().optional(),
    })),
    mishap: z.object({
      id: z.string(),
      description: z.string(),
      type: z.enum(['event', 'mishap', 'connection', 'rival']),
      skillGains: z.array(z.string()).optional(),
      characteristicModifiers: z.any().optional(),
      connections: z.array(z.string()).optional(),
      rivals: z.array(z.string()).optional(),
      details: z.string().optional(),
    }).optional(),
    reenlistRoll: z.number().optional(),
    mustered: z.boolean(),
    benefits: z.array(z.string()),
    cashReceived: z.number(),
  })),
  careerProgression: z.object({
    totalTerms: z.number(),
    currentAge: z.number(),
    retiredInvoluntarily: z.boolean(),
    retiredVoluntarily: z.boolean(),
    canReenlist: z.boolean(),
    mustLeave: z.boolean(),
    mustLeaveReason: z.string().optional(),
  }),
  totalTerms: z.number(),
  skills: z.array(z.object({
    name: z.string(),
    level: z.number(),
    specialty: z.string().optional(),
  })),
  lifeEvents: z.array(z.object({
    id: z.string(),
    description: z.string(),
    type: z.enum(['event', 'mishap', 'connection', 'rival']),
    skillGains: z.array(z.string()).optional(),
    characteristicModifiers: z.any().optional(),
    connections: z.array(z.string()).optional(),
    rivals: z.array(z.string()).optional(),
    details: z.string().optional(),
  })),
  connections: z.array(z.string()),
  rivals: z.array(z.string()),
  startingCredits: z.number(),
  equipment: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    cost: z.number(),
    weight: z.number(),
    quantity: z.number(),
  })),
  portrait: z.string().optional(),
  avatarSeed: z.string().optional(),
  status: z.enum(['draft', 'complete']),
});

type CharacterFormData = z.infer<typeof characterSchema>;

const initialCharacterData: CharacterCreationData = {
  name: '',
  species: 'Human',
  gender: '',
  age: 18,
  characteristics: {
    strength: 7,
    dexterity: 7,
    endurance: 7,
    intelligence: 7,
    education: 7,
    social: 7,
  },
  background: {
    homeworld: '',
    socialClass: 'Middle',
    upbringing: '',
    family: '',
    earlyLife: '',
    startingSkills: [],
  },
  careers: [],
  careerProgression: {
    totalTerms: 0,
    currentAge: 18,
    retiredInvoluntarily: false,
    retiredVoluntarily: false,
    canReenlist: true,
    mustLeave: false,
  },
  totalTerms: 0,
  skills: [],
  lifeEvents: [],
  connections: [],
  rivals: [],
  startingCredits: 1000,
  equipment: [],
  status: 'draft',
};

const CharacterCreationWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const apolloClient = useApolloClient();
  const { addNotification, setLoading } = useAppContext();
  const [currentStep, setCurrentStep] = useState<CreationStep>(CreationStep.BASIC_INFO);
  const [characterData, setCharacterData] = useState<CharacterCreationData>(initialCharacterData);
  const [isSaving, setIsSaving] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  
  // Get campaign ID from URL params or use a default
  const campaignId = searchParams.get('campaignId') || 'default-campaign';
  
  // Storage service
  const storageService = getCharacterStorageService(apolloClient);
  
  // Auto-save timer ref
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const methods = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: characterData,
    mode: 'onChange',
  });

  const { handleSubmit, trigger } = methods;

  // Auto-save functionality
  const scheduleAutoSave = useCallback(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
    
    autoSaveTimer.current = setTimeout(() => {
      performAutoSave();
    }, 30000); // Auto-save every 30 seconds
  }, [characterData, currentStep]);

  const performAutoSave = useCallback(async () => {
    if (!characterData.name?.trim()) {
      return; // Don't auto-save if no name
    }

    try {
      await storageService.autoSave(characterData, campaignId, currentStep);
      setLastAutoSave(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Silent failure for auto-save
    }
  }, [characterData, currentStep, campaignId, storageService]);

  // Manual save draft
  const saveDraft = async (showNotification = true) => {
    if (!characterData.name?.trim()) {
      addNotification({
        type: 'warning',
        title: 'Cannot save',
        message: 'Please enter a character name before saving',
      });
      return;
    }

    setIsSaving(true);
    
    const result = await handleAsyncError(
      () => storageService.saveDraft({
        campaignId,
        step: currentStep,
        characterData,
        isAutoSave: false,
        characterId: currentDraftId || undefined
      }),
      {
        operationName: 'save character draft',
        showNotification: showNotification ? addNotification : undefined,
        fallbackMessage: 'Failed to save character draft. Please try again.'
      }
    );

    if (result) {
      setCurrentDraftId(result.id);
      
      if (showNotification) {
        addNotification({
          type: 'success',
          title: 'Draft saved',
          message: 'Your character has been saved as a draft',
        });
      }
    }
    
    setIsSaving(false);
  };

  // Load draft functionality
  const loadDraft = useCallback(async () => {
    const draftId = searchParams.get('draftId');
    
    if (draftId) {
      try {
        const draft = await storageService.loadDraft(draftId);
        if (draft) {
          setCharacterData(draft.characterData);
          setCurrentStep(draft.step as CreationStep);
          setCurrentDraftId(draft.id);
          methods.reset(draft.characterData);
          
          addNotification({
            type: 'success',
            title: 'Draft loaded',
            message: 'Your character draft has been loaded',
          });
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
        addNotification({
          type: 'error',
          title: 'Load failed',
          message: 'Failed to load character draft',
        });
      }
    } else {
      // Try to load the most recent auto-save for this campaign
      try {
        const drafts = await storageService.loadDrafts(campaignId);
        const autoSaveDrafts = drafts.filter(d => d.isAutoSave);
        
        if (autoSaveDrafts.length > 0) {
          // Get the most recent auto-save
          const latestDraft = autoSaveDrafts.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
          
          setCharacterData(latestDraft.characterData);
          setCurrentStep(latestDraft.step as CreationStep);
          setCurrentDraftId(latestDraft.id);
          methods.reset(latestDraft.characterData);
          
          addNotification({
            type: 'info',
            title: 'Previous session restored',
            message: 'Your previous character creation session has been restored',
          });
        }
      } catch (error) {
        console.error('Failed to load auto-save:', error);
      }
    }
  }, [searchParams, campaignId, storageService, methods, addNotification]);

  // Load draft on component mount
  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // Schedule auto-save when character data changes
  useEffect(() => {
    scheduleAutoSave();
    
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [scheduleAutoSave]);

  const updateCharacterData = (updates: Partial<CharacterCreationData>) => {
    setCharacterData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNextStep = async () => {
    // Validate current step using both form validation and custom validation
    const stepFields = getStepFields(currentStep);
    const isFormValid = await trigger(stepFields);
    
    // Additional custom validation
    const validationErrors = validateStep(characterData, currentStep);
    
    if (validationErrors.length > 0) {
      const errorMessage = formatValidationErrors(validationErrors);
      addNotification({
        type: 'warning',
        title: 'Validation Error',
        message: errorMessage,
      });
      return false;
    }
    
    return isFormValid;
  };

  const getStepFields = (step: CreationStep): (keyof CharacterFormData)[] => {
    switch (step) {
      case CreationStep.BASIC_INFO:
        return ['name', 'species', 'gender', 'age'];
      case CreationStep.CHARACTERISTICS:
        return ['characteristics'];
      case CreationStep.BACKGROUND:
        return ['background'];
      case CreationStep.CAREER:
        return ['careers', 'careerProgression'];
      case CreationStep.SKILLS:
        return ['skills'];
      case CreationStep.EQUIPMENT:
        return ['equipment', 'startingCredits'];
      case CreationStep.PORTRAIT:
        return ['portrait', 'avatarSeed'];
      default:
        return [];
    }
  };

  const handleNext = async () => {
    const canProceed = await canProceedToNextStep();
    if (canProceed && currentStep < CreationStep.REVIEW) {
      setCurrentStep((currentStep + 1) as CreationStep);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > CreationStep.BASIC_INFO) {
      setCurrentStep((currentStep - 1) as CreationStep);
      window.scrollTo(0, 0);
    }
  };

  const handleStepClick = async (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step as CreationStep);
    } else if (step === currentStep + 1) {
      await handleNext();
    }
  };

  const handleComplete = async (data: CharacterFormData) => {
    try {
      setLoading(true);
      
      // Mark character as complete
      const completedCharacterData = { ...characterData, status: 'complete' as const };
      
      if (currentDraftId) {
        // Create character from existing draft
        await storageService.createCharacterFromDraft({
          draftId: currentDraftId,
          campaignId
        });
        
        // Clean up the draft
        await storageService.deleteDraft(currentDraftId);
      } else {
        // Save as a new character
        await storageService.saveDraft({
          campaignId,
          step: CreationStep.REVIEW,
          characterData: completedCharacterData,
          isAutoSave: false
        });
      }
      
      // Clear any auto-save timers
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      addNotification({
        type: 'success',
        title: 'Character created!',
        message: 'Your character has been successfully created',
      });
      
      navigate(`/dashboard/characters?campaignId=${campaignId}`);
    } catch (error) {
      console.error('Failed to create character:', error);
      addNotification({
        type: 'error',
        title: 'Creation failed',
        message: 'Failed to create character. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    const stepProps = {
      data: characterData,
      updateData: updateCharacterData,
      onNext: handleNext,
      onPrevious: handlePrevious,
      canGoNext: true,
    };

    switch (currentStep) {
      case CreationStep.BASIC_INFO:
        return <BasicInfoStep {...stepProps} />;
      case CreationStep.CHARACTERISTICS:
        return <CharacteristicsStep {...stepProps} />;
      case CreationStep.BACKGROUND:
        return <BackgroundStep {...stepProps} />;
      case CreationStep.CAREER:
        return <CareerStep {...stepProps} />;
      case CreationStep.SKILLS:
        return <SkillsStep {...stepProps} />;
      case CreationStep.EQUIPMENT:
        return <EquipmentStep {...stepProps} />;
      case CreationStep.PORTRAIT:
        return <PortraitStep {...stepProps} />;
      case CreationStep.REVIEW:
        return <ReviewStep {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleComplete)} className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Character</h1>
          <p className="text-muted-foreground">
            Follow the Traveller lifepath system to create your character
          </p>
        </div>

        <WizardProgress 
          steps={CREATION_STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        <Card className="mt-8">
          <div className="p-6">
            {renderStep()}
          </div>
        </Card>

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-4">
            {isSaving && (
              <span className="text-sm text-muted-foreground">
                Saving draft...
              </span>
            )}
            
            {lastAutoSave && (
              <span className="text-xs text-muted-foreground">
                Last auto-saved: {lastAutoSave.toLocaleTimeString()}
              </span>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => saveDraft()}
              disabled={isSaving || !characterData.name?.trim()}
            >
              Save Draft
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === CreationStep.BASIC_INFO}
            >
              Previous
            </Button>
            
            {currentStep < CreationStep.REVIEW ? (
              <Button
                type="button"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
              >
                Create Character
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default CharacterCreationWizard;
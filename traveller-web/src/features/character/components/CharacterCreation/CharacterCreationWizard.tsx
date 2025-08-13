import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { CharacterCreationData } from '../../types/characterCreation';
import { 
  CreationStep, 
  CREATION_STEPS 
} from '../../types/characterCreation';
import { useAppContext } from '../../../../shared/contexts/AppContext';
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
    socialClass: z.enum(['Lower', 'Middle', 'Upper']),
    upbringing: z.string(),
    family: z.string(),
    earlyLife: z.string(),
  }),
  careers: z.array(z.object({
    career: z.string(),
    rank: z.number(),
    survived: z.boolean(),
    skills: z.array(z.string()),
    events: z.array(z.string()),
    mishaps: z.string().optional(),
    benefits: z.array(z.string()).optional(),
  })),
  totalTerms: z.number(),
  skills: z.array(z.object({
    name: z.string(),
    level: z.number(),
    specialty: z.string().optional(),
  })),
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
  },
  careers: [],
  totalTerms: 0,
  skills: [],
  startingCredits: 1000,
  equipment: [],
  status: 'draft',
};

const CharacterCreationWizard = () => {
  const navigate = useNavigate();
  const { addNotification, setLoading } = useAppContext();
  const [currentStep, setCurrentStep] = useState<CreationStep>(CreationStep.BASIC_INFO);
  const [characterData, setCharacterData] = useState<CharacterCreationData>(initialCharacterData);
  const [isSaving, setIsSaving] = useState(false);

  const methods = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: characterData,
    mode: 'onChange',
  });

  const { handleSubmit, trigger } = methods;

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (characterData.name) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [characterData]);

  const saveDraft = async () => {
    try {
      setIsSaving(true);
      // TODO: Save to backend/localStorage
      localStorage.setItem('character-draft', JSON.stringify(characterData));
      addNotification({
        type: 'info',
        title: 'Draft saved',
        message: 'Your character has been saved as a draft',
      });
    } catch (error) {
      console.error('Failed to save draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const loadDraft = () => {
    const draft = localStorage.getItem('character-draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setCharacterData(parsedDraft);
        methods.reset(parsedDraft);
        addNotification({
          type: 'success',
          title: 'Draft loaded',
          message: 'Your previous character draft has been loaded',
        });
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  };

  useEffect(() => {
    loadDraft();
  }, []);

  const updateCharacterData = (updates: Partial<CharacterCreationData>) => {
    setCharacterData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNextStep = async () => {
    // Validate current step fields
    const stepFields = getStepFields(currentStep);
    const isValid = await trigger(stepFields as any);
    return isValid;
  };

  const getStepFields = (step: CreationStep) => {
    switch (step) {
      case CreationStep.BASIC_INFO:
        return ['name', 'species', 'gender', 'age'];
      case CreationStep.CHARACTERISTICS:
        return ['characteristics'];
      case CreationStep.BACKGROUND:
        return ['background'];
      case CreationStep.CAREER:
        return ['careers', 'totalTerms'];
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
      // TODO: Submit to backend
      console.log('Submitting character:', data);
      
      // Clear draft
      localStorage.removeItem('character-draft');
      
      addNotification({
        type: 'success',
        title: 'Character created!',
        message: 'Your character has been successfully created',
      });
      
      navigate('/dashboard/characters');
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
          <div>
            {isSaving && (
              <span className="text-sm text-muted-foreground">
                Saving draft...
              </span>
            )}
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
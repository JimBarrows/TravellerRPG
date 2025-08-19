import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { WizardStepProps, CareerTerm, CharacterEquipment } from '../../../types/characterCreation';
import Button from '../../../../../shared/components/atoms/Button';
import Card from '../../../../../shared/components/molecules/Card';
import { CAREERS, type Career } from '../../../data/careers';
import { LifepathEngine, type TermResolution } from '../../../utils/lifepathEngine';

interface CareerStepState {
  selectedCareer: Career | null;
  currentTerm: number;
  isInCareer: boolean;
  lifepathEngine: LifepathEngine;
  termHistory: TermResolution[];
  autoMode: boolean;
  showTermDetails: boolean;
}

const CareerStep = ({ data, updateData }: WizardStepProps) => {
  const { setValue, watch } = useFormContext();
  const [state, setState] = useState<CareerStepState>({
    selectedCareer: null,
    currentTerm: 0,
    isInCareer: false,
    lifepathEngine: new LifepathEngine({ allowPlayerChoice: true }),
    termHistory: [],
    autoMode: false,
    showTermDetails: true,
  });

  const careers = watch('careers') || data.careers;
  const characteristics = watch('characteristics') || data.characteristics;

  useEffect(() => {
    setValue('careers', careers);
  }, [careers, setValue]);

  const handleCareerSelect = (career: Career) => {
    setState(prev => ({ ...prev, selectedCareer: career }));
  };

  const attemptCareerEntry = () => {
    if (!state.selectedCareer) return;

    const qualification = state.lifepathEngine.checkCareerQualification(
      state.selectedCareer,
      characteristics,
      careers
    );

    if (qualification.qualified) {
      setState(prev => ({
        ...prev,
        isInCareer: true,
        currentTerm: 1,
      }));
    } else {
      // Failed qualification - try draft or drifter
      alert(`Failed to qualify for ${state.selectedCareer.name}. Roll: ${qualification.roll} + ${qualification.dm} = ${qualification.roll + qualification.dm} (needed ${qualification.target})`);
    }
  };

  const serveTerm = () => {
    if (!state.selectedCareer) return;

    const currentRank = getCurrentRank();
    const isOfficer = isCurrentlyOfficer();

    const termResult = state.lifepathEngine.generateCareerTerm(
      state.selectedCareer,
      characteristics,
      state.currentTerm,
      currentRank,
      isOfficer
    );

    // Update character age
    const newAge = data.age + 4; // Each term is 4 years
    updateData({ age: newAge });

    // Apply characteristic changes
    if (Object.keys(termResult.characteristicChanges).length > 0) {
      const newCharacteristics = { ...characteristics };
      Object.entries(termResult.characteristicChanges).forEach(([key, value]) => {
        if (value !== undefined) {
          newCharacteristics[key as keyof typeof newCharacteristics] += value;
        }
      });
      updateData({ characteristics: newCharacteristics });
    }

    // Add term to career history
    const newCareers = [...careers, termResult.term];
    updateData({ careers: newCareers });

    // Update state
    setState(prev => ({
      ...prev,
      termHistory: [...prev.termHistory, termResult],
      currentTerm: prev.currentTerm + 1,
      isInCareer: !termResult.mustLeave,
    }));

    // Check if must leave career
    if (termResult.mustLeave) {
      setState(prev => ({ ...prev, isInCareer: false, selectedCareer: null }));
    }
  };

  const musterOut = () => {
    if (!state.selectedCareer) return;

    const totalTerms = careers.filter((c: CareerTerm) => c.career === state.selectedCareer!.name).length;
    const highestRank = Math.max(...careers.filter((c: CareerTerm) => c.career === state.selectedCareer!.name).map((c: CareerTerm) => c.rank));

    const benefits = state.lifepathEngine.musterOutBenefits(
      state.selectedCareer,
      highestRank,
      totalTerms,
      characteristics
    );

    // Update character with benefits
    const newEquipment: CharacterEquipment[] = benefits.benefits.map(b => ({
      id: `benefit-${Date.now()}-${b}`,
      name: b,
      type: 'Benefit',
      cost: 0,
      weight: 0,
      quantity: 1,
    }));

    updateData({
      startingCredits: data.startingCredits + benefits.cash,
      equipment: [...data.equipment, ...newEquipment],
    });

    setState(prev => ({ ...prev, isInCareer: false, selectedCareer: null }));
  };

  const retireFromCareer = () => {
    setState(prev => ({ ...prev, isInCareer: false }));
  };

  const continueCareer = () => {
    serveTerm();
  };

  const getCurrentRank = (): number => {
    if (!state.selectedCareer) return 0;
    const careerTerms = careers.filter((c: CareerTerm) => c.career === state.selectedCareer!.name);
    return careerTerms.length > 0 ? Math.max(...careerTerms.map((c: CareerTerm) => c.rank)) : 0;
  };

  const isCurrentlyOfficer = (): boolean => {
    if (!state.selectedCareer) return false;
    const careerTerms = careers.filter((c: CareerTerm) => c.career === state.selectedCareer!.name);
    return careerTerms.some((c: CareerTerm) => c.commissioned);
  };

  const getCareerSummary = (career: Career) => {
    const terms = careers.filter((c: CareerTerm) => c.career === career.name);
    const totalTerms = terms.length;
    const highestRank = totalTerms > 0 ? Math.max(...terms.map((c: CareerTerm) => c.rank)) : 0;
    const isOfficer = terms.some((c: CareerTerm) => c.commissioned);

    return { totalTerms, highestRank, isOfficer };
  };

  const availableCareers = CAREERS.filter(career => {
    // Check if character has already served in this career
    const hasServed = careers.some((c: CareerTerm) => c.career === career.name);
    return !hasServed || state.selectedCareer?.id === career.id;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Career Path</h2>
        <p className="text-muted-foreground">
          Choose your character's career and serve terms to gain skills, rank, and benefits.
        </p>
      </div>

      {/* Character Status */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-3">Character Status</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Age</div>
              <div className="text-xl font-bold">{data.age}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Terms</div>
              <div className="text-xl font-bold">{careers.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Credits</div>
              <div className="text-xl font-bold">{data.startingCredits.toLocaleString()} Cr</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-sm font-medium">
                {state.isInCareer ? `Active: ${state.selectedCareer?.name}` : 'Civilian'}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Career Selection */}
      {!state.isInCareer && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-4">Choose Career</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableCareers.map((career) => {
                const isSelected = state.selectedCareer?.id === career.id;
                const summary = getCareerSummary(career);
                const qualification = state.lifepathEngine.checkCareerQualification(
                  career,
                  characteristics,
                  careers
                );
                
                return (
                  <button
                    key={career.id}
                    type="button"
                    onClick={() => handleCareerSelect(career)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-medium mb-1">{career.name}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {career.description}
                    </div>
                    
                    {summary.totalTerms > 0 && (
                      <div className="text-xs mb-2">
                        Previous service: {summary.totalTerms} terms, Rank {summary.highestRank}
                        {summary.isOfficer && ' (Officer)'}
                      </div>
                    )}
                    
                    <div className="text-xs">
                      <div>Qualification: {career.qualification.characteristic.toUpperCase()} {qualification.target}+</div>
                      <div className={qualification.qualified ? 'text-green-600' : 'text-red-600'}>
                        Your roll: {qualification.target}+ 
                        {qualification.qualified ? ' ✓' : ' ✗'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {state.selectedCareer && (
              <div className="mt-4 flex gap-3">
                <Button
                  type="button"
                  variant="primary"
                  onClick={attemptCareerEntry}
                >
                  Enter {state.selectedCareer.name}
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Active Career Management */}
      {state.isInCareer && state.selectedCareer && (
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">
                {state.selectedCareer.name} - Term {state.currentTerm}
              </h3>
              <div className="text-sm text-muted-foreground">
                Current Rank: {getCurrentRank()} {isCurrentlyOfficer() && '(Officer)'}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="primary"
                onClick={continueCareer}
              >
                Serve Term {state.currentTerm}
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={retireFromCareer}
                >
                  Leave Career
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={musterOut}
                >
                  Muster Out
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Career History */}
      {careers.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-4">Career History</h3>
            
            <div className="space-y-4">
              {careers.map((term: CareerTerm, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">
                        Term {term.termNumber}: {term.career}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {term.rankTitle} (Rank {term.rank})
                        {term.commissioned && ' - Officer'}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Age {18 + (term.termNumber * 4) - 4}-{18 + (term.termNumber * 4)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium mb-1">Skills Gained</div>
                      <div className="text-muted-foreground">
                        {term.skillsGained.join(', ') || 'None'}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium mb-1">Events</div>
                      <div className="text-muted-foreground">
                        {term.events.map((e: any) => e.description).join(', ') || 'None'}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium mb-1">Status</div>
                      <div className="text-muted-foreground">
                        {term.survived ? 'Survived' : 'Mishap'}
                        {term.advanced && ', Advanced'}
                        {term.commissioned && ', Commissioned'}
                      </div>
                    </div>
                  </div>

                  {term.mishap && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                      <div className="font-medium text-red-800">Mishap:</div>
                      <div className="text-red-700">{term.mishap.description}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Career Completion */}
      {!state.isInCareer && careers.length > 0 && (
        <Card className="bg-muted/50">
          <div className="p-4">
            <h3 className="font-semibold mb-3">Ready for Next Step</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your character has completed their career path. You can continue to the skills step 
              to finalize skill levels and choose specializations.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Final Age</div>
                <div className="font-medium">{data.age}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Terms</div>
                <div className="font-medium">{careers.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Credits</div>
                <div className="font-medium">{data.startingCredits.toLocaleString()} Cr</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Careers</div>
                <div className="font-medium">
                  {Array.from(new Set(careers.map((c: CareerTerm) => c.career))).join(', ')}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CareerStep;

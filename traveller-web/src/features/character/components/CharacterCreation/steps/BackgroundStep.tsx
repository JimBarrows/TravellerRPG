import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { WizardStepProps } from '../../../types/characterCreation';
import Button from '../../../../../shared/components/atoms/Button';
import Card from '../../../../../shared/components/molecules/Card';
import { 
  HOMEWORLDS, 
  SOCIAL_CLASSES, 
  UPBRINGING_OPTIONS,
  EARLY_LIFE_EVENTS,
  type Homeworld 
} from '../../../data/homeworlds';
import { rollDice } from '../../../utils/diceRoller';

const BackgroundStep = ({ data, updateData }: WizardStepProps) => {
  const { setValue, watch, register } = useFormContext();
  const [selectedHomeworld, setSelectedHomeworld] = useState<Homeworld | null>(null);
  const [randomEvent, setRandomEvent] = useState<string>('');
  const [showHomeworldDetails, setShowHomeworldDetails] = useState(false);
  
  const background = watch('background') || data.background;

  useEffect(() => {
    setValue('background', background);
    
    const homeworld = HOMEWORLDS.find(h => h.name === background.homeworld);
    if (homeworld) {
      setSelectedHomeworld(homeworld);
    }
  }, [background, setValue]);

  const handleHomeworldSelect = (homeworld: Homeworld) => {
    setSelectedHomeworld(homeworld);
    updateData({
      background: {
        ...background,
        homeworld: homeworld.name,
      },
    });
  };

  const handleSocialClassSelect = (socialClass: keyof typeof SOCIAL_CLASSES) => {
    updateData({
      background: {
        ...background,
        socialClass,
      },
    });
  };

  const handleUpbringingSelect = (upbringing: string) => {
    updateData({
      background: {
        ...background,
        upbringing,
      },
    });
  };

  const handleFamilyChange = (family: string) => {
    updateData({
      background: {
        ...background,
        family,
      },
    });
  };

  const handleEarlyLifeChange = (earlyLife: string) => {
    updateData({
      background: {
        ...background,
        earlyLife,
      },
    });
  };

  const generateRandomBackground = () => {
    const randomHomeworld = HOMEWORLDS[Math.floor(Math.random() * HOMEWORLDS.length)];
    const socialClasses = Object.keys(SOCIAL_CLASSES) as Array<keyof typeof SOCIAL_CLASSES>;
    const randomSocialClass = socialClasses[Math.floor(Math.random() * socialClasses.length)];
    const randomUpbringing = UPBRINGING_OPTIONS[Math.floor(Math.random() * UPBRINGING_OPTIONS.length)];
    const randomEarlyLife = EARLY_LIFE_EVENTS[Math.floor(Math.random() * EARLY_LIFE_EVENTS.length)];
    
    setSelectedHomeworld(randomHomeworld);
    setRandomEvent(randomEarlyLife);
    
    updateData({
      background: {
        homeworld: randomHomeworld.name,
        socialClass: randomSocialClass,
        upbringing: randomUpbringing,
        family: `Generated from ${randomUpbringing}`,
        earlyLife: randomEarlyLife,
      },
    });
  };

  const rollForEvent = () => {
    const roll = rollDice(1, 20);
    const event = EARLY_LIFE_EVENTS[Math.min(roll.total - 1, EARLY_LIFE_EVENTS.length - 1)];
    setRandomEvent(event);
    handleEarlyLifeChange(event);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Character Background</h2>
        <p className="text-muted-foreground">
          Define your character's origins, homeworld, and early life experiences.
        </p>
      </div>

      {/* Quick Generate */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="primary"
          onClick={generateRandomBackground}
        >
          Generate Random Background
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={rollForEvent}
        >
          Roll for Early Life Event
        </Button>
      </div>

      {/* Homeworld Selection */}
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Homeworld</h3>
            {selectedHomeworld && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHomeworldDetails(!showHomeworldDetails)}
              >
                {showHomeworldDetails ? 'Hide' : 'Show'} Details
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {HOMEWORLDS.map((homeworld) => {
              const isSelected = selectedHomeworld?.id === homeworld.id;
              
              return (
                <button
                  key={homeworld.id}
                  type="button"
                  onClick={() => handleHomeworldSelect(homeworld)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{homeworld.name}</div>
                  <div className="text-xs text-muted-foreground">{homeworld.type}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    TL{homeworld.techLevel} • Pop: {(homeworld.population / 1000000).toFixed(0)}M
                  </div>
                </button>
              );
            })}
          </div>
          
          {selectedHomeworld && showHomeworldDetails && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">{selectedHomeworld.name}</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedHomeworld.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-medium mb-1">Traits</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedHomeworld.traits.map((trait) => (
                      <span
                        key={trait}
                        className="px-2 py-1 bg-background rounded text-xs"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
                
                {selectedHomeworld.skillBonuses && (
                  <div>
                    <div className="text-xs font-medium mb-1">Skill Bonuses</div>
                    <div className="space-y-1">
                      {selectedHomeworld.skillBonuses.map((bonus) => (
                        <div key={bonus.skill} className="text-xs">
                          {bonus.skill} +{bonus.bonus}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Social Class */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-4">Social Class</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.entries(SOCIAL_CLASSES) as Array<[keyof typeof SOCIAL_CLASSES, typeof SOCIAL_CLASSES[keyof typeof SOCIAL_CLASSES]]>).map(([className, classData]) => {
              const isSelected = background.socialClass === className;
              
              return (
                <button
                  key={className}
                  type="button"
                  onClick={() => handleSocialClassSelect(className)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium mb-1">{className} Class</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {classData.description}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs">
                      Starting Credits: {classData.startingCredits} Cr
                    </div>
                    <div className="text-xs">
                      Education Modifier: {classData.educationModifier >= 0 ? '+' : ''}{classData.educationModifier}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          
          {background.socialClass && (
            <div className="mt-4 flex flex-wrap gap-1">
              {SOCIAL_CLASSES[background.socialClass].traits.map((trait) => (
                <span
                  key={trait}
                  className="px-2 py-1 bg-muted rounded text-xs"
                >
                  {trait}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Upbringing */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-4">Upbringing</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {UPBRINGING_OPTIONS.map((option) => {
              const isSelected = background.upbringing === option;
              
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleUpbringingSelect(option)}
                  className={`p-2 rounded-lg border text-sm transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Family Details */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-4">Family & Relationships</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Family Situation
              </label>
              <textarea
                {...register('background.family')}
                value={background.family}
                onChange={(e) => handleFamilyChange(e.target.value)}
                placeholder="Describe your family situation, siblings, and important relationships..."
                className="w-full p-3 rounded-lg border bg-background min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Early Life Events */}
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Early Life Event</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={rollForEvent}
            >
              Roll D20
            </Button>
          </div>
          
          {randomEvent && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary rounded-lg">
              <div className="text-sm font-medium mb-1">Rolled Event:</div>
              <div className="text-sm">{randomEvent}</div>
            </div>
          )}
          
          <textarea
            {...register('background.earlyLife')}
            value={background.earlyLife}
            onChange={(e) => handleEarlyLifeChange(e.target.value)}
            placeholder="Describe a significant event from your character's early life..."
            className="w-full p-3 rounded-lg border bg-background min-h-[120px] resize-none"
          />
          
          <div className="mt-3">
            <div className="text-xs font-medium mb-2">Suggested Events:</div>
            <div className="flex flex-wrap gap-1">
              {EARLY_LIFE_EVENTS.slice(0, 5).map((event) => (
                <button
                  key={event}
                  type="button"
                  onClick={() => handleEarlyLifeChange(event)}
                  className="px-2 py-1 bg-muted hover:bg-muted/70 rounded text-xs transition-colors"
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Background Summary */}
      {background.homeworld && background.socialClass && (
        <Card className="bg-muted/50">
          <div className="p-4">
            <h3 className="font-semibold mb-3">Background Summary</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Homeworld:</span>{' '}
                <span className="font-medium">{background.homeworld}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Social Class:</span>{' '}
                <span className="font-medium">{background.socialClass}</span>
              </div>
              {background.upbringing && (
                <div>
                  <span className="text-muted-foreground">Upbringing:</span>{' '}
                  <span className="font-medium">{background.upbringing}</span>
                </div>
              )}
              {background.earlyLife && (
                <div>
                  <span className="text-muted-foreground">Early Life:</span>{' '}
                  <span className="font-medium">{background.earlyLife}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BackgroundStep;

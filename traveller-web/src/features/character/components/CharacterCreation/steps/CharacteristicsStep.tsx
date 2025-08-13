import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { WizardStepProps, CharacterCharacteristics } from '../../../types/characterCreation';
import Button from '../../../../../shared/components/atoms/Button';
import Input from '../../../../../shared/components/atoms/Input';
import Card from '../../../../../shared/components/molecules/Card';
import { 
  rollAllCharacteristics, 
  rollCharacteristic,
  getCharacteristicModifier,
  getCharacteristicAbbreviation,
  toUPP
} from '../../../utils/diceRoller';

interface CharacteristicRowProps {
  name: string;
  value: number;
  onChange: (value: number) => void;
  onRoll: () => void;
  description: string;
  manualMode: boolean;
}

const CharacteristicRow = ({ 
  name, 
  value, 
  onChange, 
  onRoll, 
  description, 
  manualMode 
}: CharacteristicRowProps) => {
  const modifier = getCharacteristicModifier(value);
  const abbreviation = getCharacteristicAbbreviation(name);
  
  return (
    <div className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-b-0">
      <div className="col-span-2">
        <span className="font-mono text-sm text-muted-foreground">{abbreviation}</span>
      </div>
      
      <div className="col-span-3">
        <div className="font-medium capitalize">{name}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      
      <div className="col-span-3 flex items-center gap-2">
        {manualMode ? (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            min={1}
            max={15}
            className="w-20"
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold w-12 text-center">{value}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRoll}
              className="ml-2"
            >
              Roll 2D6
            </Button>
          </div>
        )}
      </div>
      
      <div className="col-span-2 text-center">
        <span className={`font-mono text-sm ${modifier >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {modifier >= 0 ? '+' : ''}{modifier}
        </span>
      </div>
      
      <div className="col-span-2">
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${(value / 15) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const CharacteristicsStep = ({ data, updateData }: WizardStepProps) => {
  const { setValue, watch } = useFormContext();
  const [generationMode, setGenerationMode] = useState<'random' | 'manual' | 'point-buy'>('random');
  const [availablePoints, setAvailablePoints] = useState(27);
  const [rollHistory, setRollHistory] = useState<CharacterCharacteristics[]>([]);
  const [currentRollSet, setCurrentRollSet] = useState(0);
  
  const characteristics = watch('characteristics') || data.characteristics;

  useEffect(() => {
    setValue('characteristics', characteristics);
  }, [characteristics, setValue]);

  const handleCharacteristicChange = (name: keyof CharacterCharacteristics, value: number) => {
    const newValue = Math.max(1, Math.min(15, value));
    const newCharacteristics = {
      ...characteristics,
      [name]: newValue,
    };
    
    updateData({ characteristics: newCharacteristics });
    
    if (generationMode === 'point-buy') {
      calculatePointsUsed(newCharacteristics);
    }
  };

  const calculatePointsUsed = (chars: CharacterCharacteristics) => {
    const baseValue = 7;
    const totalUsed = Object.values(chars).reduce((sum, val) => {
      return sum + Math.max(0, val - baseValue);
    }, 0);
    setAvailablePoints(27 - totalUsed);
  };

  const handleRollAll = () => {
    const newCharacteristics = rollAllCharacteristics();
    updateData({ characteristics: newCharacteristics });
    
    setRollHistory(prev => [...prev, newCharacteristics]);
    setCurrentRollSet(rollHistory.length);
  };

  const handleRollSingle = (name: keyof CharacterCharacteristics) => {
    const newValue = rollCharacteristic();
    handleCharacteristicChange(name, newValue);
  };

  const handleUsePreviousRoll = (index: number) => {
    if (rollHistory[index]) {
      updateData({ characteristics: rollHistory[index] });
      setCurrentRollSet(index);
    }
  };

  const handleApplyStandardArray = () => {
    const standardArray = [14, 12, 10, 8, 8, 6];
    const newCharacteristics: CharacterCharacteristics = {
      strength: standardArray[0],
      dexterity: standardArray[1],
      endurance: standardArray[2],
      intelligence: standardArray[3],
      education: standardArray[4],
      social: standardArray[5],
    };
    updateData({ characteristics: newCharacteristics });
  };

  const totalCharacteristicPoints = Object.values(characteristics).reduce((sum, val) => sum + val, 0);
  const averageCharacteristic = (totalCharacteristicPoints / 6).toFixed(1);
  const upp = toUPP(characteristics);

  const characteristicDescriptions = {
    strength: 'Physical power and muscle',
    dexterity: 'Agility and reflexes',
    endurance: 'Stamina and resilience',
    intelligence: 'Reasoning and problem solving',
    education: 'Knowledge and training',
    social: 'Charisma and social standing',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Characteristics</h2>
        <p className="text-muted-foreground">
          Generate your character's six characteristics that define their physical and mental capabilities.
        </p>
      </div>

      {/* Generation Mode Selection */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-3">Generation Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setGenerationMode('random')}
              className={`p-3 rounded-lg border-2 transition-all ${
                generationMode === 'random' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium">Random Roll</div>
              <div className="text-xs text-muted-foreground mt-1">
                Roll 2D6 for each characteristic
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => setGenerationMode('manual')}
              className={`p-3 rounded-lg border-2 transition-all ${
                generationMode === 'manual' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium">Manual Entry</div>
              <div className="text-xs text-muted-foreground mt-1">
                Enter values directly
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setGenerationMode('point-buy');
                calculatePointsUsed(characteristics);
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                generationMode === 'point-buy' 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium">Point Buy</div>
              <div className="text-xs text-muted-foreground mt-1">
                Spend 27 points to customize
              </div>
            </button>
          </div>
        </div>
      </Card>

      {/* Point Buy Info */}
      {generationMode === 'point-buy' && (
        <Card className={availablePoints < 0 ? 'border-red-500' : ''}>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Point Buy Budget</h3>
                <p className="text-sm text-muted-foreground">
                  Each point above 7 costs 1 point from your budget
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${availablePoints < 0 ? 'text-red-500' : 'text-primary'}`}>
                  {availablePoints}
                </div>
                <div className="text-xs text-muted-foreground">Points Remaining</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      {generationMode === 'random' && (
        <div className="flex gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={handleRollAll}
          >
            Roll All Characteristics
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleApplyStandardArray}
          >
            Use Standard Array
          </Button>
        </div>
      )}

      {/* Roll History */}
      {generationMode === 'random' && rollHistory.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-3">Roll History</h3>
            <div className="space-y-2">
              {rollHistory.map((roll, index) => {
                const total = Object.values(roll).reduce((sum, val) => sum + val, 0);
                const isCurrentRoll = index === currentRollSet;
                
                return (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-2 rounded ${
                      isCurrentRoll ? 'bg-primary/10 border border-primary' : 'bg-muted/50'
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-sm text-muted-foreground">Roll #{index + 1}</span>
                      <span className="font-mono text-sm">
                        {Object.values(roll).join('-')} (Total: {total})
                      </span>
                    </div>
                    {!isCurrentRoll && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUsePreviousRoll(index)}
                      >
                        Use This Roll
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Characteristics Table */}
      <Card>
        <div className="p-4">
          <div className="mb-4">
            <h3 className="font-semibold">Characteristic Scores</h3>
            <p className="text-sm text-muted-foreground">
              Values range from 1-15, with 7 being average
            </p>
          </div>
          
          <div>
            {Object.entries(characteristics).map(([name, value]) => (
              <CharacteristicRow
                key={name}
                name={name}
                value={value}
                onChange={(newValue) => handleCharacteristicChange(name as keyof CharacterCharacteristics, newValue)}
                onRoll={() => handleRollSingle(name as keyof CharacterCharacteristics)}
                description={characteristicDescriptions[name as keyof CharacterCharacteristics]}
                manualMode={generationMode === 'manual' || generationMode === 'point-buy'}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-3">Character Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Total Points</div>
              <div className="text-xl font-bold">{totalCharacteristicPoints}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Average</div>
              <div className="text-xl font-bold">{averageCharacteristic}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">UPP</div>
              <div className="text-xl font-mono font-bold">{upp}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Modifier</div>
              <div className="text-xl font-bold">
                {Object.values(characteristics).reduce((sum, val) => sum + getCharacteristicModifier(val), 0) >= 0 ? '+' : ''}
                {Object.values(characteristics).reduce((sum, val) => sum + getCharacteristicModifier(val), 0)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="bg-muted/50">
        <div className="p-4">
          <h3 className="font-semibold mb-2">Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Characteristics of 9+ provide a +1 modifier, 12+ provide +2</li>
            <li>• Consider your desired career when allocating characteristics</li>
            <li>• Education affects starting skills, Social affects starting money</li>
            <li>• The UPP (Universal Personality Profile) is a hexadecimal representation</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default CharacteristicsStep;
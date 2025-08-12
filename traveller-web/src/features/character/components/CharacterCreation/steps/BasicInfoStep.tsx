import { useFormContext } from 'react-hook-form';
import type { WizardStepProps } from '../../../types/characterCreation';
import Input from '../../../../../shared/components/atoms/Input';
import Typography from '../../../../../shared/components/atoms/Typography';

const BasicInfoStep = ({ data, updateData }: WizardStepProps) => {
  const { register, formState: { errors } } = useFormContext();

  const species = ['Human', 'Vargr', 'Aslan', 'Other'];
  
  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h4" className="mb-4">Basic Information</Typography>
        <Typography variant="body" className="text-muted-foreground">
          Let's start with some basic information about your character. Choose a name that fits
          the Traveller universe and select your species.
        </Typography>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Input
            label="Character Name"
            {...register('name')}
            error={errors.name?.message as string}
            placeholder="Enter character name"
            fullWidth
            onChange={(e) => updateData({ name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Species
          </label>
          <select
            {...register('species')}
            className="input w-full"
            onChange={(e) => updateData({ species: e.target.value as any })}
          >
            {species.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.species && (
            <p className="mt-1 text-sm text-destructive">
              {errors.species.message as string}
            </p>
          )}
        </div>

        <div>
          <Input
            label="Gender"
            {...register('gender')}
            error={errors.gender?.message as string}
            placeholder="Enter gender"
            fullWidth
            onChange={(e) => updateData({ gender: e.target.value })}
          />
        </div>

        <div>
          <Input
            label="Age"
            type="number"
            {...register('age', { valueAsNumber: true })}
            error={errors.age?.message as string}
            placeholder="18"
            min={18}
            max={100}
            fullWidth
            onChange={(e) => updateData({ age: parseInt(e.target.value) || 18 })}
          />
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <Typography variant="h6" className="mb-2">Species Traits</Typography>
        {data.species === 'Human' && (
          <Typography variant="caption" className="text-muted-foreground">
            Humans are the most adaptable and numerous species in the Imperium. 
            They receive no special bonuses but have no limitations either.
          </Typography>
        )}
        {data.species === 'Vargr' && (
          <Typography variant="caption" className="text-muted-foreground">
            Vargr are wolf-like beings known for their charisma and dexterity. 
            They receive +1 to Dexterity but -1 to Endurance.
          </Typography>
        )}
        {data.species === 'Aslan' && (
          <Typography variant="caption" className="text-muted-foreground">
            Aslan are lion-like beings with a strong sense of honor and tradition. 
            They receive +2 to Strength but -1 to Dexterity.
          </Typography>
        )}
        {data.species === 'Other' && (
          <Typography variant="caption" className="text-muted-foreground">
            Work with your Game Master to determine the traits and characteristics 
            of your custom species.
          </Typography>
        )}
      </div>
    </div>
  );
};

export default BasicInfoStep;
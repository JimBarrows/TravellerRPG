import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CharacterSheet from '../components/CharacterSheet/CharacterSheet';
import type { CharacterSheetData, CharacterCreationData } from '../types';
import { convertCreationDataToSheetData } from '../types/characterSheet';
import { useAppContext } from '../../../shared/contexts/AppContext';

const CharacterViewPage = () => {
  const { characterId } = useParams<{ characterId: string }>();
  const { addNotification } = useAppContext();
  const [character, setCharacter] = useState<CharacterSheetData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load character from storage service
    // For now, create a mock character for testing
    const loadCharacter = async () => {
      try {
        setLoading(true);
        
        // Mock character data - in real implementation, this would come from storage service
        const mockCreationData: CharacterCreationData = {
          name: 'Marcus Kane',
          species: 'Human',
          gender: 'Male',
          age: 34,
          characteristics: {
            strength: 8,
            dexterity: 10,
            endurance: 9,
            intelligence: 12,
            education: 11,
            social: 7,
          },
          background: {
            homeworld: 'Regina',
            socialClass: 'Middle',
            upbringing: 'Urban',
            family: 'Military family',
            earlyLife: 'Joined military academy at 18',
            startingSkills: ['Gun Combat', 'Athletics'],
          },
          careers: [
            {
              termNumber: 1,
              career: 'Navy',
              branch: 'Line/Crew',
              rank: 2,
              rankTitle: 'Lieutenant',
              survived: true,
              commissioned: true,
              advanced: true,
              skillsGained: ['Pilot', 'Astrogation', 'Tactics'],
              events: [],
              mustered: true,
              benefits: ['Weapon', 'Ship Share'],
              cashReceived: 10000,
            },
            {
              termNumber: 2,
              career: 'Navy',
              branch: 'Line/Crew',
              rank: 3,
              rankTitle: 'Lieutenant Commander',
              survived: true,
              commissioned: false,
              advanced: true,
              skillsGained: ['Leadership', 'Engineering'],
              events: [],
              mustered: true,
              benefits: ['Weapon', 'Credits'],
              cashReceived: 15000,
            },
          ],
          careerProgression: {
            totalTerms: 2,
            currentAge: 34,
            retiredInvoluntarily: false,
            retiredVoluntarily: true,
            canReenlist: false,
            mustLeave: false,
          },
          totalTerms: 2,
          skills: [
            { name: 'Gun Combat', level: 2, specialty: 'Slug Rifle' },
            { name: 'Athletics', level: 1 },
            { name: 'Pilot', level: 2, specialty: 'Starship' },
            { name: 'Astrogation', level: 1 },
            { name: 'Tactics', level: 2, specialty: 'Naval' },
            { name: 'Leadership', level: 1 },
            { name: 'Engineering', level: 1 },
          ],
          lifeEvents: [],
          connections: ['Admiral Sarah Chen', 'Captain Rodriguez'],
          rivals: ['Colonel Blackwood'],
          startingCredits: 25000,
          equipment: [
            {
              id: '1',
              name: 'Laser Rifle',
              type: 'Weapon',
              cost: 3500,
              weight: 4.0,
              quantity: 1,
            },
            {
              id: '2',
              name: 'Cloth Armor',
              type: 'Armor',
              cost: 250,
              weight: 2.0,
              quantity: 1,
            },
            {
              id: '3',
              name: 'Personal Comm',
              type: 'Equipment',
              cost: 150,
              weight: 0.5,
              quantity: 1,
            },
          ],
          status: 'complete',
        };

        const sheetData = convertCreationDataToSheetData(mockCreationData, {
          id: characterId || 'mock-character',
          campaignId: 'test-campaign',
        });

        setCharacter(sheetData);
      } catch (error) {
        console.error('Failed to load character:', error);
        addNotification({
          type: 'error',
          title: 'Load failed',
          message: 'Failed to load character data',
        });
      } finally {
        setLoading(false);
      }
    };

    loadCharacter();
  }, [characterId, addNotification]);

  const handleCharacterUpdate = async (updates: Partial<CharacterSheetData>) => {
    if (!character) return;

    // Update local state immediately
    setCharacter(prev => prev ? { ...prev, ...updates } : null);

    // TODO: Save to storage service
    console.log('Character updated:', updates);
  };

  const handleCharacterSave = async (updatedCharacter: CharacterSheetData) => {
    // TODO: Implement save to storage service
    console.log('Saving character:', updatedCharacter);
    
    addNotification({
      type: 'success',
      title: 'Character saved',
      message: 'Character sheet has been saved successfully',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Loading character...</div>
          <div className="text-sm text-muted-foreground">Please wait while we load the character sheet</div>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Character not found</div>
          <div className="text-sm text-muted-foreground">The requested character could not be found</div>
        </div>
      </div>
    );
  }

  return (
    <CharacterSheet
      character={character}
      onUpdate={handleCharacterUpdate}
      onSave={handleCharacterSave}
    />
  );
};

export default CharacterViewPage;

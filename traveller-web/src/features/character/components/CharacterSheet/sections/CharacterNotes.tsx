import type { CharacterSheetSectionProps } from '../../../types/characterSheet';
import NotesManager from './notes/NotesManager';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';

const CharacterNotes = ({ character, onUpdate, readonly }: CharacterSheetSectionProps) => {
  return (
    <div className="space-y-6">
      {/* Character Background Summary */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Character Background</h2>
          <p className="text-sm text-muted-foreground">
            Background information and character development notes
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Homeworld</h3>
              <p className="text-sm text-muted-foreground">
                {character.background.homeworld || 'Unknown'}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Social Class</h3>
              <p className="text-sm text-muted-foreground">
                {character.background.socialClass}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Upbringing</h3>
              <p className="text-sm text-muted-foreground">
                {character.background.upbringing || 'Not specified'}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Family Background</h3>
              <p className="text-sm text-muted-foreground">
                {character.background.family || 'Not specified'}
              </p>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Early Life</h3>
              <p className="text-sm text-muted-foreground">
                {character.background.earlyLife || 'Not specified'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Connections and Rivals */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Connections & Rivals</h2>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3 text-green-600">Connections</h3>
              {character.connections.length === 0 ? (
                <p className="text-sm text-muted-foreground">No connections recorded</p>
              ) : (
                <ul className="space-y-2">
                  {character.connections.map((connection, index) => (
                    <li key={index} className="text-sm p-2 bg-green-50 rounded border border-green-200">
                      {connection}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-3 text-red-600">Rivals</h3>
              {character.rivals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rivals recorded</p>
              ) : (
                <ul className="space-y-2">
                  {character.rivals.map((rival, index) => (
                    <li key={index} className="text-sm p-2 bg-red-50 rounded border border-red-200">
                      {rival}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rich Text Notes Manager */}
      <NotesManager
        character={character}
        onUpdate={onUpdate}
        readonly={readonly}
      />
    </div>
  );
};

export default CharacterNotes;

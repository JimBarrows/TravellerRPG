import { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import type { WizardStepProps } from '../../../types/characterCreation';
import Button from '../../../../../shared/components/atoms/Button';
import Card from '../../../../../shared/components/molecules/Card';

const PortraitStep = ({ data, updateData }: WizardStepProps) => {
  const { setValue, watch } = useFormContext();
  const [portraitUrl, setPortraitUrl] = useState<string>('');
  const [avatarSeed, setAvatarSeed] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('adventurer');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const portrait = watch('portrait') || data.portrait;
  const currentAvatarSeed = watch('avatarSeed') || data.avatarSeed;

  useEffect(() => {
    // Generate initial avatar seed from character name
    if (data.name && !avatarSeed) {
      setAvatarSeed(data.name + Date.now());
    }
  }, [data.name]);

  useEffect(() => {
    setValue('portrait', portraitUrl);
    setValue('avatarSeed', avatarSeed);
  }, [portraitUrl, avatarSeed, setValue]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, this would upload to S3
      // For now, we'll use a local URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPortraitUrl(result);
        updateData({ portrait: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAvatar = () => {
    const seed = data.name + Date.now();
    setAvatarSeed(seed);
    updateData({ avatarSeed: seed });
  };

  const getAvatarUrl = (style: string, seed: string) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  };

  const avatarStyles = [
    { id: 'adventurer', name: 'Adventurer', description: 'Fantasy adventure style' },
    { id: 'avataaars', name: 'Avataaars', description: 'Cartoon avatar style' },
    { id: 'bottts', name: 'Bottts', description: 'Robot style' },
    { id: 'identicon', name: 'Identicon', description: 'Geometric patterns' },
    { id: 'initials', name: 'Initials', description: 'Text-based avatar' },
    { id: 'pixel-art', name: 'Pixel Art', description: 'Retro pixel style' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Character Portrait</h2>
        <p className="text-muted-foreground">
          Upload a custom portrait or generate an avatar for your character.
        </p>
      </div>

      {/* Current Portrait Display */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold mb-4">Current Portrait</h3>
          <div className="flex justify-center">
            {portraitUrl ? (
              <img
                src={portraitUrl}
                alt="Character portrait"
                className="w-64 h-64 object-cover rounded-lg border-2 border-border"
              />
            ) : avatarSeed ? (
              <img
                src={getAvatarUrl(selectedStyle, avatarSeed)}
                alt="Character avatar"
                className="w-64 h-64 object-cover rounded-lg border-2 border-border bg-muted"
              />
            ) : (
              <div className="w-64 h-64 bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                <span className="text-muted-foreground">No portrait selected</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Upload Custom Portrait */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-4">Upload Custom Portrait</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upload an image file (JPG, PNG) for your character portrait.
          </p>
          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose File
            </Button>
            {portraitUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPortraitUrl('');
                  updateData({ portrait: '' });
                }}
              >
                Remove Portrait
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Avatar Generator */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-4">Generate Avatar</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a unique avatar using DiceBear avatars.
          </p>
          
          {/* Style Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Avatar Style</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {avatarStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedStyle === style.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="font-medium">{style.name}</div>
                  <div className="text-xs text-muted-foreground">{style.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Preview */}
          {avatarSeed && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Preview</label>
              <div className="flex justify-center p-4 bg-muted/50 rounded-lg">
                <img
                  src={getAvatarUrl(selectedStyle, avatarSeed)}
                  alt="Avatar preview"
                  className="w-32 h-32 rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={generateAvatar}
            >
              Generate New Avatar
            </Button>
            {avatarSeed && !portraitUrl && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  updateData({ 
                    portrait: getAvatarUrl(selectedStyle, avatarSeed),
                    avatarSeed: avatarSeed 
                  });
                }}
              >
                Use This Avatar
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="bg-muted/50">
        <div className="p-4">
          <h3 className="font-semibold mb-2">Portrait Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Recommended image size is 512x512 pixels</li>
            <li>• Avatars are generated using DiceBear API</li>
            <li>• Custom portraits will be stored with your character</li>
            <li>• You can change your portrait at any time</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default PortraitStep;

import { useState, useEffect, useRef, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import type { WizardStepProps } from '../../../types/characterCreation';
import Button from '../../../../../shared/components/atoms/Button';
import Card from '../../../../../shared/components/molecules/Card';
import portraitService from '../../../services/portraitService';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PortraitStep = ({ data, updateData }: WizardStepProps) => {
  const { setValue } = useFormContext();
  const [portraitUrl, setPortraitUrl] = useState<string>('');
  const [avatarSeed, setAvatarSeed] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('adventurer');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [portraitType, setPortraitType] = useState<'upload' | 'avatar'>('avatar');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Generate initial avatar seed from character name
    if (data.name && !avatarSeed) {
      setAvatarSeed(data.name + Date.now());
    }
  }, [data.name, avatarSeed]);

  useEffect(() => {
    setValue('portrait', portraitUrl);
    setValue('avatarSeed', avatarSeed);
    setValue('portraitStyle', selectedStyle);
  }, [portraitUrl, avatarSeed, selectedStyle, setValue]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadError('');
      
      // Validate file
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a JPEG, PNG, GIF, or WebP image.');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setUploadError('File size must be less than 5MB.');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewImage(result);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const cropImage = useCallback(() => {
    if (!imageRef.current || !canvasRef.current || !cropArea) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to desired output size
    canvas.width = 512;
    canvas.height = 512;

    // Draw cropped image
    ctx.drawImage(
      imageRef.current,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      512,
      512
    );

    // Convert to blob and create URL
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setPortraitUrl(url);
        updateData({ portrait: url });
        setIsCropping(false);
        setPreviewImage('');
      }
    }, 'image/png', 0.9);
  }, [cropArea, updateData]);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      // If we're in production, upload to S3
      if (import.meta.env.PROD) {
        const viewUrl = await portraitService.uploadPortrait(file, data.id);
        setPortraitUrl(viewUrl);
        updateData({ portrait: viewUrl, portraitType: 'upload' });
      } else {
        // In development, use local preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setPortraitUrl(result);
          updateData({ portrait: result, portraitType: 'upload' });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const generateAvatar = () => {
    const seed = (data.name || 'character') + Date.now();
    setAvatarSeed(seed);
    const avatarUrl = portraitService.generateAvatarUrl(selectedStyle, seed);
    updateData({ 
      avatarSeed: seed,
      avatarStyle: selectedStyle,
      portraitType: 'avatar'
    });
  };

  const getAvatarUrl = (style: string, seed: string) => {
    return portraitService.generateAvatarUrl(style, seed);
  };

  const avatarStyles = [
    { id: 'adventurer', name: 'Adventurer', description: 'Fantasy adventure style' },
    { id: 'avataaars', name: 'Avataaars', description: 'Cartoon avatar style' },
    { id: 'bottts', name: 'Robots', description: 'Robot style' },
    { id: 'identicon', name: 'Identicon', description: 'Geometric patterns' },
    { id: 'initials', name: 'Initials', description: 'Text-based avatar' },
    { id: 'pixel-art', name: 'Pixel Art', description: 'Retro pixel style' },
    { id: 'lorelei', name: 'Lorelei', description: 'Anime style' },
    { id: 'personas', name: 'Personas', description: 'Illustrated people' },
  ];

  const useAvatar = () => {
    const avatarUrl = getAvatarUrl(selectedStyle, avatarSeed);
    setPortraitUrl(avatarUrl);
    setPortraitType('avatar');
    updateData({ 
      portrait: avatarUrl,
      avatarSeed: avatarSeed,
      avatarStyle: selectedStyle,
      portraitType: 'avatar'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Character Portrait</h2>
        <p className="text-muted-foreground">
          Choose how you want to represent your character visually.
        </p>
      </div>

      {/* Portrait Type Selection */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-4">Portrait Type</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPortraitType('avatar')}
              className={`p-4 rounded-lg border-2 transition-all ${
                portraitType === 'avatar'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium mb-1">Generated Avatar</div>
              <div className="text-sm text-muted-foreground">
                Create a unique avatar using AI
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPortraitType('upload')}
              className={`p-4 rounded-lg border-2 transition-all ${
                portraitType === 'upload'
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-medium mb-1">Upload Image</div>
              <div className="text-sm text-muted-foreground">
                Use your own custom image
              </div>
            </button>
          </div>
        </div>
      </Card>

      {/* Current Portrait Display */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold mb-4">Current Portrait</h3>
          <div className="flex justify-center">
            {portraitUrl ? (
              <div className="relative">
                <img
                  src={portraitUrl}
                  alt="Character portrait"
                  className="w-64 h-64 object-cover rounded-lg border-2 border-border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPortraitUrl('');
                    updateData({ portrait: '' });
                  }}
                  className="absolute top-2 right-2 p-2 bg-background/80 rounded-lg hover:bg-background/90 transition-colors"
                  title="Remove portrait"
                >
                  ✕
                </button>
              </div>
            ) : avatarSeed && portraitType === 'avatar' ? (
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

      {/* Image Cropping Modal */}
      {isCropping && previewImage && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-4">Crop Your Image</h3>
            <div className="relative">
              <img
                ref={imageRef}
                src={previewImage}
                alt="Crop preview"
                className="max-w-full h-auto"
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  const size = Math.min(img.width, img.height);
                  setCropArea({
                    x: (img.width - size) / 2,
                    y: (img.height - size) / 2,
                    width: size,
                    height: size,
                  });
                }}
              />
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                type="button"
                variant="primary"
                onClick={cropImage}
              >
                Apply Crop
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCropping(false);
                  setPreviewImage('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Upload Custom Portrait */}
      {portraitType === 'upload' && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-4">Upload Custom Portrait</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload an image file (JPG, PNG, GIF, WebP) up to 5MB. The image will be cropped to a square.
            </p>
            {uploadError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
                {uploadError}
              </div>
            )}
            <div className="flex gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Choose File'}
              </Button>
              {previewImage && !isCropping && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  Upload Portrait
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Avatar Generator */}
      {portraitType === 'avatar' && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-4">Generate Avatar</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create a unique avatar for your character using various artistic styles.
            </p>
            
            {/* Style Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Avatar Style</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                    <div className="font-medium text-sm">{style.name}</div>
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
                  onClick={useAvatar}
                >
                  Use This Avatar
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tips */}
      <Card className="bg-muted/50">
        <div className="p-4">
          <h3 className="font-semibold mb-2">Portrait Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Recommended image size is 512x512 pixels</li>
            <li>• Uploaded images will be automatically cropped to square</li>
            <li>• Generated avatars are unique and based on your character's name</li>
            <li>• You can change your portrait at any time from your character sheet</li>
            <li>• Portraits are optimized for web display automatically</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default PortraitStep;
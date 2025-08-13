import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import type { WizardStepProps, CharacterEquipment } from '../../../types/characterCreation';
import Button from '../../../../../shared/components/atoms/Button';
import Card from '../../../../../shared/components/molecules/Card';
import Input from '../../../../../shared/components/atoms/Input';
import { WEAPONS, ARMOR, EQUIPMENT, type Equipment } from '../../../data/equipment';
import { SOCIAL_CLASSES } from '../../../data/homeworlds';

const EquipmentStep = ({ data, updateData }: WizardStepProps) => {
  const { setValue, watch } = useFormContext();
  const [selectedCategory, setSelectedCategory] = useState<'weapons' | 'armor' | 'equipment'>('weapons');
  const [searchTerm, setSearchTerm] = useState('');
  const [inventory, setInventory] = useState<CharacterEquipment[]>([]);
  const [credits, setCredits] = useState(1000);
  const [totalWeight, setTotalWeight] = useState(0);
  const [showPackages, setShowPackages] = useState(true);
  
  const equipment = watch('equipment') || data.equipment || [];
  const startingCredits = watch('startingCredits') || data.startingCredits || 1000;
  const background = watch('background') || data.background;
  const careers = watch('careers') || data.careers || [];

  useEffect(() => {
    // Calculate starting credits based on social class and career benefits
    let baseCredits = 1000;
    
    if (background?.socialClass) {
      baseCredits = SOCIAL_CLASSES[background.socialClass].startingCredits;
    }
    
    // Add career mustering out benefits (simplified)
    const totalTerms = data.totalTerms || 0;
    const careerBonus = totalTerms * 1000;
    
    const totalCredits = baseCredits + careerBonus;
    setCredits(totalCredits);
    updateData({ startingCredits: totalCredits });
  }, [background, data.totalTerms]);

  useEffect(() => {
    setValue('equipment', inventory);
    setValue('startingCredits', credits);
    
    // Calculate total weight
    const weight = inventory.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
    setTotalWeight(weight);
  }, [inventory, credits, setValue]);

  const handleAddItem = (item: Equipment) => {
    if (credits >= item.cost) {
      const existing = inventory.find(i => i.id === item.id);
      
      if (existing) {
        // Increase quantity
        const updated = inventory.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
        setInventory(updated);
      } else {
        // Add new item
        const newItem: CharacterEquipment = {
          id: item.id,
          name: item.name,
          type: item.type,
          cost: item.cost,
          weight: item.weight,
          quantity: 1,
        };
        setInventory([...inventory, newItem]);
      }
      
      setCredits(credits - item.cost);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      if (item.quantity > 1) {
        // Decrease quantity
        const updated = inventory.map(i => 
          i.id === itemId 
            ? { ...i, quantity: i.quantity - 1 }
            : i
        );
        setInventory(updated);
      } else {
        // Remove item
        setInventory(inventory.filter(i => i.id !== itemId));
      }
      
      setCredits(credits + item.cost);
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (item && newQuantity >= 0) {
      const quantityDiff = newQuantity - item.quantity;
      const costDiff = quantityDiff * item.cost;
      
      if (credits >= costDiff) {
        const updated = inventory.map(i => 
          i.id === itemId 
            ? { ...i, quantity: newQuantity }
            : i
        );
        setInventory(updated.filter(i => i.quantity > 0));
        setCredits(credits - costDiff);
      }
    }
  };

  const applyStarterPackage = (packageName: string) => {
    let packageItems: Equipment[] = [];
    let packageCost = 0;
    
    switch (packageName) {
      case 'explorer':
        packageItems = [
          WEAPONS.find(w => w.id === 'autopistol')!,
          ARMOR.find(a => a.id === 'cloth')!,
          EQUIPMENT.find(e => e.id === 'binoculars')!,
          EQUIPMENT.find(e => e.id === 'medikit')!,
          EQUIPMENT.find(e => e.id === 'comm')!,
          EQUIPMENT.find(e => e.id === 'tent')!,
        ];
        break;
      case 'soldier':
        packageItems = [
          WEAPONS.find(w => w.id === 'assault-rifle')!,
          ARMOR.find(a => a.id === 'flak-jacket')!,
          EQUIPMENT.find(e => e.id === 'medikit')!,
          EQUIPMENT.find(e => e.id === 'comm')!,
        ];
        break;
      case 'trader':
        packageItems = [
          WEAPONS.find(w => w.id === 'snub-pistol')!,
          ARMOR.find(a => a.id === 'mesh')!,
          EQUIPMENT.find(e => e.id === 'hand-computer')!,
          EQUIPMENT.find(e => e.id === 'comm')!,
        ];
        break;
      case 'spacer':
        packageItems = [
          WEAPONS.find(w => w.id === 'snub-pistol')!,
          ARMOR.find(a => a.id === 'vacc-suit')!,
          EQUIPMENT.find(e => e.id === 'toolkit-engineering')!,
          EQUIPMENT.find(e => e.id === 'comm')!,
        ];
        break;
    }
    
    packageCost = packageItems.reduce((sum, item) => sum + (item?.cost || 0), 0);
    
    if (credits >= packageCost) {
      const newInventory: CharacterEquipment[] = packageItems
        .filter(item => item)
        .map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          cost: item.cost,
          weight: item.weight,
          quantity: 1,
        }));
      
      setInventory(newInventory);
      setCredits(credits - packageCost);
      setShowPackages(false);
    }
  };

  const getFilteredItems = (): Equipment[] => {
    let items: Equipment[] = [];
    
    switch (selectedCategory) {
      case 'weapons':
        items = WEAPONS;
        break;
      case 'armor':
        items = ARMOR;
        break;
      case 'equipment':
        items = EQUIPMENT;
        break;
    }
    
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  };

  const getEncumbranceStatus = () => {
    if (totalWeight < 10) return { status: 'Light', color: 'text-green-600' };
    if (totalWeight < 20) return { status: 'Normal', color: 'text-yellow-600' };
    if (totalWeight < 30) return { status: 'Heavy', color: 'text-orange-600' };
    return { status: 'Overloaded', color: 'text-red-600' };
  };

  const encumbrance = getEncumbranceStatus();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Equipment Selection</h2>
        <p className="text-muted-foreground">
          Purchase equipment for your character using starting credits.
        </p>
      </div>

      {/* Credits and Weight Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className={credits < 0 ? 'border-red-500' : ''}>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Credits</h3>
                <p className="text-sm text-muted-foreground">
                  Available funds
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${credits < 0 ? 'text-red-500' : 'text-primary'}`}>
                  {credits} Cr
                </div>
                <div className="text-xs text-muted-foreground">
                  Starting: {startingCredits} Cr
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Encumbrance</h3>
                <p className="text-sm text-muted-foreground">
                  Total weight carried
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {totalWeight.toFixed(1)} kg
                </div>
                <div className={`text-xs font-medium ${encumbrance.color}`}>
                  {encumbrance.status}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Starter Packages */}
      {showPackages && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-4">Starter Packages</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Quick equipment sets for common character types
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => applyStarterPackage('explorer')}
                className="p-3 rounded-lg border hover:border-primary transition-colors"
              >
                <div className="font-medium">Explorer</div>
                <div className="text-xs text-muted-foreground">~1385 Cr</div>
              </button>
              <button
                type="button"
                onClick={() => applyStarterPackage('soldier')}
                className="p-3 rounded-lg border hover:border-primary transition-colors"
              >
                <div className="font-medium">Soldier</div>
                <div className="text-xs text-muted-foreground">~1600 Cr</div>
              </button>
              <button
                type="button"
                onClick={() => applyStarterPackage('trader')}
                className="p-3 rounded-lg border hover:border-primary transition-colors"
              >
                <div className="font-medium">Trader</div>
                <div className="text-xs text-muted-foreground">~1250 Cr</div>
              </button>
              <button
                type="button"
                onClick={() => applyStarterPackage('spacer')}
                className="p-3 rounded-lg border hover:border-primary transition-colors"
              >
                <div className="font-medium">Spacer</div>
                <div className="text-xs text-muted-foreground">~14250 Cr</div>
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Current Inventory */}
      {inventory.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="font-semibold mb-4">Current Inventory</h3>
            <div className="space-y-2">
              {inventory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.type} • {item.weight}kg each • {item.cost} Cr each
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center"
                        min={0}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={credits < item.cost}
                      >
                        +
                      </Button>
                    </div>
                    
                    <div className="text-right w-20">
                      <div className="font-medium">{item.cost * item.quantity} Cr</div>
                      <div className="text-xs text-muted-foreground">
                        {(item.weight * item.quantity).toFixed(1)}kg
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Equipment Shop */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold mb-4">Equipment Shop</h3>
          
          {/* Category Selection */}
          <div className="flex gap-2 mb-4">
            <Button
              type="button"
              variant={selectedCategory === 'weapons' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('weapons')}
            >
              Weapons
            </Button>
            <Button
              type="button"
              variant={selectedCategory === 'armor' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('armor')}
            >
              Armor
            </Button>
            <Button
              type="button"
              variant={selectedCategory === 'equipment' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('equipment')}
            >
              Equipment
            </Button>
            
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {getFilteredItems().map((item) => {
              const owned = inventory.find(i => i.id === item.id);
              const canAfford = credits >= item.cost;
              
              return (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {item.description}
                      </div>
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-muted-foreground">Cost:</span>{' '}
                          <span className="font-medium">{item.cost} Cr</span>
                          <span className="text-muted-foreground ml-2">Weight:</span>{' '}
                          <span className="font-medium">{item.weight}kg</span>
                        </div>
                        {item.damage && (
                          <div>
                            <span className="text-muted-foreground">Damage:</span>{' '}
                            <span className="font-mono">{item.damage}</span>
                          </div>
                        )}
                        {item.protection && (
                          <div>
                            <span className="text-muted-foreground">Protection:</span>{' '}
                            <span className="font-mono">{item.protection}</span>
                          </div>
                        )}
                        {item.traits && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.traits.map(trait => (
                              <span key={trait} className="px-1.5 py-0.5 bg-muted rounded text-xs">
                                {trait}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={canAfford ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleAddItem(item)}
                      disabled={!canAfford}
                    >
                      {owned ? `Buy (+${owned.quantity})` : 'Buy'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card className="bg-muted/50">
        <div className="p-4">
          <h3 className="font-semibold mb-2">Equipment Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Starting credits depend on social class and career</li>
            <li>• Consider your character's role when selecting equipment</li>
            <li>• Encumbrance affects movement and action penalties</li>
            <li>• Vacc suits are essential for space operations</li>
            <li>• Higher tech level items may not be available everywhere</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default EquipmentStep;

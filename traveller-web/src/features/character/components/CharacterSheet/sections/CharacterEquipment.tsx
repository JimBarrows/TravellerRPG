import { useState, useMemo } from 'react';
import type { 
  CharacterSheetSectionProps, 
  CharacterSheetEquipment, 
  EquipmentLocation, 
  EquipmentCondition,
  EncumbranceStatus 
} from '../../../types/characterSheet';
import { 
  calculateEncumbrance, 
  getEquipmentModifiers,
  getConditionColorClass,
  getConditionDescription,
  getEquipmentLocationIcon,
  getEquipmentCategoryIcon
} from '../../../types/characterSheet';
import Card, { CardHeader, CardContent } from '../../../../../shared/components/molecules/Card';
import Button from '../../../../../shared/components/atoms/Button';
import { AddEditEquipmentModal, EquipmentSearch } from '../../EquipmentModal';
import { EditableSelect, EditableNumber } from '../../EditableFields';

const CharacterEquipment = ({ character, onUpdate, readonly }: CharacterSheetSectionProps) => {
  const [activeLocation, setActiveLocation] = useState<EquipmentLocation>('carried');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CharacterSheetEquipment | undefined>();
  const [filteredEquipment, setFilteredEquipment] = useState<CharacterSheetEquipment[]>(character.equipment);
  const [showSearch, setShowSearch] = useState(false);
  
  // Calculate encumbrance with character's STR and END
  const encumbrance = useMemo(() => 
    calculateEncumbrance(
      character.equipment, 
      character.characteristics.strength, 
      character.characteristics.endurance
    ), 
    [character.equipment, character.characteristics.strength, character.characteristics.endurance]
  );
  
  // Calculate equipment effects
  const equipmentEffects = useMemo(() => 
    getEquipmentModifiers(character.equipment), 
    [character.equipment]
  );
  
  const equipmentByLocation = useMemo(() => {
    const groups: Record<EquipmentLocation, CharacterSheetEquipment[]> = {
      carried: [],
      stored: [],
      equipped: [],
      ship: [],
      home: []
    };
    
    // Use filtered equipment if search is active, otherwise use all equipment
    const equipmentToGroup = showSearch ? filteredEquipment : character.equipment;
    
    equipmentToGroup.forEach(item => {
      groups[item.location].push(item);
    });
    
    return groups;
  }, [character.equipment, filteredEquipment, showSearch]);
  
  const handleItemUpdate = (itemId: string, updates: Partial<CharacterSheetEquipment>) => {
    const updatedEquipment = character.equipment.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );
    onUpdate({ equipment: updatedEquipment });
  };
  
  const handleSaveEquipment = (equipment: CharacterSheetEquipment) => {
    const existingIndex = character.equipment.findIndex(item => item.id === equipment.id);
    
    if (existingIndex >= 0) {
      // Update existing item
      const updatedEquipment = [...character.equipment];
      updatedEquipment[existingIndex] = equipment;
      onUpdate({ equipment: updatedEquipment });
    } else {
      // Add new item
      const updatedEquipment = [...character.equipment, equipment];
      onUpdate({ equipment: updatedEquipment });
    }
    
    setEditingItem(undefined);
    setShowAddModal(false);
  };
  
  const handleRemoveItem = (itemId: string) => {
    const updatedEquipment = character.equipment.filter(item => item.id !== itemId);
    onUpdate({ equipment: updatedEquipment });
  };
  
  const handleEditItem = (item: CharacterSheetEquipment) => {
    setEditingItem(item);
    setShowAddModal(true);
  };
  
  const getTotalValue = (): number => {
    return character.equipment.reduce((total, item) => total + (item.cost * item.quantity), 0);
  };
  
  const getTotalWeight = (): number => {
    return character.equipment.reduce((total, item) => total + (item.weight * item.quantity), 0);
  };
  
  const getEncumbranceColorClass = (encumbrance: EncumbranceStatus): string => {
    switch (encumbrance.encumbranceLevel) {
      case 'none': return 'text-green-600';
      case 'light': return 'text-yellow-600';
      case 'heavy': return 'text-orange-600';
      case 'overloaded': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  const getEncumbranceDescription = (encumbrance: EncumbranceStatus): string => {
    switch (encumbrance.encumbranceLevel) {
      case 'none': return 'No encumbrance penalty';
      case 'light': return `Light encumbrance: ${encumbrance.penalty} DM to physical tasks`;
      case 'heavy': return `Heavy encumbrance: ${encumbrance.penalty} DM to physical tasks`;
      case 'overloaded': return `Overloaded: ${encumbrance.penalty} DM, movement restricted`;
      default: return '';
    }
  };
  
  const locations: Array<{ id: EquipmentLocation; label: string; count: number }> = [
    { id: 'carried', label: 'Carried', count: equipmentByLocation.carried.length },
    { id: 'equipped', label: 'Equipped', count: equipmentByLocation.equipped.length },
    { id: 'stored', label: 'Stored', count: equipmentByLocation.stored.length },
    { id: 'ship', label: 'Ship', count: equipmentByLocation.ship.length },
    { id: 'home', label: 'Home', count: equipmentByLocation.home.length },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Equipment</h2>
              <p className="text-sm text-muted-foreground">
                {character.equipment.length} items • Total value: Cr{getTotalValue().toLocaleString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              {!readonly && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSearch(!showSearch)}
                  >
                    {showSearch ? 'Hide Search' : 'Search'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setEditingItem(undefined);
                      setShowAddModal(true);
                    }}
                  >
                    Add Item
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search */}
          {showSearch && (
            <div className="mb-6">
              <EquipmentSearch
                equipment={character.equipment}
                onFilter={setFilteredEquipment}
              />
            </div>
          )}
          
          {/* Enhanced Encumbrance Status */}
          <div className="mb-6 p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Encumbrance</h3>
              <span className={`text-sm font-medium ${getEncumbranceColorClass(encumbrance)}`}>
                {encumbrance.encumbranceLevel === 'none' ? 'Normal' : encumbrance.encumbranceLevel}
                {encumbrance.penalty < 0 && ` (${encumbrance.penalty} DM)`}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Carried:</span>
                  <span>{encumbrance.carried.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Equipped:</span>
                  <span>{encumbrance.equipped.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{encumbrance.total.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span>{encumbrance.normalCapacity} kg</span>
                </div>
              </div>
              
              <div className="w-full bg-background rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${getEncumbranceColorClass(encumbrance).replace('text-', 'bg-')}`}
                  style={{ width: `${Math.min((encumbrance.total / encumbrance.maxCapacity) * 100, 100)}%` }}
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                {getEncumbranceDescription(encumbrance)}
              </p>
            </div>
          </div>
          
          {/* Equipment Effects Summary */}
          {equipmentEffects.characteristics && Object.keys(equipmentEffects.characteristics).length > 0 || 
           equipmentEffects.skills.length > 0 || 
           equipmentEffects.protection > 0 ? (
            <div className="mb-6 p-4 rounded-lg border border-border bg-green-50">
              <h3 className="font-medium mb-2">Equipment Effects</h3>
              <div className="space-y-1 text-sm">
                {equipmentEffects.protection > 0 && (
                  <div>Protection: +{equipmentEffects.protection}</div>
                )}
                {Object.entries(equipmentEffects.characteristics).map(([char, mod]) => (
                  <div key={char}>
                    {char}: {mod > 0 ? '+' : ''}{mod}
                  </div>
                ))}
                {equipmentEffects.skills.map(skill => (
                  <div key={skill.name}>
                    {skill.name}: {skill.modifier > 0 ? '+' : ''}{skill.modifier}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          
        </CardContent>
      </Card>
      
      {/* Location Tabs */}
      <div className="flex flex-wrap gap-2">
        {locations.map(location => (
          <button
            key={location.id}
            onClick={() => setActiveLocation(location.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeLocation === location.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <span>{getEquipmentLocationIcon(location.id)}</span>
            {location.label}
            {location.count > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-background/20 rounded-full">
                {location.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* Equipment List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <span>{getEquipmentLocationIcon(activeLocation)}</span>
            {locations.find(l => l.id === activeLocation)?.label} Equipment
          </h3>
        </CardHeader>
        
        <CardContent>
          {equipmentByLocation[activeLocation].length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg font-medium mb-2">No items in {activeLocation} storage</div>
              <div className="text-sm text-muted-foreground">
                Add items to this location to see them here
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {equipmentByLocation[activeLocation].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getEquipmentCategoryIcon(item.category)}</span>
                      <span className="font-medium">{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-sm text-muted-foreground">×{item.quantity}</span>
                      )}
                      <span className={`text-sm ${getConditionColorClass(item.condition)}`}>
                        • {item.condition}
                      </span>
                      {item.isCustom && (
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.category} • TL{item.techLevel} • {item.weight}kg • Cr{item.cost.toLocaleString()}
                      {item.notes && (
                        <span className="ml-2">• {item.notes}</span>
                      )}
                    </div>
                    
                    {/* Equipment Effects */}
                    {item.effects && item.effects.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.effects.map((effect, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            {effect.target}: {effect.modifier > 0 ? '+' : ''}{effect.modifier}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Combat Stats */}
                    {(item.damage || item.protection || item.range) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.damage && <span>Damage: {item.damage} </span>}
                        {item.protection && <span>Protection: {item.protection} </span>}
                        {item.range && <span>Range: {item.range}</span>}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!readonly && (
                      <>
                        <EditableSelect
                          value={item.location}
                          onChange={(value) => handleItemUpdate(item.id, { location: value as EquipmentLocation })}
                          options={[
                            { value: 'carried', label: 'Carried' },
                            { value: 'equipped', label: 'Equipped' },
                            { value: 'stored', label: 'Stored' },
                            { value: 'ship', label: 'Ship' },
                            { value: 'home', label: 'Home' }
                          ]}
                          className="text-xs"
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">Equipment Summary</h3>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{character.equipment.length}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{getTotalWeight().toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Total Weight (kg)</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">Cr{getTotalValue().toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{equipmentByLocation.equipped.length}</div>
              <div className="text-sm text-muted-foreground">Equipped Items</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add/Edit Equipment Modal */}
      <AddEditEquipmentModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingItem(undefined);
        }}
        onSave={handleSaveEquipment}
        editingItem={editingItem}
        existingEquipment={character.equipment}
      />
    </div>
  );
};

export default CharacterEquipment;

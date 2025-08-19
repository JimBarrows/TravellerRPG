import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import type { 
  CharacterSheetEquipment, 
  EquipmentCategory, 
  EquipmentLocation, 
  EquipmentCondition,
  EquipmentEffect 
} from '../../types/characterSheet';
import { Equipment, WEAPONS, ARMOR, EQUIPMENT } from '../../data/equipment';
import Card, { CardHeader, CardContent } from '../../../../shared/components/molecules/Card';
import Button from '../../../../shared/components/atoms/Button';
import Input from '../../../../shared/components/atoms/Input';
import { EditableText, EditableNumber, EditableSelect, EditableTextarea } from '../EditableFields';

interface AddEditEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipment: CharacterSheetEquipment) => void;
  editingItem?: CharacterSheetEquipment;
  existingEquipment: CharacterSheetEquipment[];
}

// Validation schemas
const equipmentValidationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  category: z.enum(['weapon', 'armor', 'tool', 'survival', 'medical', 'computer', 'communication', 'vehicle', 'augmentation', 'clothing', 'misc']),
  cost: z.number().min(0, 'Cost cannot be negative'),
  weight: z.number().min(0, 'Weight cannot be negative'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  techLevel: z.number().min(0).max(20, 'Tech level must be 0-20'),
  location: z.enum(['carried', 'stored', 'equipped', 'ship', 'home']),
  condition: z.enum(['excellent', 'good', 'fair', 'poor', 'broken'])
});

const AddEditEquipmentModal: React.FC<AddEditEquipmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  existingEquipment
}) => {
  const [formData, setFormData] = useState<Partial<CharacterSheetEquipment>>({
    name: '',
    category: 'misc',
    cost: 0,
    weight: 0,
    quantity: 1,
    techLevel: 7,
    location: 'carried',
    condition: 'good',
    notes: '',
    availability: 'common',
    lawLevel: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isValid, setIsValid] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Equipment | null>(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [customEffects, setCustomEffects] = useState<EquipmentEffect[]>([]);

  // Initialize form when editing
  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem);
      setCustomEffects(editingItem.effects || []);
      setShowTemplates(false);
    } else {
      // Reset form for new item
      setFormData({
        name: '',
        category: 'misc',
        cost: 0,
        weight: 0,
        quantity: 1,
        techLevel: 7,
        location: 'carried',
        condition: 'good',
        notes: '',
        availability: 'common',
        lawLevel: 0
      });
      setCustomEffects([]);
      setShowTemplates(true);
    }
  }, [editingItem, isOpen]);

  // Validate form
  useEffect(() => {
    try {
      equipmentValidationSchema.parse(formData);
      setErrors({});
      setIsValid(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string[]> = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          if (!newErrors[path]) newErrors[path] = [];
          newErrors[path].push(err.message);
        });
        setErrors(newErrors);
        setIsValid(false);
      }
    }
  }, [formData]);

  const handleTemplateSelect = (template: Equipment) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      name: template.name,
      category: template.category,
      cost: template.cost,
      weight: template.weight,
      techLevel: template.techLevel,
      damage: template.damage,
      protection: template.protection,
      range: template.range,
      magazine: template.magazine,
      traits: template.traits,
      availability: template.availability,
      lawLevel: template.lawLevel,
      powerSource: template.powerSource ? {
        type: template.powerSource.type,
        capacity: template.powerSource.capacity,
        current: template.powerSource.capacity,
        cost: template.powerSource.cost,
        rechargeable: template.powerSource.rechargeable
      } : undefined,
      ammunition: template.ammunition ? {
        type: template.ammunition.type,
        capacity: template.ammunition.capacity,
        current: template.ammunition.capacity,
        cost: template.ammunition.cost
      } : undefined
    });
    setCustomEffects(template.effects || []);
    setShowTemplates(false);
  };

  const handleSave = () => {
    if (!isValid || !formData.name) return;

    const equipmentToSave: CharacterSheetEquipment = {
      id: editingItem?.id || crypto.randomUUID(),
      name: formData.name,
      type: formData.category || 'misc', // backward compatibility
      category: formData.category || 'misc',
      cost: formData.cost || 0,
      weight: formData.weight || 0,
      quantity: formData.quantity || 1,
      techLevel: formData.techLevel || 7,
      location: formData.location || 'carried',
      condition: formData.condition || 'good',
      notes: formData.notes,
      modifications: formData.modifications,
      availability: formData.availability,
      lawLevel: formData.lawLevel,
      effects: customEffects.length > 0 ? customEffects : undefined,
      powerSource: formData.powerSource,
      ammunition: formData.ammunition,
      traits: formData.traits,
      damage: formData.damage,
      protection: formData.protection,
      range: formData.range,
      magazine: formData.magazine,
      isCustom: !selectedTemplate
    };

    onSave(equipmentToSave);
    onClose();
  };

  const addEffect = () => {
    setCustomEffects([
      ...customEffects,
      {
        type: 'skill',
        target: '',
        modifier: 0,
        condition: 'when equipped',
        stackable: false
      }
    ]);
  };

  const updateEffect = (index: number, updates: Partial<EquipmentEffect>) => {
    const newEffects = [...customEffects];
    newEffects[index] = { ...newEffects[index], ...updates };
    setCustomEffects(newEffects);
  };

  const removeEffect = (index: number) => {
    setCustomEffects(customEffects.filter((_, i) => i !== index));
  };

  const getAllTemplates = (): Equipment[] => {
    return [...WEAPONS, ...ARMOR, ...EQUIPMENT];
  };

  const getFilteredTemplates = (category?: EquipmentCategory): Equipment[] => {
    const templates = getAllTemplates();
    return category ? templates.filter(t => t.category === category) : templates;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {editingItem ? 'Edit Equipment' : 'Add Equipment'}
              </h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Template Selection */}
            {showTemplates && !editingItem && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Select Template (Optional)</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplates(false)}
                  >
                    Create Custom
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {getFilteredTemplates().map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className="p-3 text-left border rounded-lg hover:border-primary transition-colors"
                    >
                      <div className="font-medium text-sm">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.category} • TL{template.techLevel} • {template.cost}Cr
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableText
                label="Name"
                value={formData.name || ''}
                onChange={(value) => setFormData({...formData, name: value})}
                validation={z.string().min(1).max(50)}
                required
              />
              
              <EditableSelect
                label="Category"
                value={formData.category || 'misc'}
                onChange={(value) => setFormData({...formData, category: value as EquipmentCategory})}
                options={[
                  { value: 'weapon', label: 'Weapon' },
                  { value: 'armor', label: 'Armor' },
                  { value: 'tool', label: 'Tool' },
                  { value: 'survival', label: 'Survival' },
                  { value: 'medical', label: 'Medical' },
                  { value: 'computer', label: 'Computer' },
                  { value: 'communication', label: 'Communication' },
                  { value: 'vehicle', label: 'Vehicle' },
                  { value: 'augmentation', label: 'Augmentation' },
                  { value: 'clothing', label: 'Clothing' },
                  { value: 'misc', label: 'Miscellaneous' }
                ]}
                required
              />
            </div>

            {/* Physical Properties */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <EditableNumber
                label="Cost (Cr)"
                value={formData.cost || 0}
                onChange={(value) => setFormData({...formData, cost: value})}
                validation={z.number().min(0)}
                min={0}
              />
              
              <EditableNumber
                label="Weight (kg)"
                value={formData.weight || 0}
                onChange={(value) => setFormData({...formData, weight: value})}
                validation={z.number().min(0)}
                min={0}
                step={0.1}
              />
              
              <EditableNumber
                label="Quantity"
                value={formData.quantity || 1}
                onChange={(value) => setFormData({...formData, quantity: value})}
                validation={z.number().min(1)}
                min={1}
              />
              
              <EditableNumber
                label="Tech Level"
                value={formData.techLevel || 7}
                onChange={(value) => setFormData({...formData, techLevel: value})}
                validation={z.number().min(0).max(20)}
                min={0}
                max={20}
              />
            </div>

            {/* Location and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableSelect
                label="Location"
                value={formData.location || 'carried'}
                onChange={(value) => setFormData({...formData, location: value as EquipmentLocation})}
                options={[
                  { value: 'carried', label: 'Carried' },
                  { value: 'equipped', label: 'Equipped' },
                  { value: 'stored', label: 'Stored' },
                  { value: 'ship', label: 'Ship' },
                  { value: 'home', label: 'Home' }
                ]}
                required
              />
              
              <EditableSelect
                label="Condition"
                value={formData.condition || 'good'}
                onChange={(value) => setFormData({...formData, condition: value as EquipmentCondition})}
                options={[
                  { value: 'excellent', label: 'Excellent (+25%)' },
                  { value: 'good', label: 'Good (Normal)' },
                  { value: 'fair', label: 'Fair (-25%)' },
                  { value: 'poor', label: 'Poor (-50%)' },
                  { value: 'broken', label: 'Broken (Non-functional)' }
                ]}
                required
              />
            </div>

            {/* Combat Properties (if weapon/armor) */}
            {(formData.category === 'weapon' || formData.category === 'armor') && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.category === 'weapon' && (
                  <>
                    <EditableText
                      label="Damage"
                      value={formData.damage || ''}
                      onChange={(value) => setFormData({...formData, damage: value})}
                      placeholder="e.g., 3D+3"
                    />
                    
                    <EditableText
                      label="Range"
                      value={formData.range || ''}
                      onChange={(value) => setFormData({...formData, range: value})}
                      placeholder="e.g., 50/100"
                    />
                    
                    <EditableNumber
                      label="Magazine"
                      value={formData.magazine || 0}
                      onChange={(value) => setFormData({...formData, magazine: value})}
                      min={0}
                    />
                  </>
                )}
                
                {formData.category === 'armor' && (
                  <EditableNumber
                    label="Protection"
                    value={formData.protection || 0}
                    onChange={(value) => setFormData({...formData, protection: value})}
                    min={0}
                  />
                )}
              </div>
            )}

            {/* Equipment Effects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Equipment Effects</h3>
                <Button variant="outline" size="sm" onClick={addEffect}>
                  Add Effect
                </Button>
              </div>
              
              {customEffects.map((effect, index) => (
                <div key={index} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Effect {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEffect(index)}
                      className="text-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <select
                      value={effect.type}
                      onChange={(e) => updateEffect(index, { type: e.target.value as any })}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="skill">Skill Modifier</option>
                      <option value="characteristic">Characteristic</option>
                      <option value="protection">Protection</option>
                      <option value="special">Special</option>
                    </select>
                    
                    <Input
                      value={effect.target}
                      onChange={(e) => updateEffect(index, { target: e.target.value })}
                      placeholder="Target name"
                      className="text-sm"
                    />
                    
                    <Input
                      type="number"
                      value={effect.modifier}
                      onChange={(e) => updateEffect(index, { modifier: parseInt(e.target.value) || 0 })}
                      placeholder="Modifier"
                      className="text-sm"
                    />
                    
                    <Input
                      value={effect.condition || ''}
                      onChange={(e) => updateEffect(index, { condition: e.target.value })}
                      placeholder="Condition"
                      className="text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <EditableTextarea
              label="Notes"
              value={formData.notes || ''}
              onChange={(value) => setFormData({...formData, notes: value})}
              placeholder="Additional notes about this equipment..."
              maxLength={500}
            />

            {/* Validation Errors */}
            {Object.keys(errors).length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Please fix the following errors:</h4>
                <ul className="text-sm text-red-600 space-y-1">
                  {Object.entries(errors).map(([field, fieldErrors]) => (
                    <li key={field}>
                      <strong>{field}:</strong> {fieldErrors.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!isValid || !formData.name}
              >
                {editingItem ? 'Update' : 'Add'} Equipment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddEditEquipmentModal;
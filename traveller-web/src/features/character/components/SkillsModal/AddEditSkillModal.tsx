import React, { useState, useEffect, useMemo } from 'react';
import { SKILLS, SKILL_CATEGORIES, getSkillById, type SkillCategory } from '../../../data/skills';
import { validateSkillName, validateSkillSpecialization, skillSchema } from '../../../validation/schemas';
import type { CharacterSheetSkill, CharacterCharacteristics } from '../../../types/characterSheet';
import Modal from '../../../../../shared/components/molecules/Modal';
import Button from '../../../../../shared/components/atoms/Button';
import Input from '../../../../../shared/components/atoms/Input';
import { EditableNumber, EditableSelect, EditableText, EditableTextarea } from '../EditableFields';

interface AddEditSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skill: Omit<CharacterSheetSkill, 'id'>) => void;
  editingSkill?: CharacterSheetSkill;
  existingSkills: CharacterSheetSkill[];
  characteristics: CharacterCharacteristics;
}

const AddEditSkillModal: React.FC<AddEditSkillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSkill,
  existingSkills,
  characteristics
}) => {
  const [formData, setFormData] = useState<Omit<CharacterSheetSkill, 'id'>>({
    name: '',
    level: 0,
    category: 'Personal',
    characteristic: 'intelligence',
    isCareerSkill: false,
    specialty: '',
    notes: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [selectedSkillDefinition, setSelectedSkillDefinition] = useState<string>('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Initialize form when editing or modal opens
  useEffect(() => {
    if (editingSkill) {
      setFormData({
        name: editingSkill.name,
        level: editingSkill.level,
        category: editingSkill.category,
        characteristic: editingSkill.characteristic,
        isCareerSkill: editingSkill.isCareerSkill,
        specialty: editingSkill.specialty || '',
        notes: editingSkill.notes || '',
        experiencePoints: editingSkill.experiencePoints,
        lastUsed: editingSkill.lastUsed,
        usage: editingSkill.usage,
        improvementHistory: editingSkill.improvementHistory,
        defaultCharacteristic: editingSkill.defaultCharacteristic,
        cascadeSkills: editingSkill.cascadeSkills
      });
      setShowAdvancedOptions(true);
    } else {
      setFormData({
        name: '',
        level: 0,
        category: 'Personal',
        characteristic: 'intelligence',
        isCareerSkill: false,
        specialty: '',
        notes: ''
      });
      setShowAdvancedOptions(false);
    }
    setValidationErrors({});
    setSelectedSkillDefinition('');
  }, [editingSkill, isOpen]);
  
  // Get available skill definitions for autocomplete
  const skillSuggestions = useMemo(() => {
    return SKILLS.filter(skill => 
      !existingSkills.some(existing => 
        existing.name.toLowerCase() === skill.name.toLowerCase() && 
        existing.id !== editingSkill?.id
      )
    );
  }, [existingSkills, editingSkill]);
  
  // Get selected skill definition for help text and specializations
  const skillDefinition = useMemo(() => {
    if (selectedSkillDefinition) {
      return getSkillById(selectedSkillDefinition);
    }
    return SKILLS.find(skill => skill.name.toLowerCase() === formData.name.toLowerCase());
  }, [selectedSkillDefinition, formData.name]);
  
  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};
    
    // Validate skill name
    const nameErrors = validateSkillName(formData.name, existingSkills.filter(s => s.id !== editingSkill?.id));
    if (nameErrors.length > 0) {
      errors.name = nameErrors;
    }
    
    // Validate specialization
    if (formData.specialty) {
      const specErrors = validateSkillSpecialization(
        formData.name, 
        formData.specialty, 
        existingSkills.filter(s => s.id !== editingSkill?.id)
      );
      if (specErrors.length > 0) {
        errors.specialty = specErrors;
      }
    }
    
    // Validate with schema
    const schemaResult = skillSchema.safeParse(formData);
    if (!schemaResult.success) {
      schemaResult.error.errors.forEach(error => {
        const field = error.path[0] as string;
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(error.message);
      });
    }
    
    // Check if specialization is required for this skill
    if (skillDefinition?.specializations && skillDefinition.specializations.length > 0 && !formData.specialty) {
      if (!errors.specialty) {
        errors.specialty = [];
      }
      errors.specialty.push('This skill requires a specialization');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSave(formData);
  };
  
  const handleSkillSelect = (skillId: string) => {
    const skill = getSkillById(skillId);
    if (skill) {
      setSelectedSkillDefinition(skillId);
      setFormData(prev => ({
        ...prev,
        name: skill.name,
        characteristic: skill.characteristic,
        category: skill.category || 'Personal',
        specialty: skill.specializations && skill.specializations.length === 1 ? skill.specializations[0] : ''
      }));
    }
  };
  
  const handleFieldUpdate = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const getCharacteristicModifier = (characteristic: keyof CharacterCharacteristics): number => {
    const value = characteristics[characteristic];
    if (value <= 0) return -3;
    if (value === 1) return -2;
    return Math.floor((value - 6) / 3);
  };
  
  const getTotalDM = (): number => {
    return formData.level + getCharacteristicModifier(formData.characteristic);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSkill ? 'Edit Skill' : 'Add New Skill'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Skill Selection */}
        {!editingSkill && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Choose from Traveller Skills (Optional)
            </label>
            <select
              value={selectedSkillDefinition}
              onChange={(e) => handleSkillSelect(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
            >
              <option value="">Select a skill...</option>
              {skillSuggestions.map(skill => (
                <option key={skill.id} value={skill.id}>
                  {skill.name} ({skill.category}) - {skill.characteristic.toUpperCase()}
                </option>
              ))}
            </select>
            {skillDefinition && (
              <p className="text-sm text-muted-foreground mt-1">
                {skillDefinition.description}
              </p>
            )}
          </div>
        )}
        
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <EditableText
              label="Skill Name *"
              value={formData.name}
              onChange={(value) => handleFieldUpdate('name', value)}
              placeholder="Enter skill name"
              required
              maxLength={50}
            />
            {validationErrors.name && (
              <div className="text-red-600 text-sm mt-1">
                {validationErrors.name.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <EditableNumber
              label="Level *"
              value={formData.level}
              onChange={(value) => handleFieldUpdate('level', value)}
              min={0}
              max={6}
              showSteppers
              required
            />
            {validationErrors.level && (
              <div className="text-red-600 text-sm mt-1">
                {validationErrors.level.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <EditableSelect
              label="Category *"
              value={formData.category}
              onChange={(value) => handleFieldUpdate('category', value)}
              options={Object.entries(SKILL_CATEGORIES).map(([key, category]) => ({
                value: key,
                label: category.name
              }))}
              required
            />
          </div>
          
          <div>
            <EditableSelect
              label="Governing Characteristic *"
              value={formData.characteristic}
              onChange={(value) => handleFieldUpdate('characteristic', value)}
              options={[
                { value: 'strength', label: 'Strength (STR)' },
                { value: 'dexterity', label: 'Dexterity (DEX)' },
                { value: 'endurance', label: 'Endurance (END)' },
                { value: 'intelligence', label: 'Intelligence (INT)' },
                { value: 'education', label: 'Education (EDU)' },
                { value: 'social', label: 'Social (SOC)' }
              ]}
              required
            />
          </div>
        </div>
        
        {/* Specialization */}
        <div>
          {skillDefinition?.specializations && skillDefinition.specializations.length > 0 ? (
            <EditableSelect
              label={`Specialization ${skillDefinition.specializations.length > 1 ? '*' : ''}`}
              value={formData.specialty || ''}
              onChange={(value) => handleFieldUpdate('specialty', value)}
              options={[
                { value: '', label: 'None' },
                ...skillDefinition.specializations.map(spec => ({
                  value: spec,
                  label: spec
                }))
              ]}
              required={skillDefinition.specializations.length > 0}
            />
          ) : (
            <EditableText
              label="Specialization"
              value={formData.specialty || ''}
              onChange={(value) => handleFieldUpdate('specialty', value)}
              placeholder="Optional specialization"
              maxLength={50}
            />
          )}
          {validationErrors.specialty && (
            <div className="text-red-600 text-sm mt-1">
              {validationErrors.specialty.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
        </div>
        
        {/* Career Skill Toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="career-skill"
            checked={formData.isCareerSkill}
            onChange={(e) => handleFieldUpdate('isCareerSkill', e.target.checked)}
            className="rounded"
          />
          <label htmlFor="career-skill" className="text-sm font-medium">
            Career Skill (costs less experience to improve)
          </label>
        </div>
        
        {/* Notes */}
        <div>
          <EditableTextarea
            label="Notes"
            value={formData.notes || ''}
            onChange={(value) => handleFieldUpdate('notes', value)}
            placeholder="Optional notes about this skill"
            maxLength={500}
            rows={3}
          />
        </div>
        
        {/* Current Stats Display */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Skill Statistics</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold">
                {getCharacteristicModifier(formData.characteristic) >= 0 ? '+' : ''}
                {getCharacteristicModifier(formData.characteristic)}
              </div>
              <div className="text-muted-foreground">Characteristic DM</div>
            </div>
            <div>
              <div className="font-semibold">{formData.level}</div>
              <div className="text-muted-foreground">Skill Level</div>
            </div>
            <div>
              <div className="font-semibold text-primary">
                {getTotalDM() >= 0 ? '+' : ''}{getTotalDM()}
              </div>
              <div className="text-muted-foreground">Total DM</div>
            </div>
          </div>
        </div>
        
        {/* Advanced Options Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="text-sm text-primary hover:text-primary-dark"
          >
            {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options
          </button>
        </div>
        
        {/* Advanced Options */}
        {showAdvancedOptions && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium">Advanced Options</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <EditableNumber
                  label="Experience Points"
                  value={formData.experiencePoints || 0}
                  onChange={(value) => handleFieldUpdate('experiencePoints', value)}
                  min={0}
                />
              </div>
              
              <div>
                <EditableSelect
                  label="Default Characteristic"
                  value={formData.defaultCharacteristic || formData.characteristic}
                  onChange={(value) => handleFieldUpdate('defaultCharacteristic', value)}
                  options={[
                    { value: 'strength', label: 'Strength' },
                    { value: 'dexterity', label: 'Dexterity' },
                    { value: 'endurance', label: 'Endurance' },
                    { value: 'intelligence', label: 'Intelligence' },
                    { value: 'education', label: 'Education' },
                    { value: 'social', label: 'Social' }
                  ]}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Some skills can use different characteristics in different situations
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            {editingSkill ? 'Update Skill' : 'Add Skill'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditSkillModal;
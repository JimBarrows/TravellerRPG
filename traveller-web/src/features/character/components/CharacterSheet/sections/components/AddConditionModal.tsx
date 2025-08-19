/**
 * Add/Edit Condition Modal Component
 * Modal for adding new conditions or editing existing ones
 */

import React, { useState, useEffect } from 'react';
import type { StatusCondition, TravellerConditionTemplate } from '../../../../types/characterSheet';
import Modal from '../../../../../../shared/components/molecules/Modal';
import Button from '../../../../../../shared/components/atoms/Button';
import { EditableText, EditableSelect, EditableNumber, EditableTextarea } from '../../../EditableFields';
import { TRAVELLER_CONDITIONS, SEVERITY_INFO, DURATION_INFO } from '../../../../data/conditions';

interface AddConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCondition: (template: string | TravellerConditionTemplate, customizations?: Partial<StatusCondition>) => StatusCondition;
  existingCondition?: StatusCondition;
  validateCompatibility: (condition: StatusCondition) => { compatible: boolean; warnings: string[] };
}

const AddConditionModal: React.FC<AddConditionModalProps> = ({
  isOpen,
  onClose,
  onAddCondition,
  existingCondition,
  validateCompatibility
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'moderate' | 'major' | 'critical' | 'terminal'>('minor');
  const [type, setType] = useState<'physical' | 'mental' | 'social' | 'environmental' | 'medical' | 'fatigue' | 'aging' | 'augmentation'>('physical');
  const [duration, setDuration] = useState<'instant' | 'rounds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'permanent' | 'until_treated' | 'until_healed'>('hours');
  const [durationValue, setDurationValue] = useState(1);
  const [notes, setNotes] = useState('');
  const [source, setSource] = useState('');
  const [isCustomCondition, setIsCustomCondition] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Template options for the dropdown
  const templateOptions = [
    { value: '', label: 'Select a condition template...', disabled: true },
    { value: 'CUSTOM', label: '--- Create Custom Condition ---' },
    ...Object.entries(TRAVELLER_CONDITIONS).map(([key, template]) => ({
      value: key,
      label: template.name,
      description: template.description
    }))
  ];

  const severityOptions = Object.entries(SEVERITY_INFO).map(([key, info]) => ({
    value: key,
    label: info.label,
    description: info.description
  }));

  const typeOptions = [
    { value: 'physical', label: 'Physical', description: 'Physical injuries and damage' },
    { value: 'mental', label: 'Mental', description: 'Psychological conditions' },
    { value: 'social', label: 'Social', description: 'Social standing effects' },
    { value: 'environmental', label: 'Environmental', description: 'Environmental hazards' },
    { value: 'medical', label: 'Medical', description: 'Disease, poison, addiction' },
    { value: 'fatigue', label: 'Fatigue', description: 'Exhaustion and tiredness' },
    { value: 'aging', label: 'Aging', description: 'Age-related degradation' },
    { value: 'augmentation', label: 'Augmentation', description: 'Cyberware and enhancement effects' }
  ];

  const durationOptions = Object.entries(DURATION_INFO).map(([key, info]) => ({
    value: key,
    label: info.label,
    description: info.description
  }));

  // Initialize form with existing condition data
  useEffect(() => {
    if (existingCondition) {
      setCustomName(existingCondition.name);\n      setCustomDescription(existingCondition.description);\n      setSeverity(existingCondition.severity);\n      setType(existingCondition.type);\n      setDuration(existingCondition.duration);\n      setDurationValue(existingCondition.durationValue || 1);\n      setNotes(existingCondition.notes || '');\n      setSource(existingCondition.source || '');\n      setIsCustomCondition(true);\n      setSelectedTemplate('CUSTOM');\n    } else {\n      // Reset form\n      setSelectedTemplate('');\n      setCustomName('');\n      setCustomDescription('');\n      setSeverity('minor');\n      setType('physical');\n      setDuration('hours');\n      setDurationValue(1);\n      setNotes('');\n      setSource('');\n      setIsCustomCondition(false);\n    }\n  }, [existingCondition]);\n\n  // Handle template selection\n  useEffect(() => {\n    if (selectedTemplate === 'CUSTOM') {\n      setIsCustomCondition(true);\n    } else if (selectedTemplate && selectedTemplate !== '') {\n      const template = TRAVELLER_CONDITIONS[selectedTemplate];\n      if (template) {\n        setCustomName(template.name);\n        setCustomDescription(template.description);\n        setSeverity(template.defaultSeverity);\n        setType(template.type);\n        setDuration(template.defaultDuration);\n        setIsCustomCondition(false);\n      }\n    }\n  }, [selectedTemplate]);\n\n  // Validate condition compatibility\n  useEffect(() => {\n    if (customName && customDescription) {\n      const mockCondition: StatusCondition = {\n        id: 'temp',\n        name: customName,\n        description: customDescription,\n        severity,\n        type,\n        duration,\n        effects: [],\n        appliedAt: new Date().toISOString(),\n        durationValue\n      };\n      \n      const validation = validateCompatibility(mockCondition);\n      setWarnings(validation.warnings);\n    }\n  }, [customName, customDescription, severity, type, duration, validateCompatibility]);\n\n  const handleSubmit = () => {\n    try {\n      const customizations: Partial<StatusCondition> = {\n        severity,\n        duration,\n        durationValue: duration !== 'permanent' && duration !== 'until_treated' && duration !== 'until_healed' ? durationValue : undefined,\n        notes: notes.trim() || undefined,\n        source: source.trim() || undefined\n      };\n\n      if (isCustomCondition || selectedTemplate === 'CUSTOM') {\n        // Create custom condition template\n        const customTemplate: TravellerConditionTemplate = {\n          name: customName,\n          description: customDescription,\n          type,\n          defaultSeverity: severity,\n          defaultDuration: duration,\n          effects: [], // Custom conditions start with no predefined effects\n          canWorsen: true,\n          canImprove: true\n        };\n        \n        onAddCondition(customTemplate, customizations);\n      } else {\n        // Use predefined template\n        onAddCondition(selectedTemplate, customizations);\n      }\n      \n      onClose();\n    } catch (error) {\n      console.error('Error adding condition:', error);\n      // Could show error message to user\n    }\n  };\n\n  const isFormValid = () => {\n    if (isCustomCondition || selectedTemplate === 'CUSTOM') {\n      return customName.trim() && customDescription.trim();\n    }\n    return selectedTemplate && selectedTemplate !== '';\n  };\n\n  return (\n    <Modal isOpen={isOpen} onClose={onClose} title={existingCondition ? 'Edit Condition' : 'Add Condition'}>\n      <div className=\"space-y-4\">\n        {/* Template Selection */}\n        {!existingCondition && (\n          <EditableSelect\n            label=\"Condition Template\"\n            value={selectedTemplate}\n            onChange={setSelectedTemplate}\n            options={templateOptions}\n            placeholder=\"Choose a condition template...\"\n            searchable\n            required\n          />\n        )}\n\n        {/* Custom Condition Fields */}\n        {(isCustomCondition || selectedTemplate === 'CUSTOM' || existingCondition) && (\n          <>\n            <EditableText\n              label=\"Condition Name\"\n              value={customName}\n              onChange={setCustomName}\n              placeholder=\"Enter condition name...\"\n              required\n            />\n\n            <EditableTextarea\n              label=\"Description\"\n              value={customDescription}\n              onChange={setCustomDescription}\n              placeholder=\"Describe the condition and its effects...\"\n              required\n            />\n          </>\n        )}\n\n        {/* Severity */}\n        <EditableSelect\n          label=\"Severity\"\n          value={severity}\n          onChange={(value) => setSeverity(value as any)}\n          options={severityOptions}\n          required\n        />\n\n        {/* Type (only for custom conditions) */}\n        {(isCustomCondition || selectedTemplate === 'CUSTOM' || existingCondition) && (\n          <EditableSelect\n            label=\"Condition Type\"\n            value={type}\n            onChange={(value) => setType(value as any)}\n            options={typeOptions}\n            required\n          />\n        )}\n\n        {/* Duration */}\n        <div className=\"grid grid-cols-2 gap-4\">\n          <EditableSelect\n            label=\"Duration Type\"\n            value={duration}\n            onChange={(value) => setDuration(value as any)}\n            options={durationOptions}\n            required\n          />\n          \n          {duration !== 'permanent' && duration !== 'until_treated' && duration !== 'until_healed' && (\n            <EditableNumber\n              label={`Duration (${DURATION_INFO[duration].label})`}\n              value={durationValue}\n              onChange={setDurationValue}\n              min={1}\n              max={999}\n              required\n            />\n          )}\n        </div>\n\n        {/* Additional Information */}\n        <EditableText\n          label=\"Source\"\n          value={source}\n          onChange={setSource}\n          placeholder=\"What caused this condition? (optional)\"\n        />\n\n        <EditableTextarea\n          label=\"Notes\"\n          value={notes}\n          onChange={setNotes}\n          placeholder=\"Additional notes about this condition... (optional)\"\n        />\n\n        {/* Warnings */}\n        {warnings.length > 0 && (\n          <div className=\"p-3 bg-yellow-50 border border-yellow-200 rounded\">\n            <div className=\"text-yellow-800 text-sm font-medium mb-1\">Warnings:</div>\n            <ul className=\"text-yellow-700 text-sm space-y-1\">\n              {warnings.map((warning, index) => (\n                <li key={index}>• {warning}</li>\n              ))}\n            </ul>\n          </div>\n        )}\n\n        {/* Selected Template Preview */}\n        {selectedTemplate && selectedTemplate !== '' && selectedTemplate !== 'CUSTOM' && (\n          <div className=\"p-3 bg-muted/50 border border-border rounded\">\n            <div className=\"text-sm font-medium mb-1\">Template Preview:</div>\n            <div className=\"text-sm text-muted-foreground\">\n              {TRAVELLER_CONDITIONS[selectedTemplate]?.description}\n            </div>\n          </div>\n        )}\n      </div>\n\n      {/* Modal Actions */}\n      <div className=\"flex justify-end gap-2 mt-6 pt-4 border-t border-border\">\n        <Button variant=\"outline\" onClick={onClose}>\n          Cancel\n        </Button>\n        <Button \n          variant=\"default\" \n          onClick={handleSubmit}\n          disabled={!isFormValid()}\n        >\n          {existingCondition ? 'Update Condition' : 'Add Condition'}\n        </Button>\n      </div>\n    </Modal>\n  );\n};\n\nexport default AddConditionModal;
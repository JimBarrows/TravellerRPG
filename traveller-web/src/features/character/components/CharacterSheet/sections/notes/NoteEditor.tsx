import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Save, X, Star, Lock, Eye, Tag, Palette } from 'lucide-react';
import { RichTextEditor } from '../../../EditableFields';
import { extractPlainText, generateNoteMetadata, validateNoteData } from '../../../../utils/notesUtils';
import type { CharacterNote, NoteCategoryDefinition } from '../../../../types/characterSheet';
import Button from '../../../../../../shared/components/atoms/Button';
import Card, { CardHeader, CardContent } from '../../../../../../shared/components/molecules/Card';

interface NoteEditorProps {
  note: CharacterNote;
  isCreating?: boolean;
  readonly?: boolean;
  categories: NoteCategoryDefinition[];
  commonTags: string[];
  onSave: (note: CharacterNote) => void;
  onCancel: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  note: initialNote,
  isCreating = false,
  readonly = false,
  categories,
  commonTags,
  onSave,
  onCancel,
}) => {
  const [note, setNote] = useState<CharacterNote>(initialNote);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isCreating]);

  const updateNote = useCallback((updates: Partial<CharacterNote>) => {
    setNote(prev => ({ ...prev, ...updates }));
    setHasUnsavedChanges(true);
    
    // Clear existing auto-save timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new auto-save timeout for 2 seconds
    const timeout = setTimeout(() => {
      handleSave({ ...note, ...updates }, true);
    }, 2000);
    
    setAutoSaveTimeout(timeout);
  }, [note, autoSaveTimeout]);

  const handleContentChange = useCallback((content: string) => {
    const plainText = extractPlainText(content);
    const metadata = generateNoteMetadata(content);
    
    updateNote({
      content,
      plainTextContent: plainText,
      metadata,
    });
  }, [updateNote]);

  const handleSave = useCallback((noteToSave?: CharacterNote, isAutoSave = false) => {
    const finalNote = noteToSave || note;
    
    // Validate
    const errors = validateNoteData(finalNote);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Update timestamps
    const now = new Date().toISOString();
    const savedNote: CharacterNote = {
      ...finalNote,
      updatedAt: now,
      createdAt: finalNote.createdAt || now,
    };

    onSave(savedNote);
    
    if (!isAutoSave) {
      setHasUnsavedChanges(false);
    }
  }, [note, onSave]);

  const handleAddTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !note.tags?.includes(trimmedTag)) {
      updateNote({
        tags: [...(note.tags || []), trimmedTag],
      });
    }
    setTagInput('');
    setShowTagSuggestions(false);
  }, [note.tags, updateNote]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    updateNote({
      tags: note.tags?.filter(tag => tag !== tagToRemove) || [],
    });
  }, [note.tags, updateNote]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === 'Escape') {
      setTagInput('');
      setShowTagSuggestions(false);
    }
  }, [tagInput, handleAddTag]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  }, [hasUnsavedChanges, onCancel]);

  const filteredTagSuggestions = commonTags.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !note.tags?.includes(tag)
  );

  const currentCategory = categories.find(cat => cat.id === note.category);
  const subcategoryOptions = currentCategory?.subcategories || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {isCreating ? 'Create New Note' : 'Edit Note'}
              </h2>
              {hasUnsavedChanges && (
                <p className="text-sm text-muted-foreground">
                  Auto-saving changes...
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={handleCancel}
              >
                <X size={16} className="mr-1" />
                Cancel
              </Button>
              
              {!readonly && (
                <Button
                  variant="primary"
                  onClick={() => handleSave()}
                  disabled={validationErrors.length > 0}
                >
                  <Save size={16} className="mr-1" />
                  Save
                </Button>
              )}
            </div>
          </div>

          {/* Validation errors */}
          {validationErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Please fix the following errors:
              </h4>
              <ul className="list-disc list-inside text-sm text-red-700">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Note form */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Title and basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Title *
              </label>
              <input
                ref={titleInputRef}
                id="title"
                type="text"
                value={note.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                placeholder="Enter note title..."
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={readonly}
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category *
              </label>
              <select
                id="category"
                value={note.category}
                onChange={(e) => updateNote({ 
                  category: e.target.value as any,
                  subcategory: undefined // Reset subcategory when category changes
                })}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={readonly}
                required
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium mb-2">
                Subcategory
              </label>
              <select
                id="subcategory"
                value={note.subcategory || ''}
                onChange={(e) => updateNote({ subcategory: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={readonly || subcategoryOptions.length === 0}
              >
                <option value="">None</option>
                {subcategoryOptions.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Flags and settings */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={note.isFavorite || false}
                onChange={(e) => updateNote({ isFavorite: e.target.checked })}
                disabled={readonly}
                className="rounded border-border focus:ring-blue-500"
              />
              <Star size={16} className={note.isFavorite ? 'text-yellow-500 fill-current' : ''} />
              <span className="text-sm">Favorite</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={note.isPrivate}
                onChange={(e) => updateNote({ isPrivate: e.target.checked })}
                disabled={readonly}
                className="rounded border-border focus:ring-blue-500"
              />
              <Lock size={16} className={note.isPrivate ? 'text-red-500' : ''} />
              <span className="text-sm">Private</span>
            </label>

            {/* Color picker */}
            <div className="flex items-center gap-2">
              <Palette size={16} />
              <input
                type="color"
                value={note.color || '#6B7280'}
                onChange={(e) => updateNote({ color: e.target.value })}
                disabled={readonly}
                className="w-8 h-8 rounded border border-border cursor-pointer"
                title="Note color"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags
            </label>
            
            {/* Existing tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {note.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                  >
                    <Tag size={12} />
                    {tag}
                    {!readonly && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            {/* Add tag input */}
            {!readonly && (
              <div className="relative">
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagSuggestions(e.target.value.length > 0);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowTagSuggestions(tagInput.length > 0)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
                  placeholder="Add a tag..."
                  className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />

                {/* Tag suggestions */}
                {showTagSuggestions && filteredTagSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                    {filteredTagSuggestions.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Tag size={12} />
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content editor */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Content *
            </label>
            <RichTextEditor
              value={note.content}
              onChange={handleContentChange}
              placeholder="Start writing your note..."
              readonly={readonly}
              maxLength={50000}
              showWordCount
              enableTables
              enableTaskLists
              minHeight={300}
              className="border-border"
            />
          </div>

          {/* Metadata display */}
          {note.metadata && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
              {note.metadata.wordCount && (
                <span>{note.metadata.wordCount} words</span>
              )}
              {note.metadata.characterCount && (
                <span>{note.metadata.characterCount} characters</span>
              )}
              {note.metadata.readTimeMinutes && (
                <span>{note.metadata.readTimeMinutes} min read</span>
              )}
              {note.createdAt && (
                <span>Created {new Date(note.createdAt).toLocaleDateString()}</span>
              )}
              {note.updatedAt && note.updatedAt !== note.createdAt && (
                <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NoteEditor;
# Editable Fields System for Traveller RPG Character Sheet

This document describes the comprehensive editable fields system implemented for the Traveller RPG character sheet, providing real-time validation, auto-save functionality, conflict resolution, and accessibility compliance.

## Overview

The editable fields system consists of several interconnected components that work together to provide a seamless editing experience:

- **Validation Schemas** (Zod-based) for type-safe data validation
- **Reusable Editable Components** with real-time validation feedback
- **Form State Management** with debounced database updates
- **Error Handling & User Feedback** systems
- **Undo/Redo Functionality** for change management
- **Conflict Resolution** for concurrent editing
- **Accessibility Compliance** for inclusive user experience

## Architecture

### 1. Validation Layer (`/validation/schemas.ts`)

Comprehensive Zod validation schemas for all character data types:

```typescript
// Character basics validation
const characterBasicsSchema = z.object({
  name: z.string().trim().min(1).max(100),
  age: z.number().int().min(18).max(120),
  gender: z.string().trim().min(1).max(50),
  species: z.string().trim().min(1).max(50),
});

// Characteristics validation (2-15 typical range)
const characteristicValueSchema = z.number().int().min(1).max(18);
```

**Features:**
- Type-safe validation with TypeScript inference
- Descriptive error messages
- Range validation for numbers
- String length and pattern validation
- Nested object validation
- Array validation with size limits

### 2. Editable Field Components (`/components/EditableFields/`)

#### EditableText
Real-time validated text input with debounced auto-save:

```typescript
<EditableText
  value={character.name}
  onChange={(value) => handleFieldUpdate('name', value)}
  onValidation={(isValid, errors) => handleValidation('name', isValid, errors)}
  validation={characterBasicsSchema.shape.name}
  placeholder="Character name"
  readonly={readonly}
  required
  maxLength={100}
/>
```

#### EditableNumber
Number input with steppers, formatting, and validation:

```typescript
<EditableNumber
  value={character.age}
  onChange={(value) => handleFieldUpdate('age', value)}
  validation={characterBasicsSchema.shape.age}
  min={18}
  max={120}
  showSteppers
  currency={false} // or true for credit amounts
/>
```

#### EditableSelect
Dropdown with search, custom options, and validation:

```typescript
<EditableSelect
  value={selectedSkillCategory}
  onChange={(value) => handleUpdate('category', value)}
  options={skillCategoryOptions}
  validation={skillCategorySchema}
  searchable
  allowCustom
/>
```

#### EditableTextarea
Multi-line text with auto-resize and word count:

```typescript
<EditableTextarea
  value={note.content}
  onChange={(value) => handleUpdate('content', value)}
  validation={noteSchema.shape.content}
  autoResize
  showWordCount
  maxLength={10000}
/>
```

**Common Features:**
- Real-time validation with visual feedback
- Debounced auto-save (configurable timing)
- Accessibility compliant (ARIA labels, screen reader support)
- Error state management
- Keyboard shortcuts (Enter to save, Esc to cancel)
- Loading and validation states
- Undo/redo integration

### 3. Form State Management (`/hooks/useCharacterForm.ts`)

Centralized form state management with optimistic updates:

```typescript
const {
  formState,
  updateField,
  validateForm,
  saveForm,
  getFieldError,
  canSave
} = useCharacterForm(character, {
  autoSave: true,
  debounceMs: 500,
  enableOptimisticUpdates: true,
  onSaveSuccess: (savedCharacter) => { /* handle success */ },
  onSaveError: (error) => { /* handle error */ },
  onConflict: (localData, serverData) => { /* handle conflict */ },
});
```

**Features:**
- Optimistic updates for immediate UI feedback
- Conflict detection and resolution
- Batch validation
- Field-level error tracking
- Auto-save with debouncing
- Save state management

### 4. Storage Integration (`/hooks/useCharacterStorage.ts`)

GraphQL integration for persistent storage:

```typescript
const { 
  updateCharacter, 
  checkCharacterVersion, 
  batchUpdateCharacter 
} = useCharacterStorage();

// Update character with conflict detection
const updatedCharacter = await updateCharacter(id, characterData);
```

**Features:**
- Version-based conflict detection
- Retry logic for failed requests
- Batch updates for performance
- Error handling and recovery
- GraphQL mutation integration

### 5. Undo/Redo System (`/hooks/useUndoRedo.ts`)

Comprehensive change tracking with keyboard shortcuts:

```typescript
const {
  currentData,
  canUndo,
  canRedo,
  undo,
  redo,
  createCheckpoint
} = useUndoRedo(character, {
  maxHistorySize: 50,
  enableKeyboardShortcuts: true,
});
```

**Features:**
- Automatic checkpoints on significant changes
- Manual checkpoint creation
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- History size management
- Debounced auto-save points
- Checkpoint descriptions for UI

### 6. Error Handling (`/components/ErrorBoundary/FormErrorBoundary.tsx`)

React Error Boundary with development and production modes:

```typescript
<FormErrorBoundary
  onError={(error, errorInfo) => logError(error, errorInfo)}
  resetKeys={[characterId]}
>
  <CharacterForm />
</FormErrorBoundary>
```

**Features:**
- Graceful error recovery
- Development vs production error display
- Error reporting integration ready
- Retry mechanisms
- Context preservation

### 7. User Feedback (`/components/Feedback/`)

#### ValidationFeedback
Centralized validation error display:

```typescript
<ValidationFeedback
  errors={validationErrors}
  warnings={validationWarnings}
  showFieldNames
  onDismiss={(field) => clearFieldError(field)}
  onDismissAll={() => clearAllErrors()}
/>
```

#### SaveStatus
Real-time save status indicator:

```typescript
<SaveStatus
  isSaving={formState.isSaving}
  hasUnsavedChanges={formState.hasUnsavedChanges}
  lastSaved={formState.lastSaved}
  saveError={saveError}
  conflictDetected={showConflictResolver}
  onRetry={handleSave}
  onResolveConflict={() => setShowConflictResolver(true)}
/>
```

### 8. Conflict Resolution (`/components/ConflictResolution/ConflictResolver.tsx`)

Visual conflict resolution interface:

```typescript
<ConflictResolver
  localData={conflictData.local}
  serverData={conflictData.server}
  isOpen={showConflictResolver}
  onResolve={handleConflictResolve}
  onCancel={() => setShowConflictResolver(false)}
/>
```

**Features:**
- Side-by-side conflict comparison
- Field-level resolution choices
- Merge strategies (local, server, custom)
- Visual diff highlighting
- Bulk resolution options

### 9. Accessibility (`/hooks/useAccessibility.ts`)

Comprehensive accessibility features:

```typescript
const {
  announceToScreenReader,
  focusElement,
  createFocusTrap,
  generateDescriptionId,
  generateErrorId
} = useAccessibility({
  announceChanges: true,
  enableKeyboardNavigation: true,
  focusTrapEnabled: true,
  skipLinksEnabled: true,
});
```

**Features:**
- Screen reader announcements
- Keyboard navigation
- Focus trap for modals
- Skip links
- ARIA attribute management
- High contrast support ready

## Usage Examples

### Basic Field Implementation

```typescript
import { EditableText, EditableNumber } from '../components/EditableFields';
import { characterBasicsSchema } from '../validation/schemas';

const CharacterBasics = ({ character, onUpdate, readonly }) => {
  const [validationErrors, setValidationErrors] = useState([]);

  const handleFieldUpdate = useCallback((field, value) => {
    onUpdate({ [field]: value });
  }, [onUpdate]);

  const handleValidation = useCallback((field, isValid, errors) => {
    setValidationErrors(prev => {
      const filtered = prev.filter(error => error.field !== field);
      if (!isValid && errors.length > 0) {
        filtered.push({ field, messages: errors });
      }
      return filtered;
    });
  }, []);

  return (
    <div className="space-y-4">
      <EditableText
        label="Character Name"
        value={character.name}
        onChange={(value) => handleFieldUpdate('name', value)}
        onValidation={(isValid, errors) => handleValidation('name', isValid, errors)}
        validation={characterBasicsSchema.shape.name}
        placeholder="Enter character name"
        readonly={readonly}
        required
        maxLength={100}
      />
      
      <EditableNumber
        label="Age"
        value={character.age}
        onChange={(value) => handleFieldUpdate('age', value)}
        onValidation={(isValid, errors) => handleValidation('age', isValid, errors)}
        validation={characterBasicsSchema.shape.age}
        readonly={readonly}
        min={18}
        max={120}
        showSteppers
      />
    </div>
  );
};
```

### Form Integration

```typescript
import { useCharacterForm } from '../hooks/useCharacterForm';
import FormErrorBoundary from '../components/ErrorBoundary/FormErrorBoundary';

const CharacterSheet = ({ character }) => {
  const {
    formState,
    updateField,
    saveForm,
    canSave
  } = useCharacterForm(character, {
    autoSave: true,
    debounceMs: 500,
  });

  return (
    <FormErrorBoundary>
      <div className="character-sheet">
        {/* Form fields */}
        <CharacterBasics 
          character={formState.data}
          onUpdate={(updates) => {
            Object.entries(updates).forEach(([field, value]) => {
              updateField(field, value);
            });
          }}
        />
        
        {/* Save controls */}
        <SaveStatus
          isSaving={formState.isSaving}
          hasUnsavedChanges={formState.hasUnsavedChanges}
          lastSaved={formState.lastSaved}
        />
        
        <Button
          onClick={saveForm}
          disabled={!canSave}
          loading={formState.isSaving}
        >
          Save Character
        </Button>
      </div>
    </FormErrorBoundary>
  );
};
```

## Configuration Options

### Validation Configuration

```typescript
// Custom validation schemas
const customSkillSchema = z.object({
  name: z.string().min(1).max(50),
  level: z.number().int().min(0).max(6),
  specialty: z.string().optional(),
}).refine(data => {
  // Custom validation logic
  return data.level > 0 || !data.specialty;
}, {
  message: "Skills with specialties must have level > 0",
});
```

### Form Configuration

```typescript
const formOptions = {
  autoSave: true,              // Enable auto-save
  debounceMs: 500,            // Debounce delay
  enableOptimisticUpdates: true, // Optimistic UI updates
  maxHistorySize: 50,         // Undo/redo history size
  enableKeyboardShortcuts: true, // Keyboard navigation
};
```

### Accessibility Configuration

```typescript
const accessibilityOptions = {
  announceChanges: true,       // Screen reader announcements
  enableKeyboardNavigation: true, // Enhanced keyboard support
  focusTrapEnabled: true,      // Modal focus trapping
  skipLinksEnabled: true,      // Skip link generation
};
```

## Performance Considerations

1. **Debounced Updates**: All field updates are debounced to prevent excessive API calls
2. **Optimistic UI**: Immediate feedback while background saves occur
3. **Lazy Validation**: Validation occurs on change, blur, and submit events
4. **Memory Management**: Undo/redo history is size-limited and auto-pruned
5. **Component Optimization**: Memoized callbacks and effect dependencies

## Testing

The system includes comprehensive test coverage for:

- Validation schema edge cases
- Component interaction flows
- Error handling scenarios
- Accessibility compliance
- Conflict resolution workflows
- Performance under load

## Browser Support

- Modern browsers with ES2018+ support
- React 18+ with concurrent features
- TypeScript 4.5+ for type inference
- Zod 3.0+ for validation
- Apollo Client 3.0+ for GraphQL

## Security Considerations

- Input sanitization through Zod validation
- XSS prevention in text fields
- SQL injection prevention through GraphQL
- Rate limiting on auto-save requests
- Error message sanitization

## Future Enhancements

- Real-time collaborative editing
- Offline support with sync
- Advanced conflict resolution strategies
- Performance monitoring integration
- Extended accessibility features
- Mobile-specific optimizations

This system provides a robust, accessible, and user-friendly editing experience for the Traveller RPG character sheet while maintaining data integrity and performance.
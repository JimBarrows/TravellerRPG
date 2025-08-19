# Traveller RPG Character Sheet - Characteristics Implementation

## Overview

This implementation provides a comprehensive characteristics display system for Traveller RPG character sheets, following official game rules and providing an intuitive user interface.

## Features Implemented

### 1. Core Characteristics Display (`CharacteristicsDisplay.tsx`)

**Features:**
- **Six Primary Characteristics**: STR, DEX, END, INT, EDU, SOC
- **Traveller RPG Compliant Modifiers**: Uses the official formula `DM = floor((characteristic - 6) / 3)`
- **Visual Color Coding**: Different colors for characteristic ranges (dead, unconscious, poor, average, good, excellent, superhuman)
- **Interactive Editing**: Integration with the editable fields system for real-time updates
- **UPP Display**: Universal Personality Profile in hexadecimal format with click-to-copy functionality
- **Accessibility**: Full ARIA labels, keyboard navigation, and screen reader support
- **Responsive Design**: Works on mobile and desktop devices

**Visual Indicators:**
- Progress bars showing characteristic relative to maximum (15+)
- Superhuman indicator (★) for characteristics ≥ 15
- Color-coded values based on characteristic ranges
- Modifier display with appropriate positive/negative formatting

### 2. Advanced Characteristics Management (`CharacteristicsAdvanced.tsx`)

**Features:**
- **Modifier Tracking**: Track temporary and permanent modifiers from equipment, conditions, aging, etc.
- **Aging Effects**: Traveller-compliant aging system with checks every 4 years starting at age 34
- **Characteristic Improvement**: Experience point-based improvement system with age restrictions
- **Tabbed Interface**: Organized display of modifiers, aging effects, and improvement options

### 3. UPP Component (`UPPDisplay.tsx`)

**Features:**
- **Hexadecimal Formatting**: Converts characteristics 10-15+ to A-F format
- **Copy Functionality**: Click to copy UPP to clipboard
- **Breakdown Tooltip**: Shows individual characteristic mappings
- **Color Coding**: Special highlighting for superhuman values and critical states

## Traveller RPG Rules Compliance

### Characteristic Modifiers

The implementation follows the official Traveller RPG formula:

```
DM = floor((characteristic - 6) / 3)
```

**Examples:**
- Characteristic 0: DM -3 (Dead)
- Characteristic 1: DM -2 (Unconscious)
- Characteristic 2-5: DM -1 (Poor)
- Characteristic 6-8: DM +0 (Average)
- Characteristic 9-11: DM +1 (Good)
- Characteristic 12-14: DM +2 (Excellent)
- Characteristic 15+: DM +3 (Superhuman)

### UPP (Universal Personality Profile)

Converts characteristics to hexadecimal format:
- 0-9: Displayed as numbers
- 10: A
- 11: B
- 12: C
- 13: D
- 14: E
- 15: F
- 16+: G, H, I, etc.

**Example:** STR 8, DEX 12, END 7, INT 13, EDU 11, SOC 9 → UPP: `8C7DB9`

### Aging System

**Rules:**
- First aging check at age 34
- Subsequent checks every 4 years (38, 42, 46, etc.)
- Affects physical characteristics: STR, DEX, END
- Risk increases with age: Low (34-49), Moderate (50-65), High (66+)

### Characteristic Improvement

**Rules:**
- Cost: Current characteristic value × 5 XP
- Physical characteristics (STR, DEX, END) harder to improve after age 50
- All characteristics difficult to improve after age 70
- Maximum practical limit at 15 (superhuman threshold)

## Component Architecture

### Type Definitions

```typescript
// Enhanced characteristics with tracking
interface CharacteristicsExtended extends CharacterCharacteristics {
  original: CharacterCharacteristics;
  modifiers: Record<keyof CharacterCharacteristics, CharacteristicModifier[]>;
  history: Record<keyof CharacterCharacteristics, CharacteristicHistory>;
  agingTable?: AgingTable;
}

// Individual modifier tracking
interface CharacteristicModifier {
  id: string;
  source: 'equipment' | 'condition' | 'aging' | 'training' | 'augmentation' | 'temporary';
  type: 'damage' | 'enhancement' | 'drain';
  value: number;
  duration?: 'permanent' | 'temporary' | 'until_removed';
  expiresAt?: string;
  description: string;
  appliedAt: string;
}
```

### Utility Functions

Key utility functions for calculations:

- `getCharacteristicModifier(value: number): number` - Calculates DM using Traveller rules
- `toUPP(characteristics: CharacterCharacteristics): string` - Converts to hexadecimal UPP
- `getCharacteristicColorClass(value: number): string` - Returns appropriate CSS color class
- `calculateEffectiveCharacteristic(baseValue: number, modifiers: CharacteristicModifier[]): number` - Applies all active modifiers
- `canImproveCharacteristic(characteristic: keyof CharacterCharacteristics, currentValue: number, age: number)` - Checks improvement eligibility

## Integration Points

### Editable Fields System

The characteristics display integrates with the existing editable fields system:

```typescript
<EditableNumber
  value={value}
  onChange={(newValue) => handleCharacteristicUpdate(name, newValue)}
  onValidation={(isValid, errors) => handleValidation(`characteristics.${name}`, isValid, errors)}
  validation={characteristicValueSchema}
  min={0}
  max={25}
  showSteppers
  className="w-20 mx-auto text-center"
/>
```

### Character Sheet Integration

Used in `CharacterBasics.tsx`:

```typescript
<CharacteristicsDisplay
  character={character}
  onUpdate={onUpdate}
  readonly={readonly}
  showAdvancedFeatures={true}
  allowCharacteristicEditing={true}
/>
```

## Accessibility Features

### ARIA Labels
- Each characteristic card has descriptive `aria-label`
- Keyboard navigation support with `tabIndex` and `onKeyDown`
- Screen reader announcements for value changes

### Visual Design
- High contrast colors for different characteristic ranges
- Clear visual hierarchy with proper typography
- Responsive design for mobile accessibility
- Focus indicators for keyboard navigation

### Interaction Patterns
- Click-to-copy UPP with visual feedback
- Hover tooltips for additional information
- Progress bars with proper ARIA attributes
- Button states clearly indicated

## Testing

A comprehensive test suite validates:

1. **Traveller RPG Rules Compliance**
   - Modifier calculations match official formulas
   - UPP formatting follows game standards
   - Range descriptions are accurate

2. **User Interaction**
   - Edit mode functionality
   - Characteristic selection and details
   - Copy-to-clipboard features

3. **Accessibility**
   - ARIA labels and descriptions
   - Keyboard navigation
   - Screen reader compatibility

## Usage Examples

### Basic Display

```tsx
import { CharacteristicsDisplay } from '@/features/character/components';

<CharacteristicsDisplay
  character={character}
  onUpdate={handleUpdate}
  readonly={false}
/>
```

### Advanced Features

```tsx
<CharacteristicsDisplay
  character={character}
  onUpdate={handleUpdate}
  readonly={false}
  showAdvancedFeatures={true}
  allowCharacteristicEditing={true}
/>
```

### UPP Only

```tsx
import { UPPDisplay } from '@/features/character/components';

<UPPDisplay
  characteristics={character.characteristics}
  showBreakdown={true}
  size="lg"
/>
```

## Future Enhancements

Potential areas for expansion:

1. **Augmentation System**: Cybernetic and genetic enhancements
2. **Psionics Integration**: Psionic strength characteristic and abilities
3. **Species Variants**: Different characteristic ranges for alien species
4. **Advanced Aging**: Genetic therapy and life extension effects
5. **Automation**: Automatic aging checks and experience allocation
6. **History Tracking**: Detailed logs of all characteristic changes

## Dependencies

- React 18+ with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Zod for validation schemas
- Shared UI components (Card, Button, Input)

The implementation is fully self-contained within the character feature module and follows the established patterns of the Traveller RPG web application.
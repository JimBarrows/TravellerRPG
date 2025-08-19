# Traveller RPG Conditions and Status Effects System

## Overview

A comprehensive condition tracking system for Traveller RPG following official rules and mechanics. This system handles physical injuries, environmental hazards, diseases, fatigue, and other status effects that affect character performance.

## Features Implemented

### 1. Condition Data Structures (`/types/characterSheet.ts`)
- **TravellerConditionType**: Physical, mental, social, environmental, medical, fatigue, aging, augmentation
- **TravellerConditionSeverity**: Minor, moderate, major, critical, terminal
- **TravellerConditionDuration**: Instant, rounds, minutes, hours, days, weeks, permanent, until_treated, until_healed
- **ConditionEffect**: Detailed effects on characteristics, skills, movement, initiative, endurance, healing
- **RecoveryCondition**: Recovery methods, timeframes, requirements, costs
- **StatusCondition**: Complete condition with effects, recovery, timing, and progression

### 2. Predefined Traveller Conditions (`/data/conditions.ts`)
- **Physical**: Wounded, Bleeding, Broken Bone, Unconscious
- **Fatigue**: Fatigued, Exhausted
- **Environmental**: Irradiated, Vacuum Exposure, Extreme Cold/Heat
- **Medical**: Diseased, Poisoned, Addicted
- **Mental**: Panicked, Confused
- **Social**: Disgraced
- **Aging**: Age-related decline
- **Augmentation**: Cyberware rejection

### 3. Condition Management (`/hooks/useConditions.ts`)
- Add, update, remove conditions with validation
- Automatic effect calculation
- Recovery attempt system
- Natural healing progression
- Condition compatibility checking
- Warning generation for dangerous conditions

### 4. Condition Effects Integration (`/hooks/useCharacteristicsWithConditions.ts`)
- Automatic penalty application to characteristics
- Unconsciousness and death risk assessment
- Effective characteristic calculation
- Vitality status monitoring

### 5. Visual Components

#### Main Conditions Display (`CharacterConditions.tsx`)
- Condition overview with statistics
- Filtering by type, severity, priority
- Quick stats dashboard
- Treatment management panel
- Alert system for critical conditions

#### Individual Condition Cards (`ConditionCard.tsx`)
- Detailed condition information
- Visual severity indicators
- Recovery information
- Action buttons (edit, remove, treat)
- Priority and status indicators

#### Condition Effects Panel (`ConditionEffectsPanel.tsx`)
- Cumulative effect visualization
- Characteristic modifier breakdown
- Skill and movement penalties
- Recovery and healing effects

#### Add/Edit Condition Modal (`AddConditionModal.tsx`)
- Template-based condition creation
- Custom condition support
- Severity and duration configuration
- Compatibility validation

#### Recovery Panel (`RecoveryPanel.tsx`)
- Treatment attempt interface
- Success chance calculation
- Equipment and skill integration
- Medical care requirements

### 6. Recovery and Healing System (`/utils/healingSystem.ts`)
- Natural healing rates based on Traveller rules
- Medical treatment effectiveness
- Activity level effects on recovery
- Condition worsening mechanics
- Treatment time calculations

### 7. Enhanced Characteristics Display
- Condition effects integrated into characteristic display
- Visual indicators for critical status
- Base vs effective value comparison
- Unconsciousness and death warnings
- Color-coded severity levels

## Traveller RPG Rules Implementation

### Condition Mechanics
- **Severity Scaling**: Minor (-1 DM) to Terminal (-5 DM)
- **Characteristic Damage**: Direct reduction to STR, DEX, END, etc.
- **Unconsciousness**: Any physical characteristic reaches 0
- **Death**: Multiple characteristics at 0 or severe trauma

### Recovery Methods
- **Natural Healing**: 1-2 points per day with rest
- **First Aid**: Immediate treatment within 1 hour
- **Medical Care**: Daily healing bonus with Medic skill
- **Surgery**: Major treatment for serious conditions
- **Augmentation**: Advanced medical enhancement

### Environmental Effects
- **Vacuum Exposure**: Immediate endurance loss
- **Radiation**: Gradual characteristic reduction
- **Extreme Temperatures**: Movement and dexterity penalties
- **Atmosphere**: Breathing and endurance effects

## Usage Examples

### Adding a Condition
```typescript
// Add wounded condition with moderate severity
const woundedCondition = addCondition('WOUNDED', {
  severity: 'moderate',
  durationValue: 7,
  notes: 'Laser rifle wound to chest',
  source: 'Combat encounter'
});
```

### Recovery Attempt
```typescript
// Attempt medical treatment
const result = attemptRecovery(conditionId, medicSkillLevel, equipmentBonus);
if (result.success) {
  // Condition improved or removed
}
```

### Checking Condition Effects
```typescript
// Get effective characteristics with condition modifiers
const { effectiveCharacteristics, getCharacteristicStatus } = 
  useCharacteristicsWithConditions(baseCharacteristics, conditions);

const enduranceStatus = getCharacteristicStatus('endurance');
if (enduranceStatus.status === 'critical') {
  // Show warning about unconsciousness risk
}
```

## Integration Points

### Character Sheet Integration
- Conditions are part of `CharacterSheetData.conditions`
- Automatic integration with characteristics display
- Real-time penalty calculation and application

### Equipment Integration
- Medical equipment affects treatment success
- Equipment condition affects healing rates
- Automatic equipment requirement checking

### Skills Integration
- Medic skill affects treatment success
- Endurance affects natural healing rates
- Athletic skills may affect condition resistance

## File Structure

```
src/features/character/
├── types/characterSheet.ts              # Core condition types
├── data/conditions.ts                   # Predefined condition templates
├── hooks/
│   ├── useConditions.ts                # Main condition management
│   └── useCharacteristicsWithConditions.ts # Effects integration
├── utils/
│   ├── conditionUtils.ts               # Helper functions
│   └── healingSystem.ts                # Recovery mechanics
└── components/CharacterSheet/sections/
    ├── CharacterConditions.tsx         # Main conditions interface
    ├── CharacteristicsDisplay.tsx      # Enhanced with condition effects
    └── components/
        ├── ConditionCard.tsx           # Individual condition display
        ├── ConditionEffectsPanel.tsx   # Effects visualization
        ├── ConditionAlertsPanel.tsx    # Warning system
        ├── AddConditionModal.tsx       # Add/edit interface
        └── RecoveryPanel.tsx           # Treatment interface
```

## Production Quality Features

- **Type Safety**: Full TypeScript implementation
- **Validation**: Comprehensive condition validation
- **Error Handling**: Robust error boundaries and validation
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Memoized calculations and optimized renders
- **Testing Ready**: Modular structure for unit and integration tests
- **Documentation**: Extensive inline documentation and examples

This implementation provides a complete, production-ready condition system that faithfully implements Traveller RPG rules while providing an excellent user experience.
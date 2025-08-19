# Financial Tracking System

This directory contains the comprehensive financial tracking system for Traveller RPG character sheets, implementing Task #8.6.

## Components

### 1. Enhanced CharacterFinances (Main Component)
- **Location**: `../CharacterFinances.tsx`
- **Purpose**: Main financial dashboard with tabbed interface
- **Features**:
  - Financial overview with editable account balances
  - Net worth calculation
  - Monthly cash flow tracking
  - Quick action buttons
  - Tab navigation to specialized components

### 2. TransactionHistory
- **Purpose**: Complete transaction management system
- **Features**:
  - Sortable and filterable transaction list
  - Search functionality
  - Pagination for large transaction lists
  - Category-based organization
  - Period summaries (30/90/365 days)
  - Export functionality

### 3. RecurringPayments
- **Purpose**: Automated payment tracking based on Traveller RPG rules
- **Features**:
  - Living expenses calculator based on Social Standing
  - Ship mortgage calculations (1/240th of ship value)
  - Custom recurring income/expenses
  - Payment scheduling and processing
  - World type modifiers for living costs
  - Luxury level adjustments

### 4. FinancialAnalytics
- **Purpose**: Advanced financial analysis and reporting
- **Features**:
  - Financial health metrics (liquidity ratio, debt ratio)
  - Monthly spending trends
  - Category breakdown analysis
  - Wealth percentile calculations based on Social Standing
  - Financial recommendations
  - Spending velocity analysis

### 5. AssetTracker
- **Purpose**: Comprehensive asset portfolio management
- **Features**:
  - Asset categorization (property, investments, vehicles, ships)
  - Portfolio breakdown and diversification analysis
  - Asset appreciation/depreciation tracking
  - Maintenance cost tracking
  - Insurance value management
  - Portfolio performance metrics

### 6. CurrencyConverter
- **Purpose**: Multi-currency support across known space
- **Features**:
  - Exchange rate calculator for major currencies
  - World type modifiers affecting exchange rates
  - Banking spread calculations
  - Purchasing power analysis
  - Market trend simulation
  - Currency reference tables

## Traveller RPG Integration

### Living Expenses by Social Standing
- Calculated automatically based on character's Social Standing
- Adjustable for world type and luxury level
- Follows official Traveller RPG guidelines

### Ship Finances
- Automatic ship mortgage calculation (40-year standard)
- Ship maintenance costs
- Integration with equipment system

### Currency Systems
Supports major currency systems:
- **Imperial Credits (IMP)**: Universal standard
- **Solomani Credits (SOL)**: Solomani Confederation
- **Zhodani Credits (ZHO)**: Zhodani Consulate
- **Aslan Tokens (ASL)**: Aslan Hierate
- **Vargr Packs (VAR)**: Vargr Extents
- **Hiver Credits (HIV)**: Hiver Federation
- **Local currencies**: World-specific systems

### Financial Health Metrics
- **Net Worth**: Total assets minus debts
- **Liquidity Ratio**: Months of expenses covered by liquid assets
- **Debt-to-Asset Ratio**: Debt burden relative to assets
- **Spending Velocity**: Days until bankruptcy at current rate

## Data Integration

### Character Sheet Integration
- Seamlessly integrates with existing character data
- Updates net worth in character overview
- Links to equipment for ship/vehicle valuations
- Uses Social Standing for living expense calculations

### Validation
- Full Zod schema validation for all financial data
- Error handling and user feedback
- Data consistency checks
- Transaction balance validation

### Editable Fields
- Leverages existing EditableNumber, EditableText, EditableSelect components
- Consistent validation and error handling
- Auto-save functionality with debouncing
- Optimistic updates for better UX

## Usage Examples

### Basic Setup
```typescript
import CharacterFinances from './sections/CharacterFinances';

// In character sheet component
<CharacterFinances
  character={character}
  onUpdate={handleCharacterUpdate}
  readonly={false}
/>
```

### Transaction Management
```typescript
// Add income transaction
const transaction = {
  type: 'income',
  amount: 5000,
  description: 'Trading profit',
  category: 'trading',
  date: new Date().toISOString(),
};
```

### Asset Tracking
```typescript
// Add ship asset
const shipAsset = {
  name: 'Free Trader "Stardust"',
  type: 'ship',
  value: 37000000,
  description: 'Type A2 Far Trader',
  appreciationRate: -3.5, // 3.5% annual depreciation
};
```

## Future Enhancements

1. **Investment Tracking**
   - Stock portfolios
   - Trade venture investments
   - Speculation results

2. **Business Management**
   - Business ownership tracking
   - Revenue/profit calculations
   - Employee management

3. **Insurance Systems**
   - Policy tracking
   - Claim management
   - Premium calculations

4. **Banking Integration**
   - Multiple bank accounts
   - Credit lines and loans
   - Interest calculations

5. **Trade Calculations**
   - Cargo profit/loss tracking
   - Route optimization
   - Market analysis tools

## Testing

The financial system includes comprehensive validation and error handling. Key test scenarios:

1. **Transaction Validation**
   - Invalid amounts
   - Missing required fields
   - Date validation

2. **Currency Conversion**
   - Exchange rate calculations
   - Spread application
   - World modifier effects

3. **Asset Management**
   - Appreciation/depreciation calculations
   - Portfolio diversification
   - Maintenance cost tracking

4. **Financial Health**
   - Net worth calculations
   - Ratio computations
   - Recommendation logic

## Dependencies

- React hooks for state management
- Zod for validation
- Existing editable field components
- Character sheet type definitions
- Shared UI components (Card, Button, Modal)

This implementation provides a complete financial management system that enhances the Traveller RPG experience while maintaining consistency with the existing codebase architecture.
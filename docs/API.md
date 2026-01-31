# API Reference

Complete reference for TypeScript types, Zustand stores, and utility functions.

## Table of Contents

- [Type Definitions](#type-definitions)
- [Zustand Stores](#zustand-stores)
- [Utility Functions](#utility-functions)
- [Theme API](#theme-api)
- [Component Props](#component-props)

---

## Type Definitions

All types are exported from `src/types/index.ts`.

### Debt Types

#### `DebtType`

```typescript
type DebtType = 'credit_card' | 'personal_loan' | 'other';
```

Categorizes debts for organization and display.

| Value | Description |
|-------|-------------|
| `'credit_card'` | Credit cards and revolving credit |
| `'personal_loan'` | Fixed-term installment loans |
| `'other'` | Any other debt type |

#### `Debt`

```typescript
interface Debt {
  id: string;
  name: string;
  type: DebtType;
  balance: number;
  interestRate: number;
  minimumPayment: number;
  createdAt: string;
}
```

Represents a single debt entry.

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier (generated) |
| `name` | `string` | User-defined name |
| `type` | `DebtType` | Category of debt |
| `balance` | `number` | Current balance in dollars |
| `interestRate` | `number` | Annual percentage rate (APR) |
| `minimumPayment` | `number` | Required monthly minimum |
| `createdAt` | `string` | ISO 8601 timestamp |

### Payoff Types

#### `PayoffMethod`

```typescript
type PayoffMethod = 'snowball' | 'avalanche' | 'custom';
```

Available debt payoff strategies.

| Value | Description |
|-------|-------------|
| `'snowball'` | Pay smallest balance first |
| `'avalanche'` | Pay highest interest first |
| `'custom'` | User-defined order |

#### `PayoffPlan`

```typescript
interface PayoffPlan {
  method: PayoffMethod;
  monthlyPayment: number;
  debts: Debt[];
  customOrder?: string[];
}
```

Input parameters for payoff calculation.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `method` | `PayoffMethod` | Yes | Selected strategy |
| `monthlyPayment` | `number` | Yes | Total monthly budget |
| `debts` | `Debt[]` | Yes | Debts to include |
| `customOrder` | `string[]` | No | Debt IDs in priority order |

#### `PayoffStep`

```typescript
interface PayoffStep {
  debtId: string;
  debtName: string;
  month: number;
  payment: number;
  remainingBalance: number;
  interestPaid: number;
}
```

Single payment action in a month.

| Property | Type | Description |
|----------|------|-------------|
| `debtId` | `string` | ID of the debt |
| `debtName` | `string` | Name of the debt |
| `month` | `number` | Month number (1-indexed) |
| `payment` | `number` | Payment amount |
| `remainingBalance` | `number` | Balance after payment |
| `interestPaid` | `number` | Interest accrued this month |

#### `PayoffSchedule`

```typescript
interface PayoffSchedule {
  steps: PayoffStep[][];
  totalMonths: number;
  totalInterest: number;
  totalPayments: number;
}
```

Complete payoff calculation result.

| Property | Type | Description |
|----------|------|-------------|
| `steps` | `PayoffStep[][]` | Steps grouped by month |
| `totalMonths` | `number` | Months until debt-free |
| `totalInterest` | `number` | Total interest paid |
| `totalPayments` | `number` | Total of all payments |

---

## Zustand Stores

### useDebtStore

Located in `src/store/useDebtStore.ts`.

#### State

```typescript
interface DebtState {
  debts: Debt[];
  isLoading: boolean;
}
```

#### Actions

```typescript
interface DebtActions {
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  updateDebt: (id: string, debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  deleteDebt: (id: string) => void;
  getDebtById: (id: string) => Debt | undefined;
}
```

#### Selector Hooks

```typescript
// Get debts array (re-renders only when debts change)
const debts = useDebts();

// Get action functions (stable reference)
const { addDebt, updateDebt, deleteDebt } = useDebtActions();
```

#### Usage Example

```typescript
import { useDebts, useDebtActions } from '@/store/useDebtStore';

function MyComponent() {
  const debts = useDebts();
  const { addDebt, deleteDebt } = useDebtActions();

  const handleAdd = () => {
    addDebt({
      name: 'New Credit Card',
      type: 'credit_card',
      balance: 5000,
      interestRate: 19.99,
      minimumPayment: 150,
    });
  };

  return (
    <View>
      {debts.map(debt => (
        <Text key={debt.id}>{debt.name}: ${debt.balance}</Text>
      ))}
      <Button onPress={handleAdd}>Add Debt</Button>
    </View>
  );
}
```

### usePayoffFormStore

Located in `src/store/usePayoffFormStore.ts`.

#### State & Actions

```typescript
interface PayoffFormState {
  method: PayoffMethod;
  monthlyPayment: string;
  setMethod: (method: PayoffMethod) => void;
  setMonthlyPayment: (value: string) => void;
}
```

#### Usage Example

```typescript
import { usePayoffFormStore } from '@/store/usePayoffFormStore';

function PayoffForm() {
  const { method, monthlyPayment, setMethod, setMonthlyPayment } = usePayoffFormStore();

  return (
    <View>
      <SegmentedButtons
        value={method}
        onValueChange={setMethod}
        buttons={[
          { value: 'snowball', label: 'Snowball' },
          { value: 'avalanche', label: 'Avalanche' },
        ]}
      />
      <TextInput
        value={monthlyPayment}
        onChangeText={setMonthlyPayment}
        keyboardType="decimal-pad"
      />
    </View>
  );
}
```

### useThemeStore

Located in `src/store/useThemeStore.ts`.

#### State & Actions

```typescript
interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

type ThemeMode = 'light' | 'dark' | 'system';
```

#### Usage Example

```typescript
import { useThemeStore } from '@/store/useThemeStore';

function ThemeSelector() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  return (
    <List.Section>
      {['light', 'dark', 'system'].map((option) => (
        <List.Item
          key={option}
          title={option}
          onPress={() => setMode(option as ThemeMode)}
          right={() => mode === option ? <List.Icon icon="check" /> : null}
        />
      ))}
    </List.Section>
  );
}
```

---

## Utility Functions

### payoffCalculations.ts

Located in `src/utils/payoffCalculations.ts`.

#### `calculatePayoffSchedule`

```typescript
function calculatePayoffSchedule(plan: PayoffPlan): PayoffSchedule
```

Calculates a complete debt payoff schedule.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `plan` | `PayoffPlan` | Payoff configuration |

**Returns**: `PayoffSchedule` with monthly steps and totals.

**Algorithm**:
1. Sort debts based on method (snowball/avalanche/custom)
2. For each month until all debts paid:
   - Accrue monthly interest on all balances
   - Pay minimum payments on all debts
   - Apply remaining budget to priority debt
3. Return schedule with totals

**Example**:

```typescript
import { calculatePayoffSchedule } from '@/utils/payoffCalculations';

const schedule = calculatePayoffSchedule({
  method: 'snowball',
  monthlyPayment: 500,
  debts: [
    { id: '1', name: 'Card A', balance: 2000, interestRate: 20, minimumPayment: 50 },
    { id: '2', name: 'Card B', balance: 5000, interestRate: 15, minimumPayment: 100 },
  ],
});

console.log(`Debt-free in ${schedule.totalMonths} months`);
console.log(`Total interest: $${schedule.totalInterest.toFixed(2)}`);
```

#### `getDebtSummary`

```typescript
function getDebtSummary(debts: Debt[]): {
  totalBalance: number;
  totalMinimumPayments: number;
  weightedInterestRate: number;
  count: number;
}
```

Calculates aggregate statistics for a list of debts.

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `debts` | `Debt[]` | Array of debts |

**Returns**:
| Property | Type | Description |
|----------|------|-------------|
| `totalBalance` | `number` | Sum of all balances |
| `totalMinimumPayments` | `number` | Sum of all minimums |
| `weightedInterestRate` | `number` | Balance-weighted APR |
| `count` | `number` | Number of debts |

**Example**:

```typescript
import { getDebtSummary } from '@/utils/payoffCalculations';

const summary = getDebtSummary(debts);
console.log(`Total debt: $${summary.totalBalance}`);
console.log(`Average APR: ${summary.weightedInterestRate.toFixed(2)}%`);
```

### styles.ts

Located in `src/utils/styles.ts`.

#### `getPressedOpacity`

```typescript
function getPressedOpacity(pressed: boolean, activeOpacity?: number): { opacity: number }
```

Returns opacity style for pressed state.

**Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pressed` | `boolean` | - | Whether currently pressed |
| `activeOpacity` | `number` | `0.7` | Opacity when pressed |

**Example**:

```typescript
<Pressable style={({ pressed }) => getPressedOpacity(pressed)}>
  <Text>Tap me</Text>
</Pressable>
```

#### `createPressedStyle`

```typescript
function createPressedStyle(
  additionalStyles?: Record<string, unknown>,
  activeOpacity?: number
): ({ pressed }: { pressed: boolean }) => object
```

Creates a style function for Pressable components.

**Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `additionalStyles` | `object` | `{}` | Additional styles to merge |
| `activeOpacity` | `number` | `0.7` | Opacity when pressed |

**Example**:

```typescript
<Pressable style={createPressedStyle({ padding: 8, marginRight: 8 })}>
  <Icon name="menu" />
</Pressable>
```

---

## Theme API

### Design Tokens

Located in `src/theme/tokens.ts`.

#### Spacing

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
```

#### Border Radius

```typescript
const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;
```

#### Color Palettes

```typescript
// Light theme colors
const lightColors = {
  primary: '#4E7BA5',
  onPrimary: '#ffffff',
  primaryContainer: '#D6E8F5',
  onPrimaryContainer: '#1A3A52',
  secondary: '#6B8F71',
  onSecondary: '#ffffff',
  surface: '#FAFAF9',
  onSurface: '#2D2D2A',
  surfaceVariant: '#EBE9E6',
  onSurfaceVariant: '#5C5A57',
  outline: '#8A8682',
  background: '#F5F3F0',
  onBackground: '#2D2D2A',
  error: '#B85450',
  onError: '#ffffff',
  card: '#FFFFFF',
  cardBorder: '#E5E3E0',
  header: '#E2E8ED',
  onHeader: '#1A3A52',
};

// Dark theme colors
const darkColors = {
  primary: '#d0bcff',
  onPrimary: '#381e72',
  primaryContainer: '#4f378b',
  onPrimaryContainer: '#eaddfb',
  secondary: '#ccc2dc',
  onSecondary: '#332d41',
  surface: '#1c1b1f',
  onSurface: '#e6e1e5',
  surfaceVariant: '#49454f',
  onSurfaceVariant: '#cac4d0',
  outline: '#938f99',
  background: '#1c1b1f',
  onBackground: '#e6e1e5',
  error: '#f2b8b5',
  onError: '#601410',
  card: '#2b2930',
  cardBorder: '#49454f',
  header: '#252330',
  onHeader: '#e6e1e5',
};
```

### Theme Objects

Located in `src/theme/themes.ts`.

```typescript
import { lightTheme, darkTheme } from '@/theme/themes';

// Use with PaperProvider
<PaperProvider theme={isDark ? darkTheme : lightTheme}>
  {children}
</PaperProvider>
```

### Using Theme in Components

```typescript
import { useTheme } from 'react-native-paper';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.onBackground }}>
        Themed text
      </Text>
    </View>
  );
}
```

### Custom Theme Colors

Access custom colors with type assertion:

```typescript
const headerBg = (theme.colors as { header?: string }).header ?? theme.colors.surface;
const headerFg = (theme.colors as { onHeader?: string }).onHeader ?? theme.colors.onSurface;
```

---

## Component Props

### DebtForm

Located in `src/components/DebtForm.tsx`.

```typescript
interface DebtFormProps {
  debt?: Debt;
  onSubmit: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `debt` | `Debt` | No | Existing debt for editing |
| `onSubmit` | `function` | Yes | Called with form data on submit |
| `onCancel` | `function` | Yes | Called when cancel pressed |
| `onDelete` | `function` | No | Called when delete pressed (edit mode) |

**Usage**:

```typescript
<DebtForm
  debt={editingDebt}
  onSubmit={handleSave}
  onCancel={() => setShowForm(false)}
  onDelete={editingDebt ? handleDelete : undefined}
/>
```

### ThemeProvider

Located in `src/components/ThemeProvider.tsx`.

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
}
```

Wraps the app with theme context based on `useThemeStore` mode.

**Usage**:

```typescript
// In root _layout.tsx
<ThemeProvider>
  <Stack />
</ThemeProvider>
```

---

## Migration Utilities

### `migrateDebts`

Located in `src/store/useDebtStore.ts`.

```typescript
function migrateDebts(debts: any[]): Debt[]
```

Ensures backward compatibility when loading persisted data.

**Current Migrations**:
- Adds `type: 'other'` to debts without a type field

**Example**:

```typescript
// Called automatically by persist middleware
const migratedDebts = migrateDebts(oldDebts);
// All debts now have a valid 'type' field
```

---

## Constants

### Payoff Calculation Limits

```typescript
const MAX_MONTHS = 600; // 50 years maximum payoff period
```

### Timeline Display

```typescript
const INITIAL_MONTHS_TO_SHOW = 12;
const MONTHS_TO_LOAD = 12; // Load 12 more on scroll
```

### Chart Configuration

```typescript
const CHART_WIDTH_OFFSET = 64; // Padding compensation
const CHART_HEIGHT = 220;
```

# Architecture

System design, patterns, and project structure for Debtinator.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Application Flow](#application-flow)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Component Architecture](#component-architecture)
- [Business Logic](#business-logic)
- [Theming System](#theming-system)
- [Navigation Architecture](#navigation-architecture)
- [Error Handling](#error-handling)

---

## Overview

Debtinator follows a **feature-based architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                     UI Layer                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │
│  │ Screens │ │Components│ │  Theme  │ │  Navigation │   │
│  └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘   │
│       │           │           │              │           │
├───────┴───────────┴───────────┴──────────────┴──────────┤
│                   State Layer                            │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Zustand Stores                      │    │
│  │  ┌──────────┐ ┌───────────┐ ┌─────────────┐    │    │
│  │  │DebtStore │ │PayoffStore│ │ ThemeStore  │    │    │
│  │  └──────────┘ └───────────┘ └─────────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
│                           │                              │
├───────────────────────────┴─────────────────────────────┤
│                  Business Logic                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │         Utils (payoffCalculations.ts)           │    │
│  └─────────────────────────────────────────────────┘    │
│                           │                              │
├───────────────────────────┴─────────────────────────────┤
│                  Persistence Layer                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │              MMKV Storage                        │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
debtinator/
├── src/
│   ├── app/                      # Screens (Expo Router)
│   │   ├── _layout.tsx           # Root layout with providers
│   │   ├── _layout.test.tsx      # Root layout tests
│   │   ├── (tabs)/               # Tab navigation group
│   │   │   ├── _layout.tsx       # Tab bar configuration
│   │   │   ├── _layout.test.tsx  # Tab layout tests
│   │   │   ├── index.tsx         # Redirect to debts
│   │   │   ├── index.test.tsx    
│   │   │   ├── debts.tsx         # Debt management screen
│   │   │   ├── debts.test.tsx    
│   │   │   ├── payoff.tsx        # Payoff planning screen
│   │   │   └── payoff.test.tsx   
│   │   ├── charts.tsx            # Data visualization
│   │   ├── charts.test.tsx       
│   │   ├── charts.web.test.tsx   # Web-specific tests
│   │   ├── payoff-timeline.tsx   # Month-by-month view
│   │   ├── payoff-timeline.test.tsx
│   │   ├── settings.tsx          # App settings
│   │   └── settings.test.tsx     
│   │
│   ├── components/               # Reusable UI components
│   │   ├── DebtForm.tsx          # Debt add/edit form
│   │   ├── DebtForm.test.tsx     
│   │   ├── ThemeProvider.tsx     # Theme context provider
│   │   └── ThemeProvider.test.tsx
│   │
│   ├── store/                    # Zustand state stores
│   │   ├── useDebtStore.ts       # Debt CRUD + persistence
│   │   ├── useDebtStore.test.ts  
│   │   ├── usePayoffFormStore.ts # Payoff form state
│   │   ├── usePayoffFormStore.test.ts
│   │   ├── useThemeStore.ts      # Theme preferences
│   │   └── useThemeStore.test.ts 
│   │
│   ├── theme/                    # Design system
│   │   ├── tokens.ts             # Design tokens (colors, spacing)
│   │   ├── tokens.test.ts        
│   │   ├── themes.ts             # Light/dark theme objects
│   │   └── themes.test.ts        
│   │
│   ├── types/                    # TypeScript definitions
│   │   ├── index.ts              # All type exports
│   │   └── index.test.ts         
│   │
│   ├── utils/                    # Business logic & helpers
│   │   ├── payoffCalculations.ts # Payoff algorithm
│   │   ├── payoffCalculations.test.ts
│   │   ├── styles.ts             # Style utilities
│   │   └── styles.test.ts        
│   │
│   └── __mocks__/                # Test mocks
│       └── react-native-mmkv.ts  # MMKV mock for Jest
│
├── assets/                       # Static assets
│   ├── icon.png                  # App icon
│   ├── splash.png                # Splash screen
│   ├── adaptive-icon.png         # Android adaptive icon
│   └── favicon.png               # Web favicon
│
├── e2e/                          # End-to-end tests
│   └── app.spec.ts               # Playwright tests
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md           # This file
│   ├── FEATURES.md               
│   ├── TECHNOLOGY.md             
│   ├── DEVELOPMENT.md            
│   └── API.md                    
│
├── app.json                      # Expo configuration
├── babel.config.js               # Babel configuration
├── metro.config.js               # Metro bundler config
├── tsconfig.json                 # TypeScript config
├── jest.setup.js                 # Jest setup
├── playwright.config.ts          # Playwright config
├── eas.json                      # EAS Build config
└── package.json                  # Dependencies & scripts
```

### Directory Responsibilities

| Directory | Responsibility |
|-----------|----------------|
| `src/app/` | Screen components and routing |
| `src/components/` | Reusable UI components |
| `src/store/` | Global state management |
| `src/theme/` | Design tokens and theme configuration |
| `src/types/` | TypeScript type definitions |
| `src/utils/` | Business logic and helper functions |
| `src/__mocks__/` | Test mocks for native modules |

---

## Application Flow

### Startup Sequence

```
1. App Entry (expo-router/entry)
         │
         ▼
2. Root Layout (_layout.tsx)
    - Wraps app with ThemeProvider
    - Sets up SafeAreaProvider
    - Configures StatusBar
         │
         ▼
3. Tab Layout ((tabs)/_layout.tsx)
    - Configures tab bar
    - Sets up header options
    - Defines tab screens
         │
         ▼
4. Initial Screen (index.tsx)
    - Redirects to /debts
         │
         ▼
5. Debts Screen
    - Loads persisted data from MMKV
    - Renders UI
```

### User Flow: Adding a Debt

```
User taps FAB (+)
       │
       ▼
Dialog opens with DebtForm
       │
       ▼
User fills form fields
       │
       ▼
User taps "Add Debt"
       │
       ▼
DebtForm calls onSubmit(debtData)
       │
       ▼
DebtsScreen calls addDebt(debtData)
       │
       ▼
useDebtStore.addDebt():
  - Generates unique ID
  - Adds timestamp
  - Updates state
  - Persists to MMKV
       │
       ▼
React re-renders with new debt
```

### User Flow: Calculating Payoff

```
User navigates to Payoff tab
       │
       ▼
PayoffScreen reads debts from store
       │
       ▼
User selects method (Snowball/Avalanche)
       │
       ▼
User enters monthly payment
       │
       ▼
useMemo triggers calculatePayoffSchedule()
       │
       ▼
Algorithm runs:
  1. Sort debts by method
  2. For each month:
     a. Accrue interest
     b. Pay minimums on all
     c. Extra goes to priority debt
  3. Continue until all paid
       │
       ▼
Schedule returned with:
  - steps (monthly breakdown)
  - totalMonths
  - totalInterest
  - totalPayments
       │
       ▼
UI renders summary
```

---

## State Management

### Store Architecture

```
┌─────────────────────────────────────────────┐
│              useDebtStore                    │
│  ┌─────────────────────────────────────┐   │
│  │ State:                               │   │
│  │   - debts: Debt[]                   │   │
│  │   - isLoading: boolean              │   │
│  ├─────────────────────────────────────┤   │
│  │ Actions:                             │   │
│  │   - addDebt()                        │   │
│  │   - updateDebt()                     │   │
│  │   - deleteDebt()                     │   │
│  │   - getDebtById()                    │   │
│  ├─────────────────────────────────────┤   │
│  │ Middleware:                          │   │
│  │   - persist (MMKV)                   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           usePayoffFormStore                 │
│  ┌─────────────────────────────────────┐   │
│  │ State:                               │   │
│  │   - method: PayoffMethod             │   │
│  │   - monthlyPayment: string           │   │
│  ├─────────────────────────────────────┤   │
│  │ Actions:                             │   │
│  │   - setMethod()                      │   │
│  │   - setMonthlyPayment()              │   │
│  └─────────────────────────────────────┘   │
│  (Not persisted - resets on app close)      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│             useThemeStore                    │
│  ┌─────────────────────────────────────┐   │
│  │ State:                               │   │
│  │   - mode: 'light' | 'dark' | 'system'│   │
│  ├─────────────────────────────────────┤   │
│  │ Actions:                             │   │
│  │   - setMode()                        │   │
│  ├─────────────────────────────────────┤   │
│  │ Middleware:                          │   │
│  │   - persist (MMKV)                   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Selector Hooks

To prevent unnecessary re-renders, stores export selector hooks:

```typescript
// ❌ Bad: Component re-renders on any store change
const { debts, addDebt } = useDebtStore();

// ✅ Good: Component only re-renders when debts change
const debts = useDebts();
const { addDebt } = useDebtActions();
```

### Data Persistence Flow

```
Store Action (e.g., addDebt)
         │
         ▼
Zustand updates state
         │
         ▼
persist middleware triggers
         │
         ▼
State serialized to JSON
         │
         ▼
MMKV.set(key, jsonString)
         │
         ▼
Data written to disk (sync)
```

---

## Data Flow

### Unidirectional Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Action    │────▶│    Store    │────▶│     UI      │
│  (User tap) │     │  (Zustand)  │     │  (React)    │
└─────────────┘     └─────────────┘     └─────────────┘
       ▲                                       │
       │                                       │
       └───────────────────────────────────────┘
                    (User interaction)
```

### Derived State

Complex calculations are derived using `useMemo`:

```typescript
// PayoffScreen.tsx
const schedule = useMemo(() => {
  if (debts.length === 0 || payment < totalMinimumPayments) {
    return null;
  }
  return calculatePayoffSchedule({ method, monthlyPayment, debts });
}, [debts, method, monthlyPayment, totalMinimumPayments]);
```

---

## Component Architecture

### Component Types

| Type | Location | Purpose |
|------|----------|---------|
| **Screens** | `src/app/` | Full-page components with routing |
| **Components** | `src/components/` | Reusable UI building blocks |
| **Providers** | `src/components/` | Context providers |

### Screen Component Pattern

```typescript
export default function ScreenName() {
  // 1. Hooks (theme, navigation, stores)
  const theme = useTheme();
  const navigation = useNavigation();
  const data = useSelector();

  // 2. Local state
  const [localState, setLocalState] = useState();

  // 3. Derived state (useMemo)
  const computedValue = useMemo(() => {}, [deps]);

  // 4. Effects (useEffect, useLayoutEffect)
  useLayoutEffect(() => {
    navigation.setOptions({ /* header config */ });
  }, [navigation]);

  // 5. Handlers
  const handleAction = () => {};

  // 6. Early returns (loading, empty states)
  if (data.length === 0) {
    return <EmptyState />;
  }

  // 7. Main render
  return (
    <View style={styles.container}>
      {/* ... */}
    </View>
  );
}

// 8. Styles
const styles = StyleSheet.create({ /* ... */ });
```

### Component Composition

```
DebtsScreen
├── Summary (inline)
├── SectionList
│   ├── SectionHeader (render function)
│   └── DebtCard (render function)
│       └── Card (React Native Paper)
├── FAB (React Native Paper)
└── Portal
    ├── Dialog (Add/Edit Form)
    │   └── DebtForm (component)
    └── Dialog (Delete Confirmation)
```

---

## Business Logic

### Payoff Calculation Algorithm

Located in `src/utils/payoffCalculations.ts`:

```
calculatePayoffSchedule(plan)
│
├── Sort debts by method
│   ├── Snowball: Sort by balance (ascending)
│   ├── Avalanche: Sort by interest rate (descending)
│   └── Custom: Use provided order
│
└── Monthly loop (while debts remain):
    │
    ├── Step 1: Accrue interest on all debts
    │   interest = balance × (APR / 12)
    │
    ├── Step 2: Pay minimums on all debts
    │   payment = min(minimumPayment, balance)
    │
    └── Step 3: Apply extra to priority debt
        extraPayment = remainingBudget
        priorityDebt.balance -= extraPayment
```

### Mathematical Formulas

**Monthly Interest Calculation**:
```
monthlyRate = APR / 100 / 12
monthlyInterest = currentBalance × monthlyRate
```

**Weighted Average APR**:
```
weightedAPR = Σ(balance × APR) / totalBalance
```

---

## Theming System

### Design Tokens

Located in `src/theme/tokens.ts`:

```typescript
// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Border radius scale
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
};

// Color palettes
export const lightColors = {
  primary: '#4E7BA5',
  secondary: '#6B8F71',
  // ...
};

export const darkColors = {
  primary: '#D0BCFF',
  secondary: '#CCC2DC',
  // ...
};
```

### Theme Provider Flow

```
App Start
    │
    ▼
ThemeProvider
    │
    ├── Read mode from useThemeStore
    │
    ├── Determine effective mode
    │   ├── 'light' → lightTheme
    │   ├── 'dark' → darkTheme
    │   └── 'system' → check device preference
    │
    └── Provide theme via PaperProvider
        │
        ▼
    Components use useTheme() hook
```

---

## Navigation Architecture

### Route Hierarchy

```
/                     → Redirects to /(tabs)/debts
/(tabs)               → Tab navigator
  ├── /debts          → Debt management (default tab)
  └── /payoff         → Payoff planning
/charts               → Stack screen (from payoff)
/payoff-timeline      → Stack screen (from payoff)
/settings             → Stack screen (from header)
```

### Navigation Configuration

**Tab Layout** (`(tabs)/_layout.tsx`):
- Tab bar icons and labels
- Screen-specific headers
- Header right actions (menu button)

**Screen Headers**:
- Dynamic header colors from theme
- Right-aligned action buttons
- Back navigation for stack screens

---

## Error Handling

### Store Migrations

When data schema changes, migrations ensure backward compatibility:

```typescript
persist(
  storeConfig,
  {
    migrate: (persistedState, version) => {
      // Add missing fields with defaults
      if (persistedState?.debts) {
        persistedState.debts = migrateDebts(persistedState.debts);
      }
      return persistedState;
    },
  }
)
```

### Calculation Safety

```typescript
// Prevent infinite loops
if (month >= 600) { // 50 years max
  break;
}

// Handle NaN
weightedInterestRate: isNaN(weightedInterestRate) ? 0 : weightedInterestRate

// Handle empty data
if (debts.length === 0 || payment < totalMinimumPayments) {
  return null;
}
```

### Platform-Specific Handling

```typescript
// Only run on native platforms
if (Platform.OS === 'web') return;

// Safe API calls with try/catch
try {
  await ScreenOrientation.lockAsync(orientation);
} catch (_) {
  // Silently fail - orientation is non-critical
}
```

---

## Testing Strategy

### Test File Co-location

Each source file has a corresponding test file:

```
Component.tsx
Component.test.tsx    ← Unit tests
Component.web.test.tsx ← Platform-specific tests (optional)
```

### Coverage Requirements

```json
{
  "coverageThreshold": {
    "global": {
      "statements": 100,
      "branches": 100,
      "functions": 100,
      "lines": 100
    }
  }
}
```

### Testing Layers

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit | Jest | Individual functions |
| Component | RNTL | React components |
| Integration | Jest | Store + components |
| E2E | Playwright | Full user flows |

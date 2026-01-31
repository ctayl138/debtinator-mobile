# Technology Stack

Detailed breakdown of all technologies, libraries, and tools used in Debtinator.

## Table of Contents

- [Core Framework](#core-framework)
- [Navigation](#navigation)
- [State Management](#state-management)
- [Data Persistence](#data-persistence)
- [UI Components](#ui-components)
- [Data Visualization](#data-visualization)
- [Development Tools](#development-tools)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)

---

## Core Framework

### React Native

**Version**: 0.76.9

React Native enables building native mobile apps using React and JavaScript/TypeScript. Debtinator uses React Native for:

- Cross-platform iOS and Android development
- Native UI components and performance
- Hot reloading during development
- Large ecosystem of libraries

**Key Features Used**:
- Functional components with hooks
- `StyleSheet` for native styling
- `Platform` API for platform-specific code
- Native scroll views and lists

### Expo

**Version**: SDK 52

Expo is a framework and platform for React Native that provides:

| Feature | Description |
|---------|-------------|
| Managed workflow | No native code configuration needed |
| OTA updates | Push updates without app store review |
| Development tools | Expo Go app, dev client |
| Native APIs | Camera, orientation, storage, etc. |

**Expo Packages Used**:

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~52.0.0 | Core Expo SDK |
| `expo-router` | ~4.0.22 | File-based navigation |
| `expo-screen-orientation` | ~8.0.4 | Screen rotation control |
| `expo-status-bar` | ~2.0.1 | Status bar management |
| `expo-constants` | ~17.0.8 | App constants and config |
| `expo-linking` | ~7.0.5 | Deep linking support |
| `expo-asset` | ~11.0.5 | Asset management |
| `expo-dev-client` | ~5.0.20 | Custom development builds |

### TypeScript

**Version**: 5.6.3

TypeScript adds static typing to JavaScript, providing:

- Compile-time error detection
- IntelliSense and autocomplete
- Self-documenting code
- Safer refactoring

**Configuration** (`tsconfig.json`):
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## Navigation

### Expo Router

**Version**: ~4.0.22

Expo Router provides file-system based routing, similar to Next.js:

**Key Features**:
- Automatic route generation from file structure
- Type-safe navigation with TypeScript
- Deep linking out of the box
- Nested layouts and groups

**Route Structure**:
```
src/app/
├── _layout.tsx          # Root layout (providers)
├── (tabs)/              # Tab group
│   ├── _layout.tsx      # Tab bar configuration
│   ├── index.tsx        # Default tab (redirects)
│   ├── debts.tsx        # Debts management
│   └── payoff.tsx       # Payoff planning
├── charts.tsx           # Stack screen
├── payoff-timeline.tsx  # Stack screen
└── settings.tsx         # Stack screen
```

**Navigation Patterns**:

```typescript
// Programmatic navigation
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/charts');

// Tab navigation - automatic from file structure
// Modal/stack navigation - using router.push()
```

### React Native Screens

**Version**: ~4.4.0

Provides native navigation primitives for better performance:
- Native screen transitions
- Reduced memory usage
- Gesture-based navigation

### React Native Gesture Handler

**Version**: ~2.20.2

Enables native touch gestures:
- Swipe gestures
- Long press detection
- Pan gestures

---

## State Management

### Zustand

**Version**: 5.0.0

Zustand is a small, fast, and scalable state management solution.

**Why Zustand?**
| Feature | Benefit |
|---------|---------|
| ~1KB bundle size | Minimal impact on app size |
| No boilerplate | Simple API without reducers/actions |
| TypeScript support | Full type inference |
| Middleware support | Persistence, devtools, etc. |
| React 18 compatible | Works with concurrent features |

**Store Pattern Used**:

```typescript
// Store definition with persistence
export const useDebtStore = create<DebtState>()(
  persist(
    (set, get) => ({
      debts: [],
      addDebt: (debt) => set((state) => ({ 
        debts: [...state.debts, debt] 
      })),
      // ... other actions
    }),
    {
      name: 'debt-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);

// Selector hooks for optimized re-renders
export const useDebts = () => useDebtStore((state) => state.debts);
```

**Stores in Debtinator**:

| Store | Purpose | Persisted |
|-------|---------|-----------|
| `useDebtStore` | Debt CRUD operations | Yes |
| `usePayoffFormStore` | Payoff form state | No |
| `useThemeStore` | Theme preferences | Yes |

---

## Data Persistence

### MMKV

**Version**: 3.2.0

MMKV (Memory Mapped Key-Value) is a high-performance storage solution developed by WeChat.

**Performance Comparison**:
| Operation | AsyncStorage | MMKV |
|-----------|--------------|------|
| Write | ~5ms | ~0.05ms |
| Read | ~3ms | ~0.02ms |
| Batch (100 items) | ~500ms | ~3ms |

**Why MMKV?**
- **30x faster** than AsyncStorage
- **Synchronous API** - no async/await needed for simple reads
- **Type-safe** - stores strings that can be parsed as needed
- **Battle-tested** - used by WeChat (1B+ users)

**Storage Adapter**:
```typescript
const storage = new MMKV({ id: 'debtinator-storage' });

const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => storage.delete(name),
};
```

---

## UI Components

### React Native Paper

**Version**: 5.12.5

Material Design 3 component library for React Native.

**Components Used**:

| Component | Usage |
|-----------|-------|
| `Button` | Actions and form submission |
| `Card` | Debt cards, info sections |
| `Dialog` | Confirmation dialogs, forms |
| `FAB` | Floating action button |
| `Text` | Typography with variants |
| `TextInput` | Form inputs with validation |
| `SegmentedButtons` | Method selection |
| `List` | Settings accordion |
| `RadioButton` | Debt type selection |
| `ActivityIndicator` | Loading states |
| `Divider` | Visual separation |
| `Portal` | Modal rendering |

**Theming**:
```typescript
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4E7BA5',
    secondary: '#6B8F71',
    // ... custom colors
  },
};
```

### Expo Vector Icons

**Version**: ~14.0.4

Icon library providing access to popular icon sets:

| Icon Set | Usage |
|----------|-------|
| MaterialCommunityIcons | Navigation, actions |
| Ionicons | Tab bar icons |

---

## Data Visualization

### React Native Chart Kit

**Version**: 6.12.0

Chart library for React Native supporting:

**Chart Types Used**:

| Chart | Purpose |
|-------|---------|
| `PieChart` | Principal vs. Interest breakdown |
| `LineChart` | Balance reduction over time |

**Configuration**:
```typescript
const chartConfig = {
  backgroundColor: theme.colors.surface,
  backgroundGradientFrom: theme.colors.surface,
  backgroundGradientTo: theme.colors.surface,
  decimalPlaces: 0,
  color: (opacity = 1) => `${primaryColor}${toHex(opacity)}`,
  labelColor: () => theme.colors.onSurfaceVariant,
};
```

### React Native SVG

**Version**: 15.8.0

SVG support required by chart kit for rendering vector graphics.

---

## Development Tools

### Babel

**Version**: @babel/core 7.25.0

JavaScript compiler with Expo preset:

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['.'],
        alias: { '@': './src' },
      }],
    ],
  };
};
```

**Path Aliasing**:
- `@/components` → `src/components`
- `@/store` → `src/store`
- `@/utils` → `src/utils`

### Metro Bundler

Metro is the JavaScript bundler for React Native.

**Custom Configuration** (`metro.config.js`):
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude test files from production bundle
config.resolver.blockList = [
  /.*\.test\.(ts|tsx)$/,
  /.*\.spec\.(ts|tsx)$/,
];

module.exports = config;
```

---

## Testing

### Jest (Unit Tests)

**Version**: 29.7.0

JavaScript testing framework configured with Expo preset.

**Configuration** (in `package.json`):
```json
{
  "jest": {
    "preset": "jest-expo",
    "testMatch": ["**/src/**/*.test.{ts,tsx}"],
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "coverageThreshold": {
      "global": {
        "statements": 100,
        "branches": 100,
        "functions": 100,
        "lines": 100
      }
    }
  }
}
```

#### Running Unit Tests

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests with coverage |
| `npm test -- --no-coverage` | Run all tests without coverage report |
| `npm test -- --watch` | Run tests in watch mode (re-runs on file changes) |
| `npm test -- --testPathPattern="settings"` | Run tests matching a pattern |
| `npm test -- --testNamePattern="renders"` | Run tests with names matching a pattern |

**Examples**:

```bash
# Run all unit tests with coverage
npm test

# Run tests without coverage (faster)
npm test -- --no-coverage

# Run only settings tests
npm test -- --testPathPattern="settings"

# Run tests for multiple files
npm test -- --testPathPattern="(settings|documentation)"

# Run a specific test file
npm test -- src/app/settings.test.tsx

# Run tests in watch mode during development
npm test -- --watch --no-coverage

# Run tests and update snapshots (if any)
npm test -- --updateSnapshot
```

**Coverage Reports**:

After running `npm test`, coverage reports are generated in the `coverage/` directory:
- `coverage/lcov-report/index.html` - Interactive HTML report
- `coverage/text-summary` - Terminal summary

### React Native Testing Library

**Version**: 12.4.3

Testing utilities for React Native components:

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';

test('adds a new debt', () => {
  render(<DebtsScreen />);
  fireEvent.press(screen.getByTestId('add-debt-fab'));
  expect(screen.getByText('Add New Debt')).toBeVisible();
});
```

### Playwright (E2E Tests)

**Version**: 1.49.0

End-to-end testing for the web version of the app.

#### Prerequisites

Before running Playwright tests:

1. **Install Playwright browsers** (first time only):
   ```bash
   npx playwright install
   ```

2. **Start the development server** in a separate terminal:
   ```bash
   npm run web
   ```

#### Running E2E Tests

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all E2E tests headlessly |
| `npm run test:e2e:ui` | Open Playwright UI for interactive testing |
| `npx playwright test --headed` | Run tests with visible browser |
| `npx playwright test --debug` | Run tests in debug mode |

**Examples**:

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Open Playwright UI for interactive test running and debugging
npm run test:e2e:ui

# Run specific test file
npx playwright test e2e/tests/debts.spec.ts

# Run tests matching a pattern
npx playwright test --grep "add debt"

# Run tests with visible browser
npx playwright test --headed

# Run tests in debug mode (step through tests)
npx playwright test --debug

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Generate HTML report after test run
npx playwright show-report
```

**Test Structure**:

```
e2e/
├── tests/
│   ├── debts.spec.ts       # Debt management tests
│   ├── navigation.spec.ts  # Navigation tests
│   ├── validation.spec.ts  # Form validation tests
│   └── charts.spec.ts      # Chart functionality tests
└── pages/
    ├── BasePage.ts         # Base page object
    ├── DebtsPage.ts        # Debts page object
    ├── PayoffPage.ts       # Payoff page object
    ├── ChartsPage.ts       # Charts page object
    └── index.ts            # Page exports
```

**Configuration** (`playwright.config.ts`):

The Playwright configuration defines:
- Base URL for tests (typically `http://localhost:8081`)
- Browser projects (Chromium, Firefox, WebKit)
- Test timeout and retry settings
- Screenshot and video capture on failure

**Writing E2E Tests**:

```typescript
// e2e/tests/example.spec.ts
import { test, expect } from '@playwright/test';
import { DebtsPage } from '../pages';

test('can add a new debt', async ({ page }) => {
  const debtsPage = new DebtsPage(page);
  await debtsPage.goto();
  await debtsPage.addDebt({
    name: 'Test Card',
    type: 'credit_card',
    balance: 1000,
    apr: 19.99,
    minPayment: 25,
  });
  await expect(page.getByText('Test Card')).toBeVisible();
});
```

### Test File Naming Convention

| Type | Pattern | Location |
|------|---------|----------|
| Unit tests | `*.test.ts` or `*.test.tsx` | Same directory as source file |
| E2E tests | `*.spec.ts` | `e2e/tests/` directory |

---

## Build & Deployment

### EAS (Expo Application Services)

EAS provides cloud build and submission services.

**Configuration** (`eas.json`):
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

**Build Commands**:
```bash
npm run build:dev   # Development client
npm run build:preview  # Internal testing
npm run build:prod  # App store submission
```

### App Configuration

**`app.json`**:
```json
{
  "expo": {
    "name": "Debtinator",
    "slug": "debtinator",
    "version": "1.0.0",
    "orientation": "default",
    "scheme": "debtinator",
    "ios": {
      "bundleIdentifier": "com.debtinator.app"
    },
    "android": {
      "package": "com.debtinator.app"
    },
    "web": {
      "bundler": "metro"
    }
  }
}
```

---

## Dependency Summary

### Production Dependencies

| Package | Version | Size Impact |
|---------|---------|-------------|
| expo | ~52.0.0 | Core SDK |
| expo-router | ~4.0.22 | Navigation |
| react | 18.3.1 | UI library |
| react-native | 0.76.9 | Native bridge |
| react-native-paper | ^5.12.5 | UI components |
| zustand | ^5.0.0 | ~1KB |
| react-native-mmkv | ^3.2.0 | Storage |
| react-native-chart-kit | ^6.12.0 | Charts |
| react-native-svg | 15.8.0 | SVG support |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| typescript | Type checking |
| jest | Unit testing |
| jest-expo | Jest preset for Expo |
| @testing-library/react-native | Component testing |
| @playwright/test | E2E testing |
| @babel/core | JavaScript compilation |

---

## Version Compatibility Matrix

| Expo SDK | React Native | React | Node.js |
|----------|--------------|-------|---------|
| 52 | 0.76.x | 18.3.x | 18+ |

Always check [Expo SDK compatibility](https://docs.expo.dev/versions/latest/) when upgrading.

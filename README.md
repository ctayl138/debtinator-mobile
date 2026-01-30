# Debtinator

A modern mobile application to manage personal debt and create payoff plans using various methods like snowball, avalanche, and custom payoff methodologies.

## Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Routing**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Storage**: MMKV (high-performance key-value storage)
- **UI Library**: React Native Paper (Material Design)
- **Language**: TypeScript

## Features

- **Debt Management**: Add, edit, and delete debts with details like balance, interest rate, and minimum payment
- **Multiple Payoff Methods**:
  - **Snowball Method**: Pay off smallest balances first for quick wins and motivation
  - **Avalanche Method**: Pay off highest interest rates first to save money on interest
  - **Custom Method**: Choose your own payoff order (coming soon)
- **Payoff Planning**: Calculate detailed payoff schedules with:
  - Total time to payoff
  - Total interest paid
  - Month-by-month breakdown
- **Persistent Storage**: All debts are saved locally using MMKV (30x faster than AsyncStorage)
- **Beautiful UI**: Modern Material Design interface

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- For iOS: Xcode (Mac only)
- For Android: Android Studio

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on your device:
   - **iOS**: Press `i` or run `npx expo run:ios`
   - **Android**: Press `a` or run `npx expo run:android`
   - **Web**: Press `w` in the terminal

### Project Structure

```
debtinator/
├── app/                       # All app code (Expo Router)
│   ├── _layout.tsx           # Root layout with providers
│   ├── (tabs)/               # Tab navigation group
│   │   ├── _layout.tsx       # Tab layout configuration
│   │   ├── index.tsx         # Debts screen (default tab)
│   │   └── payoff.tsx        # Payoff plan screen
│   ├── components/           # Reusable UI components
│   │   └── DebtForm.tsx
│   ├── store/                # Zustand stores
│   │   └── useDebtStore.ts
│   ├── types/                # TypeScript type definitions
│   │   └── index.ts
│   └── utils/                # Utility functions
│       └── payoffCalculations.ts
├── assets/                   # Images and icons
└── package.json
```

## Usage

### Adding a Debt

1. Navigate to the "Debts" tab
2. Tap the floating action button (+)
3. Fill in the debt details:
   - **Debt Name**: e.g., "Credit Card", "Car Loan"
   - **Current Balance**: The amount you currently owe
   - **Interest Rate (APR %)**: Annual percentage rate
   - **Minimum Payment**: Your required monthly minimum payment
4. Tap "Add Debt"

### Creating a Payoff Plan

1. Navigate to the "Payoff" tab
2. Select a payoff method:
   - **Snowball**: Best for motivation (pay smallest first)
   - **Avalanche**: Best for saving money (pay highest interest first)
   - **Custom**: Choose your own order
3. Enter your total monthly payment amount
4. View your calculated payoff plan

### Editing or Deleting a Debt

- **Edit**: Tap on a debt card
- **Delete**: Long-press on a debt card and confirm

## Payoff Methods Explained

### Snowball Method
Pay off debts starting with the smallest balance first. Provides psychological wins as you eliminate debts quickly.

### Avalanche Method
Pay off debts starting with the highest interest rate first. Minimizes total interest paid over time.

### Custom Method
Choose your own payoff order based on your preferences.

## Architecture

### Why Expo Router?
- File-based routing (similar to Next.js)
- Type-safe navigation
- Deep linking out of the box

### Why Zustand?
- Minimal boilerplate
- Built-in persistence middleware
- ~1KB bundle size

### Why MMKV?
- 30x faster than AsyncStorage
- Synchronous API
- Used by major apps (WeChat, Facebook)

## Future Enhancements

- [ ] Custom payoff order editor (drag and drop)
- [ ] Progress tracking with charts
- [ ] Payment reminders
- [ ] Export to PDF
- [ ] Dark mode
- [ ] Data backup and sync

## License

MIT

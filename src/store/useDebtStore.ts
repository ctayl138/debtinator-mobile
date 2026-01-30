import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { Debt, DebtType } from '../types';

// Initialize MMKV storage
const storage = new MMKV({
  id: 'debtinator-storage',
});

// Create MMKV adapter for Zustand
const mmkvStorage: StateStorage = {
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name, value) => {
    storage.set(name, value);
  },
  removeItem: (name) => {
    storage.delete(name);
  },
};

// Define store state and actions
interface DebtState {
  debts: Debt[];
  isLoading: boolean;

  // Actions
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  updateDebt: (id: string, debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  deleteDebt: (id: string) => void;
  getDebtById: (id: string) => Debt | undefined;
}

// Generate unique ID
const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substring(2);

// Migration function to ensure backward compatibility
// Exported for testing
export const migrateDebts = (debts: any[]): Debt[] => {
  return debts.map((debt) => ({
    ...debt,
    // Ensure type field exists, default to 'other' for existing debts
    type: debt.type || 'other',
  }));
};

// Create the store with persistence
export const useDebtStore = create<DebtState>()(
  persist(
    (set, get) => ({
      debts: [],
      isLoading: false,

      addDebt: (debtData) => {
        const newDebt: Debt = {
          ...debtData,
          // Ensure type is set, default to 'other' if not provided (backward compatibility)
          type: debtData.type || 'other',
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ debts: [...state.debts, newDebt] }));
      },

      updateDebt: (id, debtData) => {
        set((state) => ({
          debts: state.debts.map((debt) =>
            debt.id === id
              ? { ...debtData, type: debtData.type || debt.type || 'other', id, createdAt: debt.createdAt }
              : debt
          ),
        }));
      },

      deleteDebt: (id) => {
        set((state) => ({
          debts: state.debts.filter((debt) => debt.id !== id),
        }));
      },

      getDebtById: (id) => {
        return get().debts.find((debt) => debt.id === id);
      },
    }),
    {
      name: 'debt-storage',
      storage: createJSONStorage(() => mmkvStorage),
      migrate: (persistedState: any, version: number) => {
        // Migrate debts to ensure type field exists
        if (persistedState?.debts) {
          persistedState.debts = migrateDebts(persistedState.debts);
        }
        return persistedState as DebtState;
      },
    }
  )
);

// Selector hooks for optimized re-renders
export const useDebts = () => useDebtStore((state) => state.debts);
// useShallow ensures the returned object is referentially stable when actions haven't changed,
// fixing "getSnapshot should be cached" / infinite loop in React 18.
export const useDebtActions = () =>
  useDebtStore(
    useShallow((state) => ({
      addDebt: state.addDebt,
      updateDebt: state.updateDebt,
      deleteDebt: state.deleteDebt,
    }))
  );

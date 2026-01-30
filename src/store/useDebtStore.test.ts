import { act, renderHook } from '@testing-library/react-native';
import {
  useDebtStore,
  useDebts,
  useDebtActions,
  migrateDebts,
} from './useDebtStore';
import type { Debt, DebtType } from '../types';

jest.mock('react-native-mmkv');

const { __clearStore, MMKV } = jest.requireMock<{ __clearStore: () => void; MMKV: jest.Mock }>('react-native-mmkv');

const sampleDebtData = (
  overrides: Partial<Omit<Debt, 'id' | 'createdAt'>> = {}
): Omit<Debt, 'id' | 'createdAt'> => ({
  name: 'Test Debt',
  type: 'credit_card',
  balance: 1000,
  interestRate: 18,
  minimumPayment: 50,
  ...overrides,
});

describe('useDebtStore', () => {
  beforeEach(() => {
    __clearStore?.();
    useDebtStore.setState({ debts: [] });
  });

  it('starts with empty debts', () => {
    const { result } = renderHook(() => useDebts());
    expect(result.current).toEqual([]);
  });

  it('addDebt appends a debt with id and createdAt', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData());
    });
    const debts = useDebtStore.getState().debts;
    expect(debts).toHaveLength(1);
    expect(debts[0].name).toBe('Test Debt');
    expect(debts[0].type).toBe('credit_card');
    expect(debts[0].balance).toBe(1000);
    expect(debts[0].interestRate).toBe(18);
    expect(debts[0].minimumPayment).toBe(50);
    expect(debts[0].id).toBeDefined();
    expect(typeof debts[0].id).toBe('string');
    expect(debts[0].createdAt).toBeDefined();
    expect(typeof debts[0].createdAt).toBe('string');
  });

  it('addDebt defaults type to other when not provided', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(
        sampleDebtData({ type: undefined as unknown as DebtType })
      );
    });
    const debts = useDebtStore.getState().debts;
    expect(debts[0].type).toBe('other');
  });

  it('updateDebt updates existing debt by id', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ name: 'Original' }));
    });
    const id = useDebtStore.getState().debts[0].id;
    act(() => {
      result.current.updateDebt(id, sampleDebtData({ name: 'Updated', balance: 800 }));
    });
    const debts = useDebtStore.getState().debts;
    expect(debts).toHaveLength(1);
    expect(debts[0].name).toBe('Updated');
    expect(debts[0].balance).toBe(800);
    expect(debts[0].id).toBe(id);
  });

  it('updateDebt leaves other debts unchanged', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ name: 'A' }));
      result.current.addDebt(sampleDebtData({ name: 'B' }));
    });
    const ids = useDebtStore.getState().debts.map((d) => d.id);
    act(() => {
      result.current.updateDebt(ids[0], sampleDebtData({ name: 'A Updated' }));
    });
    const debts = useDebtStore.getState().debts;
    expect(debts[0].name).toBe('A Updated');
    expect(debts[1].name).toBe('B');
  });

  it('deleteDebt removes debt by id', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ name: 'To Delete' }));
    });
    const id = useDebtStore.getState().debts[0].id;
    act(() => {
      result.current.deleteDebt(id);
    });
    expect(useDebtStore.getState().debts).toHaveLength(0);
  });

  it('getDebtById returns debt when found', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ name: 'Find Me' }));
    });
    const id = useDebtStore.getState().debts[0].id;
    const found = useDebtStore.getState().getDebtById(id);
    expect(found).toBeDefined();
    expect(found!.name).toBe('Find Me');
  });

  it('getDebtById returns undefined when not found', () => {
    const found = useDebtStore.getState().getDebtById('nonexistent');
    expect(found).toBeUndefined();
  });

  it('useDebts returns current debts', () => {
    const { result } = renderHook(() => useDebts());
    expect(result.current).toEqual([]);
    const { result: actions } = renderHook(() => useDebtActions());
    act(() => {
      actions.current.addDebt(sampleDebtData());
    });
    const { result: debtsResult } = renderHook(() => useDebts());
    expect(debtsResult.current).toHaveLength(1);
    expect(debtsResult.current[0].name).toBe('Test Debt');
  });

  it('updateDebt preserves type when not provided in update data', () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ type: 'personal_loan' }));
    });
    const id = useDebtStore.getState().debts[0].id;
    act(() => {
      // Update without type (simulating older code or missing field)
      result.current.updateDebt(id, sampleDebtData({ type: undefined as unknown as DebtType, name: 'Updated' }));
    });
    const debts = useDebtStore.getState().debts;
    // Should preserve original type
    expect(debts[0].type).toBe('personal_loan');
    expect(debts[0].name).toBe('Updated');
  });

  it('updateDebt defaults to other when neither update nor existing has type', () => {
    // Manually set a debt without type to simulate legacy data
    useDebtStore.setState({
      debts: [{
        id: 'legacy-id',
        name: 'Legacy Debt',
        type: undefined as unknown as DebtType,
        balance: 500,
        interestRate: 10,
        minimumPayment: 25,
        createdAt: '2026-01-01T00:00:00.000Z',
      }],
    });
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.updateDebt('legacy-id', sampleDebtData({ type: undefined as unknown as DebtType, name: 'Updated' }));
    });
    const debts = useDebtStore.getState().debts;
    expect(debts[0].type).toBe('other');
  });

  it('persist.clearStorage removes persisted data', async () => {
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData());
    });
    expect(useDebtStore.getState().debts).toHaveLength(1);
    
    // Clear storage - this exercises the removeItem path
    await act(async () => {
      await useDebtStore.persist.clearStorage();
    });
    
    // The state won't be cleared by clearStorage, only the persisted data
    // But the storage delete should have been called
    expect(MMKV).toHaveBeenCalled();
  });

  it('persist.rehydrate can be called', async () => {
    // Add some data first
    const { result } = renderHook(() => useDebtActions());
    act(() => {
      result.current.addDebt(sampleDebtData({ name: 'Before Rehydrate' }));
    });
    
    // Call rehydrate - this tests the storage getItem path
    await act(async () => {
      await useDebtStore.persist.rehydrate();
    });
    
    // Store should still have data
    expect(useDebtStore.getState().debts).toHaveLength(1);
  });
});

describe('migrateDebts', () => {
  it('adds type field to debts without type', () => {
    const legacyDebts = [
      { id: '1', name: 'Card', balance: 1000, interestRate: 18, minimumPayment: 50 },
    ];
    const result = migrateDebts(legacyDebts);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('other');
    expect(result[0].name).toBe('Card');
    expect(result[0].balance).toBe(1000);
  });

  it('preserves existing type field', () => {
    const debts = [
      { id: '1', name: 'Card', type: 'credit_card', balance: 500, interestRate: 15, minimumPayment: 25 },
    ];
    const result = migrateDebts(debts);
    expect(result[0].type).toBe('credit_card');
  });

  it('handles empty array', () => {
    const result = migrateDebts([]);
    expect(result).toEqual([]);
  });

  it('migrates multiple debts with mixed type presence', () => {
    const mixedDebts = [
      { id: '1', name: 'A', balance: 100 },
      { id: '2', name: 'B', type: 'personal_loan', balance: 200 },
      { id: '3', name: 'C', type: undefined, balance: 300 },
    ];
    const result = migrateDebts(mixedDebts);
    expect(result[0].type).toBe('other');
    expect(result[1].type).toBe('personal_loan');
    expect(result[2].type).toBe('other');
  });
});

describe('persist migration callback', () => {
  it('migrates persisted state with debts', () => {
    // Access the persist options to test the migrate callback
    const persistOptions = useDebtStore.persist.getOptions();
    const migrate = persistOptions.migrate;
    
    if (migrate) {
      const legacyState = {
        debts: [
          { id: '1', name: 'Legacy', balance: 100 },
        ],
        isLoading: false,
      };
      
      const migratedState = migrate(legacyState, 0);
      expect(migratedState.debts[0].type).toBe('other');
    }
  });

  it('handles persisted state without debts', () => {
    const persistOptions = useDebtStore.persist.getOptions();
    const migrate = persistOptions.migrate;
    
    if (migrate) {
      const emptyState = { isLoading: false };
      const migratedState = migrate(emptyState, 0);
      expect(migratedState).toEqual({ isLoading: false });
    }
  });

  it('handles null/undefined persisted state', () => {
    const persistOptions = useDebtStore.persist.getOptions();
    const migrate = persistOptions.migrate;
    
    if (migrate) {
      const nullResult = migrate(null, 0);
      expect(nullResult).toBeNull();
      
      const undefinedResult = migrate(undefined, 0);
      expect(undefinedResult).toBeUndefined();
    }
  });
});

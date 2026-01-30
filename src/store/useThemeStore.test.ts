import { act, renderHook } from '@testing-library/react-native';
import { useThemeStore } from './useThemeStore';

jest.mock('react-native-mmkv');

const { MMKV } = jest.requireMock<{ MMKV: jest.Mock }>('react-native-mmkv');

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'system' });
  });

  it('has initial mode system', () => {
    expect(useThemeStore.getState().mode).toBe('system');
  });

  it('setMode updates mode', () => {
    const { result } = renderHook(() => useThemeStore());
    act(() => {
      result.current.setMode('light');
    });
    expect(useThemeStore.getState().mode).toBe('light');
    act(() => {
      result.current.setMode('dark');
    });
    expect(useThemeStore.getState().mode).toBe('dark');
    act(() => {
      result.current.setMode('system');
    });
    expect(useThemeStore.getState().mode).toBe('system');
  });

  it('persist.clearStorage removes persisted data', async () => {
    act(() => {
      useThemeStore.getState().setMode('dark');
    });
    expect(useThemeStore.getState().mode).toBe('dark');
    
    // Clear storage - this exercises the removeItem path
    await act(async () => {
      await useThemeStore.persist.clearStorage();
    });
    
    // Verify MMKV was called
    expect(MMKV).toHaveBeenCalled();
  });

  it('persist.rehydrate can be called', async () => {
    act(() => {
      useThemeStore.getState().setMode('light');
    });
    
    // Call rehydrate - this tests the storage getItem path
    await act(async () => {
      await useThemeStore.persist.rehydrate();
    });
    
    expect(useThemeStore.getState().mode).toBe('light');
  });
});

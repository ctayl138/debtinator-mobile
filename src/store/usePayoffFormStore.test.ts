import { act, renderHook } from '@testing-library/react-native';
import { usePayoffFormStore } from './usePayoffFormStore';

describe('usePayoffFormStore', () => {
  beforeEach(() => {
    usePayoffFormStore.setState({
      method: 'snowball',
      monthlyPayment: '',
    });
  });

  it('has initial method snowball and empty monthlyPayment', () => {
    const { result } = renderHook(() => usePayoffFormStore.getState());
    expect(result.current.method).toBe('snowball');
    expect(result.current.monthlyPayment).toBe('');
  });

  it('setMethod updates method', () => {
    const { result } = renderHook(() => usePayoffFormStore());
    act(() => {
      result.current.setMethod('avalanche');
    });
    expect(usePayoffFormStore.getState().method).toBe('avalanche');
    act(() => {
      result.current.setMethod('custom');
    });
    expect(usePayoffFormStore.getState().method).toBe('custom');
  });

  it('setMonthlyPayment updates monthlyPayment', () => {
    const { result } = renderHook(() => usePayoffFormStore());
    act(() => {
      result.current.setMonthlyPayment('350');
    });
    expect(usePayoffFormStore.getState().monthlyPayment).toBe('350');
    act(() => {
      result.current.setMonthlyPayment('');
    });
    expect(usePayoffFormStore.getState().monthlyPayment).toBe('');
  });
});

import { getPressedOpacity, createPressedStyle } from './styles';

describe('getPressedOpacity', () => {
  it('returns opacity 1 when not pressed', () => {
    expect(getPressedOpacity(false)).toEqual({ opacity: 1 });
  });

  it('returns opacity 0.7 when pressed (default)', () => {
    expect(getPressedOpacity(true)).toEqual({ opacity: 0.7 });
  });

  it('returns custom opacity when pressed', () => {
    expect(getPressedOpacity(true, 0.5)).toEqual({ opacity: 0.5 });
  });
});

describe('createPressedStyle', () => {
  it('returns function that applies opacity on press', () => {
    const styleFn = createPressedStyle();
    expect(styleFn({ pressed: false })).toEqual({ opacity: 1 });
    expect(styleFn({ pressed: true })).toEqual({ opacity: 0.7 });
  });

  it('merges additional styles', () => {
    const styleFn = createPressedStyle({ padding: 8, marginRight: 8 });
    expect(styleFn({ pressed: false })).toEqual({ opacity: 1, padding: 8, marginRight: 8 });
    expect(styleFn({ pressed: true })).toEqual({ opacity: 0.7, padding: 8, marginRight: 8 });
  });

  it('uses custom active opacity', () => {
    const styleFn = createPressedStyle({}, 0.5);
    expect(styleFn({ pressed: true })).toEqual({ opacity: 0.5 });
  });
});

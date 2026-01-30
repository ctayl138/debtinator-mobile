import { spacing, radius, lightColors, darkColors } from './tokens';

describe('theme/tokens', () => {
  describe('spacing', () => {
    it('has expected keys and values', () => {
      expect(spacing.xs).toBe(4);
      expect(spacing.sm).toBe(8);
      expect(spacing.md).toBe(16);
      expect(spacing.lg).toBe(24);
      expect(spacing.xl).toBe(32);
    });

    it('is defined as const (TypeScript readonly)', () => {
      // `as const` provides TypeScript-level immutability, not runtime Object.freeze
      expect(spacing).toBeDefined();
      expect(Object.keys(spacing)).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
    });
  });

  describe('radius', () => {
    it('has expected keys and values', () => {
      expect(radius.sm).toBe(4);
      expect(radius.md).toBe(8);
      expect(radius.lg).toBe(12);
      expect(radius.full).toBe(9999);
    });
  });

  describe('lightColors', () => {
    it('has required theme color keys', () => {
      expect(lightColors.primary).toBe('#4E7BA5');
      expect(lightColors.onPrimary).toBe('#ffffff');
      expect(lightColors.surface).toBe('#FAFAF9');
      expect(lightColors.onSurface).toBe('#2D2D2A');
      expect(lightColors.error).toBe('#B85450');
      expect(lightColors.header).toBe('#E2E8ED');
      expect(lightColors.onHeader).toBe('#1A3A52');
    });

    it('all values are strings', () => {
      Object.values(lightColors).forEach((v) => {
        expect(typeof v).toBe('string');
        expect((v as string).length).toBeGreaterThan(0);
      });
    });
  });

  describe('darkColors', () => {
    it('has required theme color keys', () => {
      expect(darkColors.primary).toBeDefined();
      expect(darkColors.surface).toBe('#1c1b1f');
      expect(darkColors.onSurface).toBe('#e6e1e5');
      expect(darkColors.header).toBe('#252330');
    });

    it('all values are strings', () => {
      Object.values(darkColors).forEach((v) => {
        expect(typeof v).toBe('string');
      });
    });
  });
});

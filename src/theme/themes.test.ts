import { lightTheme, darkTheme } from './themes';
import { lightColors, darkColors } from './tokens';

describe('theme/themes', () => {
  describe('lightTheme', () => {
    it('is an object with colors', () => {
      expect(lightTheme).toBeDefined();
      expect(lightTheme.colors).toBeDefined();
    });

    it('applies light token colors', () => {
      expect(lightTheme.colors.primary).toBe(lightColors.primary);
      expect(lightTheme.colors.surface).toBe(lightColors.surface);
      expect(lightTheme.colors.onSurface).toBe(lightColors.onSurface);
      expect(lightTheme.colors.error).toBe(lightColors.error);
    });

    it('has header and onHeader for custom app bar', () => {
      expect((lightTheme.colors as { header?: string }).header).toBe(lightColors.header);
      expect((lightTheme.colors as { onHeader?: string }).onHeader).toBe(lightColors.onHeader);
    });
  });

  describe('darkTheme', () => {
    it('is an object with colors', () => {
      expect(darkTheme).toBeDefined();
      expect(darkTheme.colors).toBeDefined();
    });

    it('applies dark token colors', () => {
      expect(darkTheme.colors.primary).toBe(darkColors.primary);
      expect(darkTheme.colors.surface).toBe(darkColors.surface);
      expect(darkTheme.colors.onSurface).toBe(darkColors.onSurface);
    });

    it('has header and onHeader', () => {
      expect((darkTheme.colors as { header?: string }).header).toBe(darkColors.header);
      expect((darkTheme.colors as { onHeader?: string }).onHeader).toBe(darkColors.onHeader);
    });
  });
});

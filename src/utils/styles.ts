/** Utility functions for common styles */

/**
 * Returns opacity style for Pressable components.
 * @param pressed Whether the pressable is currently pressed
 * @param activeOpacity Opacity when pressed (default 0.7)
 * @returns Style object with opacity
 */
export function getPressedOpacity(pressed: boolean, activeOpacity = 0.7) {
  return { opacity: pressed ? activeOpacity : 1 };
}

/**
 * Creates a style function for Pressable that applies opacity on press.
 * @param additionalStyles Additional styles to merge
 * @param activeOpacity Opacity when pressed (default 0.7)
 */
export function createPressedStyle(
  additionalStyles: Record<string, unknown> = {},
  activeOpacity = 0.7
) {
  return ({ pressed }: { pressed: boolean }) => ({
    ...getPressedOpacity(pressed, activeOpacity),
    ...additionalStyles,
  });
}

export const haptics = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(20),
  success: () => navigator.vibrate?.([10, 30, 10]),
  error: () => navigator.vibrate?.([50, 30, 50]),
  heavy: () => navigator.vibrate?.(40),
}

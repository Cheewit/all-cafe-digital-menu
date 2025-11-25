// © 2025 Cheewit Manketwit. All rights reserved. BaristA:i_V4.3_HAPTIC_SIG

/**
 * Triggers a light haptic feedback tap.
 * Best for general UI interactions like button presses or selections.
 */
export const triggerLightHaptic = (): void => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      // A short vibration of 50ms is a common "tap" duration
      navigator.vibrate(50);
    } catch (e) {
      // Vibration can fail on some devices or if permissions are not granted.
      console.warn("Haptic feedback (light) failed.", e);
    }
  }
};

/**
 * Triggers a more noticeable haptic feedback pattern to indicate success.
 * Best for confirming a major action, like completing an order.
 */
export const triggerSuccessHaptic = (): void => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      // A pattern of buzz-pause-buzz
      navigator.vibrate([100, 30, 100]);
    } catch (e) {
      console.warn("Haptic feedback (success) failed.", e);
    }
  }
};
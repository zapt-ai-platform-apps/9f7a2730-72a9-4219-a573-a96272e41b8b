import { eventBus } from '@/modules/core/events';
import { events } from './events';
import { initializeTheme, setTheme, addThemeChangeListener } from './internal/themeManager';

/**
 * Theme API for external modules
 */
export const api = {
  /**
   * Initialize theme based on system preference
   * @returns {boolean} - Whether dark mode is enabled
   */
  initialize() {
    const isDarkMode = initializeTheme();
    eventBus.publish(events.THEME_CHANGED, { isDarkMode });
    return isDarkMode;
  },
  
  /**
   * Set theme
   * @param {boolean} isDarkMode - Whether to enable dark mode
   */
  setTheme(isDarkMode) {
    setTheme(isDarkMode);
    eventBus.publish(events.THEME_CHANGED, { isDarkMode });
  },
  
  /**
   * Toggle theme
   * @param {boolean} currentDarkMode - Current dark mode state
   * @returns {boolean} - New dark mode state
   */
  toggleTheme(currentDarkMode) {
    const newDarkMode = !currentDarkMode;
    setTheme(newDarkMode);
    eventBus.publish(events.THEME_CHANGED, { isDarkMode: newDarkMode });
    return newDarkMode;
  },
  
  /**
   * Add theme change listener
   * @param {Function} callback - Callback to call when theme changes
   * @returns {Function} - Function to remove listener
   */
  onThemeChange(callback) {
    return addThemeChangeListener(callback);
  },
  
  /**
   * Subscribe to theme changes via event bus
   * @param {Function} callback - Callback to call when theme changes
   * @returns {Function} - Function to unsubscribe
   */
  subscribeToThemeChanges(callback) {
    return eventBus.subscribe(events.THEME_CHANGED, callback);
  }
};
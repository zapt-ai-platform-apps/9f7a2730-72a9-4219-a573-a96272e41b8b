import { getTheme, setDarkMode } from './internal/services';
import { validateTheme } from './validators';

export const api = {
  /**
   * Get current theme settings
   * @returns {Object} - The current theme settings
   */
  getTheme() {
    const theme = getTheme();
    return validateTheme(theme, {
      actionName: 'getTheme',
      direction: 'outgoing',
      location: 'theme/api.js',
      moduleFrom: 'theme',
      moduleTo: 'client'
    });
  },
  
  /**
   * Toggle dark mode
   * @returns {Object} - The updated theme settings
   */
  toggleDarkMode() {
    const theme = getTheme();
    const updatedTheme = setDarkMode(!theme.darkMode);
    
    return validateTheme(updatedTheme, {
      actionName: 'toggleDarkMode',
      direction: 'outgoing',
      location: 'theme/api.js',
      moduleFrom: 'theme',
      moduleTo: 'client'
    });
  },
  
  /**
   * Set dark mode to a specific value
   * @param {boolean} value - The new dark mode value
   * @returns {Object} - The updated theme settings
   */
  setDarkMode(value) {
    const updatedTheme = setDarkMode(Boolean(value));
    
    return validateTheme(updatedTheme, {
      actionName: 'setDarkMode',
      direction: 'outgoing',
      location: 'theme/api.js',
      moduleFrom: 'theme',
      moduleTo: 'client'
    });
  }
};
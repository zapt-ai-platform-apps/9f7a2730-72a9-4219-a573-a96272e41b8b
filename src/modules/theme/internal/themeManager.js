/**
 * Initialize theme based on system preference
 * @returns {boolean} - Whether dark mode is enabled
 */
export function initializeTheme() {
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (prefersDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  return prefersDarkMode;
}

/**
 * Set theme
 * @param {boolean} isDarkMode - Whether to enable dark mode
 */
export function setTheme(isDarkMode) {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * Add theme change listener
 * @param {Function} callback - Callback to call when theme changes
 * @returns {Function} - Function to remove listener
 */
export function addThemeChangeListener(callback) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = (e) => {
    callback(e.matches);
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
}
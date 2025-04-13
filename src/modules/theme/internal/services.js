import { eventBus } from '@/modules/core/events';
import { events } from '../events';

// Theme state
let darkMode = null;

// Initialize theme from system preference
export function initializeTheme() {
  if (darkMode === null) {
    darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme();
  }
  return { darkMode };
}

// Get current theme
export function getTheme() {
  if (darkMode === null) {
    return initializeTheme();
  }
  return { darkMode };
}

// Set dark mode
export function setDarkMode(value) {
  darkMode = Boolean(value);
  applyTheme();
  
  // Publish event
  eventBus.publish(events.THEME_CHANGED, { darkMode });
  
  return { darkMode };
}

// Apply theme to document
function applyTheme() {
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Setup theme change listener
export function setupThemeListener() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e) => {
    setDarkMode(e.matches);
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handleChange);
}
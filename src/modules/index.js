import { eventBus } from './core/events';
import { api as simulationsApi } from './simulations/api';
import { api as historyApi } from './history/api';
import { api as themeApi } from './theme/api';
import { setupThemeListener } from './theme/internal/services';

// Export modules' public APIs
export const modules = {
  simulations: simulationsApi,
  history: historyApi,
  theme: themeApi
};

// Initialize all modules
export async function initializeModules() {
  console.log("Initializing application modules...");
  
  // Get theme and set up listener
  themeApi.getTheme();
  const cleanupTheme = setupThemeListener();
  
  // Return cleanup function for module initialization
  return () => {
    cleanupTheme();
  };
}
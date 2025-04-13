import { getHistory, addToHistory, clearHistory, getOutcome, getMatchTypeLabel } from './internal/services';
import { validateHistory, validateHistoryEntry } from './validators';

export const api = {
  /**
   * Get the current simulation history
   * @returns {Array} - The current simulation history
   */
  getHistory() {
    const history = getHistory();
    return validateHistory(history, {
      actionName: 'getHistory',
      direction: 'outgoing',
      location: 'history/api.js',
      moduleFrom: 'history',
      moduleTo: 'client'
    });
  },
  
  /**
   * Add a new simulation to history
   * @param {Object} simulation - The simulation to add
   * @returns {Array} - The updated history
   */
  addToHistory(simulation) {
    // Create history entry from simulation
    const historyEntry = {
      date: simulation.date,
      teamAName: simulation.teamAName,
      teamBName: simulation.teamBName,
      matchType: getMatchTypeLabel(simulation.matchSettings.matchType, simulation.matchSettings),
      score: simulation.resultatsFT.scoreExact,
      probability: simulation.resultatsFT.scoreExactPourcentage,
      outcome: getOutcome(simulation),
      couponCount: simulation.couponParis.length,
      couponCount100: simulation.couponParis100 ? simulation.couponParis100.length : 0,
      id: Date.now().toString()
    };
    
    // Validate entry
    const validatedEntry = validateHistoryEntry(historyEntry, {
      actionName: 'addToHistory',
      direction: 'incoming',
      location: 'history/api.js',
      moduleFrom: 'client',
      moduleTo: 'history'
    });
    
    // Add to history
    const updatedHistory = addToHistory(validatedEntry);
    
    // Validate and return updated history
    return validateHistory(updatedHistory, {
      actionName: 'addToHistory',
      direction: 'outgoing',
      location: 'history/api.js',
      moduleFrom: 'history',
      moduleTo: 'client'
    });
  },
  
  /**
   * Clear the simulation history
   * @returns {Array} - The empty history array
   */
  clearHistory() {
    const emptyHistory = clearHistory();
    return validateHistory(emptyHistory, {
      actionName: 'clearHistory',
      direction: 'outgoing',
      location: 'history/api.js',
      moduleFrom: 'history',
      moduleTo: 'client'
    });
  }
};
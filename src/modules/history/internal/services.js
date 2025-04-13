import { eventBus } from '@/modules/core/events';
import { events } from '../events';

// Create a singleton for localStorage access
const historyStorage = {
  get() {
    try {
      const history = localStorage.getItem('pr_pronos_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error reading history from localStorage:', error);
      return [];
    }
  },
  
  set(history) {
    try {
      localStorage.setItem('pr_pronos_history', JSON.stringify(history));
      return history;
    } catch (error) {
      console.error('Error writing history to localStorage:', error);
      return history;
    }
  }
};

// Get current history
export function getHistory() {
  return historyStorage.get();
}

// Add a new entry to history
export function addToHistory(entry) {
  const currentHistory = getHistory();
  // Add to beginning and limit to 50 entries
  const updatedHistory = [entry, ...currentHistory.slice(0, 49)];
  historyStorage.set(updatedHistory);
  
  // Publish event
  eventBus.publish(events.HISTORY_ADDED, { entry, history: updatedHistory });
  
  return updatedHistory;
}

// Clear history
export function clearHistory() {
  const emptyHistory = [];
  historyStorage.set(emptyHistory);
  
  // Publish event
  eventBus.publish(events.HISTORY_CLEARED, {});
  
  return emptyHistory;
}

// Determine match outcome
export function getOutcome(simulation) {
  const { resultatsFT } = simulation;
  const probVictoireA = parseFloat(resultatsFT.probas.victoireA);
  const probNul = parseFloat(resultatsFT.probas.nul);
  const probVictoireB = parseFloat(resultatsFT.probas.victoireB);
  
  if (probVictoireA > probVictoireB && probVictoireA > probNul) {
    return `Victoire ${simulation.teamAName}`;
  } else if (probVictoireB > probVictoireA && probVictoireB > probNul) {
    return `Victoire ${simulation.teamBName}`;
  } else {
    return 'Match nul';
  }
}

// Get match type label
export function getMatchTypeLabel(matchType, settings) {
  switch (matchType) {
    case 'friendly': return 'Match amical';
    case 'league': return 'Championnat';
    case 'competition': 
      switch (settings.competitionType) {
        case 'championsLeague': return 'Ligue des Champions';
        case 'europaLeague': return 'Ligue Europa';
        case 'domesticCup': return 'Coupe Nationale';
        case 'worldCup': return 'Coupe du Monde';
        default: return 'Compétition';
      }
    default: return 'Match';
  }
}

// Format date
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}
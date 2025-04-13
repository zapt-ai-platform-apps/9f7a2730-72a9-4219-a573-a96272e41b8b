import { eventBus } from '@/modules/core/events';
import { events } from './events';
import { validateHistoryItem, validateTeamData } from './validators';
import {
  getSimulationHistory,
  addToSimulationHistory,
  clearSimulationHistory,
  getRecentTeams,
  getTeamScores,
  saveTeamData
} from './internal/localStorage';

/**
 * Storage API for external modules
 */
export const api = {
  /**
   * Get simulation history
   * @returns {Array} - Simulation history
   */
  getSimulationHistory() {
    return getSimulationHistory();
  },
  
  /**
   * Add item to simulation history
   * @param {Object} simulationResult - Simulation result
   * @returns {Array} - Updated history
   */
  addToSimulationHistory(simulationResult) {
    const historyItem = {
      date: simulationResult.date,
      teamAName: simulationResult.teamAName,
      teamBName: simulationResult.teamBName,
      matchType: getMatchTypeLabel(simulationResult.matchSettings.matchType, simulationResult.matchSettings),
      score: simulationResult.resultatsFT.scoreExact,
      probability: simulationResult.resultatsFT.scoreExactPourcentage,
      outcome: getOutcome(simulationResult),
      couponCount: simulationResult.couponParis.length,
      couponCount75: simulationResult.couponParis75 ? simulationResult.couponParis75.length : 0,
      id: Date.now().toString()
    };
    
    // Validate
    validateHistoryItem(
      historyItem, 
      { 
        actionName: 'addToSimulationHistory', 
        location: 'storage/api.js', 
        moduleFrom: 'client', 
        moduleTo: 'storage'
      }
    );
    
    const updatedHistory = addToSimulationHistory(historyItem);
    eventBus.publish(events.HISTORY_ADDED, { historyItem });
    
    return updatedHistory;
  },
  
  /**
   * Clear simulation history
   * @returns {Array} - Empty array
   */
  clearSimulationHistory() {
    const result = clearSimulationHistory();
    eventBus.publish(events.HISTORY_CLEARED, {});
    return result;
  },
  
  /**
   * Get recent teams
   * @returns {Array} - Recent teams
   */
  getRecentTeams() {
    return getRecentTeams();
  },
  
  /**
   * Get team scores
   * @returns {Object} - Team scores
   */
  getTeamScores() {
    return getTeamScores();
  },
  
  /**
   * Save team data
   * @param {string} teamName - Team name
   * @param {Array} scores - Team scores
   * @returns {Object} - Updated team data
   */
  saveTeamData(teamName, scores) {
    validateTeamData(
      { name: teamName, scores }, 
      { 
        actionName: 'saveTeamData', 
        location: 'storage/api.js', 
        moduleFrom: 'client', 
        moduleTo: 'storage'
      }
    );
    
    const result = saveTeamData(teamName, scores);
    eventBus.publish(events.TEAM_ADDED, { teamName, scores });
    
    return result;
  }
};

/**
 * Get outcome of a match
 * @param {Object} simulation - Simulation result
 * @returns {string} - Match outcome
 */
function getOutcome(simulation) {
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

/**
 * Get label for match type
 * @param {string} matchType - Match type
 * @param {Object} settings - Match settings
 * @returns {string} - Match type label
 */
function getMatchTypeLabel(matchType, settings) {
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
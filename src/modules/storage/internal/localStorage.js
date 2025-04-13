import * as Sentry from '@sentry/browser';

/**
 * Read value from localStorage
 * @param {string} key - Key to read
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Value from localStorage or default
 */
export function readFromLocalStorage(key, defaultValue) {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    Sentry.captureException(error);
    console.error(`Error reading from localStorage for key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Write value to localStorage
 * @param {string} key - Key to write
 * @param {any} value - Value to write
 */
export function writeToLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    Sentry.captureException(error);
    console.error(`Error writing to localStorage for key "${key}":`, error);
  }
}

/**
 * Get simulation history from localStorage
 * @returns {Array} - Simulation history
 */
export function getSimulationHistory() {
  return readFromLocalStorage('pr_pronos_history', []);
}

/**
 * Save simulation history to localStorage
 * @param {Array} history - Simulation history
 */
export function saveSimulationHistory(history) {
  writeToLocalStorage('pr_pronos_history', history);
}

/**
 * Add item to simulation history
 * @param {Object} item - History item to add
 * @returns {Array} - Updated history
 */
export function addToSimulationHistory(item) {
  const history = getSimulationHistory();
  const updatedHistory = [item, ...history.slice(0, 49)]; // Keep max 50 items
  saveSimulationHistory(updatedHistory);
  return updatedHistory;
}

/**
 * Clear simulation history
 * @returns {Array} - Empty array
 */
export function clearSimulationHistory() {
  saveSimulationHistory([]);
  return [];
}

/**
 * Get recent teams from localStorage
 * @returns {Array} - Recent teams
 */
export function getRecentTeams() {
  return readFromLocalStorage('pr_pronos_teams', []);
}

/**
 * Save recent teams to localStorage
 * @param {Array} teams - Recent teams
 */
export function saveRecentTeams(teams) {
  writeToLocalStorage('pr_pronos_teams', teams);
}

/**
 * Get team scores from localStorage
 * @returns {Object} - Team scores
 */
export function getTeamScores() {
  return readFromLocalStorage('pr_pronos_scores', {});
}

/**
 * Save team scores to localStorage
 * @param {Object} scores - Team scores
 */
export function saveTeamScores(scores) {
  writeToLocalStorage('pr_pronos_scores', scores);
}

/**
 * Save team data
 * @param {string} teamName - Team name
 * @param {Array} scores - Team scores
 * @returns {Object} - Updated team data
 */
export function saveTeamData(teamName, scores) {
  if (!teamName.trim() || scores.length === 0) return {};
  
  // Update recent teams list
  let recentTeams = getRecentTeams();
  if (!recentTeams.includes(teamName)) {
    recentTeams = [teamName, ...recentTeams.slice(0, 9)]; // Keep max 10 teams
    saveRecentTeams(recentTeams);
  }
  
  // Update team scores
  const teamScores = getTeamScores();
  teamScores[teamName] = scores;
  saveTeamScores(teamScores);
  
  return {
    recentTeams,
    teamScores
  };
}
/**
 * Calculate weighted average
 * @param {number[]} scores - Array of scores
 * @param {number} alpha - Weighting factor (higher means more recent games have higher weight)
 * @returns {number} - Weighted average
 */
export function calculerMoyennePonderee(scores, alpha = 1.3) {
  if (!scores || scores.length === 0) return 0;
  
  const n = scores.length;
  
  // Calculate total weights for normalization
  const poidsTotaux = scores.reduce((somme, _, i) => 
    somme + Math.pow(alpha, n - i - 1), 0);
  
  // If all weights are zero, return simple average
  if (poidsTotaux === 0) {
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  
  // Calculate weighted average
  const moyenne = scores.reduce((somme, score, i) => 
    somme + score * Math.pow(alpha, n - i - 1), 0) / poidsTotaux;
  
  return moyenne;
}

/**
 * Adjust scores based on match context
 * @param {number[]} scoresA - Team A scores
 * @param {number[]} scoresB - Team B scores
 * @param {Object} config - Match configuration
 * @returns {Object} - Adjusted scores and factors
 */
export function ajusterScores(scoresA, scoresB, config) {
  const { 
    matchType, isHomeTeamA, isHomeTeamB, rankA, rankB, 
    competitionType, isKnockoutStage, h2hScores 
  } = config;
  
  // Copy scores to avoid modifying originals
  let adjustedScoresA = [...scoresA];
  let adjustedScoresB = [...scoresB];
  
  // Adjustment factors
  let ajustementA = 1.0;
  let ajustementB = 1.0;
  
  // 1. Home/away adjustment
  if (isHomeTeamA) {
    ajustementA *= 1.2; // Home advantage
  } else if (isHomeTeamB) {
    ajustementB *= 1.2; // Home advantage
  }
  
  // 2. Rank adjustment (only for league matches)
  if (matchType === 'league' && rankA && rankB) {
    const diffRank = rankB - rankA;
    const facteurClassement = Math.max(0.8, Math.min(1.2, 1 + (diffRank * 0.01)));
    ajustementA *= facteurClassement;
  }
  
  // 3. Competition adjustment
  if (matchType === 'competition') {
    // Teams typically play better in competitions
    ajustementA *= 1.05;
    ajustementB *= 1.05;
    
    // Knockout stage = more intensity but fewer goals
    if (isKnockoutStage) {
      ajustementA *= 0.9;
      ajustementB *= 0.9;
    }
  }
  
  // 4. Head-to-head adjustment
  if (h2hScores && h2hScores.length > 0) {
    let goalsForA = 0;
    let goalsForB = 0;
    
    h2hScores.forEach(match => {
      goalsForA += match.scoreA;
      goalsForB += match.scoreB;
    });
    
    // If one team historically dominates the other
    if (goalsForA > goalsForB) {
      const ratio = Math.min(1.3, (goalsForA / Math.max(1, goalsForB)));
      ajustementA *= (1 + (ratio - 1) * 0.3);
    } else if (goalsForB > goalsForA) {
      const ratio = Math.min(1.3, (goalsForB / Math.max(1, goalsForA)));
      ajustementB *= (1 + (ratio - 1) * 0.3);
    }
  }
  
  return { adjustedScoresA, adjustedScoresB, ajustementA, ajustementB };
}

/**
 * Generate a random number according to Poisson distribution
 * @param {number} lambda - Average rate
 * @returns {number} - Random number
 */
export function tiragePoisson(lambda) {
  if (lambda < 0.01) return 0;
  
  let L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  
  return k - 1;
}

/**
 * Verify access code
 * @param {string} code - Access code to verify
 * @returns {boolean} - True if code is valid
 */
export function verifyAccessCode(code) {
  const validCodes = ['0170V1', 'V1BOT', 'PRPRONOS', '100%'];
  return validCodes.includes(code);
}
import { tiragePoisson, calculerMoyennePonderee, ajusterScores } from './utils';

/**
 * Run match simulation with Monte Carlo method
 * @param {Object} formData - Simulation form data
 * @param {Function} updateProgress - Function to update progress
 * @returns {Object} - Simulation results
 */
export async function runSimulation(formData, updateProgress) {
  const { 
    teamAName, teamBName, scoresA, scoresB, h2hScores, 
    isHomeTeamA, isHomeTeamB, matchType, 
    alpha, iterations, rankA, rankB, 
    competitionType, isKnockoutStage 
  } = formData;
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 300));
  updateProgress(10);
  
  // Process data and calculate adjustments
  const { adjustedScoresA, adjustedScoresB, ajustementA, ajustementB } = 
    ajusterScores(scoresA, scoresB, {
      matchType, isHomeTeamA, isHomeTeamB, rankA, rankB,
      competitionType, isKnockoutStage, h2hScores
    });
  
  updateProgress(30);
  
  // Calculate weighted averages
  const moyenneA = calculerMoyennePonderee(adjustedScoresA, alpha) * ajustementA;
  const moyenneB = calculerMoyennePonderee(adjustedScoresB, alpha) * ajustementB;
  
  updateProgress(50);
  
  // Simulate full-time match
  const resultatsFT = await simulerMatch(moyenneA, moyenneB, iterations, updateProgress, 50, 80);
  
  // Simulate half-time match (approximately half of goals)
  const resultatsHT = await simulerMatch(moyenneA/2, moyenneB/2, iterations, updateProgress, 80, 90);
  
  // Generate betting coupon with minimum 75% probability
  const couponParis = genererCouponParis(resultatsHT, resultatsFT, 70); // Legacy 70% threshold
  const couponParis75 = genererCouponParis(resultatsHT, resultatsFT, 75); // New 75% threshold
  
  updateProgress(100);
  
  // Return formatted results
  return {
    teamAName,
    teamBName,
    matchSettings: {
      matchType,
      isHomeTeamA,
      isHomeTeamB,
      rankA,
      rankB,
      competitionType,
      isKnockoutStage
    },
    resultatsHT,
    resultatsFT,
    couponParis,
    couponParis75,
    date: new Date().toISOString()
  };
}

/**
 * Simulate a match with Poisson distribution
 * @param {number} avgA - Team A average goals
 * @param {number} avgB - Team B average goals
 * @param {number} iterations - Number of Monte Carlo iterations
 * @param {Function} updateProgress - Function to update progress
 * @param {number} startProgress - Progress percentage at start
 * @param {number} endProgress - Progress percentage at end
 * @returns {Object} - Match simulation results
 */
export async function simulerMatch(avgA, avgB, iterations = 18000, updateProgress, startProgress, endProgress) {
  // Score mapping
  const scoreMap = {};
  
  // Counters for various statistics
  let btts = 0, over15 = 0, over25 = 0, over35 = 0;
  let draws = 0, winA = 0, winB = 0;
  
  // Run Monte Carlo iterations
  for (let i = 0; i < iterations; i++) {
    // Update progress every 5% of advancement
    if (i % Math.floor(iterations / 20) === 0) {
      const percent = Math.floor(startProgress + (i / iterations) * (endProgress - startProgress));
      updateProgress(percent);
      
      // Allow UI to update
      await new Promise(r => setTimeout(r, 0));
    }
    
    // Generate scores according to Poisson
    const scoreA = tiragePoisson(avgA);
    const scoreB = tiragePoisson(avgB);
    const total = scoreA + scoreB;
    
    // Create a key for this score
    const key = `${scoreA}-${scoreB}`;
    
    // Increment counter for this score
    scoreMap[key] = (scoreMap[key] || 0) + 1;
    
    // Count outcomes
    if (scoreA === scoreB) draws++;
    else if (scoreA > scoreB) winA++;
    else winB++;
    
    // Count other statistics
    if (scoreA > 0 && scoreB > 0) btts++;
    if (total > 1.5) over15++;
    if (total > 2.5) over25++;
    if (total > 3.5) over35++;
  }
  
  // Find most frequent score
  const maxKey = Object.keys(scoreMap).reduce((a, b) => 
    scoreMap[a] > scoreMap[b] ? a : b);
  
  // Calculate probabilities as percentages
  const probas = {
    btts: (btts / iterations * 100).toFixed(1),
    over15: (over15 / iterations * 100).toFixed(1),
    over25: (over25 / iterations * 100).toFixed(1),
    over35: (over35 / iterations * 100).toFixed(1),
    victoireA: (winA / iterations * 100).toFixed(1),
    victoireB: (winB / iterations * 100).toFixed(1),
    nul: (draws / iterations * 100).toFixed(1)
  };
  
  // Get top 5 most frequent scores
  const topScores = Object.entries(scoreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => ({ 
      score: k, 
      pourcentage: (v / iterations * 100).toFixed(2) 
    }));
  
  return {
    scoreExact: maxKey,
    scoreExactPourcentage: (scoreMap[maxKey] / iterations * 100).toFixed(2),
    probas,
    topScores
  };
}

/**
 * Generate reliable betting tips
 * @param {Object} resultatsHT - Half-time results
 * @param {Object} resultatsFT - Full-time results
 * @param {number} seuilProbabilite - Probability threshold
 * @returns {Array} - Betting tips
 */
export function genererCouponParis(resultatsHT, resultatsFT, seuilProbabilite = 70) {
  const coupon = [];
  
  // Check exact score
  if (parseFloat(resultatsFT.scoreExactPourcentage) > seuilProbabilite) {
    coupon.push({
      type: 'Score exact',
      pari: resultatsFT.scoreExact,
      probabilite: resultatsFT.scoreExactPourcentage
    });
  }
  
  // Check BTTS (Both Teams To Score)
  if (parseFloat(resultatsFT.probas.btts) > seuilProbabilite) {
    coupon.push({
      type: 'BTTS',
      pari: 'Oui',
      probabilite: resultatsFT.probas.btts
    });
  } else if ((100 - parseFloat(resultatsFT.probas.btts)) > seuilProbabilite) {
    coupon.push({
      type: 'BTTS',
      pari: 'Non',
      probabilite: (100 - parseFloat(resultatsFT.probas.btts)).toFixed(1)
    });
  }
  
  // Check Over/Under markets
  if (parseFloat(resultatsFT.probas.over15) > seuilProbabilite) {
    coupon.push({
      type: 'Over 1.5',
      pari: 'Oui',
      probabilite: resultatsFT.probas.over15
    });
  } else if ((100 - parseFloat(resultatsFT.probas.over15)) > seuilProbabilite) {
    coupon.push({
      type: 'Under 1.5',
      pari: 'Oui',
      probabilite: (100 - parseFloat(resultatsFT.probas.over15)).toFixed(1)
    });
  }
  
  if (parseFloat(resultatsFT.probas.over25) > seuilProbabilite) {
    coupon.push({
      type: 'Over 2.5',
      pari: 'Oui',
      probabilite: resultatsFT.probas.over25
    });
  } else if ((100 - parseFloat(resultatsFT.probas.over25)) > seuilProbabilite) {
    coupon.push({
      type: 'Under 2.5',
      pari: 'Oui',
      probabilite: (100 - parseFloat(resultatsFT.probas.over25)).toFixed(1)
    });
  }
  
  if (parseFloat(resultatsFT.probas.over35) > seuilProbabilite) {
    coupon.push({
      type: 'Over 3.5',
      pari: 'Oui',
      probabilite: resultatsFT.probas.over35
    });
  } else if ((100 - parseFloat(resultatsFT.probas.over35)) > seuilProbabilite) {
    coupon.push({
      type: 'Under 3.5',
      pari: 'Oui',
      probabilite: (100 - parseFloat(resultatsFT.probas.over35)).toFixed(1)
    });
  }
  
  // Double chance (1X, 12, X2)
  const probVictoireA = parseFloat(resultatsFT.probas.victoireA);
  const probNul = parseFloat(resultatsFT.probas.nul);
  const probVictoireB = parseFloat(resultatsFT.probas.victoireB);
  
  if (probVictoireA + probNul > seuilProbabilite) {
    coupon.push({
      type: 'Double chance',
      pari: '1X (Victoire A ou Nul)',
      probabilite: (probVictoireA + probNul).toFixed(1)
    });
  }
  
  if (probVictoireA + probVictoireB > seuilProbabilite) {
    coupon.push({
      type: 'Double chance',
      pari: '12 (Victoire A ou B)',
      probabilite: (probVictoireA + probVictoireB).toFixed(1)
    });
  }
  
  if (probNul + probVictoireB > seuilProbabilite) {
    coupon.push({
      type: 'Double chance',
      pari: 'X2 (Nul ou Victoire B)',
      probabilite: (probNul + probVictoireB).toFixed(1)
    });
  }
  
  // Match result (1X2)
  if (probVictoireA > seuilProbabilite) {
    coupon.push({
      type: '1X2',
      pari: '1 (Victoire Équipe A)',
      probabilite: resultatsFT.probas.victoireA
    });
  } else if (probVictoireB > seuilProbabilite) {
    coupon.push({
      type: '1X2',
      pari: '2 (Victoire Équipe B)',
      probabilite: resultatsFT.probas.victoireB
    });
  } else if (probNul > seuilProbabilite) {
    coupon.push({
      type: '1X2',
      pari: 'X (Match nul)',
      probabilite: resultatsFT.probas.nul
    });
  }
  
  // Generate estimates for other bet types
  
  // Corners - model based on teams' offensive level and match type
  const moyenneA = parseFloat(resultatsFT.scoreExact.split('-')[0]);
  const moyenneB = parseFloat(resultatsFT.scoreExact.split('-')[1]);
  const totalButs = moyenneA + moyenneB;
  
  // Estimated corners based on implicit playing style (derived from goals)
  const cornersEstimés = Math.round(7 + totalButs * 1.3);
  const probCorners = Math.min(95, 70 + (totalButs * 3));
  
  if (probCorners > seuilProbabilite) {
    if (cornersEstimés >= 10) {
      coupon.push({
        type: 'Corners',
        pari: `Over 8.5`,
        probabilite: probCorners.toFixed(1)
      });
    } else if (cornersEstimés <= 7) {
      coupon.push({
        type: 'Corners',
        pari: `Under 9.5`,
        probabilite: probCorners.toFixed(1)
      });
    }
  }
  
  // Yellow cards - based on match intensity
  let intensitéMatch = 0;
  
  // Close match = more intensity
  if (Math.abs(moyenneA - moyenneB) < 1) {
    intensitéMatch += 1;
  }
  
  // High-scoring match = more intensity
  if (totalButs > 2.5) {
    intensitéMatch += 0.5;
  }
  
  // Both teams score = more intensity
  if (moyenneA > 0 && moyenneB > 0) {
    intensitéMatch += 0.5;
  }
  
  const cartonsEstimés = Math.round(3 + intensitéMatch * 1.5);
  const probCartons = Math.min(90, 65 + (intensitéMatch * 7));
  
  if (probCartons > seuilProbabilite) {
    if (cartonsEstimés >= 5) {
      coupon.push({
        type: 'Cartons jaunes',
        pari: `Over 3.5`,
        probabilite: probCartons.toFixed(1)
      });
    } else if (cartonsEstimés <= 3) {
      coupon.push({
        type: 'Cartons jaunes',
        pari: `Under 3.5`,
        probabilite: probCartons.toFixed(1)
      });
    }
  }
  
  // Fouls - derived from intensity and estimated cards
  const fautesEstimées = cartonsEstimés * 4;
  const probFautes = probCartons - 5;
  
  if (probFautes > seuilProbabilite) {
    coupon.push({
      type: 'Fautes',
      pari: fautesEstimées >= 20 ? `Over 19.5` : `Under 21.5`,
      probabilite: probFautes.toFixed(1)
    });
  }
  
  // Throw-ins - based on intensity and playing style
  const touchesEstimées = Math.round(25 + intensitéMatch * 3);
  const probTouches = Math.min(85, 60 + (intensitéMatch * 5));
  
  if (probTouches > seuilProbabilite) {
    coupon.push({
      type: 'Touches',
      pari: touchesEstimées >= 30 ? `Over 27.5` : `Under 32.5`,
      probabilite: probTouches.toFixed(1)
    });
  }
  
  return coupon;
}
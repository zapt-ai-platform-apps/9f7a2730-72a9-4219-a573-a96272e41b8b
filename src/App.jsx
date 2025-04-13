import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SimulationForm from './components/SimulationForm';
import SimulationResults from './components/SimulationResults';
import Footer from './components/Footer';
import ThemeToggle from './components/ThemeToggle';
import HistoryButton from './components/HistoryButton';
import SimulationHistory from './components/SimulationHistory';
import * as Sentry from '@sentry/browser';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    return false;
  });

  // Écouteur pour les changements de thème système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Applique le thème au document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  const handleSimulate = async (formData) => {
    setLoading(true);
    setProgress(0);
    setResults(null);
    setShowHistory(false);
    
    try {
      console.log("Début de la simulation avec les données:", formData);
      
      // Simulation asynchrone avec progression
      const updateProgress = (value) => {
        setProgress(value);
      };
      
      // Appel au service de simulation
      const simulationResults = await runSimulation(formData, updateProgress);
      console.log("Résultats de simulation obtenus:", simulationResults);
      
      setResults(simulationResults);
      
      // Faire défiler jusqu'aux résultats
      setTimeout(() => {
        const resultsElement = document.getElementById('results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (error) {
      Sentry.captureException(error);
      console.error("Erreur lors de la simulation:", error);
      alert(`Une erreur s'est produite: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark text-textLight dark:text-textDark">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="relative">
          <HistoryButton onClick={toggleHistory} />
          <Header />
        </div>
        
        {showHistory ? (
          <SimulationHistory onClose={() => setShowHistory(false)} />
        ) : (
          <>
            <SimulationForm onSimulate={handleSimulate} />
            {results && <SimulationResults results={results} />}
          </>
        )}
        
        <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <Footer />
      </div>
      
      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Calcul en cours...</p>
            <p className="text-sm mt-2">{progress}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Fonction pour exécuter la simulation
async function runSimulation(formData, updateProgress) {
  const { 
    teamAName, teamBName, scoresA, scoresB, h2hScores, 
    isHomeTeamA, isHomeTeamB, matchType, 
    alpha, iterations, rankA, rankB, 
    competitionType, isKnockoutStage 
  } = formData;
  
  // Pour simuler une opération longue et asynchrone
  await new Promise(resolve => setTimeout(resolve, 300));
  updateProgress(10);
  
  // Traiter les données et calculer les ajustements
  const { adjustedScoresA, adjustedScoresB, ajustementA, ajustementB } = 
    ajusterScores(scoresA, scoresB, {
      matchType, isHomeTeamA, isHomeTeamB, rankA, rankB,
      competitionType, isKnockoutStage, h2hScores
    });
  
  updateProgress(30);
  
  // Calcul des moyennes pondérées
  const moyenneA = calculerMoyennePonderee(adjustedScoresA, alpha) * ajustementA;
  const moyenneB = calculerMoyennePonderee(adjustedScoresB, alpha) * ajustementB;
  
  updateProgress(50);
  
  // Simulation du match temps plein
  const resultatsFT = await simulerMatch(moyenneA, moyenneB, iterations, updateProgress, 50, 80);
  
  // Simulation du match mi-temps (approximativement moitié des buts)
  const resultatsHT = await simulerMatch(moyenneA/2, moyenneB/2, iterations, updateProgress, 80, 90);
  
  // Générer le coupon de paris
  const couponParis = genererCouponParis(resultatsHT, resultatsFT);
  
  // Filtrer seulement les paris avec 100% de certitude
  const couponParis100 = couponParis.filter(pari => parseFloat(pari.probabilite) >= 100);
  updateProgress(100);
  
  // Retourner les résultats formatés
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
    couponParis100,
    date: new Date().toISOString()
  };
}

// Calcul de la moyenne pondérée exponentielle
function calculerMoyennePonderee(scores, alpha = 1.3) {
  if (!scores || scores.length === 0) return 0;
  
  const n = scores.length;
  
  // Calcul des poids totaux pour normalisation
  const poidsTotaux = scores.reduce((somme, _, i) => 
    somme + Math.pow(alpha, n - i - 1), 0);
  
  // Si tous les poids sont nuls, retourner la moyenne simple
  if (poidsTotaux === 0) {
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  
  // Calcul de la moyenne pondérée
  const moyenne = scores.reduce((somme, score, i) => 
    somme + score * Math.pow(alpha, n - i - 1), 0) / poidsTotaux;
  
  return moyenne;
}

// Fonction d'ajustement des scores selon le contexte du match
function ajusterScores(scoresA, scoresB, config) {
  const { 
    matchType, isHomeTeamA, isHomeTeamB, rankA, rankB, 
    competitionType, isKnockoutStage, h2hScores 
  } = config;
  
  // Copier les scores pour ne pas modifier les originaux
  let adjustedScoresA = [...scoresA];
  let adjustedScoresB = [...scoresB];
  
  // Facteurs d'ajustement
  let ajustementA = 1.0;
  let ajustementB = 1.0;
  
  // 1. Ajustement pour domicile/extérieur
  if (isHomeTeamA) {
    ajustementA *= 1.2; // Avantage à domicile
  } else if (isHomeTeamB) {
    ajustementB *= 1.2; // Avantage à domicile
  }
  
  // 2. Ajustement selon le classement (uniquement pour les matchs de championnat)
  if (matchType === 'league' && rankA && rankB) {
    const diffRank = rankB - rankA;
    const facteurClassement = Math.max(0.8, Math.min(1.2, 1 + (diffRank * 0.01)));
    ajustementA *= facteurClassement;
  }
  
  // 3. Ajustement pour les compétitions
  if (matchType === 'competition') {
    // Les équipes jouent généralement mieux en compétition
    ajustementA *= 1.05;
    ajustementB *= 1.05;
    
    // Phase éliminatoire = plus d'intensité mais moins de buts
    if (isKnockoutStage) {
      ajustementA *= 0.9;
      ajustementB *= 0.9;
    }
  }
  
  // 4. Ajustement basé sur les confrontations directes
  if (h2hScores && h2hScores.length > 0) {
    let goalsForA = 0;
    let goalsForB = 0;
    
    h2hScores.forEach(match => {
      goalsForA += match.scoreA;
      goalsForB += match.scoreB;
    });
    
    // Si une équipe domine historiquement l'autre
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

// Simuler un match avec distribution de Poisson
async function simulerMatch(avgA, avgB, iterations = 18000, updateProgress, startProgress, endProgress) {
  // Cartographie des scores
  const scoreMap = {};
  
  // Compteurs pour différentes statistiques
  let btts = 0, over15 = 0, over25 = 0, over35 = 0;
  let draws = 0, winA = 0, winB = 0;
  
  // Exécuter les itérations Monte Carlo
  for (let i = 0; i < iterations; i++) {
    // Mettre à jour la progression tous les 5% d'avancement
    if (i % Math.floor(iterations / 20) === 0) {
      const percent = Math.floor(startProgress + (i / iterations) * (endProgress - startProgress));
      updateProgress(percent);
      
      // Permettre à l'UI de se mettre à jour
      await new Promise(r => setTimeout(r, 0));
    }
    
    // Générer les scores selon Poisson
    const scoreA = tiragePoisson(avgA);
    const scoreB = tiragePoisson(avgB);
    const total = scoreA + scoreB;
    
    // Créer une clé pour ce score
    const key = `${scoreA}-${scoreB}`;
    
    // Incrémenter le compteur pour ce score
    scoreMap[key] = (scoreMap[key] || 0) + 1;
    
    // Compter les résultats
    if (scoreA === scoreB) draws++;
    else if (scoreA > scoreB) winA++;
    else winB++;
    
    // Compter les autres statistiques
    if (scoreA > 0 && scoreB > 0) btts++;
    if (total > 1.5) over15++;
    if (total > 2.5) over25++;
    if (total > 3.5) over35++;
  }
  
  // Trouver le score le plus fréquent
  const maxKey = Object.keys(scoreMap).reduce((a, b) => 
    scoreMap[a] > scoreMap[b] ? a : b);
  
  // Calculer les probabilités en pourcentage
  const probas = {
    btts: (btts / iterations * 100).toFixed(1),
    over15: (over15 / iterations * 100).toFixed(1),
    over25: (over25 / iterations * 100).toFixed(1),
    over35: (over35 / iterations * 100).toFixed(1),
    victoireA: (winA / iterations * 100).toFixed(1),
    victoireB: (winB / iterations * 100).toFixed(1),
    nul: (draws / iterations * 100).toFixed(1)
  };
  
  // Obtenir les 5 scores les plus fréquents
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

// Fonction pour générer un nombre selon Poisson
function tiragePoisson(lambda) {
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

// Génère un coupon de paris fiables
function genererCouponParis(resultatsHT, resultatsFT) {
  const coupon = [];
  const seuilProbabilite = 70; // Seuil de probabilité pour paris fiables
  
  // Vérifier le score exact
  if (parseFloat(resultatsFT.scoreExactPourcentage) > seuilProbabilite) {
    coupon.push({
      type: 'Score exact',
      pari: resultatsFT.scoreExact,
      probabilite: resultatsFT.scoreExactPourcentage
    });
  }
  
  // Vérifier BTTS (Les deux équipes marquent)
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
  
  // Vérifier les Over/Under
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
  
  // Résultat du match (1X2)
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
  
  // Générer des estimations pour d'autres types de paris
  
  // Corners - modèle basé sur le niveau offensif des équipes et le type de match
  const moyenneA = parseFloat(resultatsFT.scoreExact.split('-')[0]);
  const moyenneB = parseFloat(resultatsFT.scoreExact.split('-')[1]);
  const totalButs = moyenneA + moyenneB;
  
  // Calcul des corners estimés basé sur le style de jeu implicite (dérivé des buts)
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
  
  // Cartons jaunes - basé sur l'intensité du match
  let intensitéMatch = 0;
  
  // Match serré = plus d'intensité
  if (Math.abs(moyenneA - moyenneB) < 1) {
    intensitéMatch += 1;
  }
  
  // Match avec beaucoup de buts = plus d'intensité
  if (totalButs > 2.5) {
    intensitéMatch += 0.5;
  }
  
  // Les deux équipes marquent = plus d'intensité
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
  
  // Fautes - dérivé de l'intensité et du nombre estimé de cartons
  const fautesEstimées = cartonsEstimés * 4;
  const probFautes = probCartons - 5;
  
  if (probFautes > seuilProbabilite) {
    coupon.push({
      type: 'Fautes',
      pari: fautesEstimées >= 20 ? `Over 19.5` : `Under 21.5`,
      probabilite: probFautes.toFixed(1)
    });
  }
  
  // Touches - basé sur l'intensité et le style de jeu
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

export default App;
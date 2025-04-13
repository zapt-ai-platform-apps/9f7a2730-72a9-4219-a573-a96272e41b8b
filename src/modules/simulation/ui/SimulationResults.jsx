import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

function SimulationResults({ results }) {
  const [outcomeChart, setOutcomeChart] = useState(null);
  
  // Create/update chart for results
  useEffect(() => {
    if (!results) return;
    
    const { resultatsFT } = results;
    
    // Prepare data for chart
    const issues = [
      { name: `Victoire ${results.teamAName}`, value: parseFloat(resultatsFT.probas.victoireA) },
      { name: 'Match nul', value: parseFloat(resultatsFT.probas.nul) },
      { name: `Victoire ${results.teamBName}`, value: parseFloat(resultatsFT.probas.victoireB) }
    ];
    
    // Destroy existing chart if there is one
    if (outcomeChart) {
      outcomeChart.destroy();
    }
    
    // Create a new chart
    const ctx = document.getElementById('outcomeChart').getContext('2d');
    const newChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: issues.map(i => i.name),
        datasets: [{
          data: issues.map(i => i.value),
          backgroundColor: [
            'rgba(93, 92, 222, 0.7)',  // Victory A
            'rgba(209, 213, 219, 0.7)', // Draw
            'rgba(56, 189, 248, 0.7)'   // Victory B
          ],
          borderColor: [
            'rgba(93, 92, 222, 1)',
            'rgba(209, 213, 219, 1)',
            'rgba(56, 189, 248, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#1F2937',
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });
    
    setOutcomeChart(newChart);
    
    // Clean up chart on component destruction
    return () => {
      if (newChart) {
        newChart.destroy();
      }
    };
  }, [results]);
  
  // If no results, display nothing
  if (!results) return null;
  
  const { teamAName, teamBName, resultatsHT, resultatsFT, couponParis, couponParis75 } = results;
  
  // Find most probable outcome
  const issues = [
    { name: `Victoire ${teamAName}`, value: parseFloat(resultatsFT.probas.victoireA) },
    { name: 'Match nul', value: parseFloat(resultatsFT.probas.nul) },
    { name: `Victoire ${teamBName}`, value: parseFloat(resultatsFT.probas.victoireB) }
  ];
  
  const issuePlusProbable = issues.reduce((max, issue) => 
    issue.value > max.value ? issue : max, issues[0]);

  return (
    <div id="results">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Résultats: {teamAName} vs {teamBName}
        </h2>
        
        {/* Reliable betting coupon (75%+ only) */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-5 rounded-lg mb-8 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Pronostics Fiables (≥75%)</h3>
            <span className="bg-white text-green-700 px-3 py-1 rounded-full text-sm font-bold">
              {couponParis75.length} pronostics
            </span>
          </div>
          <div className="space-y-2 bg-white bg-opacity-20 p-4 rounded-lg">
            {couponParis75.length === 0 ? (
              <p className="text-center text-white italic">
                Aucun pronostic avec une probabilité de 75% ou plus n'a été identifié pour ce match.
              </p>
            ) : (
              <>
                {couponParis75.map((pari, index) => (
                  <div 
                    key={`pari-${index}`} 
                    className="bg-white bg-opacity-10 p-3 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold">{pari.type}</div>
                      <div>{pari.pari}</div>
                    </div>
                    <div className="text-xl font-bold bg-white text-green-600 px-3 py-1 rounded-lg">{pari.probabilite}%</div>
                  </div>
                ))}
                <div className="mt-4 text-center text-white text-sm italic">
                  Ces pronostics ont tous une probabilité de 75% ou plus selon notre simulation avancée.
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Text results */}
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Scores probables</h3>
              <p className="mb-2">
                Score mi-temps (HT): 
                <span className="font-bold text-primary ml-2">{resultatsHT.scoreExact}</span> 
                <span className="text-gray-600 dark:text-gray-400 ml-1">({resultatsHT.scoreExactPourcentage}%)</span>
              </p>
              <p>
                Score final (FT): 
                <span className="font-bold text-primary ml-2">{resultatsFT.scoreExact}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">({resultatsFT.scoreExactPourcentage}%)</span>
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Statistiques du match</h3>
              <p className="mb-2">BTTS (Les deux équipes marquent): <span className="font-bold">{resultatsFT.probas.btts}%</span></p>
              <p className="mb-2">Over 1.5: <span className="font-bold">{resultatsFT.probas.over15}%</span></p>
              <p className="mb-2">Over 2.5: <span className="font-bold">{resultatsFT.probas.over25}%</span></p>
              <p>Over 3.5: <span className="font-bold">{resultatsFT.probas.over35}%</span></p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Répartition des issues</h3>
              <p className="mb-2">Issue la plus probable: <span className="font-bold text-primary">{issuePlusProbable.name}</span></p>
              <p className="mb-1">Victoire {teamAName}: <span className="font-bold">{resultatsFT.probas.victoireA}%</span></p>
              <p className="mb-1">Match nul: <span className="font-bold">{resultatsFT.probas.nul}%</span></p>
              <p>Victoire {teamBName}: <span className="font-bold">{resultatsFT.probas.victoireB}%</span></p>
            </div>
          </div>
          
          {/* Chart */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg flex items-center justify-center">
            <div className="w-full h-64">
              <canvas id="outcomeChart"></canvas>
            </div>
          </div>
        </div>
        
        {/* Top 5 scores */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Top 5 scores les plus probables</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {resultatsFT.topScores.map((score, index) => (
              <div 
                key={`score-${index}`} 
                className="bg-white dark:bg-gray-700 p-3 rounded-lg text-center shadow"
              >
                <div className="text-lg font-bold mb-1">{score.score}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{score.pourcentage}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimulationResults;
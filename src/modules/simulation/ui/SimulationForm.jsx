import React, { useState } from 'react';
import { api as storageApi } from '@/modules/storage/api';

function SimulationForm({ onSimulate }) {
  // Default configuration values
  const [teamAName, setTeamAName] = useState('Équipe A');
  const [teamBName, setTeamBName] = useState('Équipe B');
  const [scoresAInput, setScoresAInput] = useState('');
  const [scoresBInput, setScoresBInput] = useState('');
  const [h2hScoresInput, setH2hScoresInput] = useState('');
  const [isHomeTeamA, setIsHomeTeamA] = useState(true);
  const [isHomeTeamB, setIsHomeTeamB] = useState(false);
  const [matchType, setMatchType] = useState('league');
  const [alpha, setAlpha] = useState(1.3);
  const [iterations, setIterations] = useState(18000);
  const [rankA, setRankA] = useState(5);
  const [rankB, setRankB] = useState(10);
  const [competitionType, setCompetitionType] = useState('championsLeague');
  const [isKnockoutStage, setIsKnockoutStage] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({});
  
  // Get recent teams
  const recentTeams = storageApi.getRecentTeams();

  // Handle slider value changes
  const handleAlphaChange = (e) => {
    setAlpha(parseFloat(e.target.value));
  };

  const handleIterationsChange = (e) => {
    setIterations(parseInt(e.target.value));
  };

  // Handle home team changes
  const handleHomeTeamChange = (team) => {
    if (team === 'A') {
      setIsHomeTeamA(true);
      setIsHomeTeamB(false);
    } else {
      setIsHomeTeamA(false);
      setIsHomeTeamB(true);
    }
  };

  // Handle recent team selection
  const handleTeamSelect = (team, position) => {
    const teamScores = storageApi.getTeamScores();
    
    if (position === 'A') {
      setTeamAName(team);
      if (teamScores[team]) {
        setScoresAInput(teamScores[team].join(','));
      }
    } else {
      setTeamBName(team);
      if (teamScores[team]) {
        setScoresBInput(teamScores[team].join(','));
      }
    }
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    const newErrors = {};
    
    if (!teamAName.trim()) newErrors.teamAName = 'Nom de l\'équipe A requis';
    if (!teamBName.trim()) newErrors.teamBName = 'Nom de l\'équipe B requis';
    
    // Validation and processing of scores
    let scoresA = [];
    let scoresB = [];
    let h2hScores = [];
    
    try {
      if (!scoresAInput.trim()) {
        newErrors.scoresA = 'Scores de l\'équipe A requis';
      } else {
        scoresA = scoresAInput.split(',').map(s => parseInt(s.trim()));
        if (scoresA.length < 3) {
          newErrors.scoresA = 'Au moins 3 scores pour l\'équipe A';
        }
        if (scoresA.some(isNaN)) {
          newErrors.scoresA = 'Les scores doivent être des nombres valides';
        }
      }
      
      if (!scoresBInput.trim()) {
        newErrors.scoresB = 'Scores de l\'équipe B requis';
      } else {
        scoresB = scoresBInput.split(',').map(s => parseInt(s.trim()));
        if (scoresB.length < 3) {
          newErrors.scoresB = 'Au moins 3 scores pour l\'équipe B';
        }
        if (scoresB.some(isNaN)) {
          newErrors.scoresB = 'Les scores doivent être des nombres valides';
        }
      }
      
      // Optional head-to-head processing
      if (h2hScoresInput.trim()) {
        h2hScores = h2hScoresInput.split(',').map(s => {
          const [scoreA, scoreB] = s.trim().split('-').map(Number);
          if (isNaN(scoreA) || isNaN(scoreB)) {
            throw new Error("Format de score H2H invalide");
          }
          return { scoreA, scoreB };
        });
      }
    } catch (error) {
      newErrors.h2hScores = 'Format invalide. Utilisez le format "A-B" (ex: 2-1)';
    }
    
    // If there are errors, display and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Save team data to storage
    storageApi.saveTeamData(teamAName, scoresA);
    storageApi.saveTeamData(teamBName, scoresB);
    
    // Send simulation request
    onSimulate({
      teamAName, 
      teamBName,
      scoresA, 
      scoresB, 
      h2hScores,
      isHomeTeamA, 
      isHomeTeamB,
      matchType,
      alpha,
      iterations,
      rankA, 
      rankB,
      competitionType,
      isKnockoutStage
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Team names and scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team A */}
          <div>
            <div className="mb-4">
              <label htmlFor="teamAName" className="block text-sm font-medium mb-2">Nom de l'équipe A</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  id="teamAName" 
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className={`input-field ${errors.teamAName ? 'border-red-500' : ''}`} 
                  required
                />
                {recentTeams.length > 0 && (
                  <div className="relative">
                    <select 
                      onChange={(e) => handleTeamSelect(e.target.value, 'A')}
                      className="input-field py-2 cursor-pointer"
                      value=""
                    >
                      <option value="" disabled>Équipes récentes</option>
                      {recentTeams.map((team, idx) => (
                        <option key={`team-a-${idx}`} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              {errors.teamAName && <p className="text-red-500 text-xs mt-1">{errors.teamAName}</p>}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="scoresA" className="block text-sm font-medium">5 derniers scores</label>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="homeTeamA" 
                    checked={isHomeTeamA}
                    onChange={() => handleHomeTeamChange('A')}
                    className="mr-2 cursor-pointer" 
                  />
                  <label htmlFor="homeTeamA" className="text-sm">Domicile</label>
                </div>
              </div>
              <input 
                type="text" 
                id="scoresA" 
                value={scoresAInput}
                onChange={(e) => setScoresAInput(e.target.value)}
                placeholder="Ex: 2,1,3,0,2" 
                className={`input-field ${errors.scoresA ? 'border-red-500' : ''}`}
                required
              />
              {errors.scoresA && <p className="text-red-500 text-xs mt-1">{errors.scoresA}</p>}
            </div>
          </div>
          
          {/* Team B */}
          <div>
            <div className="mb-4">
              <label htmlFor="teamBName" className="block text-sm font-medium mb-2">Nom de l'équipe B</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  id="teamBName" 
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className={`input-field ${errors.teamBName ? 'border-red-500' : ''}`}
                  required
                />
                {recentTeams.length > 0 && (
                  <div className="relative">
                    <select 
                      onChange={(e) => handleTeamSelect(e.target.value, 'B')}
                      className="input-field py-2 cursor-pointer"
                      value=""
                    >
                      <option value="" disabled>Équipes récentes</option>
                      {recentTeams.map((team, idx) => (
                        <option key={`team-b-${idx}`} value={team}>{team}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              {errors.teamBName && <p className="text-red-500 text-xs mt-1">{errors.teamBName}</p>}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="scoresB" className="block text-sm font-medium">5 derniers scores</label>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="homeTeamB" 
                    checked={isHomeTeamB}
                    onChange={() => handleHomeTeamChange('B')}
                    className="mr-2 cursor-pointer"
                  />
                  <label htmlFor="homeTeamB" className="text-sm">Domicile</label>
                </div>
              </div>
              <input 
                type="text" 
                id="scoresB" 
                value={scoresBInput}
                onChange={(e) => setScoresBInput(e.target.value)}
                placeholder="Ex: 1,0,1,2,1" 
                className={`input-field ${errors.scoresB ? 'border-red-500' : ''}`}
                required
              />
              {errors.scoresB && <p className="text-red-500 text-xs mt-1">{errors.scoresB}</p>}
            </div>
          </div>
        </div>
        
        {/* Head-to-head matches */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Confrontations directes (H2H)</h3>
          <div>
            <label htmlFor="h2hScores" className="block text-sm font-medium mb-2">
              5 derniers matchs (format: "{teamAName}-{teamBName}", séparés par virgules)
            </label>
            <input 
              type="text" 
              id="h2hScores" 
              value={h2hScoresInput}
              onChange={(e) => setH2hScoresInput(e.target.value)}
              placeholder="Ex: 2-1,0-0,3-2,1-2,2-0" 
              className={`input-field ${errors.h2hScores ? 'border-red-500' : ''}`}
            />
            {errors.h2hScores && <p className="text-red-500 text-xs mt-1">{errors.h2hScores}</p>}
          </div>
        </div>
        
        {/* Match type */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Type de match</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="matchType" className="block text-sm font-medium mb-2">Catégorie</label>
              <select 
                id="matchType" 
                value={matchType}
                onChange={(e) => setMatchType(e.target.value)}
                className="input-field cursor-pointer"
              >
                <option value="friendly">Match amical</option>
                <option value="league">Match de championnat</option>
                <option value="competition">Match de compétition</option>
              </select>
            </div>
            
            {matchType === 'league' && (
              <div id="leagueOptions">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="rankA" className="block text-sm font-medium mb-2">Position {teamAName}</label>
                    <input 
                      type="number" 
                      id="rankA" 
                      min="1" 
                      max="20" 
                      value={rankA}
                      onChange={(e) => setRankA(parseInt(e.target.value))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label htmlFor="rankB" className="block text-sm font-medium mb-2">Position {teamBName}</label>
                    <input 
                      type="number" 
                      id="rankB" 
                      min="1" 
                      max="20" 
                      value={rankB}
                      onChange={(e) => setRankB(parseInt(e.target.value))}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {matchType === 'competition' && (
              <div id="competitionOptions" className="md:col-span-2">
                <label htmlFor="competitionType" className="block text-sm font-medium mb-2">Compétition</label>
                <select 
                  id="competitionType" 
                  value={competitionType}
                  onChange={(e) => setCompetitionType(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="championsLeague">Ligue des Champions</option>
                  <option value="europaLeague">Ligue Europa</option>
                  <option value="domesticCup">Coupe Nationale</option>
                  <option value="worldCup">Coupe du Monde</option>
                </select>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input 
                      type="checkbox" 
                      id="knockoutStage" 
                      checked={isKnockoutStage}
                      onChange={(e) => setIsKnockoutStage(e.target.checked)}
                      className="mr-2 cursor-pointer"
                    />
                    <span className="text-sm">Phase éliminatoire</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Advanced configuration */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Configuration avancée</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Alpha slider (recency) */}
            <div>
              <label htmlFor="alpha" className="block text-sm font-medium mb-2">
                Poids récence (alpha): <span id="alphaValue">{alpha}</span>
              </label>
              <input 
                type="range" 
                id="alpha" 
                min="0" 
                max="3" 
                step="0.1" 
                value={alpha}
                onChange={handleAlphaChange}
                className="slider w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* Monte Carlo iterations slider */}
            <div>
              <label htmlFor="iterations" className="block text-sm font-medium mb-2">
                Itérations Monte Carlo: <span id="iterationsValue">{iterations}</span>
              </label>
              <input 
                type="range" 
                id="iterations" 
                min="1000" 
                max="20000" 
                step="1000" 
                value={iterations}
                onChange={handleIterationsChange}
                className="slider w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button 
            type="submit" 
            className="bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
          >
            Simuler le match
          </button>
        </div>
      </form>
    </div>
  );
}

export default SimulationForm;
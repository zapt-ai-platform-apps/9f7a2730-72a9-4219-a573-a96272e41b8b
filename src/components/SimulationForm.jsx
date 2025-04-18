import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

function SimulationForm({ onSimulate }) {
  // Valeurs de configuration par défaut
  const [teamAName, setTeamAName] = useState('Équipe A');
  const [teamBName, setTeamBName] = useState('Équipe B');
  const [scoresAInput, setScoresAInput] = useState('');
  const [scoresBInput, setScoresBInput] = useState('');
  const [h2hScoresInput, setH2hScoresInput] = useState('');
  const [isHomeTeamA, setIsHomeTeamA] = useState(true);
  const [isHomeTeamB, setIsHomeTeamB] = useState(false);
  const [matchType, setMatchType] = useState('league');
  const [alpha, setAlpha] = useState(1.3); // Valeur par défaut mise à 1.3 (précédemment 1.0)
  const [iterations, setIterations] = useState(18000); // Valeur par défaut mise à 18000 (précédemment 10000)
  const [rankA, setRankA] = useState(5);
  const [rankB, setRankB] = useState(10);
  const [competitionType, setCompetitionType] = useState('championsLeague');
  const [isKnockoutStage, setIsKnockoutStage] = useState(false);

  // Historique des équipes et scores
  const [recentTeams, setRecentTeams] = useLocalStorage('pr_pronos_teams', []);
  const [recentScores, setRecentScores] = useLocalStorage('pr_pronos_scores', {});

  // État pour validation du formulaire
  const [errors, setErrors] = useState({});

  // Changement de la valeur des sliders
  const handleAlphaChange = (e) => {
    setAlpha(parseFloat(e.target.value));
  };

  const handleIterationsChange = (e) => {
    setIterations(parseInt(e.target.value));
  };

  // Gestion des équipes à domicile
  const handleHomeTeamChange = (team) => {
    if (team === 'A') {
      setIsHomeTeamA(true);
      setIsHomeTeamB(false);
    } else {
      setIsHomeTeamA(false);
      setIsHomeTeamB(true);
    }
  };

  // Gestion des sélections d'équipes récentes
  const handleTeamSelect = (team, position) => {
    if (position === 'A') {
      setTeamAName(team);
      if (recentScores[team]) {
        setScoresAInput(recentScores[team].join(','));
      }
    } else {
      setTeamBName(team);
      if (recentScores[team]) {
        setScoresBInput(recentScores[team].join(','));
      }
    }
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Valider les entrées
    const newErrors = {};
    
    if (!teamAName.trim()) newErrors.teamAName = 'Nom de l\'équipe A requis';
    if (!teamBName.trim()) newErrors.teamBName = 'Nom de l\'équipe B requis';
    
    // Validation et traitement des scores
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
      
      // Traitement optionnel des confrontations directes
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
    
    // S'il y a des erreurs, afficher et arrêter
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Mémoriser les équipes et leurs scores
    saveTeamData(teamAName, scoresA);
    saveTeamData(teamBName, scoresB);
    
    // Envoyer les données pour simulation
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
  
  // Sauvegarder les données d'équipe pour l'historique
  const saveTeamData = (teamName, scores) => {
    if (!teamName.trim() || scores.length === 0) return;
    
    // Mettre à jour la liste des équipes récentes
    let updatedTeams = [...recentTeams];
    if (!updatedTeams.includes(teamName)) {
      updatedTeams = [teamName, ...updatedTeams.slice(0, 9)]; // Garder les 10 dernières
      setRecentTeams(updatedTeams);
    }
    
    // Mettre à jour les scores associés à l'équipe
    setRecentScores(prev => ({
      ...prev,
      [teamName]: scores
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Noms et scores des équipes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Équipe A */}
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
                      className="input-field py-2"
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
                    className="mr-2" 
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
          
          {/* Équipe B */}
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
                      className="input-field py-2"
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
                    className="mr-2"
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
        
        {/* Confrontations directes */}
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
        
        {/* Type de match */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Type de match</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="matchType" className="block text-sm font-medium mb-2">Catégorie</label>
              <select 
                id="matchType" 
                value={matchType}
                onChange={(e) => setMatchType(e.target.value)}
                className="input-field"
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
                  className="input-field"
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
                      className="mr-2"
                    />
                    <span className="text-sm">Phase éliminatoire</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Configuration avancée */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Configuration avancée</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slider pour alpha (récence) */}
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
            
            {/* Slider pour les itérations Monte Carlo */}
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
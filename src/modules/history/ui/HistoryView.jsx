import React, { useState } from 'react';
import { api as storageApi } from '@/modules/storage/api';

function HistoryView({ onClose }) {
  const [history, setHistory] = useState(storageApi.getSimulationHistory());
  const [expanded, setExpanded] = useState(false);
  
  // Clear history
  const clearHistory = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer tout l\'historique des simulations ?')) {
      storageApi.clearSimulationHistory();
      setHistory([]);
    }
  };
  
  // Format date
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
  
  // Display only 5 most recent entries by default
  const displayedHistory = expanded ? history : history.slice(0, 5);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Historique des simulations</h3>
        <div className="space-x-2">
          {history.length > 5 && (
            <button 
              className="text-primary text-sm hover:underline cursor-pointer"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? 'Réduire' : 'Voir tout'}
            </button>
          )}
          <button 
            className="text-red-500 text-sm hover:underline cursor-pointer"
            onClick={clearHistory}
          >
            Effacer l'historique
          </button>
          <button 
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded cursor-pointer"
            onClick={onClose}
          >
            Retour
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-gray-50 dark:bg-gray-900 rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Match</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Score prédit</th>
              <th className="px-4 py-3 text-left">Proba.</th>
              <th className="px-4 py-3 text-left">Issue</th>
              <th className="px-4 py-3 text-center">Paris</th>
              <th className="px-4 py-3 text-center">Paris ≥75%</th>
            </tr>
          </thead>
          <tbody>
            {displayedHistory.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                  Aucune simulation enregistrée
                </td>
              </tr>
            ) : (
              displayedHistory.map(item => (
                <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3">{formatDate(item.date)}</td>
                  <td className="px-4 py-3">{item.teamAName} vs {item.teamBName}</td>
                  <td className="px-4 py-3">{item.matchType}</td>
                  <td className="px-4 py-3">{item.score}</td>
                  <td className="px-4 py-3">{item.probability}%</td>
                  <td className="px-4 py-3">{item.outcome}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.couponCount > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {item.couponCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.couponCount75 > 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                      {item.couponCount75 || 0}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoryView;
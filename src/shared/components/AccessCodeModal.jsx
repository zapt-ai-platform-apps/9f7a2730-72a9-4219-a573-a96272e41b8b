import React, { useState } from 'react';
import * as Sentry from '@sentry/browser';

function AccessCodeModal({ onVerify, onCancel }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer un code d\'accès');
      return;
    }

    setError('');
    setIsVerifying(true);

    try {
      const isValid = await onVerify(code);
      
      if (!isValid) {
        setError('Code d\'accès invalide. Veuillez réessayer ou contacter l\'administrateur.');
      }
    } catch (error) {
      Sentry.captureException(error);
      console.error('Erreur lors de la vérification du code:', error);
      setError('Une erreur est survenue lors de la vérification du code.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center text-primary">Code d'accès requis</h2>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Pour accéder aux analyses prédictives, veuillez entrer votre code d'accès.
          </p>
          
          <div className="mb-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Entrez votre code d'accès"
              className={`input-field ${error ? 'border-red-500' : ''}`}
              disabled={isVerifying}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Pour obtenir un code d'accès, veuillez contacter l'administrateur via WhatsApp aux numéros indiqués en bas de page.
          </p>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="btn-outline cursor-pointer"
            disabled={isVerifying}
          >
            Annuler
          </button>
          <button
            onClick={handleVerify}
            className="btn-primary cursor-pointer"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Vérification...
              </span>
            ) : (
              'Vérifier'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccessCodeModal;
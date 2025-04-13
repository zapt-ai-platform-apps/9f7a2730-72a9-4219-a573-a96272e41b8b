import React, { useState } from 'react';
import * as Sentry from '@sentry/browser';
import { api } from '../api';
import SimulationForm from './SimulationForm';
import SimulationResults from './SimulationResults';
import AccessCodeModal from '@/shared/components/AccessCodeModal';
import { api as storageApi } from '@/modules/storage/api';

function SimulationModule() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const handleSimulate = async (formData) => {
    setPendingFormData(formData);
    setShowAccessCodeModal(true);
  };

  const handleVerifyCode = async (code) => {
    try {
      const isValid = await api.verifyAccessCode(code);
      
      if (isValid && pendingFormData) {
        setShowAccessCodeModal(false);
        runSimulation(pendingFormData);
      }
      
      return isValid;
    } catch (error) {
      Sentry.captureException(error);
      console.error("Erreur lors de la vérification du code:", error);
      return false;
    }
  };

  const handleCancelVerification = () => {
    setShowAccessCodeModal(false);
    setPendingFormData(null);
  };

  const runSimulation = async (formData) => {
    setLoading(true);
    setProgress(0);
    setResults(null);
    
    try {
      console.log("Début de la simulation avec les données:", formData);
      
      // Call simulation API
      const simulationResults = await api.simulate(formData, updateProgress);
      console.log("Résultats de simulation obtenus:", simulationResults);
      
      // Set results for display
      setResults(simulationResults);
      
      // Save to history
      storageApi.addToSimulationHistory(simulationResults);
      
      // Scroll to results
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

  const updateProgress = (value) => {
    setProgress(value);
  };

  return (
    <>
      <SimulationForm onSimulate={handleSimulate} />
      {results && <SimulationResults results={results} />}
      
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary mx-auto mb-4"></div>
            <p className="text-lg">Calcul en cours...</p>
            <p className="text-sm mt-2">{progress}%</p>
          </div>
        </div>
      )}
      
      {/* Access code modal */}
      {showAccessCodeModal && (
        <AccessCodeModal 
          onVerify={handleVerifyCode}
          onCancel={handleCancelVerification}
        />
      )}
    </>
  );
}

export default SimulationModule;
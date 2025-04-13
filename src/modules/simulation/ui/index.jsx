import React, { useState, useEffect } from 'react';
import SimulationForm from './SimulationForm';
import SimulationResults from './SimulationResults';
import AccessCodeModal from '@/shared/components/AccessCodeModal';
import { api } from '../api';
import * as Sentry from '@sentry/browser';

function SimulationModule() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showAccessCodeModal, setShowAccessCodeModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  
  const updateProgress = (value) => {
    setProgress(value);
  };
  
  const handleSimulate = async (formData) => {
    // Set pending form data and show access code modal
    setPendingFormData(formData);
    setShowAccessCodeModal(true);
  };
  
  const proceedWithSimulation = async (formData) => {
    setLoading(true);
    setProgress(0);
    setResults(null);
    
    try {
      console.log("Starting simulation with data:", formData);
      
      // Call the simulation service
      const simulationResults = await api.simulate(formData, updateProgress);
      console.log("Simulation results obtained:", simulationResults);
      
      setResults(simulationResults);
      
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById('results');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (error) {
      Sentry.captureException(error);
      console.error("Error during simulation:", error);
      alert(`Une erreur s'est produite: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyCode = async (code) => {
    try {
      const isValid = await api.verifyAccessCode(code);
      
      if (isValid && pendingFormData) {
        setShowAccessCodeModal(false);
        proceedWithSimulation(pendingFormData);
      }
      
      return isValid;
    } catch (error) {
      Sentry.captureException(error);
      console.error("Error verifying access code:", error);
      return false;
    }
  };
  
  const handleCancelCode = () => {
    setShowAccessCodeModal(false);
    setPendingFormData(null);
  };
  
  return (
    <div>
      <SimulationForm onSimulate={handleSimulate} />
      {results && <SimulationResults results={results} />}
      
      {/* Access Code Modal */}
      {showAccessCodeModal && (
        <AccessCodeModal 
          onVerify={handleVerifyCode}
          onCancel={handleCancelCode}
        />
      )}
      
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

export default SimulationModule;
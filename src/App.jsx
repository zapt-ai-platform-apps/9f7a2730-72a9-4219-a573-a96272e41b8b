import React, { useState, useEffect } from 'react';
import Header from '@/shared/components/Header';
import Footer from '@/shared/components/Footer';
import ThemeToggle from '@/modules/theme/ui/ThemeToggle';
import HistoryButton from '@/modules/history/ui/HistoryButton';
import SimulationHistory from '@/modules/history/ui/SimulationHistory';
import SimulationForm from '@/modules/simulations/ui/SimulationForm';
import SimulationResults from '@/modules/simulations/ui/SimulationResults';
import { modules, initializeModules } from '@/modules/index';
import * as Sentry from '@sentry/browser';

function App() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  
  // Initialize modules
  useEffect(() => {
    const initialize = async () => {
      try {
        const cleanup = await initializeModules();
        return cleanup;
      } catch (error) {
        Sentry.captureException(error);
        console.error("Error initializing modules:", error);
      }
    };
    
    const cleanupPromise = initialize();
    
    return () => {
      cleanupPromise.then(cleanup => {
        if (cleanup) cleanup();
      });
    };
  }, []);

  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  const handleSimulate = async (formData) => {
    setLoading(true);
    setProgress(0);
    setResults(null);
    setShowHistory(false);
    
    try {
      console.log("Starting simulation with data:", formData);
      
      // Call the simulation service
      const simulationResults = await modules.simulations.simulateMatch(formData, updateProgress);
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
  
  const updateProgress = (value) => {
    setProgress(value);
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark text-textLight dark:text-textDark">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="relative">
          <HistoryButton onClick={toggleHistory} />
          <Header />
        </div>
        
        {showHistory ? (
          <SimulationHistory 
            onClose={() => setShowHistory(false)} 
            newSimulation={null}
          />
        ) : (
          <>
            <SimulationForm onSimulate={handleSimulate} />
            {results && <SimulationResults results={results} />}
          </>
        )}
        
        <ThemeToggle />
        
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

export default App;
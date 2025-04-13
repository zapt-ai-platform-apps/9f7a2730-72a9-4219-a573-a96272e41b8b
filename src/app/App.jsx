import React, { useState, useEffect } from 'react';
import Header from '@/shared/components/Header';
import Footer from '@/shared/components/Footer';
import HistoryButton from '@/shared/components/HistoryButton';
import SimulationModule from '@/modules/simulation/ui';
import HistoryView from '@/modules/history/ui/HistoryView';
import ThemeToggle from '@/modules/theme/ui/ThemeToggle';
import { api as themeApi } from '@/modules/theme/api';

function App() {
  const [showHistory, setShowHistory] = useState(false);
  const [darkMode, setDarkMode] = useState(() => themeApi.initialize());

  // Listen for system theme changes
  useEffect(() => {
    const cleanup = themeApi.onThemeChange((isDarkMode) => {
      setDarkMode(isDarkMode);
    });
    
    return cleanup;
  }, []);

  // Toggle theme
  const toggleDarkMode = () => {
    setDarkMode(prevDarkMode => themeApi.toggleTheme(prevDarkMode));
  };

  // Toggle history view
  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-bgLight dark:bg-bgDark text-textLight dark:text-textDark">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="relative">
          <HistoryButton onClick={toggleHistory} />
          <Header />
        </div>
        
        {showHistory ? (
          <HistoryView onClose={() => setShowHistory(false)} />
        ) : (
          <SimulationModule />
        )}
        
        <ThemeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <Footer />
      </div>
    </div>
  );
}

export default App;
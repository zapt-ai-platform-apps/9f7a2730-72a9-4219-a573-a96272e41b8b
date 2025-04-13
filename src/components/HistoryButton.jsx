import React from 'react';

function HistoryButton({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="absolute top-0 left-0 bg-primary text-white p-2 rounded-lg shadow-md hover:bg-opacity-90 transition-all duration-300 z-10 cursor-pointer"
      aria-label="Voir l'historique"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  );
}

export default HistoryButton;
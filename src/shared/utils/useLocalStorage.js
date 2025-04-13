import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour interagir avec le localStorage
 * @param {string} key - Clé pour stocker les données
 * @param {any} initialValue - Valeur initiale si rien n'existe en localStorage
 * @returns {[any, function]} Tableau contenant la valeur et la fonction setter
 */
export function useLocalStorage(key, initialValue) {
  // Fonction pour obtenir la valeur initiale
  const readValue = () => {
    try {
      // Obtenir depuis localStorage
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erreur lors de la lecture de localStorage pour la clé "${key}":`, error);
      return initialValue;
    }
  };

  // État pour stocker notre valeur
  const [storedValue, setStoredValue] = useState(readValue);

  // Retourne une fonction wrapper pour mettre à jour à la fois l'état et le localStorage
  const setValue = (value) => {
    try {
      // Permet de passer une fonction comme pour l'API useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Sauvegarder l'état
      setStoredValue(valueToStore);
      
      // Sauvegarder dans localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Erreur lors de l'écriture dans localStorage pour la clé "${key}":`, error);
    }
  };

  // Écouter les changements dans d'autres onglets/fenêtres
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
      }
    };
    
    // Ajouter l'écouteur d'événement
    window.addEventListener('storage', handleStorageChange);
    
    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
}
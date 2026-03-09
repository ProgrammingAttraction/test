// contexts/GamesContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const GamesContext = createContext();

export const useGames = () => {
  return useContext(GamesContext);
};

export const GamesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  const fetchData = async (forceRefresh = false) => {
    // Only fetch if data is stale (older than 5 minutes) or forced
    const isStale = !lastFetched || (Date.now() - lastFetched > 5 * 60 * 1000);
    
    if (!forceRefresh && !isStale && games.length > 0) {
      return; // Use cached data
    }

    try {
      setLoading(true);
      const [categoriesResponse, gamesResponse] = await axios.all([
        axios.get(`${API_BASE_URL}/api/categories`),
        axios.get(`${API_BASE_URL}/api/games/games/data`)
      ]);
      if (categoriesResponse.data.success && gamesResponse.data) {
        setCategories(categoriesResponse.data.data);
        setGames(gamesResponse.data.data.games || []);
        setLastFetched(Date.now());
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchData(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const value = {
    categories,
    games,
    loading,
    error,
    refreshData
  };

  return (
    <GamesContext.Provider value={value}>
      {children}
    </GamesContext.Provider>
  );
};
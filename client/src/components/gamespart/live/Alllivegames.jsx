import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaSearch, FaTimes } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

// Game Card Component
const GameCard = ({ game }) => (
  <div className="relative group overflow-hidden rounded-xl bg-[#0a1920] shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/30 hover:scale-[1.03] border border-gray-800">
    {/* Image */}
    <img
      src={`${API_BASE_URL}/images/${game.imageUrl}`}
      alt={game.gameName}
      className="w-full h-full min-h-[120px] sm:min-h-[160px] md:min-h-[200px] lg:min-h-[260px] object-cover transition-transform duration-300 group-hover:scale-105"
    />

    {/* Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

    {/* Star Icon for featured games */}
    {game.isFeatured && (
      <div className="absolute top-2 right-2 text-yellow-400 text-lg z-10">
        <FaStar className="bg-black/30 backdrop-blur-sm rounded-full p-1 w-6 h-6 sm:w-7 sm:h-7 border border-yellow-300/50" />
      </div>
    )}

    {/* Hover Buttons */}
    <div className="hidden sm:absolute sm:inset-0 sm:z-10 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:flex flex-col items-center justify-center gap-2 px-2">
      <button className="bg-teal-500 hover:bg-teal-400 cursor-pointer text-black font-semibold text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-[0_4px_0_#0d9488] hover:-translate-y-1 transition-transform w-full max-w-[90%]">
        এখন খেলুন
      </button>
      <button className="bg-black/30 backdrop-blur-md cursor-pointer text-teal-300 font-semibold text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-teal-500 hover:-translate-y-1 transition-transform w-full max-w-[90%]">
        ফ্রি ট্রায়াল
      </button>
    </div>

    {/* Game Info */}
    <div className="absolute bottom-0 left-0 right-0 z-10 p-2 sm:p-3 text-white">
      <h3 className="font-bold text-xs sm:text-sm md:text-base truncate">{game.gameName}</h3>
      <p className="text-[10px] sm:text-xs text-gray-400">{game.providerName}</p>
    </div>

    {/* Mobile Buttons */}
    <div className="sm:hidden absolute bottom-10 left-0 mb-[7px] right-0 z-10 px-2 flex gap-1">
      <button className="bg-teal-500 text-black font-semibold text-[10px] px-2 py-1 rounded-lg shadow-[0_2px_0_#0d9488] flex-1">
        খেলুন
      </button>
      <button className="bg-black/30 backdrop-blur-md text-teal-300 font-semibold text-[10px] px-2 py-1 rounded-lg border border-teal-500 flex-1">
        ট্রায়াল
      </button>
    </div>
  </div>
);

// Main Component
const Alllivegames = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch live games
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/live-games`);
        
        if (response.data.success) {
          setGames(response.data.data);
          setFilteredGames(response.data.data);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter games based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredGames(games);
    } else {
      const filtered = games.filter(game => 
        game.gameName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.providerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredGames(filtered);
    }
  }, [searchQuery, games]);

  if (error) {
    return (
      <div className="container mx-auto py-8 text-center text-yellow-400">
        <p>Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-teal-500 hover:bg-theme_color2 text-white font-semibold py-2 px-4 rounded mx-auto"
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-3 sm:py-5 px-2 sm:px-4">
      {/* Header with Title and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-sm sm:text-2xl font-[500] md:font-[600] text-teal-400">সকল লাইভ গেমস</h1>
        
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="গেম বা প্রোভাইডার খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-[5px] py-2 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
          <FaSearch className="absolute left-3 top-2.5 text-gray-400" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      )}

      {/* Games Display */}
      {!loading && (
        <div className="py-3 sm:py-4">
          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
              {filteredGames.map((game, index) => (
                <GameCard key={`${game._id}-${index}`} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="mb-4">কোনো গেম পাওয়া যায়নি</p>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-2 bg-teal-500 hover:bg-theme_color2 text-white font-semibold py-2 px-4 rounded text-sm mx-auto"
                >
                  সার্চ ক্লিয়ার করুন
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Alllivegames;
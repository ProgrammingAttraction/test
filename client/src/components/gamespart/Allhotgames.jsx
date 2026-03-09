import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaSearch, FaTimes } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

// Game Card Component with enhanced design
const GameCard = ({ game }) => (
  <div className="relative group overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/30 hover:scale-[1.02] border border-gray-700 hover:border-teal-400/30">
    {/* Image with shimmer effect */}
    <div className="relative overflow-hidden">
      <img
        src={`${API_BASE_URL}/images/${game.imageUrl}`}
        alt={game.gameName}
        className="w-full h-[160px] sm:h-[180px] md:h-[200px] lg:h-[220px] object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
    </div>

    {/* Featured Badge */}
    {game.isFeatured && (
      <div className="absolute top-2 right-2 z-10 animate-pulse">
        <div className="bg-yellow-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <FaStar className="text-xs" /> জনপ্রিয়
        </div>
      </div>
    )}

    {/* Category Badge */}
    <div className="absolute top-2 left-2 z-10">
      <span className="bg-black/80 text-teal-300 text-[10px] px-2 py-1 rounded-md border border-teal-500/30 backdrop-blur-sm">
        {game.category}
      </span>
    </div>

    {/* Game Info */}
    <div className="absolute bottom-0 left-0 right-0 z-10 p-3 text-white">
      <h3 className="font-bold text-sm sm:text-base truncate drop-shadow-lg">{game.gameName}</h3>
      <p className="text-xs text-gray-300 mt-1">{game.providerName}</p>
    </div>

    {/* Hover Buttons */}
    <div className="hidden sm:absolute sm:inset-0 sm:flex sm:items-center sm:justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-20">
      <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent w-full h-full absolute"></div>
      <div className="relative z-10 w-full px-4 space-y-2">
        <button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-black font-bold py-2 rounded-lg shadow-lg transform transition-all duration-300 hover:-translate-y-1">
          এখন খেলুন
        </button>
        <button className="w-full bg-gray-900/80 backdrop-blur-sm hover:bg-gray-800/90 text-teal-300 font-bold py-2 rounded-lg border border-teal-500/50 transform transition-all duration-300 hover:-translate-y-1">
          ফ্রি ট্রায়াল
        </button>
      </div>
    </div>

    {/* Mobile Buttons */}
    <div className="sm:hidden absolute bottom-2 left-2 right-2 z-10 flex gap-2">
      <button className="flex-1 bg-teal-500 hover:bg-teal-400 text-black font-semibold text-xs py-1.5 rounded-md shadow-[0_2px_0_#0d9488]">
        খেলুন
      </button>
      <button className="flex-1 bg-gray-900/80 backdrop-blur-sm text-teal-300 font-semibold text-xs py-1.5 rounded-md border border-teal-500/50">
        ট্রায়াল
      </button>
    </div>
  </div>
);

// Main Component with enhanced design
const Allhotgames = () => {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch hot games
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/hot-games`);
        
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
        <div className="max-w-md text-center bg-gray-800/90 backdrop-blur-sm p-8 rounded-xl border border-red-500/30 shadow-lg">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Games</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-teal-500 hover:bg-teal-400 text-black font-bold py-2 px-6 rounded-lg transition-colors duration-300"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              <span className="bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
                গরম খেলা
              </span>
            </h1>
            <p className="text-sm text-gray-400">সবচেয়ে জনপ্রিয় গেমগুলির তালিকা</p>
          </div>
          
          {/* Search Bar */}
          <div className="w-full md:w-80 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="গেম বা প্রোভাইডার খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg py-2.5 px-4 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder-gray-500 transition-all duration-300"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mb-4"></div>
              <p className="text-gray-400">গেম লোড হচ্ছে...</p>
            </div>
          </div>
        )}

        {/* Games Display */}
        {!loading && (
          <div className="mb-10">
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
                {filteredGames.map((game, index) => (
                  <GameCard key={`${game._id}-${index}`} game={game} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                <div className="text-gray-400 text-lg mb-4">কোনো গেম পাওয়া যায়নি</div>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="bg-teal-500 hover:bg-teal-400 text-black font-semibold py-2 px-6 rounded-lg transition-colors duration-300"
                  >
                    সার্চ ক্লিয়ার করুন
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer Note */}
        {!loading && filteredGames.length > 0 && (
          <div className="text-center text-xs text-gray-500 mt-8 pt-6 border-t border-gray-800/50">
            সর্বমোট {filteredGames.length}টি গেম প্রদর্শিত হচ্ছে
          </div>
        )}
      </div>
    </div>
  );
};

export default Allhotgames;
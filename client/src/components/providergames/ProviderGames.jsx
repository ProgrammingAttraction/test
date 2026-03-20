import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { FaStar, FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useUser } from "../../context/UserContext";
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast, { Toaster } from "react-hot-toast";
import { useGames } from '../../context/GamesContext';
import { LanguageContext } from '../../context/LanguageContext';
import Footer from '../../components/footer/Footer';
import Sidebar from '../../components/sidebar/Sidebar';
import Header from '../../components/header/Header';
import controller_img from "../../assets/controller.png";
const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
import { IoSearchSharp } from "react-icons/io5";

// Game Card Component
const GameCard = ({ game, onPlayGame, onTryDemo, t }) => {
  const { userData } = useUser();

  const handlePlayClick = () => {
    if (!userData) {
      toast.error(t.pleaseLogin);
      return;
    }
    onPlayGame(game);
  };

  const handleDemoClick = () => {
    onTryDemo(game);
  };

  return (
    <div className="relative group overflow-hidden rounded-[5px] md:rounded-xl bg-[#0a1920] shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/30 hover:scale-[1.03]">
      {/* Image */}
      <img
        src={game.imageUrl}
        alt={game.gameName}
        className="w-full h-full min-h-[170px] sm:min-h-[170px] md:min-h-[200px] lg:min-h-[260px] transition-transform duration-300 group-hover:scale-105"
      />

      {/* Star Icon for featured games */}
      {game.has_freespins && (
        <div className="absolute top-2 right-2 text-yellow-400 text-lg z-10">
          <FaStar className="bg-black/30 backdrop-blur-sm rounded-full p-1 w-6 h-6 sm:w-7 sm:h-7 border border-yellow-300/50" />
        </div>
      )}

      {/* Hover Buttons - Hidden on mobile, shown on hover for larger screens */}
      <div className="hidden sm:absolute sm:inset-0 sm:z-10 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 sm:flex flex-col items-center justify-center gap-2 px-2">
        <button
          onClick={handlePlayClick}
          className="bg-teal-500 hover:bg-teal-400 cursor-pointer text-black font-semibold text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-[0_4px_0_#0d9488] hover:-translate-y-1 transition-transform w-full max-w-[90%]"
        >
          {t.play}
        </button>
        <button
          onClick={handleDemoClick}
          className="bg-black/30 backdrop-blur-md cursor-pointer text-teal-300 font-semibold text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-teal-500 hover:-translate-y-1 transition-transform w-full max-w-[90%]"
        >
          {t.demo}
        </button>
      </div>

      {/* Mobile Buttons - Always visible on mobile */}
      <div className="sm:hidden absolute bottom-10 left-0 mb-[7px] right-0 z-10 px-2 flex gap-1">
        <button
          onClick={handlePlayClick}
          className="bg-teal-500 text-black font-semibold cursor-pointer text-[10px] px-2 py-1 rounded-[5px] shadow-[0_2px_0_#0d9488] flex-1"
        >
          {t.play}
        </button>
        <button
          onClick={handleDemoClick}
          className="bg-black/30 backdrop-blur-md cursor-pointer text-teal-300 font-semibold text-[10px] px-2 py-1 rounded-[5px] border border-teal-300 flex-1"
        >
          {t.demo}
        </button>
      </div>
    </div>
  );
};

// Game Grid Section Component
const GameGridSection = ({ title, gameList, onPlayGame, onTryDemo, t }) => (
  <div className="sm:py-4 px-[10px]">
    <h2 className="text-[18px] sm:text-lg py-3 md:text-xl font-bold text-teal-400 mb-2 sm:mb-4 flex items-center gap-3 sm:gap-4">
      <img className='w-[30px]' src={controller_img} alt="" /> {title}
    </h2>
    <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1 sm:gap-3 md:gap-4">
      {gameList.map((game, index) => (
        <GameCard
          key={`${game._id}-${index}`}
          game={game}
          onPlayGame={onPlayGame}
          onTryDemo={onTryDemo}
          t={t}
        />
      ))}
    </div>
  </div>
);

// Search Component
const SearchBar = ({ searchTerm, setSearchTerm, t }) => {
  return (
    <div className="relative mx-[10px] mb-4 mt-3">
      <div className="relative">
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-10 py-3 text-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent backdrop-blur-sm"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IoSearchSharp className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

// Provider Tabs Component with Slider
const ProviderTabs = ({ providers, selectedProvider, setSelectedProvider, t }) => {
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
      setTimeout(() => {
        checkScrollPosition();
      }, 300);
    }
  };

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Auto-scroll to active provider tab
  useEffect(() => {
    if (scrollContainerRef.current && selectedProvider) {
      const activeBtn = scrollContainerRef.current.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [selectedProvider, providers]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      checkScrollPosition();
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, [providers]);

  return (
    <div className="mx-[10px] mb-4 relative">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 cursor-pointer transform -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/90 rounded-full p-2 shadow-lg backdrop-blur-sm"
        >
          <FaChevronLeft className="text-white" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 cursor-pointer transform -translate-y-1/2 z-10 bg-gray-800/80 hover:bg-gray-700/90 rounded-full p-2 shadow-lg backdrop-blur-sm"
        >
          <FaChevronRight className="text-white" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex space-x-2 pb-2 overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {providers.map((provider) => {
          const isActive = selectedProvider === provider.providerName;
          return (
            <button
              key={provider._id}
              data-active={isActive ? "true" : "false"}
              onClick={() => setSelectedProvider(provider.providerName)}
              className={`flex-shrink-0 flex items-center cursor-pointer gap-2 border-[1px] px-4 py-2 md:py-1 rounded-[5px] text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-theme_color2 text-white shadow-lg border-teal-500 scale-[1.04]'
                  : 'bg-gray-50 text-theme_color2 border-gray-200 hover:border-teal-400 hover:bg-teal-50'
              }`}
            >
              {provider.imageUrl && (
                <img
                  src={`${API_BASE_URL}/images/${provider.imageUrl}`}
                  alt={provider.providerName}
                  className="w-8 h-8 md:w-12 md:h-12 object-contain rounded"
                />
              )}
              {/* ✅ FIX: text color changes based on active state */}
              <span
                className={`text-[16px] font-semibold ${
                  isActive ? 'text-white' : 'text-gray-700'
                }`}
              >
                {provider.providerName}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// All Games Component
const AllGamesContent = () => {
  const [visibleGamesCount, setVisibleGamesCount] = useState(36);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useContext(LanguageContext);

  useEffect(() => {
    window.scrollTo(0, 0);

    // ✅ FIX: Read provider from URL on mount and set it as active
    const providerFromUrl = searchParams.get('provider');
    if (providerFromUrl) {
      setSelectedProvider(providerFromUrl);
    }

    fetchProviders();
  }, []);

  // ✅ FIX: Sync URL whenever selectedProvider changes
  useEffect(() => {
    if (selectedProvider) {
      searchParams.set('provider', selectedProvider);
    } else {
      searchParams.delete('provider');
    }
    setSearchParams(searchParams, { replace: true });
  }, [selectedProvider]);

  // Reset visible count when filters change so results start fresh
  useEffect(() => {
    setVisibleGamesCount(36);
  }, [searchTerm, selectedProvider]);

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true);
      const response = await axios.get(`${API_BASE_URL}/api/all-providers`);
      if (response.data) {
        setProviders(response.data);
      }
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast.error(t.providersLoadError);
    } finally {
      setLoadingProviders(false);
    }
  };

  const { games, loading, error, refreshData } = useGames();
  const { userData } = useUser();
  const navigate = useNavigate();

  // Filter games based on search term and selected provider
  const filteredGames = games.filter((game) => {
    const matchesSearch =
      game.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = selectedProvider
      ? game.providerName === selectedProvider
      : true;
    return matchesSearch && matchesProvider;
  });

  // Only show providers that actually have games
  const availableProviders = providers.filter((provider) =>
    games.some((game) => game.providerName === provider.providerName)
  );

  const loadMoreGames = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleGamesCount((prevCount) => prevCount + 20);
      setIsLoadingMore(false);
    }, 2000);
  };

  const visibleGames = filteredGames.slice(0, visibleGamesCount);
  const hasMoreGames = visibleGamesCount < filteredGames.length;

  const postBalanceToGameAPI = async (balance, sessionId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/games/notify/balance-to-agg`,
        {
          balance_bdt: balance,
          session_id: sessionId,
          player_id: userData.player_id,
        }
      );
      if (response.data.success) {
        console.log('Balance updated successfully with Game Aggregator');
      } else {
        console.warn('Failed to update balance with Game Aggregator');
      }
    } catch (error) {
      console.error('Error posting balance to game API:', error);
    }
  };

  const handlePlayGame = async (game) => {
    try {
      if (!userData) {
        toast.error(t.pleaseLogin);
        return;
      }

      const sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      await postBalanceToGameAPI(userData.balance, sessionId);

      let lobbyData = null;
      if (game.has_lobby) {
        const lobbyResponse = await axios.get(
          `${API_BASE_URL}/api/games/games/lobby`,
          {
            params: { game_uuid: game.uuid, currency: 'BDT' },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );
        if (lobbyResponse.data.success && lobbyResponse.data.lobby) {
          lobbyData = lobbyResponse.data.lobby.lobbyData;
        }
      }

      const initResponse = await axios.post(
        `${API_BASE_URL}/api/games/games/init`,
        {
          game_uuid: game.gameId || game.uuid,
          player_id: userData.player_id,
          player_name: userData.username,
          currency: 'BDT',
          session_id: sessionId,
          return_url: window.location.href,
          language: 'en',
          email: userData.email || 'shihabmoni15@gmail.com',
          lobby_data: lobbyData || {},
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (initResponse.data.url) {
        navigate('/single-game', {
          state: {
            gameUrl: initResponse.data.url,
            gameName: game.gameName,
            isDemo: false,
            sessionId: sessionId,
          },
        });
        localStorage.setItem('something_', initResponse.data.url);
      } else {
        throw new Error('Failed to initialize game');
      }
    } catch (error) {
      console.error('Error launching game:', error);
      toast.error(t.gameLaunchError);
    }
  };

  const handleTryDemo = async (game) => {
    try {
      const initResponse = await axios.post(
        `${API_BASE_URL}/api/games/games/init-demo`,
        {
          game_uuid: game.gameId || game.uuid,
          device: 'desktop',
          return_url: window.location.href,
          language: userData?.language || language.code || 'en',
        }
      );

      if (initResponse.data.url) {
        navigate('/single-game', {
          state: {
            gameUrl: initResponse.data.url,
            gameName: game.gameName,
            isDemo: true,
          },
        });
      } else {
        throw new Error('Failed to initialize demo game');
      }
    } catch (error) {
      console.error('Error launching demo game:', error);
      toast.error(t.gameLaunchError);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <div className="flex justify-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-7 w-7 bg-teal-400 rounded-full animate-bounce-leaf-1 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-7 w-7 bg-teal-500 rounded-full animate-bounce-leaf-2 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-7 w-7 bg-theme_color2 rounded-full animate-bounce-leaf-3 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-white rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 bg-teal-300 rounded-full animate-bounce-leaf-4 flex items-center justify-center">
                <div className="h-1.5 w-1.5 border-2 border-white rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-theme_color2 font-medium text-lg animate-pulse">
          {t.loadingPleaseWait}
        </p>
        <p className="text-gray-500 text-sm mt-2">{t.preparingYourGames}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center max-w-md">
        <button
          onClick={refreshData}
          className="relative overflow-hidden px-6 py-3 cursor-pointer bg-gradient-to-r from-teal-500 to-theme_color2 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:from-theme_color2 hover:to-teal-700"
        >
          <span className="relative z-10">{t.tryAgain}</span>
          <span className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></span>
        </button>
        <p className="text-gray-500 text-sm mt-4">{t.contactUsIfIssue}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-2 pb-3 sm:py-5">
      <Toaster position="top-right" />

      {/* Search Bar */}
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} t={t} />

      {/* Provider Tabs */}
      {availableProviders.length > 0 && (
        <ProviderTabs
          providers={availableProviders}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          t={t}
        />
      )}

      {/* Clear Filters Button */}
      {(searchTerm || selectedProvider) && (
        <div className="mx-[10px] mb-4">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedProvider(null);
            }}
            className="flex items-center gap-2 text-sm cursor-pointer text-teal-400 hover:text-teal-300"
          >
            <FaTimes />
            {t.clearFilters}
          </button>
        </div>
      )}

      {/* Games Display */}
      {visibleGames.length > 0 ? (
        <GameGridSection
          title={
            searchTerm && selectedProvider
              ? `${t.searchResults}: "${searchTerm}" (${selectedProvider})`
              : searchTerm
              ? `${t.searchResults}: "${searchTerm}"`
              : selectedProvider
              ? `${t.provider}: ${selectedProvider}`
              : t.allGamesCategory
          }
          gameList={visibleGames}
          onPlayGame={handlePlayGame}
          onTryDemo={handleTryDemo}
          t={t}
        />
      ) : searchTerm || selectedProvider ? (
        <div className="text-center py-12 text-gray-400">
          <p>
            {searchTerm && selectedProvider
              ? `${t.noGamesFoundFor} "${searchTerm}" ${t.and} ${selectedProvider}`
              : searchTerm
              ? `${t.noGamesFoundFor} "${searchTerm}"`
              : `${t.noGamesFoundForProvider} ${selectedProvider}`}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedProvider(null);
            }}
            className="mt-4 text-teal-400 cursor-pointer hover:text-teal-300 underline"
          >
            {t.clearAllFilters}
          </button>
        </div>
      ) : null}

      {/* Load More Button */}
      {hasMoreGames && (
        <div className="flex justify-center mt-6 px-[10px]">
          <button
            onClick={loadMoreGames}
            disabled={isLoadingMore}
            className="bg-theme_color2 hover:bg-teal-500 text-white cursor-pointer font-[500] py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoadingMore ? (
              <>
                <div className="relative">
                  <div className="animate-spin rounded-full h-5 w-5 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
                  <div className="absolute inset-0 animate-pulse rounded-full h-5 w-5 bg-cyan-500/20 blur-sm"></div>
                </div>
                {t.loading}
              </>
            ) : (
              t.loadMoreGames
            )}
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredGames.length === 0 && !loading && !searchTerm && !selectedProvider && (
        <div className="text-center py-12 text-gray-400">
          <p>{t.noGamesFound}</p>
        </div>
      )}

      {/* Show message when all games are loaded */}
      {!hasMoreGames && filteredGames.length > 0 && (
        <div className="text-center py-6 text-teal-400">
          <p>{t.allGamesLoaded}</p>
        </div>
      )}
    </div>
  );
};

// Main Allgames Page Component
const ProviderGames = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('আমার অ্যাকাউন্ট');
  const { t } = useContext(LanguageContext);

  return (
    <section className="min-h-screen font-anek">
      <Header
        className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700"
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        activeLeftTab={activeLeftTab}
        setActiveLeftTab={setActiveLeftTab}
      />

      <div className="flex">
        <div className="hidden md:block">
          <Sidebar
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            activeLeftTab={activeLeftTab}
            setActiveLeftTab={setActiveLeftTab}
          />
        </div>

        <div className="ml-0 md:ml-[330px] w-full">
          <div className="mx-auto md:px-4">
            <AllGamesContent />
          </div>
          <Footer className="mt-12 bg-gray-900/90 border-t border-gray-700" />
        </div>
      </div>
    </section>
  );
};

export default ProviderGames;
import React, { useState, useEffect, useCallback, useContext } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { NavLink, useNavigate } from 'react-router-dom';
import toast, { Toaster } from "react-hot-toast";
import { useGames } from '../../context/GamesContext';
import { LanguageContext } from '../../context/LanguageContext';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import all_games from "../../assets/category/Livegames.svg";
import slot_games from "../../assets/category/slots.svg";
import table_games from "../../assets/category/table.svg";
import roulette_games from "../../assets/category/roullete.svg";
import scratch_card from "../../assets/card.png";
import fishing_games from "../../assets/category/Fishing.svg";
import pocker_games from "../../assets/pocker.png";
import video_pocker from "../../assets/video_pocker.png";
import crash_games from "../../assets/category/crash.svg";
import dice_games from "../../assets/dice.png";
import american_roulette_games from "../../assets/american.png";
import crad_games from "../../assets/card.png";
import fire_games from "../../assets/fire.png";
import casino_games from "../../assets/category/Casino.svg";
import instant_games from "../../assets/category/instant.svg";
import famous_games from "../../assets/category/popular.svg";
import sports_games from "../../assets/sports.png";
import live_games from "../../assets/live.png";
import provider_img from "../../assets/provider.png";
import blackjack_img from "../../assets/blackjack.png";
import others_img from "../../assets/category/other.svg";

const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

// Category Item Component
const CategoryItem = ({ item, index, selectedIndex, onClick, isMobile = false, unfeaturedCount = 0 }) => (
  <div className={`relative flex-shrink-0 ${isMobile ? '' : ''}`}>
    <div 
      className={`group relative flex flex-col px-[8px] md:px-[20px] items-center justify-center ${
        isMobile ? 'min-w-[80px]' : 'min-w-[100px]'
      } cursor-pointer transition-all duration-300 active:scale-95`}
      onClick={() => onClick(index)}
    >
      <div
        className={`absolute inset-0 rounded-[5px] transition-all duration-300 border-[1px] ${
          selectedIndex === index
            ? 'bg-gray-50 shadow-lg border border-theme_color2 shadow-cyan-400/20'
            : 'bg-gray-50 text-gray-900 hover:border-theme_color2 border-gray-200'
        }`}
      >
        {!isMobile && selectedIndex === index && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-cyan-400/10 to-transparent opacity-60"></div>
        )}
      </div>
      <div
        className={`relative z-10 flex justify-start items-center gap-2 h-full w-full p-2 transform transition-all duration-300 ${
          selectedIndex === index 
            ? (isMobile ? 'scale-105' : 'scale-110') 
            : 'group-hover:scale-105'
        }`}
      >
        <div
          className={`relative flex justify-center items-center ${isMobile ? 'h-6 w-6' : 'h-12 w-12'} transition-all duration-300 ${
            selectedIndex === index 
              ? 'drop-shadow-[0_0_8px_rgba(10,200,200,0.6)]' 
              : 'group-hover:drop-shadow-[0_0_4px_rgba(10,200,200,0.4)]'
          }`}
        >
          <img 
            src={item.image} 
            alt={item.name}
            className="h-full w-full md:w-[35px] md:h-[35px] object-contain"
          />
        </div>
        <span
          className={`text-xs text-nowrap text-center font-medium transition-colors duration-300 ${
            selectedIndex === index 
              ? 'text-cyan-400 font-semibold' 
              : 'text-gray-800'
          }`}
        >
          {item.name}
        </span>
      </div>
      {selectedIndex === index && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-1 bg-cyan-400 rounded-full"></div>
      )}
    </div>
  </div>
);

// Game Card Component
const GameCard = ({ game, onPlayGame, onTryDemo, t }) => {
  const { userData } = useUser();

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (!userData) {
      toast.error(t.pleaseLogin);
      return;
    }
    onPlayGame(game);
  };

  const handleDemoClick = (e) => {
    e.stopPropagation();
    onTryDemo(game);
  };

  return (
    <div onClick={handlePlayClick} className="relative group overflow-hidden rounded-[8px] shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/30 hover:scale-[1.03] ">
      <div className="relative w-full aspect-[3/4]">
        <img
          src={game.imageUrl}
          alt={game.gameName}
          className="w-full h-full object-center transition-transform duration-300 group-hover:scale-105 rounded-[8px] "
        />
      </div>
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
    </div>
  );
};

// Remaining Games Box Component
const RemainingGamesBox = ({ categoryName, remainingCount, onViewAll, t }) => (
  <div 
    className="relative group cursor-pointer rounded-[12px] bg-gradient-to-br from-cyan-950 via-blue-950 to-indigo-950 border-2 border-cyan-500/50 shadow-2xl shadow-cyan-600/30 overflow-hidden transition-all duration-500"
    onClick={onViewAll}
  >
    {/* Deep animated gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/15 via-theme_color2/15 to-indigo-600/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    {/* Enhanced sparkle effect with deeper colors */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
      <div className="absolute top-2 left-2 w-1 h-1 bg-cyan-300 rounded-full animate-pulse"></div>
      <div className="absolute top-4 right-3 w-1 h-1 bg-blue-300 rounded-full animate-pulse delay-150"></div>
      <div className="absolute bottom-3 left-4 w-1 h-1 bg-indigo-300 rounded-full animate-pulse delay-300"></div>
      <div className="absolute bottom-6 right-2 w-1 h-1 bg-cyan-200 rounded-full animate-pulse delay-450"></div>
    </div>
    
    <div className="relative z-10 w-full aspect-[3/4] flex flex-col items-center justify-center p-2 md:p-6 text-center">
      {/* Count bubble with deep gradient */}
      <div className="mb-4 relative md:flex hidden">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-800 rounded-full flex items-center justify-center mb-2 group-hover:from-cyan-500 group-hover:via-theme_color2 group-hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-cyan-600/40 group-hover:shadow-xl group-hover:shadow-cyan-600/50">
          <span className="text-2xl font-bold text-white drop-shadow-md">+{remainingCount}</span>
        </div>
        {/* Enhanced glow effect */}
        <div className="absolute inset-0 w-16 h-16 bg-cyan-500 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10 mx-auto"></div>
      </div>
      
      {/* Category name */}
      <h3 className="text-white font-bold text-sm mb-1 md:mb-3 line-clamp-2 drop-shadow-md">
        {categoryName}
      </h3>
      
      {/* Description with deeper cyan */}
      <p className="text-cyan-300 text-xs mb-1 md:mb-4 font-medium drop-shadow-sm">
        {t.moreGamesAvailable}
      </p>
      
      {/* Button with deep gradient */}
      <button className="md:flex hidden bg-gradient-to-r from-cyan-600 to-blue-700 text-nowrap cursor-pointer hover:from-cyan-500 hover:to-theme_color2 text-white text-xs font-semibold px-5 py-2 md:py-2.5 rounded-[5px] md:rounded-full transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-cyan-600/40 border border-cyan-400/30">
        {t.viewAll}
      </button>
    </div>
    
    {/* Enhanced shine effect */}
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent"></div>
    
    {/* Enhanced corner accents with deeper colors */}
    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500/60 rounded-tl-[12px]"></div>
    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60 rounded-tr-[12px]"></div>
    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500/60 rounded-bl-[12px]"></div>
    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60 rounded-br-[12px]"></div>
    
    {/* Subtle pattern overlay for depth */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-blue-900/10 opacity-50"></div>
  </div>
);

// Game Grid Section Component
const GameGridSection = ({ 
  title, 
  gameList, 
  onPlayGame, 
  onTryDemo, 
  showLoadMore = false, 
  onLoadMore, 
  isLoadingMore = false,
  hasMoreGames = false,
  categoryIcon = null,
  t,
  useSlider = false,
  remainingGamesCount = 0,
  onViewAllCategory = null,
  showRemainingBox = false
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 768px)': { slidesToScroll: 3 },
      '(min-width: 1024px)': { slidesToScroll: 4 },
      '(min-width: 1280px)': { slidesToScroll: 5 },
      '(min-width: 1536px)': { slidesToScroll: 6 },
    }
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="sm:py-4 md:px-0 ">
      <div className='flex justify-between items-center pb-2'>
        <h2 className="text-[17px] sm:text-lg md:text-xl capitalize font-bold text-teal-400 mb-2 sm:mb-2 flex items-center gap-1 sm:gap-2">
          {categoryIcon && (
            <span className="text-xs sm:text-base">
              <img src={categoryIcon} alt={title} className="w-5 h-5 sm:w-8 sm:h-8 object-contain" />
            </span>
          )}
          {title}
        </h2>
        <NavLink to="/all-games" className="text-cyan-400">
          {t.allGames}
        </NavLink>
      </div>
      {useSlider ? (
        <div className="relative mb-[20px]">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-1.5 sm:gap-3 md:gap-4">
              {gameList.map((game, index) => (
                <div 
                  key={`${game.gameId}-${index}`} 
                  className="flex-shrink-0 flex-grow-0 basis-[calc(100%/3-0.5rem)] xs:basis-[calc(100%/3-0.5rem)] sm:basis-[calc(100%/4-0.75rem)] md:basis-[calc(100%/4-1rem)] lg:basis-[calc(100%/4-1rem)] xl:basis-[calc(100%/5-1rem)] 2xl:basis-[calc(100%/6-1rem)]"
                >
                  <GameCard 
                    game={game} 
                    onPlayGame={onPlayGame}
                    onTryDemo={onTryDemo}
                    t={t}
                  />
                </div>
              ))}
              {/* Add remaining games box at the end */}
              {showRemainingBox && remainingGamesCount > 0 && (
                <div className="flex-shrink-0 flex-grow-0 basis-[calc(100%/3-0.5rem)] xs:basis-[calc(100%/3-0.5rem)] sm:basis-[calc(100%/4-0.75rem)] md:basis-[calc(100%/4-1rem)] lg:basis-[calc(100%/4-1rem)] xl:basis-[calc(100%/5-1rem)] 2xl:basis-[calc(100%/6-1rem)]">
                  <RemainingGamesBox 
                    categoryName={title}
                    remainingCount={remainingGamesCount}
                    onViewAll={onViewAllCategory}
                    t={t}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 mb-[20px] md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5 sm:gap-3 md:gap-4">
          {gameList.map((game, index) => (
            <GameCard 
              key={`${game.gameId}-${index}`} 
              game={game} 
              onPlayGame={onPlayGame}
              onTryDemo={onTryDemo}
              t={t}
            />
          ))}
          {/* Add remaining games box at the end */}
          {showRemainingBox && remainingGamesCount > 0 && (
            <RemainingGamesBox 
              categoryName={title}
              remainingCount={remainingGamesCount}
              onViewAll={onViewAllCategory}
              t={t}
            />
          )}
        </div>
      )}
      {showLoadMore && hasMoreGames && (
        <div className="flex justify-center mt-6 px-[10px]">
          <button
            onClick={onLoadMore}
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
    </div>
  );
};

// Provider Card Component
const ProviderCard = ({ provider, t }) => (
  <div className="relative group overflow-hidden rounded-[5px] bg-gray-900 hover:border-cyan-400/30 transition-all duration-300">
    <NavLink to={`/all-games?provider=${provider.providerName}`}>
      <div className="flex items-center justify-center p-2">
        <img
          src={`${API_BASE_URL}/images/${provider.imageUrl}`}
          alt={provider.providerName}
          className="w-14 md:w-16 h-8 md:h-10 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      </div>
    </NavLink>
  </div>
);

// Providers Slider Component
const ProvidersSlider = ({ providers, t }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 6,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 8 },
      '(min-width: 1024px)': { slidesToScroll: 10 },
      '(min-width: 1280px)': { slidesToScroll: 12 },
    }
  }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);

  return (
    <div className="py-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg md:text-xl font-bold text-teal-400 flex items-center gap-2">
          <img src={provider_img} className='w-8' alt="" /> {t.gameProviders}
        </h2>
      </div>
      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-1 md:gap-2">
            {providers.map((provider, index) => (
              <div key={provider._id} className="flex-[0_0_20.666%] sm:flex-[0_0_14.285%] md:flex-[0_0_15.5%] lg:flex-[0_0_13%] xl:flex-[0_0_10.333%] px-0.5 md:px-1">
                <ProviderCard provider={provider} t={t} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Full Screen Loader Component
const FullScreenLoader = ({ t }) => (
  <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-md z-[100000] flex flex-col items-center justify-center">
    <div className="text-center">
      <p className="text-theme_color2 font-medium text-lg animate-pulse">
        {t.loadingPleaseWait}
      </p>
      <p className="text-gray-500 text-sm mt-2">
        {t.preparingYourData}
      </p>
    </div>
  </div>
);

// Main Component
const Mainpagegame = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    loop: false,
  });
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [gamesPerCategory, setGamesPerCategory] = useState({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showGameLoader, setShowGameLoader] = useState(false);
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  
  const { categories, games, loading, error, refreshData } = useGames();
  const { userData } = useUser();
  const { t, language } = useContext(LanguageContext);
  const navigate = useNavigate();

  // Category translations mapping
  const categoryTranslations = {
    'গরম খেলা': t.hotGames,
    'স্লট গেম': t.slotGames,
    'টেবিল': t.tableGames,
    'ক্যাসিনো': t.casino,
    'রুলেট': t.roulette,
    'ইনস্ট্যান্ট': t.instantGames,
    'স্ক্র্যাচ কার্ড': t.scratchCard,
    'ফিশিং': t.fishing,
    'পোকার': t.poker,
    'ভিডিও পোকার': t.videoPoker,
    'ক্রাশ': t.crash,
    'লাইভ ডিলার': t.liveDealer,
    'লটারি': t.lottery,
    'ভি-স্পোর্টস': t.vSports,
    'জনপ্রিয়': t.popular,
    'আমেরিকান রুলেট': t.americanRoulette,
    'কার্ড': t.card,
    'ব্ল্যাকজ্যাক': t.blackjack,
    'অন্যান্য': t.others
  };

  // Category images mapping
  const categoryImages = {
    [t.hotGames]: fire_games,
    [t.slotGames]: slot_games,
    [t.tableGames]: table_games,
    [t.casino]: casino_games,
    [t.roulette]: roulette_games,
    [t.instantGames]: instant_games,
    [t.scratchCard]: scratch_card,
    [t.fishing]: fishing_games,
    [t.poker]: pocker_games,
    [t.videoPoker]: video_pocker,
    [t.crash]: crash_games,
    [t.liveDealer]: live_games,
    [t.lottery]: roulette_games,
    [t.vSports]: sports_games,
    [t.popular]: famous_games,
    [t.americanRoulette]: american_roulette_games,
    [t.card]: crad_games,
    [t.blackjack]: blackjack_img,
    [t.others]: others_img
  };

  // Priority games for Popular category when "All Games" tab is selected
  const priorityGameNames = [
    'Aviator',
    'Crazy Time',
    'Super Ace', 
    'Crazy777',
    'Money Coming',
    'Fortune Gems',
    'Boxing King'
  ];

  // Fetch providers data
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoadingProviders(true);
        const response = await axios.get(`${API_BASE_URL}/api/all-providers`);
        setProviders(response.data);
      } catch (error) {
        console.error("Error fetching providers:", error);
        toast.error(t.providersLoadError);
      } finally {
        setLoadingProviders(false);
      }
    };
    fetchProviders();
  }, [t]);

  // Carousel functions
  const scrollTo = useCallback((index) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
      setSelectedCategoryIndex(index);
    }
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedCategoryIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    return () => emblaApi.off('select', onSelect);
  }, [emblaApi, onSelect]);

  // Extract unique categories from games, assuming categories is an array
  const gameCategories = [...new Set(games.flatMap(game => game.categories))];
  
  // Move 'অন্যান্য' to the end of gameCategories
  const othersCategory = 'অন্যান্য';
  const filteredCategories = gameCategories.filter(category => category !== othersCategory);
  const sortedGameCategories = [...filteredCategories, othersCategory];
  
  // Calculate unfeatured games count for each category when in "All Games" view
  const getUnfeaturedCountByCategory = useCallback(() => {
    const unfeaturedCounts = {};
    
    sortedGameCategories.forEach(category => {
      const categoryGames = games.filter(game => game.categories.includes(category));
      const unfeaturedGames = categoryGames.filter(game => !game.isFeatured);
      unfeaturedCounts[category] = unfeaturedGames.length;
    });
    
    return unfeaturedCounts;
  }, [games, sortedGameCategories]);

  // Create categories array with "All" as first item
  const allCategories = [
    { 
      name: t.allGamesCategory, 
      image: all_games,
      _id: "all",
      category: "all"
    },
    ...sortedGameCategories.map(category => ({
      name: categoryTranslations[category] || category,
      image: categoryImages[categoryTranslations[category]] || all_games,
      _id: category,
      category: category
    }))
  ];

  // Function to sort games for Popular category when "All Games" tab is selected
  const sortPopularGames = (games) => {
    const priorityGames = [];
    const otherGames = [];
    
    games.forEach(game => {
      if (priorityGameNames.includes(game.gameName)) {
        priorityGames.push(game);
      } else {
        otherGames.push(game);
      }
    });
    
    // Sort priority games according to the specified order
    const sortedPriorityGames = priorityGameNames
      .map(name => priorityGames.find(game => game.gameName === name))
      .filter(game => game !== undefined);
    
    // Return sorted priority games first, then other games
    return [...sortedPriorityGames, ...otherGames];
  };

  // Initialize games per category with featured games for "all" category and all games for "all games" section
  useEffect(() => {
    if (games.length > 0) {
      const initialGamesPerCategory = {};
      
      // For "all" category, show 30 featured games initially for featured sections
      const featuredGames = games.filter(game => game.isFeatured === true);
      initialGamesPerCategory['all'] = {
        displayed: featuredGames.slice(0, 30),
        all: featuredGames,
        hasMore: featuredGames.length > 30
      };
      
      // For "all games" section (when "All Games" is selected), show 30 games initially
      initialGamesPerCategory['all_games'] = {
        displayed: games.slice(0, 30),
        all: games,
        hasMore: games.length > 30
      };
      
      // For other categories, show ALL games (both featured and unfeatured) initially
      sortedGameCategories.forEach(category => {
        const categoryGames = games.filter(game => game.categories.includes(category));
        initialGamesPerCategory[category] = {
          displayed: categoryGames.slice(0, 50),
          all: categoryGames,
          hasMore: categoryGames.length > 50
        };
      });
      
      setGamesPerCategory(initialGamesPerCategory);
    }
  }, [games]);

  // Function to load more games for a specific category
  const loadMoreGames = (category) => {
    setIsLoadingMore(true);
    
    setTimeout(() => {
      const currentCategory = gamesPerCategory[category];
      const currentCount = currentCategory.displayed.length;
      const incrementAmount = category === 'all' ? 30 : (category === 'all_games' ? 30 : 50);
      const nextGames = currentCategory.all.slice(0, currentCount + incrementAmount);
      
      setGamesPerCategory(prev => ({
        ...prev,
        [category]: {
          ...currentCategory,
          displayed: nextGames,
          hasMore: nextGames.length < currentCategory.all.length
        }
      }));
      
      setIsLoadingMore(false);
    }, 500);
  };

  // Filter games by selected category - SHOW ONLY FEATURED GAMES when "All Games" tab is selected
  const getFilteredGames = () => {
    if (selectedCategoryIndex === 0) {
      // Show ONLY FEATURED games grouped by category
      const groupedGames = {};
      
      // Get all featured games
      const featuredGames = games.filter(game => game.isFeatured === true);
      
      // Group featured games by their categories, prioritizing "Popular"
      const sortedCategories = [...sortedGameCategories].sort((a, b) => {
        if (categoryTranslations[a] === t.popular) return -1;
        if (categoryTranslations[b] === t.popular) return 1;
        return 0;
      });
      
      sortedCategories.forEach(category => {
        // Skip "অন্যান্য" category when "All Games" is selected
        if (category !== othersCategory) {
          let categoryFeaturedGames = featuredGames.filter(game => game.categories.includes(category));
          
          // If this is the Popular category, sort the games with priority order
          if (categoryTranslations[category] === t.popular) {
            categoryFeaturedGames = sortPopularGames(categoryFeaturedGames);
          }
          
          if (categoryFeaturedGames.length > 0) {
            groupedGames[categoryTranslations[category] || category] = categoryFeaturedGames;
          }
        }
      });
      
      // Add "All Games" section at the end with all games
      if (gamesPerCategory['all_games']?.displayed.length > 0) {
        groupedGames[t.allGamesCategory] = gamesPerCategory['all_games'].displayed;
      }
      
      return groupedGames;
    } else {
      // Show ALL games (both featured and unfeatured) from selected category only
      const selectedCategory = allCategories[selectedCategoryIndex];
      let categoryGames = gamesPerCategory[selectedCategory.category]?.displayed || [];
      
      // If this is the Popular category and we're in specific category view, also sort by priority
      if (selectedCategory.name === t.popular) {
        categoryGames = sortPopularGames(categoryGames);
      }
      
      return {
        [selectedCategory.name]: categoryGames
      };
    }
  };

  // Get category icon for section header
  const getCategoryIcon = (categoryName) => {
    return categoryImages[categoryName] || (categoryName === t.allGamesCategory ? all_games : null);
  };

  // Check if a category has more games to load
  const hasMoreGames = (category) => {
    if (selectedCategoryIndex === 0) {
      // For "all" view, only show load more for "All Games" section
      if (category === t.allGamesCategory) {
        return gamesPerCategory['all_games']?.hasMore || false;
      }
      return false;
    } else {
      const selectedCategory = allCategories[selectedCategoryIndex];
      return gamesPerCategory[selectedCategory.category]?.hasMore || false;
    }
  };

  // Get unfeatured count for category items
  const getUnfeaturedCountForCategory = (categoryId) => {
    if (selectedCategoryIndex === 0 && categoryId !== 'all') {
      const unfeaturedCounts = getUnfeaturedCountByCategory();
      return unfeaturedCounts[categoryId] || 0;
    }
    return 0;
  };

  // Get remaining games count for a category section
  const getRemainingGamesCount = (categoryName, displayedGames) => {
    if (selectedCategoryIndex === 0) {
      // When in "All Games" view, show remaining unfeatured games
      const categoryKey = Object.keys(categoryTranslations).find(
        key => categoryTranslations[key] === categoryName
      );
      
      if (categoryKey) {
        const allCategoryGames = games.filter(game => game.categories.includes(categoryKey));
        const unfeaturedGames = allCategoryGames.filter(game => !game.isFeatured);
        return unfeaturedGames.length;
      }
    } else {
      // When in specific category view, show remaining games beyond displayed count
      const selectedCategory = allCategories[selectedCategoryIndex];
      const allCategoryGames = gamesPerCategory[selectedCategory.category]?.all || [];
      const displayedCount = displayedGames.length;
      const remaining = allCategoryGames.length - displayedCount;
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  };

  // Handle view all games in a category
  const handleViewAllCategory = (categoryName) => {
    if (selectedCategoryIndex === 0) {
      // Find the category index and switch to it
      const categoryIndex = allCategories.findIndex(
        cat => cat.name === categoryName && cat.category !== 'all'
      );
      if (categoryIndex !== -1) {
        setSelectedCategoryIndex(categoryIndex);
      }
    } else {
      // Load more games for current category
      const selectedCategory = allCategories[selectedCategoryIndex];
      loadMoreGames(selectedCategory.category);
    }
  };

  // Function to post the balance update to Game API
  const postBalanceToGameAPI = async (balance, sessionId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/games/notify/balance-to-agg`, {
        balance: balance,
        session_id: sessionId,
        player_id: userData.player_id
      });
      
      if (response.data.success) {
        console.log('Balance updated successfully with Game Aggregator');
      } else {
        console.warn('Failed to update balance with Game Aggregator');
      }
    } catch (error) {
      console.error('Error posting balance to game API:', error);
    }
  };

  // Handle game launch
  const handlePlayGame = async (game) => {
    try {
      if (!userData) {
        toast.error(t.pleaseLogin);
        return;
      }

      setShowGameLoader(true);
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await postBalanceToGameAPI(userData.balance, sessionId);

      const initResponse = await axios.post(`${API_BASE_URL}/api/games/games/init`, {
        game_uuid: game.gameId,
        player_id: userData.player_id,
        player_name: userData.username,
        currency: 'BDT',
        session_id: sessionId,
        return_url: window.location.href,
        language: "en",
        email: userData.email || "shihabmoni15@gmail.com",
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (initResponse.data.url) {
        setShowGameLoader(false);
        navigate('/single-game', { 
          state: { 
            gameUrl: initResponse.data.url,
            gameName: game.gameName,
            isDemo: false,
            sessionId: sessionId
          } 
        });
        localStorage.setItem("something_", initResponse.data.url);
      } else {
        throw new Error('Failed to initialize game');
      }
    } catch (error) {
      console.error('Error launching game:', error);
      setShowGameLoader(false);
      toast.error(t.gameLaunchError);
    }
  };

  // Handle demo game launch
  const handleTryDemo = async (game) => {
    try {
      setShowGameLoader(true);
      
      const initResponse = await axios.post(`${API_BASE_URL}/api/games/games/init-demo`, {
        game_uuid: game.gameId,
        device: "desktop",
        return_url: window.location.href,
        language: userData?.language || language.code || 'en'
      });

      if (initResponse.data.success && initResponse.data.url) {
        setShowGameLoader(false);
        navigate('/single-game', { 
          state: { 
            gameUrl: initResponse.data.url,
            gameName: game.gameName,
            isDemo: true
          } 
        });
      } else if (initResponse.data.url) {
        setShowGameLoader(false);
        navigate('/single-game', { 
          state: { 
            gameUrl: initResponse.data.url,
            gameName: game.gameName,
            isDemo: true
          } 
        });
      } else {
        throw new Error('Failed to initialize demo game');
      }
    } catch (error) {
      console.error('Error launching demo game:', error);
      setShowGameLoader(false);
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
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 bg-teal-300 rounded-full animate-bounce-leaf-4 flex items-center justify-center">
                <div className="h-1.5 w-1.5 border-2 border-white rounded-full animate-spin"></div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-3 w-3 bg-teal-300 rounded-full animate-bounce-leaf-4 flex items-center justify-center">
                <div className="h-1.5 w-1.5 border-2 border-white rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
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
        <p className="text-gray-500 text-sm mt-4">
          {t.contactUsIfIssue}
        </p>
      </div>
    );
  }

  const filteredGames = getFilteredGames();
  const gameEntries = Object.entries(filteredGames);
  const unfeaturedCounts = getUnfeaturedCountByCategory();
  
  return (
    <div className="w-full mx-auto pt-2 pb-3 sm:py-5">
      {showGameLoader && <FullScreenLoader t={t} />}
      <Toaster />
      <div className="w-full pt-2 md:pt-4 relative mb-3 md:mb-6">
        <div className="hidden md:block">
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-start">
            {allCategories.map((item, index) => (
              <CategoryItem 
                key={item._id || index} 
                item={item} 
                index={index} 
                selectedIndex={selectedCategoryIndex} 
                onClick={(idx) => {
                  setSelectedCategoryIndex(idx);
                }}
                unfeaturedCount={index === 0 ? 0 : getUnfeaturedCountForCategory(item.category)}
              />
            ))}
          </div>
        </div>
        <div className="md:hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y gap-3">
              {allCategories.map((item, index) => (
                <CategoryItem 
                  key={item._id || index} 
                  item={item} 
                  index={index} 
                  selectedIndex={selectedCategoryIndex} 
                  onClick={scrollTo}
                  isMobile={true}
                  unfeaturedCount={index === 0 ? 0 : getUnfeaturedCountForCategory(item.category)}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-4 gap-2">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === selectedCategoryIndex 
                    ? 'bg-cyan-400 w-4 shadow-[0_0_6px_rgba(10,200,200,0.7)]' 
                    : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
      {gameEntries.map(([category, gameList], index) => (
        gameList.length > 0 && (
          <React.Fragment key={category}>
            <GameGridSection 
              title={category} 
              gameList={gameList} 
              onPlayGame={handlePlayGame}
              onTryDemo={handleTryDemo}
              showLoadMore={selectedCategoryIndex === 0 ? category === t.allGamesCategory : true}
              onLoadMore={() => selectedCategoryIndex === 0 && category === t.allGamesCategory ? 
                loadMoreGames('all_games') : 
                loadMoreGames(allCategories[selectedCategoryIndex].category)}
              isLoadingMore={isLoadingMore}
              hasMoreGames={hasMoreGames(category)}
              categoryIcon={getCategoryIcon(category)}
              t={t}
              useSlider={selectedCategoryIndex === 0 && category !== t.allGamesCategory}
              remainingGamesCount={getRemainingGamesCount(category, gameList)}
              onViewAllCategory={() => handleViewAllCategory(category)}
              showRemainingBox={selectedCategoryIndex === 0 && category !== t.allGamesCategory && getRemainingGamesCount(category, gameList) > 0}
            />
            {selectedCategoryIndex === 0 && index === 2 && providers.length > 0 && (
              <ProvidersSlider providers={providers} t={t} />
            )}
          </React.Fragment>
        )
      ))}
      {gameEntries.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>{t.noGamesFound}</p>
        </div>
      )}
    </div>
  );
};

export default Mainpagegame;
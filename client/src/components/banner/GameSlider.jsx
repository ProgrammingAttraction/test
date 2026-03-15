import React, { useRef, useState, useEffect, useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useUser } from "../../context/UserContext";
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from "react-hot-toast";
import { LanguageContext } from '../../context/LanguageContext';

const base_url = import.meta.env.VITE_API_KEY_Base_URL;

const GameCard = ({ game, onPlayGame, t }) => {
  const { userData } = useUser();

  const handlePlayClick = () => {
    if (!userData) {
      toast.error(t?.pleaseLogin || 'Please login to play');
      return;
    }
    onPlayGame(game);
  };

  return (
    <div
      onClick={handlePlayClick}
      className="relative group overflow-hidden  transition-all duration-300  cursor-pointer"
    >
      {/* Image */}
      <div className="aspect-square overflow-hidden">
        <img
          src={game.imageUrl}
          alt={game.name || game.gameName}
          className="w-full h-full object-cover rounded-xl transition-transform duration-300 pointer-events-none"
        />
      </div>

      {/* Game Name */}
      <p className="mt-1 text-center text-[14px] md:text-sm font-medium text-gray-600 truncate px-1 py-1">
        {game.name || game.gameName}
      </p>
    </div>
  );
};

const GameSlider = () => {
  const scrollRef = useRef(null);

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const { userData } = useUser();
  const navigate = useNavigate();
  const { t, language } = useContext(LanguageContext);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await axios.get(`${base_url}/api/highlight-games`);
        const data = res.data.data;
        setGames(Array.isArray(data) ? data : data.games ?? []);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  // ── Drag handlers ──────────────────────────────────────────────
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // ── Post balance to Game API ───────────────────────────────────
  const postBalanceToGameAPI = async (balance, sessionId) => {
    try {
      const response = await axios.post(`${base_url}/api/games/notify/balance-to-agg`, {
        balance_bdt: balance,
        session_id: sessionId,
        player_id: userData.player_id,
      });
      if (!response.data.success) {
        console.warn('Failed to update balance with Game Aggregator');
      }
    } catch (error) {
      console.error('Error posting balance to game API:', error);
    }
  };

  // ── Handle real game launch ────────────────────────────────────
  const handlePlayGame = async (game) => {
    try {
      if (!userData) {
        toast.error(t?.pleaseLogin || 'Please login to play');
        return;
      }

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await postBalanceToGameAPI(userData.balance, sessionId);

      // Check for lobby
      let lobbyData = null;
      if (game.has_lobby) {
        const lobbyResponse = await axios.get(`${base_url}/api/games/games/lobby`, {
          params: { game_uuid: game.uuid, currency: 'BDT' },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (lobbyResponse.data.success && lobbyResponse.data.lobby) {
          lobbyData = lobbyResponse.data.lobby.lobbyData;
        }
      }

      // Init game session
      const initResponse = await axios.post(
        `${base_url}/api/games/games/init`,
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
            gameName: game.name || game.gameName,
            isDemo: false,
            sessionId,
          },
        });
        localStorage.setItem('something_', initResponse.data.url);
      } else {
        throw new Error('Failed to initialize game');
      }
    } catch (error) {
      console.error('Error launching game:', error);
      toast.error(t?.gameLaunchError || 'Failed to launch game');
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────
  if (loading) return (
    <div className="pt-4 flex gap-3 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex-none w-[calc(25%-9px)] md:w-40">
          <div className="aspect-square rounded-xl bg-gray-200 animate-pulse" />
          <div className="mt-1 h-4 rounded bg-gray-200 animate-pulse mx-2" />
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="pt-4 text-sm text-red-500">Failed to load games: {error}</div>
  );

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="pt-4 relative group max-w-full overflow-hidden">
      <Toaster/>

      {/* Left scroll button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Scrollable game list */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className={`flex gap-3 overflow-x-auto pb-2 cursor-grab active:cursor-grabbing ${
          isDragging ? 'scroll-auto' : 'scroll-smooth snap-x snap-mandatory'
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {games.map((game) => (
          <div
            key={game._id?.$oid ?? game._id ?? game.gameId}
            className="snap-start flex-none w-[calc(25%-9px)] md:w-40"
          >
            <GameCard
              game={game}
              onPlayGame={handlePlayGame}
              t={t}
            />
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hidden md:block"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default GameSlider;
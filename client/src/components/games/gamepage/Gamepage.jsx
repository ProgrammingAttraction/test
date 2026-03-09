import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../../components/header/Header";
import Gameheader from "../../header/Gameheader";
import Sidebar from "../../sidebar/Sidebar";
import GameTags from "./GameTags";
import { FaExpand, FaCompress, FaCheckCircle, FaExclamationTriangle, FaSync } from "react-icons/fa";
import axios from "axios";

const Gamepage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [gameUrl, setGameUrl] = useState(null);
  const [gameName, setGameName] = useState("");
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameTags, setGameTags] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sessionId, setSessionId] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [validating, setValidating] = useState(false);
  const [autoValidationRun, setAutoValidationRun] = useState(false);
  
  // State for controlling sidebar popup and active tab
  const [showPopup, setShowPopup] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('আমার অ্যাকাউন্ট');
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch game tags
  useEffect(() => {
    const fetchGameTags = async () => {
      try {
        // Get expand parameter from URL or use default
        const urlParams = new URLSearchParams(window.location.search);
        const expandParam = urlParams.get('expand') || 'false';
        const response = await fetch(`${API_BASE_URL}/api/games/game-tags?expand=${expandParam}`);
        if (response.ok) {
          const data = await response.json();
          setGameTags(data.tags || []);
        } else {
          console.error("Failed to fetch game tags");
        }
      } catch (error) {
        console.error("Error fetching game tags:", error);
      }
    };

    fetchGameTags();
  }, [API_BASE_URL]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // Load game data from location state or localStorage
  useEffect(() => {
    if (location.state?.gameUrl) {
      const { gameUrl, gameName, isDemo, sessionId } = location.state;
      setGameUrl(gameUrl);
      setGameName(gameName || "Game");
      setIsDemo(isDemo || false);
      setSessionId(sessionId || null);
      
      localStorage.setItem(
        "currentGame",
        JSON.stringify({
          gameUrl,
          gameName: gameName || "Game",
          isDemo: isDemo || false,
          sessionId: sessionId || null,
          timestamp: Date.now(),
        })
      );
      setLoading(false);
      return;
    }
    
    const savedGame = localStorage.getItem("currentGame");
    if (savedGame) {
      try {
        const gameData = JSON.parse(savedGame);
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        if (gameData.timestamp && gameData.timestamp > oneHourAgo) {
          setGameUrl(gameData.gameUrl);
          setGameName(gameData.gameName || "Game");
          setIsDemo(gameData.isDemo || false);
          setSessionId(gameData.sessionId || null);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem("currentGame");
          setError("Game session expired");
          setLoading(false);
          setTimeout(() => navigate("/"), 3000);
          return;
        }
      } catch {
        localStorage.removeItem("currentGame");
        setError("Invalid game data");
        setLoading(false);
        setTimeout(() => navigate("/"), 3000);
        return;
      }
    }
    setError("Game URL not found");
    setLoading(false);
    setTimeout(() => navigate("/"), 3000);
  }, [location, navigate]);

  // Handle page reload
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("isReloading", "true");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const isReloading = sessionStorage.getItem("isReloading");
    if (isReloading === "true") {
      sessionStorage.removeItem("isReloading");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Hide loader after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Self-validation function using Axios
  // const handleSelfValidation = async () => {
  //   if (!sessionId) {
  //     setValidationStatus({
  //       success: false,
  //       message: "No active session found for validation"
  //     });
  //     return;
  //   }

  //   setValidating(true);
  //   setValidationStatus(null);

  //   try {
  //     // Using Axios for the API call
  //     const response = await axios.post(
  //       `${API_BASE_URL}/api/games/self-validate`,
  //       `session_id=${sessionId}`,
  //       {
  //         headers: {
  //           "Content-Type": "application/x-www-form-urlencoded",
  //           "X-Merchant-Id": "152b223c2d757c1803f7c67229a505f7",
  //           "X-Timestamp": Math.floor(Date.now() / 1000).toString(),
  //           "X-Nonce": Math.random().toString(36).substring(2) + Date.now().toString(36),
  //           "X-Sign": "c3dd1adce9a276311dd60a12300c902941f47eba", // This should be generated securely
  //         }
  //       }
  //     );
  //  console.log(response)
  //     // Handle the response based on the provided format
  //     if (response.data.status === 200) {
  //       setValidationStatus({
  //         success: true,
  //         message: "API integration validated successfully!",
  //         log: response.data.log || []
  //       });
  //     } else {
  //       setValidationStatus({
  //         success: false,
  //         message: response.statusText || "Validation failed"
  //       });
  //     }
  //   } catch (err) {
  //     console.error("Validation error:", err);
  //     setValidationStatus({
  //       success: false,
  //       message: "Failed to perform validation: " + (err.response?.data?.message || err.message)
  //     });
  //   } finally {
  //     setValidating(false);
  //   }
  // };

  // // Auto-run validation when page loads with a valid session
  // useEffect(() => {
  //   if (sessionId && !autoValidationRun && !loading) {
  //     // Wait a moment for the iframe to load before validating
  //     const timer = setTimeout(() => {
  //       setAutoValidationRun(true);
  //       handleSelfValidation();
  //     }, 3000);
      
  //     return () => clearTimeout(timer);
  //   }
  // }, [sessionId, autoValidationRun, loading]);

  const handleIframeLoad = () => setIframeLoaded(true);
  
  const handleBackToGames = () => {
    localStorage.removeItem("currentGame");
    navigate("/");
  };
  
  const handleRefreshGame = () => {
    if (!gameUrl) return;
    setIframeLoaded(false);
    const iframe = document.querySelector(".game-iframe");
    if (iframe) iframe.src = iframe.src;
  };

  // Fullscreen functionality
  const toggleFullscreen = () => {
    const gameContainer = document.querySelector(".game-container");
    
    if (!document.fullscreenElement) {
      if (gameContainer.requestFullscreen) {
        gameContainer.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(err => console.error("Error attempting to enable fullscreen:", err));
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(err => console.error("Error attempting to exit fullscreen:", err));
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle tag click
  const handleTagClick = (tag) => {
    navigate(`/games?tag=${tag.name}`);
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading game...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="bg-gray-800/80 border border-gray-700 p-8 rounded-xl text-center max-w-md">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Game Not Available</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={handleBackToGames}
              className="bg-theme_color2 hover:bg-teal-700 text-white px-6 py-2 rounded-md"
            >
              Back to Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen font-anek bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header with dark glass morphism effect - hidden on mobile when in fullscreen mode */}
      {(!isMobile || !isFullscreen) && (
        <div className="hidden md:block">
          <Gameheader 
            className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700"
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            activeLeftTab={activeLeftTab}
            setActiveLeftTab={setActiveLeftTab}
          />
        </div>
      )}
      
      <div className="flex">
        {/* Fixed Sidebar with dark glass morphism - hidden on mobile */}
        {!isMobile && (
          <div className="hidden md:block">
            <Sidebar 
              showPopup={showPopup}
              setShowPopup={setShowPopup}
              activeLeftTab={activeLeftTab}
              setActiveLeftTab={setActiveLeftTab}
            />
          </div>
        )}

        {/* Scrollable Content */}
        <div className={`${isMobile ? 'w-full' : 'ml-0 md:ml-[330px] w-full'}`}>
          {/* Main content container */}
          <div className={`${isMobile ? 'mx-0' : 'mx-auto md:px-4 max-w-screen-xl'} md:py-[20px]`}>
            {/* Game box */}
            <div className="game-container border border-gray-800 bg-gradient-to-b from-gray-850 to-gray-900 shadow-[0_10px_30px_rgba(0,0,0,0.35)] overflow-hidden relative">
              {/* Top strip / meta info - hidden on mobile */}
              {!isMobile && (
                <div className="hidden md:flex items-center justify-between px-4 lg:px-5 py-3 border-b border-gray-700/60 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-sm md:text-xl font-semibold text-white drop-shadow-md">{gameName}</div>
                      <div className="text-[11px] md:text-sm text-teal-300/80 font-medium">
                        {isDemo ? "DEMO MODE" : "REAL MONEY MODE"}
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    {/* API Validation Status Indicator */}
                    {/* {sessionId && validationStatus && (
                      <span className={`text-[11px] px-2.5 py-1.5 rounded-md font-medium shadow-inner ${
                        validationStatus.success 
                          ? "bg-green-900/70 border border-green-700/30 text-green-300" 
                          : "bg-red-900/70 border border-red-700/30 text-red-300"
                      }`}>
                        {validationStatus.success ? "API VALIDATED" : "VALIDATION FAILED"}
                      </span>
                    )} */}
                    
                    {/* <span className="text-[11px] px-2.5 py-1.5 rounded-md bg-gradient-to-b from-gray-800 to-gray-900 border border-teal-700/30 text-teal-300 font-medium shadow-inner">
                      VOLATILITY <span className="text-teal-400">█████</span>
                    </span>
                    <span className="text-[11px] px-2.5 py-1.5 rounded-md bg-gradient-to-b from-purple-900 to-purple-950 border border-purple-700/30 text-purple-300 font-medium shadow-inner">
                      PROVIDER
                    </span> */}
                  </div>
                </div>
              )}

              {/* Iframe container */}
              <div 
                className="relative" 
                style={{ 
                  height: isMobile 
                    ? `calc(${windowHeight}px)` 
                    : "calc(100vh - 220px)" 
                }}
              >
                {gameUrl && (
                  <>
                    <iframe
                      src={gameUrl}
                      className="game-iframe"
                      frameBorder="0"
                      allowFullScreen
                      title={gameName}
                      onLoad={handleIframeLoad}
                      style={{
                        width: "100%",
                        height: "100%",
                        opacity: iframeLoaded ? 1 : 0,
                        position: "absolute",
                        inset: 0,
                        transition: "opacity 0.3s ease-in-out",
                      }}
                      allow="autoplay; encrypted-media; fullscreen"
                    />

                    {!iframeLoaded && (
      <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center">
      <div className="relative w-16 h-16 mb-4">
        {/* First Ring - Teal */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-3 border-gray-700 border-t-teal-500 rounded-full animate-spin"></div>
        {/* Second Ring - Purple */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-3 border-gray-700 border-t-teal-500 rounded-full animate-spin animation-delay-200"></div>
        {/* Third Ring - Amber */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-3 border-gray-700 border-t-teal-500 rounded-full animate-spin animation-delay-400"></div>
      </div>
      <p className="text-gray-300 text-lg font-[600] animate-pulse">
        Game is loading...
      </p>
    </div>
                    )}
                    
                    {/* Game controls */}
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      {/* Refresh button */}
                      {/* Fullscreen button */}
                      <button
                        onClick={toggleFullscreen}
                        className="bg-gray-900/70 md:flex hidden hover:bg-gray-800/90 backdrop-blur-sm p-2 rounded-lg border border-gray-700 transition-all duration-200 hover:scale-105"
                        aria-label="Toggle fullscreen"
                      >
                        {isFullscreen ? (
                          <FaCompress className="h-4 w-4 text-white" />
                        ) : (
                          <FaExpand className="h-4 w-4 text-white" />
                        )}
                      </button>

                      {/* Validation status indicator for mobile */}
                      {sessionId && validationStatus && isMobile && (
                        <div className={`p-2 rounded-lg border ${
                          validationStatus.success 
                            ? "bg-green-900/70 border-green-700/30" 
                            : "bg-red-900/70 border-red-700/30"
                        }`}>
                          {validationStatus.success ? (
                            <FaCheckCircle className="h-4 w-4 text-green-300" />
                          ) : (
                            <FaExclamationTriangle className="h-4 w-4 text-red-300" />
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Game tags - hidden on mobile when in fullscreen */}
            {(!isMobile || !isFullscreen) && gameTags.length > 0 && (
              <GameTags tags={gameTags} onTagClick={handleTagClick} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gamepage;
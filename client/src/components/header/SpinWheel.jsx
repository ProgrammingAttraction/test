import React, { useState, useEffect } from 'react';
import { FaTimes, FaCoins, FaSyncAlt, FaHistory, FaChartBar } from 'react-icons/fa';
import { IoClose } from "react-icons/io5";
import axios from 'axios';
import toast from 'react-hot-toast';
import compass from "../../assets/compass.png";
import confetti from 'canvas-confetti';
import spinner from "../../assets/spinner.png";
const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

const SpinWheel = ({ isOpen, onClose, userData }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [canSpin, setCanSpin] = useState(false);
  const [spinEligibility, setSpinEligibility] = useState(null);
  const [spinHistory, setSpinHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState(null);

  // Wheel segments with Taka amounts, colors and shadow colors
  const segments = [
    { amount: 1, color: '#FF6B6B', probability: 0.90, displayColor: '#FFFFFF', shadow: '0 0 20px rgba(255, 107, 107, 0.7)', name: 'Mini Prize' },
    { amount: 5, color: '#4ECDC4', probability: 0.6, displayColor: '#FFFFFF', shadow: '0 0 20px rgba(78, 205, 196, 0.7)', name: 'Small Prize' },
    { amount: 10, color: '#45B7D1', probability: 0.4, displayColor: '#FFFFFF', shadow: '0 0 20px rgba(69, 183, 209, 0.7)', name: 'Medium Prize' },
    { amount: 20, color: '#96CEB4', probability: 0, displayColor: '#FFFFFF', shadow: '0 0 20px rgba(150, 206, 180, 0.7)', name: 'Big Prize' },
    { amount: 50, color: '#DDA0DD', probability: 0, displayColor: '#FFFFFF', shadow: '0 0 20px rgba(221, 160, 221, 0.7)', name: 'Mega Prize' },
    { amount: 100, color: '#FFD700', probability: 0, displayColor: '#000000', shadow: '0 0 25px rgba(255, 215, 0, 0.8)', name: 'Jackpot' }
  ];

  // Confetti animation function
  const triggerConfetti = (amount) => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10004 };

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Launch confetti from different positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 }
      });
      
      // Additional confetti for larger wins
      if (amount >= 20) {
        confetti({
          ...defaults,
          particleCount: Math.floor(particleCount * 0.7),
          scalar: 1.2,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      }
      
      // Special confetti for jackpot
      if (amount === 100) {
        confetti({
          particleCount: 100,
          angle: 90,
          spread: 70,
          origin: { x: 0.5, y: 0.95 },
          colors: ['#FFD700', '#FFA500', '#FF8C00'],
          zIndex: 10004
        });
      }
    }, 250);
  };

  // Check spin eligibility when component opens
  useEffect(() => {
    if (isOpen && userData) {
      checkSpinEligibility();
      fetchSpinHistory();
      fetchSpinStats();
    }
  }, [isOpen, userData]);

  const checkSpinEligibility = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setCanSpin(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/user/spin-wheel/check-eligibility/${userData._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSpinEligibility(response.data.data);
        setCanSpin(response.data.data.canSpin);
      }
    } catch (error) {
      console.error('Error checking spin eligibility:', error);
      setCanSpin(false);
    }
  };

  const fetchSpinHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${API_BASE_URL}/user/spin-wheel/history/${userData._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSpinHistory(response.data.data.history);
      }
    } catch (error) {
      console.error('Error fetching spin history:', error);
    }
  };

  const fetchSpinStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${API_BASE_URL}/user/spin-wheel/stats/${userData._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching spin stats:', error);
    }
  };

  const spinWheel = async () => {
    if (!canSpin || isSpinning || !userData) return;

    setIsSpinning(true);
    setResult(null);

    const segmentAngle = 360 / segments.length;
    
    // Weighted random selection based on probability
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedSegment = 0;

    for (let i = 0; i < segments.length; i++) {
      cumulativeProbability += segments[i].probability;
      if (random <= cumulativeProbability) {
        selectedSegment = i;
        break;
      }
    }

    const baseRotation = 360 * 5;
    const targetAngle = 360 - (selectedSegment * segmentAngle + segmentAngle / 2);
    const finalRotation = baseRotation + targetAngle;
    setWheelRotation(finalRotation);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to spin the wheel');
        setIsSpinning(false);
        return;
      }

      const selectedAmount = segments[selectedSegment].amount;
      
      // Call the spin wheel API
      const response = await axios.post(
        `${API_BASE_URL}/user/spin-wheel`,
        { 
          userId: userData._id, 
          amount: selectedAmount 
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTimeout(() => {
        setIsSpinning(false);
        const winningSegment = segments[selectedSegment];
        setResult(winningSegment);
        setCanSpin(false);
        setSpinEligibility(prev => ({
          ...prev,
          canSpin: false,
          lastSpin: {
            amount: selectedAmount,
            result: `Won ৳${selectedAmount}`,
            spinDate: new Date()
          }
        }));
        
        // Trigger confetti animation
        triggerConfetti(selectedAmount);
        
        toast.success(`Congratulations! You won ৳${selectedAmount} Taka!`);
        
        // Refresh data
        fetchSpinHistory();
        fetchSpinStats();
        
        // Refresh user data to update balance
        if (window.fetchUserData) {
          window.fetchUserData();
        }
      }, 4500);

    } catch (error) {
      console.error('Spin wheel error:', error);
      setIsSpinning(false);
      toast.error(error.response?.data?.message || 'Failed to spin wheel');
    }
  };

  const resetSpin = () => {
    setWheelRotation(0);
    setResult(null);
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const segmentAngle = 360 / segments.length;

  return (
    <div 
      className="fixed inset-0 z-[10003] flex items-center justify-center p-4" 
      style={{ 
        backgroundColor: 'rgba(10, 25, 41, 0.95)', 
        backdropFilter: 'blur(4px)',
        boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.8)'
      }}
    >
      {/* Animated background shadows */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(120, 119, 198, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(119, 198, 255, 0.1) 0%, transparent 50%)',
          filter: 'blur(20px)'
        }}
      ></div>

      <div className="w-full max-w-md overflow-hidden relative">
        {/* Content */}
        <div className="p-4 md:p-6">


          <h1 className='text-[20px] md:text-[25px] font-[600] uppercase text-center text-green-500 mb-2 md:mb-2'>
            Spin and Win
          </h1>

          {spinEligibility && spinEligibility.canSpin && (
            <div className=" px-3 text-center">
              <p className="text-green-300 font-semibold text-sm md:text-base">
                🎉 You have a free spin waiting!
              </p>
              <p className="text-green-200 text-xs md:text-sm">Spin now to win up to ৳100!</p>
            </div>
          )}
          {/* Wheel Container with outer glow */}
          <div className="relative flex justify-center items-center mb-6 md:mb-8 p-4 md:p-8 rounded-3xl">
            <div className="relative" style={{ width: 'clamp(280px, 70vw, 320px)', height: 'clamp(280px, 70vw, 320px)' }}>
              {/* Wheel with enhanced shadow */}
              <div 
                className="w-full h-full rounded-full border-6 md:border-8 border-yellow-500 relative transition-transform duration-5000 overflow-hidden"
                style={{ 
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: isSpinning ? 'transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)' : 'none',
                  boxShadow: `
                    0 0 20px rgba(255, 215, 0, 0.4),
                    0 0 40px rgba(255, 215, 0, 0.2),
                    0 0 60px rgba(255, 215, 0, 0.1),
                    inset 0 0 15px rgba(255, 255, 255, 0.1)
                  `,
                  filter: isSpinning ? 'brightness(1.2)' : 'brightness(1)'
                }}
              >
                {/* Wheel segments with individual shadows */}
                {segments.map((segment, index) => {
                  const angle = segmentAngle * index;
                  
                  return (
                    <div
                      key={index}
                      className="absolute top-0 left-0 w-full h-full overflow-visible"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'center'
                      }}
                    >
                      {/* Segment wedge with shadow */}
                      <div
                        className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left transition-all duration-300"
                        style={{
                          backgroundColor: segment.color,
                          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          filter: 'brightness(1.1)',
                          boxShadow: isSpinning ? segment.shadow : 'none'
                        }}
                      ></div>
                      
                      {/* Segment Text with text shadow */}
                      <div 
                        className="absolute"
                        style={{ 
                          top: '30%',
                          left: '70%',
                          transform: `rotate(${segmentAngle / 1}deg)`,
                          transformOrigin: 'left center'
                        }}
                      >
                        <span 
                          className="font-bold text-base md:text-lg whitespace-nowrap transition-all duration-300"
                          style={{ 
                            color: segment.displayColor,
                            textShadow: `
                              1px 1px 3px rgba(0,0,0,0.8),
                              0 0 8px ${segment.color.replace('0.7', '0.4')}
                            `,
                            display: 'block',
                            transform: 'rotate(90deg) translateY(-8px)',
                            filter: isSpinning ? 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' : 'none'
                          }}
                        >
                          ৳{segment.amount}
                        </span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Center circle with enhanced shadow */}
                <div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-24 md:h-24 bg-gray-900 rounded-full border-3 md:border-4 border-yellow-500 flex items-center justify-center z-10 transition-all duration-300"
                  style={{
                    boxShadow: `
                      0 0 20px rgba(255, 215, 0, 0.6),
                      0 0 40px rgba(255, 215, 0, 0.3),
                      inset 0 0 15px rgba(0, 0, 0, 0.5)
                    `,
                    filter: isSpinning ? 'brightness(1.3) drop-shadow(0 0 15px rgba(255,215,0,0.8))' : 'brightness(1)'
                  }}
                >
                  <div 
                    className="w-14 h-14 md:w-20 md:h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center transition-all duration-300"
                    style={{
                      boxShadow: `
                        inset 0 3px 12px rgba(255, 255, 255, 0.3),
                        inset 0 -3px 12px rgba(0, 0, 0, 0.3),
                        0 0 15px rgba(255, 215, 0, 0.5)
                      `
                    }}
                  >
                    <FaCoins 
                      className="text-yellow-800 text-lg md:text-2xl transition-all duration-300" 
                      style={{
                        filter: isSpinning ? 'drop-shadow(0 0 8px rgba(255,255,255,0.7))' : 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Segment dividers with glow */}
                {segments.map((_, index) => {
                  const angle = segmentAngle * index;
                  return (
                    <div
                      key={`divider-${index}`}
                      style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'bottom center'
                      }}
                    >
                      <div 
                        className="w-1 h-full transition-all duration-300"
                        style={{
                          background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)',
                          boxShadow: isSpinning ? '0 0 8px rgba(255,255,255,0.8)' : '0 0 4px rgba(255,255,255,0.3)'
                        }}
                      ></div>
                    </div>
                  );
                })}
              </div>

              {/* Pointer (Pin) with enhanced shadow and glow */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 md:-translate-y-2 z-20">
                <div className="flex flex-col items-center">
                  <div 
                    className="transition-all duration-300"
                    style={{
                      filter: isSpinning ? 'drop-shadow(0 0 12px rgba(255, 0, 0, 0.7)) brightness(1.3)' : 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.5))'
                    }}
                  >
                    <img 
                      className='w-[35px] md:w-[50px] rotate-[135deg] transition-transform duration-300' 
                      src={compass} 
                      alt="pointer" 
                      style={{
                        filter: isSpinning ? 'hue-rotate(180deg)' : 'none'
                      }}
                    />
                  </div>
                  {/* Pointer shadow effect */}
                  <div 
                    className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full mt-1"
                    style={{
                      boxShadow: '0 0 15px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.4)',
                      filter: isSpinning ? 'brightness(1.5)' : 'brightness(1)'
                    }}
                  ></div>
                </div>
              </div>

              {/* Spin Button in center */}
              <button
                onClick={spinWheel}
                disabled={!canSpin || isSpinning}
                className={`absolute top-1/2 left-1/2 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-30 w-14 h-14 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
                  !canSpin || isSpinning 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 active:scale-95'
                }`}
                style={{
                  border: '2px solid #22C55E',
                  boxShadow: `
                    0 0 15px rgba(34, 197, 94, 0.6),
                    0 0 30px rgba(34, 197, 94, 0.3),
                    inset 0 3px 8px rgba(255, 255, 255, 0.3),
                    inset 0 -3px 8px rgba(0, 0, 0, 0.3)
                  `,
                  filter: !canSpin || isSpinning ? 'grayscale(0.5) brightness(0.7)' : 'none'
                }}
              >
                {isSpinning ? (
                <img src={spinner}         className="animate-spin text-base md:text-xl transition-all duration-300"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.8))'
                    }}/>
                ) : (
                  <div className="text-center">
                    <div className="font-bold text-white text-xs md:text-sm">SPIN</div>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Action Buttons Container */}
          <div className="flex justify-center space-x-3 md:space-x-4 mb-4 md:mb-6">
            {/* Spin Button */}
            <button
              onClick={spinWheel}
              disabled={!canSpin || isSpinning}
              className={`px-6 py-2 md:px-8 md:py-3 rounded-full cursor-pointer font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center ${
                !canSpin || isSpinning
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105 active:scale-95'
              }`}
              style={{
                boxShadow: !canSpin || isSpinning 
                  ? 'none' 
                  : '0 3px 12px rgba(34, 197, 94, 0.5), 0 0 15px rgba(34, 197, 94, 0.3)',
                border: '2px solid #22C55E',
                minWidth: '100px'
              }}
            >
              {isSpinning ? (
                <>
                  <span className="text-sm">Spinning...</span>
                </>
              ) : (
                'SPIN'
              )}
            </button>

            {/* Cancel Button */}
            <button
              onClick={onClose}
              disabled={isSpinning}
              className={`px-6 py-2 md:px-8 md:py-3 rounded-full cursor-pointer font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center ${
                isSpinning
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 hover:scale-105 active:scale-95'
              }`}
              style={{
                boxShadow: isSpinning
                  ? 'none'
                  : '0 3px 12px rgba(239, 68, 68, 0.5), 0 0 15px rgba(239, 68, 68, 0.3)',
                border: '2px solid #EF4444',
                minWidth: '100px'
              }}
            >
              Close
            </button>
          </div>

          {/* Result Display */}
          {result && (
            <div className="mb-4 p-3 md:p-4rounded-2xl text-center animate-pulse">
              <h3 className="text-xl md:text-2xl font-bold text-green-300 mb-1 md:mb-2">Congratulations! 🎉</h3>
              <p className="text-white text-sm md:text-lg">You won</p>
              <div className="text-2xl md:text-4xl font-bold text-yellow-300 my-1 md:my-2">৳{result.amount}</div>
              <p className="text-green-300 text-sm md:text-base">{result.name}</p>
            </div>
          )}

          {/* Spin Eligibility Message */}
          {spinEligibility && !spinEligibility.canSpin && !result && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg text-center">
              <p className="text-blue-300 font-semibold text-sm md:text-base">
                {spinEligibility.nextSpinTime 
                  ? `Next spin available in ${spinEligibility.nextSpinTime}`
                  : 'Come back tomorrow for your next free spin!'
                }
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Floating particles/glow effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: Math.random() * 80 + 30 + 'px',
              height: Math.random() * 80 + 30 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              background: `radial-gradient(circle, ${segments[i % segments.length].color.replace(')', ', 0.1)').replace('rgb', 'rgba')}, transparent 70%)`,
              filter: 'blur(15px)',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 10 + 10 + 's'
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default SpinWheel;
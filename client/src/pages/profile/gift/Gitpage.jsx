import React, { useState, useEffect, useContext } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useUser } from '../../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from "react-icons/md";
import axios from 'axios';
import { LanguageContext } from '../../../context/LanguageContext';
import { GlobeAltIcon } from '@heroicons/react/24/solid';

// --------------level-image---------------------
import medal_img from "../../../assets/level/silver.png"
import silver_img from "../../../assets/level/badge.png"
import gold_img from "../../../assets/level/medal.png"
import diamond_img from "../../../assets/level/diamond.png"
import platinum_img from "../../../assets/level/platinum.png"

const Gitpage = () => {
  const { t, changeLanguage, language } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const [editableUsername, setEditableUsername] = useState(userData?.username || '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [currentLoginPassword, setCurrentLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [feedback, setFeedback] = useState({
    type: '',
    message: '',
    field: ''
  });
  const [activeTab, setActiveTab] = useState('available');
  const [bonusData, setBonusData] = useState(null);
  const [levelBonusLoading, setLevelBonusLoading] = useState(false);
  const [availableLevelBonuses, setAvailableLevelBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [monthlyTimeLeft, setMonthlyTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const navigate = useNavigate();
  
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Level configuration
  const levels = [
    { 
      name: t.levelBronze, 
      threshold: 0, 
      icon: medal_img,
      color: 'from-amber-700 to-amber-900',
      progressColor: 'bg-amber-500',
      bgColor: 'bg-amber-800'
    },
    { 
      name: t.levelSilver, 
      threshold: 10000, 
      icon: silver_img,
      color: 'from-gray-400 to-gray-600',
      progressColor: 'bg-gray-300',
      bgColor: 'bg-gray-600'
    },
    { 
      name: t.levelGold, 
      threshold: 30000, 
      icon: gold_img,
      color: 'from-yellow-500 to-yellow-700',
      progressColor: 'bg-yellow-400',
      bgColor: 'bg-yellow-700'
    },
    { 
      name: t.levelPlatinum, 
      threshold: 100000, 
      icon: platinum_img,
      color: 'from-cyan-400 to-cyan-600',
      progressColor: 'bg-cyan-300',
      bgColor: 'bg-cyan-700'
    },
    { 
      name: t.levelDiamond, 
      threshold: 500000, 
      icon: diamond_img,
      color: 'from-blue-500 to-purple-600',
      progressColor: 'bg-gradient-to-r from-blue-400 to-purple-500',
      bgColor: 'bg-gradient-to-r from-theme_color2 to-purple-700'
    }
  ];

  // State for mobile number alert
  const [showMobileAlert, setShowMobileAlert] = useState(false);
  const [alertContext, setAlertContext] = useState('');

  useEffect(() => {
    fetchBonusData();
    // Set up interval to check bonus status every minute
    const interval = setInterval(fetchBonusData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (userData?._id && activeTab === 'level') {
      fetchLevelBonusInfo();
    }
  }, [userData, activeTab]);

  // Calculate next Tuesday
  const getNextTuesday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
    
    // Calculate days until next Tuesday
    let daysUntilTuesday;
    if (dayOfWeek <= 2) {
      // If today is Sunday (0), Monday (1), or Tuesday (2)
      daysUntilTuesday = 2 - dayOfWeek;
    } else {
      // If today is Wednesday to Saturday
      daysUntilTuesday = 2 + (7 - dayOfWeek);
    }
    
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);
    nextTuesday.setHours(0, 0, 0, 0); // Set to start of day
    
    return nextTuesday;
  };

  // Calculate next 4th day of month
  const getNext4thDay = () => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    let next4thDay;
    
    if (currentDay < 4) {
      // If we haven't passed the 4th this month
      next4thDay = new Date(currentYear, currentMonth, 4);
    } else {
      // If we've passed the 4th, go to next month's 4th
      next4thDay = new Date(currentYear, currentMonth + 1, 4);
    }
    
    next4thDay.setHours(0, 0, 0, 0); // Set to start of day
    return next4thDay;
  };

  // Get next available dates
  const nextWeeklyBonus = getNextTuesday();
  const nextMonthlyBonus = getNext4thDay();

  // Calculate time until next bonus with live updates
  const calculateTimeLeft = (targetDate) => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    const now = new Date();
    const target = new Date(targetDate);
    const difference = target - now;
    
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000)
    };
  };

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      setWeeklyTimeLeft(calculateTimeLeft(nextWeeklyBonus));
      setMonthlyTimeLeft(calculateTimeLeft(nextMonthlyBonus));
    };

    // Update immediately
    updateCountdown();

    // Set up interval for live countdown
    const countdownInterval = setInterval(updateCountdown, 1000);

    return () => clearInterval(countdownInterval);
  }, [nextWeeklyBonus, nextMonthlyBonus]);

  // Format number based on language
  const formatNumber = (number) => {
    if (number === undefined || number === null) return language.code === 'bn' ? '০' : '0';
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US').format(number);
  };

  // Format time unit to always show 2 digits
  const formatTimeUnit = (unit) => {
    return unit < 10 ? `0${unit}` : unit;
  };

  // Format balance with locale-specific formatting
  const formatBalance = (amount) => {
    if (amount === undefined || amount === null) return language.code === 'bn' ? '০.০০' : '0.00';
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', {
      minimumFractionDigits: 2
    }).format(amount.toFixed(2));
  };

  // Format date based on language
  const formatDate = (dateString) => {
    if (!dateString) return t.na;
    const date = new Date(dateString);
    return date.toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Check mobile number before actions
  const checkMobileBeforeAction = (actionType) => {
    if (!userData?.phone) {
      setShowMobileAlert(true);
      setAlertContext(actionType);
      setFeedback({
        type: 'error',
        message: t.bonusMobileRequired,
        field: 'levelBonus'
      });
      return false;
    }
    return true;
  };

  // Check if weekly bonus is available (every Tuesday)
  const isWeeklyBonusAvailable = () => {
    const today = new Date();
    return today.getDay() === 2; // 2 = Tuesday
  };

  // Check if monthly bonus is available (every 4th day of month)
  const isMonthlyBonusAvailable = () => {
    const today = new Date();
    return today.getDate() === 4;
  };

  const fetchBonusData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${base_url}/user/bonus-info/${userData._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setBonusData(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || t.bonusFetchError);
      setLoading(false);
    }
  };

  const fetchLevelBonusInfo = async () => {
    if (!userData?._id) {
      console.log('No user ID available for fetching level bonus info');
      return;
    }

    try {
      setLevelBonusLoading(true);
      const response = await axios.get(`${base_url}/user/level-bonus-info/${userData._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        let bonuses = response.data.data?.availableBonuses || [];
        
        // Fallback to levelProgress if API returns no bonuses
        if (bonuses.length === 0 && userData?.levelInfo?.levelProgress) {
          bonuses = userData.levelInfo.levelProgress
            .filter(level => level.isAchieved && !level.bonusClaimed)
            .map(level => ({
              levelName: level.level,
              bonusAmount: level.bonus,
              threshold: level.threshold
            }));
        }

        setAvailableLevelBonuses(bonuses);
        if (bonuses.length === 0) {
          setFeedback({
            type: 'info',
            message: t.noAvailableLevelBonuses,
            field: 'levelBonus'
          });
        }
      } else {
        setAvailableLevelBonuses([]);
        setFeedback({
          type: 'error',
          message: response.data.message || t.levelBonusFetchError,
          field: 'levelBonus'
        });
      }
    } catch (error) {
      if (userData?.levelInfo?.levelProgress) {
        const bonuses = userData.levelInfo.levelProgress
          .filter(level => level.isAchieved && !level.bonusClaimed)
          .map(level => ({
            levelName: level.level,
            bonusAmount: level.bonus,
            threshold: level.threshold
          }));
        setAvailableLevelBonuses(bonuses);
      } else {
        setAvailableLevelBonuses([]);
        setFeedback({
          type: 'error',
          message: error.response?.data?.message || t.levelBonusFetchError,
          field: 'levelBonus'
        });
      }
    } finally {
      setLevelBonusLoading(false);
    }
  };

  const handleClaimLevelBonus = async (levelName) => {
    if (!checkMobileBeforeAction('claimBonus')) {
      return;
    }

    try {
      setLevelBonusLoading(true);
      const response = await axios.post(`${base_url}/user/claim-level-bonus/${userData._id}`, {
        levelName
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: response.data.message || t.levelBonusClaimSuccess,
          field: 'levelBonus'
        });
        await fetchLevelBonusInfo();
        await fetchUserData();
      } else {
        setFeedback({
          type: 'error',
          message: response.data.message || t.levelBonusClaimError,
          field: 'levelBonus'
        });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || t.levelBonusClaimError,
        field: 'levelBonus'
      });
    } finally {
      setLevelBonusLoading(false);
    }
  };

  const claimWeeklyBonus = async () => {
    try {
      const response = await axios.post(`${base_url}/user/claim-weekly-bonus/${userData._id}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFeedback({
        type: 'success',
        message: response.data.message || t.weeklyBonusClaimSuccess,
        field: 'weeklyBonus'
      });
      fetchBonusData();
      fetchUserData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || t.weeklyBonusClaimError,
        field: 'weeklyBonus'
      });
    }
  };

  const claimMonthlyBonus = async () => {
    try {
      const response = await axios.post(`${base_url}/user/claim-monthly-bonus/${userData._id}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFeedback({
        type: 'success',
        message: response.data.message || t.monthlyBonusClaimSuccess,
        field: 'monthlyBonus'
      });
      fetchBonusData();
      fetchUserData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || t.monthlyBonusClaimError,
        field: 'monthlyBonus'
      });
    }
  };

  // Calculate user account age in days
  const calculateAccountAge = () => {
    if (!userData?.createdAt) return 0;
    
    const accountCreationDate = new Date(userData.createdAt);
    const currentDate = new Date();
    const timeDiff = currentDate - accountCreationDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    return daysDiff;
  };

  // Calculate user's current level and progress
  const calculateLevelData = () => {
    const lifetimeDeposit = userData?.lifetime_bet || 0;
    
    let currentLevel = levels[0];
    let nextLevel = levels[1];
    
    for (let i = levels.length - 1; i >= 0; i--) {
      if (lifetimeDeposit >= levels[i].threshold) {
        currentLevel = levels[i];
        nextLevel = i < levels.length - 1 ? levels[i + 1] : null;
        break;
      }
    }
    
    let progressPercentage = 0;
    if (nextLevel) {
      const range = nextLevel.threshold - currentLevel.threshold;
      const progress = lifetimeDeposit - currentLevel.threshold;
      progressPercentage = Math.min(100, Math.round((progress / range) * 100));
    } else {
      progressPercentage = 100;
    }
    
    return {
      currentLevel,
      nextLevel,
      progressPercentage,
      lifetimeDeposit
    };
  };

  const accountAgeInDays = calculateAccountAge();
  const levelData = calculateLevelData();

  // Available bonuses data with completion status
  const availableBonuses = [
    {
      id: 'first-deposit',
      title: t.firstDepositBonus,
      description: t.firstDepositBonusDesc,
      amount: '3%',
      isNew: true,
      isAvailable: userData?.bonusInfo?.firstDepositBonusClaimed === false,
      isCompleted: userData?.bonusInfo?.firstDepositBonusClaimed === true,
      terms: t.firstDepositBonusTerms
    },
    {
      id: 'special-bonus',
      title: t.specialBonus,
      description: t.specialBonusDesc,
      amount: '150%',
      isNew: true,
      isAvailable: (userData?.total_deposit === 0 || 
                  (userData?.bonusInfo?.activeBonuses?.length === 0 && accountAgeInDays <= 3)) && 
                  !userData?.bonusInfo?.specialBonusClaimed,
      isCompleted: userData?.bonusInfo?.specialBonusClaimed === true,
      terms: t.specialBonusTerms
    },
  ];

  // Filter only available or completed bonuses
  const filteredBonuses = availableBonuses.filter(bonus => 
    bonus.isAvailable || bonus.isCompleted
  );

  // Claimed bonuses history
  const claimedBonuses = userData?.bonusInfo?.claimedBonuses || [];

  // Language toggle
  const toggleLanguage = () => {
    changeLanguage(
      language.code === 'bn'
        ? { code: 'en', name: 'English', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/US.svg' }
        : { code: 'bn', name: 'বাংলা', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/BD.svg' }
    );
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen font-anek text-white">
        <header className="bg-gray-800 border-b border-gray-700 py-3 px-3 sticky top-0 z-10">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="mr-3 p-1 rounded-full text-cyan-500 cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <MdArrowBackIosNew/>
              </button>
              <h1 className="text-base font-bold text-gray-200">{t.giftCenter}</h1>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 text-sm"
            >
              <GlobeAltIcon className="h-4 w-4" />
              <span>{language.code === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>
        </header>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen font-anek text-white">
        <header className="bg-gray-800 border-b border-gray-700 py-3 px-3 sticky top-0 z-10">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="mr-3 p-1 rounded-full text-cyan-500 cursor-pointer hover:bg-gray-700 transition-colors"
              >
                <MdArrowBackIosNew/>
              </button>
              <h1 className="text-base font-bold text-gray-200">{t.giftCenter}</h1>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 text-sm"
            >
              <GlobeAltIcon className="h-4 w-4" />
              <span>{language.code === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>
        </header>
        <div className="text-center py-4 text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen font-anek text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-3 px-3 sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="mr-3 p-1 rounded-full text-cyan-500 cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <MdArrowBackIosNew/>
            </button>
            <h1 className="text-base font-bold text-gray-200">{t.giftCenter}</h1>
          </div>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 text-sm"
          >
            <GlobeAltIcon className="h-4 w-4" />
            <span>{language.code === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-3 py-4">
        {/* Weekly and Monthly Bonus Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4 mb-6">
          {/* Weekly Bonus Card */}
          <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 rounded-[5px] border border-purple-600 shadow-lg relative overflow-hidden">
            <div className='flex flex-col justify-center items-center gap-3'>
              <div className="w-full bg-black/20 p-2 rounded-lg border border-purple-500/30 relative z-10">
                {isWeeklyBonusAvailable() && bonusData?.weekly?.bonusAmount > 0 ? (
                  <div>
                    <button 
                      onClick={claimWeeklyBonus}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 rounded text-sm mb-2 transition-colors duration-200"
                    >
                      {t.collectBonus || 'Collect Bonus'} - ৳{bonusData.weekly.bonusAmount.toFixed(2)}
                    </button>
                    <p className="text-xs text-green-400 text-center">
                      {t.availableToday || 'Available today!'}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-purple-300 mb-1 text-center">{t.nextWeeklyBonus}</p>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="bg-purple-800/50 p-1 rounded">
                        <div className="text-white font-bold text-sm">{formatTimeUnit(weeklyTimeLeft.days)}</div>
                        <div className="text-purple-300 text-[10px]">{t.days}</div>
                      </div>
                      <div className="bg-purple-800/50 p-1 rounded">
                        <div className="text-white font-bold text-sm">{formatTimeUnit(weeklyTimeLeft.hours)}</div>
                        <div className="text-purple-300 text-[10px]">{t.hours}</div>
                      </div>
                      <div className="bg-purple-800/50 p-1 rounded">
                        <div className="text-white font-bold text-sm">{formatTimeUnit(weeklyTimeLeft.minutes)}</div>
                        <div className="text-purple-300 text-[10px]">{t.minutes}</div>
                      </div>
                      <div className="bg-purple-800/50 p-1 rounded">
                        <div className="text-white font-bold text-sm">{formatTimeUnit(weeklyTimeLeft.seconds)}</div>
                        <div className="text-purple-300 text-[10px]">{t.seconds}</div>
                      </div>
                    </div>
                  </>
                )}
                <p className="text-xs text-purple-400 text-center mt-2">
                  {t.availableEveryTuesday || 'Available every Tuesday'}
                </p>
                {bonusData?.weekly?.bonusAmount <= 0 && (
                  <p className="text-xs text-yellow-400 text-center mt-1">
                    {t.placeBetsToEarn || 'Place bets to earn weekly bonus'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Bonus Card */}
          <div className="bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 p-4 rounded-[5px] border border-amber-600 shadow-lg relative overflow-hidden">    
            <div className='flex flex-col justify-center items-center gap-3'>
              <div className="w-full bg-black/20 p-2 rounded-lg border border-amber-500/30 relative z-10">
                {isMonthlyBonusAvailable() && bonusData?.monthly?.bonusAmount > 0 ? (
                  <div>
                    <button 
                      onClick={claimMonthlyBonus}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 px-3 rounded text-sm mb-2 transition-colors duration-200"
                    >
                      {t.collectBonus || 'Collect Bonus'} - ৳{bonusData.monthly.bonusAmount.toFixed(2)}
                    </button>
                    <p className="text-xs text-green-400 text-center">
                      {t.availableToday || 'Available today!'}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-amber-300 mb-1 text-center">{t.nextMonthlyBonus}</p>
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div className="bg-amber-800/50 p-1 rounded">
                        <div className="text-white font-bold text-sm">{formatTimeUnit(monthlyTimeLeft.days)}</div>
                        <div className="text-amber-300 text-[10px]">{t.days}</div>
                      </div>
                      <div className="bg-amber-800/50 p-1 rounded">
                        <div className="text-white font-bold text-sm">{formatTimeUnit(monthlyTimeLeft.hours)}</div>
                        <div className="text-amber-300 text-[10px]">{t.hours}</div>
                      </div>
                      <div className="bg-amber-800/50 p-1 rounded">
                        <div className="text-white font-bold text-sm">{formatTimeUnit(monthlyTimeLeft.minutes)}</div>
                        <div className="text-amber-300 text-[10px]">{t.minutes}</div>
                      </div>
                      <div className="bg-amber-800/50 p-1 rounded">
                        <div className="text-white font-bold text-sm">{formatTimeUnit(monthlyTimeLeft.seconds)}</div>
                        <div className="text-amber-300 text-[10px]">{t.seconds}</div>
                      </div>
                    </div>
                  </>
                )}
                <p className="text-xs text-amber-400 text-center mt-2">
                  {t.availableEvery4th || 'Available every 4th of the month'}
                </p>
                {bonusData?.monthly?.bonusAmount <= 0 && (
                  <p className="text-xs text-yellow-400 text-center mt-1">
                    {t.placeBetsToEarn || 'Place bets to earn monthly bonus'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reward Center Section */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-cyan-400">{t.giftCenter}</h3>
          <div className="bg-gray-700 p-4 rounded shadow border border-gray-600">
            <div className="flex gap-2 mb-4 overflow-x-auto">
              <button
                className={`px-3 py-1 rounded cursor-pointer text-xs md:text-sm ${activeTab === 'available' ? 'bg-cyan-500 text-gray-900' : 'bg-gray-800'}`}
                onClick={() => setActiveTab('available')}
              >
                {t.availableRewards}
              </button>
              <button
                className={`px-3 py-1 rounded text-xs md:text-sm cursor-pointer ${activeTab === 'claimed' ? 'bg-cyan-500 text-gray-900' : 'bg-gray-800'}`}
                onClick={() => setActiveTab('claimed')}
              >
                {t.claimedRewards}
              </button>
              <button
                className={`px-3 py-1 rounded text-xs md:text-sm cursor-pointer ${activeTab === 'history' ? 'bg-cyan-500 text-gray-900' : 'bg-gray-800'}`}
                onClick={() => setActiveTab('history')}
              >
                {t.rewardsHistory}
              </button>
              <button
                className={`px-3 py-1 rounded text-sm cursor-pointer ${activeTab === 'level' ? 'bg-cyan-500 text-gray-900' : 'bg-gray-800'}`}
                onClick={() => setActiveTab('level')}
              >
                {t.levelBonus}
              </button>
            </div>

            {feedback.field && ['weeklyBonus', 'monthlyBonus', 'levelBonus'].includes(feedback.field) && (
              <div className={`mb-3 p-3 rounded text-sm ${
                feedback.type === 'success' ? 'bg-green-900 text-green-100' : 
                feedback.type === 'error' ? 'bg-red-900 text-red-100' : 
                'bg-blue-900 text-blue-100'
              }`}>
                {feedback.message}
              </div>
            )}

            {activeTab === 'available' && accountAgeInDays <= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBonuses.map((bonus) => (
                  <div key={bonus.id} className="border border-gray-600 rounded-lg p-4 bg-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{bonus.title}</h4>
                      {bonus.isNew && (
                        <span className="bg-cyan-500 text-gray-900 text-xs px-2 py-1 rounded">{t.new}</span>
                      )}
                      {bonus.isCompleted && (
                        <span className="bg-green-500 text-gray-900 text-xs px-2 py-1 rounded">{t.completed}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{bonus.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-400 font-bold">{bonus.amount}</span>
                      <div>
                        {bonus.isCompleted ? (
                          <span className="text-green-500 text-sm">{t.alreadyClaimed}</span>
                        ) : (
                          <span className="text-yellow-500 text-sm">{t.available}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{bonus.terms}</p>
                  </div>
                ))}
                {filteredBonuses.length === 0 && (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    {t.noAvailableRewards}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'available' && accountAgeInDays > 3 && (
              <div className="text-center py-8 text-gray-400">
                {t.newAccountRewards}
              </div>
            )}

            {activeTab === 'claimed' && (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-600">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="py-2 px-4 text-left text-sm border-b border-gray-600">{t.reward}</th>
                      <th className="py-2 px-4 text-left text-sm border-b border-gray-600">{t.amount}</th>
                      <th className="py-2 px-4 text-left text-sm border-b border-gray-600">{t.status}</th>
                      <th className="py-2 px-4 text-left text-sm border-b border-gray-600">{t.date}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claimedBonuses.length > 0 ? (
                      claimedBonuses.map((bonus, index) => (
                        <tr key={index}>
                          <td className="py-2 px-4 border-b border-gray-600">
                            {bonus.type === 'first-deposit' ? t.firstDepositBonus : 
                             bonus.type === 'special-bonus' ? t.specialBonus : 
                             t.signupBonus}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-600">
                            {bonus.type === 'first-deposit' ? '3%' : 
                             bonus.type === 'special-bonus' ? '150%' : 
                             '৳ 500'}
                          </td>
                          <td className="py-2 px-4 border-b border-gray-600">
                            <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs">
                              {t.completed}
                            </span>
                          </td>
                          <td className="py-2 px-4 border-b border-gray-600">
                            {formatDate(bonus.claimedAt)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-4 text-center text-gray-500">
                          {t.noClaimedRewards}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-600">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="py-2 px-4 text-left text-sm border-b border-gray-600">{t.date}</th>
                      <th className="py-2 px-4 text-left text-sm border-b border-gray-600">{t.reward}</th>
                      <th className="py-2 px-4 text-left text-sm border-b border-gray-600">{t.amount}</th>
                      <th className="py-2 px-4 text-left text-sm border-b border-gray-600">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claimedBonuses.length > 0 ? (
                      [...claimedBonuses]
                        .sort((a, b) => new Date(b.claimedAt) - new Date(a.claimedAt))
                        .map((bonus, index) => (
                          <tr key={index}>
                            <td className="py-2 px-4 border-b border-gray-600">
                              {formatDate(bonus.claimedAt)}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-600">
                              {bonus.type === 'first-deposit' ? t.firstDepositBonus : 
                               bonus.type === 'special-bonus' ? t.specialBonus : 
                               t.signupBonus}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-600">
                              {bonus.type === 'first-deposit' ? '3%' : 
                               bonus.type === 'special-bonus' ? '150%' : 
                               '৳ 500'}
                            </td>
                            <td className="py-2 px-4 border-b border-gray-600">
                              <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded text-xs">
                                {t.completed}
                              </span>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-4 text-center text-gray-500">
                          {t.noRewardHistory}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'level' && (
              <div>
                <div className="flex flex-col md:flex-row gap-6 mb-6">
                  <div className="bg-gray-800 bg-opacity-80 p-3 rounded-xl shadow-lg border border-gray-700 w-full md:w-1/3">
                    <h4 className="text-sm font-semibold text-cyan-300 mb-2">{t.currentLevel}</h4>
                    <div className="flex items-center justify-between">
                      <div className="relative w-16 h-16">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="#4B5563"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845
                              a 15.9155 15.9155 0 0 1 0 31.831
                              a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="url(#progressGradient)"
                            strokeWidth="2"
                            strokeDasharray={`${levelData.progressPercentage}, 100`}
                          />
                          <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#3B82F6" />
                              <stop offset="100%" stopColor="#A855F7" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <img 
                            src={levelData.currentLevel.icon} 
                            alt={levelData.currentLevel.name} 
                            className="w-8 h-8"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <h3 className="text-lg font-bold text-cyan-300">
                          {levelData.currentLevel.name}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {t.totalDeposit}: {formatNumber(levelData.lifetimeDeposit)} {language.code === 'bn' ? '৳' : '$'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {levelData.nextLevel ? 
                            `${t.next}: ${levelData.nextLevel.name} (${formatNumber(levelData.nextLevel.threshold)} ${language.code === 'bn' ? '৳' : '$'})` : 
                            t.maxLevel}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow border w-full md:w-2/3 border-gray-600">
                    <h4 className="font-medium mb-3 text-cyan-400">{t.availableLevelBonuses}</h4>
                    {levelBonusLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-cyan-500 border-t-transparent"></div>
                      </div>
                    ) : availableLevelBonuses.length > 0 ? (
                      <div className="space-y-3">
                        {availableLevelBonuses.map((bonus, index) => {
                          const level = levels.find(l => l.name.toLowerCase() === bonus.levelName.toLowerCase()) || levels[0];
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={level.icon} 
                                  alt={bonus.levelName} 
                                  className="w-8 h-8"
                                />
                                <div>
                                  <span className="text-cyan-400 font-medium">
                                    {level.name}
                                  </span>
                                  <span className="text-gray-400 text-sm ml-2">{t.levelBonus}</span>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {t.bonus}: {formatBalance(bonus.bonusAmount)} {language.code === 'bn' ? '৳' : '$'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-green-400 font-bold">{formatBalance(bonus.bonusAmount)} {language.code === 'bn' ? '৳' : '$'}</span>
                                <button 
                                  onClick={() => handleClaimLevelBonus(bonus.levelName)}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2"
                                  disabled={levelBonusLoading}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {levelBonusLoading ? t.processing : t.claim}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-4">{t.noLevelBonuses}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow border border-gray-600">
                  <h4 className="font-medium mb-3 text-cyan-400">{t.levelHistory}</h4>
                  <div className="space-y-2">
                    {levels.map((level, index) => {
                      const isAchieved = levelData.lifetimeDeposit >= level.threshold;
                      const isCurrent = level.name === levelData.currentLevel.name;
                      const bonusClaimed = userData?.levelInfo?.lifetimeLevels?.some(
                        l => l.levelName.toLowerCase() === level.name.toLowerCase() && l.bonusClaimed
                      ) || false;
                      
                      return (
                        <div key={index} className={`flex items-center justify-between p-2 rounded ${
                          isCurrent ? 'bg-cyan-900 bg-opacity-30' : 'bg-gray-800'
                        }`}>
                          <div className="flex items-center gap-3">
                            <img src={level.icon} alt={level.name} className="w-8 h-8" />
                            <span className={`font-medium ${
                              isAchieved ? 'text-cyan-400' : 'text-gray-400'
                            }`}>
                              {level.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">
                              <span className={isAchieved ? 'text-green-400' : 'text-gray-400'}>
                                {formatNumber(level.threshold)} {language.code === 'bn' ? '৳' : '$'}
                              </span>
                            </div>
                            {isAchieved && (
                              <div className="text-xs text-cyan-400">
                                {bonusClaimed ? `${formatBalance(level.bonus || 0)} ${language.code === 'bn' ? '৳' : '$'} ${t.bonusClaimed}` : t.achieved}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Alert Modal */}
        {showMobileAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">{t.mobileRequiredTitle}</h3>
              <p className="text-gray-300 mb-4">
                {alertContext === 'claimBonus' 
                  ? t.bonusMobileRequiredDesc
                  : t.actionMobileRequiredDesc}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowMobileAlert(false);
                    navigate('/account'); // Redirect to account page to add mobile number
                  }}
                  className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 px-4 py-2 rounded text-sm"
                >
                  {t.addMobile}
                </button>
                <button
                  onClick={() => setShowMobileAlert(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gitpage;
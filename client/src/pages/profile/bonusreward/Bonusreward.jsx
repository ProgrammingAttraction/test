import React, { useState, useEffect, useContext } from 'react';
import { MdArrowBackIosNew, MdRefresh, MdInfoOutline, MdCheckCircle } from 'react-icons/md';
import { GiTrophy, GiCrownCoin } from 'react-icons/gi';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import { TbCalendarWeek, TbCalendarMonth } from 'react-icons/tb';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { LanguageContext } from '../../../context/LanguageContext';
import { GlobeAltIcon } from '@heroicons/react/24/solid';

const BonusCollection = () => {
  const { t, changeLanguage, language } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bonuses, setBonuses] = useState([]);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [monthlyTimeLeft, setMonthlyTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Calculate next Tuesday
  const getNextTuesday = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    let daysUntilTuesday;
    
    if (dayOfWeek <= 2) {
      daysUntilTuesday = 2 - dayOfWeek;
    } else {
      daysUntilTuesday = 2 + (7 - dayOfWeek);
    }
    
    const nextTuesday = new Date(today);
    nextTuesday.setDate(today.getDate() + daysUntilTuesday);
    nextTuesday.setHours(0, 0, 0, 0);
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
      next4thDay = new Date(currentYear, currentMonth, 4);
    } else {
      next4thDay = new Date(currentYear, currentMonth + 1, 4);
    }
    
    next4thDay.setHours(0, 0, 0, 0);
    return next4thDay;
  };

  const nextWeeklyBonus = getNextTuesday();
  const nextMonthlyBonus = getNext4thDay();

  // Calculate time left
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

  // Format time unit
  const formatTimeUnit = (unit) => {
    return unit < 10 ? `0${unit}` : unit;
  };

  // Check if today is Tuesday
  const isTuesday = () => {
    return new Date().getDay() === 2;
  };

  // Check if today is 4th day of month
  const is4thDay = () => {
    return new Date().getDate() === 4;
  };

  // Fetch bonuses from API
  const fetchBonuses = async () => {
    try {
      if (!refreshing) setLoading(true);
      const response = await axios.get(`${base_url}/user/bonus/monthly-weekly/${userData._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        const bonusData = response.data.data || [];
        
        // Add status indicators
        const processedBonuses = bonusData.map(bonus => ({
          ...bonus,
          isAvailableToday: (bonus.type === 'weekly' && isTuesday()) || (bonus.type === 'monthly' && is4thDay()),
          canClaim: (bonus.type === 'weekly' && isTuesday() && bonus.status === 'unclaimed') || 
                   (bonus.type === 'monthly' && is4thDay() && bonus.status === 'unclaimed')
        }));

        setBonuses(processedBonuses);
        setError(null);
      } else {
        setError(response.data.message || 'Failed to load bonuses');
      }
    } catch (err) {
      console.error('Error fetching bonuses:', err);
      setError(err.response?.data?.message || t.bonusFetchError || 'Failed to load bonuses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Claim bonus
  const claimBonus = async (bonusId, bonusType) => {
    try {
      setLoading(true);
      const response = await axios.post(`${base_url}/user/bonus/claim/${userData._id}`, 
        { bonusId },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: `${bonusType} bonus claimed successfully! Added ${formatNumber(response.data.data.amount)} to your balance.`
        });
        
        // Refresh data
        await fetchBonuses();
        await fetchUserData();
        
        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
      } else {
        setFeedback({
          type: 'error',
          message: response.data.message || `Failed to claim ${bonusType} bonus`
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || `Failed to claim ${bonusType} bonus`
      });
    } finally {
      setLoading(false);
    }
  };

  // Format number based on language
  const formatNumber = (number) => {
    if (number === undefined || number === null) return language.code === 'bn' ? '০' : '0';
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US').format(number);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Toggle language
  const toggleLanguage = () => {
    changeLanguage(
      language.code === 'bn'
        ? { code: 'en', name: 'English', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/US.svg' }
        : { code: 'bn', name: 'বাংলা', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/BD.svg' }
    );
  };

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      setWeeklyTimeLeft(calculateTimeLeft(nextWeeklyBonus));
      setMonthlyTimeLeft(calculateTimeLeft(nextMonthlyBonus));
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    return () => clearInterval(countdownInterval);
  }, [nextWeeklyBonus, nextMonthlyBonus]);

  // Initial fetch
  useEffect(() => {
    if (userData?._id) {
      fetchBonuses();
    }
  }, [userData]);

  // Refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBonuses();
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 min-h-screen font-anek text-white">
        <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 py-4 px-4 sticky top-0 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="mr-3 p-2 rounded-full bg-gray-700/50 hover:bg-gray-700 text-cyan-400 hover:text-cyan-300 transition-all duration-200 cursor-pointer"
              >
                <MdArrowBackIosNew className="text-lg" />
              </button>
              <h1 className="text-lg font-bold text-white">{t.bonusCollection || 'Bonus Collection'}</h1>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors border border-gray-600/50 text-sm"
            >
              <GlobeAltIcon className="h-4 w-4" />
              <span>{language.code === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 bg-cyan-500/20 blur-lg"></div>
            </div>
            <p className="mt-6 text-gray-400">{t.loading || 'Loading bonuses...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 min-h-screen font-anek text-white">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-md border-b border-gray-700/50 py-4 px-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="mr-3 p-2 rounded-full bg-gray-700/50 hover:bg-gray-700 text-cyan-400 hover:text-cyan-300 transition-all duration-200 cursor-pointer"
            >
              <MdArrowBackIosNew className="text-lg" />
            </button>
            <h1 className="text-lg font-bold text-white">{t.bonusCollection || 'Bonus Collection'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full bg-gray-700/50 hover:bg-gray-700 text-cyan-400 hover:text-cyan-300 transition-all duration-200 disabled:opacity-50"
              title="Refresh"
            >
              <MdRefresh className={`text-lg ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors border border-gray-600/50 text-sm"
            >
              <GlobeAltIcon className="h-4 w-4" />
              <span>{language.code === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Feedback Message */}
      {feedback.message && (
        <div className={`sticky top-16 z-40 mx-4 mt-4 rounded-lg p-4 text-center text-sm font-medium animate-fadeIn ${
          feedback.type === 'success' 
            ? 'bg-gradient-to-r from-green-900/80 to-emerald-900/80 border border-green-700/50' 
            : 'bg-gradient-to-r from-red-900/80 to-rose-900/80 border border-red-700/50'
        } backdrop-blur-md`}>
          <div className="flex items-center justify-center gap-2">
            {feedback.type === 'success' ? (
              <MdCheckCircle className="text-green-400 text-lg" />
            ) : (
              <MdInfoOutline className="text-red-400 text-lg" />
            )}
            {feedback.message}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-900/20 to-rose-900/20 rounded-xl border border-red-700/30">
            <div className="flex items-center justify-between">
              <p className="text-red-300 text-sm">{error}</p>
              <button
                onClick={handleRefresh}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                {t.retry || 'Retry'}
              </button>
            </div>
          </div>
        )}
        {/* Stats Section */}
        <div className="mt-2 grid grid-cols-2 gap-4 mb-[20px]">
          <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-xl p-4 border border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{t.todayIs || 'Today is'}</p>
                <p className="text-lg font-semibold text-white">
                  {isTuesday() ? t.tuesday || 'Tuesday' : is4thDay() ? '4th Day' : t.regularDay || 'Regular Day'}
                </p>
              </div>
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <FaCalendarAlt className="text-gray-400 text-lg" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-xl p-4 border border-gray-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">{t.totalAvailable || 'Total Available'}</p>
                <p className="text-lg font-semibold text-cyan-400">
                  {bonuses.filter(b => b.canClaim).length} {t.bonuses || 'Bonuses'}
                </p>
              </div>
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <GiTrophy className="text-amber-400 text-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!loading && bonuses.length === 0 && !error && (
          <div className="mt-8 text-center py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full mb-4 border border-gray-700">
              <GiTrophy className="text-3xl text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {t.noBonusesTitle || 'No Bonuses Available'}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {t.noBonusesDesc || 'Place bets to earn weekly and monthly bonuses. Check back on Tuesday for weekly bonus and 4th of the month for monthly bonus.'}
            </p>
          </div>
        )}
        {/* Bonus Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekly Bonus Card */}
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-xl border border-purple-700/30 overflow-hidden shadow-lg">
            {/* Card Header */}
            <div className="p-4 bg-gradient-to-r from-purple-800/20 to-purple-900/20 border-b border-purple-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg">
                    <TbCalendarWeek className="text-lg text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{t.weeklyBonus || 'Weekly Bonus'}</h2>
                    <p className="text-xs text-purple-300 flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />
                      {t.availableEveryTuesday || 'Every Tuesday'}
                    </p>
                  </div>
                </div>
                {isTuesday() && (
                  <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-xs font-bold rounded-full animate-pulse">
                    {t.availableToday || 'Available Today!'}
                  </span>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4">
              {/* Bonus Amount */}
              <div className="mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <GiTrophy className="text-xl text-yellow-400" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                    {bonuses.find(b => b.type === 'weekly')?.amount 
                      ? `${formatCurrency(bonuses.find(b => b.type === 'weekly')?.amount)} ৳`
                      : '0.00 ৳'}
                  </span>
                </div>
                <p className="text-xs text-purple-300">
                  {t.basedOnWeeklyBet || 'Based on your weekly betting activity'}
                </p>
              </div>

              {/* Countdown or Status */}
              <div className="mb-4">
                {isTuesday() ? (
                  <div className="bg-gradient-to-r from-purple-800/30 to-purple-900/30 rounded-lg p-3 border border-purple-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-purple-300">{t.claimBefore || 'Claim before midnight'}</span>
                      <FaClock className="text-purple-400 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {Object.entries(weeklyTimeLeft).map(([unit, value]) => (
                        <div key={unit} className="text-center">
                          <div className="bg-purple-900/50 rounded py-1">
                            <div className="text-white font-mono font-bold text-base">{formatTimeUnit(value)}</div>
                            <div className="text-purple-400 text-xs uppercase mt-0.5">{unit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-lg p-3 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">{t.nextAvailable || 'Next available in'}</span>
                      <FaClock className="text-gray-500 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {Object.entries(weeklyTimeLeft).map(([unit, value]) => (
                        <div key={unit} className="text-center">
                          <div className="bg-gray-900/50 rounded py-1">
                            <div className="text-gray-300 font-mono font-bold text-base">{formatTimeUnit(value)}</div>
                            <div className="text-gray-500 text-xs uppercase mt-0.5">{unit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Claim Button */}
              <div>
                {bonuses.find(b => b.type === 'weekly')?.canClaim ? (
                  <button
                    onClick={() => claimBonus(
                      bonuses.find(b => b.type === 'weekly')._id,
                      'weekly'
                    )}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-purple-900/30 text-sm"
                  >
                    <GiCrownCoin className="text-base" />
                    {loading ? t.claiming || 'Claiming...' : t.claimNow || 'Claim Now'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-gray-400 font-semibold py-2.5 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {bonuses.find(b => b.type === 'weekly')?.status === 'claimed' 
                      ? t.alreadyClaimed || 'Already Claimed'
                      : t.notAvailable || 'Not Available'}
                  </button>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 pb-3">
              <p className="text-xs text-purple-400 text-center">
                {t.totalBet || 'Total Bet'}: {formatNumber(bonuses.find(b => b.type === 'weekly')?.totalBet || 0)} ৳
              </p>
            </div>
          </div>

          {/* Monthly Bonus Card */}
          <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 rounded-xl border border-amber-700/30 overflow-hidden shadow-lg">
            {/* Card Header */}
            <div className="p-4 bg-gradient-to-r from-amber-800/20 to-amber-900/20 border-b border-amber-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg">
                    <TbCalendarMonth className="text-lg text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{t.monthlyBonus || 'Monthly Bonus'}</h2>
                    <p className="text-xs text-amber-300 flex items-center gap-1">
                      <FaCalendarAlt className="text-xs" />
                      {t.availableEvery4th || 'Every 4th of the month'}
                    </p>
                  </div>
                </div>
                {is4thDay() && (
                  <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-xs font-bold rounded-full animate-pulse">
                    {t.availableToday || 'Available Today!'}
                  </span>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4">
              {/* Bonus Amount */}
              <div className="mb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <GiTrophy className="text-xl text-yellow-400" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                    {bonuses.find(b => b.type === 'monthly')?.amount 
                      ? `${formatCurrency(bonuses.find(b => b.type === 'monthly')?.amount)} ৳`
                      : '0.00 ৳'}
                  </span>
                </div>
                <p className="text-xs text-amber-300">
                  {t.basedOnMonthlyBet || 'Based on your monthly betting activity'}
                </p>
              </div>

              {/* Countdown or Status */}
              <div className="mb-4">
                {is4thDay() ? (
                  <div className="bg-gradient-to-r from-amber-800/30 to-amber-900/30 rounded-lg p-3 border border-amber-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-amber-300">{t.claimBefore || 'Claim before midnight'}</span>
                      <FaClock className="text-amber-400 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {Object.entries(monthlyTimeLeft).map(([unit, value]) => (
                        <div key={unit} className="text-center">
                          <div className="bg-amber-900/50 rounded py-1">
                            <div className="text-white font-mono font-bold text-base">{formatTimeUnit(value)}</div>
                            <div className="text-amber-400 text-xs uppercase mt-0.5">{unit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-lg p-3 border border-gray-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">{t.nextAvailable || 'Next available in'}</span>
                      <FaClock className="text-gray-500 text-sm" />
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {Object.entries(monthlyTimeLeft).map(([unit, value]) => (
                        <div key={unit} className="text-center">
                          <div className="bg-gray-900/50 rounded py-1">
                            <div className="text-gray-300 font-mono font-bold text-base">{formatTimeUnit(value)}</div>
                            <div className="text-gray-500 text-xs uppercase mt-0.5">{unit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Claim Button */}
              <div>
                {bonuses.find(b => b.type === 'monthly')?.canClaim ? (
                  <button
                    onClick={() => claimBonus(
                      bonuses.find(b => b.type === 'monthly')._id,
                      'monthly'
                    )}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-amber-900/30 text-sm"
                  >
                    <GiCrownCoin className="text-base" />
                    {loading ? t.claiming || 'Claiming...' : t.claimNow || 'Claim Now'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-gray-400 font-semibold py-2.5 rounded-lg cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {bonuses.find(b => b.type === 'monthly')?.status === 'claimed' 
                      ? t.alreadyClaimed || 'Already Claimed'
                      : t.notAvailable || 'Not Available'}
                  </button>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 pb-3">
              <p className="text-xs text-amber-400 text-center">
                {t.totalBet || 'Total Bet'}: {formatNumber(bonuses.find(b => b.type === 'monthly')?.totalBet || 0)} ৳
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BonusCollection;
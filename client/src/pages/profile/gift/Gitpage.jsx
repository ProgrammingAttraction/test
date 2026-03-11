import React, { useState, useEffect, useContext } from 'react';
import { useUser } from '../../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from "react-icons/md";
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { LanguageContext } from '../../../context/LanguageContext';

import medal_img from "../../../assets/level/silver.png";
import silver_img from "../../../assets/level/badge.png";
import gold_img from "../../../assets/level/medal.png";
import diamond_img from "../../../assets/level/diamond.png";
import platinum_img from "../../../assets/level/platinum.png";

// Treasure chest SVG illustration (inline, no external image needed)
const GiftBoxIllustration = () => (
  <svg viewBox="0 0 120 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Coins background */}
    <circle cx="95" cy="75" r="10" fill="#F59E0B" opacity="0.9"/>
    <circle cx="105" cy="60" r="7" fill="#F59E0B" opacity="0.7"/>
    <circle cx="88" cy="88" r="6" fill="#FBBF24" opacity="0.8"/>
    <circle cx="100" cy="85" r="5" fill="#F59E0B" opacity="0.6"/>
    {/* Ribbon vertical */}
    <rect x="52" y="10" width="16" height="70" rx="3" fill="#EF4444"/>
    {/* Box body */}
    <rect x="18" y="42" width="84" height="52" rx="6" fill="#7C3AED"/>
    <rect x="18" y="42" width="84" height="52" rx="6" fill="url(#boxGrad)"/>
    {/* Box lid */}
    <rect x="12" y="28" width="96" height="20" rx="5" fill="#8B5CF6"/>
    <rect x="12" y="28" width="96" height="20" rx="5" fill="url(#lidGrad)"/>
    {/* Ribbon horizontal on lid */}
    <rect x="12" y="34" width="96" height="8" rx="2" fill="#EF4444"/>
    {/* Bow left loop */}
    <ellipse cx="43" cy="22" rx="14" ry="10" fill="#EF4444" transform="rotate(-30 43 22)"/>
    <ellipse cx="43" cy="22" rx="9" ry="6" fill="#F87171" transform="rotate(-30 43 22)"/>
    {/* Bow right loop */}
    <ellipse cx="77" cy="22" rx="14" ry="10" fill="#EF4444" transform="rotate(30 77 22)"/>
    <ellipse cx="77" cy="22" rx="9" ry="6" fill="#F87171" transform="rotate(30 77 22)"/>
    {/* Bow center */}
    <circle cx="60" cy="26" r="7" fill="#DC2626"/>
    <circle cx="60" cy="26" r="4" fill="#EF4444"/>
    {/* Stars/sparkles */}
    <text x="20" y="30" fontSize="10" fill="#FCD34D">✦</text>
    <text x="95" y="38" fontSize="8" fill="#FCD34D">✦</text>
    <text x="10" y="60" fontSize="7" fill="#FCD34D">✦</text>
    <defs>
      <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#7C3AED"/>
        <stop offset="100%" stopColor="#5B21B6"/>
      </linearGradient>
      <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#A78BFA"/>
        <stop offset="100%" stopColor="#7C3AED"/>
      </linearGradient>
    </defs>
  </svg>
);

const TreasureChestIllustration = () => (
  <svg viewBox="0 0 120 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Glow/gems spilling out */}
    <ellipse cx="60" cy="52" rx="38" ry="10" fill="#06B6D4" opacity="0.3"/>
    {/* Gems */}
    <polygon points="55,20 65,20 68,35 52,35" fill="#38BDF8"/>
    <polygon points="62,15 72,18 70,30 58,28" fill="#7DD3FC"/>
    <polygon points="48,18 56,15 58,28 45,30" fill="#0EA5E9"/>
    <polygon points="70,22 78,25 75,35 65,33" fill="#BAE6FD"/>
    <polygon points="42,25 50,22 50,33 40,34" fill="#38BDF8"/>
    {/* Chest body */}
    <rect x="15" y="50" width="90" height="50" rx="6" fill="#92400E"/>
    <rect x="15" y="50" width="90" height="50" rx="6" fill="url(#chestBody)"/>
    {/* Chest lid open */}
    <path d="M15 50 Q60 10 105 50" fill="#B45309" stroke="#92400E" strokeWidth="1"/>
    <path d="M15 50 Q60 15 105 50" fill="url(#chestLid)"/>
    {/* Chest rim */}
    <rect x="13" y="47" width="94" height="10" rx="4" fill="#D97706"/>
    {/* Lock */}
    <rect x="50" y="68" width="20" height="14" rx="3" fill="#D97706"/>
    <circle cx="60" cy="68" r="7" fill="#F59E0B" stroke="#D97706" strokeWidth="1.5"/>
    {/* Metal straps */}
    <rect x="13" y="72" width="94" height="6" rx="2" fill="#D97706" opacity="0.6"/>
    {/* Rivets */}
    <circle cx="25" cy="60" r="3" fill="#F59E0B"/>
    <circle cx="95" cy="60" r="3" fill="#F59E0B"/>
    <circle cx="25" cy="85" r="3" fill="#F59E0B"/>
    <circle cx="95" cy="85" r="3" fill="#F59E0B"/>
    {/* Shine on gems */}
    <circle cx="58" cy="22" r="2" fill="white" opacity="0.7"/>
    <circle cx="70" cy="25" r="1.5" fill="white" opacity="0.7"/>
    <defs>
      <linearGradient id="chestBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#B45309"/>
        <stop offset="100%" stopColor="#78350F"/>
      </linearGradient>
      <linearGradient id="chestLid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#D97706"/>
        <stop offset="100%" stopColor="#B45309"/>
      </linearGradient>
    </defs>
  </svg>
);

const GoldCoinsIllustration = () => (
  <svg viewBox="0 0 120 110" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Stack of gold coins */}
    <ellipse cx="60" cy="90" rx="35" ry="10" fill="#D97706"/>
    <ellipse cx="60" cy="83" rx="35" ry="10" fill="#F59E0B"/>
    <ellipse cx="60" cy="76" rx="35" ry="10" fill="#FBBF24"/>
    <ellipse cx="60" cy="69" rx="35" ry="10" fill="#F59E0B"/>
    <ellipse cx="60" cy="62" rx="35" ry="10" fill="#FCD34D"/>
    {/* $ symbol on top coin */}
    <text x="52" y="67" fontSize="14" fill="#D97706" fontWeight="bold">$</text>
    {/* Flying coins */}
    <ellipse cx="25" cy="35" rx="12" ry="12" fill="#F59E0B"/>
    <ellipse cx="25" cy="35" rx="9" ry="9" fill="#FCD34D"/>
    <text x="20" y="40" fontSize="10" fill="#D97706" fontWeight="bold">$</text>
    <ellipse cx="95" cy="28" rx="10" ry="10" fill="#F59E0B"/>
    <ellipse cx="95" cy="28" rx="7" ry="7" fill="#FCD34D"/>
    <text x="91" y="32" fontSize="8" fill="#D97706" fontWeight="bold">$</text>
    <ellipse cx="55" cy="22" rx="9" ry="9" fill="#FBBF24"/>
    <ellipse cx="55" cy="22" rx="6" ry="6" fill="#FDE68A"/>
    <text x="51" y="26" fontSize="8" fill="#D97706" fontWeight="bold">$</text>
    {/* Stars */}
    <text x="35" y="20" fontSize="10" fill="#FCD34D">✦</text>
    <text x="80" y="45" fontSize="8" fill="#FCD34D">✦</text>
    <text x="10" y="55" fontSize="7" fill="#FCD34D">✦</text>
  </svg>
);

const Gitpage = () => {
  const { t, language } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [activeTab, setActiveTab] = useState('available');
  const [bonusData, setBonusData] = useState(null);
  const [levelBonusLoading, setLevelBonusLoading] = useState(false);
  const [availableLevelBonuses, setAvailableLevelBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '', field: '' });
  const [showMobileAlert, setShowMobileAlert] = useState(false);
  const [weeklyTimeLeft, setWeeklyTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [monthlyTimeLeft, setMonthlyTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const levels = [
    { name: t.levelBronze || 'Bronze', threshold: 0, icon: medal_img },
    { name: t.levelSilver || 'Silver', threshold: 10000, icon: silver_img },
    { name: t.levelGold || 'Gold', threshold: 30000, icon: gold_img },
    { name: t.levelPlatinum || 'Platinum', threshold: 100000, icon: platinum_img },
    { name: t.levelDiamond || 'Diamond', threshold: 500000, icon: diamond_img }
  ];

  const calculateLevelData = () => {
    const lifetimeDeposit = userData?.lifetime_bet || 0;
    let currentLevel = levels[0];
    let nextLevel = null;
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
    return { currentLevel, nextLevel, progressPercentage, lifetimeDeposit };
  };
  const levelData = calculateLevelData();

  const getNextTuesday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day <= 2 ? 2 - day : 2 + (7 - day);
    const next = new Date(today);
    next.setDate(today.getDate() + diff);
    next.setHours(0, 0, 0, 0);
    return next;
  };

  const getNext4thDay = () => {
    const today = new Date();
    const d = today.getDate();
    const m = today.getMonth();
    const y = today.getFullYear();
    const next = d < 4 ? new Date(y, m, 4) : new Date(y, m + 1, 4);
    next.setHours(0, 0, 0, 0);
    return next;
  };

  const calculateTimeLeft = (targetDate) => {
    const diff = new Date(targetDate) - new Date();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000)
    };
  };

  const pad = (n) => String(n).padStart(2, '0');

  const isWeeklyBonusAvailable = () => new Date().getDay() === 2;
  const isMonthlyBonusAvailable = () => new Date().getDate() === 4;

  useEffect(() => {
    const next7 = getNextTuesday();
    const next4 = getNext4thDay();
    const update = () => {
      setWeeklyTimeLeft(calculateTimeLeft(next7));
      setMonthlyTimeLeft(calculateTimeLeft(next4));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (userData?._id) {
      fetchBonusData();
      const id = setInterval(fetchBonusData, 60000);
      return () => clearInterval(id);
    }
  }, [userData]);

  useEffect(() => {
    if (userData?._id && activeTab === 'level') fetchLevelBonusInfo();
  }, [userData, activeTab]);

  const fetchBonusData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${base_url}/user/bonus-info/${userData._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBonusData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bonus info');
    } finally {
      setLoading(false);
    }
  };

  const fetchLevelBonusInfo = async () => {
    if (!userData?._id) return;
    try {
      setLevelBonusLoading(true);
      const res = await axios.get(`${base_url}/user/level-bonus-info/${userData._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) setAvailableLevelBonuses(res.data.data?.availableBonuses || []);
    } catch { setAvailableLevelBonuses([]); }
    finally { setLevelBonusLoading(false); }
  };

  const handleClaimLevelBonus = async (levelName) => {
    if (!userData?.phone) { setShowMobileAlert(true); return; }
    try {
      setLevelBonusLoading(true);
      await axios.post(`${base_url}/user/claim-level-bonus/${userData._id}`, { levelName }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFeedback({ type: 'success', message: 'Level bonus claimed!', field: 'levelBonus' });
      fetchLevelBonusInfo(); fetchUserData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Claim failed', field: 'levelBonus' });
    } finally { setLevelBonusLoading(false); }
  };

  const claimWeeklyBonus = async () => {
    try {
      const res = await axios.post(`${base_url}/user/claim-weekly-bonus/${userData._id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFeedback({ type: 'success', message: res.data.message || 'Weekly bonus claimed!', field: 'weeklyBonus' });
      fetchBonusData(); fetchUserData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Claim failed', field: 'weeklyBonus' });
    }
  };

  const claimMonthlyBonus = async () => {
    try {
      const res = await axios.post(`${base_url}/user/claim-monthly-bonus/${userData._id}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFeedback({ type: 'success', message: res.data.message || 'Monthly bonus claimed!', field: 'monthlyBonus' });
      fetchBonusData(); fetchUserData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Claim failed', field: 'monthlyBonus' });
    }
  };

  const formatBalance = (amount) => {
    if (!amount && amount !== 0) return '0.00';
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 }).format(amount);
  };

  const calculateAccountAge = () => {
    if (!userData?.createdAt) return 0;
    return Math.floor((new Date() - new Date(userData.createdAt)) / 86400000);
  };
  const accountAgeInDays = calculateAccountAge();
  const claimedBonuses = userData?.bonusInfo?.claimedBonuses || [];

  // Bonus cards data
  const bonusCards = [
    {
      tag: 'Welcome Bonus',
      tagColor: 'bg-white border border-gray-200 text-gray-600',
      title: 'Get deposit Bonus 150%',
      wager: bonusData?.firstDeposit?.wager ?? 30,
      maxBonus: bonusData?.firstDeposit?.maxBonus ?? 30000,
      minBet: 10,
      maxBet: 10,
      expiry: bonusData?.firstDeposit?.expiryTime || '03D:45H:05M:B11',
      illustration: <GiftBoxIllustration />,
      borderColor: 'border-cyan-300',
      onClaim: () => {},
      isAvailable: accountAgeInDays <= 3 && !userData?.bonusInfo?.firstDepositBonusClaimed,
    },
    {
      tag: 'Welcome Bonus',
      tagColor: 'bg-white border border-gray-200 text-gray-600',
      title: '3% Cash Bonus on Deposit',
      wager: bonusData?.cashBonus?.wager ?? 0,
      maxBonus: bonusData?.cashBonus?.maxBonus ?? 30000,
      minBet: null,
      maxBet: null,
      expiry: bonusData?.cashBonus?.expiryTime || '03D:45H:03M:B11',
      illustration: <TreasureChestIllustration />,
      borderColor: 'border-cyan-300',
      onClaim: () => {},
      isAvailable: true,
    },
    {
      tag: 'Special Bonus',
      tagColor: 'bg-white border border-gray-200 text-gray-600',
      title: 'Get deposit Bonus 250%',
      wager: bonusData?.special?.wager ?? 30,
      maxBonus: bonusData?.special?.maxBonus ?? 50000,
      minBet: null,
      maxBet: null,
      expiry: bonusData?.special?.expiryTime || '03D:45H:05M:B11',
      illustration: <GoldCoinsIllustration />,
      borderColor: 'border-cyan-300',
      onClaim: () => {},
      isAvailable: true,
    },
  ];

  if (loading) return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-500" />
    </div>
  );

  return (
    <div className="bg-[#F5F5F5] min-h-screen font-anek pb-10">

      {/* Header — white background, "Bonus Hub" title, X close */}
      <div className="bg-white px-5 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Bonus Hub</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-transparent border-none cursor-pointer text-gray-500 p-1"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <div className="max-w-md mx-auto px-4">

        {/* Level Progress Card */}
        <div className="mt-4 mb-6 bg-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm border-[2px] border-theme_color2">
          <div>
            <div className="text-base font-bold text-gray-800 mb-0.5">Your Leve Progress</div>
            <div className="text-sm text-gray-400">Next Level {levelData.nextLevel?.name || 'Max'}</div>
          </div>
          {/* Circular progress */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3"/>
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#06B6D4" strokeWidth="3"
                strokeDasharray={`${levelData.progressPercentage} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">{levelData.progressPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Feedback message */}
        {feedback.message && (
          <div className={`mb-4 p-3 rounded-xl text-sm flex items-center justify-between ${
            feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
          }`}>
            <span>{feedback.message}</span>
            <button onClick={() => setFeedback({ type: '', message: '', field: '' })}><FaTimes size={12}/></button>
          </div>
        )}

        {/* Section title */}
        <div className="text-xl font-bold text-gray-800 mb-4">Unlockable Bonus</div>

        {/* Bonus Cards */}
        <div className="space-y-4">
          {bonusCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-2xl border-2 ${card.borderColor} overflow-hidden shadow-sm`}
            >
              <div className="p-4">
                {/* Tag + Illustration row */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Tag */}
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-3 ${card.tagColor}`}>
                      {card.tag}
                    </span>
                    {/* Title */}
                    <div className="text-base font-bold text-gray-800 mb-3">{card.title}</div>
                    {/* Details */}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 w-24">Wager</span>
                        <span className="text-gray-500">{card.wager}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 w-24">Max.Bonus</span>
                        <span className="text-gray-500">{card.maxBonus?.toLocaleString()}</span>
                      </div>
                      {card.minBet !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 w-24">Min.bet</span>
                          <span className="text-gray-500">{card.minBet}</span>
                        </div>
                      )}
                      {card.maxBet !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 w-24">Max.bet</span>
                          <span className="text-gray-500">{card.maxBet}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 w-24">Expiration Time</span>
                        <span className="text-cyan-500 text-xs font-mono">{card.expiry}</span>
                      </div>
                    </div>
                  </div>
                  {/* Illustration */}
                  <div className="w-28 h-28 flex-shrink-0 ml-2">
                    {card.illustration}
                  </div>
                </div>
              </div>

              {/* Claim Button */}
              <button
                onClick={card.onClaim}
                className="w-full bg-cyan-400 hover:bg-cyan-500 text-white font-bold py-3 text-base transition-colors"
              >
                Claim Bonus
              </button>
            </div>
          ))}
        </div>

        {/* Weekly & Monthly Bonus Section */}
        <div className="mt-6 text-xl font-bold text-gray-800 mb-4">Weekly & Monthly Bonus</div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Weekly */}
          <div className="bg-white rounded-2xl border-2 border-cyan-300 p-4 shadow-sm">
            <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Weekly</div>
            {isWeeklyBonusAvailable() && bonusData?.weekly?.bonusAmount > 0 ? (
              <button onClick={claimWeeklyBonus} className="w-full bg-cyan-400 text-white rounded-xl py-2 text-sm font-bold">
                Collect ৳{formatBalance(bonusData.weekly.bonusAmount)}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-1 text-center">
                {[
                  { val: weeklyTimeLeft.days, label: 'D' },
                  { val: weeklyTimeLeft.hours, label: 'H' },
                  { val: weeklyTimeLeft.minutes, label: 'M' },
                  { val: weeklyTimeLeft.seconds, label: 'S' },
                ].map((unit, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg py-1.5">
                    <div className="text-sm font-bold text-gray-700">{pad(unit.val)}</div>
                    <div className="text-[9px] text-gray-400">{unit.label}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-[10px] text-gray-400 text-center mt-2">Every Tuesday</div>
          </div>
          {/* Monthly */}
          <div className="bg-white rounded-2xl border-2 border-cyan-300 p-4 shadow-sm">
            <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Monthly</div>
            {isMonthlyBonusAvailable() && bonusData?.monthly?.bonusAmount > 0 ? (
              <button onClick={claimMonthlyBonus} className="w-full bg-cyan-400 text-white rounded-xl py-2 text-sm font-bold">
                Collect ৳{formatBalance(bonusData.monthly.bonusAmount)}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-1 text-center">
                {[
                  { val: monthlyTimeLeft.days, label: 'D' },
                  { val: monthlyTimeLeft.hours, label: 'H' },
                  { val: monthlyTimeLeft.minutes, label: 'M' },
                  { val: monthlyTimeLeft.seconds, label: 'S' },
                ].map((unit, i) => (
                  <div key={i} className="bg-gray-100 rounded-lg py-1.5">
                    <div className="text-sm font-bold text-gray-700">{pad(unit.val)}</div>
                    <div className="text-[9px] text-gray-400">{unit.label}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-[10px] text-gray-400 text-center mt-2">Every 4th of month</div>
          </div>
        </div>

        {/* Level Bonuses Section */}
        <div className="text-xl font-bold text-gray-800 mb-4">Level Bonuses</div>
        <div className="bg-white rounded-2xl border-2 border-cyan-300 p-4 shadow-sm mb-6">
          {/* Current Level */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <div className="relative w-14 h-14 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#06B6D4" strokeWidth="3"
                  strokeDasharray={`${levelData.progressPercentage} 100`} strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={levelData.currentLevel.icon} alt="" className="w-7 h-7"/>
              </div>
            </div>
            <div>
              <div className="text-sm font-bold text-cyan-500">{levelData.currentLevel.name}</div>
              <div className="text-xs text-gray-400">
                {levelData.nextLevel ? `Next: ${levelData.nextLevel.name} (${levelData.nextLevel.threshold?.toLocaleString()})` : 'Max Level'}
              </div>
            </div>
          </div>

          {/* Available level bonuses */}
          {levelBonusLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-cyan-500"/>
            </div>
          ) : availableLevelBonuses.length > 0 ? (
            availableLevelBonuses.map((bonus, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-sm font-bold text-gray-700">{bonus.levelName} Bonus</div>
                  <div className="text-xs text-gray-400">৳{formatBalance(bonus.bonusAmount)}</div>
                </div>
                <button
                  onClick={() => handleClaimLevelBonus(bonus.levelName)}
                  className="bg-cyan-400 hover:bg-cyan-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  Claim
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 text-sm py-4">No level bonuses available</div>
          )}
        </div>

        {/* Claimed History */}
        {claimedBonuses.length > 0 && (
          <>
            <div className="text-xl font-bold text-gray-800 mb-4">Claimed History</div>
            <div className="bg-white rounded-2xl border-2 border-cyan-300 shadow-sm overflow-hidden mb-6">
              {claimedBonuses.map((bonus, i, arr) => (
                <div key={i} className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div>
                    <div className="text-sm font-semibold text-gray-700 capitalize">{bonus.type?.replace(/-/g, ' ')}</div>
                    <div className="text-xs text-gray-400">{bonus.claimedAt ? new Date(bonus.claimedAt).toLocaleDateString() : '—'}</div>
                  </div>
                  <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-bold">Claimed</span>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Mobile Alert Modal */}
      {showMobileAlert && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full">
            <h3 className="font-bold text-gray-800 mb-2">Mobile Required</h3>
            <p className="text-sm text-gray-500 mb-5">Please add your mobile number to claim this bonus.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowMobileAlert(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 font-semibold">Cancel</button>
              <button onClick={() => { setShowMobileAlert(false); navigate('/mobile-information'); }} className="flex-1 py-2 bg-cyan-400 text-white rounded-xl text-sm font-semibold">Add Mobile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gitpage;
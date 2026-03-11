import React, { useState, useEffect, useContext } from 'react';
import { useUser } from '../../context/UserContext';
import { 
  FaCopy, 
  FaTimes, 
  FaFacebookF, 
  FaTwitter, 
  FaTelegramPlane, 
  FaWhatsapp, 
  FaUser,
  FaHistory,
  FaCoins,
  FaCheck,
  FaCalendarAlt,
  FaChevronRight
} from 'react-icons/fa';
import { useNavigate, NavLink } from 'react-router-dom';
import { MdArrowBackIosNew } from "react-icons/md";
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { LanguageContext } from '../../context/LanguageContext';

// --- Profile Images (same as Profile.jsx) ---
import man from "../../assets/profileimages/man.png";
import man1 from "../../assets/profileimages/man1.png";
import bronze_img from "../../assets/level/badge.png";
import silver_img from "../../assets/level/silver.png";
import gold_img from "../../assets/level/medal.png";
import diamond_img from "../../assets/level/diamond.png";
import platinum_img from "../../assets/level/platinum.png";

const profileImages = [man, man1];

const Referral = () => {
  const { t, changeLanguage, language } = useContext(LanguageContext);
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referredBy: null,
    totalReferrals: 0,
    activeReferrals: 0,
    depositedReferrals: 0,
    totalDepositsByReferrals: 0,
    totalWithdrawalsByReferrals: 0,
    referralEarnings: 0,
    referredUsers: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userData } = useUser();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const [feedback, setFeedback] = useState({ type: '', message: '', field: '' });
  const [activeTab, setActiveTab] = useState('account');

  const referralLink = `${window.location.origin}/?refer_code=${userData?.referralCode || ''}`;

  // --- Level logic (same as Profile) ---
  const levels = [
    { name: t.levelBronze || 'Bronze', threshold: 0, icon: bronze_img, color: '#cd7f32' },
    { name: t.levelSilver || 'Silver', threshold: 10000, icon: silver_img, color: '#c0c0c0' },
    { name: t.levelGold || 'Gold', threshold: 30000, icon: gold_img, color: '#ffd700' },
    { name: t.levelPlatinum || 'Platinum', threshold: 100000, icon: platinum_img, color: '#00bcd4' },
    { name: t.levelDiamond || 'Diamond', threshold: 500000, icon: diamond_img, color: '#a855f7' }
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

  const getProfileImage = (username) => {
    if (!username) return man;
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return profileImages[Math.abs(hash) % profileImages.length];
  };

  const formatBalance = (amount) => {
    if (amount === undefined || amount === null) return language.code === 'bn' ? '০.০০' : '0.00';
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 }).format(amount);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (userData?._id) {
      fetchReferralData();
    }
  }, [userData]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_BASE_URL}/user/referred-users-details/${userData?._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        }
      );
      if (response.data.success) {
        setReferralData(response.data.data);
      } else {
        throw new Error(t.referralFetchError);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || t.referralFetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', {
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const transferToMainBalance = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/user/transfer-refer-balance-to-main-balance`,
        { userId: userData._id },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        }
      );
      if (response.data.success) {
        setFeedback({ type: 'success', message: t.referralTransferSuccess, field: 'referralEarnings' });
        setReferralData(prevData => ({ ...prevData, referralEarnings: 0 }));
      } else {
        throw new Error(t.referralTransferError);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || t.referralTransferError,
        field: 'referralEarnings'
      });
    }
  };

  return (
    <div className="min-h-screen font-anek pb-[90px] md:pb-0 bg-gray-100">

      {/* Header */}
      <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={() => navigate(-1)}
          className="bg-transparent border-none cursor-pointer text-white flex items-center"
        >
          <MdArrowBackIosNew className="text-xl" />
        </button>
        <h1 className="text-white font-bold text-lg m-0">Refferal Program</h1>
        <div className="w-7" />
      </div>

      <div className="pb-6 max-w-md mx-auto">

        {/* Teal Hero Card — same as Profile */}
        <div className="mx-3 mt-3 rounded-2xl p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,188,212,0.3)] bg-[#00B4D8]">
          {/* Level badge top right */}
          <div className="absolute top-3 right-3 bg-white/20 rounded-full px-3 py-0.5 text-[11px] text-white font-semibold">
            {levelData.currentLevel.name}
          </div>
          {/* Top row: Avatar + ID */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center overflow-hidden border-2 border-white/50">
                <img src={getProfileImage(userData?.username)} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <div className="text-white/80 text-xs mb-0.5">Customer ID:</div>
              <div className="text-white font-bold text-base tracking-wide">{userData?.player_id || '123456789'}</div>
              <div className="text-white/70 text-[11px] mt-0.5">level {levelData.currentLevel.name}</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-1 bg-white/20 rounded-sm overflow-hidden">
              <div
                className="h-full bg-white/70 rounded-sm transition-all duration-500"
                style={{ width: `${levelData.progressPercentage}%` }}
              />
            </div>
          </div>
          {/* Balance Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-white/70 text-[10px] mb-0.5">Main Balance</div>
              <div className="text-white font-bold text-sm">{formatBalance(userData?.balance)}</div>
            </div>
            <div className="text-center border-l border-r border-white/20">
              <div className="text-white/70 text-[10px] mb-0.5">Bonus Balance</div>
              <div className="text-white font-bold text-sm">{formatBalance(userData?.bonusBalance)}</div>
            </div>
            <div className="text-center">
              <div className="text-white/70 text-[10px] mb-0.5">Refer Bonus</div>
              <div className="text-white font-bold text-sm">{formatBalance(userData?.referralEarnings)}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation — same style as Profile */}
        <div className="flex gap-2 px-3 pb-3 pt-3 overflow-x-auto scrollbar-hide">
          {[
            { id: 'account', label: t.account || 'Account', path: '/profile' },
            { id: 'transaction', label: t.transaction || 'Transaction', path: '/account-history' },
            { id: 'bethistory', label: t.bettingHistory || 'Bet History', path: '/betting-history' },
            { id: 'referral', label: t.referral || 'Referral P', path: null },
          ].map((tab) => (
            tab.path ? (
              <NavLink
                key={tab.id}
                to={tab.path}
                className="flex-shrink-0 px-4 py-1.5 rounded-[5px] text-xs font-semibold no-underline border border-gray-300 text-gray-100 bg-[#D0B1F9]"
              >
                {tab.label}
              </NavLink>
            ) : (
              <button
                key={tab.id}
                className="flex-shrink-0 px-4 py-1.5 rounded-[5px] text-xs font-semibold border-none cursor-pointer bg-[#E46248] text-white"
              >
                {tab.label}
              </button>
            )
          ))}
        </div>

        {/* Feedback */}
        {feedback.message && (
          <div className={`mx-3 mb-3 p-3 rounded ${feedback.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
            {feedback.message}
            <button onClick={() => setFeedback({ type: '', message: '', field: '' })} className="float-right font-bold">
              <FaTimes />
            </button>
          </div>
        )}

        {/* My Refer Link Section */}
        <div className="px-3 pb-2.5">
          <div className="text-gray-500 text-xs font-semibold mb-2 pl-1">My Refer link</div>
          <div className="bg-[#e8e0f0] p-[10px] rounded-xl">
            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-2">
              <input
                type="text"
                className="flex-1 text-xs text-gray-500 bg-transparent border-none outline-none truncate"
                value={referralLink}
                readOnly
              />
              <button
                onClick={handleCopyLink}
                className="flex-shrink-0 bg-[#00B4D8] hover:bg-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Refer And Earning Section */}
        <div className="px-3 pb-2.5">
          <div className="flex items-center justify-between mb-2 pl-1">
            <div className="text-gray-500 text-xs font-semibold">Refer And Earning</div>
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <span>Total refer:{referralData.totalReferrals}</span>
              <FaChevronRight className="text-[10px]" />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-100 text-red-600 p-3 rounded-xl text-xs mb-2">{error}</div>
          )}

          {/* Referred Users List */}
          {!loading && (
            <div className="bg-[#e8e0f0] p-[10px] rounded-xl">
              <div className="bg-white rounded-xl overflow-hidden">
                {referralData.referredUsers.length > 0 ? (
                  referralData.referredUsers.map((user, i, arr) => (
                    <div
                      key={user.id || i}
                      className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[rgba(200,190,220,0.5)]' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                          <FaUser size={11} className="text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-800 font-medium">{user.username || 'Customer ID'}</span>
                      </div>
                      <span className="text-sm text-gray-400 font-medium">{formatCurrency(user.earnedAmount)}</span>
                    </div>
                  ))
                ) : (
                  // Placeholder rows matching screenshot style
                  [1,2,3,4,5].map((_, i, arr) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[rgba(200,190,220,0.5)]' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                          <FaUser size={11} className="text-gray-400" />
                        </div>
                        <span className="text-sm text-gray-500 font-medium">Customer ID</span>
                      </div>
                      <span className="text-sm text-gray-400">—</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Transfer to Main Balance (if eligible) */}
        {!loading && referralData.referralEarnings >= 1000 && (
          <div className="px-3 pb-2.5">
            <div className="bg-[#e8e0f0] p-[10px] rounded-xl">
              <div className="bg-white rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500 mb-1">{t.referralCodeText || 'Referral Code'}: <span className="font-bold text-gray-700">{referralData.referralCode}</span></p>
                <p className="text-xs text-gray-500 mb-2">{t.referralBonusText || 'Bonus'}: ৳{formatCurrency(referralData.referralEarnings)}</p>
                <button
                  onClick={transferToMainBalance}
                  className="w-full bg-[#00B4D8] hover:bg-cyan-500 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                >
                  {t.referralTransferButton || 'Transfer to Main Balance'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <Toaster />
    </div>
  );
};

export default Referral;
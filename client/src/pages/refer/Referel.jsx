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
  FaChevronRight,
  FaGift
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
  const [activeTab, setActiveTab] = useState('invite');
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
    if (userData?._id && (activeTab === 'list' || activeTab === 'reward')) {
      fetchReferralData();
    }
  }, [activeTab, userData]);

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

  const shareOnSocialMedia = (platform) => {
    let url = '';
    const text = `${t.referralShareText || 'Join using my referral link:'} ${referralLink}`;
    switch (platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      default:
        return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString) => {
    if (!dateString) return t.na || 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', {
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatMobileNumber = (number) => {
    if (!number || number.length < 7) return number;
    const firstPart = number.substring(0, 4);
    const lastPart = number.substring(number.length - 3);
    return `${firstPart}****${lastPart}`;
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
        <h1 className="text-white font-bold text-lg m-0">{t.referralProgramTitle || 'Referral Program'}</h1>
        <div className="w-7" />
      </div>

      <div className="pb-6 max-w-md mx-auto">

        {/* Teal Hero Card */}
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

        {/* Page Tab Navigation (to other pages) */}
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

        {/* Feedback Banner */}
        {feedback.message && (
          <div className={`mx-3 mb-3 p-3 rounded ${feedback.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
            {feedback.message}
            <button onClick={() => setFeedback({ type: '', message: '', field: '' })} className="float-right font-bold">
              <FaTimes />
            </button>
          </div>
        )}

        {/* Inner Function Tabs */}
        <div className="px-3 pb-2">
          <div className="bg-[#e8e0f0] p-[10px] rounded-xl">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {[
                { id: 'invite', label: t.referralTabInvite || 'Invite', icon: <FaUser size={11} /> },
                { id: 'list', label: t.referralTabList || 'Friend List', icon: <FaHistory size={11} /> },
                { id: 'reward', label: t.referralTabReward || 'Reward', icon: <FaCoins size={11} /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors
                    ${activeTab === tab.id
                      ? 'bg-[#00B4D8] text-white shadow-sm'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent" />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mx-3 mb-3 bg-red-100 text-red-600 p-3 rounded-xl text-xs">{error}</div>
        )}

        {/* ── INVITE TAB ── */}
        {!loading && activeTab === 'invite' && (
          <>
            {/* My Refer Link */}
            <div className="px-3 pb-2.5">
              <div className="text-gray-500 text-xs font-semibold mb-2 pl-1">{t.referralLinkTitle || 'My Refer Link'}</div>
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
                    className="flex-shrink-0 bg-[#00B4D8] hover:bg-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {copied ? <FaCheck size={10} /> : <FaCopy size={10} />}
                    {copied ? (t.referralCopied || 'Copied!') : (t.referralCopy || 'Copy')}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
   {/* Quick Stats */}
<div className="px-3 pb-2.5">
  <div className="text-gray-500 text-xs font-semibold mb-2 pl-1">{t.referralTotalInvites || 'Overview'}</div>
  <div className="bg-[#e8e0f0] p-[10px] rounded-xl">
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(200,190,220,0.5)]">
        <span className="text-xs text-gray-500">{t.referralTotalInvites || 'Total Referrals'}</span>
        <span className="text-sm font-bold text-[#00B4D8]">{referralData.totalReferrals}</span>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(200,190,220,0.5)]">
        <span className="text-xs text-gray-500">{t.referralTabList || 'Active Referrals'}</span>
        <span className="text-sm font-bold text-[#00B4D8]">{referralData.activeReferrals}</span>
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-xs text-gray-500">{t.referralTotalEarnings || 'Referral Earnings'}</span>
        <span className="text-sm font-bold text-[#00B4D8]">৳{formatCurrency(referralData.referralEarnings)}</span>
      </div>
    </div>
  </div>
</div>
          </>
        )}

        {/* ── LIST TAB ── */}
        {!loading && activeTab === 'list' && (
          <div className="px-3 pb-2.5">
            <div className="flex items-center justify-between mb-2 pl-1">
              <div className="text-gray-500 text-xs font-semibold">{t.referralTabList || 'Friend List'}</div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <span>Total: {referralData.totalReferrals}</span>
                <FaChevronRight className="text-[10px]" />
              </div>
            </div>
            <div className="bg-[#e8e0f0] p-[10px] rounded-xl">
              <div className="bg-white rounded-xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-3 bg-[#f0eaf8] px-4 py-2 border-b border-[rgba(200,190,220,0.5)]">
                  <span className="text-[10px] font-semibold text-gray-500">{t.referralTableUser || 'User'}</span>
                  <span className="text-[10px] font-semibold text-gray-500 text-center">{t.referralTableDate || 'Join Date'}</span>
                  <span className="text-[10px] font-semibold text-gray-500 text-right">{t.referralTableReward || 'Earned'}</span>
                </div>
                {referralData.referredUsers.length > 0 ? (
                  referralData.referredUsers.map((user, i, arr) => (
                    <div
                      key={user.id || i}
                      className={`grid grid-cols-3 items-center px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[rgba(200,190,220,0.5)]' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <FaUser size={11} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-800 leading-none">{user.username || 'Customer'}</p>
                          {user.phone && (
                            <p className="text-[10px] text-gray-400 mt-0.5">{formatMobileNumber(user.phone)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400">
                        <FaCalendarAlt size={9} />
                        {formatDate(user.joinDate)}
                      </div>
                      <div className="text-xs font-semibold text-[#00B4D8] text-right">
                        ৳{formatCurrency(user.earnedAmount)}
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="py-4 text-center">
                      <p className="text-xs text-gray-400">{t.referralNoFriends || 'No referrals yet'}</p>
                      <p className="text-[10px] text-gray-300 mt-1">{t.referralInviteFriends || 'Invite friends to earn rewards'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── REWARD TAB ── */}
        {!loading && activeTab === 'reward' && (
          <>
            {/* Stats Grid */}
            <div className="px-3 pb-2.5">
              <div className="text-gray-500 text-xs font-semibold mb-2 pl-1">Earnings Overview</div>
              <div className="bg-[#e8e0f0] p-[10px] rounded-xl">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-xl px-4 py-3">
                    <div className="text-[10px] text-gray-400 mb-1">{t.referralTotalInvites || 'Total Invites'}</div>
                    <div className="text-lg font-bold text-[#00B4D8]">{referralData.totalReferrals}</div>
                  </div>
                  <div className="bg-white rounded-xl px-4 py-3">
                    <div className="text-[10px] text-gray-400 mb-1">{t.referralTotalEarnings || 'Total Earnings'}</div>
                    <div className="text-lg font-bold text-[#00B4D8]">৳{formatCurrency(referralData.referralEarnings)}</div>
                  </div>
                  <div className="bg-white rounded-xl px-4 py-3">
                    <div className="text-[10px] text-gray-400 mb-1">Deposited Referrals</div>
                    <div className="text-lg font-bold text-[#00B4D8]">{referralData.depositedReferrals}</div>
                  </div>
                  <div className="bg-white rounded-xl px-4 py-3">
                    <div className="text-[10px] text-gray-400 mb-1">Active Referrals</div>
                    <div className="text-lg font-bold text-[#00B4D8]">{referralData.activeReferrals}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Code + Transfer */}
            <div className="px-3 pb-2.5">
              <div className="text-gray-500 text-xs font-semibold mb-2 pl-1">Referral Bonus</div>
              <div className="bg-[#e8e0f0] p-[10px] rounded-xl">
                <div className="bg-white rounded-xl px-4 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{t.referralCodeText || 'Referral Code'}</span>
                    <span className="text-xs font-bold text-gray-700">{referralData.referralCode || userData?.referralCode || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">{t.referralBonusText || 'Current Bonus'}</span>
                    <span className="text-xs font-bold text-[#00B4D8]">৳{formatCurrency(referralData.referralEarnings)}</span>
                  </div>

                  {referralData.referralEarnings >= 1000 ? (
                    <>
                      <p className="text-[10px] text-green-600 bg-green-50 rounded-lg px-3 py-2 mb-3">
                        {t.referralEligibleText || '🎉 You are eligible to transfer your referral bonus!'}
                      </p>
                      <button
                        onClick={transferToMainBalance}
                        className="w-full bg-[#00B4D8] hover:bg-cyan-500 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors"
                      >
                        {t.referralTransferButton || 'Transfer to Main Balance'}
                      </button>
                    </>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-amber-600">
                        {t.referralThresholdText || 'Minimum ৳1,000 required to transfer. Keep inviting friends!'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      <Toaster />
    </div>
  );
};

export default Referral;
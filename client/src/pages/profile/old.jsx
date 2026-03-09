import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  FaEye,
  FaEyeSlash,
  FaSignOutAlt,
  FaUser,
  FaMobile,
  FaLock,
  FaCrown,
  FaMedal,
  FaAward,
  FaGem,
  FaCoins,
  FaGift,
  FaUsers,
  FaClock,
  FaMoneyBill,
  FaMoneyCheckAlt
} from 'react-icons/fa';
import { MdArrowBackIosNew } from "react-icons/md";
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { IoDiamond } from "react-icons/io5";
import man from "../../assets/profileimages/man.png";
import man1 from "../../assets/profileimages/man1.png";
import man2 from "../../assets/profileimages/man2.png";
import man3 from "../../assets/profileimages/man3.png";
import man4 from "../../assets/profileimages/man4.png";
import man5 from "../../assets/profileimages/man5.png";
import man6 from "../../assets/profileimages/man6.png";
import { useUser } from '../../context/UserContext';
import { LanguageContext } from '../../context/LanguageContext';

import bronze_img from "../../assets/level/badge.png";
import silver_img from "../../assets/level/silver.png";
import gold_img from "../../assets/level/medal.png";
import diamond_img from "../../assets/level/diamond.png";
import platinum_img from "../../assets/level/platinum.png";

const Profile = () => {
  const { t, changeLanguage, language } = useContext(LanguageContext);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showTransactionPassword, setShowTransactionPassword] = useState(false);
  const navigate = useNavigate();
  const { userData, loading, error, fetchUserData, logout } = useUser();

  const [currentLoginPassword, setCurrentLoginPassword] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [confirmLoginPassword, setConfirmLoginPassword] = useState('');
  const [currentTransactionPassword, setCurrentTransactionPassword] = useState('');
  const [newTransactionPassword, setNewTransactionPassword] = useState('');
  const [confirmTransactionPassword, setConfirmTransactionPassword] = useState('');

  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileTransactionPassword, setMobileTransactionPassword] = useState('');
  const [confirmMobileTransactionPassword, setConfirmMobileTransactionPassword] = useState('');

  const [editableUsername, setEditableUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [feedback, setFeedback] = useState({
    type: '',
    message: '',
    field: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [showMobileAlert, setShowMobileAlert] = useState(false);
  const [alertContext, setAlertContext] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showMobileSection, setShowMobileSection] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const levels = [
    {
      name: t.levelBronze,
      threshold: 0,
      icon: bronze_img,
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

  const levelData = calculateLevelData();

  useEffect(() => {
    if (userData?.username) {
      setEditableUsername(userData.username);
    }
  }, [userData]);

  const formatDateToBengali = (dateString) => {
    if (!dateString) return t.na;
    const date = new Date(dateString);
    return date.toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatMobileNumber = (number) => {
    if (!number || number.length < 7) return number;
    const firstPart = number.substring(0, 4);
    const lastPart = number.substring(number.length - 3);
    return `${firstPart}****${lastPart}`;
  };

  const formatBalance = (amount) => {
    if (amount === undefined || amount === null) return language.code === 'bn' ? '০.০০' : '0.00';
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', {
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumberToBengali = (number) => {
    if (number === undefined || number === null) return language.code === 'bn' ? '০' : '0';
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US').format(number);
  };

  const profileImages = [man, man1, man2, man3, man4, man5, man6];

  const getProfileImage = (username) => {
    if (!username) return man;
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % profileImages.length;
    return profileImages[index];
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    navigate('/');
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const checkMobileBeforeAction = (actionType) => {
    if (!userData?.phone) {
      setShowMobileAlert(true);
      setAlertContext(actionType);
      return false;
    }
    return true;
  };

  const handleDeposit = () => {
    if (checkMobileBeforeAction('deposit')) {
      navigate('/deposit');
    }
  };

  const handleWithdraw = () => {
    if (checkMobileBeforeAction('withdraw')) {
      navigate('/withdraw');
    }
  };

  const handleAddMobile = async (e) => {
    if (e) e.preventDefault();

    if (!/^[0-9]{10,15}$/.test(mobileNumber)) {
      setFeedback({
        type: 'error',
        message: t.invalidMobileFormat,
        field: 'mobile'
      });
      return;
    }

    if (mobileTransactionPassword !== confirmMobileTransactionPassword) {
      setFeedback({
        type: 'error',
        message: t.transactionPasswordMismatch,
        field: 'mobile'
      });
      return;
    }

    try {
      const response = await axios.post(`${base_url}/user/add-mobile`, {
        userId: userData._id,
        mobileNumber,
        transactionPassword: mobileTransactionPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFeedback({
        type: 'success',
        message: t.mobileAddSuccess,
        field: 'mobile'
      });

      setMobileNumber('');
      setMobileTransactionPassword('');
      setConfirmMobileTransactionPassword('');
      setShowMobileAlert(false);
      fetchUserData();

    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || t.mobileAddError,
        field: 'mobile'
      });
    }
  };

  const handleLoginPasswordChange = async (e) => {
    e.preventDefault();

    if (newLoginPassword !== confirmLoginPassword) {
      setFeedback({
        type: 'error',
        message: t.loginPasswordMismatch,
        field: 'loginPassword'
      });
      return;
    }

    try {
      const response = await axios.put(`${base_url}/user/update-account-password`, {
        userId: userData._id,
        currentPassword: currentLoginPassword,
        newPassword: newLoginPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFeedback({
        type: 'success',
        message: t.loginPasswordSuccess,
        field: 'loginPassword'
      });

      setCurrentLoginPassword('');
      setNewLoginPassword('');
      setConfirmLoginPassword('');
      fetchUserData();

    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || t.loginPasswordError,
        field: 'loginPassword'
      });
    }
  };

  const handleTransactionPasswordChange = async (e) => {
    e.preventDefault();

    if (newTransactionPassword !== confirmTransactionPassword) {
      setFeedback({
        type: 'error',
        message: t.transactionPasswordMismatch,
        field: 'transactionPassword'
      });
      return;
    }

    try {
      const response = await axios.put(`${base_url}/user/update-transaction-password`, {
        userId: userData._id,
        currentPassword: currentTransactionPassword,
        newPassword: newTransactionPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFeedback({
        type: 'success',
        message: t.transactionPasswordSuccess,
        field: 'transactionPassword'
      });

      setCurrentTransactionPassword('');
      setNewTransactionPassword('');
      setConfirmTransactionPassword('');
      fetchUserData();

    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || t.transactionPasswordError,
        field: 'transactionPassword'
      });
    }
  };

  const handleUsernameUpdate = async () => {
    try {
      const response = await axios.put(
        `${base_url}/user/update-username`,
        {
          userId: userData._id,
          newUsername: editableUsername,
          password: currentLoginPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setFeedback({
        type: 'success',
        message: t.usernameUpdateSuccess,
        field: 'personalInfo'
      });

      setIsEditingUsername(false);
      setCurrentLoginPassword('');
      fetchUserData();

    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || t.usernameUpdateError,
        field: 'personalInfo'
      });
    }
  };

  const closeAllSections = () => {
    setShowPersonalInfo(false);
    setShowMobileSection(false);
    setShowPasswordSection(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-center py-8 text-red-500">{t.error}: {error}</div>;

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-anek">
      {/* Header */}
      <div className="bg-gray-800 px-1 py-4 flex items-center justify-between border-b border-gray-700 sticky top-0 z-[1000] shadow-md">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors"
        >
          <MdArrowBackIosNew className="text-lg text-cyan-400" />
        </button>
        <h1 className="text-[18px] font-[600] text-white">{t.profileTitle}</h1>
        <button
          onClick={handleLogoutClick}
          className="py-2 px-3 rounded-[5px] cursor-pointer hover:bg-gray-700 transition-colors text-red-400"
          title={t.logout}
        >
          <FaSignOutAlt className="text-lg" />
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-90 flex items-center justify-center z-[1000000000] p-4 backdrop-blur-md">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full border border-cyan-600 shadow-xl">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">{t.logoutConfirmTitle}</h3>
            <p className="mb-6 text-gray-300">{t.logoutConfirmText}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-700 cursor-pointer hover:bg-gray-600 rounded-lg transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 cursor-pointer hover:bg-red-500 text-white rounded-lg transition-colors"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Number Alert Modal */}
      {showMobileAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full border border-cyan-600 shadow-xl">
            <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center">
              <FaMobile className="mr-2" />
              {t.mobileRequiredTitle}
            </h3>
            <p className="mb-4 text-gray-300">
              {alertContext === 'deposit' ? t.mobileRequiredDeposit : t.mobileRequiredWithdraw}
            </p>

            <form onSubmit={handleAddMobile}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">{t.mobileNumber}</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder={t.mobilePlaceholder}
                  maxLength={15}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">{t.transactionPassword}</label>
                <div className="relative">
                  <input
                    type={showTransactionPassword ? "text" : "password"}
                    className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    value={mobileTransactionPassword}
                    onChange={(e) => setMobileTransactionPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={t.transactionPasswordPlaceholder}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-cyan-400 transition-colors"
                    onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                  >
                    {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-400 mb-2">{t.confirmPassword}</label>
                <div className="relative">
                  <input
                    type={showTransactionPassword ? "text" : "password"}
                    className="w-full p-3 border border-gray-700 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    value={confirmMobileTransactionPassword}
                    onChange={(e) => setConfirmMobileTransactionPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={t.confirmPasswordPlaceholder}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-cyan-400 transition-colors"
                    onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                  >
                    {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowMobileAlert(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback messages */}
      {feedback.message && (
        <div className={`mx-4 mt-4 p-3 rounded-lg border ${feedback.type === 'success'
            ? 'bg-green-900/50 border-green-700 text-green-100'
            : 'bg-red-900/50 border-red-700 text-red-100'
          }`}>
          <div className="flex items-center justify-between">
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback({ type: '', message: '', field: '' })}
              className="ml-2 text-lg hover:text-white transition-colors"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div className="px-3 py-4">
        {/* Profile Summary with Level Progress */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl shadow-lg border border-gray-700 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-purple-900/20"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src={getProfileImage(userData?.username)}
                  alt={t.user}
                  className="w-16 h-16 rounded-full border-2 border-cyan-400 object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold">{userData?.username || t.na}</h3>
                <div className="space-y-4">
                  <div className="relative pt-1">
                    <div className="flex justify-between items-center mb-2">
                      <div className='flex justify-center items-center gap-2'>
                        <span className="text-xs md:text-sm font-semibold inline-block text-cyan-400">
                          {levelData.currentLevel.name}
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-3 mb-4 text-xs flex rounded bg-gray-700">
                      <div
                        style={{ width: `${levelData.progressPercentage}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  {t.playerId}: {userData?.player_id} | {t.level}: {levelData.currentLevel.name}
                </p>
              </div>
            </div>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-400 mb-1">{t.totalBalance}</p>
              <p className="text-3xl font-bold text-cyan-400">
                ৳ {formatBalance(userData?.balance)}
              </p>
            </div>
            <div className="flex gap-3 mb-4">
              <NavLink
                to="/deposit"
                onClick={handleDeposit}
                className="flex-1 bg-theme_color2 text-gray-700 py-2 px-4 rounded-[5px] font-medium flex items-center justify-center gap-2 transition-all"
              >
                {t.deposit}
              </NavLink>
              <NavLink
                to="/withdraw"
                onClick={handleWithdraw}
                className="flex-1 bg-[#3867D6] text-white py-2 px-4 rounded-[5px] font-medium flex items-center justify-center gap-2 transition-all"
              >
                {t.withdraw}
              </NavLink>
            </div>
            <div className="flex justify-between text-sm">
              <div className="text-center">
                <p className="text-gray-400">{t.bonus}</p>
                <p className="text-cyan-300 font-medium">৳{formatBalance(userData?.bonusBalance)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400">{t.referral}</p>
                <p className="text-cyan-300 font-medium">৳{formatBalance(userData?.referralEarnings)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Options Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className={`bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-md border cursor-pointer transition-all hover:scale-105 ${showPersonalInfo ? 'border-cyan-500' : 'border-gray-700'
              }`}
            onClick={() => navigate('/profile-information')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-cyan-900 bg-opacity-30 p-3 rounded-full mb-2">
                <FaUser className="text-cyan-400 text-xl" />
              </div>
              <h3 className="font-medium text-white">{t.personalInfo}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.personalInfoDesc}</p>
            </div>
          </div>
          <div
            className={`bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-md border cursor-pointer transition-all hover:scale-105 ${showMobileSection ? 'border-cyan-500' : 'border-gray-700'
              }`}
            onClick={() => navigate('/mobile-information')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-cyan-900 bg-opacity-30 p-3 rounded-full mb-2">
                <FaMobile className="text-cyan-400 text-xl" />
              </div>
              <h3 className="font-medium text-white">{t.mobile}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.mobileDesc}</p>
            </div>
          </div>
          <div
            className={`bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-md border cursor-pointer transition-all hover:scale-105 ${showPasswordSection ? 'border-cyan-500' : 'border-gray-700'
              }`}
            onClick={() => navigate('/password-information')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-cyan-900 bg-opacity-30 p-3 rounded-full mb-2">
                <FaLock className="text-cyan-400 text-xl" />
              </div>
              <h3 className="font-medium text-white">{t.password}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.passwordDesc}</p>
            </div>
          </div>
          <div
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-md border border-gray-700 cursor-pointer transition-all hover:scale-105"
            onClick={() => navigate('/refer-programme')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-cyan-900 bg-opacity-30 p-3 rounded-full mb-2">
                <FaUsers className="text-cyan-400 text-xl" />
              </div>
              <h3 className="font-medium text-white">{t.referral}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.referralDesc}</p>
            </div>
          </div>
          <div
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-md border border-gray-700 cursor-pointer transition-all hover:scale-105"
            onClick={() => navigate('/my-gifts')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-cyan-900 bg-opacity-30 p-3 rounded-full mb-2">
                <FaUsers className="text-cyan-400 text-xl" />
              </div>
              <h3 className="font-medium text-white">{t.giftCenter}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.giftCenterDesc}</p>
            </div>
          </div>
          <div
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-md border border-gray-700 cursor-pointer transition-all hover:scale-105"
            onClick={() => navigate('/account-history')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-cyan-900 bg-opacity-30 p-3 rounded-full mb-2">
                <FaUsers className="text-cyan-400 text-xl" />
              </div>
              <h3 className="font-medium text-white">{t.accountHistory}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.accountHistoryDesc}</p>
            </div>
          </div>
          <div
            className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-md border border-gray-700 cursor-pointer transition-all hover:scale-105"
            onClick={() => navigate('/betting-history')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-cyan-900 bg-opacity-30 p-3 rounded-full mb-2">
                <FaUsers className="text-cyan-400 text-xl" />
              </div>
              <h3 className="font-medium text-white">{t.bettingHistory}</h3>
              <p className="text-xs text-gray-400 mt-1">{t.bettingHistoryDesc}</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Profile;
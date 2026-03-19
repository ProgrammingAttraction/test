import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import { MdArrowDropDown } from 'react-icons/md';
import {
  FaFacebookF,
  FaTwitter,
  FaTelegramPlane,
  FaWhatsapp,
  FaCopy,
  FaHeadset,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaUserFriends,
  FaHistory,
  FaCalendarAlt,
  FaTimesCircle,
  FaCheck,
  FaUser,
  FaFacebookMessenger,
  FaInstagram,
  FaIdCard,
  FaEnvelope,
  FaClock ,
  FaCheckCircle,
} from 'react-icons/fa';
import { FaCoins } from 'react-icons/fa';
import { GiTrophy, GiCrownCoin } from 'react-icons/gi';
import { TbCalendarWeek, TbCalendarMonth } from 'react-icons/tb';
import { FaBangladeshiTakaSign } from 'react-icons/fa6';
import { IoClose } from 'react-icons/io5';
import { MdEmail } from 'react-icons/md';
import { FaLock } from 'react-icons/fa';
import { TiWarningOutline } from 'react-icons/ti';
import { ImInfo } from 'react-icons/im';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from '../../context/UserContext';
import { HiIdentification } from "react-icons/hi";

// Images
import popular_img from "../../assets/category/Casino.svg";
import dice_img from "../../assets/dice.png";
import user_img from "../../assets/sidebar_icon/img3.svg";
import bonus_img from "../../assets/sidebar_icon/img12.svg";
import affiliate_img from "../../assets/sidebar_icon/img4.svg";
import question_img from "../../assets/question.png";
import teamwork_img from "../../assets/sidebar_icon/img2.svg";
import party_img from "../../assets/party.png";
import link_img from "../../assets/link.png";
import download_img from "../../assets/cloud.png";
import support_img from "../../assets/support.png";
import medal_img from "../../assets/level/silver.png";
import silver_img from "../../assets/level/badge.png";
import gold_img from "../../assets/level/medal.png";
import diamond_img from "../../assets/level/diamond.png";
import platinum_img from "../../assets/level/platinum.png";
import weekly_img from "../../assets/weekly.jpg";
import monthly_img from "../../assets/monthly.jpg";
import slot_img from "../../assets/category/slots.svg";
import controller_img from "../../assets/category/other.svg";
import popular_games from "../../assets/category/popular.svg";
import man from "../../assets/profileimages/man.png";
import man1 from "../../assets/profileimages/man1.png";
import man2 from "../../assets/profileimages/man2.png";
import man3 from "../../assets/profileimages/man3.png";
import man4 from "../../assets/profileimages/man4.png";
import man5 from "../../assets/profileimages/man5.png";
import man6 from "../../assets/profileimages/man6.png";

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

const Sidebar = ({ showPopup, setShowPopup, activeLeftTab, setActiveLeftTab }) => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { userData } = useUser();
  const { language, changeLanguage, t } = useContext(LanguageContext);

  const downloadFileAtURL = (url) => {
    const fileName = url.split("/").pop();
    const aTag = document.createElement("a");
    aTag.href = url;
    aTag.setAttribute("download", fileName);
    document.body.appendChild(aTag);
    aTag.click();
    aTag.remove();
  };

  const languages = [
    { code: 'bn', name: 'বাংলা', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/BD.svg' },
    { code: 'en', name: 'English', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/US.svg' }
  ];

  const menuItems = [
    { icon: popular_img, label: t?.casinoMenu || 'ক্যাসিনো', path: '/casino-games' },
    { icon: slot_img, label: t?.slotMenu || 'স্লট', path: '/slot-games' },
    { icon: popular_games, label: t?.popular || 'জনপ্রিয়', path: '/popular-game' },
    { icon: controller_img, label: t?.allGames || 'সকল গেমস', path: '/all-games' },
    { icon: user_img, label: t?.myAccount || 'আমার একাউন্ট', leftTab: t?.myAccount || 'আমার অ্যাকাউন্ট' },
    { icon: bonus_img, label: t?.bonus || 'বোনাস', leftTab: t?.bonus || 'বোনাস' },
    { icon: teamwork_img, label: t?.provider || 'প্রভাইডার', path: '/provider' },
    { icon: affiliate_img, label: t?.affiliate || 'এফিলিয়েট', path: '/affiliate-programme' },
    { icon: support_img, label: t?.contact || 'যোগাযোগ', path: '/contact' },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.label === (t?.myAccount || 'আমার একাউন্ট') && !userData) return false;
    return true;
  });

  const handleMenuClick = (item) => {
    if (item.label === (t?.downloadApp || 'ডাউনলোড অ্যাপ') && item.onClick) {
      item.onClick();
      return;
    }

    if (item.label === (t?.referralProgram || 'রেফারেল প্রোগ্রাম')) {
      if (!userData) {
        setShowAuthModal(true);
        setActiveTab('login');
      } else {
        setShowInvitePopup(true);
      }
    } else if (item.label === (t?.myAccount || 'আমার একাউন্ট') || item.label === (t?.bonus || 'বোনাস')) {
      if (!userData) {
        setShowAuthModal(true);
        setActiveTab('login');
      } else {
        setSelectedMenu(item);
        if (item.leftTab) setActiveLeftTab(item.leftTab);
        setShowPopup(true);
      }
    } else if (item.path) {
      navigate(item.path);
    } else {
      setSelectedMenu(item);
      if (item.leftTab) setActiveLeftTab(item.leftTab);
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setShowInvitePopup(false);
    setSelectedMenu(null);
  };

  const closeAuthModal = () => setShowAuthModal(false);
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const selectLanguage = (lang) => {
    changeLanguage(lang);
    setShowDropdown(false);
  };

  const MenuCard = ({ item, onClick }) => (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 cursor-pointer transition-all duration-200 group"
    >
      <img src={item.icon} alt={item.label} className="w-5 h-5 group-hover:opacity-100 transition-opacity" />
      <span className="text-gray-700 text-sm font-medium group-hover:text-gray-900 transition-colors">{item.label}</span>
    </div>
  );

  return (
    <>
      <div className="bg-white w-[280px] pb-[100px] pt-[30px] border-r border-gray-200 h-full fixed top-[70px] overflow-y-auto no-scrollbar left-0 px-3 py-4 shadow-sm">
        <div className="grid grid-cols-1 gap-2.5">
          {filteredMenuItems.map((item, index) => (
            <MenuCard key={index} item={item} onClick={() => handleMenuClick(item)} />
          ))}

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center w-full p-2.5 bg-gray-100 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <img src={language.flag} alt={language.name} className="w-5 h-5 mr-2 rounded-full" />
              <span className="flex-1 text-left text-sm font-medium">{language.name}</span>
              <MdArrowDropDown className={`text-gray-500 text-lg transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showDropdown && (
              <div className="absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => selectLanguage(lang)}
                    className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <img src={lang.flag} alt={lang.name} className="w-5 h-5 mr-2 rounded-full" />
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 pt-[20px]">
            {/* Telegram */}
            <a href="https://t.me/+CUD2OZlCEOAxMTg0" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
              <div className="w-10 h-10 rounded-full bg-[#24A1DE] flex items-center justify-center shadow-md">
                <FaTelegramPlane className="text-white text-xl ml-[-2px]" />
              </div>
            </a>

            {/* WhatsApp */}
            <a href="https://wa.me/61480897550" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
              <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shadow-md">
                <FaWhatsapp className="text-white text-2xl" />
              </div>
            </a>

            {/* Messenger */}
            <a target='_blank' href="https://tawk.to/chat/68a35260fcd547192dde87ce/1j6ibcsl1" className="transition-transform hover:scale-110">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#006AFF] via-[#A133FF] to-[#FF5C87] flex items-center justify-center shadow-md">
                <FaFacebookMessenger className="text-white text-xl" />
              </div>
            </a>

            {/* Instagram */}
            <a href="#" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FFB700] via-[#FF0069] to-[#7638FA] flex items-center justify-center shadow-md">
                <FaInstagram className="text-white text-xl" />
              </div>
            </a>

            {/* Facebook */}
            <a href="https://www.facebook.com/genzzzcasino" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-110">
              <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center shadow-md">
                <FaFacebookF className="text-white text-xl" />
              </div>
            </a>
          </div>
        </div>
      </div>

      {showPopup && (
        <Popup
          onClose={handleClosePopup}
          selectedMenu={selectedMenu}
          activeLeftTab={activeLeftTab}
          setActiveLeftTab={setActiveLeftTab}
        />
      )}

      {showInvitePopup && <InvitePopup onClose={handleClosePopup} />}

      {showAuthModal && (
        <AuthModal
          showAuthModal={showAuthModal}
          closeAuthModal={closeAuthModal}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </>
  );
};

// Auth Modal Component
const AuthModal = ({ showAuthModal, closeAuthModal, activeTab, setActiveTab }) => {
  const { t, language } = useContext(LanguageContext);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: ''
  });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    email: '',
    formError: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [referralCodeValid, setReferralCodeValid] = useState(false);
  const [referralCodeChecking, setReferralCodeChecking] = useState(false);
  const [referralCodeError, setReferralCodeError] = useState('');
  const [referrerInfo, setReferrerInfo] = useState(null);
  const otpInputRefs = useRef([]);
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (showOtpModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, showOtpModal]);

  const checkReferralCode = async (code) => {
    if (!code) {
      setReferralCodeValid(false);
      setReferralCodeError('');
      setReferrerInfo(null);
      return;
    }

    setReferralCodeChecking(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/check-referral-code/${code}`);
      if (response.data.exists) {
        setReferralCodeValid(true);
        setReferralCodeError('');
        setReferrerInfo(response.data.referrer);
      } else {
        setReferralCodeValid(false);
        setReferralCodeError(t?.invalidReferral || 'অবৈধ রেফারেল কোড');
        setReferrerInfo(null);
      }
    } catch (error) {
      setReferralCodeValid(false);
      setReferralCodeError(t?.referralCheckError || 'রেফারেল কোড চেক করতে সমস্যা হয়েছে');
      setReferrerInfo(null);
    } finally {
      setReferralCodeChecking(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name] || errors.formError) {
      setErrors(prev => ({ ...prev, [name]: '', formError: '' }));
    }
    if (name === 'referralCode') checkReferralCode(value);
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { password: '', confirmPassword: '', email: '', formError: '' };

    if (!formData.email) {
      newErrors.email = t?.emailRequired || 'ইমেইল প্রয়োজন';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = t?.invalidEmail || 'সঠিক ইমেইল দিন';
      valid = false;
    }

    if ((activeTab === 'login' || activeTab === 'register' || activeTab === 'reset-password') && !formData.password) {
      newErrors.password = t?.passwordRequired || 'পাসওয়ার্ড প্রয়োজন';
      valid = false;
    } else if ((activeTab === 'login' || activeTab === 'register' || activeTab === 'reset-password') && formData.password.length < 6) {
      newErrors.password = t?.passwordLength || 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে';
      valid = false;
    }

    if (activeTab === 'register' || activeTab === 'reset-password') {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t?.passwordMismatch || 'পাসওয়ার্ড মিলছে না';
        valid = false;
      }
    }

    if (activeTab === 'register' && formData.referralCode && !referralCodeValid) {
      newErrors.formError = t?.invalidReferral || 'অবৈধ রেফারেল কোড';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      closeAuthModal();
      toast.success(t?.loginSuccess || 'সফলভাবে লগইন করা হয়েছে!');
      navigate("/");
      window.location.reload();
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        formError: error.response?.data?.message || t?.loginError || 'লগইন করতে সমস্যা হয়েছে'
      }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    if (formData.referralCode && !referralCodeValid) {
      setErrors(prev => ({ ...prev, formError: t?.invalidReferral || 'অবৈধ রেফারেল কোড' }));
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email: formData.email,
        password: formData.password,
        referralCode: formData.referralCode
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      closeAuthModal();
      toast.success(t?.registerSuccess || 'সফলভাবে নিবন্ধন করা হয়েছে!');
      navigate("/");
      window.location.reload();
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        formError: error.response?.data?.message || t?.registerError || 'নিবন্ধন করতে সমস্যা হয়েছে'
      }));
    }
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;

    try {
      await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email: formData.email });
      setOtpEmail(formData.email);
      setShowOtpModal(true);
      setCountdown(60);
      toast.success(t?.otpSent || 'OTP ইমেইলে পাঠানো হয়েছে');
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        formError: error.response?.data?.message || t?.resetPasswordError || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে'
      }));
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error(t?.invalidOtp || 'সম্পূর্ণ OTP দিন');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-reset-otp`, {
        email: otpEmail,
        otp: otpCode
      });

      const { resetToken } = response.data;
      localStorage.setItem('resetToken', resetToken);
      setActiveTab('reset-password');
      setShowOtpModal(false);
      setOtp(['', '', '', '', '', '']);
      toast.success(t?.otpVerified || 'OTP সফলভাবে যাচাই করা হয়েছে');
    } catch (error) {
      toast.error(error.response?.data?.message || t?.otpVerifyError || 'OTP যাচাই করতে সমস্যা হয়েছে');
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      const resetToken = localStorage.getItem('resetToken');
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        resetToken,
        newPassword: formData.password
      });

      localStorage.removeItem('resetToken');
      closeAuthModal();
      toast.success(t?.passwordResetSuccess || 'পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে');

      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: response.data.user.email,
        password: formData.password
      });

      const { token, user } = loginResponse.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate("/");
      window.location.reload();
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        formError: error.response?.data?.message || t?.resetPasswordError || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে'
      }));
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;

    try {
      await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email: otpEmail });
      setCountdown(60);
      toast.success(t?.newOtpSent || 'নতুন OTP ইমেইলে পাঠানো হয়েছে');
    } catch (error) {
      toast.error(error.response?.data?.message || t?.otpResendError || 'OTP পুনরায় পাঠাতে সমস্যা হয়েছে');
    }
  };

  return (
    <>
      {showAuthModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-gray-800 text-xl font-semibold">
                {activeTab === 'login' && (t?.login || 'লগইন করুন')}
                {activeTab === 'register' && (t?.register || 'নিবন্ধন করুন')}
                {activeTab === 'forgot-password' && (t?.resetPassword || 'পাসওয়ার্ড রিসেট করুন')}
                {activeTab === 'reset-password' && (t?.setNewPassword || 'নতুন পাসওয়ার্ড সেট করুন')}
              </h2>
              <button onClick={closeAuthModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <FaTimesCircle className="text-xl" />
              </button>
            </div>

            <div className="flex border-b border-gray-200">
              {['login', 'register'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm md:text-base font-medium cursor-pointer ${
                    activeTab === tab
                      ? 'text-gray-800 border-b-2 border-gray-800'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'login' ? (t?.login || 'লগইন') : (t?.register || 'নিবন্ধন')}
                </button>
              ))}
            </div>

            <div className="p-6">
              {errors.formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {errors.formError}
                </div>
              )}

              {activeTab === 'login' && (
                <div className="space-y-4">
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t?.emailPlaceholder || 'ইমেইল'}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.email ? 'border-red-300' : 'border-gray-300'} py-2 pl-10 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base placeholder-gray-400`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={t?.passwordPlaceholder || 'পাসওয়ার্ড'}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.password ? 'border-red-300' : 'border-gray-300'} py-2 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base placeholder-gray-400`}
                    />
                    <button
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <input type="checkbox" id="remember" className="mr-2 accent-gray-800" />
                      <label htmlFor="remember" className="text-gray-600">{t?.rememberMe || 'মনে রাখুন'}</label>
                    </div>
                    <button onClick={() => setActiveTab('forgot-password')} className="text-gray-600 hover:text-gray-800 underline cursor-pointer">
                      {t?.forgotPassword || 'পাসওয়ার্ড ভুলে গেছেন?'}
                    </button>
                  </div>

                  <button
                    onClick={handleLogin}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white px-[20px] py-[10px] rounded-lg font-medium transition-colors"
                  >
                    {t?.login || 'লগইন করুন'}
                  </button>
                </div>
              )}

              {activeTab === 'register' && (
                <div className="space-y-4">
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t?.emailPlaceholder || 'ইমেইল'}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.email ? 'border-red-300' : 'border-gray-300'} py-2 pl-10 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base placeholder-gray-400`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={t?.passwordPlaceholder || 'পাসওয়ার্ড'}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.password ? 'border-red-300' : 'border-gray-300'} py-2 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base placeholder-gray-400`}
                    />
                    <button
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder={t?.confirmPasswordPlaceholder || 'পাসওয়ার্ড নিশ্চিত করুন'}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} py-2 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base placeholder-gray-400`}
                    />
                    <button
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <div className="relative">
                    <FaUserFriends className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type="text"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleInputChange}
                      placeholder={t?.referralCodePlaceholder || 'রেফারেল কোড (ঐচ্ছিক)'}
                      className="w-full bg-gray-50 text-gray-800 border border-gray-300 py-2 pl-10 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base placeholder-gray-400"
                    />
                    {referralCodeChecking && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800"></div>
                      </div>
                    )}
                    {referralCodeError && !referralCodeChecking && (
                      <p className="text-red-500 text-xs mt-1">{referralCodeError}</p>
                    )}
                    {referrerInfo && !referralCodeChecking && (
                      <p className="text-green-600 text-xs mt-1">{t?.referrer || 'রেফারার'}: {referrerInfo.username}</p>
                    )}
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={formData.referralCode && !referralCodeValid}
                    className={`w-full bg-gray-800 hover:bg-gray-900 text-white px-[20px] py-[10px] rounded-lg font-medium transition-colors ${
                      formData.referralCode && !referralCodeValid ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {t?.register || 'নিবন্ধন করুন'}
                  </button>

                  <div className="text-center text-sm text-gray-500">
                    {language?.code === 'bn' ? (
                      <>
                        নিবন্ধন করে, আপনি আমাদের <a href="#" className="text-gray-600 hover:text-gray-800 underline">শর্তাবলী</a> এবং <a href="#" className="text-gray-600 hover:text-gray-800 underline">গোপনীয়তা নীতি</a> স্বীকার করেছেন
                      </>
                    ) : (
                      <>
                        By registering, you agree to our <a href="#" className="text-gray-600 hover:text-gray-800 underline">terms</a> and <a href="#" className="text-gray-600 hover:text-gray-800 underline">privacy policy</a>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'forgot-password' && (
                <div className="space-y-4">
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t?.emailPlaceholder || 'আপনার ইমেইল ঠিকানা'}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.email ? 'border-red-300' : 'border-gray-300'} py-2 pl-10 pr-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base placeholder-gray-400`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <button
                    onClick={handleForgotPassword}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white px-[20px] py-[10px] rounded-lg font-medium transition-colors"
                  >
                    {t?.resetPassword || 'পাসওয়ার্ড রিসেট করুন'}
                  </button>

                  <button
                    onClick={() => setActiveTab('login')}
                    className="flex items-center justify-center w-full text-gray-600 hover:text-gray-800 cursor-pointer text-sm"
                  >
                    <FaArrowLeft className="mr-1" /> {t?.backToLogin || 'লগইন পৃষ্ঠায় ফিরে যান'}
                  </button>
                </div>
              )}

              {activeTab === 'reset-password' && (
                <div className="space-y-4">
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={t?.passwordPlaceholder || 'নতুন পাসওয়ার্ড'}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.password ? 'border-red-300' : 'border-gray-300'} py-2 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base placeholder-gray-400`}
                    />
                    <button
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-gray-400 text-sm md:text-base" />
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder={t?.confirmPasswordPlaceholder || 'পাসওয়ার্ড নিশ্চিত করুন'}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} py-2 pl-10 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base placeholder-gray-400`}
                    />
                    <button
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <button
                    onClick={handleResetPassword}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white px-[20px] py-[10px] rounded-lg font-medium transition-colors"
                  >
                    {t?.changePassword || 'পাসওয়ার্ড পরিবর্তন করুন'}
                  </button>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200">
              <div className="text-center text-sm text-gray-500">
                {activeTab === 'login' ? (
                  <>
                    {t?.noAccount || 'অ্যাকাউন্ট নেই?'}{' '}
                    <button onClick={() => setActiveTab('register')} className="text-gray-600 hover:text-gray-800 underline cursor-pointer">
                      {t?.register || 'নিবন্ধন করুন'}
                    </button>
                  </>
                ) : (
                  <>
                    {t?.haveAccount || 'ইতিমধ্যে অ্যাকাউন্ট আছে?'}{' '}
                    <button onClick={() => setActiveTab('login')} className="text-gray-600 hover:text-gray-800 underline cursor-pointer">
                      {t?.login || 'লগইন করুন'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showOtpModal && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-gray-800 text-xl font-semibold">{t?.verifyOtp || 'OTP যাচাই করুন'}</h2>
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp(['', '', '', '', '', '']);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center">
                {t?.otpMessage || '৬-অংকের OTP কোডটি ইমেইলে পাঠানো হয়েছে'}: {otpEmail}
              </p>

              <div className="flex justify-center space-x-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-11 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 text-center text-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full bg-gray-800 hover:bg-gray-900 text-white px-[20px] py-[10px] rounded-lg font-medium mb-4 transition-colors"
              >
                {t?.verifyOtp || 'যাচাই করুন'}
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-gray-500 text-sm">
                    {countdown}{t?.resendTimer || ' সেকেন্ড পর নতুন OTP পাঠানো যাবে'}
                  </p>
                ) : (
                  <button onClick={resendOtp} className="text-gray-600 hover:text-gray-800 underline cursor-pointer text-sm">
                    {t?.resendOtp || 'OTP পুনরায় পাঠান'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Popup Component
// Popup Component
const Popup = ({ onClose, selectedMenu, activeLeftTab, setActiveLeftTab }) => {
  const { t } = useContext(LanguageContext);

  const leftMenuItemsKeys = [
    'myAccount',
    'deposit',
    'withdrawal',
    'bettingRecord',
    'accountRecord',
    'rewardCenter',
    'inviteFriend',
    'kyc', // Added KYC tab here
    'loginPasswordUpdate',
    'transactionPasswordUpdate',
  ];

  const leftMenuItems = leftMenuItemsKeys.map(key => {
    if (key === 'kyc') return t?.kyc || 'KYC';
    return t?.[key] || key;
  });

  return (
    <div className="fixed top-0 left-0 inset-0 z-[1000] w-full h-screen bg-black/30 flex items-center justify-center p-4">
      <div className="bg-white text-gray-800 w-full max-w-6xl h-[90vh] rounded-xl shadow-xl overflow-hidden relative">
        <button
          className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-600 text-2xl z-10"
          onClick={onClose}
        >
          <IoClose />
        </button>

        <div className="flex h-full">
          <div className="w-64 bg-gray-50 text-gray-800 p-5 overflow-y-auto border-r border-gray-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-700">{t?.personalCenter || 'পার্সোনাল সেন্টার'}</h2>
            </div>
            <ul className="space-y-3">
              {leftMenuItems.map((item, index) => (
                <li
                  key={index}
                  className={`py-2.5 px-3 rounded-lg border-[1px] cursor-pointer transition-all text-sm ${
                    item === activeLeftTab
                      ? 'bg-theme_color2 border-theme_color2 text-white font-medium'
                      : ' border-gray-200 text-gray-600'
                  }`}
                  onClick={() => setActiveLeftTab(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-white">
            {activeLeftTab === (t?.myAccount || 'আমার অ্যাকাউন্ট') ? (
              <AccountTabContent />
            ) : activeLeftTab === (t?.deposit || 'ডিপোজিট') ? (
              <DepositTabContent />
            ) : activeLeftTab === (t?.withdrawal || 'উত্তোলন') ? (
           <WithdrawalTabContent setActiveLeftTab={setActiveLeftTab} /> 
            ) : activeLeftTab === (t?.bettingRecord || 'বেটিং রেকর্ড') ? (
              <BettingRecordTabContent />
            ) : activeLeftTab === (t?.accountRecord || 'অ্যাকাউন্ট রেকর্ড') ? (
              <AccountRecordTabContent />
            ) : activeLeftTab === (t?.rewardCenter || 'পুরস্কার কেন্দ্র') ? (
              <RewardCenterTabContent />
            ) : activeLeftTab === (t?.inviteFriend || 'বন্ধুকে আমন্ত্রণ') ? (
              <InviteFriendTabContent />
            ) : activeLeftTab === (t?.kyc || 'KYC') ? (
              <KYCTabContent />
            ) : activeLeftTab === (t?.loginPasswordUpdate || 'লগইন পাসওয়ার্ড আপডেট') ? (
              <LoginPasswordUpdateTabContent />
            ) : activeLeftTab === (t?.transactionPasswordUpdate || 'ট্রানজেকশন পাসওয়ার্ড আপডেট') ? (
              <TransactionPasswordUpdateTabContent />
            ) : (
              <DefaultTabContent activeLeftTab={activeLeftTab} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Invite Popup Component
const InvitePopup = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('invite');
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState({
    referralCode: '',
    totalReferrals: 0,
    referralEarnings: 0,
    referredUsers: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { userData } = useUser();
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const { t } = useContext(LanguageContext);

  const referralLink = `${window.location.origin}/?refer_code=${userData?.referralCode || ''}`;

  useEffect(() => {
    if (userData?._id && (activeTab === 'list' || activeTab === 'reward')) {
      fetchReferralData();
    }
  }, [activeTab, userData]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/user/referred-users-details/${userData?._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) setReferralData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || t?.error || 'Failed to load referral data');
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
    const text = `${t?.shareLink || 'Join using my referral link and get bonus'}: ${referralLink}`;
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('bn-BD', { minimumFractionDigits: 2 }).format(amount || 0);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white p-5 rounded-xl border border-gray-200 max-w-xl w-full relative shadow-lg">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" onClick={onClose}>
          <FaTimes />
        </button>

        <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.inviteFriend || 'বন্ধুকে আমন্ত্রণ করুন'}</h3>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {['invite', 'list', 'reward'].map((tab) => (
              <button
                key={tab}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors ${
                  activeTab === tab ? 'bg-gray-200 text-gray-800' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'invite' && <FaUser size={12} />}
                {tab === 'list' && <FaHistory size={12} />}
                {tab === 'reward' && <FaCoins size={12} />}
                {tab === 'invite' && (t?.inviteFriend || 'আমন্ত্রণ')}
                {tab === 'list' && (t?.invitedList || 'আমন্ত্রিত তালিকা')}
                {tab === 'reward' && (t?.reward || 'পুরস্কার')}
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-800"></div>
              <p className="mt-2 text-gray-500 text-sm">{t?.loading || 'লোড হচ্ছে...'}</p>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          {!loading && activeTab === 'invite' && (
            <div>
              <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                <h4 className="font-medium mb-2 text-gray-700">{t?.referralLink || 'আপনার রেফারেল লিঙ্ক'}</h4>
                <div className="flex items-center gap-2">
                  <input type="text" className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm" value={referralLink} readOnly />
                  <button className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm transition-colors" onClick={handleCopyLink}>
                    {copied ? <FaCheck /> : <FaCopy />} {copied ? (t?.copied || 'কপি হয়েছে') : (t?.copy || 'কপি করুন')}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium mb-2 text-gray-700">{t?.shareSocial || 'সোশ্যাল মিডিয়ায় শেয়ার করুন'}</h4>
                <div className="flex gap-2">
                  {[
                    { platform: 'facebook', icon: FaFacebookF, color: 'bg-gray-700 hover:bg-gray-800' },
                    { platform: 'twitter', icon: FaTwitter, color: 'bg-gray-700 hover:bg-gray-800' },
                    { platform: 'telegram', icon: FaTelegramPlane, color: 'bg-gray-700 hover:bg-gray-800' },
                    { platform: 'whatsapp', icon: FaWhatsapp, color: 'bg-gray-700 hover:bg-gray-800' }
                  ].map(({ platform, icon: Icon, color }) => (
                    <button
                      key={platform}
                      className={`${color} text-white p-2 rounded-lg transition-colors`}
                      onClick={() => shareOnSocialMedia(platform)}
                    >
                      <Icon />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-gray-200">
                <h4 className="font-medium mb-2 text-gray-700">{t?.referralRules || 'রেফারেল নিয়ম'}</h4>
                <ul className="list-disc pl-5 text-sm text-gray-500 space-y-1">
                  <li>{t?.rule1 || 'আপনার আমন্ত্রিত বন্ধুকে ন্যূনতম ১০০ টাকা ডিপোজিট করতে হবে'}</li>
                  <li>{t?.rule2 || 'আপনার আমন্ত্রিত বন্ধুকে ন্যূনতম ৩টি বেট প্লেস করতে হবে'}</li>
                </ul>
              </div>
            </div>
          )}

          {!loading && activeTab === 'list' && (
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.username || 'ব্যবহারকারীর নাম'}</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.joinDate || 'যোগদানের তারিখ'}</th>
                    <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.reward || 'পুরস্কার'}</th>
                  </tr>
                </thead>
                <tbody>
                  {referralData.referredUsers?.length > 0 ? (
                    referralData.referredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center"><FaUser size={12} className="text-gray-500" /></div>
                            <span className="text-sm font-medium text-gray-700">{user.username}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3 border-b border-gray-200 text-sm text-gray-600">{new Date(user.joinDate).toLocaleDateString('bn-BD')}</td>
                        <td className="py-2 px-3 border-b border-gray-200 text-sm font-medium text-gray-700">৳{formatCurrency(user.earnedAmount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="py-6 text-center text-gray-500 text-sm">{t?.noFriends || 'কোন আমন্ত্রিত বন্ধু পাওয়া যায়নি'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && activeTab === 'reward' && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">{t?.totalInvites || 'মোট আমন্ত্রণ'}</p>
                  <p className="text-lg font-bold text-gray-800">{referralData.totalReferrals || 0}</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500">{t?.totalEarnings || 'মোট আয়'}</p>
                  <p className="text-lg font-bold text-gray-800">৳{formatCurrency(referralData.referralEarnings)}</p>
                </div>
              </div>
              {referralData.referralEarnings > 999 ? (
                <div>
                  <p className="text-sm text-gray-600 mb-2">{t?.eligibleMessage || 'আপনি রেফারেল বোনাসের জন্য যোগ্য!'}</p>
                  <button className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    {t?.addToMainBalance || 'মেইন বালেন্সে যোগ করুন'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">{t?.notEligible || 'আপনি এখনও রেফারেল বোনাসের জন্য যোগ্য নন'}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Account Tab Content Component
// Account Tab Content Component
const AccountTabContent = () => {
  const { t } = useContext(LanguageContext);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showTransactionPassword, setShowTransactionPassword] = useState(false);
  const [selectedTab, setSelectedTab] = useState(t?.personalInfo || 'ব্যক্তিগত তথ্য');
  const [editableUsername, setEditableUsername] = useState('');
  const [editablePhone, setEditablePhone] = useState('');
  const [editableDob, setEditableDob] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingDob, setIsEditingDob] = useState(false);
  const [hasDobBeenUpdated, setHasDobBeenUpdated] = useState(false);
  const [hasUsernameBeenUpdated, setHasUsernameBeenUpdated] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '', field: '' });
  const { userData, loading, error, fetchUserData } = useUser();

  const tabs = [t?.personalInfo || 'ব্যক্তিগত তথ্য'];

  useEffect(() => {
    if (userData?.username) {
      setEditableUsername(userData.username);
      // Check if username has been updated/customized (not the default one)
      // You can add logic here to determine if it's a default username
      setHasUsernameBeenUpdated(true);
    }
    if (userData?.phone) setEditablePhone(userData.phone);
    if (userData?.dateOfBirth) {
      // Format date for input field (YYYY-MM-DD)
      const dob = new Date(userData.dateOfBirth);
      const formattedDob = dob.toISOString().split('T')[0];
      setEditableDob(formattedDob);
      
      // Check if date of birth has been set/updated before
      setHasDobBeenUpdated(true);
    } else {
      setHasDobBeenUpdated(false);
    }
  }, [userData]);

  const formatBalance = (amount) => {
    if (amount === undefined || amount === null) return '০.০০';
    return new Intl.NumberFormat('bn-BD', { minimumFractionDigits: 2 }).format(amount);
  };

  const handleUsernameUpdate = async () => {
    try {
      const base_url = import.meta.env.VITE_API_KEY_Base_URL;
      await axios.put(`${base_url}/user/update-username`, {
        userId: userData._id,
        newUsername: editableUsername
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setFeedback({ type: 'success', message: t?.usernameUpdateSuccess || 'ব্যবহারকারীর নাম আপডেট করা হয়েছে', field: 'personalInfo' });
      setIsEditingUsername(false);
      setHasUsernameBeenUpdated(true); // Mark as updated after successful API call
      fetchUserData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || t?.error || 'ব্যর্থ হয়েছে', field: 'personalInfo' });
    }
  };

  const handlePhoneUpdate = async () => {
    try {
      const base_url = import.meta.env.VITE_API_KEY_Base_URL;
      await axios.put(`${base_url}/user/update-phone`, {
        userId: userData._id,
        phone: editablePhone
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setFeedback({ type: 'success', message: 'ফোন নম্বর আপডেট করা হয়েছে', field: 'personalInfo' });
      setIsEditingPhone(false);
      fetchUserData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'ব্যর্থ হয়েছে', field: 'personalInfo' });
    }
  };

  const handleDobUpdate = async () => {
    try {
      const base_url = import.meta.env.VITE_API_KEY_Base_URL;
      await axios.put(`${base_url}/user/update-dob`, {
        userId: userData._id,
        dateOfBirth: editableDob
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setFeedback({ type: 'success', message: 'জন্ম তারিখ আপডেট করা হয়েছে', field: 'personalInfo' });
      setIsEditingDob(false);
      setHasDobBeenUpdated(true); // Mark as updated after successful API call
      fetchUserData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'ব্যর্থ হয়েছে', field: 'personalInfo' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-t-gray-800 border-b-gray-800 border-l-transparent border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="text-gray-800">
      {/* Profile Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <img src={getProfileImage(userData?.username)} alt="User" className="w-14 h-14 rounded-full border-2 border-gray-300 object-cover" />
          <div>
            <h3 className="text-lg font-bold text-gray-800">{userData?.username || 'N/A'}</h3>
            <p className="text-sm text-gray-500">{t?.playerId || 'আইডি'}: {userData?.player_id}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        {selectedTab === tabs[0] && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-gray-700">{t?.personalInfo || 'ব্যক্তিগত তথ্য'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">{t?.mainBalance || 'মেইন ব্যালেন্স'}</p>
                <p className="text-base font-bold text-gray-800">{formatBalance(userData?.balance)} ৳</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500">{t?.bonusBalance || 'বোনাস ব্যালেন্স'}</p>
                <p className="text-base font-bold text-gray-800">{formatBalance(userData?.bonusBalance)} ৳</p>
              </div>
            </div>

            {feedback.field === 'personalInfo' && (
              <div className={`mb-3 p-2 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {feedback.message}
              </div>
            )}

            <div className="space-y-4">
              {/* Player ID - Read Only with Lock Icon on Right */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t?.playerId || 'প্লেয়ার আইডি'}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full px-2 py-2.5 pr-8 border border-gray-300 rounded-lg outline-none bg-gray-100 text-gray-700 text-[15px] cursor-not-allowed" 
                    value={userData?.player_id || 'N/A'} 
                    readOnly 
                  />
                  <FaLock className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                </div>
              </div>

              {/* Email - Read Only with Lock Icon on Right */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t?.email || 'ইমেইল'}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full px-2 py-2.5 pr-8 border border-gray-300 rounded-lg outline-none bg-gray-100 text-gray-700 text-[15px] cursor-not-allowed" 
                    value={userData?.email || 'N/A'} 
                    readOnly 
                  />
                  <FaLock className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                </div>
              </div>

              {/* Phone Number - Read Only with Lock Icon (Cannot Update) */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t?.mobileNumber || 'মোবাইল নম্বর'}</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-2 py-2.5 pr-8 border border-gray-300 rounded-lg outline-none bg-gray-100 text-gray-700 text-[15px] cursor-not-allowed"
                    value={editablePhone || userData?.phone || 'N/A'}
                    readOnly
                    placeholder="01XXXXXXXXX"
                  />
                  <FaLock className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                </div>
              </div>

              {/* Date of Birth - Editable only once, then locked */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t?.dateOfBirth || 'জন্ম তারিখ'}</label>
                {hasDobBeenUpdated ? (
                  // Show locked version if already updated
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-2 py-2.5 pr-8 border border-gray-300 rounded-lg outline-none bg-gray-100 text-gray-700 text-[15px] cursor-not-allowed"
                      value={editableDob ? new Date(editableDob).toLocaleDateString('bn-BD', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                      readOnly
                    />
                    <FaLock className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  </div>
                ) : (
                  // Show editable version if never updated
                  <div className="flex gap-2">
                    <input
                      type="date"
                      className={`flex-1 px-2 py-2.5 border rounded-lg text-[15px] outline-theme_color2 ${isEditingDob ? 'border-gray-400 bg-white' : 'border-gray-300 bg-gray-100'}`}
                      value={editableDob}
                      onChange={(e) => setEditableDob(e.target.value)}
                      readOnly={!isEditingDob}
                      max={new Date().toISOString().split('T')[0]} // Prevent future dates
                    />
                    {isEditingDob ? (
                      <>
                        <button onClick={handleDobUpdate} className="bg-theme_color2 text-white px-3 py-1 rounded-lg text-sm transition-colors">{t?.save || 'সংরক্ষণ'}</button>
                        <button onClick={() => setIsEditingDob(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm transition-colors">{t?.cancel || 'বাতিল'}</button>
                      </>
                    ) : (
                      <button onClick={() => setIsEditingDob(true)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm transition-colors">{t?.edit || 'সম্পাদনা'}</button>
                    )}
                  </div>
                )}
              </div>

              {/* Username - Editable only once, then locked */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t?.username || 'ব্যবহারকারীর নাম'}</label>
                {hasUsernameBeenUpdated ? (
                  // Show locked version if already updated
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-2 py-2.5 pr-8 border border-gray-300 rounded-lg outline-none bg-gray-100 text-gray-700 text-[15px] cursor-not-allowed"
                      value={editableUsername || 'N/A'}
                      readOnly
                    />
                    <FaLock className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                  </div>
                ) : (
                  // Show editable version if never updated
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`flex-1 px-2 py-2.5 border rounded-lg text-[15px] outline-theme_color2 ${isEditingUsername ? 'border-gray-400 bg-white' : 'border-gray-300 bg-gray-100'}`}
                      value={editableUsername}
                      onChange={(e) => setEditableUsername(e.target.value)}
                      readOnly={!isEditingUsername}
                      placeholder="Enter username"
                    />
                    {isEditingUsername ? (
                      <>
                        <button onClick={handleUsernameUpdate} className="bg-theme_color2 text-white px-3 py-1 rounded-lg text-sm transition-colors">{t?.save || 'সংরক্ষণ'}</button>
                        <button onClick={() => setIsEditingUsername(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm transition-colors">{t?.cancel || 'বাতিল'}</button>
                      </>
                    ) : (
                      <button onClick={() => setIsEditingUsername(true)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm transition-colors">{t?.edit || 'সম্পাদনা'}</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedTab === tabs[1] && (
          <div>
            <h3 className="text-md font-semibold mb-3 text-gray-700">{t?.passwordUpdate || 'পাসওয়ার্ড আপডেট'}</h3>
            <div className="bg-white p-3 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-2 text-gray-700 flex items-center gap-2">
                <FaLock className="text-gray-400" /> {t?.changeLoginPassword || 'লগইন পাসওয়ার্ড পরিবর্তন করুন'}
              </h4>
              {feedback.field === 'loginPassword' && (
                <div className={`mb-2 p-2 rounded-lg text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {feedback.message}
                </div>
              )}
              <form className="space-y-3">
                <div className="relative">
                  <input type={showLoginPassword ? "text" : "password"} className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm" placeholder={t?.currentPasswordPlaceholder || 'বর্তমান পাসওয়ার্ড'} />
                  <button type="button" className="absolute right-2 top-2 text-gray-400 hover:text-gray-600" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                    {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="password" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm" placeholder={t?.newPasswordPlaceholder || 'নতুন পাসওয়ার্ড'} />
                  <input type="password" className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm" placeholder={t?.confirmPasswordPlaceholder || 'পাসওয়ার্ড নিশ্চিত করুন'} />
                </div>
                <button type="submit" className="bg-theme_color2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">{t?.changePasswordButton || 'পাসওয়ার্ড পরিবর্তন করুন'}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// Deposit Tab Content
// Deposit Tab Content
const DepositTabContent = () => {
  const { t, language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bkash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userData, fetchUserData } = useUser();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const base_url2 = import.meta.env.VITE_API_KEY_Base_URL2;
  const frontend_url = import.meta.env.VITE_API_KEY_Frotend_URL;
  const amounts = [500, 800, 1500, 2000, 5000];
  const [availableBonuses, setAvailableBonuses] = useState([]);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [autoPaymentStatus, setAutoPaymentStatus] = useState(false);
  const [autoPaymentLoading, setAutoPaymentLoading] = useState(true);
  
  // Refs for mouse drag scrolling
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Bonus gradients and emojis
  const bonusGradients = [
    'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
  ];

  const bonusEmojis = ['🎁', '💎', '🔥', '⚡', '🎯', '🚀'];

  // Mouse drag handlers for horizontal scrolling
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    scrollContainerRef.current.style.cursor = 'grabbing';
    scrollContainerRef.current.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    scrollContainerRef.current.style.cursor = 'grab';
    scrollContainerRef.current.style.removeProperty('user-select');
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      scrollContainerRef.current.style.cursor = 'grab';
      scrollContainerRef.current.style.removeProperty('user-select');
    }
  };

  const formatNumber = (number) => {
    if (number === undefined || number === null) return language?.code === 'bn' ? '০' : '0';
    return new Intl.NumberFormat(language?.code === 'bn' ? 'bn-BD' : 'en-US').format(number);
  };

  // Fetch auto payment status
  useEffect(() => {
    const fetchAutoPaymentStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${base_url}/user/auto-payment-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) setAutoPaymentStatus(response.data.status);
      } catch (err) {
        setAutoPaymentStatus(false);
      } finally {
        setAutoPaymentLoading(false);
      }
    };
    fetchAutoPaymentStatus();
  }, []);

  // Fetch available bonuses
  useEffect(() => {
    const fetchAvailableBonuses = async () => {
      try {
        setBonusLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        if (!user || !user._id) return;
        const response = await axios.get(`${base_url}/user/bonuses/available`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userid: user._id }
        });
        if (response.data) setAvailableBonuses(response.data.data || []);
      } catch (err) {
        console.error("Error fetching bonuses:", err);
      } finally {
        setBonusLoading(false);
      }
    };
    fetchAvailableBonuses();
  }, []);

  // Calculate bonus amount
  const calculateBonusAmount = (bonus) => {
    if (!amount || isNaN(parseFloat(amount))) return 0;
    const amountNum = parseFloat(amount);
    let calculatedBonus = 0;
    
    if (bonus.percentage > 0) {
      calculatedBonus = (amountNum * bonus.percentage) / 100;
      if (bonus.maxBonus && calculatedBonus > bonus.maxBonus) calculatedBonus = bonus.maxBonus;
    } else if (bonus.amount > 0) {
      calculatedBonus = bonus.amount;
    }
    return calculatedBonus;
  };

  // Handle deposit
  const handleDeposit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!amount) {
      setErrorMessage(t?.enterAmountError || 'অনুগ্রহ করে পরিমাণ লিখুন');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      setErrorMessage(t?.invalidAmountError || 'অবৈধ পরিমাণ');
      return;
    }

    if (amountNum < 300) {
      setErrorMessage(t?.minimumDepositError || 'ন্যূনতম ডিপোজিট ৩০০ টাকা');
      return;
    }

    if (amountNum > 30000) {
      setErrorMessage(t?.maximumDepositError || 'সর্বোচ্চ ডিপোজিট ৩০,০০০ টাকা');
      return;
    }

    if (!/^\d+$/.test(amount)) {
      setErrorMessage(t?.numericAmountError || 'শুধুমাত্র সংখ্যা লিখুন');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare bonus data
      let bonusData = {
        bonusType: 'none',
        bonusId: null,
        bonusCode: null,
        bonusAmount: 0,
        bonusName: null,
        bonusPercentage: 0,
        bonusMaxAmount: 0,
        wageringRequirement: 0,
        balanceType: 'main_balance',
        waigergamecategory: [],
        gameCategory: null
      };

      if (selectedBonus && selectedBonus !== 'none') {
        const calculatedAmount = calculateBonusAmount(selectedBonus);
        
        // Check minimum deposit for bonus
        if (selectedBonus.minDeposit && amountNum < selectedBonus.minDeposit) {
          setErrorMessage(`এই বোনাসের জন্য ন্যূনতম ডিপোজিট ${selectedBonus.minDeposit} টাকা`);
          setIsSubmitting(false);
          return;
        }

        bonusData = {
          bonusType: selectedBonus.type || selectedBonus.bonusType || 'custom',
          bonusId: selectedBonus._id || selectedBonus.id,
          bonusCode: selectedBonus.bonusCode || selectedBonus.code,
          bonusAmount: calculatedAmount,
          bonusName: selectedBonus.name || selectedBonus.title,
          bonusPercentage: selectedBonus.percentage || 0,
          bonusMaxAmount: selectedBonus.maxBonus || 0,
          wageringRequirement: selectedBonus.wageringRequirement || 0,
          balanceType: selectedBonus.balanceType || 'bonus_balance',
          waigergamecategory: selectedBonus.waigergamecategory || selectedBonus.gamesCategory || selectedBonus.gameCategories || [],
          gameCategory: selectedBonus.gameCategory || null
        };
      }

      const token = localStorage.getItem("token");
      
      // Generate order ID
      let orderCounter = (Date.now() % 1000) * 1000;
      const generateOrderId = () => {
        orderCounter = (orderCounter + 1) % 1000000;
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const randomStr2 = Math.random().toString(36).substring(2, 15);
        const userPart = userData?._id?.slice(-6) || '000000';
        return `DEP${timestamp}${orderCounter}${randomStr}${randomStr2}${userPart}`;
      };
      
      const orderId = generateOrderId();

      // Prepare payload
      const payload = {
        method: selectedMethod || 'bkash',
        amount: amountNum,
        bonusType: bonusData.bonusType,
        bonusId: bonusData.bonusId,
        bonusCode: bonusData.bonusCode,
        bonusAmount: bonusData.bonusAmount,
        bonusName: bonusData.bonusName,
        bonusPercentage: bonusData.bonusPercentage,
        bonusMaxAmount: bonusData.bonusMaxAmount,
        wageringRequirement: bonusData.wageringRequirement,
        balanceType: bonusData.balanceType,
        userid: userData._id,
        playerbalance: userData.balance || 0,
        waigergamecategory: bonusData.waigergamecategory,
        gameCategory: bonusData.gameCategory,
        orderId
      };

      // Handle Bkash Fast payment
      if (selectedMethod === 'bkash_fast') {
        const initiateResponse = await axios.post(`${base_url}/user/initiate`, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });

        if (initiateResponse.data.success) {
          const bkashFastResponse = await axios.post(`${base_url2}/api/payment/p2c/bkash/payment`, {
            orderId,
            payerId: userData.player_id,
            amount: amountNum,
            player_id: userData.player_id,
            currency: 'BDT',
            redirectUrl: `${frontend_url}`,
            callbackUrl: `${frontend_url}/callback-payment`,
            sitecallback: `${base_url}/user/callback`,
            transactionId: initiateResponse.data.transactionId,
            paymentId: initiateResponse.data.paymentId
          }, {
            headers: { 
              Authorization: `Bearer ${token}`, 
              'x-api-key': localStorage.getItem("apiKey") || "18e5f948356de68e2909", 
              'Content-Type': 'application/json' 
            }
          });

          if (bkashFastResponse.data.success && bkashFastResponse.data.link) {
            setSuccessMessage(t?.paymentInitiatedSuccess || 'পেমেন্ট শুরু হয়েছে');
            
            // Save deposit info
            localStorage.setItem('lastDeposit', JSON.stringify({
              amount: amountNum,
              bonus: bonusData,
              method: 'bkash_fast',
              paymentId: bkashFastResponse.data.paymentId || initiateResponse.data.paymentId,
              orderId: bkashFastResponse.data.orderId || orderId,
              transactionId: initiateResponse.data.transactionId,
              timestamp: new Date().toISOString()
            }));

            // Redirect to payment page
            window.location.href = bkashFastResponse.data.link;
          } else {
            setErrorMessage(bkashFastResponse.data.message || t?.paymentInitiateError || 'পেমেন্ট শুরু করতে সমস্যা হয়েছে');
          }
        } else {
          setErrorMessage(initiateResponse.data.message || t?.paymentInitiateError || 'পেমেন্ট শুরু করতে সমস্যা হয়েছে');
        }
        setIsSubmitting(false);
        return;
      }

      // Regular payment flow
      const initiateResponse = await axios.post(`${base_url}/user/initiate`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (initiateResponse.data.success && initiateResponse.data.redirectUrl) {
        setSuccessMessage(t?.paymentInitiatedSuccess || 'পেমেন্ট শুরু হয়েছে');
        
        // Save deposit info
        localStorage.setItem('lastDeposit', JSON.stringify({
          amount: amountNum,
          bonus: bonusData,
          waigergamecategory: bonusData.waigergamecategory,
          gameCategory: bonusData.gameCategory,
          transactionId: initiateResponse.data.transactionId,
          paymentId: initiateResponse.data.paymentId,
          timestamp: new Date().toISOString()
        }));

        // Redirect to payment page
        window.location.href = initiateResponse.data.redirectUrl;
      } else {
        setErrorMessage(initiateResponse.data.message || t?.paymentInitiateError || 'পেমেন্ট শুরু করতে সমস্যা হয়েছে');
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage(error.response.data.message || t?.paymentFailedError || 'পেমেন্ট ব্যর্থ হয়েছে');
        } else if (error.response.status === 401) {
          setErrorMessage(t?.sessionExpiredError || "সেশন শেষ হয়ে গেছে। অনুগ্রহ করে আবার লগইন করুন।");
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setErrorMessage(error.response.data?.message || t?.paymentFailedError || 'পেমেন্ট ব্যর্থ হয়েছে');
        }
      } else {
        setErrorMessage(t?.networkError || "নেটওয়ার্ক সমস্যা। আপনার সংযোগ পরীক্ষা করুন।");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.deposit || 'ডিপোজিট'}</h3>

      {/* Payment Method Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t?.paymentMethod || 'পেমেন্ট মেথড'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Bkash */}
          <button
            onClick={() => setSelectedMethod('bkash')}
            className={`rounded-lg border-2 p-2 flex cursor-pointer flex-col items-center gap-1 transition-all ${
              selectedMethod === 'bkash'
                ? 'border-cyan-400 bg-cyan-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <img
              src="https://images.5949390294.com/mcs-images/bank_type/BKASH/BN_2_20240312225413337.png"
              alt="bkash"
              className="w-[50px] object-contain"
            />
            <span className="text-xs font-medium text-gray-600">{t?.bkash || 'Bkash'}</span>
          </button>

          {/* Nagad */}
          <button
            onClick={() => setSelectedMethod('nagad')}
            className={`rounded-lg border-2 p-2 flex cursor-pointer flex-col items-center gap-1 transition-all ${
              selectedMethod === 'nagad'
                ? 'border-cyan-400 bg-cyan-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <img
              src="https://images.5949390294.com/mcs-images/bank_type/NAGAD/BN_2_20240312230148421.png"
              alt="nagad"
              className="w-[50px] object-contain"
            />
            <span className="text-xs font-medium text-gray-600">{t?.nagad || 'Nagad'}</span>
          </button>

          {/* Bkash Fast (conditional) */}
          {!autoPaymentLoading && autoPaymentStatus && (
            <button
              onClick={() => setSelectedMethod('bkash_fast')}
              className={`rounded-lg border-2 p-2 flex flex-col items-center gap-1 transition-all ${
                selectedMethod === 'bkash_fast'
                  ? 'border-cyan-400 bg-cyan-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <img
                src="https://play-lh.googleusercontent.com/1CRcUfmtwvWxT2g-xJF8s9_btha42TLi6Lo-qVkVomXBb_citzakZX9BbeY51iholWs"
                alt="bkash fast"
                className="w-10 h-6 object-contain rounded"
              />
              <span className="text-xs font-medium text-gray-600">{t?.bkashFast || 'Bkash Fast'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t?.depositAmount || 'জমার পরিমাণ'}
        </label>
        
        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
          {amounts.map((amt) => (
            <button
              key={amt}
              onClick={() => { 
                setAmount(amt.toString()); 
                setErrorMessage(''); 
              }}
              className={`bg-white border ${
                amount === amt.toString() 
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-700' 
                  : 'border-gray-300 hover:border-cyan-300'
              } px-2 py-1.5 rounded-lg cursor-pointer text-sm text-gray-700 transition-colors`}
            >
              {formatNumber(amt)} ৳
            </button>
          ))}
        </div>

        {/* Amount Input Field */}
        <div className="relative mt-2">
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || /^\d+$/.test(v)) {
                setAmount(v);
                setErrorMessage('');
              }
            }}
            className="w-full p-2.5 pr-10 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder={t?.amountPlaceholder || 'জমার পরিমাণ লিখুন'}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">৳</span>
        </div>
        
        <p className="text-xs text-gray-500 mt-1">
          *{t?.minimumAmount || 'ন্যূনতম ৩০০ - সর্বোচ্চ ৩০,০০০ টাকা'}
        </p>
      </div>

      {/* Bonus Section - Horizontal Scroll with 2 boxes and mouse drag */}
      {(availableBonuses.length > 0 || bonusLoading) && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t?.selectBonusOffer || 'বোনাস অফার নির্বাচন করুন'}
          </label>

          {bonusLoading ? (
            <div className="text-center py-4">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-cyan-500 border-r-transparent"></div>
              <p className="text-xs text-gray-400 mt-1">{t?.loadingBonuses || 'বোনাস লোড হচ্ছে...'}</p>
            </div>
          ) : (
            <>
              <div 
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className="flex gap-3 overflow-x-auto pb-2 px-1 cursor-grab select-none"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e0 #f1f5f9',
                  WebkitOverflowScrolling: 'touch',
                  scrollBehavior: isDragging ? 'auto' : 'smooth',
                }}
              >
                {/* No Bonus Option - 2 boxes width (50% each = 100% total) */}
                <button
                  onClick={() => !isDragging && setSelectedBonus(null)}
                  className="flex-shrink-0 relative rounded-xl overflow-hidden transition-all"
                  style={{
                    width: 'calc(50% - 6px)', // Exactly 2 boxes (50% each)
                    background: selectedBonus === null
                      ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                      : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                    boxShadow: selectedBonus === null
                      ? '0 4px 12px rgba(6, 182, 212, 0.3)'
                      : '0 2px 6px rgba(0,0,0,0.05)',
                    transform: selectedBonus === null ? 'scale(1.02)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Decorative circles */}
                  <div style={{
                    position: 'absolute', top: '-10px', right: '-10px',
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)'
                  }} />
                  <div style={{
                    position: 'absolute', bottom: '-6px', left: '-6px',
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)'
                  }} />
                  
                  <div className="relative p-3 flex items-center gap-2">
                    <div className="text-xl flex-shrink-0">🚫</div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className={`text-xs font-bold ${selectedBonus === null ? 'text-white' : 'text-gray-600'}`}>
                        {t?.noBonus || 'কোন বোনাস নয়'}
                      </div>
                      <div className={`text-[10px] leading-tight ${selectedBonus === null ? 'text-white/70' : 'text-gray-400'}`}>
                        {t?.noBonusDesc || 'বোনাস ছাড়া চালিয়ে যান'}
                      </div>
                    </div>
                    
                    {/* Selected checkmark */}
                    {selectedBonus === null && (
                      <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-cyan-500" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="2,6 5,9 10,3" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>

                {/* Bonus Cards - each also 50% width for exactly 2 boxes */}
                {availableBonuses.map((bonus, idx) => {
                  const calculatedAmount = calculateBonusAmount(bonus);
                  const isSelected = selectedBonus && 
                    ((selectedBonus._id && selectedBonus._id === bonus._id) || 
                     (selectedBonus.id && selectedBonus.id === bonus.id));
                  const gradient = bonusGradients[idx % bonusGradients.length];
                  const emoji = bonusEmojis[idx % bonusEmojis.length];

                  return (
                    <button
                      key={bonus._id || bonus.id}
                      onClick={() => !isDragging && setSelectedBonus(bonus)}
                      className="flex-shrink-0 relative rounded-xl overflow-hidden transition-all"
                      style={{
                        width: 'calc(50% - 6px)', // Exactly 2 boxes (50% each)
                        background: gradient,
                        boxShadow: isSelected
                          ? '0 6px 16px rgba(0,0,0,0.15)'
                          : '0 2px 6px rgba(0,0,0,0.08)',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        opacity: isSelected ? 1 : 0.9,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {/* Decorative circles */}
                      <div style={{
                        position: 'absolute', top: '-10px', right: '-10px',
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)'
                      }} />
                      <div style={{
                        position: 'absolute', bottom: '-6px', left: '-6px',
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.08)'
                      }} />
                      
                      <div className="relative p-3">
                        <div className="flex items-start gap-2">
                          <div className="text-xl flex-shrink-0">{emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-bold truncate">{bonus.name}</div>
                            <div className="text-white/80 text-[10px] mt-0.5">
                              {bonus.percentage > 0 ? `${bonus.percentage}%` : ''}
                              {bonus.maxBonus > 0 ? ` (max ${formatNumber(bonus.maxBonus)} ৳)` : ''}
                            </div>
                            {amount && calculatedAmount > 0 && (
                              <div className="text-white text-[10px] font-semibold mt-1 bg-white/20 rounded-full px-2 py-0.5 inline-block">
                                +{formatNumber(calculatedAmount)} ৳
                              </div>
                            )}
                          </div>
                          
                          {/* Selected checkmark */}
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12" stroke={gradient.includes('7c3aed') ? '#7c3aed' : '#0ea5e9'} strokeWidth="2.5">
                                <polyline points="2,6 5,9 10,3" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        {/* Minimum deposit info if exists */}
                        {bonus.minDeposit > 0 && (
                          <div className="mt-1 text-[9px] text-white/70">
                            Min: {formatNumber(bonus.minDeposit)} ৳
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {/* Scroll position indicator */}
              {availableBonuses.length > 2 && (
                <div className="flex justify-center mt-2 gap-1">
                  <div className={`h-1 rounded-full transition-all ${scrollContainerRef.current?.scrollLeft === 0 ? 'w-4 bg-cyan-400' : 'w-2 bg-gray-300'}`}></div>
                  <div className={`h-1 rounded-full transition-all ${scrollContainerRef.current?.scrollLeft > 0 ? 'w-4 bg-cyan-400' : 'w-2 bg-gray-300'}`}></div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {errorMessage}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-4 rounded-lg text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        onClick={handleDeposit}
        disabled={isSubmitting || !amount}
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t?.processing || 'প্রক্রিয়াধীন...'}
          </>
        ) : (
          t?.requestDeposit || 'ডিপোজিট করুন'
        )}
      </button>
    </div>
  );
};
// Withdrawal Tab Content
// Withdrawal Tab Content
// Withdrawal Tab Content
const WithdrawalTabContent = ({ setActiveLeftTab }) => {
  const { t, language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancelBonus, setCancelBonus] = useState(false);
  const [showBonusCancelConfirm, setShowBonusCancelConfirm] = useState(false);
  const [cancelBonusLoading, setCancelBonusLoading] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showTransactionPassword, setShowTransactionPassword] = useState(false);
  const [transactionPassword, setTransactionPassword] = useState('');
  const [bonusCountdown, setBonusCountdown] = useState(null);
  const [showTransferBonusButton, setShowTransferBonusButton] = useState(false);
  const [transferBonusLoading, setTransferBonusLoading] = useState(false);

  const { userData, loading: userLoading, error: userError, fetchUserData } = useUser();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const isWithdrawalBanned = userData?.withdrawalBanned || false;
  const banReason = userData?.withdrawalBanReason || "";
  const unbanDate = userData?.withdrawalUnbanDate;
  const isKYCCompleted = userData?.kycCompleted || false;
  const isKYCSubmitted = userData?.kycSubmitted || false;
  const showKYCVerificationMessage = isKYCSubmitted && !isKYCCompleted;

  const wageringProgress = userData?.waigeringneed && userData.waigeringneed > 0 && userData?.bonusBalance > 0
    ? Math.min(((userData?.total_bet || 0) / (userData.waigeringneed * userData.bonusBalance)) * 100, 100)
    : 0;
  const isWageringComplete = userData?.waigeringneed > 0 && userData?.bonusBalance > 0 &&
    userData?.total_bet >= userData?.waigeringneed * userData?.bonusBalance;

  const formatUnbanDate = (dateString) => {
    if (!dateString) return t?.notSpecified || 'Not specified';
    return new Date(dateString).toLocaleDateString(
      language?.code === 'bn' ? 'bn-BD' : 'en-US',
      { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    );
  };

  const getTimeUntilUnban = () => {
    if (!unbanDate) return null;
    const diffMs = new Date(unbanDate) - new Date();
    if (diffMs <= 0) return t?.banPeriodEnded || 'Ban period ended';
    const d = Math.floor(diffMs / 86400000);
    const h = Math.floor((diffMs % 86400000) / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    return language?.code === 'bn' 
      ? `${d} দিন ${h} ঘন্টা ${m} মিনিট` 
      : `${d} days ${h} hours ${m} minutes`;
  };

  const formatNumber = (number) => {
    if (number === undefined || number === null) return language?.code === 'bn' ? '০' : '0';
    return new Intl.NumberFormat(
      language?.code === 'bn' ? 'bn-BD' : 'en-US',
      { minimumFractionDigits: 2 }
    ).format(number);
  };

  // Bonus countdown timer
  useEffect(() => {
    if (userData?.bonusInfo?.activeBonuses?.length > 0) {
      const activeBonuses = userData.bonusInfo.activeBonuses.filter(b => b.status === 'active');
      if (activeBonuses.length > 0) {
        const calculateCountdown = () => {
          const expiresAt = new Date(new Date(activeBonuses[0].createdAt).getTime() + 7 * 86400000);
          const diffMs = expiresAt - new Date();
          const isTransferEligible = userData.waigeringneed > 0 && userData.bonusBalance > 0
            ? (userData.total_bet || 0) >= userData.waigeringneed * userData.bonusBalance
            : (userData.total_bet || 0) >= userData.total_deposit * 30;
          
          if (diffMs <= 0) { 
            setBonusCountdown({ expired: true }); 
            setShowTransferBonusButton(false); 
            return; 
          }
          
          setBonusCountdown({
            days: Math.floor(diffMs / 86400000),
            hours: Math.floor((diffMs % 86400000) / 3600000),
            minutes: Math.floor((diffMs % 3600000) / 60000),
            seconds: Math.floor((diffMs % 60000) / 1000),
            expired: false,
            remainingWagering: userData.waigeringneed > 0 && userData.bonusBalance > 0
              ? Math.max(0, (userData.waigeringneed * userData.bonusBalance) - (userData.total_bet || 0))
              : Math.max(0, (userData.total_deposit * 30) - (userData.total_bet || 0))
          });
          setShowTransferBonusButton(isTransferEligible && userData.bonusBalance > 0);
        };
        calculateCountdown();
        const interval = setInterval(calculateCountdown, 1000);
        return () => clearInterval(interval);
      } else { 
        setBonusCountdown(null); 
        setShowTransferBonusButton(false); 
      }
    }
  }, [userData]);

  // Fetch withdrawal history
  useEffect(() => {
    const fetchWithdrawalHistory = async () => {
      if (!userData?._id || !isKYCCompleted) {
        setHistoryLoading(false);
        return;
      }
      
      try {
        setHistoryLoading(true);
        const response = await axios.get(`${base_url}/user/withdrawal/${userData._id}`, {
          headers: { 
            'x-api-key': import.meta.env.VITE_API_KEY, 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });
        setWithdrawalHistory(response.data.data || []);
      } catch (err) {
        console.error("Error fetching withdrawal history:", err);
        setError(t?.withdrawalHistoryLoadError || 'Failed to load withdrawal history');
      } finally { 
        setHistoryLoading(false); 
      }
    };
    
    if (userData?._id && isKYCCompleted) fetchWithdrawalHistory();
  }, [userData?._id, base_url, t, isKYCCompleted]);

  const hasMobileNumber = userData?.phone;

  // Calculate withdrawal info based on user data
  const calculateWithdrawalInfo = () => {
    if (!userData) return { availableBalance: 0, commissionRate: 0, needsWagering: false };
    
    if (userData.bonusBalance > 0 && !cancelBonus) {
      return { 
        availableBalance: 0, 
        commissionRate: 0, 
        needsWagering: false, 
        hasActiveBonus: true,
        bonusBalance: userData.bonusBalance 
      };
    }
    
    if (userData.waigeringneed && userData.waigeringneed > 0 && userData.bonusBalance > 0) {
      const req = userData.waigeringneed * userData.bonusBalance;
      const done = userData.total_bet || 0;
      if (done < req) {
        const comm = userData.total_deposit > 0 && done < userData.total_deposit ? 0.2 : 0;
        return { 
          availableBalance: userData.balance, 
          commissionRate: comm, 
          needsWagering: true, 
          wageringStatus: comm > 0 ? 'less-than-deposit' : 'pending-wagering', 
          remainingWagering: req - done,
          totalDeposit: userData.total_deposit
        };
      }
      return { 
        availableBalance: userData.balance, 
        commissionRate: 0, 
        needsWagering: false, 
        wageringStatus: 'completed' 
      };
    }
    
    if (userData.total_deposit > 0) {
      const done = userData.total_bet || 0;
      const req1 = userData.total_deposit;
      const req3 = userData.total_deposit * 3;
      if (done < req1) {
        return { 
          availableBalance: 0, 
          commissionRate: 0, 
          needsWagering: true, 
          wageringStatus: 'less-than-1x', 
          remainingWagering: req1 - done,
          totalDeposit: userData.total_deposit
        };
      }
      if (done < req3) {
        return { 
          availableBalance: userData.balance, 
          commissionRate: 0.2, 
          needsWagering: true, 
          wageringStatus: 'less-than-3x', 
          remainingWagering: req3 - done,
          totalDeposit: userData.total_deposit
        };
      }
    }
    
    return { 
      availableBalance: userData.balance, 
      commissionRate: 0, 
      needsWagering: false, 
      wageringStatus: 'completed' 
    };
  };

  const { availableBalance, commissionRate, needsWagering, hasActiveBonus, remainingWagering, wageringStatus, bonusBalance } = calculateWithdrawalInfo();

  // Handle cancel bonus
  const handleCancelBonus = async () => {
    setCancelBonusLoading(true); 
    setError('');
    try {
      const response = await axios.post(`${base_url}/user/cancel-bonus`, 
        { userid: userData._id }, 
        { 
          headers: { 
            'x-api-key': import.meta.env.VITE_API_KEY, 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          } 
        }
      );
      if (response.data.success) { 
        setSuccess(response.data.message || t?.cancelBonusSuccess || 'Bonus cancelled successfully'); 
        setCancelBonus(false); 
        setShowBonusCancelConfirm(false); 
        await fetchUserData(); 
      } else {
        setError(response.data.message || t?.cancelBonusError || 'Failed to cancel bonus');
      }
    } catch (err) { 
      setError(err.response?.data?.message || t?.cancelBonusError || 'Failed to cancel bonus'); 
    } finally { 
      setCancelBonusLoading(false); 
    }
  };

  // Handle transfer bonus
  const handleTransferBonus = async () => {
    setTransferBonusLoading(true); 
    setError('');
    try {
      const response = await axios.put(`${base_url}/user/transfer-bonus-to-main-balance`, 
        { userId: userData._id }, 
        { 
          headers: { 
            'x-api-key': import.meta.env.VITE_API_KEY, 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          } 
        }
      );
      if (response.data.success) { 
        setSuccess(response.data.message || t?.transferBonusSuccess || 'Bonus transferred successfully'); 
        setShowTransferBonusButton(false); 
        await fetchUserData(); 
      } else {
        setError(response.data.message || t?.transferBonusError || 'Failed to transfer bonus');
      }
    } catch (err) { 
      setError(err.response?.data?.message || t?.transferBonusError || 'Failed to transfer bonus'); 
    } finally { 
      setTransferBonusLoading(false); 
    }
  };

  // Handle withdrawal
  const handleWithdrawal = async () => {
    setError(''); 
    setSuccess('');

    if (!amount || amount < 800) { 
      setError(t?.minimumWithdrawalError || 'Minimum withdrawal amount is 800 BDT'); 
      return; 
    }
    
    if (parseFloat(amount) > userData.balance) { 
      setError(`${t?.insufficientBalanceError || 'Insufficient balance'} ৳${formatNumber(userData.balance)}`); 
      return; 
    }
    
    if (!accountNumber) { 
      setError(t?.accountNumberRequired || 'Account number is required'); 
      return; 
    }
    
    if (!transactionPassword) { 
      setError(t?.transactionPasswordRequired || 'Transaction password is required'); 
      return; 
    }
    
    if (['bkash', 'nagad'].includes(paymentMethod) && !/^01\d{9}$/.test(accountNumber)) { 
      setError(t?.invalidAccountNumberError?.replace('{method}', paymentMethod === 'bkash' ? (t?.bkash || 'Bkash') : (t?.nagad || 'Nagad')) || 'Invalid account number'); 
      return; 
    }
    
    if (wageringStatus === 'less-than-1x') { 
      setError(t?.wagering1xError?.replace('{amount}', formatNumber(remainingWagering)) || 'Complete wagering requirement first'); 
      return; 
    }

    try {
      setLoading(true);
      const orderId = `WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const payoutResponse = await axios.post(`${base_url}/user/payout`, 
        { 
          userId: userData._id, 
          username: userData.username, 
          email: userData.email, 
          playerId: userData.player_id, 
          provider: paymentMethod, 
          amount: parseFloat(amount), 
          orderId, 
          payeeAccount: accountNumber, 
          transactionPassword, 
          wageringStatus: wageringStatus || 'completed', 
          cancelBonus, 
          waigeringneed: userData.waigeringneed, 
          total_bet: userData.total_bet 
        }, 
        { 
          headers: { 
            'x-api-key': import.meta.env.VITE_API_KEY, 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          } 
        }
      );

      if (payoutResponse.data.success) {
        setSuccess(payoutResponse.data.message || t?.withdrawalRequestSuccess || 'Withdrawal request submitted successfully');
        setAmount(''); 
        setAccountNumber(''); 
        setTransactionPassword(''); 
        setCancelBonus(false);
        await fetchUserData();
        
        // Refresh withdrawal history
        const hr = await axios.get(`${base_url}/user/withdrawal/${userData._id}`, { 
          headers: { 
            'x-api-key': import.meta.env.VITE_API_KEY, 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          } 
        });
        setWithdrawalHistory(hr.data.data || []);
      } else { 
        setError(payoutResponse.data.message || t?.withdrawalRequestError || 'Withdrawal request failed'); 
      }
    } catch (err) {
      if (err.response) {
        const msg = err.response.data.message;
        if (msg === 'Transaction password not set for this user') {
          setError(
            <span>
              {t?.transactionPasswordNotSet || 'Transaction password not set. '}
              <button 
                className="text-cyan-600 underline" 
                onClick={() => navigate('/mobile-information')}
              >
                {t?.setPasswordLink || 'Set password now'}
              </button>
            </span>
          );
        } else {
          setError(msg || t?.serverError || 'Server error occurred');
        }
      } else {
        setError(t?.networkError || "Network error. Please check your connection.");
      }
    } finally { 
      setLoading(false); 
    }
  };

  // KYC verification message
  if (showKYCVerificationMessage || (userData?.kycSubmitted === true && userData?.kycCompleted === false)) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <div className="bg-yellow-100 p-3 rounded-full inline-block mb-3">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        <h3 className="text-sm font-bold text-yellow-600 mb-2">{t?.kycVerificationRequired || "KYC verification required"}</h3>
        <p className="text-gray-500 text-xs mb-4">{t?.kycVerificationDesc || "Complete KYC verification to withdraw funds."}</p>
        <button 
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
          onClick={() => setActiveLeftTab(t?.kyc || 'KYC')}
        >
          {t?.completeKycVerification || "Complete KYC"}
        </button>
      </div>
    );
  }

  // Withdrawal banned message
  if (isWithdrawalBanned) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <div className="bg-red-100 p-3 rounded-full inline-block mb-3">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <h3 className="text-sm font-bold text-red-500 mb-1">{t?.withdrawalRestricted || 'Withdrawal Restricted'}</h3>
        <p className="text-gray-500 text-xs mb-3">{t?.withdrawalRestrictedDesc || 'Your withdrawal privilege has been restricted.'}</p>
        <div className="bg-white p-3 rounded-xl text-left text-xs mb-3">
          <p className="text-gray-400">{t?.reason || 'Reason'}</p>
          <p className="text-red-500 font-medium">{banReason || t?.noReasonSpecified || 'No reason specified'}</p>
          {unbanDate && (
            <>
              <p className="text-gray-400 mt-1">{t?.banEndDate || 'Ban end date'}</p>
              <p className="text-yellow-600 font-medium">{formatUnbanDate(unbanDate)}</p>
              <p className="text-gray-400 mt-1">{t?.timeRemaining || 'Time remaining'}</p>
              <p className="text-green-600 font-medium">{getTimeUntilUnban()}</p>
            </>
          )}
        </div>
        <p className="text-gray-400 text-xs">{t?.contactSupport || 'Contact support for assistance'}</p>
      </div>
    );
  }

  // User loading
  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
      </div>
    );
  }

  // User error
  if (userError) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="bg-red-50 border border-red-200 text-red-500 p-3 rounded-xl text-xs text-center">
          {t?.userDataError || 'Error loading user data'}: {userError}
        </div>
      </div>
    );
  }

  // No mobile number
  if (!hasMobileNumber) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <h3 className="text-sm font-bold text-gray-700 mb-2">{t?.addMobileNumber || 'Add Mobile Number'}</h3>
        <p className="text-gray-500 text-xs mb-4">{t?.addMobileNumberDesc || 'Mobile number required for withdrawals'}</p>
        <button 
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-5 rounded-lg text-sm"
          onClick={() => setActiveLeftTab(t?.myAccount || 'আমার অ্যাকাউন্ট')}
        >
          {t?.editProfile || 'Edit Profile'}
        </button>
      </div>
    );
  }

  // Disabled state based on conditions
  const isDisabled = !amount || amount < 800 || !accountNumber || !transactionPassword || loading || hasActiveBonus || wageringStatus === 'less-than-1x' || parseFloat(amount || 0) > availableBalance;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.withdrawMoney || 'টাকা উত্তোলন'}</h3>

      {/* Balance Card */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <p className="text-cyan-500 font-bold text-sm mb-1">{t?.availableBalance || 'Available Balance'}</p>
        <p className="text-2xl font-bold text-gray-800">৳ {formatNumber(availableBalance)}</p>
      </div>

      {/* Form Card */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        
        {/* Active Bonus Section */}
        {hasActiveBonus && (
          <div className="bg-red-50 border border-red-200 text-red-500 p-3 rounded-xl mb-4 text-xs">
            <p className="font-semibold mb-1">{t?.activeBonus || 'Active Bonus'}</p>
            <p className="text-gray-600">
              {(t?.activeBonusMessage || 'You have active bonus of {amount} BDT').replace('{amount}', formatNumber(userData?.bonusBalance || 0))}
            </p>
            
            {userData?.waigeringneed > 0 && userData?.bonusBalance > 0 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${wageringProgress >= 100 ? 'bg-green-500' : 'bg-yellow-400'}`} 
                    style={{ width: `${wageringProgress}%` }}
                  ></div>
                </div>
                <p className="text-gray-500 text-[10px] mt-1">
                  {(t?.wageringProgress || 'Bet: {bet}/{target} ({percent}%)')
                    .replace('{bet}', formatNumber(userData.total_bet || 0))
                    .replace('{target}', formatNumber(userData.waigeringneed * userData.bonusBalance))
                    .replace('{percent}', wageringProgress.toFixed(0))}
                </p>
              </div>
            )}

            {bonusCountdown && !bonusCountdown.expired && (
              <p className="mt-1 text-gray-500 text-[10px]">
                {t?.bonusExpiresIn || 'Bonus expires in'}: <span className="font-semibold text-yellow-600">
                  {bonusCountdown.days}d {bonusCountdown.hours}h {bonusCountdown.minutes}m
                </span>
              </p>
            )}

            {isWageringComplete && (
              <div className="mt-2 p-1.5 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 font-semibold text-[10px]">
                  {t?.wageringRequirementMet || "Wagering complete!"}
                </p>
              </div>
            )}

            <div className="mt-2 flex items-center gap-2">
              {!isWageringComplete && (
                <div className="flex items-center gap-1.5">
                  <input 
                    type="checkbox" 
                    id="cancelBonus" 
                    checked={cancelBonus} 
                    onChange={(e) => { 
                      if (e.target.checked) setShowBonusCancelConfirm(true); 
                      else setCancelBonus(false); 
                    }} 
                    className="h-3 w-3"
                  />
                  <label htmlFor="cancelBonus" className="text-[10px] text-gray-500">
                    {t?.cancelBonusCheckbox || 'Cancel bonus'}
                  </label>
                </div>
              )}
              {isWageringComplete && (
                <button 
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${
                    transferBonusLoading 
                      ? 'bg-gray-200 text-gray-400' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`} 
                  onClick={handleTransferBonus} 
                  disabled={transferBonusLoading}
                >
                  {transferBonusLoading ? '...' : (t?.transferBonus || 'Transfer to Main')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bonus Cancel Confirmation Modal */}
        {showBonusCancelConfirm && (
          <div className="bg-gray-50 border border-red-200 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">{t?.confirmCancelBonus || 'Cancel Bonus?'}</h3>
            <p className="text-gray-500 text-xs mb-2">
              {t?.cancelBonusMessage || 'Are you sure you want to cancel your bonus?'}
            </p>
            <div className="bg-white p-2 rounded-lg border border-gray-100 mb-2">
              <p className="text-cyan-500 font-semibold text-sm">৳{formatNumber(userData?.bonusBalance || 0)}</p>
            </div>
            <p className="text-red-400 text-xs mb-3">
              {t?.cancelBonusWarning || 'This action cannot be undone'}
            </p>
            <div className="flex gap-2">
              <button 
                className="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200" 
                onClick={() => { setShowBonusCancelConfirm(false); setCancelBonus(false); }} 
                disabled={cancelBonusLoading}
              >
                {t?.cancel || 'Cancel'}
              </button>
              <button 
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-xs font-semibold text-white" 
                onClick={handleCancelBonus} 
                disabled={cancelBonusLoading}
              >
                {cancelBonusLoading ? '...' : (t?.confirm || 'Confirm')}
              </button>
            </div>
          </div>
        )}

        {/* Wagering Info */}
        {needsWagering && (
          <div className="bg-purple-50 border border-purple-200 text-purple-600 p-3 rounded-xl mb-4 text-xs">
            <div className="flex items-start gap-2">
              <ImInfo className="text-sm flex-shrink-0 mt-0.5"/>
              <div>
                <p className="font-semibold mb-1">{t?.wageringRequirement || 'Wagering Requirement'}</p>
                
                {wageringStatus === 'less-than-1x' && (
                  <>
                    <p className="text-red-500">
                      {(t?.wagering1xIncomplete || 'Bet {bet}/{target}').replace('{bet}', formatNumber(userData?.total_bet || 0)).replace('{target}', formatNumber(userData?.total_deposit || 0))}
                    </p>
                    <p className="mt-1">
                      {(t?.wagering1xInstruction || 'Need {amount} more to withdraw').replace('{amount}', formatNumber(remainingWagering))}
                    </p>
                  </>
                )}
                
                {(wageringStatus === 'less-than-3x' || wageringStatus === 'less-than-deposit') && (
                  <>
                    <p>
                      {(t?.remainingWagering || 'Remaining: {amount}').replace('{amount}', formatNumber(remainingWagering))}
                    </p>
                    <p className="mt-1">
                      {t?.commissionWarning || '20% commission applies on withdrawals before 3x wagering'}
                    </p>
                    {amount && (
                      <div className="mt-1.5 bg-purple-100 p-2 rounded-lg">
                        <p>{t?.withdrawalAmount || 'Withdrawal'}: ৳{formatNumber(parseFloat(amount))}</p>
                        <p>{t?.commission || 'Commission'}: ৳{formatNumber(parseFloat(amount) * commissionRate)}</p>
                        <p className="font-bold">
                          {t?.receivable || 'Receivable'}: ৳{formatNumber(parseFloat(amount) * (1 - commissionRate))}
                        </p>
                      </div>
                    )}
                  </>
                )}
                
                {wageringStatus === 'pending-wagering' && (
                  <>
                    <p>
                      {(t?.remainingWagering || 'Remaining: {amount}').replace('{amount}', formatNumber(remainingWagering))}
                    </p>
                    <p className="mt-1">
                      {(t?.wageringInstruction || 'Complete {target} wagering requirement').replace('{target}', formatNumber(userData?.waigeringneed * userData?.bonusBalance))}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 p-3 rounded-xl mb-4 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-4 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Payment Method */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-600 mb-2">
            {t?.paymentMethod || 'Select your preferred payment method'}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* Bkash */}
            <button
              onClick={() => setPaymentMethod('bkash')}
              className={`rounded-lg border-2 p-2.5 flex flex-col items-center gap-1.5 transition-all ${
                paymentMethod === 'bkash' 
                  ? 'border-cyan-400 bg-cyan-50' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <img 
                src="https://images.5949390294.com/mcs-images/bank_type/BKASH/BN_2_20240312225413337.png" 
                alt="bkash" 
                className="w-10 h-7 object-contain"
              />
              <span className="text-[10px] font-bold text-gray-600">
                {t?.bkash || 'Bkash P2P'}
              </span>
            </button>

            {/* Nagad */}
            <button
              onClick={() => setPaymentMethod('nagad')}
              className={`rounded-lg border-2 p-2.5 flex flex-col items-center gap-1.5 transition-all ${
                paymentMethod === 'nagad' 
                  ? 'border-cyan-400 bg-cyan-50' 
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <img 
                src="https://images.5949390294.com/mcs-images/bank_type/NAGAD/BN_2_20240312230148421.png" 
                alt="nagad" 
                className="w-10 h-7 object-contain"
              />
              <span className="text-[10px] font-bold text-gray-600">
                {t?.nagad || 'Nagad P2P'}
              </span>
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {t?.withdrawalAmount || 'Enter Amount'}
          </label>
          <div className="relative">
            <input 
              type="number" 
              className="w-full border border-gray-200 rounded-lg py-3 pl-4 pr-10 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-cyan-400 focus:bg-white transition-colors" 
              placeholder={t?.amountPlaceholder || 'Minimum 800 BDT'} 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              min="800" 
              step="100"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">৳</span>
          </div>
          <p className="text-[10px] text-red-400 mt-1">
            *{t?.minimumAmount || 'Min & maximum withdrawal amount 800–25000 BDT'}
          </p>
        </div>

        {/* Account Number Input */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {paymentMethod === 'bkash' 
              ? (t?.bkashNumber || 'Bkash Number') 
              : paymentMethod === 'nagad' 
                ? (t?.nagadNumber || 'Nagad Number') 
                : 'Rocket Number'}
          </label>
          <input 
            type="text" 
            className="w-full border border-gray-200 rounded-lg py-3 px-4 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-cyan-400 focus:bg-white transition-colors" 
            placeholder={t?.bkashPlaceholder || 'Enter wallet number'} 
            value={accountNumber} 
            onChange={(e) => setAccountNumber(e.target.value)}
          />
          <p className="text-[10px] text-gray-400 mt-1">
            {t?.accountNumberFormat || 'Format: 01XXXXXXXXX'}
          </p>
        </div>

        {/* Transaction Password */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {t?.transactionPassword || 'Enter Transaction Password'}
          </label>
          <div className="relative">
            <input 
              type={showTransactionPassword ? "text" : "password"} 
              className="w-full border border-gray-200 rounded-lg py-3 pl-4 pr-10 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-cyan-400 focus:bg-white transition-colors" 
              placeholder={t?.transactionPasswordPlaceholder || 'Enter Transaction Password'} 
              value={transactionPassword} 
              onChange={(e) => setTransactionPassword(e.target.value)}
            />
            <button 
              type="button" 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setShowTransactionPassword(!showTransactionPassword)}
            >
              {showTransactionPassword ? <FaEyeSlash size={13}/> : <FaEye size={13}/>}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          className={`w-full py-3.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 ${
            isDisabled 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
              : 'bg-cyan-500 hover:bg-cyan-600 text-white'
          }`}
          onClick={handleWithdrawal}
          disabled={isDisabled}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {t?.processing || 'Processing...'}
            </>
          ) : wageringStatus === 'less-than-1x' ? (
            t?.complete1xWagering || 'Complete Wagering First'
          ) : hasActiveBonus ? (
            t?.cancelOrTransferBonus || 'Cancel or Transfer Bonus'
          ) : (
            t?.requestWithdrawal || 'Request Withdrawal'
          )}
        </button>
      </div>

      {/* Withdrawal History */}
      {isKYCCompleted && (
        <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            {t?.withdrawalHistory || 'Withdrawal History'}
          </h4>
          
          {historyLoading ? (
            <div className="text-center py-4">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-cyan-500 border-r-transparent"></div>
              <p className="text-xs text-gray-400 mt-1">{t?.loading || 'Loading...'}</p>
            </div>
          ) : withdrawalHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-2 px-2 text-left font-medium text-gray-600">{t?.date || 'Date'}</th>
                    <th className="py-2 px-2 text-left font-medium text-gray-600">{t?.amount || 'Amount'}</th>
                    <th className="py-2 px-2 text-left font-medium text-gray-600">{t?.method || 'Method'}</th>
                    <th className="py-2 px-2 text-left font-medium text-gray-600">{t?.status || 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalHistory.slice(0, 5).map((item, idx) => (
                    <tr key={idx} className="border-t border-gray-100">
                      <td className="py-2 px-2 text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2 text-gray-800 font-medium">
                        ৳{formatNumber(item.amount)}
                      </td>
                      <td className="py-2 px-2 text-gray-600">
                        {item.provider || item.method}
                      </td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${
                          item.status === 'completed' ? 'bg-green-100 text-green-700' :
                          item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {withdrawalHistory.length > 5 && (
                <p className="text-center text-[10px] text-gray-400 mt-2">
                  {t?.viewMore || 'View more in account records'}
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 text-xs py-4">
              {t?.noWithdrawalHistory || 'No withdrawal history found'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Betting Record Tab Content
const BettingRecordTabContent = () => {
  const { t, language } = useContext(LanguageContext);
  const [timeRange, setTimeRange] = useState('today');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);

  const formatCurrency = (amount) => new Intl.NumberFormat(language?.code === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 }).format(amount || 0);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.bettingRecord || 'বেটিং রেকর্ড'}</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {['today', 'yesterday', 'week', 'month', 'all'].map((range) => (
          <button
            key={range}
            className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
              timeRange === range ? 'bg-theme_color2 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setTimeRange(range)}
          >
            {range === 'today' && (t?.today || 'আজ')}
            {range === 'yesterday' && (t?.yesterday || 'গতকাল')}
            {range === 'week' && (t?.week || 'সপ্তাহ')}
            {range === 'month' && (t?.month || 'মাস')}
            {range === 'all' && (t?.all || 'সব')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-3 border-t-gray-800 border-b-gray-800 border-l-transparent border-r-transparent"></div></div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.date || 'তারিখ'}</th>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.gameName || 'গেম'}</th>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.totalBet || 'মোট বেট'}</th>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.totalWin || 'মোট জয়'}</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? records.map((record, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="py-2 px-3 border-b border-gray-200 text-sm text-gray-600">{record.date}</td>
                  <td className="py-2 px-3 border-b border-gray-200 text-sm text-gray-600">{record.game}</td>
                  <td className="py-2 px-3 border-b border-gray-200 text-sm text-blue-600">{formatCurrency(record.bet)} ৳</td>
                  <td className="py-2 px-3 border-b border-gray-200 text-sm text-green-600">{formatCurrency(record.win)} ৳</td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="py-6 text-center text-gray-500 text-sm">{t?.noRecords || 'কোন রেকর্ড পাওয়া যায়নি'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Account Record Tab Content
const AccountRecordTabContent = () => {
  const { t, language } = useContext(LanguageContext);
  const [recordType, setRecordType] = useState('all');
  const [records, setRecords] = useState([]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.accountRecord || 'অ্যাকাউন্ট রেকর্ড'}</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {['all', 'deposit', 'withdrawal', 'bonus'].map((type) => (
          <button
            key={type}
            className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors ${
              recordType === type ? 'bg-theme_color2 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setRecordType(type)}
          >
            {type === 'all' && (t?.all || 'সব')}
            {type === 'deposit' && (t?.deposit || 'ডিপোজিট')}
            {type === 'withdrawal' && (t?.withdrawal || 'উত্তোলন')}
            {type === 'bonus' && (t?.bonus || 'বোনাস')}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.dateTime || 'তারিখ ও সময়'}</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.type || 'ধরণ'}</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.amount || 'পরিমাণ'}</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.status || 'স্ট্যাটাস'}</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? records.map((record, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="py-2 px-3 border-b border-gray-200 text-sm text-gray-600">{record.date}</td>
                <td className="py-2 px-3 border-b border-gray-200 text-sm text-gray-600">{record.type}</td>
                <td className="py-2 px-3 border-b border-gray-200 text-sm text-gray-600">{record.amount}</td>
                <td className="py-2 px-3 border-b border-gray-200 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${record.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="py-6 text-center text-gray-500 text-sm">{t?.noRecords || 'কোন রেকর্ড পাওয়া যায়নি'}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Profit Loss Tab Content
const ProfitLossTabContent = () => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.profitLoss || 'লাভ/ক্ষতি'}</h3>
      <p className="text-gray-500 text-center py-8">{t?.noData || 'কোন ডেটা নেই'}</p>
    </div>
  );
};

// Reward Center Tab Content
// Reward Center Tab Content
const RewardCenterTabContent = () => {
  const { t, language } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  
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

  // Format number based on language
  const formatNumber = (number) => {
    if (number === undefined || number === null) return language?.code === 'bn' ? '০' : '0';
    return new Intl.NumberFormat(language?.code === 'bn' ? 'bn-BD' : 'en-US').format(number);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language?.code === 'bn' ? 'bn-BD' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Fetch bonuses from API
  const fetchBonuses = async () => {
    if (!userData?._id) return;
    
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
      setError(err.response?.data?.message || t?.bonusFetchError || 'Failed to load bonuses');
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
          message: `${bonusType} bonus claimed successfully! Added ${formatCurrency(response.data.data.amount)} to your balance.`
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

  // Refresh function
  const handleRefresh = () => {
    setRefreshing(true);
    fetchBonuses();
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

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 min-h-[400px] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-lg"></div>
        </div>
        <p className="mt-4 text-gray-500 text-sm">{t?.loading || 'Loading bonuses...'}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t?.rewardCenter || 'পুরস্কার কেন্দ্র'}</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition-all duration-200 disabled:opacity-50"
          title="Refresh"
        >
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Feedback Message */}
      {feedback.message && (
        <div className={`mb-4 rounded-lg p-3 text-center text-sm font-medium animate-fadeIn ${
          feedback.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          <div className="flex items-center justify-center gap-2">
            {feedback.type === 'success' ? (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {feedback.message}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="text-red-500 hover:text-red-700 text-xs font-medium"
            >
              {t?.retry || 'Retry'}
            </button>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t?.todayIs || 'Today is'}</p>
              <p className="text-sm font-semibold text-gray-800">
                {isTuesday() ? (t?.tuesday || 'Tuesday') : is4thDay() ? '4th Day' : (t?.regularDay || 'Regular Day')}
              </p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <FaCalendarAlt className="text-gray-500 text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t?.totalAvailable || 'Total Available'}</p>
              <p className="text-sm font-semibold text-cyan-600">
                {bonuses.filter(b => b.canClaim).length} {t?.bonuses || 'Bonuses'}
              </p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <GiTrophy className="text-amber-500 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Bonus Cards Grid - 2 in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Bonus Card - Simple Gray */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Card Header */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-200 rounded-lg">
                  <TbCalendarWeek className="text-sm text-gray-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{t?.weeklyBonus || 'Weekly Bonus'}</h4>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <FaCalendarAlt className="text-[8px]" />
                    {t?.availableEveryTuesday || 'Every Tuesday'}
                  </p>
                </div>
              </div>
              {isTuesday() && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full animate-pulse">
                  {t?.availableToday || 'Available Today!'}
                </span>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-3">
            {/* Bonus Amount */}
            <div className="mb-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <GiTrophy className="text-sm text-gray-400" />
                <span className="text-lg font-bold text-gray-800">
                  {bonuses.find(b => b.type === 'weekly')?.amount 
                    ? `${formatCurrency(bonuses.find(b => b.type === 'weekly')?.amount)} ৳`
                    : '0.00 ৳'}
                </span>
              </div>
              <p className="text-[10px] text-gray-500">
                {t?.basedOnWeeklyBet || 'Based on your weekly betting activity'}
              </p>
            </div>

            {/* Countdown or Status */}
            <div className="mb-3">
              {isTuesday() ? (
                <div className="bg-gray-100 rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-600">{t?.claimBefore || 'Claim before midnight'}</span>
                    <FaClock className="text-gray-400 text-xs" />
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {Object.entries(weeklyTimeLeft).map(([unit, value]) => (
                      <div key={unit} className="text-center">
                        <div className="bg-white rounded py-0.5">
                          <div className="text-gray-800 font-mono font-bold text-xs">{formatTimeUnit(value)}</div>
                          <div className="text-gray-500 text-[8px] uppercase">{unit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-600">{t?.nextAvailable || 'Next available in'}</span>
                    <FaClock className="text-gray-400 text-xs" />
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {Object.entries(weeklyTimeLeft).map(([unit, value]) => (
                      <div key={unit} className="text-center">
                        <div className="bg-white rounded py-0.5">
                          <div className="text-gray-600 font-mono font-bold text-xs">{formatTimeUnit(value)}</div>
                          <div className="text-gray-500 text-[8px] uppercase">{unit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Claim Button - #0FD9F1 color */}
            <div>
              {bonuses.find(b => b.type === 'weekly')?.canClaim ? (
                <button
                  onClick={() => claimBonus(
                    bonuses.find(b => b.type === 'weekly')._id,
                    'weekly'
                  )}
                  disabled={loading}
                  style={{ backgroundColor: '#0FD9F1' }}
                  className="w-full hover:opacity-90 text-white font-semibold py-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                >
                  <GiCrownCoin className="text-sm" />
                  {loading ? (t?.claiming || 'Claiming...') : (t?.claimNow || 'Claim Now')}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 font-semibold py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                >
                  {bonuses.find(b => b.type === 'weekly')?.status === 'claimed' 
                    ? (t?.alreadyClaimed || 'Already Claimed')
                    : (t?.notAvailable || 'Not Available')}
                </button>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-3 pb-2">
            <p className="text-[10px] text-gray-500 text-center">
              {t?.totalBet || 'Total Bet'}: {formatNumber(bonuses.find(b => b.type === 'weekly')?.totalBet || 0)} ৳
            </p>
          </div>
        </div>

        {/* Monthly Bonus Card - Simple Gray */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Card Header */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-200 rounded-lg">
                  <TbCalendarMonth className="text-sm text-gray-600" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">{t?.monthlyBonus || 'Monthly Bonus'}</h4>
                  <p className="text-[10px] text-gray-500 flex items-center gap-1">
                    <FaCalendarAlt className="text-[8px]" />
                    {t?.availableEvery4th || 'Every 4th of the month'}
                  </p>
                </div>
              </div>
              {is4thDay() && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full animate-pulse">
                  {t?.availableToday || 'Available Today!'}
                </span>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-3">
            {/* Bonus Amount */}
            <div className="mb-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <GiTrophy className="text-sm text-gray-400" />
                <span className="text-lg font-bold text-gray-800">
                  {bonuses.find(b => b.type === 'monthly')?.amount 
                    ? `${formatCurrency(bonuses.find(b => b.type === 'monthly')?.amount)} ৳`
                    : '0.00 ৳'}
                </span>
              </div>
              <p className="text-[10px] text-gray-500">
                {t?.basedOnMonthlyBet || 'Based on your monthly betting activity'}
              </p>
            </div>

            {/* Countdown or Status */}
            <div className="mb-3">
              {is4thDay() ? (
                <div className="bg-gray-100 rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-600">{t?.claimBefore || 'Claim before midnight'}</span>
                    <FaClock className="text-gray-400 text-xs" />
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {Object.entries(monthlyTimeLeft).map(([unit, value]) => (
                      <div key={unit} className="text-center">
                        <div className="bg-white rounded py-0.5">
                          <div className="text-gray-800 font-mono font-bold text-xs">{formatTimeUnit(value)}</div>
                          <div className="text-gray-500 text-[8px] uppercase">{unit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-2 border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-600">{t?.nextAvailable || 'Next available in'}</span>
                    <FaClock className="text-gray-400 text-xs" />
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {Object.entries(monthlyTimeLeft).map(([unit, value]) => (
                      <div key={unit} className="text-center">
                        <div className="bg-white rounded py-0.5">
                          <div className="text-gray-600 font-mono font-bold text-xs">{formatTimeUnit(value)}</div>
                          <div className="text-gray-500 text-[8px] uppercase">{unit}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Claim Button - #0FD9F1 color */}
            <div>
              {bonuses.find(b => b.type === 'monthly')?.canClaim ? (
                <button
                  onClick={() => claimBonus(
                    bonuses.find(b => b.type === 'monthly')._id,
                    'monthly'
                  )}
                  disabled={loading}
                  style={{ backgroundColor: '#0FD9F1' }}
                  className="w-full hover:opacity-90 text-white font-semibold py-2 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                >
                  <GiCrownCoin className="text-sm" />
                  {loading ? (t?.claiming || 'Claiming...') : (t?.claimNow || 'Claim Now')}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 font-semibold py-2 rounded-lg cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                >
                  {bonuses.find(b => b.type === 'monthly')?.status === 'claimed' 
                    ? (t?.alreadyClaimed || 'Already Claimed')
                    : (t?.notAvailable || 'Not Available')}
                </button>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div className="px-3 pb-2">
            <p className="text-[10px] text-gray-500 text-center">
              {t?.totalBet || 'Total Bet'}: {formatNumber(bonuses.find(b => b.type === 'monthly')?.totalBet || 0)} ৳
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
// Invite Friend Tab Content
// Invite Friend Tab Content
const InviteFriendTabContent = () => {
  const { t, language } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const [activeTab, setActiveTab] = useState('invite'); // Added this line
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
  const [feedback, setFeedback] = useState({ type: '', message: '', field: '' });
  
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const referralLink = `${window.location.origin}/?refer_code=${userData?.referralCode || ''}`;

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
        throw new Error(t?.referralFetchError || 'Failed to fetch referral data');
      }
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setError(err.response?.data?.message || err.message || t?.referralFetchError || 'Failed to fetch referral data');
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
    const text = `${t?.referralShareText || 'Join using my referral link and get bonus'}: ${referralLink}`;
    
    switch(platform) {
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
    if (!dateString) return t?.na || 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(language?.code === 'bn' ? 'bn-BD' : 'en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language?.code === 'bn' ? 'bn-BD' : 'en-US', {
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
      setLoading(true);
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
        setFeedback({
          type: 'success',
          message: t?.referralTransferSuccess || 'Referral earnings transferred successfully',
          field: 'referralEarnings'
        });
        setReferralData(prevData => ({
          ...prevData,
          referralEarnings: 0
        }));
        fetchUserData();
        
        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback({ type: '', message: '', field: '' }), 3000);
      } else {
        throw new Error(t?.referralTransferError || 'Failed to transfer referral earnings');
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || t?.referralTransferError || 'Failed to transfer referral earnings',
        field: 'referralEarnings'
      });
      
      // Clear feedback after 3 seconds
      setTimeout(() => setFeedback({ type: '', message: '', field: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.inviteFriend || 'বন্ধুকে আমন্ত্রণ'}</h3>
      
      {/* Feedback Message */}
      {feedback.message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          feedback.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaTimes className="text-red-500" />
              )}
              {feedback.message}
            </div>
            <button 
              onClick={() => setFeedback({ type: '', message: '', field: '' })}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'invite' ? 'bg-theme_color2 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('invite')}
        >
          <FaUser size={12} /> {t?.inviteFriend || 'আমন্ত্রণ'}
        </button>
        <button
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'list' ? 'bg-theme_color2 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('list')}
        >
          <FaHistory size={12} /> {t?.invitedList || 'আমন্ত্রিত তালিকা'}
        </button>
        <button
          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors ${
            activeTab === 'reward' ? 'bg-theme_color2 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('reward')}
        >
          <FaCoins size={12} /> {t?.reward || 'পুরস্কার'}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-theme_color2 border-b-theme_color2 border-l-transparent border-r-transparent"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-theme_color2/20 blur-sm"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Invite Tab Content */}
      {!loading && !error && activeTab === 'invite' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3 text-gray-700">{t?.referralLink || 'আপনার রেফারেল লিঙ্ক'}</h4>
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="flex-1 p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                value={referralLink}
                readOnly
              />
              <button 
                className="bg-theme_color2 hover:bg-theme_color2/80 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-colors"
                onClick={handleCopyLink}
              >
                <FaCopy /> {copied ? (t?.copied || 'কপি হয়েছে') : (t?.copy || 'কপি করুন')}
              </button>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3 text-gray-700">{t?.shareSocial || 'সোশ্যাল মিডিয়ায় শেয়ার করুন'}</h4>
            <div className="flex gap-3">
              <button 
                className="bg-[#1877F2] hover:bg-[#0E5FCC] text-white p-2.5 rounded-full transition-colors"
                onClick={() => shareOnSocialMedia('facebook')}
              >
                <FaFacebookF size={16} />
              </button>
              <button 
                className="bg-[#1DA1F2] hover:bg-[#1A8CD8] text-white p-2.5 rounded-full transition-colors"
                onClick={() => shareOnSocialMedia('twitter')}
              >
                <FaTwitter size={16} />
              </button>
              <button 
                className="bg-[#24A1DE] hover:bg-[#1F8CC9] text-white p-2.5 rounded-full transition-colors"
                onClick={() => shareOnSocialMedia('telegram')}
              >
                <FaTelegramPlane size={16} />
              </button>
              <button 
                className="bg-[#25D366] hover:bg-[#20B859] text-white p-2.5 rounded-full transition-colors"
                onClick={() => shareOnSocialMedia('whatsapp')}
              >
                <FaWhatsapp size={16} />
              </button>
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3 text-gray-700">{t?.referralRules || 'রেফারেল নিয়ম'}</h4>
            <ul className="list-disc pl-5 text-sm text-gray-500 space-y-2">
              <li>{t?.rule1 || 'আপনার আমন্ত্রিত বন্ধুকে ন্যূনতম ১০০ টাকা ডিপোজিট করতে হবে'}</li>
              <li>{t?.rule2 || 'আপনার আমন্ত্রিত বন্ধুকে ন্যূনতম ৩টি বেট প্লেস করতে হবে'}</li>
              <li>{t?.rule3 || 'প্রতি সফল রেফারেলের জন্য আপনি ১০% কমিশন পাবেন'}</li>
              <li>{t?.rule4 || 'রেফারেল বোনাস ১০০০ টাকা হলে ট্রান্সফার করতে পারবেন'}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Referred List Tab Content */}
      {!loading && !error && activeTab === 'list' && (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.username || 'ব্যবহারকারীর নাম'}</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.joinDate || 'যোগদানের তারিখ'}</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase border-b border-gray-200">{t?.reward || 'পুরস্কার'}</th>
              </tr>
            </thead>
            <tbody>
              {referralData.referredUsers.length > 0 ? (
                referralData.referredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <FaUser size={14} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{user.username}</p>
                          {user.phone && (
                            <p className="text-xs text-gray-500">{formatMobileNumber(user.phone)}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FaCalendarAlt size={12} className="text-gray-400" />
                        {formatDate(user.joinDate)}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b border-gray-200">
                      <span className="text-sm font-medium text-green-600">
                        ৳{formatCurrency(user.earnedAmount)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <FaUser className="text-gray-300 mb-2" size={32} />
                      <p className="text-sm">{t?.noFriends || 'কোন আমন্ত্রিত বন্ধু পাওয়া যায়নি'}</p>
                      <p className="text-xs text-gray-400 mt-1">{t?.inviteFriends || 'বন্ধুদের আমন্ত্রণ জানান এবং বোনাস পান'}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reward Tab Content */}
      {!loading && !error && activeTab === 'reward' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{t?.totalInvites || 'মোট আমন্ত্রণ'}</p>
              <p className="text-2xl font-bold text-theme_color2">
                {referralData.totalReferrals}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{t?.totalEarnings || 'মোট আয়'}</p>
              <p className="text-2xl font-bold text-green-600">
                ৳{formatCurrency(referralData.referralEarnings)}
              </p>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            {referralData.referralEarnings >= 1000 ? (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  {t?.eligibleMessage || 'আপনি রেফারেল বোনাসের জন্য যোগ্য!'}
                </p>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-3">
                  <p className="text-xs text-blue-700 mb-1">{t?.bonusAmount || 'বোনাস পরিমাণ'}: ৳{formatCurrency(referralData.referralEarnings)}</p>
                  <p className="text-xs text-blue-700">{t?.referralCode || 'রেফারেল কোড'}: {referralData.referralCode}</p>
                </div>
                <button 
                  className="w-full bg-gradient-to-r from-theme_color2 to-theme_color2/80 hover:from-theme_color2/90 hover:to-theme_color2/70 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all"
                  onClick={transferToMainBalance}
                  disabled={loading}
                >
                  {loading ? (t?.processing || 'প্রক্রিয়াধীন...') : (t?.addToMainBalance || 'মেইন বালেন্সে যোগ করুন')}
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  {t?.referralCode || 'রেফারেল কোড'}: <span className="font-bold text-theme_color2">{referralData.referralCode}</span>
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  {t?.notEligible || 'আপনি এখনও রেফারেল বোনাসের জন্য যোগ্য নন'}
                </p>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  <p className="text-xs text-yellow-700">
                    {t?.thresholdMessage || 'ন্যূনতম ১০০০ টাকা রেফারেল আয় প্রয়োজন'}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {t?.currentEarnings || 'বর্তমান আয়'}: ৳{formatCurrency(referralData.referralEarnings)} / ৳1,000
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-yellow-400 h-1.5 rounded-full" 
                      style={{ width: `${Math.min((referralData.referralEarnings / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Login Password Update Tab Content
// Login Password Update Tab Content - FIXED
// Login Password Update Tab Content - SHOW TOAST THEN LOGOUT
const LoginPasswordUpdateTabContent = () => {
  const { t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { userData, logout } = useUser();
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.currentPassword) {
      setError(t?.currentPasswordRequired || 'বর্তমান পাসওয়ার্ড দিন');
      return;
    }
    if (!formData.newPassword) {
      setError(t?.newPasswordRequired || 'নতুন পাসওয়ার্ড দিন');
      return;
    }
    if (formData.newPassword.length < 6) {
      setError(t?.passwordLength || 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError(t?.passwordMismatch || 'পাসওয়ার্ড মিলছে না');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/user/update-account-password`, {
        userId: userData._id,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        // Show toast message
        toast.success(t?.passwordUpdateSuccess || 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে');
        
        // Immediately logout and redirect
        handleDirectLogout();
      }
    } catch (err) {
      setError(err.response?.data?.message || t?.error || 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে');
      setLoading(false);
    }
  };

  const handleDirectLogout = () => {
    // Clear all storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('resetToken');
    
    // Call logout from context if available
    if (logout) {
      logout();
    }
    
    // Direct navigation without any delay
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.loginPasswordUpdate || 'লগইন পাসওয়ার্ড আপডেট'}</h3>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t?.currentPassword || 'বর্তমান পাসওয়ার্ড'}</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t?.currentPasswordPlaceholder || 'বর্তমান পাসওয়ার্ড লিখুন'}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t?.newPassword || 'নতুন পাসওয়ার্ড'}</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t?.newPasswordPlaceholder || 'নতুন পাসওয়ার্ড লিখুন'}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t?.confirmPassword || 'পাসওয়ার্ড নিশ্চিত করুন'}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t?.confirmPasswordPlaceholder || 'পাসওয়ার্ড নিশ্চিত করুন'}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-theme_color2 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (t?.processing || 'প্রক্রিয়াধীন...') : (t?.updatePassword || 'পাসওয়ার্ড আপডেট করুন')}
          </button>
        </form>
      </div>
    </div>
  );
};

// Transaction Password Update Tab Content
// Transaction Password Update Tab Content - CORRECT (already working)
const TransactionPasswordUpdateTabContent = () => {
  const { t } = useContext(LanguageContext);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { userData } = useUser();
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.currentPassword) {
      setError(t?.currentPasswordRequired || 'বর্তমান ট্রানজেকশন পাসওয়ার্ড দিন');
      return;
    }
    if (!formData.newPassword) {
      setError(t?.newPasswordRequired || 'নতুন ট্রানজেকশন পাসওয়ার্ড দিন');
      return;
    }
    if (formData.newPassword.length < 4) {
      setError(t?.transactionPasswordLength || 'ট্রানজেকশন পাসওয়ার্ড কমপক্ষে ৪ অক্ষর হতে হবে');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError(t?.passwordMismatch || 'পাসওয়ার্ড মিলছে না');
      return;
    }

    setLoading(true);
    try {
      // This endpoint is correct as per your backend
      const response = await axios.put(`${API_BASE_URL}/user/update-transaction-password`, {
        userId: userData._id,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setSuccess(t?.transactionPasswordUpdateSuccess || 'ট্রানজেকশন পাসওয়ার্ড সফলভাবে আপডেট হয়েছে');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || t?.error || 'ট্রানজেকশন পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.transactionPasswordUpdate || 'ট্রানজেকশন পাসওয়ার্ড আপডেট'}</h3>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t?.currentTransactionPassword || 'বর্তমান ট্রানজেকশন পাসওয়ার্ড'}</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t?.currentTransactionPasswordPlaceholder || 'বর্তমান ট্রানজেকশন পাসওয়ার্ড লিখুন'}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t?.newTransactionPassword || 'নতুন ট্রানজেকশন পাসওয়ার্ড'}</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t?.newTransactionPasswordPlaceholder || 'নতুন ট্রানজেকশন পাসওয়ার্ড লিখুন'}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t?.confirmTransactionPassword || 'ট্রানজেকশন পাসওয়ার্ড নিশ্চিত করুন'}</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                placeholder={t?.confirmTransactionPasswordPlaceholder || 'ট্রানজেকশন পাসওয়ার্ড নিশ্চিত করুন'}
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-theme_color2 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (t?.processing || 'প্রক্রিয়াধীন...') : (t?.updateTransactionPassword || 'ট্রানজেকশন পাসওয়ার্ড আপডেট করুন')}
          </button>
        </form>
      </div>
    </div>
  );
};

// KYC Tab Content Component
const KYCTabContent = () => {
  const { t, language } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const [activeTab, setActiveTab] = useState('email');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState({
    isVerified: false,
    hasPendingOTP: false,
    attempts: 0,
    lastSent: null,
  });
  const [emailOTP, setEmailOTP] = useState(['', '', '', '', '', '']);
  const [showEmailOTPInput, setShowEmailOTPInput] = useState(false);
  const [emailOTPTimer, setEmailOTPTimer] = useState(0);
  const otpInputRefs = useRef([]);

  const [kycStatus, setKycStatus] = useState({
    status: 'unverified',
    submittedAt: null,
    verifiedAt: null,
    rejectionReason: '',
    documents: [],
    hasNotStartedSession: false,
    hasExistingSession: false,
    verificationUrl: null,
    latestVerification: null,
  });

  const themeColor = '#0FD9F1';
  
  // Helper function for consistent styling
  const themeClass = (type) => {
    const styles = {
      bg: 'bg-[#0FD9F1]',
      bgHover: 'hover:bg-[#0BC5D9]',
      border: 'border-[#0FD9F1]',
      text: 'text-[#0FD9F1]',
      ring: 'focus:ring-[#0FD9F1]',
      shadow: 'shadow-[#0FD9F1]/20'
    };
    return styles[type] || '';
  };

  const showTabs = userData?.kycSubmitted === true && userData?.kycCompleted === false;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(
      language?.code === 'bn' ? 'bn-BD' : 'en-US'
    );
  };

  useEffect(() => {
    let interval;
    if (emailOTPTimer > 0) {
      interval = setInterval(() => setEmailOTPTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emailOTPTimer]);

  useEffect(() => {
    if (userData) {
      checkEmailVerificationStatus();
      checkKYCStatus();
    }
  }, [userData]);

  useEffect(() => {
    if (showEmailOTPInput && otpInputRefs.current[0]) {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    }
  }, [showEmailOTPInput]);

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  const jsonAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });

  const checkEmailVerificationStatus = async () => {
    try {
      const res = await axios.get(
        `${base_url}/user/check-email-verification/${userData._id}`,
        authHeader()
      );
      if (res.data.success) {
        setEmailVerificationStatus({
          isVerified: res.data.data.isEmailVerified,
          hasPendingOTP: res.data.data.hasPendingOTP,
          attempts: res.data.data.attempts,
          lastSent: res.data.data.lastSentAt,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const checkKYCStatus = async () => {
    try {
      const res = await axios.get(
        `${base_url}/user/kyc-status/${userData._id}`,
        authHeader()
      );
      if (res.data.success) {
        const d = res.data.data;
        const hasSessions = d.kycVerifications?.length > 0;
        let latestVerification = null;
        let hasNotStartedSession = false;
        let hasExistingSession = false;
        let verificationUrl = null;

        if (hasSessions) {
          latestVerification = d.kycVerifications[d.kycVerifications.length - 1];
          verificationUrl = latestVerification.verificationUrl;
          hasNotStartedSession = [
            'Not Started', 'not_started', 'NOT_STARTED', 'created', 'initiated',
          ].includes(latestVerification.status);
          hasExistingSession = true;
        }

        let actualStatus = d.kycStatus;
        if (d.kycStatus === 'pending' && (hasNotStartedSession || d.kycCompleted === false)) {
          actualStatus = 'unverified';
        }

        setKycStatus({
          status: actualStatus,
          submittedAt: d.lastUpdated,
          verifiedAt: d.kycInfo?.verifiedAt,
          rejectionReason: d.kycInfo?.rejectionReason,
          documents: d.kycDocuments || [],
          hasNotStartedSession,
          hasExistingSession,
          verificationUrl,
          latestVerification,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const sendEmailVerificationOTP = async () => {
    if (emailVerificationStatus.isVerified) return toast.info('Email already verified');
    if (emailOTPTimer > 0) return toast.warning(`Resend in ${emailOTPTimer}s`);
    setEmailVerificationLoading(true);
    try {
      const res = await axios.post(
        `${base_url}/user/send-email-verification-otp`,
        { userId: userData._id },
        jsonAuthHeader()
      );
      if (res.data.success) {
        toast.success('OTP sent to your email');
        setShowEmailOTPInput(true);
        setEmailOTPTimer(60);
        checkEmailVerificationStatus();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send OTP');
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const resendEmailVerificationOTP = async () => {
    if (emailOTPTimer > 0) return toast.warning(`Resend in ${emailOTPTimer}s`);
    setOtpLoading(true);
    try {
      const res = await axios.post(
        `${base_url}/user/resend-email-verification-otp`,
        { userId: userData._id },
        jsonAuthHeader()
      );
      if (res.data.success) {
        toast.success('OTP resent');
        setEmailOTPTimer(60);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleEmailOTPChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOTP = [...emailOTP];
    newOTP[index] = value;
    setEmailOTP(newOTP);
    if (value && index < 5)
      setTimeout(() => otpInputRefs.current[index + 1]?.focus(), 10);
  };

  const handleEmailOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !emailOTP[index] && index > 0)
      setTimeout(() => otpInputRefs.current[index - 1]?.focus(), 10);
    if (e.key === 'ArrowLeft' && index > 0) otpInputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleEmailOTPPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setEmailOTP(pasted.split(''));
      setTimeout(() => otpInputRefs.current[5]?.focus(), 10);
    } else {
      toast.error('Please paste a valid 6-digit OTP');
    }
  };

  const verifyEmailOTP = async () => {
    const otpCode = emailOTP.join('');
    if (otpCode.length !== 6) return toast.error('Enter all 6 digits');
    setOtpLoading(true);
    try {
      const res = await axios.post(
        `${base_url}/user/verify-email-otp`,
        { userId: userData._id, otpCode },
        jsonAuthHeader()
      );
      if (res.data.success) {
        toast.success('Email verified successfully!');
        setShowEmailOTPInput(false);
        setEmailOTP(['', '', '', '', '', '']);
        checkEmailVerificationStatus();
        fetchUserData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Verification failed');
      setEmailOTP(['', '', '', '', '', '']);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 10);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleKYCVerification = async () => {
    if (kycStatus.hasExistingSession && kycStatus.verificationUrl && kycStatus.hasNotStartedSession) {
      return continueExistingKYC();
    }
    startNewKYC();
  };

  const continueExistingKYC = async () => {
    setLoading(true);
    try {
      if (!kycStatus.verificationUrl) return toast.error('Verification URL not found');
      toast.success('Redirecting to verification page...');
      setTimeout(() => window.open(kycStatus.verificationUrl, '_blank', 'noopener,noreferrer'), 1500);
    } catch (e) {
      toast.error('Failed to continue KYC');
    } finally {
      setLoading(false);
    }
  };

  const startNewKYC = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${base_url}/user/kyc/start-verification`,
        { userId: userData._id },
        jsonAuthHeader()
      );
      if (res.data) {
        const url = res.data.data.verification_url;
        if (!url) return toast.error('Verification URL not found');
        toast.success('KYC verification started! Redirecting...');
        setKycStatus((prev) => ({
          ...prev,
          status: 'unverified',
          submittedAt: new Date().toISOString(),
          hasNotStartedSession: true,
          hasExistingSession: true,
          verificationUrl: url,
        }));
        setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), 1500);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to start KYC');
    } finally {
      setLoading(false);
    }
  };

  const resubmitKYC = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${base_url}/user/kyc/resubmit`,
        { userId: userData._id },
        jsonAuthHeader()
      );
      if (res.data) {
        const url = res.data.data.verification_url;
        if (!url) return toast.error('Verification URL not found');
        toast.success('KYC resubmitted! Redirecting...');
        setKycStatus((prev) => ({
          ...prev,
          submittedAt: new Date().toISOString(),
          hasNotStartedSession: true,
          hasExistingSession: true,
          verificationUrl: url,
        }));
        setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), 1500);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to resubmit KYC');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // OTP FULLSCREEN — shown when OTP is sent
  // ─────────────────────────────────────────────────────────────────────────
  if (showEmailOTPInput && !emailVerificationStatus.isVerified) {
    return (
      <div className="font-anek flex items-center justify-center px-6">
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: 10, fontSize: 14 } }} />

        <div
          className="relative w-full max-w-sm bg-white rounded-3xl p-8 shadow-lg"
          style={{ border: '2px solid #0FD9F1' }}
        >
          {/* Close */}
          <button
            onClick={() => {
              setShowEmailOTPInput(false);
              setEmailOTP(['', '', '', '', '', '']);
            }}
            className="absolute top-4 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <IoClose className="text-xl" />
          </button>

          {/* 6 digit boxes */}
          <div className="flex justify-center gap-3 mb-6 pt-4 mt-2">
            {emailOTP.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpInputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleEmailOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleEmailOTPKeyDown(index, e)}
                onPaste={index === 0 ? handleEmailOTPPaste : undefined}
                className="w-11 h-14 text-center text-2xl font-bold bg-[#0FD9F1] text-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-[#0FD9F1] transition-all shadow-sm"
                style={{ caretColor: 'white', color: digit ? 'white' : 'transparent' }}
              />
            ))}
          </div>

          <p className="text-center text-sm text-gray-500 mb-6">
            Please check your Email for OTP code.
          </p>

          <button
            onClick={verifyEmailOTP}
            disabled={otpLoading || emailOTP.join('').length !== 6}
            className="w-full bg-[#0FD9F1] hover:bg-[#0BC5D9] disabled:bg-[#0FD9F1]/50 text-white py-3.5 rounded-full font-bold text-base cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {otpLoading ? <><FaSpinner className="animate-spin" /> Verifying...</> : 'Verify'}
          </button>

          <div className="flex items-center justify-center gap-1 mt-4">
            <p className="text-xs text-gray-400">Didn't receive the code?</p>
            <button
              onClick={resendEmailVerificationOTP}
              disabled={emailOTPTimer > 0 || otpLoading}
              className="text-xs font-bold text-[#0FD9F1] hover:text-[#0BC5D9] disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed transition-colors"
            >
              {emailOTPTimer > 0 ? `Resend in ${emailOTPTimer}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NOT ASSIGNED STATE
  // ─────────────────────────────────────────────────────────────────────────
  if (!showTabs) {
    return (
      <div className=" font-anek flex items-center justify-center px-6">
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: 10, fontSize: 14 } }} />
        <div className="relative rounded-2xl p-8 text-center  w-full max-w-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <HiIdentification className="text-4xl text-gray-300" />
          </div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">KYC Not Assigned</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your KYC verification has not been assigned yet.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN PAGE
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className=" flex justify-center items-center font-anek p-[10px]">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: 10, fontSize: 14 } }} />

      <div className="  w-full rounded-[20px] overflow-y-auto">

        <div className="px-4 pt-3 max-w-lg mx-auto">

          {/* ── Tab Switcher ── */}
          <div className="rounded-full p-1 flex mb-5 gap-2">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2.5 rounded-[10px] text-[15px] font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-[#0FD9F1] text-white shadow-md shadow-cyan-200'
                  : 'text-gray-500 hover:text-gray-700 bg-gray-200'
              }`}
            >
              Email Verify
            </button>
            <button
              onClick={() => setActiveTab('kyc')}
              className={`flex-1 py-2.5 rounded-[10px] text-[15px] font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'kyc'
                  ? 'bg-[#0FD9F1] text-white shadow-md shadow-cyan-200'
                  : 'text-gray-500 hover:text-gray-700 bg-gray-200'
              }`}
            >
              Identity Verify
            </button>
          </div>

          {/* ══════════════ EMAIL TAB ══════════════ */}
          {activeTab === 'email' && (
            <div className="space-y-4">

              {/* Email input card */}
              <div className="py-3">
                {!emailVerificationStatus.isVerified && (
                  <p className="text-xs text-gray-400 mb-3">
                    I am agree to proved my email is valided.
                  </p>
                )}

                <div className="flex items-center gap-2 bg-[#DDD4E9] p-[10px] rounded-[15px]">
                  <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-[15px] px-3 py-2.5 gap-2">
                    <FaEnvelope className="text-gray-400 text-sm flex-shrink-0" />
                    <input
                      type="text"
                      className="flex-1 text-sm text-gray-700 bg-transparent outline-none cursor-not-allowed"
                      value={userData?.email || ''}
                      readOnly
                    />
                  </div>

                  {emailVerificationStatus.isVerified ? (
                    <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-2.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                      <FaCheckCircle className="text-xs" /> Verified
                    </span>
                  ) : (
                    <button
                      onClick={sendEmailVerificationOTP}
                      disabled={emailVerificationLoading || emailOTPTimer > 0}
                      className="bg-[#0FD9F1] disabled:bg-[#0FD9F1]/50 text-white text-sm font-bold px-4 py-2.5 rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
                    >
                      {emailVerificationLoading ? (
                        <FaSpinner className="animate-spin" />
                      ) : emailOTPTimer > 0 ? (
                        `${emailOTPTimer}s`
                      ) : (
                        'OTP'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Why verify */}
              <div className="bg-[#DDD4E9] rounded-2xl p-5 border border-purple-100 shadow-sm">
                <p className="font-bold text-gray-800 mb-3 text-sm">
                  Why You should verify Email?
                </p>
                <ul className="space-y-2">
                  {[
                    'Keep your account more secure.',
                    'Bonus & Promotion Eligibility updates.',
                    'Important Notifications for transections Update.',
                    'Fair Play & Compliance.',
                  ].map((text, i) => (
                    <li key={i} className="text-xs text-gray-600">
                      -{text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ══════════════ IDENTITY / KYC TAB ══════════════ */}
          {activeTab === 'kyc' && (
            <div className="space-y-4">

              {/* ── EMAIL NOT VERIFIED: show ONLY this message ── */}
              {!emailVerificationStatus.isVerified ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <p className="text-base font-bold text-gray-700 mb-1">
                    Please verify your email first
                  </p>
                  <p className="text-xs text-gray-400">
                    Go to the{' '}
                    <button
                      onClick={() => setActiveTab('email')}
                      className="text-[#0FD9F1] font-bold underline cursor-pointer"
                    >
                      Email Verify
                    </button>{' '}
                    tab to complete verification.
                  </p>
                </div>
              ) : (
                <>
                  {/* Status card */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <HiIdentification className="text-[#0FD9F1] text-xl" />
                        <h3 className="font-bold text-gray-800 text-sm">KYC Verification</h3>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          kycStatus.status === 'verified'
                            ? 'bg-green-100 text-green-600'
                            : kycStatus.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-600'
                            : kycStatus.status === 'rejected'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {kycStatus.status.charAt(0).toUpperCase() + kycStatus.status.slice(1)}
                      </span>
                    </div>

                    {kycStatus.status === 'verified' && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                        <FaCheckCircle className="text-green-500 text-xl mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-green-700 text-sm">KYC Verified</p>
                          <p className="text-xs text-green-600 mt-1">
                            Verified on {formatDate(kycStatus.verifiedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pending */}
                    {kycStatus.status === 'pending' && userData?.kycCompleted === true && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <FaSpinner className="animate-spin text-yellow-500 text-lg mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-yellow-700 text-sm">KYC Under Review</p>
                            <p className="text-xs text-yellow-600 mt-0.5">
                              Submitted on {formatDate(kycStatus.submittedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="bg-yellow-100 rounded-lg p-3 space-y-1">
                          <p className="text-xs text-yellow-700">✓ Verification in progress</p>
                          <p className="text-xs text-yellow-700">✓ Application in queue</p>
                          <p className="text-xs text-yellow-700">✓ Status will update automatically</p>
                        </div>
                        <p className="text-xs text-yellow-500 mt-2 text-center">
                          Review may take 24–48 hours
                        </p>
                      </div>
                    )}

                    {kycStatus.status === 'rejected' && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <FaTimesCircle className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-red-700 text-sm">KYC Rejected</p>
                            {kycStatus.rejectionReason && (
                              <p className="text-xs text-red-600 mt-1">
                                Reason: {kycStatus.rejectionReason}
                              </p>
                            )}
                            <p className="text-xs text-red-500 mt-1">
                              Please update your information and resubmit.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {kycStatus.hasExistingSession && kycStatus.hasNotStartedSession && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <FaInfoCircle className="text-blue-400 text-lg mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-blue-700 text-sm">Session Not Completed</p>
                            <p className="text-xs text-blue-600 mt-1">
                              You started KYC but did not finish. Click below to continue.
                            </p>
                            {kycStatus.latestVerification?.createdAt && (
                              <p className="text-xs text-blue-500 mt-1">
                                Started: {formatDate(kycStatus.latestVerification.createdAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {(kycStatus.status === 'unverified' ||
                    (kycStatus.status === 'pending' && kycStatus.hasNotStartedSession) ||
                    kycStatus.hasNotStartedSession) && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                      <div className="text-center mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#0FD9F1] to-[#0BC5D9] rounded-full flex items-center justify-center mx-auto mb-3">
                          <HiIdentification className="text-2xl text-white" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm mb-1">
                          {kycStatus.hasExistingSession && kycStatus.hasNotStartedSession
                            ? 'Continue KYC Verification'
                            : 'Start KYC Verification'}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {kycStatus.hasExistingSession && kycStatus.hasNotStartedSession
                            ? 'Continue your KYC verification from where you left off.'
                            : 'Complete your identity verification with our secure partner.'}
                        </p>
                      </div>

                      <button
                        onClick={handleKYCVerification}
                        disabled={loading}
                        className="w-full bg-[#0FD9F1] hover:bg-[#0BC5D9] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md shadow-[#0FD9F1]/20"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            {kycStatus.hasExistingSession && kycStatus.hasNotStartedSession
                              ? 'Continuing...'
                              : 'Starting...'}
                          </>
                        ) : (
                          <>
                            <HiIdentification />
                            {kycStatus.hasExistingSession && kycStatus.hasNotStartedSession
                              ? 'Continue KYC'
                              : 'Complete KYC'}
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Resubmit */}
                  {kycStatus.status === 'rejected' && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
                      <button
                        onClick={resubmitKYC}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-100"
                      >
                        {loading ? (
                          <><FaSpinner className="animate-spin" /> Resubmitting...</>
                        ) : (
                          <><FaRedoAlt /> Resubmit KYC</>
                        )}
                      </button>
                      <p className="text-center text-xs text-gray-400 mt-2">
                        Resubmit with corrected information
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Default Tab Content
const DefaultTabContent = ({ activeLeftTab }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{activeLeftTab}</h3>
      <p className="text-gray-500 text-center py-8">এই বিভাগটি উন্নয়নাধীন রয়েছে</p>
    </div>
  );
};

// Arrow Left Icon for Forgot Password
const FaArrowLeft = ({ className }) => (
  <svg className={className} width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export default Sidebar;
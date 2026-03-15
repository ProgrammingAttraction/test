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
  FaCheckCircle
} from 'react-icons/fa';
import { FaCoins } from 'react-icons/fa';
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
import popular_img from "../../assets/popular.png";
import dice_img from "../../assets/dice.png";
import user_img from "../../assets/user.png";
import bonus_img from "../../assets/bonus.png";
import affiliate_img from "../../assets/affiliate.png";
import question_img from "../../assets/question.png";
import teamwork_img from "../../assets/teamwork.png";
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
import slot_img from "../../assets/slot.png";
import controller_img from "../../assets/controller.png";
import popular_games from "../../assets/famous.png";
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
    { icon: party_img, label: t?.vipClub || 'ভিআইপি ক্লাব', path: '/vip-club' },
    { icon: link_img, label: t?.referralProgram || 'রেফারেল প্রোগ্রাম' },
    {
      icon: download_img,
      label: t?.downloadApp || 'ডাউনলোড অ্যাপ',
      onClick: () => {
        const apkUrl = 'https://docs.google.com/uc?export=download&id=1oj3ReyGd6J4uK_8nByYzZBbzA-BVYb64';
        downloadFileAtURL(apkUrl);
        toast.success(t?.downloadStarted || 'Download started!');
      }
    },
    { icon: support_img, label: t?.contact || 'যোগাযোগ', path: '/contact' },
    { icon: question_img, label: t?.faqPolicy || 'FAQ/নীতি', path: '/faq-policy' },
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
            <ul className="space-y-2">
              {leftMenuItems.map((item, index) => (
                <li
                  key={index}
                  className={`py-2 px-3 rounded-lg cursor-pointer transition-all text-sm ${
                    item === activeLeftTab
                      ? 'bg-gray-200 text-gray-800 font-medium'
                      : 'hover:bg-gray-100 text-gray-600'
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
              <WithdrawalTabContent />
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
  const [feedback, setFeedback] = useState({ type: '', message: '', field: '' });
  const { userData, loading, error, fetchUserData } = useUser();

  const tabs = [t?.personalInfo || 'ব্যক্তিগত তথ্য'];

  useEffect(() => {
    if (userData?.username) setEditableUsername(userData.username);
    if (userData?.phone) setEditablePhone(userData.phone);
    if (userData?.dateOfBirth) {
      // Format date for input field (YYYY-MM-DD)
      const dob = new Date(userData.dateOfBirth);
      const formattedDob = dob.toISOString().split('T')[0];
      setEditableDob(formattedDob);
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
              {/* Player ID - Read Only */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t?.playerId || 'প্লেয়ার আইডি'}</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm cursor-not-allowed" 
                  value={userData?.player_id || 'N/A'} 
                  readOnly 
                />
              </div>

              {/* Email - Read Only */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t?.email || 'ইমেইল'}</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 text-sm cursor-not-allowed" 
                  value={userData?.email || 'N/A'} 
                  readOnly 
                />
              </div>

              {/* Phone Number - Editable */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t?.mobileNumber || 'মোবাইল নম্বর'}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={`flex-1 p-2 border rounded-lg text-sm ${isEditingPhone ? 'border-gray-400 bg-white' : 'border-gray-300 bg-gray-100'}`}
                    value={editablePhone}
                    onChange={(e) => setEditablePhone(e.target.value)}
                    readOnly={!isEditingPhone}
                    placeholder="01XXXXXXXXX"
                  />
                  {isEditingPhone ? (
                    <>
                      <button onClick={handlePhoneUpdate} className="bg-theme_color2 text-white px-3 py-1 rounded-lg text-sm transition-colors">{t?.save || 'সংরক্ষণ'}</button>
                      <button onClick={() => setIsEditingPhone(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm transition-colors">{t?.cancel || 'বাতিল'}</button>
                    </>
                  ) : (
                    <button onClick={() => setIsEditingPhone(true)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm transition-colors">{t?.edit || 'সম্পাদনা'}</button>
                  )}
                </div>
              </div>

              {/* Date of Birth - Editable */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t?.dateOfBirth || 'জন্ম তারিখ'}</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className={`flex-1 p-2 border rounded-lg text-sm ${isEditingDob ? 'border-gray-400 bg-white' : 'border-gray-300 bg-gray-100'}`}
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
              </div>

              {/* Username - Editable */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t?.username || 'ব্যবহারকারীর নাম'}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={`flex-1 p-2 border rounded-lg text-sm ${isEditingUsername ? 'border-gray-400 bg-white' : 'border-gray-300 bg-gray-100'}`}
                    value={editableUsername}
                    onChange={(e) => setEditableUsername(e.target.value)}
                    readOnly={!isEditingUsername}
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
const DepositTabContent = () => {
  const { t, language } = useContext(LanguageContext);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bkash');
  const [selectedBonus, setSelectedBonus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { userData, loading } = useUser();

  const amounts = [300, 500, 700, 1000, 3000, 5000, 10000, 20000, 25000, 30000];
  const hasMobileNumber = userData?.phone;

  const formatNumber = (number) => new Intl.NumberFormat(language?.code === 'bn' ? 'bn-BD' : 'en-US').format(number);

  const handleDeposit = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!amount || amount < 300) return setErrorMessage(t?.minimumDepositError || 'ন্যূনতম ডিপোজিট ৩০০ টাকা');
    if (amount > 30000) return setErrorMessage(t?.maximumDepositError || 'সর্বোচ্চ ডিপোজিট ৩০,০০০ টাকা');
    if (!hasMobileNumber) return setErrorMessage(t?.addMobileNumberError || 'মোবাইল নম্বর যোগ করুন');

    setIsSubmitting(true);
    setTimeout(() => {
      setSuccessMessage(t?.depositSuccess || 'ডিপোজিট সফল!');
      setIsSubmitting(false);
      setAmount('');
    }, 1500);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-3 border-t-gray-800 border-b-gray-800 border-l-transparent border-r-transparent"></div></div>;
  }

  if (!hasMobileNumber) {
    return (
      <div className="text-center py-8">
        <h3 className="text-md font-semibold text-gray-700 mb-2">{t?.addMobileNumber || 'মোবাইল নম্বর যোগ করুন'}</h3>
        <p className="text-sm text-gray-500">{t?.addMobileNumberDesc || 'ডিপোজিট করতে মোবাইল নম্বর প্রয়োজন'}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.deposit || 'ডিপোজিট'}</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t?.paymentMethod || 'পেমেন্ট মেথড'}</label>
        <div className="flex flex-wrap gap-2">
          {['bkash', 'nagad'].map((method) => (
            <button
              key={method}
              onClick={() => setSelectedMethod(method)}
              className={`px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                selectedMethod === method ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <img src={`https://images.5949390294.com/mcs-images/bank_type/${method.toUpperCase()}/BN_2_20240312${method === 'bkash' ? '225413337' : '230148421'}.png`} alt={method} className="w-5 h-5 mr-2" />
                {method === 'bkash' ? (t?.bkash || 'Bkash') : (t?.nagad || 'Nagad')}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">{t?.depositAmount || 'জমার পরিমাণ'}</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-2">
          {amounts.slice(0, 5).map((amt) => (
            <button
              key={amt}
              onClick={() => { setAmount(amt.toString()); setErrorMessage(''); }}
              className={`bg-white border ${amount === amt.toString() ? 'border-gray-800 bg-gray-100' : 'border-gray-300'} hover:bg-gray-100 px-2 py-1.5 rounded-lg text-sm text-gray-700 transition-colors`}
            >
              {formatNumber(amt)} ৳
            </button>
          ))}
        </div>
        <input
          type="text"
          value={amount}
          onChange={(e) => { if (/^\d*$/.test(e.target.value)) setAmount(e.target.value); }}
          className="mt-2 w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          placeholder={t?.amountPlaceholder || 'জমার পরিমাণ লিখুন'}
        />
      </div>

      {errorMessage && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">{errorMessage}</div>}
      {successMessage && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4 text-sm">{successMessage}</div>}

      <button
        className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-lg text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleDeposit}
        disabled={isSubmitting || !amount}
      >
        {isSubmitting ? (t?.processing || 'প্রক্রিয়াধীন...') : (t?.requestDeposit || 'ডিপোজিট করুন')}
      </button>
    </div>
  );
};

// Withdrawal Tab Content
const WithdrawalTabContent = () => {
  const { t, language } = useContext(LanguageContext);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { userData } = useUser();

  const formatNumber = (number) => new Intl.NumberFormat(language?.code === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 }).format(number || 0);

  const handleWithdrawal = async () => {
    setError('');
    setSuccess('');

    if (!amount || amount < 300) return setError(t?.minimumWithdrawalError || 'ন্যূনতম উত্তোলন ৩০০ টাকা');
    if (parseFloat(amount) > (userData?.balance || 0)) return setError(t?.insufficientBalanceError || 'পর্যাপ্ত ব্যালেন্স নেই');
    if (!accountNumber) return setError(t?.accountNumberRequired || 'অ্যাকাউন্ট নম্বর দিন');

    setLoading(true);
    setTimeout(() => {
      setSuccess(t?.withdrawalRequestSuccess || 'উত্তোলনের অনুরোধ সফল হয়েছে');
      setLoading(false);
      setAmount('');
      setAccountNumber('');
    }, 1500);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.withdrawMoney || 'টাকা উত্তোলন'}</h3>

      <div className="bg-white p-3 rounded-lg mb-4 border border-gray-200">
        <p className="text-sm text-gray-600">{t?.availableBalance || 'উপলব্ধ ব্যালেন্স'}: <span className="font-bold text-gray-800">৳{formatNumber(userData?.balance || 0)}</span></p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t?.paymentMethod || 'পেমেন্ট মেথড'}</label>
          <div className="flex flex-wrap gap-2">
            {['bkash', 'nagad'].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                  paymentMethod === method ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {method === 'bkash' ? (t?.bkash || 'Bkash') : (t?.nagad || 'Nagad')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{paymentMethod === 'bkash' ? (t?.bkashNumber || 'বিকাশ নম্বর') : (t?.nagadNumber || 'নগদ নম্বর')}</label>
          <input
            type="text"
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder={paymentMethod === 'bkash' ? (t?.bkashPlaceholder || 'বিকাশ নম্বর') : (t?.nagadPlaceholder || 'নগদ নম্বর')}
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t?.withdrawalAmount || 'উত্তোলনের পরিমাণ'}</label>
          <input
            type="number"
            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder={t?.amountPlaceholder || 'টাকার পরিমাণ লিখুন'}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="300"
          />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">{success}</div>}

        <button
          className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-lg text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleWithdrawal}
          disabled={loading || !amount || !accountNumber}
        >
          {loading ? (t?.processing || 'প্রক্রিয়াধীন...') : (t?.requestWithdrawal || 'উত্তোলনের অনুরোধ করুন')}
        </button>
      </div>
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
              timeRange === range ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
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
              recordType === type ? 'bg-gray-800 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
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
const RewardCenterTabContent = () => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.rewardCenter || 'পুরস্কার কেন্দ্র'}</h3>
      <p className="text-gray-500 text-center py-8">{t?.comingSoon || 'শীঘ্রই আসছে'}</p>
    </div>
  );
};

// Invite Friend Tab Content
const InviteFriendTabContent = () => {
  const { t } = useContext(LanguageContext);
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{t?.inviteFriend || 'বন্ধুকে আমন্ত্রণ'}</h3>
      <p className="text-gray-500 text-center py-8">{t?.comingSoon || 'শীঘ্রই আসছে'}</p>
    </div>
  );
};

// Login Password Update Tab Content
const LoginPasswordUpdateTabContent = () => {
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
      const response = await axios.put(`${API_BASE_URL}/user/update-login-password`, {
        userId: userData._id,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setSuccess(t?.passwordUpdateSuccess || 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || t?.error || 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
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
            {loading ? (t?.processing || 'প্রক্রিয়াধীন...') : (t?.updatePassword || 'পাসওয়ার্ড আপডেট করুন')}
          </button>
        </form>
      </div>
    </div>
  );
};

// Transaction Password Update Tab Content
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
      <div className="min-h-screen bg-gray-100 font-anek flex items-center justify-center px-6">
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
      <div className="min-h-screen bg-[#C7F6FF] font-anek flex items-center justify-center px-6">
        <Toaster position="top-right" toastOptions={{ style: { borderRadius: 10, fontSize: 14 } }} />
        <div className="relative bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-200 w-full max-w-sm">
          <button
            onClick={() => window.history.back()}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <IoClose className="text-xl" />
          </button>
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
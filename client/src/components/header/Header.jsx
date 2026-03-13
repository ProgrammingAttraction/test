import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  FaWhatsapp, FaBars, FaFacebookF, FaGoogle, FaPhoneAlt, FaLock, FaUser,
  FaTimes, FaArrowLeft, FaHome, FaGift, FaMoneyBillAlt, FaTrophy,
  FaTelegram, FaHeadset, FaEye, FaEyeSlash, FaTimesCircle, FaSearch
} from 'react-icons/fa';
import logo from "../../assets/logo.png";
import { MdArrowDropDown } from 'react-icons/md';
import {
  FaFire, FaUserFriends, FaGift as FaGift2, FaChartBar, FaMedal,
  FaFutbol, FaMoneyBillWave, FaHandHoldingHeart, FaGem, FaCrosshairs,
  FaBullseye, FaHandsHelping, FaFlag, FaGamepad, FaDownload, FaThLarge,
  FaHeadset as FaHeadset2, FaSignOutAlt, FaUserCog, FaHistory, FaWallet,
  FaCog, FaDice, FaCoins
} from 'react-icons/fa';
import { FaSyncAlt } from "react-icons/fa";
import { RiMenuFold2Line } from "react-icons/ri";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { IoClose, IoCloseOutline } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
import man from "../../assets/profileimages/man.png";
import man1 from "../../assets/profileimages/man1.png";
import man2 from "../../assets/profileimages/man2.png";
import man3 from "../../assets/profileimages/man3.png";
import man4 from "../../assets/profileimages/man4.png";
import man5 from "../../assets/profileimages/man5.png";
import man6 from "../../assets/profileimages/man6.png";
import popular_img from "../../assets/popular.png";
import dice_img from "../../assets/dice.png";
import user_img from "../../assets/user.png";
import bonus_img from "../../assets/bonus.png";
import affiliate_img from "../../assets/affiliate.png";
import question_img from "../../assets/question.png";
import teamwork_img from "../../assets/teamwork.png";
import party_img from "../../assets/party.png";
import link_img from "../../assets/link.png";
import support_img from "../../assets/support.png";
import slot_img from "../../assets/slot.png";
import controller_img from "../../assets/controller.png";
import popular_games from "../../assets/famous.png";
import home_img from "../../assets/home.png";
import profile_img from "../../assets/profile.png";
import { FaTelegramPlane, FaFacebookMessenger, FaInstagram } from "react-icons/fa";
import {
  FaBuilding,
  FaHandshake,
  FaCrown,
  FaLink,
  FaQuestionCircle
} from 'react-icons/fa';
import { PiMoneyWavy } from "react-icons/pi";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { FiMessageCircle } from 'react-icons/fi';
import { GiSoccerBall } from 'react-icons/gi';
import casino_img from "../../assets/chip.png";
import { FiHome, FiSearch, FiBookmark, FiUser, FiSettings } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import { useUser } from '../../context/UserContext';
import download_img from "../../assets/cloud.png"
import { LanguageContext } from '../../context/LanguageContext';
import AnnouncementPopup from './AnnouncementPopup';
import SpinWheel from './SpinWheel';
import gift_img from "../../assets/spin.png"
import MobileAppBanner from './MobileAppBanner';
import SearchPopup from '../SearchPopup/SearchPopup';
import { GiHamburgerMenu } from "react-icons/gi";
// ------------------------sidebar-images----------------------
import sideicon1 from "../../assets/sidebar_icon/img1.svg"
import sideicon2 from "../../assets/sidebar_icon/img2.svg"
import sideicon3 from "../../assets/sidebar_icon/img3.svg"
import sideicon4 from "../../assets/sidebar_icon/img4.svg"
import sideicon5 from "../../assets/sidebar_icon/img5.svg"
// -------------------bottom-navbar-----------------------
import menu1 from "../../assets/bottom_navbar/menu1.png"
import menu2 from "../../assets/bottom_navbar/menu2.png"
import menu3 from "../../assets/bottom_navbar/menu3.png"
import menu4 from "../../assets/bottom_navbar/menu4.png"


const Header = ({ setShowPopup, setActiveLeftTab, showPopup, activeLeftTab }) => {
  const { userData, loading, error, fetchUserData } = useUser();
  const { language, changeLanguage, t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userdata, setUserData] = useState([]);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    currency: 'BDT',
    mobile: ''
  });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    email: '',
    mobile: '',
    formError: ''
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [referralCodeValid, setReferralCodeValid] = useState(false);
  const [referralCodeChecking, setReferralCodeChecking] = useState(false);
  const [referralCodeError, setReferralCodeError] = useState('');
  const [referrerInfo, setReferrerInfo] = useState(null);
  const [isLoading, setIsLoading] = useState({
    login: false,
    register: false,
    forgotPassword: false,
    resetPassword: false,
    verifyOtp: false,
    resendOtp: false
  });
  const [modalAnimation, setModalAnimation] = useState('');
  const otpInputRefs = useRef([]);
  const modalRef = useRef(null);

  // Currency dropdown state
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const currencyDropdownRef = useRef(null);

  const currencyOptions = [
    { value: 'BDT', label: 'Bangladeshi Tk', flag: '🇧🇩' },
    { value: 'USD', label: 'US Dollar', flag: '🇺🇸' },
  ];

  const getCurrentCurrencyDisplay = () => {
    const currency = currencyOptions.find(c => c.value === formData.currency) || currencyOptions[0];
    return `${currency.flag} ${currency.value}`;
  };

  useEffect(() => {
    const checkJivo = setInterval(() => {
      if (window.jivo_api) {
        clearInterval(checkJivo);
      }
    }, 100);
    return () => clearInterval(checkJivo);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openSupportChat = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (window.jivo_api) {
      window.jivo_api.open();
      if (user && token) {
        const userInfo = {
          name: user.username,
          email: user.email,
          phone: user.phone || 'Not provided',
          userId: user._id,
          balance: user.balance || 0
        };
        window.jivo_api.setContactInfo({
          name: userInfo.name,
          email: userInfo.email,
          phone: userInfo.phone,
          description: `User ID: ${userInfo.userId}\nBalance: ${userInfo.balance}`
        });
        window.jivo_api.sendMessage({
          name: 'System',
          text: `User connected:\nName: ${userInfo.name}\nEmail: ${userInfo.email}\nUser ID: ${userInfo.userId}`
        });
      } else {
        window.jivo_api.sendMessage({ name: 'System', text: 'Guest user connected' });
      }
    } else {
      toast.error(t.supportChatLoading);
    }
  };

  const [clickId, setClickId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const referralCode = params.get('refer_code');
    const clickIdParam = params.get('clickid') || params.get('click_id');
    const affiliateParam = params.get('aff');

    if (referralCode) {
      setShowAuthModal(true);
      setActiveTab('register');
      setFormData(prev => ({ ...prev, referralCode: referralCode }));
      checkReferralCode(referralCode);
    }
    if (clickIdParam) setClickId(clickIdParam);
    if (affiliateParam) setAffiliateCode(affiliateParam);
  }, [location]);

  useEffect(() => {
    if (showAuthModal || showOtpModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showAuthModal, showOtpModal]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        setShowOtpModal(false);
      }
    };
    if (showAuthModal || showOtpModal) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showAuthModal, showOtpModal]);

  const languages = [
    { code: 'bn', name: 'বাংলা', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/BD.svg' },
    { code: 'en', name: 'English', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/US.svg' }
  ];

  const navItems = [
    {
      id: 'casino',
      label: 'Casino',
      path: '/casino-games',
      icon: menu1,
      activeIcon: <FaCoins className="w-5 h-5 text-yellow-400" />,
      requiresAuth: true
    },
    {
      id: 'profile',
      label: 'Deposit',
      path: '/deposit',
      icon: menu3,
      activeIcon: <FaUser className="w-7 h-7 text-blue-400" />,
      requiresAuth: true
    },
    {
      id: 'sports',
      label: 'Sports',
      path: '/sports',
      icon: menu2,
      activeIcon: <GiSoccerBall className="w-5 h-5 text-green-400" />,
      requiresAuth: true
    },
    {
      id: 'livechat',
      label: 'Live Chat',
      path: '/live-chat',
      icon: menu4,
      activeIcon: <FiMessageCircle className="w-5 h-5 text-purple-400" />,
      requiresAuth: false
    }
  ];

  const isCenterItem = (item) => item.id === 'profile';

  const selectLanguage = (lang) => {
    changeLanguage(lang);
    setShowDropdown(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUserData(JSON.parse(storedUser));
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const openAuthModal = (tab) => {
    setShowAuthModal(true);
    setActiveTab(tab);
    setFormData({ email: '', password: '', confirmPassword: '', referralCode: '', currency: 'BDT', mobile: '' });
    setErrors({ password: '', confirmPassword: '', email: '', mobile: '', formError: '' });
    setReferralCodeValid(false);
    setReferralCodeError('');
    setReferrerInfo(null);
    setModalAnimation('slide-up');
  };

  const closeModal = () => {
    setModalAnimation('slide-down');
    setTimeout(() => {
      setShowAuthModal(false);
      setShowOtpModal(false);
      setErrors({ password: '', confirmPassword: '', email: '', mobile: '', formError: '' });
      setReferralCodeValid(false);
      setReferralCodeError('');
      setReferrerInfo(null);
      setIsLoading({
        login: false,
        register: false,
        forgotPassword: false,
        resetPassword: false,
        verifyOtp: false,
        resendOtp: false
      });
      setModalAnimation('');
    }, 300);
  };

  const closeOtpModal = () => {
    setModalAnimation('slide-down');
    setTimeout(() => {
      setShowOtpModal(false);
      setOtp(['', '', '', '', '', '']);
      setModalAnimation('');
    }, 300);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);
  const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen);

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
        setReferralCodeError(t.invalidReferral);
        setReferrerInfo(null);
      }
    } catch (error) {
      setReferralCodeValid(false);
      setReferralCodeError(t.referralCheckError);
      setReferrerInfo(null);
    } finally {
      setReferralCodeChecking(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name] || errors.formError) {
      setErrors({ ...errors, [name]: '', formError: '' });
    }
    if (name === 'referralCode') checkReferralCode(value);
  };

  const handleCurrencySelect = (currencyValue) => {
    setFormData({ ...formData, currency: currencyValue });
    setIsCurrencyDropdownOpen(false);
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpInputRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { password: '', confirmPassword: '', email: '', mobile: '', formError: '' };

    if (!formData.email) {
      newErrors.email = t.emailRequired;
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = t.invalidEmail;
      valid = false;
    }

    if (activeTab === 'register' && !formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
      valid = false;
    } else if (activeTab === 'register' && formData.mobile && !/^01[0-9]{9}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid Bangladeshi mobile number';
      valid = false;
    }

    if ((activeTab === 'login' || activeTab === 'register' || activeTab === 'reset-password') && !formData.password) {
      newErrors.password = t.passwordRequired;
      valid = false;
    } else if ((activeTab === 'login' || activeTab === 'register' || activeTab === 'reset-password') && formData.password.length < 6) {
      newErrors.password = t.passwordLength;
      valid = false;
    }

    if (activeTab === 'register' || activeTab === 'reset-password') {
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t.passwordMismatch;
        valid = false;
      }
    }

    if (activeTab === 'register' && formData.referralCode && !referralCodeValid) {
      newErrors.formError = t.invalidReferral;
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(prev => ({ ...prev, login: true }));
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      setUserData(user);
      closeModal();
      toast.success(t.loginSuccess);
      navigate("/");
      window.location.reload();
    } catch (error) {
      setErrors({ ...errors, formError: error.response?.data?.message || t.loginError });
    } finally {
      setIsLoading(prev => ({ ...prev, login: false }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    if (formData.referralCode && !referralCodeValid) {
      setErrors({ ...errors, formError: t.invalidReferral });
      return;
    }
    setIsLoading(prev => ({ ...prev, register: true }));
    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        referralCode: formData.referralCode,
        currency: formData.currency,
        mobile: formData.mobile
      };
      if (clickId) registrationData.clickId = clickId;
      if (affiliateCode) registrationData.affiliateCode = affiliateCode;

      const response = await axios.post(`${API_BASE_URL}/auth/signup`, registrationData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      setUserData(user);
      closeModal();
      toast.success(t.registerSuccess);
      navigate("/");
      window.location.reload();
    } catch (error) {
      setErrors({ ...errors, formError: error.response?.data?.message || t.registerError });
    } finally {
      setIsLoading(prev => ({ ...prev, register: false }));
    }
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;
    setIsLoading(prev => ({ ...prev, forgotPassword: true }));
    try {
      await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email: formData.email });
      setOtpEmail(formData.email);
      setShowOtpModal(true);
      setOtpRequested(true);
      setCountdown(60);
      toast.success(t.otpSent);
    } catch (error) {
      setErrors({ ...errors, formError: error.response?.data?.message || t.resetPasswordError });
    } finally {
      setIsLoading(prev => ({ ...prev, forgotPassword: false }));
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) { toast.error(t.invalidOtp); return; }
    setIsLoading(prev => ({ ...prev, verifyOtp: true }));
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-reset-otp`, { email: otpEmail, otp: otpCode });
      const { resetToken } = response.data;
      localStorage.setItem('resetToken', resetToken);
      setActiveTab('reset-password');
      setShowOtpModal(false);
      setOtp(['', '', '', '', '', '']);
      toast.success(t.otpVerified);
    } catch (error) {
      toast.error(error.response?.data?.message || t.otpVerifyError);
    } finally {
      setIsLoading(prev => ({ ...prev, verifyOtp: false }));
    }
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;
    setIsLoading(prev => ({ ...prev, resetPassword: true }));
    try {
      const resetToken = localStorage.getItem('resetToken');
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        resetToken,
        newPassword: formData.password
      });
      localStorage.removeItem('resetToken');
      closeModal();
      toast.success(t.passwordResetSuccess);
      const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: response.data.user.email,
        password: formData.password
      });
      const { token, user } = loginResponse.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setIsAuthenticated(true);
      setUserData(user);
      navigate("/");
      window.location.reload();
    } catch (error) {
      setErrors({ ...errors, formError: error.response?.data?.message || t.resetPasswordError });
    } finally {
      setIsLoading(prev => ({ ...prev, resetPassword: false }));
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(prev => ({ ...prev, resendOtp: true }));
    try {
      await axios.post(`${API_BASE_URL}/auth/request-password-reset`, { email: otpEmail });
      setCountdown(60);
      toast.success(t.newOtpSent);
    } catch (error) {
      toast.error(error.response?.data?.message || t.otpResendError);
    } finally {
      setIsLoading(prev => ({ ...prev, resendOtp: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserData(null);
    setProfileDropdownOpen(false);
    toast.success(t.logoutSuccess);
    navigate("/");
    window.location.reload();
  };

  const handleDepositClick = () => { setActiveLeftTab(t.myAccount); setShowPopup(true); };
  const handleWithdrawClick = () => { setActiveLeftTab(t.withdraw); setShowPopup(true); };
  const handleProfileClick = () => { setActiveLeftTab(t.myAccount); setShowPopup(true); };
  const handleTransactionClick = () => { setActiveLeftTab(t.transactions); setShowPopup(true); };
  const handleWalletClick = () => { setActiveLeftTab(t.myAccount); setShowPopup(true); };

  const downloadFileAtURL = (url) => {
    const fileName = url.split("/").pop();
    const aTag = document.createElement("a");
    aTag.href = url;
    aTag.setAttribute("download", fileName);
    document.body.appendChild(aTag);
    aTag.click();
    aTag.remove();
  };

  const menuItems = [
    { icon: sideicon5, label: t.popular, path: '/popular-game' },
    { icon: sideicon3, label: t.myAccount, path: '/profile' },
    { icon: sideicon2, label: t.provider, path: '/provider' },
    { icon: sideicon4, label: t.affiliate, path: '/affiliate-programme' },
    { icon: sideicon1, label: t.vipClub, path: '/vip-club' },
  ];

  const renderMenuItems = () => {
    return menuItems.map((item, index) => (
      <NavLink
        key={index}
        to={item.path}
        onClick={(e) => {
          if (item.onClick) { e.preventDefault(); item.onClick(); }
          else { closeSidebar(); }
        }}
        className="flex items-center bg-white rounded-r-[25px] gap-4 px-3 py-2 text-gray-800 cursor-pointer transition-colors"
      >
        <img src={item.icon} className='text-[20px] pl-[6px]' />
        <span className="font-[500]">{item.label}</span>
      </NavLink>
    ));
  };

  const profileMenuItems = [
    {
      icon: <FaUser className="text-blue-400" />,
      label: t.profile,
      path: '/profile',
      onClick: () => { setActiveLeftTab(t.myAccount); setShowPopup(true); setProfileDropdownOpen(false); }
    },
    {
      icon: <FaHistory className="text-blue-400" />,
      label: t.transactions,
      path: '/transactions',
      onClick: () => { setActiveLeftTab(t.transactions); setShowPopup(true); setProfileDropdownOpen(false); }
    },
    { icon: <FaSignOutAlt className="text-red-400" />, label: t.logout, path: '/logout', onClick: handleLogout }
  ];

  const handleNavItemClick = (item) => (e) => {
    if (item.requiresAuth && !isAuthenticated) {
      e.preventDefault();
      openAuthModal('register');
    }
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

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) closeModal();
  };

  const handleOtpOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) closeOtpModal();
  };

  // === SPIN WHEEL STATES ===
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [spinEligibility, setSpinEligibility] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [hasDeposited, setHasDeposited] = useState(null);

  const checkDepositStatus = async () => {
    if (!userData?._id) return false;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/user/check-deposit-status/${userData._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const deposited = response.data.success && response.data.data.hasCompletedDeposit;
      setHasDeposited(deposited);
      return deposited;
    } catch (error) {
      console.error('Error checking deposit status:', error);
      setHasDeposited(false);
      return false;
    }
  };

  const checkSpinEligibility = async () => {
    if (!isAuthenticated || !userData) {
      setSpinEligibility(null);
      setSpinCount(0);
      setHasDeposited(null);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const deposited = await checkDepositStatus();
      if (!deposited) {
        setSpinEligibility({ canSpin: false, reason: 'no_deposit' });
        setSpinCount(0);
        return;
      }
      const response = await axios.get(
        `${API_BASE_URL}/user/spin-wheel/check-eligibility/${userData._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        const data = response.data.data;
        setSpinEligibility(data);
        setSpinCount(data.canSpin ? 1 : 0);
      } else {
        setSpinCount(0);
      }
    } catch (error) {
      console.error('Error checking spin eligibility:', error);
      setSpinEligibility(null);
      setSpinCount(0);
    }
  };

  useEffect(() => {
    if (isAuthenticated && userData) {
      checkSpinEligibility();
    } else {
      setSpinEligibility(null);
      setSpinCount(0);
      setHasDeposited(null);
    }
  }, [isAuthenticated, userData]);

  const toggleSpinWheel = async () => {
    if (!isAuthenticated) { openAuthModal('register'); return; }
    const deposited = await checkDepositStatus();
    const isMobile = window.innerWidth < 768;
    if (!deposited) {
      if (isMobile) { navigate('/deposit'); }
      else { setActiveLeftTab(t.deposit); setShowPopup(true); }
      return;
    }
    if (spinCount > 0) {
      setShowSpinWheel(true);
    } else {
      toast.error(t.noSpinsLeft || "No spins available. Come back tomorrow!");
    }
  };

  const handleSpinComplete = () => {
    setTimeout(() => {
      if (isAuthenticated && userData) {
        checkSpinEligibility();
        fetchUserData();
      }
    }, 1000);
  };

  useEffect(() => {
    if (isAuthenticated && userData) {
      checkSpinEligibility();
    } else {
      setSpinEligibility(null);
      setSpinCount(0);
    }
  }, [isAuthenticated, userData]);

  return (
    <>
      <MobileAppBanner />

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes scaleOut {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(0.9); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 1.5s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-sparkle { animation: sparkle 1s ease-in-out infinite; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
        .animate-slideDown { animation: slideDown 0.3s ease-in; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-fadeOut { animation: fadeOut 0.3s ease-in; }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        .animate-scaleOut { animation: scaleOut 0.3s ease-in; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
      `}</style>

      {/* ─── HEADER BAR ─── */}
      <header className="bg-[#EEF0F8] sticky top-0 left-0 px-3 md:px-8 py-2 md:py-3 z-[100] flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center md:space-x-2">
          <button onClick={toggleSidebar} className="text-gray-800 cursor-pointer hover:text-blue-400 transition-colors text-[26px] md:text-[27px]">
            <GiHamburgerMenu />
          </button>
          <NavLink to="/">
            <img className='w-[100px] md:w-[100px]' src={logo} alt="Logo" />
          </NavLink>
        </div>

        <Toaster toastOptions={{
          style: { background: '#1f2937', color: '#fff', border: '1px solid #374151' }
        }} />

        <div className="flex items-center gap-3 md:gap-5">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => openAuthModal("login")}
                className="bg-theme_color2 px-4 md:px-5 py-2 rounded-[5px] text-gray-800 text-sm md:text-base disabled:opacity-70"
                disabled={isLoading.login}
              >
                {t.login}
              </button>
              <button
                onClick={() => openAuthModal("register")}
                className="bg-theme_color2 px-5 py-2 rounded-[5px] text-gray-800 text-sm md:text-base disabled:opacity-70"
                disabled={isLoading.register}
              >
                {t.register}
              </button>
            </>
          ) : (
            <>
              {/* Balance Box */}
              <div className="flex flex-col gap-1.5 border border-[#BDE3F0] rounded-[15px] p-2 bg-transparent">
                <div className="flex items-center gap-2">
                  <FaBangladeshiTakaSign className="text-[#BBB] text-[16px] ml-0.5" />
                  <div className="bg-white px-4 rounded-full border border-gray-100 w-[90px] md:w-[120px] text-center">
                    <span className="text-[#555] text-[12px] md:text-sm font-medium">
                      {userData?.balance?.toFixed(2) || "1000.00"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FaMoneyBillAlt className="text-[#BBB] text-[16px] ml-0.5" />
                  <div className="bg-white px-4 rounded-full border border-gray-100 w-[90px] md:w-[120px] text-center">
                    <span className="text-[#555] text-[12px] md:text-sm font-medium">
                      {userData?.bonusBalance?.toFixed(2) || "100000.00"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Icon */}
              <div className="relative group">
                <button
                  onClick={toggleProfileDropdown}
                  className="items-center md:flex hidden justify-center w-11 h-11 md:w-14 md:h-14 rounded-full border-[1.5px] border-[#888] hover:border-cyan-400 transition-all bg-transparent"
                >
                  <FaUser className="text-[#89E3F5] text-2xl md:text-3xl" />
                </button>
                <NavLink
                  to="/profile"
                  className="flex items-center md:hidden justify-center w-11 h-11 md:w-14 md:h-14 rounded-full border-[1.5px] border-[#888] hover:border-cyan-400 transition-all bg-transparent"
                >
                  <FaUser className="text-[#89E3F5] text-2xl md:text-3xl" />
                </NavLink>

                {profileDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-lg shadow-xl z-[110] border border-gray-100 overflow-hidden">
                    <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                      <p className="text-gray-800 font-bold truncate">{userData?.username || "Guest User"}</p>
                      <p className="text-cyan-600 text-xs font-medium">Account ID: {userData?._id?.slice(-6)}</p>
                    </div>
                    <ul className="py-1">
                      {profileMenuItems.map((item, idx) => (
                        <li key={idx}>
                          <button
                            onClick={() => { item.onClick?.(); setProfileDropdownOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-cyan-50 transition-colors"
                          >
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm">{item.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {/* ─── SIDEBAR OVERLAY ─── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] z-[9999] xl:hidden" onClick={closeSidebar} />
      )}

      {/* ─── SIDEBAR ─── */}
      <div className={`fixed inset-0 z-[10000] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} xl:hidden`}>
        <div className="bg-[#98E1EE]/80 h-full w-4/5 max-w-xs overflow-y-auto border-r border-gray-800 flex flex-col">
          <div className="p-4 py-[30px] flex items-center justify-between">
            <img className='w-[100px]' src={logo} alt="" />
            <button onClick={closeSidebar} className="text-gray-600 hover:text-gray-900 text-[24px] cursor-pointer transition-colors">
              <IoClose />
            </button>
          </div>
          <div className="flex gap-4 px-4 pb-4">
            <NavLink to="/casino-games" className="flex-1 py-2.5 px-4 text-center bg-white text-gray-700 font-semibold rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] hover:scale-105 transition-transform">
              Casino
            </NavLink>
            <NavLink to="/slot-games" className="flex-1 py-2.5 px-4 text-center bg-white text-gray-700 font-semibold rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] hover:scale-105 transition-transform">
              Slots
            </NavLink>
          </div>
          <div className="grid grid-cols-1 gap-5 py-4 pr-[15px]">
            {renderMenuItems()}
          </div>
          <div className='h-full flex w-full justify-center py-[40px] items-end'>
            <div className='w-full'>
              <div className="relative w-full border-t-[1px] border-b-[1px] border-gray-200 mt-2 py-[5px] mb-[20px]">
                <button onClick={toggleDropdown} className="flex items-center w-full p-3 cursor-pointer text-gray-800">
                  <img src={language.flag} alt={language.name} className="w-6 h-6 mr-2 rounded-full" />
                  <span className="flex-1 text-left font-[500]">{language.name}</span>
                  <MdArrowDropDown className={`text-lg transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showDropdown && (
                  <div className="mt-2 w-full bg-white/80 backdrop-blur-md rounded-[6px] shadow-xl border border-white/20 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { selectLanguage(lang); closeSidebar(); }}
                        className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-white/50 transition-colors"
                      >
                        <img src={lang.flag} alt={lang.name} className="w-6 h-6 mr-2 rounded-full" />
                        <span className="font-[500]">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 items-center justify-center">
                <a href="https://t.me/+CUD2OZlCEOAxMTg0" target="_blank" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#24A1DE] text-white shadow-sm hover:scale-110 transition-transform"><FaTelegramPlane /></a>
                <a href="https://wa.me/61480897550" target="_blank" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#4ADE80] text-white shadow-sm hover:scale-110 transition-transform"><FaWhatsapp /></a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#006AFF] via-[#A033FF] to-[#FF5280] text-white shadow-sm hover:scale-110 transition-transform"><FaFacebookMessenger /></a>
                <a href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-[#F9CE34] via-[#EE2A7B] to-[#6228D7] text-white shadow-sm hover:scale-110 transition-transform"><FaInstagram /></a>
                <a href="https://www.facebook.com/genzzzcasino" target="_blank" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1877F2] text-white shadow-sm hover:scale-110 transition-transform"><FaFacebookF /></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── BOTTOM NAVBAR ─── */}
      <div className='w-full fixed bottom-0 left-1/2 -translate-x-1/2 z-50'>
        <nav className="w-full md:hidden">
          <div className="relative w-full h-16 bg-gray-50 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-sm">
            <div className="flex justify-around items-center h-full">
              <button
                onClick={() => setShowSearchPopup(true)}
                className="flex-1 flex flex-col items-center justify-center h-full relative transition-all duration-300 text-gray-500"
              >
                <div className="text-2xl"><FaSearch className="w-5 h-5" /></div>
                <span className="text-[10px] font-bold uppercase tracking-wide mt-1">Search</span>
              </button>
              {navItems.filter(item => item.id !== 'home').map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  onClick={handleNavItemClick(item)}
                  className={({ isActive }) =>
                    `flex-1 flex flex-col items-center justify-center h-full relative transition-all duration-300 ${isActive ? 'text-[#EAB308]' : 'text-gray-500'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isCenterItem(item) ? (
                        <div className="absolute -top-6 w-14 h-14 rounded-full flex p-[2px] items-center justify-center transition-all duration-300 transform shadow-[0_4px_15px_rgba(0,0,0,0.2)] bg-white border-[1px] border-theme_color2">
                          <img src={item.icon} alt="" />
                        </div>
                      ) : (
                        <>
                          <div className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                            <img src={item.icon} alt="" />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wide mt-1 transition-colors duration-300`}>
                            {item.label}
                          </span>
                          {isActive && (
                            <div className="absolute bottom-1 w-1 h-1 bg-[#EAB308] rounded-full shadow-[0_0_8px_#EAB308]"></div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </div>

{showAuthModal && (
        <div
          className={`fixed inset-0 z-[10001] flex items-end  md:items-center justify-center bg-[rgba(0,0,0,0.6)] md:p-4 backdrop-blur-sm ${
            modalAnimation === 'slide-up' ? 'animate-fadeIn' :
            modalAnimation === 'slide-down' ? 'animate-fadeOut' : ''
          }`}
          onClick={handleOutsideClick}
        >
          <div
            ref={modalRef}
            className={`bg-white w-full max-w-lg  md:rounded-2xl shadow-2xl  overflow-hidden md:border border-[#0FD9F1]/30 transform transition-all duration-300 ease-out ${
              modalAnimation === 'slide-up' ? 'animate-slideUp' :
              modalAnimation === 'slide-down' ? 'animate-slideDown' :
              'md:animate-scaleIn'
            }`}
            style={{
              height: '85vh',
              borderBottomLeftRadius: '0',
              borderBottomRightRadius: '0'
            }}
          >
            {/* Swipe indicator */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1 bg-[#0FD9F1]/40 rounded-full"></div>
            </div>

            {/* Top accent bar */}

            {/* Modal header */}
            <div className="px-6 py-3 flex justify-between items-center bg-white">
              <h2 className="text-gray-800 text-xl font-bold">
                {activeTab === 'login' && t.login}
                {activeTab === 'register' && t.register}
                {activeTab === 'forgot-password' && t.resetPassword}
                {activeTab === 'reset-password' && t.setNewPassword}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 cursor-pointer hover:text-[#0FD9F1] transition-colors p-2 rounded-full hover:bg-[#0FD9F1]/10"
              >
                <IoCloseOutline className="text-xl" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-gray-200 px-6 bg-white">
              {['login', 'register'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm md:text-base font-semibold cursor-pointer transition-all duration-200 relative ${
                    activeTab === tab ? 'text-[#0FD9F1]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {tab === 'login' ? t.login : t.register}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0FD9F1] rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="p-6 overflow-y-auto bg-white" style={{ maxHeight: 'calc(85vh - 140px)' }}>
              {errors.formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-shake flex items-center gap-2">
                  <span className="text-red-500">⚠</span>
                  {errors.formError}
                </div>
              )}

              {/* ── LOGIN ── */}
              {activeTab === 'login' && (
                <div className="space-y-5">
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-3 text-[#0FD9F1] text-lg" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t.emailPlaceholder}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.email ? 'border-red-400' : 'border-gray-200'} py-3 pl-12 pr-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0FD9F1]/40 focus:border-[#0FD9F1] text-base placeholder-gray-400 transition-all duration-200`}
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-[#0FD9F1] text-lg" />
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={t.passwordPlaceholder}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.password ? 'border-red-400' : 'border-gray-200'} py-3 pl-12 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0FD9F1]/40 focus:border-[#0FD9F1] text-base placeholder-gray-400 transition-all duration-200`}
                      autoComplete="current-password"
                    />
                    <button
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-3 text-gray-400 cursor-pointer p-1 hover:text-[#0FD9F1] rounded transition-colors"
                    >
                      {passwordVisible ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <label className="flex items-center cursor-pointer text-gray-500">
                      <input type="checkbox" className="mr-2 w-4 h-4 accent-[#0FD9F1]" />
                      <span>{t.rememberMe}</span>
                    </label>
                    <button
                      onClick={() => setActiveTab('forgot-password')}
                      className="text-[#0FD9F1] hover:underline cursor-pointer transition-colors font-medium"
                    >
                      {t.forgotPassword}
                    </button>
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={isLoading.login}
                    className="w-full py-3 rounded-xl flex items-center justify-center text-white font-semibold text-base transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0FD9F1]/30"
                    style={{ background: 'linear-gradient(135deg, #0FD9F1, #0bb8cc)' }}
                  >
                    {isLoading.login ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        {t.loggingIn}...
                      </div>
                    ) : t.login}
                  </button>
                </div>
              )}

              {/* ── REGISTER ── */}
              {activeTab === 'register' && (
                <div className="space-y-4 ">
                  {/* Email */}
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-3 text-[#0FD9F1] text-lg" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t.emailPlaceholder}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.email ? 'border-red-400' : 'border-gray-200'} py-3 pl-12 pr-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0FD9F1]/40 focus:border-[#0FD9F1] text-base placeholder-gray-400 transition-all duration-200`}
                      autoComplete="email"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-[#0FD9F1] text-lg" />
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={t.passwordPlaceholder}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.password ? 'border-red-400' : 'border-gray-200'} py-3 pl-12 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0FD9F1]/40 focus:border-[#0FD9F1] text-base placeholder-gray-400 transition-all duration-200`}
                      autoComplete="new-password"
                    />
                    <button
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-3 text-gray-400 cursor-pointer p-1 hover:text-[#0FD9F1] rounded transition-colors"
                    >
                      {passwordVisible ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-[#0FD9F1] text-lg" />
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder={t.confirmPasswordPlaceholder}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} py-3 pl-12 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0FD9F1]/40 focus:border-[#0FD9F1] text-base placeholder-gray-400 transition-all duration-200`}
                      autoComplete="new-password"
                    />
                    <button
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      className="absolute right-3 top-3 text-gray-400 cursor-pointer p-1 hover:text-[#0FD9F1] rounded transition-colors"
                    >
                      {confirmPasswordVisible ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</p>}
                  </div>

                  {/* Mobile */}
                  <div className="relative">
                    <FaPhoneAlt className="absolute left-3 top-3 text-[#0FD9F1] text-lg" />
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                       placeholder={t.mobilenumber}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.mobile ? 'border-red-400' : 'border-gray-200'} py-3 pl-12 pr-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0FD9F1]/40 focus:border-[#0FD9F1] text-base placeholder-gray-400 transition-all duration-200`}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1.5">{errors.mobile}</p>}
                  </div>

                  {/* Currency selector */}
                  <div className="relative" ref={currencyDropdownRef}>
                    <div
                      className="w-full bg-gray-50 text-gray-800 border border-gray-200 py-3 pl-12 pr-3 rounded-xl cursor-pointer flex items-center justify-between hover:border-[#0FD9F1] transition-colors"
                      onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                    >
                      <FaMoneyBillWave className="absolute left-3 text-[#0FD9F1] text-lg" />
                      <span className="text-base text-gray-700">{getCurrentCurrencyDisplay()}</span>
                      <MdArrowDropDown className={`text-xl text-gray-400 transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    {isCurrencyDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {currencyOptions.map((currency) => (
                          <div
                            key={currency.value}
                            className={`px-4 py-2.5 cursor-pointer hover:bg-[#0FD9F1]/10 flex items-center gap-2 transition-colors ${
                              formData.currency === currency.value ? 'bg-[#0FD9F1]/10 text-[#0FD9F1]' : 'text-gray-700'
                            }`}
                            onClick={() => handleCurrencySelect(currency.value)}
                          >
                            <span className="text-lg">{currency.flag}</span>
                            <span className="text-sm font-medium">{currency.label}</span>
                            <span className="text-xs text-gray-400 ml-auto">{currency.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Referral code */}
                  <div className="relative">
                    <FaUserFriends className="absolute left-3 top-3 text-[#0FD9F1] text-lg" />
                    <input
                      type="text"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleInputChange}
                      placeholder={t.referralCodePlaceholder}
                      className="w-full bg-gray-50 text-gray-800 border border-gray-200 py-3 pl-12 pr-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0FD9F1]/40 focus:border-[#0FD9F1] text-base placeholder-gray-400 transition-all duration-200"
                    />
                    {referralCodeChecking && (
                      <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#0FD9F1] border-t-transparent"></div>
                      </div>
                    )}
                    {referralCodeError && !referralCodeChecking && (
                      <p className="text-red-500 text-xs mt-1.5">{referralCodeError}</p>
                    )}
                    {referrerInfo && !referralCodeChecking && (
                      <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
                        ✓ {t.referrer}: {referrerInfo.username}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={(formData.referralCode && !referralCodeValid) || isLoading.register}
                    className={`w-full py-3 rounded-xl flex items-center justify-center text-white font-semibold text-base transition-all duration-200 active:scale-95 shadow-lg shadow-[#0FD9F1]/30 ${
                      (formData.referralCode && !referralCodeValid) || isLoading.register
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:opacity-90'
                    }`}
                    style={{ background: 'linear-gradient(135deg, #0FD9F1, #0bb8cc)' }}
                  >
                    {isLoading.register ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        {t.registering}...
                      </div>
                    ) : t.register}
                  </button>

                  <div className="text-center text-xs text-gray-400 pt-1">
                    {language.code === 'bn' ? (
                      <>
                        {t.register} করে, আপনি আমাদের{' '}
                        <a href="#" className="text-[#0FD9F1] hover:underline">{t.terms}</a> এবং{' '}
                        <a href="#" className="text-[#0FD9F1] hover:underline">{t.privacyPolicy}</a> স্বীকার করেছেন
                      </>
                    ) : (
                      <>
                        By {t.register}, you agree to our{' '}
                        <a href="#" className="text-[#0FD9F1] hover:underline">{t.terms}</a> and{' '}
                        <a href="#" className="text-[#0FD9F1] hover:underline">{t.privacyPolicy}</a>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── FORGOT PASSWORD ── */}
              {activeTab === 'forgot-password' && (
                <div className="space-y-5">
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-3 text-[#0FD9F1] text-lg" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t.emailPlaceholder}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.email ? 'border-red-400' : 'border-gray-200'} py-3 pl-12 pr-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0FD9F1]/40 focus:border-[#0FD9F1] text-base placeholder-gray-400 transition-all duration-200`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email}</p>}
                  </div>
                  <button
                    onClick={handleForgotPassword}
                    className="w-full py-3 rounded-xl flex items-center justify-center text-white font-semibold text-base transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-lg shadow-[#0FD9F1]/30 hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #0FD9F1, #0bb8cc)' }}
                    disabled={isLoading.forgotPassword}
                  >
                    {isLoading.forgotPassword ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        {t.sending}...
                      </div>
                    ) : t.resetPassword}
                  </button>
                  <button
                    onClick={() => setActiveTab('login')}
                    className="flex items-center justify-center w-full text-[#0FD9F1] hover:underline cursor-pointer text-sm py-2 transition-colors font-medium"
                  >
                    <FaArrowLeft className="mr-2" /> {t.backToLogin}
                  </button>
                </div>
              )}

              {/* ── RESET PASSWORD ── */}
              {activeTab === 'reset-password' && (
                <div className="space-y-5">
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-[#0FD9F1] text-lg" />
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={t.passwordPlaceholder}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.password ? 'border-red-400' : 'border-gray-200'} py-3 pl-12 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0FD9F1]/40 focus:border-[#0FD9F1] text-base placeholder-gray-400 transition-all duration-200`}
                    />
                    <button
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-3 top-3 text-gray-400 cursor-pointer p-1 hover:text-[#0FD9F1] rounded transition-colors"
                    >
                      {passwordVisible ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                    </button>
                    {errors.password && <p className="text-red-500 text-xs mt-1.5">{errors.password}</p>}
                  </div>
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-[#0FD9F1] text-lg" />
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder={t.confirmPasswordPlaceholder}
                      className={`w-full bg-gray-50 text-gray-800 border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} py-3 pl-12 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0FD9F1]/40 focus:border-[#0FD9F1] text-base placeholder-gray-400 transition-all duration-200`}
                    />
                    <button
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      className="absolute right-3 top-3 text-gray-400 cursor-pointer p-1 hover:text-[#0FD9F1] rounded transition-colors"
                    >
                      {confirmPasswordVisible ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                    </button>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword}</p>}
                  </div>
                  <button
                    onClick={handleResetPassword}
                    className="w-full py-3 rounded-xl flex items-center justify-center text-white font-semibold text-base transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-lg shadow-[#0FD9F1]/30 hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #0FD9F1, #0bb8cc)' }}
                    disabled={isLoading.resetPassword}
                  >
                    {isLoading.resetPassword ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        {t.updating}...
                      </div>
                    ) : t.changePassword}
                  </button>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <div className="text-center text-sm text-gray-500">
                {activeTab === 'login' ? (
                  <>
                    {t.noAccount}{' '}
                    <button
                      onClick={() => setActiveTab('register')}
                      className="text-[#0FD9F1] hover:underline cursor-pointer font-semibold transition-colors"
                    >
                      {t.register}
                    </button>
                  </>
                ) : (
                  <>
                    {t.haveAccount}{' '}
                    <button
                      onClick={() => setActiveTab('login')}
                      className="text-[#0FD9F1] hover:underline cursor-pointer font-semibold transition-colors"
                    >
                      {t.login}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── OTP MODAL ─── */}
      {showOtpModal && (
        <div
          className="fixed inset-0 z-[10002] flex items-center justify-center bg-[rgba(0,0,0,0.6)] p-4 backdrop-blur-sm animate-fadeIn"
          onClick={handleOtpOutsideClick}
        >
          <div
            ref={modalRef}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#0FD9F1]/20 transform transition-all duration-300 animate-scaleIn"
          >
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-[#0FD9F1] to-[#0bb8cc]" />

            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-gray-800 text-xl font-bold">{t.verifyOtp}</h2>
              <button
                onClick={closeOtpModal}
                className="text-gray-400 hover:text-[#0FD9F1] transition-colors p-2 rounded-full hover:bg-[#0FD9F1]/10"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-500 mb-6 text-center text-sm">
                {t.otpMessage}:{' '}
                <span className="text-[#0FD9F1] font-semibold">{otpEmail}</span>
              </p>

              <div className="flex justify-center space-x-3 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#0FD9F1]/40 focus:border-[#0FD9F1] transition-all duration-200"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full py-3 rounded-xl flex items-center justify-center text-white font-semibold text-base transition-all duration-200 active:scale-95 disabled:opacity-50 mb-4 shadow-lg shadow-[#0FD9F1]/30 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #0FD9F1, #0bb8cc)' }}
                disabled={isLoading.verifyOtp}
              >
                {isLoading.verifyOtp ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    {t.verifying}...
                  </div>
                ) : t.verifyOtp}
              </button>

              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-gray-400 text-sm">
                    {t.resendOtpIn}{' '}
                    <span className="text-[#0FD9F1] font-semibold">{countdown}</span>{' '}
                    {t.seconds}
                  </p>
                ) : (
                  <button
                    onClick={resendOtp}
                    className="text-[#0FD9F1] hover:underline cursor-pointer text-sm font-medium transition-colors disabled:opacity-50"
                    disabled={isLoading.resendOtp}
                  >
                    {isLoading.resendOtp ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0FD9F1] border-t-transparent mr-2"></div>
                        {t.sending}...
                      </div>
                    ) : t.resendOtp}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Popup */}
      <SearchPopup isOpen={showSearchPopup} onClose={() => setShowSearchPopup(false)} />
    </>
  );
};

export default Header;
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
import { FaTelegramPlane,FaFacebookMessenger ,FaInstagram } from "react-icons/fa";
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
import SearchPopup from '../SearchPopup/SearchPopup'; // Import SearchPopup

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
  const [showSearchPopup, setShowSearchPopup] = useState(false); // Add this state
  // Add this to your useState declarations
  const [affiliateCode, setAffiliateCode] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    currency: 'BDT', // Added currency field with default value
    mobile: '' // Added mobile number field
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

  // Get current currency display
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

  // Close currency dropdown when clicking outside
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
        window.jivo_api.sendMessage({
          name: 'System',
          text: 'Guest user connected'
        });
      }
    } else {
      toast.error(t.supportChatLoading);
    }
  };

  // Add clickId to state
  const [clickId, setClickId] = useState('');

  // Extract clickid from URL on component mount
// Update the useEffect that extracts URL parameters
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const referralCode = params.get('refer_code');
  const clickIdParam = params.get('clickid') || params.get('click_id');
  const affiliateParam = params.get('aff'); // Add this line
  
  if (referralCode) {
    setShowAuthModal(true);
    setActiveTab('register');
    setFormData(prev => ({
      ...prev,
      referralCode: referralCode
    }));
    checkReferralCode(referralCode);
  }
  
  // Store clickId if present
  if (clickIdParam) {
    setClickId(clickIdParam);
  }
  
  // Store affiliate code if present
  if (affiliateParam) {
    setAffiliateCode(affiliateParam);
  }
}, [location]);

  useEffect(() => {
    // Prevent body scroll when modal is open
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
    // Handle escape key to close modal
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        setShowOtpModal(false);
      }
    };

    if (showAuthModal || showOtpModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
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
    icon:menu4, 
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen);
  };

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
    if (name === 'referralCode') {
      checkReferralCode(value);
    }
  };

  const handleCurrencySelect = (currencyValue) => {
    setFormData({ ...formData, currency: currencyValue });
    setIsCurrencyDropdownOpen(false);
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      password: '',
      confirmPassword: '',
      email: '',
      mobile: '',
      formError: ''
    };
    
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
      setErrors({
        ...errors,
        formError: error.response?.data?.message || t.loginError
      });
    } finally {
      setIsLoading(prev => ({ ...prev, login: false }));
    }
  };

  // Update the handleRegister function to include clickId, currency and mobile
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
      currency: formData.currency, // Added currency field
      mobile: formData.mobile // Added mobile number field
    };
    
    // Add clickId to registration data if available
    if (clickId) {
      registrationData.clickId = clickId;
    }
    
    // Add affiliate code to registration data if available
    if (affiliateCode) {
      registrationData.affiliateCode = affiliateCode;
    }
    
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
    setErrors({
      ...errors,
      formError: error.response?.data?.message || t.registerError
    });
  } finally {
    setIsLoading(prev => ({ ...prev, register: false }));
  }
};
  const handleForgotPassword = async () => {
    if (!validateForm()) return;
    setIsLoading(prev => ({ ...prev, forgotPassword: true }));
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/request-password-reset`, {
        email: formData.email
      });
      setOtpEmail(formData.email);
      setShowOtpModal(true);
      setOtpRequested(true);
      setCountdown(60);
      toast.success(t.otpSent);
    } catch (error) {
      setErrors({
        ...errors,
        formError: error.response?.data?.message || t.resetPasswordError
      });
    } finally {
      setIsLoading(prev => ({ ...prev, forgotPassword: false }));
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error(t.invalidOtp);
      return;
    }
    setIsLoading(prev => ({ ...prev, verifyOtp: true }));
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
      setErrors({
        ...errors,
        formError: error.response?.data?.message || t.resetPasswordError
      });
    } finally {
      setIsLoading(prev => ({ ...prev, resetPassword: false }));
    }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(prev => ({ ...prev, resendOtp: true }));
    try {
      await axios.post(`${API_BASE_URL}/auth/request-password-reset`, {
        email: otpEmail
      });
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

  const handleDepositClick = () => {
    setActiveLeftTab(t.myAccount);
    setShowPopup(true);
  };

  const handleWithdrawClick = () => {
    setActiveLeftTab(t.withdraw);
    setShowPopup(true);
  };

  const handleProfileClick = () => {
    setActiveLeftTab(t.myAccount);
    setShowPopup(true);
  };

  const handleTransactionClick = () => {
    setActiveLeftTab(t.transactions);
    setShowPopup(true);
  };

  const handleWalletClick = () => {
    setActiveLeftTab(t.myAccount);
    setShowPopup(true);
  };

  // Add the download function
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
  { icon:sideicon2, label: t.provider, path: '/provider' },
  { icon:sideicon4, label: t.affiliate, path: '/affiliate-programme' },
  { icon:sideicon1, label: t.vipClub, path: '/vip-club' },
];
  // Update the menu items rendering in the sidebar
  const renderMenuItems = () => {
    return menuItems.map((item, index) => (
      <NavLink
        key={index}
        to={item.path}
        onClick={(e) => {
          if (item.onClick) {
            e.preventDefault();
            item.onClick();
          } else {
            closeSidebar();
          }
        }}
        className="flex items-center bg-white rounded-r-[25px] gap-4 px-3  py-2 text-gray-800 cursor-pointer transition-colors"
      >
        <img src={item.icon} className='text-[20px]'/>
        <span className=" font-[500]">{item.label}</span>
      </NavLink>
    ));
  };
  const profileMenuItems = [
    {
      icon: <FaUser className="text-blue-400" />,
      label: t.profile,
      path: '/profile',
      onClick: () => {
        setActiveLeftTab(t.myAccount);
        setShowPopup(true);
        setProfileDropdownOpen(false);
      }
    },
    {
      icon: <FaHistory className="text-blue-400" />,
      label: t.transactions,
      path: '/transactions',
      onClick: () => {
        setActiveLeftTab(t.transactions);
        setShowPopup(true);
        setProfileDropdownOpen(false);
      }
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

  // Handle outside click for modals
  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  const handleOtpOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeOtpModal();
    }
  };




// === SPIN WHEEL STATES ===
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [spinEligibility, setSpinEligibility] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [hasDeposited, setHasDeposited] = useState(null); // NEW: Track deposit status

  // === CHECK DEPOSIT STATUS ===
  const checkDepositStatus = async () => {
    if (!userData?._id) return false;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/user/check-deposit-status/${userData._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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

  // === CHECK SPIN ELIGIBILITY (Now includes deposit check) ===
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

      // First check deposit
      const deposited = await checkDepositStatus();
      if (!deposited) {
        setSpinEligibility({ canSpin: false, reason: 'no_deposit' });
        setSpinCount(0);
        return;
      }

      // Then check spin eligibility
      const response = await axios.get(
        `${API_BASE_URL}/user/spin-wheel/check-eligibility/${userData._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
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

  // === REFRESH SPIN STATUS AFTER LOGIN / SPIN / DEPOSIT ===
  useEffect(() => {
    if (isAuthenticated && userData) {
      checkSpinEligibility();
    } else {
      setSpinEligibility(null);
      setSpinCount(0);
      setHasDeposited(null);
    }
  }, [isAuthenticated, userData]);

  // === TOGGLE SPIN WHEEL WITH DEPOSIT CHECK ===
// === TOGGLE SPIN WHEEL WITH DEPOSIT CHECK ===
const toggleSpinWheel = async () => {
  if (!isAuthenticated) {
    openAuthModal('register');
    return;
  }

  // Re-check deposit status on every click
  const deposited = await checkDepositStatus();

  // ----- MOBILE: redirect to /deposit -----
  const isMobile = window.innerWidth < 768;   // md breakpoint in Tailwind

  if (!deposited) {
    if (isMobile) {
      navigate('/deposit');          // <-- NEW: go to deposit page on mobile
    } else {
      setActiveLeftTab(t.deposit);   // keep existing popup on desktop
      setShowPopup(true);
    }
    return;
  }

  // ----- User has deposited → show wheel if a spin is available -----
  if (spinCount > 0) {
    setShowSpinWheel(true);
  } else {
    toast.error(t.noSpinsLeft || "No spins available. Come back tomorrow!");
  }
};

  // === REFRESH AFTER SPIN ===
  const handleSpinComplete = () => {
    setTimeout(() => {
      if (isAuthenticated && userData) {
        checkSpinEligibility();
        fetchUserData(); // Refresh balance
      }
    }, 1000);
  };
// Check spin eligibility when user data changes
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

{/* Add these custom animations to your CSS */}
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
  
  .animate-bounce-subtle {
    animation: bounce-subtle 2s ease-in-out infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }
  
  .animate-ping-slow {
    animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  
  .animate-bounce-slow {
    animation: bounce-slow 1.5s ease-in-out infinite;
  }
  
  .animate-shimmer {
    animation: shimmer 2s ease-in-out infinite;
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out;
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .animate-sparkle {
    animation: sparkle 1s ease-in-out infinite;
  }
`}</style>
      <header className="bg-[#EEF0F8] sticky top-0 left-0 px-3 md:px-8 py-2 md:py-3 z-[100] flex items-center justify-between  border-b border-gray-200">
        <div className="flex items-center md:space-x-2">
          <button onClick={toggleSidebar} className="text-gray-800 cursor-pointer hover:text-blue-400 transition-colors text-[26px] md:text-[27px]">
            <GiHamburgerMenu />
          </button>
          <NavLink to="/">
            <img className='w-[100px] md:w-[100px]' src={logo} alt="Logo" />
          </NavLink>
        </div>
        <Toaster toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151'
          }
        }} />
{/* ──────────────────────────────────────────────────────────────
   Right side of the header (Authenticated State - Match Image)
   ────────────────────────────────────────────────────────────── */}
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

      {/* Register button – hidden on mobile */}
      <button
        onClick={() => openAuthModal("register")}
        className=" bg-theme_color2 px-5 py-2 rounded-[5px] text-gray-800 text-sm md:text-base disabled:opacity-70"
        disabled={isLoading.register}
      >
        {t.register}
      </button>
    </>
  ) : (
    <>
      {/* ---- Profile dropdown ---- */}
    {/* --- The Balance Box (Matches the blue rounded rectangle) --- */}
  <div className="flex flex-col gap-1.5 border border-[#BDE3F0] rounded-[15px] p-2 bg-transparent">
    
    {/* Top Row: Taka Symbol + Balance */}
    <div className="flex items-center gap-2">
           <FaBangladeshiTakaSign  className="text-[#BBB] text-[16px] ml-0.5" />
      <div className="bg-white px-4  rounded-full border border-gray-100 w-[90px] md:w-[120px] text-center">
        <span className="text-[#555] text-[12px] md:text-sm font-medium">
          {userData?.balance?.toFixed(2) || "1000.00"}
        </span>
      </div>
    </div>
    
    {/* Bottom Row: Banknote Icon + Bonus */}
    <div className="flex items-center gap-2">
      <FaMoneyBillAlt className="text-[#BBB] text-[16px] ml-0.5" />
      <div className="bg-white px-4 rounded-full border border-gray-100 w-[90px] md:w-[120px] text-center">
        <span className="text-[#555] text-[12px] md:text-sm font-medium">
          {userData?.bonusBalance?.toFixed(2) || "100000.00"}
        </span>
      </div>
    </div>
  </div>

  {/* --- The Profile Icon (Matches the thin gray circle with blue user) --- */}
  <div className="relative group">
    <button
      onClick={toggleProfileDropdown}
      className="flex items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-full border-[1.5px] border-[#888] hover:border-cyan-400 transition-all bg-transparent"
    >
      {/* This icon matches the one in your image exactly */}
      <FaUser className="text-[#89E3F5] text-2xl md:text-3xl" />
    </button>
    
    {/* Profile Dropdown */}
    {profileDropdownOpen && (
      <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-lg shadow-xl z-[110] border border-gray-100 overflow-hidden">
        <div className="px-4 py-4 bg-gray-50 border-b border-gray-100">
          <p className="text-gray-800 font-bold truncate">
            {userData?.username || "Guest User"}
          </p>
          <p className="text-cyan-600 text-xs font-medium">Account ID: {userData?._id?.slice(-6)}</p>
        </div>
        
        <ul className="py-1">
          {profileMenuItems.map((item, idx) => (
            <li key={idx}>
              <button
                onClick={() => {
                  item.onClick?.();
                  setProfileDropdownOpen(false);
                }}
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
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.7)] z-[9999] xl:hidden"
          onClick={closeSidebar}
        />
      )}
    <div className={`fixed inset-0 z-[10000] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} xl:hidden`}>
  <div className="bg-[#98E1EE]/80 h-full w-4/5 max-w-xs overflow-y-auto border-r border-gray-800 flex flex-col">
    {/* Logo Section */}
    <div className="p-4 py-[30px] flex items-center justify-between">
      <div>
        <img className='w-[100px]' src={logo} alt="" />
      </div>
      <button
        onClick={closeSidebar}
        className="text-gray-600 hover:text-gray-900 text-[24px] cursor-pointer transition-colors"
      >
        <IoClose />
      </button>
    </div>

    {/* NEW: Casino and Sports/Slots Buttons */}
    <div className="flex gap-4 px-4 pb-4">
      <NavLink to="/casino-games" className="flex-1 py-2.5 px-4 text-center bg-white text-gray-700 font-semibold rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] hover:scale-105 transition-transform">
        Casino
      </NavLink>
      <NavLink to="/slot-games" className="flex-1 py-2.5 px-4 text-center bg-white text-gray-700 font-semibold rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] hover:scale-105 transition-transform">
        Slots
      </NavLink>
    </div>

    {/* Menu Items Section */}
    <div className="grid grid-cols-1 gap-5 py-4 pr-[15px]">
      {renderMenuItems()}
     
    </div>
     
      <div className='h-full flex w-full justify-center py-[40px] items-end'>
      <div className='w-full'>
      <div className="relative w-full border-t-[1px] border-b-[1px] border-gray-200 mt-2 py-[5px] mb-[20px]">
        <button
          onClick={toggleDropdown}
          className="flex items-center w-full p-3 cursor-pointer text-gray-800"
        >
          <img src={language.flag} alt={language.name} className="w-6 h-6 mr-2 rounded-full" />
          <span className="flex-1 text-left font-[500]">{language.name}</span>
          <MdArrowDropDown className={`text-lg transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>
        {showDropdown && (
          <div className="mt-2 w-full bg-white/80 backdrop-blur-md rounded-[6px] shadow-xl border border-white/20 z-50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  selectLanguage(lang);
                  closeSidebar();
                }}
                className="flex items-center w-full px-4 py-2 text-gray-800 hover:bg-white/50 transition-colors"
              >
                <img src={lang.flag} alt={lang.name} className="w-6 h-6 mr-2 rounded-full" />
                <span className="font-[500]">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Social Icons Section */}
      <div className="">
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
</div>
  {/* -----------------------------bottom-navbar------------------------------- */}
<div className='w-full  fixed bottom-0 left-1/2 -translate-x-1/2 z-50'>
  <nav className="w-full md:hidden">
    {/* Background changed to White with a soft shadow to match your top buttons */}
    <div className="relative w-full h-16 bg-gray-50 shadow-[0_-5px_15px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-sm">
      <div className="flex justify-around items-center h-full">
        {/* Replace Home with Search button */}
        <button
          onClick={() => setShowSearchPopup(true)}
          className="flex-1 flex flex-col items-center justify-center h-full relative transition-all duration-300 text-gray-500"
        >
          <div className="text-2xl">
            <FaSearch className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wide mt-1">
            Search
          </span>
        </button>
        
        {/* Rest of nav items (excluding home) */}
        {navItems.filter(item => item.id !== 'home').map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={handleNavItemClick(item)}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center h-full relative transition-all duration-300 ${
                isActive
                  ? 'text-[#EAB308]' // Vibrant Gold for active
                  : 'text-gray-500'   // Soft Gray for inactive
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isCenterItem(item) ? (
                  /* Center "Profile" Button - Enhanced Gradient */
                  <div className="absolute -top-6 w-14 h-14 rounded-full flex p-[2px] items-center justify-center transition-all duration-300 transform shadow-[0_4px_15px_rgba(0,0,0,0.2)] bg-white border-[1px] border-theme_color2">
                            <img src={item.icon} alt="" />
                  </div>
                ) : (
                  /* Regular Items */
                  <>
                    <div className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                    <img src={item.icon} alt="" />
                    </div>
                    
                    <span className={`text-[10px] font-bold uppercase tracking-wide mt-1 transition-colors duration-300`}>
                      {item.label}
                    </span>

                    {/* Active Glow/Indicator dot */}
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
      {/* -----------------bottom-navbar------------------------- */}
      {/* White Background Auth Modal with Mobile Number Field - FIXED INPUTS */}
{showAuthModal && (
        <div 
          className={`fixed inset-0 z-[10001] flex items-center  flex-col  justify-center backdrop-blur-md ${
            modalAnimation === 'slide-up' ? 'animate-fadeIn' : 
            modalAnimation === 'slide-down' ? 'animate-fadeOut' : ''
          }`}
          style={{
            background: 'radial-gradient(circle, #ffffff 0%, #c1e8ff 100%)',
          }}
          onClick={handleOutsideClick}
        >
          
            {/* Header Box */}
        <div className="bg-white shadow-[0px_0px_50px_15px_rgba(191,234,250,0.95)] rounded-2xl py-5 z-[100] px-4 w-[80%] md:w-[40%] xl:w-[25%] text-center mt-2 mb-8">
  <h2 className="text-[#62c4e0] text-2xl font-serif tracking-tight leading-7">
    {activeTab === 'login' ? (
      <>Welcome To Next<br/>Gen Gaming</>
    ) : (
      <>victory is just<br/>one step away</>
    )}
  </h2>
</div>

          {/* Background Watermark Icons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            <div className="absolute top-[-20px] left-[-20px] text-[15rem] rotate-12 text-blue-200/40">🎲</div>
            <div className="absolute bottom-10 right-[-40px] text-[20rem] -rotate-12 text-blue-200/30">♠️</div>
          </div>

          <div 
            ref={modalRef}
            className={`relative w-[80%] md:w-[380px] min-h-[680px] rounded-[50px] shadow-2xl overflow-hidden transform transition-all duration-300 flex flex-col items-center p-6 ${
              modalAnimation === 'slide-up' ? 'animate-scaleIn' : 'animate-scaleOut'
            }`}
            style={{
              background: '#cecece', // The exact grey background of the inner card
              border: '10px solid white', // The thick white frame
              boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Close Icon (Top Right) */}
            <button onClick={closeModal} className="absolute top-4 right-6 text-gray-500 hover:text-gray-800">
              <IoCloseOutline className="text-4xl" />
            </button>

            {/* User Avatar silhouette */}
            <div className="w-24 h-24 bg-[#bebebe] rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
               <div className="w-10 h-10 bg-[#acacac] rounded-full absolute top-3"></div>
               <div className="w-16 h-12 bg-[#acacac] rounded-t-full absolute bottom-1"></div>
            </div>

            {/* Form Container */}
            <div className="w-full px-6 space-y-7 flex-grow">
              {activeTab === 'login' ? (
                <div className="space-y-7">
                  <div className="relative border-b border-gray-500">
                    <MdEmail className="absolute left-0 bottom-2 text-gray-700 text-lg" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email ID" 
                      className="w-full bg-transparent pb-2 pl-10 focus:outline-none text-gray-700 placeholder:text-gray-600" 
                    />
                  </div>
                  
                  <div className="relative border-b border-gray-500">
                    <FaLock className="absolute left-0 bottom-2 text-gray-700 text-lg" />
                    <input 
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password" 
                      className="w-full bg-transparent pb-2 pl-10 focus:outline-none text-gray-700 placeholder:text-gray-600" 
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-0 bottom-2 text-gray-600"
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center text-[11px] text-gray-600 font-semibold px-1">
                    <label className="flex items-center cursor-pointer uppercase">
                      <input type="checkbox" className="mr-2 accent-gray-600" defaultChecked />
                      Remember me
                    </label>
                    <button onClick={() => setActiveTab('forgot-password')} className="italic capitalize">
                      Forgot Password?
                    </button>
                  </div>
                  
                  {/* Error display */}
                  {errors.formError && (
                    <div className="text-red-500 text-xs text-center">{errors.formError}</div>
                  )}
                  
                  {/* EXACT BUTTON DESIGN */}
                  <button
                    onClick={handleLogin}
                    disabled={isLoading.login}
                    className="w-full py-4 rounded-xl text-white font-bold tracking-[0.2em] text-lg transition-all active:scale-[0.97] disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(to right, #438fa3, #7d7d7d)', // The teal-to-grey gradient
                      boxShadow: 'inset 0px 2px 4px rgba(255,255,255,0.3), 0px 4px 10px rgba(0,0,0,0.2)',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  >
                    {isLoading.login ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        LOGGING IN...
                      </div>
                    ) : (
                      'LOGIN'
                    )}
                  </button>
                </div>
              ) : activeTab === 'register' ? (
                <div className="space-y-9">
                  {/* Registration Fields */}
                  <div className="relative border-b border-gray-500">
                    <MdEmail className="absolute left-0 bottom-1 text-gray-700"/>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address" 
                      className="w-full bg-transparent pb-1 pl-10 text-sm focus:outline-none placeholder:text-gray-600"
                    />
                  </div>
                  {errors.email && <div className="text-red-500 text-xs -mt-6">{errors.email}</div>}
                  
                  <div className="relative border-b border-gray-500">
                    <FaLock className="absolute left-0 bottom-1 text-gray-700"/>
                    <input 
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your login password" 
                      className="w-full bg-transparent pb-1 pl-10 text-sm focus:outline-none placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-0 bottom-1 text-gray-600"
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <div className="text-red-500 text-xs -mt-6">{errors.password}</div>}
                  
                  <div className="relative border-b border-gray-500">
                    <FaLock className="absolute left-0 bottom-1 text-gray-700"/>
                    <input 
                      type={confirmPasswordVisible ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Re-enter password" 
                      className="w-full bg-transparent pb-1 pl-10 text-sm focus:outline-none placeholder:text-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      className="absolute right-0 bottom-1 text-gray-600"
                    >
                      {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="text-red-500 text-xs -mt-6">{errors.confirmPassword}</div>}
                  
                  <div className="relative border-b border-gray-500">
                    <FaPhoneAlt className="absolute left-0 bottom-1 text-gray-700"/>
                    <input 
                      type="tel" 
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="Your mobile number" 
                      className="w-full bg-transparent pb-1 pl-10 text-sm focus:outline-none placeholder:text-gray-600"
                    />
                  </div>
                  {errors.mobile && <div className="text-red-500 text-xs -mt-6">{errors.mobile}</div>}
                  
                  {/* Custom Currency Selector */}
                  <div className="relative" ref={currencyDropdownRef}>
                    <div 
                      className="relative border-b border-gray-500 cursor-pointer"
                      onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                    >
                      <FaMoneyBillWave className="absolute left-0 bottom-1 text-gray-700" />
                      <div className="w-full bg-transparent pb-1 pl-10 text-sm text-gray-700 flex items-center justify-between">
                        <span>{getCurrentCurrencyDisplay()}</span>
                        <MdArrowDropDown className={`text-xl transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                    
                    {/* Currency Dropdown Menu */}
                    {isCurrencyDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {currencyOptions.map((currency) => (
                          <div
                            key={currency.value}
                            className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${
                              formData.currency === currency.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                            }`}
                            onClick={() => handleCurrencySelect(currency.value)}
                          >
                            <span className="text-lg">{currency.flag}</span>
                            <span className="text-sm">{currency.label}</span>
                            <span className="text-xs text-gray-500 ml-auto">{currency.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Error display */}
                  {errors.formError && (
                    <div className="text-red-500 text-xs text-center">{errors.formError}</div>
                  )}
                  
                  {/* EXACT BUTTON DESIGN FOR REGISTER */}
                  <button
                    onClick={handleRegister}
                    disabled={isLoading.register}
                    className="w-full py-4 rounded-xl text-white font-bold tracking-widest text-sm mt-4 transition-all active:scale-[0.97] disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(to right, #438fa3, #7d7d7d)',
                      boxShadow: 'inset 0px 2px 4px rgba(255,255,255,0.3), 0px 4px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    {isLoading.register ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        CREATING ACCOUNT...
                      </div>
                    ) : (
                      'CREATE AN ACCOUNT'
                    )}
                  </button>
                </div>
              ) : activeTab === 'forgot-password' ? (
                <div className="space-y-7">
                  <div className="relative border-b border-gray-500">
                    <MdEmail className="absolute left-0 bottom-2 text-gray-700 text-lg" />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email ID" 
                      className="w-full bg-transparent pb-2 pl-10 focus:outline-none text-gray-700 placeholder:text-gray-600" 
                    />
                  </div>
                  
                  {errors.formError && (
                    <div className="text-red-500 text-xs text-center">{errors.formError}</div>
                  )}
                  
                  <button
                    onClick={handleForgotPassword}
                    disabled={isLoading.forgotPassword}
                    className="w-full py-4 rounded-xl text-white font-bold tracking-[0.2em] text-lg transition-all active:scale-[0.97] disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(to right, #438fa3, #7d7d7d)',
                      boxShadow: 'inset 0px 2px 4px rgba(255,255,255,0.3), 0px 4px 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    {isLoading.forgotPassword ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        SENDING...
                      </div>
                    ) : (
                      'SEND OTP'
                    )}
                  </button>
                  
                  <div className="text-center">
                    <button
                      onClick={() => setActiveTab('login')}
                      className="text-[#ef8574] text-sm font-medium hover:underline"
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
              ) : activeTab === 'reset-password' ? (
                <div className="space-y-7">
                  <div className="relative border-b border-gray-500">
                    <FaLock className="absolute left-0 bottom-2 text-gray-700 text-lg" />
                    <input 
                      type={passwordVisible ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="New Password" 
                      className="w-full bg-transparent pb-2 pl-10 focus:outline-none text-gray-700 placeholder:text-gray-600" 
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-0 bottom-2 text-gray-600"
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  <div className="relative border-b border-gray-500">
                    <FaLock className="absolute left-0 bottom-2 text-gray-700 text-lg" />
                    <input 
                      type={confirmPasswordVisible ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm New Password" 
                      className="w-full bg-transparent pb-2 pl-10 focus:outline-none text-gray-700 placeholder:text-gray-600" 
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      className="absolute right-0 bottom-2 text-gray-600"
                    >
                      {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  {errors.password && <div className="text-red-500 text-xs">{errors.password}</div>}
                  {errors.confirmPassword && <div className="text-red-500 text-xs">{errors.confirmPassword}</div>}
                  {errors.formError && <div className="text-red-500 text-xs text-center">{errors.formError}</div>}
                  
                  <button
                    onClick={handleResetPassword}
                    disabled={isLoading.resetPassword}
                    className="w-full py-4 rounded-xl text-white font-bold tracking-[0.2em] text-lg transition-all active:scale-[0.97] disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(to right, #438fa3, #7d7d7d)',
                      boxShadow: 'inset 0px 2px 4px rgba(255,255,255,0.3), 0px 4px 10px rgba(0,0,0,0.2)'
                    }}
                  >
                    {isLoading.resetPassword ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                        RESETTING...
                      </div>
                    ) : (
                      'RESET PASSWORD'
                    )}
                  </button>
                </div>
              ) : null}
            </div>

            {/* Salmon-colored Footer Link */}
            <div className="mt-10 pb-4">
              <button
                onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
                className="text-[#ef8574] text-lg font-medium hover:underline tracking-tight"
              >
                {activeTab === 'login' ? 'Create an account' : activeTab === 'register' ? 'Login' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced OTP Modal with White Background */}
      {showOtpModal && (
        <div 
          className="fixed inset-0 z-[10002] flex items-center justify-center bg-[rgba(0,0,0,0.6)] p-4 backdrop-blur-sm animate-fadeIn"
          onClick={handleOtpOutsideClick}
        >
          <div 
            ref={modalRef}
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 animate-scaleIn"
          >
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-gray-800 text-xl font-bold">Verify OTP</h2>
              <button
                onClick={closeOtpModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <FaTimesCircle className="text-xl" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6 text-center text-sm">
                We've sent a verification code to: <span className="text-theme_color2 font-semibold">{otpEmail}</span>
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
                    className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ))}
              </div>
              <button
                onClick={handleVerifyOtp}
                className="w-full bg-theme_color2 cursor-pointer py-3 rounded-xl flex items-center justify-center text-white font-semibold text-base transition-all duration-200 active:scale-[0.98] disabled:opacity-50 mb-4 shadow-lg shadow-blue-500/20"
                disabled={isLoading.verifyOtp}
              >
                {isLoading.verifyOtp ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  'Verify OTP'
                )}
              </button>
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-gray-500 text-sm">
                    Resend OTP in <span className="text-theme_color2 font-semibold">{countdown}</span> seconds
                  </p>
                ) : (
                  <button
                    onClick={resendOtp}
                    className="text-theme_color2 hover:underline cursor-pointer text-sm transition-colors disabled:opacity-50"
                    disabled={isLoading.resendOtp}
                  >
                    {isLoading.resendOtp ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-theme_color2 border-t-transparent mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      'Resend OTP'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Popup */}
      <SearchPopup 
        isOpen={showSearchPopup} 
        onClose={() => setShowSearchPopup(false)} 
      />

      {/* Add these styles to your global CSS */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(100%);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes scaleOut {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(0.9);
            opacity: 0;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-in;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-fadeOut {
          animation: fadeOut 0.3s ease-in;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-scaleOut {
          animation: scaleOut 0.3s ease-in;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Header;
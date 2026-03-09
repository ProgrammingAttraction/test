<script src="//code.jivosite.com/widget/E6gwdQFDgI" async></script> 
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBars, FaFacebookF, FaGoogle, FaPhoneAlt, FaLock, FaUser, 
  FaTimes, FaArrowLeft, FaHome, FaGift, FaMoneyBillAlt, FaTrophy, 
  FaTelegram, FaHeadset, FaEye, FaEyeSlash, FaTimesCircle 
} from 'react-icons/fa';
import logo from "../../assets/logo.png"
import { MdArrowDropDown } from 'react-icons/md';
import {
  FaFire,
  FaUserFriends,
  FaGift as FaGift2,
  FaChartBar,
  FaMedal,
  FaFutbol,
  FaMoneyBillWave,
  FaHandHoldingHeart,
  FaGem,
  FaCrosshairs,
  FaBullseye,
  FaHandsHelping,
  FaFlag,
  FaGamepad,
  FaDownload,
  FaThLarge,
  FaHeadset as FaHeadset2,
  FaSignOutAlt,
  FaUserCog,
  FaHistory,
  FaWallet,
  FaCog,
  FaDice,
  FaCoins
} from 'react-icons/fa';
import { FaSyncAlt } from "react-icons/fa";
import { RiMenuFold2Line } from "react-icons/ri";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { IoClose } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
import man from "../../assets/profileimages/man.png"
import man1 from "../../assets/profileimages/man1.png"
import man2 from "../../assets/profileimages/man2.png"
import man3 from "../../assets/profileimages/man3.png"
import man4 from "../../assets/profileimages/man4.png"
import man5 from "../../assets/profileimages/man5.png"
import man6 from "../../assets/profileimages/man6.png"
// Import sidebar images
import popular_img from "../../assets/popular.png"
import dice_img from "../../assets/dice.png"
import user_img from "../../assets/user.png"
import bonus_img from "../../assets/bonus.png"
import affiliate_img from "../../assets/affiliate.png"
import question_img from "../../assets/question.png"
import teamwork_img from "../../assets/teamwork.png"
import party_img from "../../assets/party.png"
import link_img from "../../assets/link.png"
import support_img from "../../assets/support.png"

import { 
  FiHome, 
  FiSearch, 
  FiBookmark, 
  FiUser, 
  FiSettings 
} from 'react-icons/fi';
import { 
  FaSearch, 
  FaBookmark, 
} from 'react-icons/fa';
import { useUser } from '../../context/UserContext';

const Gameheader = ({setShowPopup, setActiveLeftTab, showPopup, activeLeftTab }) => {
    const { userData, loading, error, fetchUserData } = useUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [language, setLanguage] = useState({
        code: 'bn',
        name: 'বাংলা',
        flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/BD.svg'
    });
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
    const [otpRequested, setOtpRequested] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [referralCodeValid, setReferralCodeValid] = useState(false);
    const [referralCodeChecking, setReferralCodeChecking] = useState(false);
    const [referralCodeError, setReferralCodeError] = useState('');
    const [referrerInfo, setReferrerInfo] = useState(null);
    const otpInputRefs = useRef([]);

    // Initialize JivoChat when component mounts
    useEffect(() => {
        // Check if JivoChat is loaded
        const checkJivo = setInterval(() => {
            if (window.jivo_api) {
                clearInterval(checkJivo);
                // JivoChat is ready
            }
        }, 100);

        return () => clearInterval(checkJivo);
    }, []);

    const openSupportChat = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token');
        
        if (window.jivo_api) {
            // Open the chat widget
            window.jivo_api.open();
            
            // If user is logged in, send user info to support
            if (user && token) {
                const userInfo = {
                    name: user.username,
                    email: user.email,
                    phone: user.phone || 'Not provided',
                    userId: user._id,
                    balance: user.balance || 0
                };
                
                // Set visitor info in JivoChat
                window.jivo_api.setContactInfo({
                    name: userInfo.name,
                    email: userInfo.email,
                    phone: userInfo.phone,
                    description: `User ID: ${userInfo.userId}\nBalance: ${userInfo.balance}`
                });
                
                // Send initial message with user info
                window.jivo_api.sendMessage({
                    name: 'System',
                    text: `User connected:\nName: ${userInfo.name}\nEmail: ${userInfo.email}\nUser ID: ${userInfo.userId}`
                });
            } else {
                // For guest users
                window.jivo_api.sendMessage({
                    name: 'System',
                    text: 'Guest user connected'
                });
            }
        } else {
            toast.error('Support chat is loading, please try again in a moment');
        }
    };

    // Check for referral code in URL on component mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const referralCode = params.get('refer_code');
        
        if (referralCode) {
            setShowAuthModal(true);
            setActiveTab('register');
            setFormData(prev => ({
                ...prev,
                referralCode: referralCode
            }));
            checkReferralCode(referralCode);
        }
    }, [location]);

    const languages = [
        { code: 'bn', name: 'বাংলা', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/BD.svg' },
        { code: 'en', name: 'English', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/US.svg' }
    ];

    const navItems = [
        { 
            id: 'home', 
            label: 'হোম', 
            path: '/',
            icon: <FiHome className="w-5 h-5" />, 
            activeIcon: <FaHome className="w-5 h-5" />,
            requiresAuth: false
        },
        { 
            id: 'slots', 
            label: 'স্লটস', 
            path: '/slots',
            icon: <FaDice className="w-5 h-5" />, 
            activeIcon: <FaDice className="w-5 h-5 text-yellow-400" />,
            requiresAuth: true
        },
        { 
            id: 'casino', 
            label: 'ক্যাসিনো', 
            path: '/casino',
            icon: <FaCoins className="w-5 h-5" />, 
            activeIcon: <FaCoins className="w-5 h-5 text-yellow-400" />,
            requiresAuth: true
        },
        { 
            id: 'refer', 
            label: 'রেফার', 
            path: '/refer-programme',
            icon: <FaUserFriends className="w-5 h-5" />, 
            activeIcon: <FaUserFriends className="w-5 h-5 text-blue-400" />,
            requiresAuth: true
        },
        { 
            id: 'profile', 
            label: 'প্রোফাইল', 
            path: '/profile',
            icon: <FiUser className="w-5 h-5" />, 
            activeIcon: <FaUser className="w-5 h-5 text-blue-400" />,
            requiresAuth: true
        },
    ];

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
    const selectLanguage = (lang) => {
        setLanguage(lang);
        setShowDropdown(false);
    };

    const openAuthModal = (tab) => {
        setShowAuthModal(true);
        setActiveTab(tab);
        setFormData({ email: '', password: '', confirmPassword: '', referralCode: '' });
        setErrors({ password: '', confirmPassword: '', email: '', formError: '' });
        setReferralCodeValid(false);
        setReferralCodeError('');
        setReferrerInfo(null);
    };

    const closeModal = () => {
        setShowAuthModal(false);
        setShowOtpModal(false);
        setErrors({
            password: '',
            confirmPassword: '',
            email: '',
            formError: ''
        });
        setReferralCodeValid(false);
        setReferralCodeError('');
        setReferrerInfo(null);
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
                setReferralCodeError('অবৈধ রেফারেল কোড');
                setReferrerInfo(null);
            }
        } catch (error) {
            setReferralCodeValid(false);
            setReferralCodeError('রেফারেল কোড চেক করতে সমস্যা হয়েছে');
            setReferrerInfo(null);
        } finally {
            setReferralCodeChecking(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        if (errors[name] || errors.formError) {
            setErrors({
                ...errors,
                [name]: '',
                formError: ''
            });
        }

        if (name === 'referralCode') {
            checkReferralCode(value);
        }
    };

    const handleOtpChange = (index, value) => {
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
            formError: ''
        };

        if (!formData.email) {
            newErrors.email = 'ইমেইল প্রয়োজন';
            valid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'সঠিক ইমেইল দিন';
            valid = false;
        }

        if ((activeTab === 'login' || activeTab === 'register' || activeTab === 'reset-password') && !formData.password) {
            newErrors.password = 'পাসওয়ার্ড প্রয়োজন';
            valid = false;
        } else if ((activeTab === 'login' || activeTab === 'register' || activeTab === 'reset-password') && formData.password.length < 6) {
            newErrors.password = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে';
            valid = false;
        }

        if (activeTab === 'register' || activeTab === 'reset-password') {
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'পাসওয়ার্ড মিলছে না';
                valid = false;
            }
        }

        // Additional validation for referral code if provided
        if (activeTab === 'register' && formData.referralCode && !referralCodeValid) {
            newErrors.formError = 'অবৈধ রেফারেল কোড';
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
            
            setIsAuthenticated(true);
            setUserData(user);
            closeModal();
            toast.success('সফলভাবে লগইন করা হয়েছে!');
            navigate("/");
            window.location.reload();
        } catch (error) {
            setErrors({
                ...errors,
                formError: error.response?.data?.message || 'লগইন করতে সমস্যা হয়েছে'
            });
        }
    };

    const handleRegister = async () => {
        if (!validateForm()) return;
        if (formData.referralCode && !referralCodeValid) {
            setErrors({
                ...errors,
                formError: 'অবৈধ রেফারেল কোড'
            });
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
            
            setIsAuthenticated(true);
            setUserData(user);
            closeModal();
            toast.success('সফলভাবে নিবন্ধন করা হয়েছে!');
            navigate("/");
            window.location.reload();
        } catch (error) {
            setErrors({
                ...errors,
                formError: error.response?.data?.message || 'নিবন্ধন করতে সমস্যা হয়েছে'
            });
        }
    };

    const handleForgotPassword = async () => {
        if (!validateForm()) return;

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/request-password-reset`, {
                email: formData.email
            });

            setOtpEmail(formData.email);
            setShowOtpModal(true);
            setOtpRequested(true);
            setCountdown(60);
            toast.success('OTP ইমেইলে পাঠানো হয়েছে');
        } catch (error) {
            setErrors({
                ...errors,
                formError: error.response?.data?.message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে'
            });
        }
    };

    const handleVerifyOtp = async () => {
        const otpCode = otp.join('');
        
        if (otpCode.length !== 6) {
            toast.error('সম্পূর্ণ OTP দিন');
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
            toast.success('OTP সফলভাবে যাচাই করা হয়েছে');
        } catch (error) {
            toast.error(error.response?.data?.message || 'OTP যাচাই করতে সমস্যা হয়েছে');
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
            closeModal();
            toast.success('পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে');
            
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
                formError: error.response?.data?.message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে'
            });
        }
    };

    const resendOtp = async () => {
        if (countdown > 0) return;

        try {
            await axios.post(`${API_BASE_URL}/auth/request-password-reset`, {
                email: otpEmail
            });

            setCountdown(60);
            toast.success('নতুন OTP ইমেইলে পাঠানো হয়েছে');
        } catch (error) {
            toast.error(error.response?.data?.message || 'OTP পুনরায় পাঠাতে সমস্যা হয়েছে');
        }
    };

const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserData(null);
    setProfileDropdownOpen(false);
    toast.success('সফলভাবে লগআউট করা হয়েছে');
    navigate("/");
    window.location.reload(); // This will reload the page after navigation
};

    const handleDepositClick = () => {
        setActiveLeftTab('ডিপোজিট');
        setShowPopup(true);
    };

    const handleWithdrawClick = () => {
        setActiveLeftTab('উত্তোলন');
        setShowPopup(true);
    };

    const handleProfileClick = () => {
        setActiveLeftTab('আমার অ্যাকাউন্ট');
        setShowPopup(true);
    };

    const handleTransactionClick = () => {
        setActiveLeftTab('অ্যাকাউন্ট রেকর্ড');
        setShowPopup(true);
    };

    const handleWalletClick = () => {
        setActiveLeftTab('আমার অ্যাকাউন্ট');
        setShowPopup(true);
    };

const menuItems = [
  { 
    icon: popular_img, 
    label: 'ক্যাসিনো',
    path: '/hot-games' 
  },
  { 
    icon: dice_img, 
    label: 'জনপ্রিয়',
    path: '/hot-games' 
  },
  { 
    icon: user_img, 
    label: 'আমার একাউন্ট',
    path: '/profile' 
  },
//   { 
//     icon: bonus_img, 
//     label: 'বোনাস',
//     leftTab: 'পুরস্কার কেন্দ্র'
//   },
  { 
    icon: teamwork_img, 
    label: 'প্রভাইডার',
    path: '/provider' 
  },
  { 
    icon: affiliate_img, 
    label: 'এফিলিয়েট',
    path: '/affiliate-programme' 
  },
  { 
    icon: party_img, 
    label: 'ভিআইপি ক্লাব',
    path: '/vip-club' 
  },
  { 
    icon: link_img, 
    label: 'রেফারেল প্রোগ্রাম',
   path: '/vip-club' 
  },
     { 
    icon: support_img,
    label: 'যোগাযোগ',
    path: '/contact' 
  },
  { 
    icon: question_img,
    label: 'FAQ/নীতি',
    path: '/faq-policy' 
  },
];

    const profileMenuItems = [
        { 
            icon: <FaUser className="text-blue-400" />, 
            label: 'প্রোফাইল', 
            path: '/profile', 
            onClick: () => {
                setActiveLeftTab('আমার অ্যাকাউন্ট');
                setShowPopup(true);
                setProfileDropdownOpen(false);
            }
        },
        // { 
        //     icon: <FaWallet className="text-blue-400" />, 
        //     label: 'ওয়ালেট', 
        //     path: '/wallet', 
        //     onClick: () => {
        //         setActiveLeftTab('আমার অ্যাকাউন্ট');
        //         setShowPopup(true);
        //         setProfileDropdownOpen(false);
        //     }
        // },
        { 
            icon: <FaHistory className="text-blue-400" />, 
            label: 'লেনদেনের ইতিহাস', 
            path: '/transactions', 
            onClick: () => {
                setActiveLeftTab('অ্যাকাউন্ট রেকর্ড');
                setShowPopup(true);
                setProfileDropdownOpen(false);
            }
        },
        { icon: <FaSignOutAlt className="text-red-400" />, label: 'লগ আউট', path: '/logout', onClick: handleLogout }
    ];

    const handleNavItemClick = (item) => (e) => {
        if (item.requiresAuth && !isAuthenticated) {
            e.preventDefault();
            openAuthModal('register');
        }
    };
// --------random-porilfe-image-----------------
// Create an array of all profile images
const profileImages = [man, man1, man2, man3, man4, man5, man6];

// Function to get a consistent random image based on username
const getProfileImage = (username) => {
  if (!username) return man; // default image if no username
  
  // Create a simple hash from the username to get a consistent index
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use absolute value and modulo to get a valid index
  const index = Math.abs(hash) % profileImages.length;
  return profileImages[index];
};

    return (
        <>
            <header className="bg-gray-900 sticky top-0  left-0 px-3 md:px-8 py-2 md:py-3 z-[10000] flex items-center justify-between shadow-lg border-b border-gray-700">
                <div className="flex items-center md:space-x-2">
                    <button onClick={toggleSidebar} className="text-gray-300 cursor-pointer hover:text-blue-400 transition-colors text-[26px] md:text-[27px]">
                        <RiMenuFold2Line />
                    </button>
                    <NavLink to="/">
                        <img className='w-[100px] md:w-[150px]' src={logo} alt="" />
                    </NavLink>
                </div>
                <Toaster toastOptions={{
                    style: {
                        background: '#1f2937',
                        color: '#fff',
                        border: '1px solid #374151'
                    }
                }} />
                <div className="flex items-center md:space-x-4">
                    <div className="flex items-center  md:space-x-4">
                        {!isAuthenticated ? (
                            <>
                                <button 
                                    onClick={() => openAuthModal('login')}
                                    className="bg-theme_color2 px-[20px] py-2 cursor-pointer rounded-[5px] text-gray-800"
                                >
                                    লগইন
                                </button>
                                <button 
                                    onClick={() => openAuthModal('register')}
                                    className="md:block hidden bg-[#3867d6] cursor-pointer px-[20px] py-2 rounded-[5px] text-white"
                                >
                                    নিবন্ধন
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="relative">
                                    <button 
                                        onClick={toggleProfileDropdown}
                                        className="px-[15px] py-[8px] md:flex hidden cursor-pointer border-[1px] border-gray-700 rounded-[5px]  justify-center items-center gap-2"
                                    >
                                        <img
                                     src={getProfileImage(userData?.username)}
                                            alt="Profile"
                                            className="w-5 h-5 md:w-7 md:h-7 rounded-full border-2 border-blue-500"
                                        />
                                        
                                        <span className="text-white font-medium">{userData?.username || 'User'}</span>
                                        <MdArrowDropDown className={`text-base md:text-lg ml-1 text-gray-300 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {profileDropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-700 transform perspective-1000 origin-top">
                                            <div className="relative bg-gray-800 rounded-lg overflow-hidden transform-style-preserve-3d transition-all duration-300 group-hover:rotate-x-10">
                                                <div className="px-4 py-3 bg-gray-900 border-b border-gray-700 flex items-center">
                                                    <img
                                                         src={getProfileImage(userData?.username)}
                                                        alt="Profile"
                                                        className="w-10 h-10 rounded-full border-2 border-blue-500 mr-3"
                                                    />
                                                    <div>
                                                        <p className="text-white font-medium">{userData?.username || 'User'}</p>
                                                        <p className="text-blue-400 text-sm">৳ {userData?.balance?.toFixed(2) || '0.00'}</p>
                                                    </div>
                                                </div>
                                                
                                                <ul className="py-1">
                                                    {profileMenuItems.map((item, index) => (
                                                        <li key={index}>
                                                            <a
                                                                href={item.path}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (item.onClick) {
                                                                        item.onClick();
                                                                    }
                                                                    setProfileDropdownOpen(false);
                                                                }}
                                                                className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 transition-colors duration-200"
                                                            >
                                                                <span className="mr-3 text-lg">{item.icon}</span>
                                                                <span>{item.label}</span>
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                                
                                                <div className="px-4 py-2 bg-gray-900 border-t border-gray-700 text-center">
                                                    <button className="text-xs text-blue-400 hover:underline">
                                                        অ্যাকাউন্ট সুরক্ষিত করুন
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center bg-gray-800 cursor-pointer px-[15px] py-[7px] md:py-[10px] border-[1px] border-gray-700 rounded-[5px] ">
                                    <FaMoneyBillWave className="text-yellow-400 md:flex hidden mr-1 text-xs md:text-sm" />
                                    <span className="text-white text-xs md:text-sm font-semibold">৳ {userData?.balance?.toFixed(2) || '0.00'}</span>
                                    <FaSyncAlt className="text-gray-400 ml-1 md:ml-2 text-xs md:text-sm cursor-pointer hover:text-blue-400 transition-colors" />
                                </div>

                            </>
                        )}
                    </div>
                </div>
            </header>

            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-[rgba(0,0,0,0.7)] z-[9999] md:hidden" 
                    onClick={closeSidebar}
                />
            )}
            <div className={`fixed inset-0 z-[10000] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
                <div className="bg-gray-900 h-full w-4/5 max-w-xs overflow-y-auto border-r border-gray-800">
                    <div className="p-4 flex items-center justify-between border-b border-gray-800">
                      <div>
                        <img className='w-[100px]' src={logo} alt="" />
                      </div>
                        <button 
                            onClick={closeSidebar}
                            className="text-gray-400 hover:text-white text-[22px] cursor-pointer transition-colors"
                        >
                            <IoClose />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 p-4">
                        {menuItems.map((item, index) => (
                          <NavLink 
                          to={item.path}
                          onClick={toggleSidebar}
      className="flex items-center gap-4 p-3 bg-gray-800 hover:bg-gray-700 rounded-[6px] border-[1px] border-gray-700 cursor-pointer transition-colors"
    >
      <img src={item.icon} alt={item.label} className="w-6 h-6" />
      <span className="text-white font-[500] ">{item.label}</span>
    </NavLink>
                        ))}
                    </div>
                </div>
            </div>
            {showAuthModal && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-[rgba(0,0,0,0.8)] p-4">
                    <div className="bg-gray-800 w-full max-w-lg rounded-[5px] shadow-2xl overflow-hidden border border-gray-700">
                        <div className="bg- px-6 py-4 flex justify-between items-center">
                            <h2 className="text-white text-xl font-bold">
                                {activeTab === 'login' && 'লগইন করুন'}
                                {activeTab === 'register' && 'নিবন্ধন করুন'}
                                                        {activeTab === 'forgot-password' && 'পাসওয়ার্ড রিসেট করুন'}
                                {activeTab === 'reset-password' && 'নতুন পাসওয়ার্ড সেট করুন'}
                            </h2>
                            <button 
                                onClick={closeModal}
                                className="text-white hover:text-gray-300 transition-colors"
                            >
                                <FaTimesCircle className="text-xl" />
                            </button>
                        </div>

                        <div className="flex border-b border-gray-700">
                            {['login', 'register'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3 text-sm md:text-base font-medium cursor-pointer ${
                                        activeTab === tab ? 'text-theme_color2 border-b-2 border-theme_color2' : 'text-gray-400'
                                    }`}
                                >
                                    {tab === 'login' ? 'লগইন' : 'নিবন্ধন'}
                                </button>
                            ))}
                        </div>

                        <div className="p-6">
                            {errors.formError && (
                                <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300 text-sm">
                                    {errors.formError}
                                </div>
                            )}

                            {activeTab === 'login' && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <MdEmail className="absolute left-3 top-3 text-theme_color2 text-sm md:text-base" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="ইমেইল"
                                            className={`w-full bg-gray-700 text-white border ${errors.email ? 'border-red-500' : 'border-gray-600'} py-2 pl-10 pr-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base placeholder-gray-400`}
                                        />
                                        {errors.email && (
                                            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-3 text-theme_color2 text-sm md:text-base" />
                                        <input
                                            type={passwordVisible ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="পাসওয়ার্ড"
                                            className={`w-full bg-gray-700 text-white border ${errors.password ? 'border-red-500' : 'border-gray-600'} py-2 pl-10 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base placeholder-gray-400`}
                                        />
                                        <button
                                            onClick={() => setPasswordVisible(!passwordVisible)}
                                            className="absolute right-3 top-3 text-theme_color2 cursor-pointer"
                                        >
                                            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.password && (
                                            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center text-sm text-theme_color2">
                                        <div className="flex items-center">
                                            <input type="checkbox" id="remember" className="mr-2 accent-blue-500" />
                                            <label htmlFor="remember">মনে রাখুন</label>
                                        </div>
                                        <button 
                                            onClick={() => setActiveTab('forgot-password')}
                                            className="text-theme_color2 hover:underline cursor-pointer"
                                        >
                                            পাসওয়ার্ড ভুলে গেছেন?
                                        </button>
                                    </div>

                                    <button 
                                        onClick={handleLogin}
                                        className="w-full bg-theme_color2 hover:bg-theme_color2/90 cursor-pointer px-[20px] py-[10px] rounded-[5px] "
                                    >
                                        লগইন করুন
                                    </button>
                                </div>
                            )}

                            {activeTab === 'register' && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <MdEmail className="absolute left-3 top-3 text-theme_color2 text-sm md:text-base" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="ইমেইল"
                                            className={`w-full bg-gray-700 text-white border ${errors.email ? 'border-red-500' : 'border-gray-600'} py-2 pl-10 pr-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base placeholder-gray-400`}
                                        />
                                        {errors.email && (
                                            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-3 text-theme_color2 text-sm md:text-base" />
                                        <input
                                            type={passwordVisible ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="পাসওয়ার্ড"
                                            className={`w-full bg-gray-700 text-white border ${errors.password ? 'border-red-500' : 'border-gray-600'} py-2 pl-10 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base placeholder-gray-400`}
                                        />
                                        <button
                                            onClick={() => setPasswordVisible(!passwordVisible)}
                                            className="absolute right-3 top-3 text-theme_color2 cursor-pointer"
                                        >
                                            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.password && (
                                            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-3 text-theme_color2 text-sm md:text-base" />
                                        <input
                                            type={confirmPasswordVisible ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                                            className={`w-full bg-gray-700 text-white border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'} py-2 pl-10 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base placeholder-gray-400`}
                                        />
                                        <button
                                            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                            className="absolute right-3 top-3 text-theme_color2 cursor-pointer"
                                        >
                                            {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.confirmPassword && (
                                            <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <FaUserFriends className="absolute left-3 top-3 text-theme_color2 text-sm md:text-base" />
                                        <input
                                            type="text"
                                            name="referralCode"
                                            value={formData.referralCode}
                                            onChange={handleInputChange}
                                            placeholder="রেফারেল কোড (ঐচ্ছিক)"
                                            className="w-full bg-gray-700 text-white border border-gray-600 py-2 pl-10 pr-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base placeholder-gray-400"
                                        />
                                        {referralCodeChecking && (
                                            <div className="absolute right-3 top-3">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-theme_color2"></div>
                                            </div>
                                        )}
                                        {referralCodeError && !referralCodeChecking && (
                                            <p className="text-red-400 text-xs mt-1">{referralCodeError}</p>
                                        )}
                                        {referrerInfo && !referralCodeChecking && (
                                            <p className="text-green-400 text-xs mt-1">
                                                রেফারার: {referrerInfo.username}
                                            </p>
                                        )}
                                    </div>

                                    <button 
                                        onClick={handleRegister}
                                        disabled={formData.referralCode && !referralCodeValid}
                                        className={`w-full bg-theme_color2 hover:bg-theme_color2/90 cursor-pointer px-[20px] py-[10px] rounded-[5px] ${
                                            formData.referralCode && !referralCodeValid ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                    >
                                        নিবন্ধন করুন
                                    </button>

                                    <div className="text-center text-sm text-gray-400">
                                        নিবন্ধন করে, আপনি আমাদের <a href="#" className="text-theme_color2 hover:underline">শর্তাবলী</a> এবং <a href="#" className="text-theme_color2 hover:underline">গোপনীয়তা নীতি</a> স্বীকার করেছেন
                                    </div>
                                </div>
                            )}

                            {activeTab === 'forgot-password' && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <MdEmail className="absolute left-3 top-3 text-theme_color2 text-sm md:text-base" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="আপনার ইমেইল ঠিকানা"
                                            className={`w-full bg-gray-700 text-white border ${errors.email ? 'border-red-500' : 'border-gray-600'} py-2 pl-10 pr-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base placeholder-gray-400`}
                                        />
                                        {errors.email && (
                                            <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                                        )}
                                    </div>

                                    <button 
                                        onClick={handleForgotPassword}
                                        className="w-full bg-theme_color2 hover:bg-theme_color2/90 cursor-pointer px-[20px] py-[10px] rounded-[5px] "
                                    >
                                        পাসওয়ার্ড রিসেট করুন
                                    </button>

                                    <button 
                                        onClick={() => setActiveTab('login')}
                                        className="flex items-center justify-center w-full text-theme_color2 hover:underline cursor-pointer text-sm"
                                    >
                                        <FaArrowLeft className="mr-1" /> লগইন পৃষ্ঠায় ফিরে যান
                                    </button>
                                </div>
                            )}

                            {activeTab === 'reset-password' && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-3 text-theme_color2 text-sm md:text-base" />
                                        <input
                                            type={passwordVisible ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="নতুন পাসওয়ার্ড"
                                            className={`w-full bg-gray-700 text-white border ${errors.password ? 'border-red-500' : 'border-gray-600'} py-2 pl-10 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base placeholder-gray-400`}
                                        />
                                        <button
                                            onClick={() => setPasswordVisible(!passwordVisible)}
                                            className="absolute right-3 top-3 text-theme_color2 cursor-pointer"
                                        >
                                            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.password && (
                                            <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="relative">
                                        <FaLock className="absolute left-3 top-3 text-theme_color2 text-sm md:text-base" />
                                        <input
                                            type={confirmPasswordVisible ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                                            className={`w-full bg-gray-700 text-white border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'} py-2 pl-10 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base placeholder-gray-400`}
                                        />
                                        <button
                                            onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                            className="absolute right-3 top-3 text-theme_color2 cursor-pointer"
                                        >
                                            {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                        {errors.confirmPassword && (
                                            <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                                        )}
                                    </div>

                                    <button 
                                        onClick={handleResetPassword}
                                        className="w-full bg-theme_color2 hover:bg-theme_color2/90 cursor-pointer px-[20px] py-[10px] rounded-[5px] "
                                    >
                                        পাসওয়ার্ড পরিবর্তন করুন
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-700">
                            <div className="text-center text-sm text-gray-400">
                                {activeTab === 'login' ? (
                                    <>
                                        অ্যাকাউন্ট নেই?{' '}
                                        <button 
                                            onClick={() => setActiveTab('register')}
                                            className="text-theme_color2 hover:underline cursor-pointer"
                                        >
                                            নিবন্ধন করুন
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                                        <button 
                                            onClick={() => setActiveTab('login')}
                                            className="text-theme_color2 hover:underline cursor-pointer"
                                        >
                                            লগইন করুন
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showOtpModal && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-[rgba(0,0,0,0.6)] p-4 backdrop-blur-lg">
                    <div className="bg-gray-800 w-full max-w-lg rounded-[5px] shadow-2xl overflow-hidden border border-gray-700">
                        <div className="px-6 py-4 flex justify-between items-center">
                            <h2 className="text-white text-xl font-bold">OTP যাচাই করুন</h2>
                            <button 
                                onClick={() => {
                                    setShowOtpModal(false);
                                    setOtp(['', '', '', '', '', '']);
                                }}
                                className="text-white hover:text-gray-300 transition-colors"
                            >
                                <FaTimesCircle className="text-xl" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-300 mb-6 text-center">
                                ৬-অংকের OTP কোডটি ইমেইলে পাঠানো হয়েছে: {otpEmail}
                            </p>

                            <div className="flex justify-center space-x-3 mb-6">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (otpInputRefs.current[index] = el)}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                        className="w-12 h-12 bg-gray-700 border border-gray-600 rounded-md text-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                ))}
                            </div>

                            <button 
                                onClick={handleVerifyOtp}
                                className="w-full bg-theme_color2 hover:bg-theme_color2/90 cursor-pointer px-[20px] py-[10px] rounded-[5px] mb-4"
                            >
                                যাচাই করুন
                            </button>

                            <div className="text-center">
                                {countdown > 0 ? (
                                    <p className="text-gray-400 text-sm">
                                        {countdown} সেকেন্ড পর নতুন OTP পাঠানো যাবে
                                    </p>
                                ) : (
                                    <button 
                                        onClick={resendOtp}
                                        className="text-theme_color2 hover:underline cursor-pointer text-sm"
                                    >
                                        OTP পুনরায় পাঠান
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

export default Gameheader;
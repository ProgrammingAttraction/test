import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast,{Toaster} from 'react-hot-toast';
import { 
  FaTimesCircle, 
  FaEye, 
  FaEyeSlash, 
  FaLock, 
  FaUserFriends, 
  FaArrowLeft 
} from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';

const AuthModal = ({ showAuthModal, closeAuthModal, activeTab, setActiveTab }) => {
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
  const [otpRequested, setOtpRequested] = useState(false);
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
      
      closeAuthModal();
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
      
      closeAuthModal();
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
      closeAuthModal();
      toast.success('পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে');
      
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

  return (
    <>
    <Toaster/>
      {showAuthModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-[rgba(0,0,0,0.8)] p-4">
          <div className="bg-gray-800 w-full max-w-lg rounded-[5px] shadow-2xl overflow-hidden border border-gray-700">
            <div className="px-6 py-4 flex justify-between items-center">
              <h2 className="text-white text-xl font-bold">
                {activeTab === 'login' && 'লগইন করুন'}
                {activeTab === 'register' && 'নিবন্ধন করুন'}
                {activeTab === 'forgot-password' && 'পাসওয়ার্ড রিসেট করুন'}
                {activeTab === 'reset-password' && 'নতুন পাসওয়ার্ড সেট করুন'}
              </h2>
              <button 
                onClick={closeAuthModal}
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
                    activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400'
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
                    <MdEmail className="absolute left-3 top-3 text-cyan-400 text-sm md:text-base" />
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
                    <FaLock className="absolute left-3 top-3 text-cyan-400 text-sm md:text-base" />
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
                      className="absolute right-3 top-3 text-cyan-400 cursor-pointer"
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-sm text-cyan-400">
                    <div className="flex items-center">
                      <input type="checkbox" id="remember" className="mr-2 accent-blue-500" />
                      <label htmlFor="remember">মনে রাখুন</label>
                    </div>
                    <button 
                      onClick={() => setActiveTab('forgot-password')}
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  </div>

                  <button 
                    onClick={handleLogin}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 px-[20px] py-[10px] rounded-[5px] "
                  >
                    লগইন করুন
                  </button>
                </div>
              )}

              {activeTab === 'register' && (
                <div className="space-y-4">
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-3 text-cyan-400 text-sm md:text-base" />
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
                    <FaLock className="absolute left-3 top-3 text-cyan-400 text-sm md:text-base" />
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
                      className="absolute right-3 top-3 text-cyan-400 cursor-pointer"
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-cyan-400 text-sm md:text-base" />
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
                      className="absolute right-3 top-3 text-cyan-400 cursor-pointer"
                    >
                      {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="relative">
                    <FaUserFriends className="absolute left-3 top-3 text-cyan-400 text-sm md:text-base" />
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
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
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
                    className={`w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 px-[20px] py-[10px] rounded-[5px] ${
                      formData.referralCode && !referralCodeValid ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    নিবন্ধন করুন
                  </button>

                  <div className="text-center text-sm text-gray-400">
                    নিবন্ধন করে, আপনি আমাদের <a href="#" className="text-cyan-400 hover:underline">শর্তাবলী</a> এবং <a href="#" className="text-cyan-400 hover:underline">গোপনীয়তা নীতি</a> স্বীকার করেছেন
                  </div>
                </div>
              )}

              {activeTab === 'forgot-password' && (
                <div className="space-y-4">
                  <div className="relative">
                    <MdEmail className="absolute left-3 top-3 text-cyan-400 text-sm md:text-base" />
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
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 px-[20px] py-[10px] rounded-[5px] "
                  >
                    পাসওয়ার্ড রিসেট করুন
                  </button>

                  <button 
                    onClick={() => setActiveTab('login')}
                    className="flex items-center justify-center w-full text-cyan-400 hover:underline cursor-pointer text-sm"
                  >
                    <FaArrowLeft className="mr-1" /> লগইন পৃষ্ঠায় ফিরে যান
                  </button>
                </div>
              )}

              {activeTab === 'reset-password' && (
                <div className="space-y-4">
                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-cyan-400 text-sm md:text-base" />
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
                      className="absolute right-3 top-3 text-cyan-400 cursor-pointer"
                    >
                      {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div className="relative">
                    <FaLock className="absolute left-3 top-3 text-cyan-400 text-sm md:text-base" />
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
                      className="absolute right-3 top-3 text-cyan-400 cursor-pointer"
                    >
                      {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>

                  <button 
                    onClick={handleResetPassword}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 px-[20px] py-[10px] rounded-[5px] "
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
                      className="text-cyan-400 hover:underline cursor-pointer"
                    >
                      নিবন্ধন করুন
                    </button>
                  </>
                ) : (
                  <>
                    ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                    <button 
                      onClick={() => setActiveTab('login')}
                      className="text-cyan-400 hover:underline cursor-pointer"
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
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 px-[20px] py-[10px] rounded-[5px] mb-4"
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
                    className="text-cyan-400 hover:underline cursor-pointer text-sm"
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

export default AuthModal;
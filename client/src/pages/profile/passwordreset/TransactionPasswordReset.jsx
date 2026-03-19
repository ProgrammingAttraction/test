import React, { useState, useContext, useEffect } from 'react';
import { FaCoins, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import axios from 'axios';
import { LanguageContext } from '../../../context/LanguageContext';

const TransactionPasswordReset = () => {
  const { t } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const navigate = useNavigate();
  
  const [showTransactionPassword, setShowTransactionPassword] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newTransactionPassword, setNewTransactionPassword] = useState('');
  const [confirmTransactionPassword, setConfirmTransactionPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Reset feedback when step changes
  useEffect(() => {
    setFeedback({ type: '', message: '' });
  }, [resetStep]);

  // Handle sending OTP for transaction password reset
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSendingOtp(true);
    setFeedback({ type: '', message: '' });
    
    try {
      const response = await axios.post(`${base_url}/user/send-transaction-password-otp`, {
        email: otpEmail
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFeedback({
        type: 'success',
        message: response.data.message || t.otpSentSuccess || 'OTP sent successfully to your email'
      });
      
      // Move to OTP verification step
      setResetStep(2);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || t.otpSendError || 'Failed to send OTP'
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle verifying OTP for transaction password reset
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    setFeedback({ type: '', message: '' });
    
    try {
      const response = await axios.post(`${base_url}/user/verify-transaction-password-otp`, {
        email: otpEmail,
        otp
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFeedback({
        type: 'success',
        message: response.data.message || t.otpVerifySuccess || 'OTP verified successfully'
      });
      
      setOtpToken(response.data.token);
      // Move to new password step
      setResetStep(3);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || t.otpVerifyError || 'Invalid OTP'
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle resetting transaction password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsResetting(true);
    setFeedback({ type: '', message: '' });

    // Validation
    if (newTransactionPassword.length < 6) {
      setFeedback({
        type: 'error',
        message: t.transactionPasswordLengthError || 'Transaction password must be at least 6 characters'
      });
      setIsResetting(false);
      return;
    }

    if (newTransactionPassword !== confirmTransactionPassword) {
      setFeedback({
        type: 'error',
        message: t.transactionPasswordMismatch || 'Passwords do not match'
      });
      setIsResetting(false);
      return;
    }

    try {
      const response = await axios.post(`${base_url}/user/reset-transaction-password`, {
        token: otpToken,
        newPassword: newTransactionPassword,
        confirmPassword: confirmTransactionPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFeedback({
        type: 'success',
        message: response.data.message || t.transactionPasswordResetSuccess || 'Transaction password reset successfully'
      });

      // Reset form after success
      setTimeout(() => {
        // Reset all states
        setResetStep(1);
        setOtpEmail('');
        setOtp('');
        setNewTransactionPassword('');
        setConfirmTransactionPassword('');
        setOtpToken('');
        
        // Refresh user data
        fetchUserData();
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          navigate(-1);
        }, 2000);
      }, 1500);

    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || t.transactionPasswordResetError || 'Failed to reset password'
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Handle cancel and go back
  const handleCancel = () => {
    if (resetStep === 1) {
      navigate(-1);
    } else {
      setResetStep(resetStep - 1);
      setFeedback({ type: '', message: '' });
    }
  };

  // Render step indicator
  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            resetStep >= 1 ? 'bg-theme_color2 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            1
          </div>
          <div className={`w-12 h-1 ${resetStep >= 2 ? 'bg-theme_color2' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            resetStep >= 2 ? 'bg-theme_color2 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            2
          </div>
          <div className={`w-12 h-1 ${resetStep >= 3 ? 'bg-theme_color2' : 'bg-gray-200'}`}></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            resetStep >= 3 ? 'bg-theme_color2 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            3
          </div>
        </div>
      </div>
    );
  };

  // Render step titles
  const renderStepTitle = () => {
    const titles = {
      1: t.enterEmail || 'Enter Email',
      2: t.verifyOtp || 'Verify OTP',
      3: t.setNewPassword || 'Set New Password'
    };
    return (
      <h4 className="text-center font-medium mb-4" style={{ color: '#4a90e2' }}>
        {titles[resetStep]}
      </h4>
    );
  };

  return (
    <div className="min-h-screen font-anek" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header className="py-3 px-3 sticky top-0 z-10" style={{ backgroundColor: '#1A1A2E', borderBottom: '1px solid #e0e0e0' }}>
        <div className="container mx-auto flex items-center">
          <button 
            onClick={handleCancel}
            className="mr-3 p-1 rounded-full cursor-pointer transition-colors"
            style={{ color: '#fff' }}
          >
            <MdArrowBackIosNew />
          </button>
          <h1 className="text-base font-bold" style={{ color: '#fff' }}>
            {t.transactionPasswordReset || 'Transaction Password Reset'}
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-3 py-6">
        <div className="rounded-xl p-6 shadow-sm max-w-2xl mx-auto" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
          
          {/* Icon and Title */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-theme_color2 bg-opacity-10 flex items-center justify-center mb-3">
              <FaCoins size={30} style={{ color: '#4a90e2' }} />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: '#4a90e2' }}>
              {t.transactionPasswordReset || 'Reset Transaction Password'}
            </h3>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}
          
          {/* Step Title */}
          {renderStepTitle()}

          {/* Feedback Message */}
          {feedback.message && (
            <div className={`mb-4 p-3 rounded text-sm ${
              feedback.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {feedback.message}
            </div>
          )}

          {/* Step 1: Email Form */}
          {resetStep === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="space-y-5 mb-5">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                    {t.email || 'Email Address'}
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 border rounded-lg text-sm outline-theme_color2"
                    style={{ 
                      backgroundColor: '#ffffff',
                      borderColor: '#e0e0e0',
                      color: '#333333'
                    }}
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    required
                    placeholder={t.emailPlaceholder || 'Enter your registered email'}
                  />
                  <p className="text-xs mt-2" style={{ color: '#888888' }}>
                    {t.transactionPasswordResetNote || 'We will send a verification code to this email address'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg text-sm font-medium bg-theme_color2 text-white flex items-center gap-2 transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {t.sending || 'Sending...'}
                    </>
                  ) : (
                    t.sendOtp || 'Send OTP'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: OTP Verification Form */}
          {resetStep === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="space-y-5 mb-5">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                    {t.email || 'Email'}
                  </label>
                  <input
                    type="email"
                    className="w-full p-3 border rounded-lg text-sm bg-gray-50"
                    style={{ 
                      backgroundColor: '#f9f9f9',
                      borderColor: '#e0e0e0',
                      color: '#333333'
                    }}
                    value={otpEmail}
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                    {t.otpCode || 'OTP Code'}
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border rounded-lg text-sm outline-theme_color2 text-center tracking-widest font-mono"
                    style={{ 
                      backgroundColor: '#ffffff',
                      borderColor: '#e0e0e0',
                      color: '#333333',
                      fontSize: '1.2rem'
                    }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="• • • • • •"
                    maxLength={6}
                    autoFocus
                  />
                  <p className="text-xs mt-2" style={{ color: '#888888' }}>
                    {t.enterOtpNote || 'Enter the 6-digit code sent to your email'}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetStep(1)}
                  className="px-6 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#e0e0e0', color: '#333333' }}
                >
                  {t.back || 'Back'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg text-sm font-medium bg-theme_color2 text-white flex items-center gap-2 transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isVerifyingOtp || otp.length !== 6}
                >
                  {isVerifyingOtp ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {t.verifying || 'Verifying...'}
                    </>
                  ) : (
                    t.verifyOtp || 'Verify OTP'
                  )}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-sm underline hover:no-underline"
                  style={{ color: '#4a90e2' }}
                  disabled={isSendingOtp}
                >
                  {t.resendOtp || 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password Form */}
          {resetStep === 3 && (
            <form onSubmit={handleResetPassword}>
              <div className="space-y-5 mb-5">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                    {t.newTransactionPassword || 'New Transaction Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showTransactionPassword ? "text" : "password"}
                      className="w-full p-3 border rounded-lg text-sm outline-theme_color2"
                      style={{ 
                        backgroundColor: '#ffffff',
                        borderColor: '#e0e0e0',
                        color: '#333333'
                      }}
                      value={newTransactionPassword}
                      onChange={(e) => setNewTransactionPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder={t.newPasswordPlaceholder || 'Enter new transaction password'}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 transition-colors"
                      style={{ color: '#888888' }}
                      onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                    >
                      {showTransactionPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                    {t.confirmPassword || 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showTransactionPassword ? "text" : "password"}
                      className="w-full p-3 border rounded-lg text-sm outline-theme_color2"
                      style={{ 
                        backgroundColor: '#ffffff',
                        borderColor: '#e0e0e0',
                        color: '#333333'
                      }}
                      value={confirmTransactionPassword}
                      onChange={(e) => setConfirmTransactionPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder={t.confirmPasswordPlaceholder || 'Confirm new transaction password'}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-5 p-3 rounded-lg" style={{ backgroundColor: '#f8f9fa' }}>
                <p className="text-xs font-medium" style={{ color: '#555555' }}>
                  {t.passwordRequirements || 'Password Requirements:'}
                </p>
                <ul className="text-xs space-y-1" style={{ color: '#888888' }}>
                  <li className="flex items-center gap-2">
                    <span style={{ color: newTransactionPassword.length >= 6 ? '#4CAF50' : '#888888' }}>
                      {newTransactionPassword.length >= 6 ? '✓' : '○'}
                    </span>
                    {t.minLengthRequirement || 'At least 6 characters'}
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResetStep(2)}
                  className="px-6 py-3 rounded-lg text-sm font-medium transition-colors hover:opacity-90"
                  style={{ backgroundColor: '#e0e0e0', color: '#333333' }}
                >
                  {t.back || 'Back'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg text-sm font-medium bg-theme_color2 text-white flex items-center gap-2 transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isResetting || newTransactionPassword.length < 6 || newTransactionPassword !== confirmTransactionPassword}
                >
                  {isResetting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {t.resetting || 'Resetting...'}
                    </>
                  ) : (
                    t.resetPasswordButton || 'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionPasswordReset;
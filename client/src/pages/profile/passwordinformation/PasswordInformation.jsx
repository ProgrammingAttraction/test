import React, { useState, useEffect, useContext } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaCoins } from 'react-icons/fa';
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import axios from 'axios';
import { LanguageContext } from '../../../context/LanguageContext';


const PasswordInformation = () => {
  const { t, language } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const navigate = useNavigate();
  
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showTransactionPassword, setShowTransactionPassword] = useState(false);
  const [currentLoginPassword, setCurrentLoginPassword] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [confirmLoginPassword, setConfirmLoginPassword] = useState('');
  const [currentTransactionPassword, setCurrentTransactionPassword] = useState('');
  const [newTransactionPassword, setNewTransactionPassword] = useState('');
  const [confirmTransactionPassword, setConfirmTransactionPassword] = useState('');
  const [showForgetTransactionForm, setShowForgetTransactionForm] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newResetTransactionPassword, setNewResetTransactionPassword] = useState('');
  const [confirmResetTransactionPassword, setConfirmResetTransactionPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [hasTransactionPassword, setHasTransactionPassword] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [feedback, setFeedback] = useState({
    type: '',
    message: '',
    field: ''
  });

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Check if user has transaction password set
  const checkTransactionPassword = async () => {
    try {
      const response = await axios.get(`${base_url}/user/check-transaction-password/${userData._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setHasTransactionPassword(response.data.hasTransactionPassword);
    } catch (error) {
      console.error(t.errorCheckingTransactionPassword, error);
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || t.transactionPasswordCheckError,
        field: 'transactionPassword'
      });
    }
  };

  useEffect(() => {
    if (userData?._id) {
      checkTransactionPassword();
    }
  }, [userData]);

  // Handle login password change
  const handleLoginPasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
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
        message: t.loginPasswordChangeSuccess,
        field: 'loginPassword'
      });

      // Reset form
      setCurrentLoginPassword('');
      setNewLoginPassword('');
      setConfirmLoginPassword('');

      // Refresh user data
      fetchUserData();

    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || t.loginPasswordChangeError,
        field: 'loginPassword'
      });
    }
  };

  // Handle transaction password change
  const handleTransactionPasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
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
        message: t.transactionPasswordChangeSuccess,
        field: 'transactionPassword'
      });

      // Reset form
      setCurrentTransactionPassword('');
      setNewTransactionPassword('');
      setConfirmTransactionPassword('');

      // Refresh user data
      fetchUserData();

    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || t.transactionPasswordChangeError,
        field: 'transactionPassword'
      });
    }
  };

  // Handle sending OTP for transaction password reset
  const handleSendTransactionPasswordOtp = async (e) => {
    e.preventDefault();
    setIsSendingOtp(true);
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
        message: response.data.message || t.otpSentSuccess,
        field: 'forgetTransactionPassword'
      });
      setShowForgetTransactionForm(true);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || t.otpSendError,
        field: 'forgetTransactionPassword'
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle verifying OTP for transaction password reset
  const handleVerifyTransactionPasswordOtp = async (e) => {
    e.preventDefault();
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
        message: response.data.message || t.otpVerifySuccess,
        field: 'forgetTransactionPassword'
      });
      setOtpToken(response.data.token);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || t.otpVerifyError,
        field: 'forgetTransactionPassword'
      });
    }
  };

  // Handle resetting transaction password
  const handleResetTransactionPassword = async (e) => {
    e.preventDefault();

    if (newResetTransactionPassword.length < 6) {
      setFeedback({
        type: 'error',
        message: t.transactionPasswordLengthError,
        field: 'forgetTransactionPassword'
      });
      return;
    }

    if (newResetTransactionPassword !== confirmResetTransactionPassword) {
      setFeedback({
        type: 'error',
        message: t.transactionPasswordMismatch,
        field: 'forgetTransactionPassword'
      });
      return;
    }

    try {
      const response = await axios.post(`${base_url}/user/reset-transaction-password`, {
        token: otpToken,
        newPassword: newResetTransactionPassword,
        confirmPassword: confirmResetTransactionPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFeedback({
        type: 'success',
        message: response.data.message || t.transactionPasswordResetSuccess,
        field: 'forgetTransactionPassword'
      });

      // Reset form
      setShowForgetTransactionForm(false);
      setOtpEmail('');
      setOtp('');
      setNewResetTransactionPassword('');
      setConfirmResetTransactionPassword('');
      setOtpToken('');
      fetchUserData();
      checkTransactionPassword();
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || t.transactionPasswordResetError,
        field: 'forgetTransactionPassword'
      });
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen font-anek text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-3 px-3 sticky top-0 z-10">
        <div className="container mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full text-cyan-500 cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <MdArrowBackIosNew />
          </button>
          <h1 className="text-base font-bold text-gray-200">{t.passwordInformationTitle}</h1>
        </div>
      </header>

      <div className="container mx-auto px-3 py-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
              <FaLock className="text-sm" />
              {t.passwordUpdate}
            </h3>
          </div>
          
          {/* Password Guidelines */}
          <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow mb-6 border border-gray-600">
            <h4 className="font-medium mb-3 text-cyan-400 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {t.passwordSecurityGuidelines}
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{t.passwordGuideline1}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{t.passwordGuideline2}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{t.passwordGuideline3}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{t.passwordGuideline4}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{t.passwordGuideline5}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{t.passwordGuideline6}</span>
              </div>
            </div>
          </div>

          {/* Login Password Change */}
          <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow mb-6 border border-gray-600">
            <h4 className="font-medium mb-4 text-cyan-400 flex items-center gap-2">
              <FaLock />
              {t.changeLoginPassword}
            </h4>
            {feedback.field === 'loginPassword' && (
              <div className={`mb-3 p-3 rounded text-sm ${
                feedback.type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
              }`}>
                {feedback.message}
              </div>
            )}
            <form onSubmit={handleLoginPasswordChange}>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t.currentLoginPassword}</label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                      value={currentLoginPassword}
                      onChange={(e) => setCurrentLoginPassword(e.target.value)}
                      required
                      placeholder={t.currentLoginPasswordPlaceholder}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t.newLoginPassword}</label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                      value={newLoginPassword}
                      onChange={(e) => setNewLoginPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder={t.newPasswordPlaceholder}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t.confirmPassword}</label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                      value={confirmLoginPassword}
                      onChange={(e) => setConfirmLoginPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder={t.confirmPasswordPlaceholder}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                >
                  <span>✓</span>
                  {t.changePasswordButton}
                </button>
              </div>
            </form>
          </div>

          {/* Transaction Password Change */}
          {userData?.phone && hasTransactionPassword && (
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow mb-6 border border-gray-600">
              <h4 className="font-medium mb-4 text-cyan-400 flex items-center gap-2">
                <FaCoins />
                {t.changeTransactionPassword}
              </h4>
              {feedback.field === 'transactionPassword' && (
                <div className={`mb-3 p-3 rounded text-sm ${
                  feedback.type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
                }`}>
                  {feedback.message}
                </div>
              )}
              <form onSubmit={handleTransactionPasswordChange}>
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t.currentTransactionPassword}</label>
                    <div className="relative">
                      <input
                        type={showTransactionPassword ? "text" : "password"}
                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                        value={currentTransactionPassword}
                        onChange={(e) => setCurrentTransactionPassword(e.target.value)}
                        required
                        placeholder={t.currentTransactionPasswordPlaceholder}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                        onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                      >
                        {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t.newTransactionPassword}</label>
                    <div className="relative">
                      <input
                        type={showTransactionPassword ? "text" : "password"}
                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                        value={newTransactionPassword}
                        onChange={(e) => setNewTransactionPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder={t.newPasswordPlaceholder}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                        onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                      >
                        {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">{t.confirmPassword}</label>
                    <div className="relative">
                      <input
                        type={showTransactionPassword ? "text" : "password"}
                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                        value={confirmTransactionPassword}
                        onChange={(e) => setConfirmTransactionPassword(e.target.value)}
                        required
                        minLength={6}
                        placeholder={t.confirmPasswordPlaceholder}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                        onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                      >
                        {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-center">
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                  >
                    <span>✓</span>
                    {t.changeTransactionPasswordButton}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Forget Transaction Password */}
          {userData?.phone && hasTransactionPassword && (
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow border border-gray-600">
              <h4 className="font-medium mb-4 text-cyan-400 flex items-center gap-2">
                <FaCoins />
                {t.resetTransactionPassword}
              </h4>
              {feedback.field === 'forgetTransactionPassword' && (
                <div className={`mb-3 p-3 rounded text-sm ${
                  feedback.type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
                }`}>
                  {feedback.message}
                </div>
              )}
              {!showForgetTransactionForm ? (
                <form onSubmit={handleSendTransactionPasswordOtp}>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t.email}</label>
                      <input
                        type="email"
                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        required
                        placeholder={t.emailPlaceholder}
                      />
                      <p className="text-xs text-gray-500 mt-1">{t.enterRegisteredEmail}</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSendingOtp}
                    >
                      {isSendingOtp ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <span>✓</span>
                      )}
                      {isSendingOtp ? t.processing : t.sendOtp}
                    </button>
                  </div>
                </form>
              ) : !otpToken ? (
                <form onSubmit={handleVerifyTransactionPasswordOtp}>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t.email}</label>
                      <input
                        type="email"
                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        required
                        placeholder={t.emailPlaceholder}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t.otpCode}</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        required
                        placeholder={t.otpPlaceholder}
                        maxLength={6}
                      />
                      <p className="text-xs text-gray-500 mt-1">{t.enterOtpNote}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgetTransactionForm(false);
                        setOtpEmail('');
                        setOtp('');
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                    >
                      {t.verifyOtp}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetTransactionPassword}>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t.newTransactionPassword}</label>
                      <div className="relative">
                        <input
                          type={showTransactionPassword ? "text" : "password"}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                          value={newResetTransactionPassword}
                          onChange={(e) => setNewResetTransactionPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder={t.newPasswordPlaceholder}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                          onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                        >
                          {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t.confirmPassword}</label>
                      <div className="relative">
                        <input
                          type={showTransactionPassword ? "text" : "password"}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                          value={confirmResetTransactionPassword}
                          onChange={(e) => setConfirmResetTransactionPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder={t.confirmPasswordPlaceholder}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                          onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                        >
                          {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgetTransactionForm(false);
                        setOtpEmail('');
                        setOtp('');
                        setNewResetTransactionPassword('');
                        setConfirmResetTransactionPassword('');
                        setOtpToken('');
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                    >
                      <span>✓</span>
                      {t.resetPasswordButton}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordInformation;
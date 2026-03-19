import React, { useState, useContext, useEffect } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaCoins } from 'react-icons/fa';
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import axios from 'axios';
import { LanguageContext } from '../../../context/LanguageContext';

const TransactionPassword = () => {
  const { t } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const navigate = useNavigate();
  
  const [showTransactionPassword, setShowTransactionPassword] = useState(false);
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
        message: error.response?.data?.message || t.transactionPasswordCheckError || 'Error checking transaction password',
        field: 'transactionPassword'
      });
    }
  };

  useEffect(() => {
    if (userData?._id) {
      checkTransactionPassword();
    }
  }, [userData]);

  // Handle transaction password change
  const handleTransactionPasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (newTransactionPassword !== confirmTransactionPassword) {
      setFeedback({
        type: 'error',
        message: t.transactionPasswordMismatch || 'New transaction passwords do not match',
        field: 'transactionPassword'
      });
      return;
    }

    if (newTransactionPassword.length < 6) {
      setFeedback({
        type: 'error',
        message: t.transactionPasswordLengthError || 'Transaction password must be at least 6 characters',
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
        message: t.transactionPasswordChangeSuccess || 'Transaction password updated successfully!',
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
        message: err.response?.data?.message || t.transactionPasswordChangeError || 'Failed to update transaction password',
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
        message: response.data.message || t.otpSentSuccess || 'OTP sent successfully to your email',
        field: 'forgetTransactionPassword'
      });
      setShowForgetTransactionForm(true);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || t.otpSendError || 'Failed to send OTP',
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
        message: response.data.message || t.otpVerifySuccess || 'OTP verified successfully',
        field: 'forgetTransactionPassword'
      });
      setOtpToken(response.data.token);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.response?.data?.message || t.otpVerifyError || 'Invalid OTP',
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
        message: t.transactionPasswordLengthError || 'Transaction password must be at least 6 characters',
        field: 'forgetTransactionPassword'
      });
      return;
    }

    if (newResetTransactionPassword !== confirmResetTransactionPassword) {
      setFeedback({
        type: 'error',
        message: t.transactionPasswordMismatch || 'Passwords do not match',
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
        message: response.data.message || t.transactionPasswordResetSuccess || 'Transaction password reset successfully',
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
        message: error.response?.data?.message || t.transactionPasswordResetError || 'Failed to reset password',
        field: 'forgetTransactionPassword'
      });
    }
  };

  return (
    <div className="min-h-screen font-anek" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header className="py-3 px-3 sticky top-0 z-10" style={{ backgroundColor: '#1A1A2E', borderBottom: '1px solid #e0e0e0' }}>
        <div className="container mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full cursor-pointer transition-colors"
            style={{ color: '#fff' }}
          >
            <MdArrowBackIosNew />
          </button>
          <h1 className="text-base font-bold" style={{ color: '#fff' }}>{t.transactionPasswordTitle || 'Transaction Password'}</h1>
        </div>
      </header>

      <div className="container mx-auto px-3 py-6">
        <div className="rounded-xl p-6 shadow-sm max-w-2xl mx-auto" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#4a90e2' }}>
              <FaCoins className="text-sm" />
              {t.transactionPasswordUpdate || 'Transaction Password Update'}
            </h3>
          </div>

          {/* Transaction Password Change - Only show if user has transaction password */}
          {hasTransactionPassword && (
            <div className="py-3">
              {feedback.field === 'transactionPassword' && (
                <div className={`mb-4 p-3 rounded text-sm ${
                  feedback.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {feedback.message}
                </div>
              )}
              
              <form onSubmit={handleTransactionPasswordChange}>
                <div className="space-y-5 mb-5">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                      {t.currentTransactionPassword || 'Current Transaction Password'}
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
                        value={currentTransactionPassword}
                        onChange={(e) => setCurrentTransactionPassword(e.target.value)}
                        required
                        placeholder={t.currentTransactionPasswordPlaceholder || 'Enter current transaction password'}
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
                      />
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
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg text-sm font-medium bg-theme_color2 flex items-center gap-2 transition-colors hover:opacity-90"
                  >
                    {t.changeTransactionPasswordButton || 'Update Transaction Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TransactionPassword;
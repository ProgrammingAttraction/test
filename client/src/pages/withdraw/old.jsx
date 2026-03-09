import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { MdArrowBackIosNew } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { TiWarningOutline } from "react-icons/ti";
import { ImInfo } from "react-icons/im";
import { LanguageContext } from '../../context/LanguageContext';

const Withdraw = () => {
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

  // Check KYC status from user data
  const isKYCCompleted = userData?.kycCompleted || false;
  const isKYCSubmitted = userData?.kycSubmitted || false;
  
  // Show KYC verification message only when kycSubmitted is true and kycCompleted is false
  const showKYCVerificationMessage = isKYCSubmitted && !isKYCCompleted;

  // Calculate wagering progress based on waigeringneed * bonusBalance
  const wageringProgress = userData.waigeringneed && userData.waigeringneed > 0 && userData.bonusBalance > 0
    ? Math.min(((userData.total_bet || 0) / (userData.waigeringneed * userData.bonusBalance)) * 100, 100)
    : 0;

  const formatUnbanDate = (dateString) => {
    if (!dateString) return t.notSpecified;
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', options);
  };

  const getTimeUntilUnban = () => {
    if (!unbanDate) return null;
    const now = new Date();
    const unban = new Date(unbanDate);
    const diffMs = unban - now;
    if (diffMs <= 0) return t.banPeriodEnded;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return language.code === 'bn'
      ? `${days} দিন ${hours} ঘন্টা ${minutes} মিনিট`
      : `${days} days ${hours} hours ${minutes} minutes`;
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', options);
  };

  const formatNumber = (number) => {
    if (number === undefined || number === null) return language.code === 'bn' ? '০' : '0';
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', {
      minimumFractionDigits: 2
    }).format(number);
  };

  useEffect(() => {
    if (userData?.bonusInfo?.activeBonuses?.length > 0) {
      const activeBonuses = userData.bonusInfo.activeBonuses.filter(
        bonus => bonus.status === 'active'
      );
      
      if (activeBonuses.length > 0) {
        const calculateCountdown = () => {
          const now = new Date();
          const createdAt = new Date(activeBonuses[0].createdAt);
          const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
          const expiresAt = new Date(createdAt.getTime() + sevenDaysInMs);
          const diffMs = expiresAt - now;

          // Calculate wagering requirement based on waigeringneed * bonusBalance
          let isTransferEligible = false;
          if (userData.waigeringneed > 0 && userData.bonusBalance > 0) {
            const wageringRequirement = userData.waigeringneed * userData.bonusBalance;
            const wageringCompleted = userData.total_bet || 0;
            isTransferEligible = wageringCompleted >= wageringRequirement;
          } else {
            // Fallback to 30x wagering system
            const wageringRequirement30x = userData.total_deposit * 30;
            const wageringCompleted = userData.total_bet || 0;
            isTransferEligible = wageringCompleted >= wageringRequirement30x;
          }

          if (diffMs <= 0) {
            setBonusCountdown({ expired: true });
            setShowTransferBonusButton(false);
            return;
          }

          const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

          setBonusCountdown({
            days,
            hours,
            minutes,
            seconds,
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

  useEffect(() => {
    const fetchWithdrawalHistory = async () => {
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
        console.error(t.withdrawalHistoryError, err);
        setError(t.withdrawalHistoryLoadError);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (userData?._id && isKYCCompleted) {
      fetchWithdrawalHistory();
    }
  }, [userData?._id, base_url, t, isKYCCompleted]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const hasMobileNumber = userData?.phone;

  // Show KYC verification message if KYC is submitted but not completed
  if (showKYCVerificationMessage) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-anek">
        <div className="bg-gray-800 py-2 px-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-gray-700 mr-4"
            >
              <MdArrowBackIosNew className="text-xl" />
            </button>
            <h1 className="text-xl font-semibold">{t.withdrawTitle}</h1>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="mb-6">
            <div className="bg-yellow-500/20 p-6 rounded-full inline-block mb-4">
              <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">
              {t.kycUnderReview || "KYC Under Review"}
            </h3>
            <p className="text-gray-300 mb-4">
              {t.kycUnderReviewDesc || "Your KYC documents have been submitted and are under review. You will be able to withdraw funds once your KYC is approved."}
            </p>
            <div className="flex flex-col gap-4 items-center">
              <div className="animate-pulse bg-blue-500/20 px-6 py-3 rounded-lg border border-blue-500">
                <p className="text-blue-400">
                  {t.kycPending || "KYC Verification Pending Approval"}
                </p>
              </div>
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                onClick={() => navigate('/profile')}
              >
                {t.checkKycStatus || "Check KYC Status"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show KYC verification message if KYC is not submitted (unverified)
  if (userData?.kycSubmitted === true && userData?.kycCompleted === false) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-anek">
        <div className="bg-gray-800 py-2 px-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-gray-700 mr-4"
            >
              <MdArrowBackIosNew className="text-xl" />
            </button>
            <h1 className="text-xl font-semibold">{t.withdrawTitle}</h1>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="mb-6">
            <div className="bg-yellow-500/20 p-6 rounded-full inline-block mb-4">
              <svg className="w-16 h-16 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">
              {t.kycVerificationRequired || "KYC verification is required"}
            </h3>
            <p className="text-gray-300 mb-4">
              {t.kycVerificationDesc || "You need to complete KYC verification to withdraw funds from your account."}
            </p>
            <button
              className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-semibold cursor-pointer py-3 px-8 rounded-lg transition-colors text-base"
              onClick={() => navigate('/profile-information')}
            >
              {t.completeKycVerification || "Complete KYC Verification"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isWithdrawalBanned) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-anek">
        <div className="bg-gray-800 py-2 px-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-gray-700 mr-4"
            >
              <MdArrowBackIosNew className="text-xl" />
            </button>
            <h1 className="text-xl font-semibold">{t.withdrawTitle}</h1>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="mb-6">
            <div className="bg-red-500/20 p-4 rounded-full inline-block mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-2">{t.withdrawalRestricted}</h3>
            <p className="text-gray-300 mb-4">{t.withdrawalRestrictedDesc}</p>
            
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-left mb-4">
              <div className="mb-3">
                <span className="text-gray-400 block text-sm">{t.reason}</span>
                <span className="text-red-300 font-medium">{banReason || t.noReasonSpecified}</span>
              </div>
              {unbanDate && (
                <>
                  <div className="mb-3">
                    <span className="text-gray-400 block text-sm">{t.banEndDate}</span>
                    <span className="text-yellow-300 font-medium">{formatUnbanDate(unbanDate)}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-sm">{t.timeRemaining}</span>
                    <span className="text-green-300 font-medium">{getTimeUntilUnban()}</span>
                  </div>
                </>
              )}
            </div>
            
            <p className="text-gray-400 text-sm">{t.contactSupport}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-anek">
        <div className="bg-gray-800 py-2 px-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-gray-700 mr-4"
            >
              <MdArrowBackIosNew className="text-xl" />
            </button>
            <h1 className="text-xl font-semibold">{t.withdrawTitle}</h1>
          </div>
        </div>
        
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
          </div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-anek">
        <div className="bg-gray-800 py-2 px-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-gray-700 mr-4"
            >
              <MdArrowBackIosNew className="text-xl" />
            </button>
            <h1 className="text-xl font-semibold">{t.withdrawTitle}</h1>
          </div>
        </div>
        
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded text-center max-w-2xl mx-auto mt-4">
          {t.userDataError}: {userError}
        </div>
      </div>
    );
  }

  if (!hasMobileNumber) {
    return (
      <div className="min-h-screen bg-gray-900 text-white font-anek">
        <div className="bg-gray-800 py-2 px-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full hover:bg-gray-700 mr-4"
            >
              <MdArrowBackIosNew className="text-xl" />
            </button>
            <h1 className="text-xl font-semibold">{t.withdrawTitle}</h1>
          </div>
        </div>
        
        <div className="max-w-2xl mx-auto p-6 rounded-lg text-center">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-200 mb-2">{t.addMobileNumber}</h3>
            <p className="text-gray-400">{t.addMobileNumberDesc}</p>
          </div>
          <button 
            className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 font-medium py-2 px-6 rounded-lg transition-colors"
            onClick={() => navigate('/mobile-information')}
          >
            {t.editProfile}
          </button>
        </div>
      </div>
    );
  }

  const calculateWithdrawalInfo = () => {
    if (!userData) return { availableBalance: 0, commissionRate: 0, needsWagering: false };

    let available = userData.balance || 0;
    let commissionRate = 0;
    let needsWagering = false;
    let wageringStatus = '';
    let remainingWagering = 0;

    if (userData.bonusBalance > 0 && !cancelBonus) {
      return {
        availableBalance: 0,
        commissionRate: 0,
        needsWagering: false,
        hasActiveBonus: true
      };
    }

    // Check wagering requirement: waigeringneed * bonusBalance
    if (userData.waigeringneed && userData.waigeringneed > 0 && userData.bonusBalance > 0) {
      const wageringRequirement = userData.waigeringneed * userData.bonusBalance;
      const wageringCompleted = userData.total_bet || 0;
      
      if (wageringCompleted < wageringRequirement) {
        wageringStatus = 'pending-wagering';
        needsWagering = true;
        remainingWagering = wageringRequirement - wageringCompleted;
        
        // Apply 20% commission if wagering is less than total deposit amount
        if (userData.total_deposit > 0 && wageringCompleted < userData.total_deposit) {
          commissionRate = 0.2;
          wageringStatus = 'less-than-deposit';
        }
        
        return {
          availableBalance: available,
          commissionRate,
          needsWagering: true,
          wageringStatus,
          remainingWagering
        };
      } else {
        wageringStatus = 'completed';
        return {
          availableBalance: available,
          commissionRate: 0,
          needsWagering: false,
          wageringStatus
        };
      }
    }
    
    // If waigeringneed is 0 or doesn't exist, or no bonus balance, use the original system
    if (userData.total_deposit > 0) {
      const wageringRequirement1x = userData.total_deposit * 1;
      const wageringRequirement3x = userData.total_deposit * 3;
      const wageringCompleted = userData.total_bet || 0;

      if (wageringCompleted < wageringRequirement1x) {
        wageringStatus = 'less-than-1x';
        needsWagering = true;
        remainingWagering = wageringRequirement1x - wageringCompleted;
        return {
          availableBalance: 0,
          commissionRate: 0,
          needsWagering: true,
          wageringStatus,
          remainingWagering
        };
      } else if (wageringCompleted < wageringRequirement3x) {
        commissionRate = 0.2;
        needsWagering = true;
        remainingWagering = wageringRequirement3x - wageringCompleted;
        wageringStatus = 'less-than-3x';
      } else {
        wageringStatus = 'completed';
      }
    }

    return {
      availableBalance: userData.balance,
      commissionRate,
      needsWagering,
      remainingWagering,
      wageringStatus
    };
  };

  const {
    availableBalance,
    commissionRate,
    needsWagering,
    hasActiveBonus,
    remainingWagering,
    wageringStatus
  } = calculateWithdrawalInfo();

  const handleCancelBonus = async () => {
    setCancelBonusLoading(true);
    setError('');

    try {
      const response = await axios.post(`${base_url}/user/cancel-bonus`, {
        userid: userData._id
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setCancelBonus(false);
        setShowBonusCancelConfirm(false);
        await fetchUserData();
      } else {
        setError(response.data.message || t.cancelBonusError);
      }
    } catch (err) {
      console.error(t.cancelBonusError, err);
      setError(err.response?.data?.message || t.cancelBonusError);
    } finally {
      setCancelBonusLoading(false);
    }
  };

  const handleTransferBonus = async () => {
    setTransferBonusLoading(true);
    setError('');

    try {
      const response = await axios.put(`${base_url}/user/transfer-bonus-to-main-balance`, {
        userId: userData._id
      }, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setShowTransferBonusButton(false);
        await fetchUserData();
      } else {
        setError(response.data.message || t.transferBonusError);
      }
    } catch (err) {
      console.error(t.transferBonusError, err);
      setError(err.response?.data?.message || t.transferBonusError);
    } finally {
      setTransferBonusLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    setError('');
    setSuccess('');

    if (!amount || amount < 800) {
      setError(t.minimumWithdrawalError);
      return;
    }

    if (parseFloat(amount) > userData.balance) {
      setError(`${t.insufficientBalanceError} ৳${formatNumber(userData.balance)}`);
      return;
    }

    if (!accountNumber) {
      setError(t.accountNumberRequired);
      return;
    }

    if (!transactionPassword) {
      setError(t.transactionPasswordRequired);
      return;
    }

    const phoneRegex = /^01\d{9}$/;
    if (['bkash', 'nagad'].includes(paymentMethod) && !phoneRegex.test(accountNumber)) {
      setError(t.invalidAccountNumberError.replace('{method}', paymentMethod === 'bkash' ? t.bkash : t.nagad));
      return;
    }

    if (wageringStatus === 'less-than-1x') {
      setError(t.wagering1xError.replace('{amount}', formatNumber(remainingWagering)));
      return;
    }

    try {
      setLoading(true);
      const orderId = `WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const payoutData = {
        userId: userData._id,
        username: userData.username,
        email: userData.email,
        playerId: userData.player_id,
        provider: paymentMethod,
        amount: parseFloat(amount),
        orderId: orderId,
        payeeAccount: accountNumber,
        transactionPassword,
        wageringStatus: wageringStatus || 'completed',
        cancelBonus,
        waigeringneed: userData.waigeringneed,
        total_bet: userData.total_bet
      };

      const payoutResponse = await axios.post(`${base_url}/user/payout`, payoutData, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (payoutResponse.data.success) {
        setSuccess(payoutResponse.data.message);
        setAmount('');
        setAccountNumber('');
        setTransactionPassword('');
        setCancelBonus(false);
        await fetchUserData();
        const historyResponse = await axios.get(`${base_url}/user/withdrawal/${userData._id}`, {
          headers: {
            'x-api-key': import.meta.env.VITE_API_KEY,
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setWithdrawalHistory(historyResponse.data.data || []);
      } else {
        setError(payoutResponse.data.message || t.withdrawalRequestError);
      }
    } catch (err) {
      console.error(t.withdrawalError, err);
      if (err.response) {
        const errorMessage = err.response.data.message;
        if (errorMessage === 'Transaction password not set for this user') {
          setError(
            <>
              {t.transactionPasswordNotSet}{' '}
              <button
                className="text-cyan-400 underline"
                onClick={() => navigate('/mobile-information')}
              >
                {t.setPasswordLink}
              </button>
            </>
          );
        } else {
          setError(errorMessage || t.serverError);
        }
      } else {
        setError(t.networkError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-anek">
      <div className="bg-gray-800 py-2 px-2 md:px-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full hover:bg-gray-700 mr-4"
          >
            <MdArrowBackIosNew className="text-xl" />
          </button>
          <h1 className="text-xl font-semibold">{t.withdrawTitle}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 p-2 md:p-6">

        <div className="bg-gray-800 p-3 md:p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">{t.withdrawMoney}</h3>
          
          <div className="bg-yellow-500/10 border border-yellow-500 flex justify-start items-center gap-2 text-yellow-400 p-3 rounded mb-4 text-sm">
            <TiWarningOutline className="text-yellow-500 text-[22px]"/>
            {t.withdrawalRules}
          </div>

          <div className="bg-gray-700 p-4 rounded-lg mb-4 border border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">{t.totalBalance}</p>
                <p className="font-medium text-lg">৳{formatNumber(userData?.balance || 0)}</p>
              </div>
              {userData?.bonusBalance > 0 && (
                <div>
                  <p className="text-gray-400 text-sm">{t.bonusBalance}</p>
                  <p className="font-medium text-lg text-cyan-400">৳{formatNumber(userData.bonusBalance)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-400 text-sm">{t.availableBalance}</p>
                <p className={`font-medium text-xl ${availableBalance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ৳{formatNumber(availableBalance)}
                </p>
              </div>
            </div>
          </div>

          {hasActiveBonus && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4">
              <div className="flex items-start">
                <TiWarningOutline className="text-yellow-500 text-[22px] mr-2"/>
                <div>
                  <p className="font-medium">{t.activeBonus}</p>
                  <p className="text-sm">
                    {t.activeBonusMessage.replace('{amount}', formatNumber(userData.bonusBalance))}
                    {showTransferBonusButton
                      ? t.wageringCompleteTransfer
                      : bonusCountdown?.expired
                        ? t.bonusExpired
                        : t.completeWageringOrCancel}
                  </p>
                  
                  {/* Calculate wagering progress based on waigeringneed * bonusBalance */}
                  {userData.waigeringneed > 0 && userData.bonusBalance > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-300 ${
                            wageringProgress >= 100 ? 'bg-green-500' : 'bg-yellow-400'
                          }`}
                          style={{ width: `${wageringProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm mt-1">
                        {t.wageringProgress.replace('{bet}', formatNumber(userData.total_bet || 0)).replace('{target}', formatNumber(userData.waigeringneed * userData.bonusBalance)).replace('{percent}', wageringProgress.toFixed(0))}
                      </p>
                    </div>
                  )}
                  
                  {bonusCountdown && (
                    <div className="mt-2 text-sm">
                      {bonusCountdown.expired ? (
                        <p className="text-red-400">{t.bonusExpired}</p>
                      ) : (
                        <p>
                          {t.bonusExpiresIn}
                          <span className="font-medium text-yellow-400">
                            {` ${bonusCountdown.days} ${t.days} ${bonusCountdown.hours} ${t.hours} ${bonusCountdown.minutes} ${t.minutes} ${bonusCountdown.seconds} ${t.seconds}`}
                          </span>
                        </p>
                      )}
                      {!showTransferBonusButton && !bonusCountdown.expired && (
                        <p className="text-sm">
                          {userData.waigeringneed > 0 && userData.bonusBalance > 0
                            ? t.remainingWagering.replace('{amount}', formatNumber(Math.max(0, (userData.waigeringneed * userData.bonusBalance) - (userData.total_bet || 0))))
                            : t.remainingWagering.replace('{amount}', formatNumber(userData.total_deposit * 30 - (userData.total_bet || 0)))}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Check if wagering requirement is met for withdrawal */}
                  {userData.waigeringneed > 0 && userData.bonusBalance > 0 && userData.total_bet >= userData.waigeringneed * userData.bonusBalance && (
                    <div className="mt-2 p-2 bg-green-500/10 border border-green-500 rounded">
                      <p className="text-green-400 text-sm font-medium">
                        {t.wageringRequirementMet || "Wagering requirement completed!"}
                      </p>
                      <p className="text-green-400/80 text-xs mt-1">
                        {t.wageringRequirementMetDesc || "You can now withdraw your funds."}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-2 flex items-center gap-3">
                    {/* Show transfer button if wagering requirement is met OR showTransferBonusButton is true */}
                    {(showTransferBonusButton || (userData.waigeringneed > 0 && userData.bonusBalance > 0 && userData.total_bet >= userData.waigeringneed * userData.bonusBalance)) ? (
                      <button
                        className={`px-4 py-2 rounded font-medium transition-colors cursor-pointer ${
                          transferBonusLoading
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                        onClick={handleTransferBonus}
                        disabled={transferBonusLoading}
                      >
                        {transferBonusLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t.transferring}
                          </span>
                        ) : t.transferBonus}
                      </button>
                    ) : (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="cancelBonus"
                          checked={cancelBonus}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setShowBonusCancelConfirm(true);
                            } else {
                              setCancelBonus(false);
                            }
                          }}
                          className="mr-2 h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded"
                        />
                        <label htmlFor="cancelBonus" className="text-sm">{t.cancelBonusCheckbox}</label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showBonusCancelConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000000] backdrop-blur-sm p-4">
              <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-gray-200">{t.confirmCancelBonus}</h3>
                <div className="mb-6">
                  <p className="text-gray-300 mb-2">{t.cancelBonusMessage}</p>
                  <div className="bg-gray-700 p-3 rounded border border-gray-600">
                    <p className="font-medium text-cyan-400">৳{formatNumber(userData.bonusBalance)} {t.bonus}</p>
                  </div>
                  <p className="text-red-400 text-sm mt-2">{t.cancelBonusWarning}</p>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setShowBonusCancelConfirm(false);
                      setCancelBonus(false);
                    }}
                    disabled={cancelBonusLoading}
                  >
                    {t.cancel}
                  </button>
                  <button
                    className="px-4 py-2 bg-red-500 rounded hover:bg-red-600 transition-colors"
                    onClick={handleCancelBonus}
                    disabled={cancelBonusLoading}
                  >
                    {cancelBonusLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.processing}
                      </span>
                    ) : t.cancelBonus}
                  </button>
                </div>
              </div>
            </div>
          )}

          {needsWagering && (
            <div className="bg-purple-500/10 border border-purple-500 text-purple-400 p-3 rounded mb-4">
              <div className="flex items-start">
                <ImInfo className="mr-2 text-xl"/>
                <div>
                  <p className="font-medium">{t.wageringRequirement}</p>
                  {wageringStatus === 'less-than-1x' ? (
                    <>
                      <p className="text-sm text-red-400">
                        {t.wagering1xIncomplete.replace('{bet}', formatNumber(userData.total_bet || 0)).replace('{target}', formatNumber(userData.total_deposit * 1))}
                      </p>
                      <p className="text-sm mt-1">
                        {t.wagering1xInstruction.replace('{amount}', formatNumber(remainingWagering))}
                      </p>
                    </>
                  ) : wageringStatus === 'less-than-3x' ? (
                    <>
                      <p className="text-sm">
                        {t.remainingWagering3x.replace('{amount}', formatNumber(remainingWagering))}
                      </p>
                      <p className="text-sm mt-1">{t.commissionWarning}</p>
                      {amount && (
                        <div className="mt-2 text-xs bg-purple-500/20 p-2 rounded">
                          <p>{t.withdrawalAmount}: ৳{formatNumber(parseFloat(amount))}</p>
                          <p>{t.commission}: ৳{formatNumber(parseFloat(amount) * commissionRate)}</p>
                          <p>{t.receivable}: ৳{formatNumber(parseFloat(amount) * (1 - commissionRate))}</p>
                        </div>
                      )}
                    </>
                  ) : wageringStatus === 'pending-wagering' ? (
                    <>
                      <p className="text-sm">
                        {t.remainingWagering.replace('{amount}', formatNumber(remainingWagering))}
                      </p>
                      <p className="text-sm mt-1">
                        {t.wageringInstruction.replace('{amount}', formatNumber(userData.waigeringneed * userData.bonusBalance))}
                      </p>
                    </>
                  ) : wageringStatus === 'less-than-deposit' ? (
                    <>
                      <p className="text-sm">
                        {t.remainingWageringBeforeCommission.replace('{amount}', formatNumber(remainingWagering))}
                      </p>
                      <p className="text-sm mt-1">{t.commissionWarning}</p>
                      {amount && (
                        <div className="mt-2 text-xs bg-purple-500/20 p-2 rounded">
                          <p>{t.withdrawalAmount}: ৳{formatNumber(parseFloat(amount))}</p>
                          <p>{t.commission}: ৳{formatNumber(parseFloat(amount) * commissionRate)}</p>
                          <p>{t.receivable}: ৳{formatNumber(parseFloat(amount) * (1 - commissionRate))}</p>
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-400 p-3 rounded mb-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{success}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="mb-4">
              <label className="block font-medium mb-2 text-gray-400">{t.paymentMethod}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod('bkash')}
                  className={`px-4 py-2 rounded border cursor-pointer transition-colors ${
                    paymentMethod === 'bkash' ? 'bg-cyan-500 border-cyan-500 text-gray-900' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center">
                    <img
                      src="https://images.5949390294.com/mcs-images/bank_type/BKASH/BN_2_20240312225413337.png"
                      alt="bkash"
                      className="w-6 h-6 mr-2"
                    />
                    {t.bkash}
                  </div>
                </button>
                <button
                  onClick={() => setPaymentMethod('nagad')}
                  className={`px-4 py-2 rounded border cursor-pointer transition-colors ${
                    paymentMethod === 'nagad' ? 'bg-cyan-500 border-cyan-500 text-gray-900' : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center">
                    <img
                      src="https://images.5949390294.com/mcs-images/bank_type/NAGAD/BN_2_20240312230148421.png"
                      alt="nagad"
                      className="w-6 h-6 mr-2"
                    />
                    {t.nagad}
                  </div>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                {paymentMethod === 'bkash' ? t.bkashNumber : t.nagadNumber}
              </label>
              <input
                type="text"
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder={paymentMethod === 'bkash' ? t.bkashPlaceholder : t.nagadPlaceholder}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">{t.accountNumberFormat}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t.withdrawalAmount}</label>
              <input
                type="number"
                className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder={t.amountPlaceholder}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="300"
                step="100"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{t.maximumAmount.replace('{amount}', formatNumber(availableBalance))}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">{t.transactionPassword}</label>
              <div className="relative">
                <input
                  type={showTransactionPassword ? "text" : "password"}
                  className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder={t.transactionPasswordPlaceholder}
                  value={transactionPassword}
                  onChange={(e) => setTransactionPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
                  onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                >
                  {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t.transactionPasswordNote}</p>
            </div>
            
            <button 
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                (!amount || amount < 300 || !accountNumber || !transactionPassword || loading || 
                 hasActiveBonus || 
                 wageringStatus === 'less-than-1x' ||
                 parseFloat(amount || 0) > availableBalance
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-cyan-500 hover:bg-cyan-600 text-gray-900'
                )}`}
              onClick={handleWithdrawal}
              disabled={
                !amount || amount < 300 || !accountNumber || !transactionPassword || loading || 
                hasActiveBonus || 
                wageringStatus === 'less-than-1x' ||
                parseFloat(amount || 0) > availableBalance
              }
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.processing}
                </span>
              ) : (
                wageringStatus === 'less-than-1x' ? t.complete1xWagering :
                hasActiveBonus ? t.cancelOrTransferBonus :
                t.requestWithdrawal
              )}
            </button>
          </div>
        </div>

        <div className="bg-gray-800 p-3 md:p-6 rounded-lg border border-gray-700">
          <h4 className="font-semibold text-gray-200 mb-3">{t.withdrawalHistory}</h4>
          
          {withdrawalHistory.length > 0 ? (
            <div className="overflow-x-auto border-[1px] border-gray-700 rounded-lg">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t.date}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t.amount}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t.method}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t.status}</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {withdrawalHistory.map((withdrawal) => (
                    <tr key={withdrawal._id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(withdrawal.createdAt).toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        ৳{formatNumber(withdrawal.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                        {withdrawal.provider === 'bkash' ? t.bkash : withdrawal.provider === 'nagad' ? t.nagad : withdrawal.provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${
                            withdrawal.status === 'success' ? 'text-green-400' :
                            withdrawal.status === 'approved' ? 'text-blue-400' :
                            withdrawal.status === 'pending' ? 'text-yellow-400' :
                            withdrawal.status === 'rejected' ? 'text-red-400' :
                            withdrawal.status === 'failed' ? 'text-red-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {withdrawal.status === 'success' ? t.successStatus : 
                             withdrawal.status === 'approved' ? t.approvedStatus :
                             withdrawal.status === 'pending' ? t.pendingStatus :
                             withdrawal.status === 'rejected' ? t.rejectedStatus : 
                             withdrawal.status === 'failed' ? t.failedStatus : withdrawal.status}
                          </span>
                          {withdrawal.status === 'approved' && (
                            <span className="text-xs text-blue-400 mt-1">{t.approvedMessage}</span>
                          )}
                          {withdrawal.status === 'completed' && (
                            <span className="text-xs text-green-400 mt-1">{t.completedMessage}</span>
                          )}
                          {withdrawal.status === 'rejected' && (
                            <span className="text-xs text-red-400 mt-1">{t.rejectedMessage}</span>
                          )}
                          {withdrawal.status === 'failed' && (
                            <span className="text-xs text-red-400 mt-1">{t.failedMessage}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className='flex justify-center items-center mb-4'>
                <div className='text-2xl border-[1px] border-gray-400 rounded-[50%] p-[10px] text-gray-400'>
                  <FaBangladeshiTakaSign/>
                </div>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-400">{t.noWithdrawalHistory}</h3>
              <p className="mt-1 text-xs text-gray-500">{t.noWithdrawalMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  FaUser, 
  FaCoins, 
  FaGift, 
  FaUsers, 
  FaClock, 
  FaEye, 
  FaEyeSlash,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaIdCard,
  FaCamera,
  FaFileUpload,
  FaSpinner,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTrash,
  FaRedoAlt
} from 'react-icons/fa';
import { MdArrowBackIosNew, MdDateRange, MdLocationOn } from "react-icons/md";
import { HiIdentification } from "react-icons/hi";
import axios from 'axios';
import { useUser } from '../../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../../context/LanguageContext';
import  toast, {Toaster } from 'react-hot-toast';

const ProfileInformation = () => {
  const { t, language } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  // State for different sections
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Profile states
  const [editableUsername, setEditableUsername] = useState(userData?.username || '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [currentLoginPassword, setCurrentLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Email verification states
  const [emailVerificationLoading, setEmailVerificationLoading] = useState(false);
  const [emailVerificationStatus, setEmailVerificationStatus] = useState({
    isVerified: false,
    hasPendingOTP: false,
    attempts: 0,
    lastSent: null
  });
  const [emailOTP, setEmailOTP] = useState(['', '', '', '', '', '']);
  const [showEmailOTPInput, setShowEmailOTPInput] = useState(false);
  const [emailOTPTimer, setEmailOTPTimer] = useState(0);
  const otpInputRefs = useRef([]);
  
  // KYC states
  const [kycStatus, setKycStatus] = useState({
    status: 'unverified',
    submittedAt: null,
    verifiedAt: null,
    rejectionReason: '',
    documents: [],
    hasNotStartedSession: false,
    hasExistingSession: false,
    verificationUrl: null
  });

  // Check if email and KYC tabs should be shown
  const showEmailAndKYCTabs = userData?.kycSubmitted === true && userData?.kycCompleted === false;

  // Format balance with language-specific digits and commas
  const formatBalance = (amount) => {
    if (amount === undefined || amount === null) return language.code === 'bn' ? '০.০০' : '0.00';
    const formatted = new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    return formatted;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US');
  };

  // Initialize email OTP timer
  useEffect(() => {
    let interval;
    if (emailOTPTimer > 0) {
      interval = setInterval(() => {
        setEmailOTPTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailOTPTimer]);

  // Fetch email verification and KYC status on component mount
  useEffect(() => {
    if (userData) {
      checkEmailVerificationStatus();
      checkKYCStatus();
      setEditableUsername(userData?.username || '');
    }
  }, [userData]);

  // Focus OTP input
  useEffect(() => {
    if (showEmailOTPInput && otpInputRefs.current[0]) {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [showEmailOTPInput]);

  // Check email verification status
  const checkEmailVerificationStatus = async () => {
    try {
      const response = await axios.get(
        `${base_url}/user/check-email-verification/${userData._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setEmailVerificationStatus({
          isVerified: response.data.data.isEmailVerified,
          hasPendingOTP: response.data.data.hasPendingOTP,
          attempts: response.data.data.attempts,
          lastSent: response.data.data.lastSentAt
        });
      }
    } catch (error) {
      console.error('Error checking email verification status:', error);
    }
  };

  // Check KYC status with enhanced logic
  const checkKYCStatus = async () => {
    try {
      const response = await axios.get(
        `${base_url}/user/kyc-status/${userData._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        const kycData = response.data.data;
        
        // Check if there are any verification sessions
        const hasVerificationSessions = kycData.kycVerifications && kycData.kycVerifications.length > 0;
        
        // Get the latest verification session if exists
        let latestVerification = null;
        let hasNotStartedSession = false;
        let hasExistingSession = false;
        let verificationUrl = null;
        
        if (hasVerificationSessions) {
          latestVerification = kycData.kycVerifications[kycData.kycVerifications.length - 1];
          verificationUrl = latestVerification.verificationUrl;
          
          // Check if the session is "Not Started" or similar status
          const notStartedStatuses = ["Not Started", "not_started", "NOT_STARTED", "created", "initiated"];
          hasNotStartedSession = notStartedStatuses.includes(latestVerification.status);
          
          // Check if there's an existing session (regardless of status)
          hasExistingSession = true;
        }

        // Determine actual KYC status - ONLY show pending if it's actually submitted for review
        // If kycStatus is "pending" but session is "Not Started", treat as "unverified"
        let actualKYCStatus = kycData.kycStatus;
        
        // IMPORTANT: If user opened link but didn't complete, show as "unverified" so they can continue
        if (kycData.kycStatus === 'pending' && hasNotStartedSession) {
          actualKYCStatus = 'unverified';
        }
        
        // Also, if kycStatus is "pending" but kycCompleted is false, treat as "unverified"
        if (kycData.kycStatus === 'pending' && kycData.kycCompleted === false) {
          actualKYCStatus = 'unverified';
        }

        setKycStatus({
          status: actualKYCStatus,
          submittedAt: kycData.lastUpdated,
          verifiedAt: kycData.kycInfo?.verifiedAt,
          rejectionReason: kycData.kycInfo?.rejectionReason,
          documents: kycData.kycDocuments || [],
          hasNotStartedSession: hasNotStartedSession,
          hasExistingSession: hasExistingSession,
          verificationUrl: verificationUrl,
          latestVerification: latestVerification
        });
      }
    } catch (error) {
      console.error('Error checking KYC status:', error);
    }
  };

  // Handle username update
  const handleUsernameUpdate = async () => {
    if (!currentLoginPassword) {
      toast.error(t.passwordRequired);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${base_url}/user/update-username`,
        {
          userId: userData._id,
          newUsername: editableUsername,
          password: currentLoginPassword
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      toast.success(t.usernameUpdateSuccess);
      setIsEditingUsername(false);
      setCurrentLoginPassword('');
      fetchUserData();

    } catch (err) {
      toast.error(err.response?.data?.message || t.usernameUpdateError);
    } finally {
      setLoading(false);
    }
  };

  // Email Verification Functions
  const sendEmailVerificationOTP = async () => {
    if (emailVerificationStatus.isVerified) {
      toast.info(t.emailAlreadyVerified);
      return;
    }

    if (emailOTPTimer > 0) {
      toast.warning(t.otpResendWait.replace('{seconds}', emailOTPTimer));
      return;
    }

    setEmailVerificationLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/user/send-email-verification-otp`,
        { userId: userData._id },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success(t.otpSentSuccess);
        setShowEmailOTPInput(true);
        setEmailOTPTimer(60); // 60 seconds cooldown
        checkEmailVerificationStatus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t.otpSendError);
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  const resendEmailVerificationOTP = async () => {
    if (emailOTPTimer > 0) {
      toast.warning(t.otpResendWait.replace('{seconds}', emailOTPTimer));
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/user/resend-email-verification-otp`,
        { userId: userData._id },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success(t.otpResentSuccess);
        setEmailOTPTimer(60);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t.otpResendError);
    } finally {
      setOtpLoading(false);
    }
  };

  // Improved OTP handling
  const handleEmailOTPChange = (index, value) => {
    // Only allow digits
    if (!/^\d?$/.test(value)) return;

    const newOTP = [...emailOTP];
    newOTP[index] = value;
    setEmailOTP(newOTP);

    // Auto focus next input if value is entered
    if (value && index < 5) {
      setTimeout(() => {
        otpInputRefs.current[index + 1]?.focus();
      }, 10);
    }
  };

  const handleEmailOTPKeyDown = (index, e) => {
    // Handle backspace - focus previous input when current is empty
    if (e.key === 'Backspace' && !emailOTP[index] && index > 0) {
      setTimeout(() => {
        otpInputRefs.current[index - 1]?.focus();
      }, 10);
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleEmailOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const otpArray = pastedData.split('').slice(0, 6);
      setEmailOTP(otpArray);
      
      // Focus last input
      setTimeout(() => {
        otpInputRefs.current[5]?.focus();
      }, 10);
    } else {
      toast.error(t.otpInvalidLength);
    }
  };

  const verifyEmailOTP = async () => {
    const otpCode = emailOTP.join('');
    if (otpCode.length !== 6) {
      toast.error(t.otpInvalidLength);
      return;
    }

    setOtpLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/user/verify-email-otp`,
        {
          userId: userData._id,
          otpCode: otpCode
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        toast.success(t.emailVerificationSuccess);
        setShowEmailOTPInput(false);
        setEmailOTP(['', '', '', '', '', '']);
        checkEmailVerificationStatus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || t.emailVerificationError);
      setEmailOTP(['', '', '', '', '', '']);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 10);
    } finally {
      setOtpLoading(false);
    }
  };

  // Function to start/continue KYC verification
  const handleKYCVerification = async () => {
    if (!emailVerificationStatus.isVerified) {
      toast.error(t.emailVerificationRequired || 'Email verification is required');
      return;
    }

    // If user has existing session with "Not Started" status, use existing URL
    if (kycStatus.hasExistingSession && kycStatus.verificationUrl && kycStatus.hasNotStartedSession) {
      continueExistingKYC();
      return;
    }

    // Otherwise start new KYC
    startNewKYC();
  };

  // Continue existing KYC session
  const continueExistingKYC = async () => {
    setLoading(true);
    try {
      if (!kycStatus.verificationUrl) {
        toast.error(t.verificationUrlMissing || 'Verification URL not found');
        setLoading(false);
        return;
      }

      toast.success(
        <div>
          <p>{t.continuingKYC || 'Continuing KYC verification...'}</p>
          <p className="text-sm">{t.redirectingToVerification || 'Redirecting to verification page...'}</p>
        </div>,
        { duration: 3000 }
      );

      // Open the existing verification URL
      setTimeout(() => {
        window.open(kycStatus.verificationUrl, '_blank', 'noopener,noreferrer');
      }, 2000);

    } catch (error) {
      console.error('Continue KYC verification error:', error);
      toast.error(t.kycContinueError || 'Failed to continue KYC verification');
    } finally {
      setLoading(false);
    }
  };

  // Start new KYC verification
  const startNewKYC = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/user/kyc/start-verification`,
        { userId: userData._id },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
    
      if (response.data) {
        const verificationUrl = response.data.data.verification_url;
        
        if (!verificationUrl) {
          toast.error(t.verificationUrlMissing || 'Verification URL not found');
          setLoading(false);
          return;
        }

        // Show success message with instructions
        toast.success(
          <div>
            <p>{t.kycStartedSuccess || 'KYC verification started!'}</p>
            <p className="text-sm">{t.redirectingToVerification || 'Redirecting to verification page...'}</p>
          </div>,
          { duration: 3000 }
        );

        // Update KYC status locally
        setKycStatus(prev => ({
          ...prev,
          status: 'unverified', // Keep as unverified until actually submitted
          submittedAt: new Date().toISOString(),
          hasNotStartedSession: true,
          hasExistingSession: true,
          verificationUrl: verificationUrl
        }));

        // Redirect to verification URL after a short delay
        setTimeout(() => {
          window.open(verificationUrl, '_blank', 'noopener,noreferrer');
        }, 2000);

      } else {
        toast.error(response.data.message || t.kycStartError || 'Failed to start KYC verification');
      }
    } catch (error) {
      console.error('Start KYC verification error:', error);
      
      let errorMessage = t.kycStartError || 'Failed to start KYC verification';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Function to resubmit KYC (for rejected cases)
  const resubmitKYC = async () => {
    if (!emailVerificationStatus.isVerified) {
      toast.error(t.emailVerificationRequired || 'Email verification is required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${base_url}/user/kyc/resubmit`,
        { userId: userData._id },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
    
      if (response.data) {
        const verificationUrl = response.data.data.verification_url;
        
        if (!verificationUrl) {
          toast.error(t.verificationUrlMissing || 'Verification URL not found');
          setLoading(false);
          return;
        }

        // Show success message with instructions
        toast.success(
          <div>
            <p>{t.kycResubmittedSuccess || 'KYC verification resubmitted successfully!'}</p>
            <p className="text-sm">{t.redirectingToVerification || 'Redirecting to verification page...'}</p>
          </div>,
          { duration: 3000 }
        );

        // Update KYC status locally - keep status as rejected until new verification is processed
        setKycStatus(prev => ({
          ...prev,
          submittedAt: new Date().toISOString(),
          hasNotStartedSession: true,
          hasExistingSession: true,
          verificationUrl: verificationUrl
        }));

        // Redirect to verification URL after a short delay
        setTimeout(() => {
          window.open(verificationUrl, '_blank', 'noopener,noreferrer');
        }, 2000);

      } else {
        toast.error(response.data.message || t.kycResubmitError || 'Failed to resubmit KYC verification');
      }
    } catch (error) {
      console.error('Resubmit KYC verification error:', error);
      
      let errorMessage = t.kycResubmitError || 'Failed to resubmit KYC verification';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen font-anek text-white">
      {/* Toast Container */}
      <Toaster 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-3 px-3 sticky top-0 z-10">
        <div className="container mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full text-cyan-500 cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <MdArrowBackIosNew/>
          </button>
          <h1 className="text-base font-bold text-gray-200">{t.profileInformationTitle || 'Profile Information'}</h1>
        </div>
      </header>

      {/* Tabs - Only show email and KYC tabs if condition is met */}
      <div className="border-b border-gray-700">
        <div className="container mx-auto px-3">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-gray-300'
              } transition-colors`}
            >
              {t.profile || 'Profile'}
            </button>
            
            {/* Only show email and KYC tabs when userData?.kycSubmitted === true && userData?.kycCompleted === false */}
            {showEmailAndKYCTabs && (
              <>
                <button
                  onClick={() => setActiveTab('email')}
                  className={`flex-1 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'email'
                      ? 'text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-gray-400 hover:text-gray-300'
                  } transition-colors`}
                >
                  {t.emailVerification || 'Email Verification'}
                </button>
                <button
                  onClick={() => setActiveTab('kyc')}
                  className={`flex-1 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'kyc'
                      ? 'text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-gray-400 hover:text-gray-300'
                  } transition-colors`}
                >
                  {t.kyc || 'KYC'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-3 py-4">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Main Balance */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 p-4 rounded-lg border border-blue-700 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-200">{t.mainBalance || 'Main Balance'}</p>
                    <p className="text-xl font-bold">{formatBalance(userData?.balance)} ৳</p>
                  </div>
                  <div className="bg-blue-700 bg-opacity-30 p-2 rounded-full">
                    <FaCoins className="text-blue-300" />
                  </div>
                </div>
              </div>

              {/* Bonus Balance */}
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 p-4 rounded-lg border border-purple-700 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-200">{t.bonusBalance || 'Bonus Balance'}</p>
                    <p className="text-xl font-bold">{formatBalance(userData?.bonusBalance)} ৳</p>
                  </div>
                  <div className="bg-purple-700 bg-opacity-30 p-2 rounded-full">
                    <FaGift className="text-purple-300" />
                  </div>
                </div>
              </div>

              {/* Referral Balance */}
              <div className="bg-gradient-to-br from-green-900 to-green-800 p-4 rounded-lg border border-green-700 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-200">{t.referralBalance || 'Referral Balance'}</p>
                    <p className="text-xl font-bold">{formatBalance(userData?.referralEarnings)} ৳</p>
                  </div>
                  <div className="bg-green-700 bg-opacity-30 p-2 rounded-full">
                    <FaUsers className="text-green-300" />
                  </div>
                </div>
              </div>

              {/* Wager Remaining */}
              <div className="bg-gradient-to-br from-amber-900 to-amber-800 p-4 rounded-lg border border-amber-700 shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-amber-200">{t.wagerRemaining || 'Wager Remaining'}</p>
                    <p className="text-xl font-bold">{formatBalance(userData?.wager_remaining || 0)} ৳</p>
                  </div>
                  <div className="bg-amber-700 bg-opacity-30 p-2 rounded-full">
                    <FaClock className="text-amber-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow mb-6 border border-gray-600">
              <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2 mb-4">
                <FaUser className="text-sm" />
                {t.personalInformation || 'Personal Information'}
              </h3>
              
              <div className="space-y-4">
                {/* Player ID */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t.playerId || 'Player ID'}</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm cursor-not-allowed"
                    value={userData?.player_id || t.na || 'N/A'}
                    readOnly
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t.email || 'Email'}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="flex-1 p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm cursor-not-allowed"
                      value={userData?.email || t.na || 'N/A'}
                      readOnly
                    />
                    {emailVerificationStatus.isVerified ? (
                      <span className="bg-green-500 text-white px-2 py-2.5 rounded text-xs flex items-center gap-1">
                        <FaCheckCircle /> {t.verified || 'Verified'}
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white px-2 py-2.5 rounded text-xs flex items-center gap-1">
                        <FaTimesCircle /> {t.unverified || 'Unverified'}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Username */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">{t.username || 'Username'}</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className={`flex-1 p-2 border rounded text-sm ${
                        isEditingUsername 
                          ? 'border-cyan-400 bg-gray-800 text-white' 
                          : 'border-gray-600 bg-gray-800 text-white cursor-not-allowed'
                      }`}
                      value={editableUsername}
                      onChange={(e) => setEditableUsername(e.target.value)}
                      readOnly={!isEditingUsername}
                    />
                    {isEditingUsername ? (
                      <>
                        <button
                          onClick={handleUsernameUpdate}
                          disabled={loading}
                          className="bg-green-500 hover:bg-green-600 cursor-pointer text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                        >
                          {loading ? <FaSpinner className="animate-spin" /> : t.save || 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingUsername(false);
                            setEditableUsername(userData?.username || '');
                            setCurrentLoginPassword('');
                          }}
                          className="bg-red-500 hover:bg-red-600 cursor-pointer text-white px-3 py-1 rounded text-sm"
                        >
                          {t.cancel || 'Cancel'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditingUsername(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer text-white px-3 py-1 rounded text-sm"
                      >
                        {t.edit || 'Edit'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Password verification when editing username */}
                {isEditingUsername && (
                  <div className="mt-2">
                    <label className="block text-sm text-gray-400 mb-1">{t.currentPassword || 'Current Password'}</label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                        value={currentLoginPassword}
                        onChange={(e) => setCurrentLoginPassword(e.target.value)}
                        placeholder={t.passwordPlaceholder || 'Enter your password'}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t.passwordRequired || 'Password is required to update username'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Email Tab Content - Only render if condition is met */}
        {activeTab === 'email' && showEmailAndKYCTabs && (
          <div className="space-y-6">
            {/* Email Verification Status */}
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaEnvelope className="text-cyan-400" />
                  <h3 className="text-lg font-semibold text-white">{t.emailVerification || 'Email Verification'}</h3>
                </div>
                
                <div className={`px-3 py-1 rounded text-sm font-semibold ${
                  emailVerificationStatus.isVerified 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {emailVerificationStatus.isVerified ? t.verified || 'Verified' : t.unverified || 'Unverified'}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300">{userData?.email}</p>
                    <p className="text-sm text-gray-500">
                      {emailVerificationStatus.isVerified 
                        ? (t.emailVerifiedOn || 'Verified on {date}').replace('{date}', formatDate(emailVerificationStatus.verifiedAt))
                        : t.emailNotVerified || 'Email not verified'}
                    </p>
                  </div>
                  
                  {!emailVerificationStatus.isVerified && (
                    <div className="text-right">
                      <button
                        onClick={sendEmailVerificationOTP}
                        disabled={emailVerificationLoading || emailOTPTimer > 0}
                        className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {emailVerificationLoading ? (
                          <FaSpinner className="animate-spin" />
                        ) : emailOTPTimer > 0 ? (
                          `${t.resendIn || 'Resend in'} ${emailOTPTimer}s`
                        ) : (
                          t.sendVerificationOTP || 'Send Verification OTP'
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {t.otpWillExpire || 'OTP will expire in 10 minutes'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Improved OTP Input Section */}
                {showEmailOTPInput && !emailVerificationStatus.isVerified && (
                  <div className="bg-gray-800 p-4 rounded-lg border border-cyan-800">
                    <h4 className="text-cyan-300 font-medium mb-3">{t.enterVerificationOTP || 'Enter Verification OTP'}</h4>
                    
                    <div className="flex justify-center gap-2 mb-4">
                      {emailOTP.map((digit, index) => (
                        <input
                          key={index}
                          ref={el => otpInputRefs.current[index] = el}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) => handleEmailOTPChange(index, e.target.value)}
                          onKeyDown={(e) => handleEmailOTPKeyDown(index, e)}
                          onPaste={index === 0 ? handleEmailOTPPaste : undefined}
                          className="w-12 h-12 text-center text-xl font-bold bg-gray-900 border-2 border-cyan-500 rounded-lg focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                        />
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={verifyEmailOTP}
                        disabled={otpLoading || emailOTP.join('').length !== 6}
                        className="flex-1 bg-green-500 hover:bg-green-600 cursor-pointer text-white py-2 rounded font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                      >
                        {otpLoading ? <FaSpinner className="animate-spin" /> : t.verifyOTP || 'Verify OTP'}
                      </button>
                      
                      <button
                        onClick={resendEmailVerificationOTP}
                        disabled={emailOTPTimer > 0 || otpLoading}
                        className="bg-amber-500 hover:bg-amber-600 cursor-pointer text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 transition-colors"
                      >
                        {emailOTPTimer > 0 ? `${t.resendIn || 'Resend in'} ${emailOTPTimer}s` : t.resendOTP || 'Resend OTP'}
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      <FaInfoCircle className="inline mr-1" />
                      {t.otpInstructions || 'Enter the 6-digit OTP sent to your email'}
                    </p>
                  </div>
                )}

                {/* Benefits of Email Verification */}
                <div className="bg-blue-900 bg-opacity-30 p-4 rounded-lg">
                  <h4 className="text-blue-300 font-medium mb-2">{t.verificationBenefits || 'Verification Benefits'}</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>✓ {t.secureAccount || 'Secure your account'}</li>
                    <li>✓ {t.fasterWithdrawals || 'Faster withdrawals'}</li>
                    <li>✓ {t.prioritySupport || 'Priority support'}</li>
                    <li>✓ {t.kycEligibility || 'KYC eligibility'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* KYC Tab Content - Only render if condition is met */}
        {activeTab === 'kyc' && showEmailAndKYCTabs && (
          <div className="space-y-6">
            {/* KYC Status */}
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HiIdentification className="text-cyan-400 text-xl" />
                  <h3 className="text-lg font-semibold text-white">{t.kycVerification || 'KYC Verification'}</h3>
                </div>
                
                <div className={`px-3 py-1 rounded text-sm font-semibold ${
                  kycStatus.status === 'verified' ? 'bg-green-500' :
                  kycStatus.status === 'pending' ? 'bg-yellow-500' :
                  kycStatus.status === 'rejected' ? 'bg-red-500' :
                  'bg-gray-500'
                } text-white`}>
                  {kycStatus.status.charAt(0).toUpperCase() + kycStatus.status.slice(1)}
                </div>
              </div>

              {/* KYC Status Details */}
              {kycStatus.status === 'verified' && (
                <div className="bg-green-900 bg-opacity-30 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-green-300 mb-2">
                    <FaCheckCircle />
                    <span className="font-medium">{t.kycVerified || 'KYC Verified'}</span>
                  </div>
                  <p className="text-sm text-green-200">
                    {(t.kycVerifiedOn || 'Verified on {date}').replace('{date}', formatDate(kycStatus.verifiedAt))}
                  </p>
                </div>
              )}

              {kycStatus.status === 'rejected' && (
                <div className="bg-red-900 bg-opacity-30 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-red-300 mb-2">
                    <FaTimesCircle />
                    <span className="font-medium">{t.kycRejected || 'KYC Rejected'}</span>
                  </div>
                  <p className="text-sm text-red-200">
                    {t.rejectionReason || 'Reason'}: {kycStatus.rejectionReason}
                  </p>
                  <p className="text-xs text-red-300 mt-1">
                    {t.resubmitKYCInstruction || 'Please update your information and resubmit'}
                  </p>
                </div>
              )}

              {/* IMPORTANT: Only show pending status if KYC is actually submitted for review */}
              {/* Check if kycCompleted is true or session status is "submitted", "in_review", etc. */}
              {kycStatus.status === 'pending' && userData?.kycCompleted === true && (
                <div className="bg-yellow-900 bg-opacity-30 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-yellow-300 mb-2">
                    <FaSpinner className="animate-spin" />
                    <span className="font-medium">{t.kycUnderReview || 'KYC Under Review'}</span>
                  </div>
                  <p className="text-sm text-yellow-200">
                    {(t.kycSubmittedOn || 'Submitted on {date}').replace('{date}', formatDate(kycStatus.submittedAt))}
                  </p>
                  <p className="text-xs text-yellow-300 mt-1">
                    {t.kycReviewTime || 'Review may take 24-48 hours'}
                  </p>
                  <div className="mt-4 p-4 bg-yellow-800 bg-opacity-20 rounded-lg border border-yellow-700">
                    <div className="flex items-start gap-3">
                      <FaInfoCircle className="text-yellow-300 text-xl mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-yellow-200 font-medium mb-2">{t.kycPendingTitle || 'KYC Submission Complete'}</h4>
                        <p className="text-sm text-yellow-100">
                          {t.kycPendingMessage || 'Your KYC verification is currently under review. Please wait for the verification process to complete.'}
                        </p>
                        <div className="mt-3 text-xs text-yellow-300">
                          <p>✓ {t.documentReceived || 'Verification in progress'}</p>
                          <p>✓ {t.applicationInQueue || 'Application in queue'}</p>
                          <p>✓ {t.statusWillUpdate || 'Status will update automatically'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show message if user has existing session but didn't complete it */}
              {kycStatus.hasExistingSession && kycStatus.hasNotStartedSession && (
                <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg mb-4">
                  <div className="flex items-center gap-2 text-blue-300 mb-2">
                    <FaInfoCircle />
                    <span className="font-medium">{t.kycSessionIncomplete || 'KYC Session Not Completed'}</span>
                  </div>
                  <p className="text-sm text-blue-200">
                    {t.kycSessionIncompleteDesc || 'You have started a KYC verification but did not complete it. Click the button below to continue.'}
                  </p>
                  {kycStatus.latestVerification?.createdAt && (
                    <p className="text-xs text-blue-300 mt-1">
                      {t.sessionCreated || 'Session created'}: {formatDate(kycStatus.latestVerification.createdAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Show KYC action buttons */}
              {emailVerificationStatus.isVerified && (
                <div className="mt-6">
                  {/* Scenario 1: KYC is unverified OR has incomplete session */}
                  {(kycStatus.status === 'unverified' || 
                    (kycStatus.status === 'pending' && kycStatus.hasNotStartedSession) ||
                    kycStatus.hasNotStartedSession) && (
                    <div className="text-center">
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-cyan-400 mb-2">
                          {kycStatus.hasExistingSession && kycStatus.hasNotStartedSession
                            ? (t.continueKYCVerification || 'Continue KYC Verification')
                            : (t.startKYCVerification || 'Start KYC Verification')
                          }
                        </h4>
                        <p className="text-gray-300 mb-4">
                          {kycStatus.hasExistingSession && kycStatus.hasNotStartedSession
                            ? (t.continueKYCDescription || 'Click below to continue your KYC verification from where you left off.')
                            : (t.kycVerificationDescription || 'Click below to start your KYC verification process with our secure partner')
                          }
                        </p>
                      </div>
                      
                      <button
                        onClick={handleKYCVerification}
                        disabled={loading}
                        className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 cursor-pointer text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/20"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            {kycStatus.hasExistingSession && kycStatus.hasNotStartedSession
                              ? (t.continuingKYC || 'Continuing KYC...')
                              : (t.startingKYC || 'Starting KYC...')
                            }
                          </>
                        ) : (
                          <>
                            <HiIdentification />
                            {kycStatus.hasExistingSession && kycStatus.hasNotStartedSession
                              ? (t.continueKYC || 'Continue KYC')
                              : (t.completeKYC || 'Complete KYC')
                            }
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Scenario 2: KYC was rejected - show resubmit button */}
                  {kycStatus.status === 'rejected' && (
                    <div className="text-center">
                      <button
                        onClick={resubmitKYC}
                        disabled={loading}
                        className="w-full max-w-md mx-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 cursor-pointer text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-orange-500/20"
                      >
                        {loading ? (
                          <>
                            <FaSpinner className="animate-spin" />
                            {t.resubmittingKYC || 'Resubmitting KYC...'}
                          </>
                        ) : (
                          <>
                            <FaRedoAlt />
                            {t.resubmitKYC || 'Resubmit KYC'}
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-400 mt-2">
                        {t.kycResubmitNote || 'You can resubmit your KYC application with corrected information'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Show message if email is not verified */}
              {!emailVerificationStatus.isVerified && (
                <div className="mt-6">
                  <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-red-300 mb-2">
                      <FaExclamationTriangle />
                      <span className="font-medium">{t.emailVerificationRequired || 'Email Verification Required'}</span>
                    </div>
                    <p className="text-sm text-red-200 mb-3">
                      {t.verifyEmailBeforeKYC || 'You need to verify your email address before starting KYC verification'}
                    </p>
                    <button
                      onClick={() => setActiveTab('email')}
                      className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      {t.verifyEmailNow || 'Verify Email Now'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInformation;
import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaInfoCircle,
  FaExclamationTriangle,
  FaRedoAlt,
  FaEnvelope,
  FaShieldAlt,
  FaGift,
  FaBalanceScale,
  FaBell,
  FaLock,
} from 'react-icons/fa';
import { HiIdentification } from 'react-icons/hi';
import { MdOutlineClose } from 'react-icons/md';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
import toast, { Toaster } from 'react-hot-toast';

const KYCPage = () => {
  const { t, language } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const navigate = useNavigate();
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
          style={{ border: '2px solid #e9d5ff' }}
        >
          {/* Close */}
          <button
            onClick={() => {
              setShowEmailOTPInput(false);
              setEmailOTP(['', '', '', '', '', '']);
            }}
            className="absolute top-4 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <MdOutlineClose className="text-xl" />
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
                className="w-11 h-14 text-center text-2xl font-bold bg-cyan-400 text-white rounded-2xl border-none outline-none focus:ring-2 focus:ring-cyan-300 transition-all shadow-sm"
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
            className="w-full bg-cyan-400 hover:bg-cyan-500 disabled:bg-cyan-200 text-white py-3.5 rounded-full font-bold text-base cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {otpLoading ? <><FaSpinner className="animate-spin" /> Verifying...</> : 'Verify'}
          </button>

          <div className="flex items-center justify-center gap-1 mt-4">
            <p className="text-xs text-gray-400">Didn't receive the code?</p>
            <button
              onClick={resendEmailVerificationOTP}
              disabled={emailOTPTimer > 0 || otpLoading}
              className="text-xs font-bold text-cyan-500 hover:text-cyan-600 disabled:text-gray-300 cursor-pointer disabled:cursor-not-allowed transition-colors"
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
            onClick={() => navigate(-1)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <MdOutlineClose className="text-xl" />
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
    <div className="min-h-screen bg-[#D9F1F6] flex justify-center items-center font-anek p-[10px]">
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: 10, fontSize: 14 } }} />

      <div className="bg-[#F8F6F6] h-[96vh] w-full rounded-[20px] overflow-y-auto">

        {/* Close button */}
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full  text-gray-500 hover:text-gray-800  transition-colors cursor-pointer"
          >
            <MdOutlineClose className="text-lg" />
          </button>
        </div>

        <div className="px-4 pt-3 max-w-lg mx-auto">

          {/* ── Tab Switcher ── */}
          <div className="rounded-full p-1 flex mb-5 gap-2">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2.5 rounded-[10px] text-[15px] font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-theme_color2 text-white shadow-md shadow-cyan-200'
                  : 'text-gray-500 hover:text-gray-700 bg-gray-200'
              }`}
            >
              Email Verify
            </button>
            <button
              onClick={() => setActiveTab('kyc')}
              className={`flex-1 py-2.5 rounded-[10px] text-[15px] font-medium transition-all duration-200 cursor-pointer ${
                activeTab === 'kyc'
                  ? 'bg-theme_color2 text-white shadow-md shadow-cyan-200'
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
                      className="bg-theme_color2 disabled:bg-cyan-200 text-white text-sm font-bold px-4 py-2.5 rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
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
                      className="text-cyan-500 font-bold underline cursor-pointer"
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
                        <HiIdentification className="text-cyan-400 text-xl" />
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
                        <div className="w-14 h-14 bg-gradient-to-br from-cyan-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <HiIdentification className="text-2xl text-cyan-500" />
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
                        className="w-full bg-theme_color2 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-100"
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

export default KYCPage;
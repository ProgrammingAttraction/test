import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  SparklesIcon,
  FingerPrintIcon,
  GlobeAltIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const KYCcallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(true);
  const [verificationData, setVerificationData] = useState(null);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    const processCallback = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get('verificationSessionId');
        const status = queryParams.get('status');
        
        console.log('Callback URL params:', { sessionId, status });

        if (!sessionId) {
          setError('No verification session ID found');
          setLoading(false);
          setProcessing(false);
          return;
        }

        setVerificationData({
          sessionId,
          status,
          timestamp: new Date().toISOString()
        });

        const storedUser = localStorage.getItem('user');
        let userId = null;
        
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userId = parsedUser._id || parsedUser.id;
            setUserData(parsedUser);
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        }

        // Use axios for API calls
        const api = axios.create({
          baseURL: base_url || 'https://admin2.genzz.casino',
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Send callback data to backend
        const response = await api.post('/user/didit-callback', {
          session_id: sessionId,
          status: status,
          webhook_type: 'redirect_callback',
          vendor_data: userId || null
        });

        console.log('Backend callback response:', response.data);

        // Fetch detailed session information
        if (userId) {
          try {
            const token = localStorage.getItem('token');
            const sessionResponse = await api.get(`/user/kyc/session-status/${sessionId}`, {
              params: { userId },
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (sessionResponse.data.success) {
              setSessionDetails(sessionResponse.data.data);
            }
          } catch (sessionError) {
            console.error('Error fetching session details:', sessionError);
          }
        }

        // Update user data in localStorage
        if (storedUser && (status === 'Approved' || status === 'Declined')) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.kycStatus = status === 'Approved' ? 'verified' : 'rejected';
          localStorage.setItem('user', JSON.stringify(parsedUser));
          setUserData(parsedUser);
        }

        setProcessing(false);
        
        // Countdown for redirect
        if (status === 'Approved') {
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                navigate('/profile', { 
                  state: { 
                    kycSuccess: true,
                    message: 'KYC verification completed successfully!' 
                  } 
                });
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          return () => clearInterval(timer);
        }

      } catch (err) {
        console.error('Callback processing error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to process verification callback');
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [location, navigate, base_url]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.6,
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const logoVariants = {
    initial: { scale: 0.8, opacity: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      opacity: 1, 
      rotate: 0,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 20,
        duration: 0.8
      }
    },
    hover: { 
      scale: 1.1,
      rotate: 360,
      transition: { duration: 0.5 }
    }
  };

  const glowVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Get status icon and styles
  const getStatusDisplay = () => {
    const status = verificationData?.status;
    
    switch(status) {
      case 'Approved':
        return {
          icon: <CheckCircleIcon className="w-24 h-24 text-green-400" />,
          title: 'Verification Approved!',
          message: 'Your identity has been successfully verified.',
          gradient: 'from-green-500 to-emerald-500',
          bgGradient: 'from-green-900/30 to-emerald-900/30',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          iconBg: 'bg-green-500/20',
          glowColor: 'rgba(34, 197, 94, 0.3)'
        };
      case 'Declined':
        return {
          icon: <XCircleIcon className="w-24 h-24 text-red-400" />,
          title: 'Verification Declined',
          message: 'We could not verify your identity. Please try again.',
          gradient: 'from-red-500 to-pink-500',
          bgGradient: 'from-red-900/30 to-pink-900/30',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          iconBg: 'bg-red-500/20',
          glowColor: 'rgba(239, 68, 68, 0.3)'
        };
      case 'In Review':
        return {
          icon: <ClockIcon className="w-24 h-24 text-yellow-400" />,
          title: 'Verification In Progress',
          message: 'Your documents are being reviewed. This may take a few minutes.',
          gradient: 'from-yellow-500 to-orange-500',
          bgGradient: 'from-yellow-900/30 to-orange-900/30',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          iconBg: 'bg-yellow-500/20',
          glowColor: 'rgba(234, 179, 8, 0.3)'
        };
      default:
        return {
          icon: <DocumentCheckIcon className="w-24 h-24 text-blue-400" />,
          title: 'Processing Verification',
          message: 'Please wait while we process your verification...',
          gradient: 'from-blue-500 to-purple-500',
          bgGradient: 'from-blue-900/30 to-purple-900/30',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          iconBg: 'bg-blue-500/20',
          glowColor: 'rgba(59, 130, 246, 0.3)'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#101828] flex items-center justify-center p-4 relative overflow-hidden"
      >
        {/* Animated background */}
        <motion.div 
          variants={glowVariants}
          animate="animate"
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-indigo-500/10 blur-3xl"
        />
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative bg-gray-800/40 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
        >
          <motion.div 
            variants={logoVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-xl"
                variants={glowVariants}
                animate="animate"
              />
              <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-5 rounded-full">
                <FingerPrintIcon className="w-16 h-16 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-white mb-2 text-center">
            Processing Your Verification
          </motion.h2>
          <motion.p variants={itemVariants} className="text-gray-300 text-center mb-8">
            Please wait while we securely process your KYC information...
          </motion.p>
          
          <motion.div variants={itemVariants} className="space-y-4">
            {[
              { label: 'Verification Check', progress: 75 },
              { label: 'Document Validation', progress: 60 },
              { label: 'Identity Confirmation', progress: 45 },
              { label: 'Security Screening', progress: 30 }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between text-gray-300 text-sm mb-1">
                  <span>{item.label}</span>
                  <span className="text-blue-400">{item.progress}%</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1.5, delay: index * 0.2 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-8 flex justify-center"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#101828] font-anek flex items-center justify-center p-4"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative bg-gray-800/40 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full border border-gray-700 shadow-2xl"
        >
          <motion.div 
            variants={itemVariants}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 0.5 }}
              className="flex justify-center mb-4"
            >
              <div className="bg-red-500/20 p-4 rounded-full">
                <XCircleIcon className="w-20 h-20 text-red-400" />
              </div>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Verification Error</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/profile')}
                className="w-full bg-gradient-to-r cursor-pointer from-blue-500 to-cyan-500 hover:from-theme_color2 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
              >
                Go to Profile
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen font-anek bg-[#101828] flex items-center justify-center p-4 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <motion.div 
        className="absolute inset-0"
        animate={{ 
          background: [
            'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)'
          ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating orbs */}
      <motion.div 
        className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
        animate={{ 
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
        animate={{ 
          x: [0, -50, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`relative bg-gray-800/30 backdrop-blur-2xl rounded-3xl p-8 max-w-2xl w-full border ${statusDisplay.borderColor} shadow-2xl`}
        style={{
          boxShadow: `0 0 50px ${statusDisplay.glowColor}`
        }}
      >
        {/* Animated logo in corner */}
        {/* <motion.div 
          className="absolute -top-4 -right-4 w-16 h-16"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
        >
          <div className="relative">
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-full">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
          </div>
        </motion.div> */}

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
      <motion.div 
  className={`flex justify-center mb-4 ${statusDisplay.iconBg} p-4 rounded-full inline-block mx-auto relative`} // Changed p-5 to p-4
  whileHover={{ scale: 1.1 }}
  transition={{ type: "spring", stiffness: 300 }}
>
  <motion.div 
    className="absolute inset-0 rounded-full"
    animate={{ 
      boxShadow: [
        `0 0 0px ${statusDisplay.glowColor}`,
        `0 0 30px ${statusDisplay.glowColor}`,
        `0 0 0px ${statusDisplay.glowColor}`
      ]
    }}
    transition={{ duration: 2, repeat: Infinity }}
  />
  {statusDisplay.icon}
</motion.div>
          
          <motion.h1 className={`text-2xl font-bold bg-gradient-to-r ${statusDisplay.gradient} bg-clip-text text-transparent mb-2`}>
            {statusDisplay.title}
          </motion.h1>
          <motion.p className="text-gray-300">
            {statusDisplay.message}
          </motion.p>
        </motion.div>

        {/* Animated progress line for approved */}
        {verificationData?.status === 'Approved' && (
          <motion.div 
            variants={itemVariants}
            className="mb-6"
          >
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${(countdown / 5) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {/* Session Information */}
        {verificationData && (
          <motion.div 
            variants={itemVariants}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <DocumentCheckIcon className="w-5 h-5 mr-2 text-blue-400" />
              Verification Session Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Session ID:</span>
                <span className="font-mono text-gray-200">{verificationData.sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`font-semibold ${
                  verificationData.status === 'Approved' ? 'text-green-400' :
                  verificationData.status === 'Declined' ? 'text-red-400' :
                  'text-yellow-400'
                }`}>
                  {verificationData.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Processed at:</span>
                <span className="text-gray-200">
                  {new Date(verificationData.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Session Details from API */}
        {sessionDetails && (
          <motion.div 
            variants={itemVariants}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <ShieldCheckIcon className="w-5 h-5 mr-2 text-blue-400" />
              Verification Details
            </h3>
            
            <div className="space-y-4">
              {/* ID Verification */}
              {sessionDetails.id_verifications && sessionDetails.id_verifications.length > 0 && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="p-4 bg-blue-900/30 rounded-lg border border-blue-500/30"
                >
                  <h4 className="font-medium text-blue-300 mb-3 flex items-center">
                    <IdentificationIcon className="w-4 h-4 mr-2" />
                    ID Verification
                  </h4>
                  {sessionDetails.id_verifications.map((verification, idx) => (
                    <div key={idx} className="text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Document:</span>
                        <span className="text-white">{verification.document_type}</span>
                      </div>
                      {verification.full_name && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Name:</span>
                          <span className="text-white">{verification.full_name}</span>
                        </div>
                      )}
                      {verification.date_of_birth && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">DOB:</span>
                          <span className="text-white">{verification.date_of_birth}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Liveness Check */}
              {sessionDetails.liveness_checks && sessionDetails.liveness_checks.length > 0 && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 bg-green-900/30 rounded-lg border border-green-500/30"
                >
                  <h4 className="font-medium text-green-300 mb-3 flex items-center">
                    <FingerPrintIcon className="w-4 h-4 mr-2" />
                    Liveness Check
                  </h4>
                  {sessionDetails.liveness_checks.map((check, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Score:</span>
                        <span className="text-white">{check.score}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Method:</span>
                        <span className="text-white">{check.method}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* AML Screening */}
              {sessionDetails.aml_screenings && sessionDetails.aml_screenings.length > 0 && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-yellow-900/30 rounded-lg border border-yellow-500/30"
                >
                  <h4 className="font-medium text-yellow-300 mb-3 flex items-center">
                    <GlobeAltIcon className="w-4 h-4 mr-2" />
                    AML Screening
                  </h4>
                  {sessionDetails.aml_screenings.map((aml, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-white">{aml.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Hits:</span>
                        <span className="text-white">{aml.total_hits}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* User Information */}
        {userData && (
          <motion.div 
            variants={itemVariants}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700/50"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-blue-400" />
              Account Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Username</p>
                  <p className="text-white font-medium">{userData.username || userData.name}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                  <EnvelopeIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Email</p>
                  <p className="text-white">{userData.email}</p>
                </div>
              </div>
              
              {userData.phone && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-full flex items-center justify-center">
                    <PhoneIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Phone</p>
                    <p className="text-white">{userData.phone}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">KYC Status:</span>
                  <motion.span 
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      userData.kycStatus === 'verified' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      userData.kycStatus === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    }`}
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {userData.kycStatus || 'pending'}
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Processing State */}
        {processing && (
          <motion.div 
            variants={itemVariants}
            className="bg-blue-900/30 rounded-xl p-4 mb-6 flex items-center space-x-3 border border-blue-500/30"
          >
            <ArrowPathIcon className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-blue-300 text-sm">
              Updating your account information...
            </span>
          </motion.div>
        )}

        {/* Action Buttons - All changed to blue theme */}
        <motion.div variants={itemVariants} className="space-y-3">
          {verificationData?.status === 'Approved' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-900/30 rounded-xl p-4 text-center border border-green-500/30"
            >
              <p className="text-green-300 text-sm mb-2">
                Redirecting to profile in {countdown} seconds...
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  initial={{ width: '100%' }}
                  animate={{ width: `${(countdown / 5) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/profile')}
            className={`w-full ${
              verificationData?.status === 'Approved'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-theme_color2 hover:to-cyan-600 shadow-lg shadow-blue-500/25'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-theme_color2 hover:to-cyan-600 shadow-lg shadow-blue-500/25'
            } text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300`}
          >
            Go to Profile
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-theme_color2 hover:to-cyan-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25"
          >
            Return to Home
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div 
          variants={itemVariants}
          className="text-center mt-6"
        >
          <p className="text-gray-500 text-xs">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@genzz.casino" className="text-blue-400 hover:text-blue-300 transition-colors">
              support@genzz.casino
            </a>
          </p>
          <motion.div 
            className="flex justify-center space-x-2 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <ShieldCheckIcon className="w-4 h-4 text-gray-600" />
            <span className="text-gray-600 text-xs">Secured by Didit Verification</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default KYCcallback;
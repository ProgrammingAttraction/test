import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from "react-icons/md";
import { TiWarningOutline } from "react-icons/ti";
import { useUser } from "../../context/UserContext";
import { LanguageContext } from '../../context/LanguageContext';

const Deposit = () => {
  const { t, language } = useContext(LanguageContext);
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('bkash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userData, loading, error, fetchUserData } = useUser();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const amounts = [300, 500, 700, 1000, 3000, 5000, 10000, 20000, 25000, 30000];
  const [availableBonuses, setAvailableBonuses] = useState([]);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user has mobile number
  const hasMobileNumber = userData?.phone;

  // Calculate account age and remaining bonus time
  const accountAgeInDays = userData?.createdAt 
    ? Math.floor((new Date() - new Date(userData.createdAt)) / (1000 * 60 * 60 * 24))
    : 0;
  const bonusEndTime = userData?.createdAt 
    ? new Date(new Date(userData.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000)
    : new Date();

  // State for countdown timer
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Format number based on language
  const formatNumber = (number) => {
    if (number === undefined || number === null) return language.code === 'bn' ? '০' : '0';
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US').format(number);
  };

  // Update countdown every second
  useEffect(() => {
    const updateCountdown = () => {
      const timeRemainingMs = bonusEndTime - new Date();
      if (timeRemainingMs <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemainingMs % (1000 * 60)) / 1000);
      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown(); // Initial call
    const intervalId = setInterval(updateCountdown, 1000); // Update every second

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [bonusEndTime]);

  // Check if user is eligible for bonuses
  const isNewUser = accountAgeInDays < 3;
  const firstDepositBonusAvailable = isNewUser && userData?.bonusInfo?.firstDepositBonusClaimed === false;
  const depositBonusAvailable = isNewUser && (userData?.total_deposit === 0 || 
    (userData?.bonusInfo?.activeBonuses?.length === 0));

  // Check if any bonus is available and no bonus has been claimed
  const showBonusSection = (firstDepositBonusAvailable || depositBonusAvailable) && 
    !userData?.bonusInfo?.firstDepositBonusClaimed && 
    (!userData?.bonusInfo?.activeBonuses || userData.bonusInfo.activeBonuses.length === 0);

  const handleDeposit = async () => {
    // Reset messages
    setErrorMessage('');
    setSuccessMessage('');

    // Validate inputs
    if (!amount) {
      setErrorMessage(t.enterAmountError);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      setErrorMessage(t.invalidAmountError);
      return;
    }

    if (amountNum < 300) {
      setErrorMessage(t.minimumDepositError);
      return;
    }

    if (amountNum > 30000) {
      setErrorMessage(t.maximumDepositError);
      return;
    }

    if (!userData?.phone) {
      setErrorMessage(t.addMobileNumberError);
      return;
    }

    if (!/^\d+$/.test(amount)) {
      setErrorMessage(t.numericAmountError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Extract required data from selected bonus
      let bonusData = {
        bonusType: 'none',
        bonusId: null,
        bonusCode: null,
        bonusAmount: 0,
        bonusName: null,
        bonusPercentage: 0,
        bonusMaxAmount: 0,
        wageringRequirement: 0,
        balanceType: 'main_balance', // Default balance type
        waigergamecategory: [],
        gameCategory: null
      };

      // If a bonus is selected from dynamic bonuses
      if (selectedBonus && selectedBonus !== 'none') {
        const calculatedAmount = calculateBonusAmount(selectedBonus);
        bonusData = {
          bonusType: selectedBonus.type || selectedBonus.bonusType || 'custom',
          bonusId: selectedBonus._id || selectedBonus.id,
          bonusCode: selectedBonus.bonusCode || selectedBonus.code,
          bonusAmount: calculatedAmount,
          bonusName: selectedBonus.name || selectedBonus.title,
          bonusPercentage: selectedBonus.percentage || 0,
          bonusMaxAmount: selectedBonus.maxBonus || 0,
          wageringRequirement: selectedBonus.wageringRequirement || 0,
          balanceType: selectedBonus.balanceType || 'bonus_balance',
          waigergamecategory: selectedBonus.waigergamecategory || 
                            selectedBonus.gamesCategory || 
                            selectedBonus.gameCategories || 
                            [],
          gameCategory: selectedBonus.gameCategory || null
        };
        
        // Validate minimum deposit for the selected bonus
        if (selectedBonus.minDeposit && amountNum < selectedBonus.minDeposit) {
          setErrorMessage(`Minimum deposit for this bonus is ${selectedBonus.minDeposit} BDT`);
          setIsSubmitting(false);
          return;
        }
      }

      // Get token for authorization header
      const token = localStorage.getItem("token");

      // Prepare request payload according to backend requirements
      const payload = {
        method: selectedMethod || 'bkash',
        amount: amountNum,
        bonusType: bonusData.bonusType,
        bonusId: bonusData.bonusId,
        bonusCode: bonusData.bonusCode,
        bonusAmount: bonusData.bonusAmount,
        bonusName: bonusData.bonusName,
        bonusPercentage: bonusData.bonusPercentage,
        bonusMaxAmount: bonusData.bonusMaxAmount,
        wageringRequirement: bonusData.wageringRequirement,
        balanceType: bonusData.balanceType,
        userid: userData._id,
        playerbalance: userData.balance || 0,
        waigergamecategory: bonusData.waigergamecategory,
        gameCategory: bonusData.gameCategory
      };
    console.log(payload)
      // First create pending deposit record
      const initiateResponse = await axios.post(`${base_url}/user/initiate`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (initiateResponse.data.success && initiateResponse.data.redirectUrl) {
        setSuccessMessage(t.paymentInitiatedSuccess);
        
        // Save deposit details to localStorage for reference
        localStorage.setItem('lastDeposit', JSON.stringify({
          amount: amountNum,
          bonus: bonusData,
          waigergamecategory: bonusData.waigergamecategory,
          gameCategory: bonusData.gameCategory,
          transactionId: initiateResponse.data.transactionId,
          paymentId: initiateResponse.data.paymentId,
          timestamp: new Date().toISOString()
        }));
        
        // Redirect to payment gateway
        window.location.href = initiateResponse.data.redirectUrl;
      } else {
        setErrorMessage(initiateResponse.data.message || t.paymentInitiateError);
      }
    } catch (error) {
      console.error(t.depositError, error);
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 400) {
          setErrorMessage(error.response.data.message || t.paymentFailedError);
        } else if (error.response.status === 401) {
          setErrorMessage(t.sessionExpiredError || "Session expired. Please login again.");
          // Optionally redirect to login
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setErrorMessage(error.response.data?.message || t.paymentFailedError);
        }
      } else {
        setErrorMessage(t.networkError || "Network error. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchAvailableBonuses = async () => {
      try {
        setBonusLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        
        if (!user || !user._id) {
          console.error("No user found in localStorage");
          return;
        }
        
        // Pass userid as query parameter
        const response = await axios.get(
          `${base_url}/user/bonuses/available`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {  // Pass as query params
              userid: user._id
              // Add bonusType if needed: bonusType: 'your_type'
            }
          }
        );
        console.log("Bonuses response:", response.data.data);
        
        if (response.data) {
          setAvailableBonuses(response.data.data)
        }
      } catch (err) {
        console.error("Error fetching bonuses:", err);
      } finally {
        setBonusLoading(false);
      }
    };

    fetchAvailableBonuses();
  }, [base_url]);

  // Calculate bonus amount for a specific bonus
  const calculateBonusAmount = (bonus) => {
    if (!amount || isNaN(parseFloat(amount))) return 0;
    
    const amountNum = parseFloat(amount);
    let calculatedBonus = 0;
    
    if (bonus.percentage > 0) {
      calculatedBonus = (amountNum * bonus.percentage) / 100;
      if (bonus.maxBonus && calculatedBonus > bonus.maxBonus) {
        calculatedBonus = bonus.maxBonus;
      }
    } else if (bonus.amount > 0) {
      calculatedBonus = bonus.amount;
    }
    
    return calculatedBonus;
  };

  // Handle payment callback when returning from payment gateway
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get('paymentId');
      const status = urlParams.get('status');

      if (paymentId && status) {
        try {
          const response = await axios.get(`${base_url}/api/deposit/status?paymentId=${paymentId}`);
          if (response.data.success) {
            setSuccessMessage(t.depositSuccess);
            fetchUserData(); // Refresh user data
          } else {
            setErrorMessage(t.depositFailedOrProcessing);
          }
        } catch (error) {
          console.error(t.paymentStatusError, error);
          setErrorMessage(t.paymentStatusCheckError);
        }
      }
    };

    checkPaymentStatus();
  }, [base_url, fetchUserData, t]);

  // Scroll to top on initial load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen text-white font-anek">
        <div className="bg-gray-800 py-2 px-2 shadow-md border-b-[1px] border-gray-600">
          <div className="max-w-2xl mx-auto cursor-pointer flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full cursor-pointer hover:bg-gray-700 mr-4"
            >
              <MdArrowBackIosNew className="text-xl" />
            </button>
            <h1 className="text-[18px] font-[600]">{t.depositTitle}</h1>
          </div>
        </div>
        <div className="text-center py-4 text-yellow-600 p-4">{t.userDataError}</div>
      </div>
    );
  }

  if (!hasMobileNumber) {
    return (
      <div className="bg-gray-900 min-h-screen text-white font-anek">
        <div className="bg-gray-800 py-2 px-2 shadow-md border-b-[1px] border-gray-600">
          <div className="max-w-2xl mx-auto cursor-pointer flex items-center">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-full cursor-pointer hover:bg-gray-700 mr-4"
            >
              <MdArrowBackIosNew className="text-xl" />
            </button>
            <h1 className="text-[18px] font-[600]">{t.depositTitle}</h1>
          </div>
        </div>
        <div className="p-6 rounded-lg max-w-2xl mx-auto text-center">
          <div className="p-4 rounded mb-4">
            <h3 className="font-bold text-lg">{t.addMobileNumber}</h3>
            <p className="mt-2">{t.addMobileNumberDesc}</p>
            <p className="text-yellow-500">{t.addMobileNumberInstruction}</p>
          </div>
          <button 
            className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer text-gray-900 py-2 px-6 rounded text-lg"
            onClick={() => navigate('/profile')}
          >
            {t.editProfile}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen font-anek text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-4 px-4 sticky top-0 z-10">
        <div className="container mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full cursor-pointer text-cyan-500 hover:bg-gray-700 transition-colors"
          >
            <MdArrowBackIosNew/>
          </button>
          <h1 className="text-[18px] font-[600] text-gray-200">{t.depositTitle}</h1>
        </div>
      </header>
      
      <div className="p-2">
        <div className="bg-gray-800 p-2 rounded-lg border border-gray-700 max-w-4xl mx-auto">

          {/* Payment Method Selection */}
          <div className="mb-4">
            <label className="block font-medium mb-2 text-white text-[16px]">{t.paymentMethod}</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedMethod('bkash')}
                className={`px-4 py-2 rounded border cursor-pointer flex-1 min-w-[120px] ${
                  selectedMethod === 'bkash' ? 'bg-cyan-500 border-cyan-500 text-gray-900' : 'bg-gray-700 border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center">
                  <img
                    src="https://images.5949390294.com/mcs-images/bank_type/BKASH/BN_2_20240312225413337.png"
                    alt="bkash"
                    className="w-6 h-6 mr-2"
                  />
                  <span className="text-[14px]">{t.bkash}</span>
                </div>
              </button>
              <button
                onClick={() => setSelectedMethod('nagad')}
                className={`px-4 py-2 cursor-pointer rounded border flex-1 min-w-[120px] ${
                  selectedMethod === 'nagad' ? 'bg-cyan-500 border-cyan-500 text-gray-900' : 'bg-gray-700 border-gray-600'
                }`}
              >
                <div className="flex items-center justify-center">
                  <img
                    src="https://images.5949390294.com/mcs-images/bank_type/NAGAD/BN_2_20240312230148421.png"
                    alt="nagad"
                    className="w-6 h-6 mr-2"
                  />
                  <span className="text-[14px]">{t.nagad}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Deposit Amount Section */}
          <div className="mb-4">
            <label className="block font-medium mb-2 text-white text-[16px]">{t.depositAmount}</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-2">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setAmount(amt.toString());
                    setErrorMessage('');
                  }}
                  className={`bg-gray-700 cursor-pointer hover:bg-cyan-500 hover:text-gray-900 px-2 py-2 rounded text-sm text-center border ${
                    amount === amt.toString() ? 'border-cyan-500' : 'border-gray-600'
                  }`}
                >
                  {formatNumber(amt)} ৳
                </button>
              ))}
            </div>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d+$/.test(value)) {
                  setAmount(value);
                  setErrorMessage('');
                }
              }}
              className="mt-3 w-full p-3 border border-gray-600 rounded text-sm bg-gray-800 text-white text-[14px]"
              placeholder={t.amountPlaceholder}
              min="100"
              max="30000"
            />
            <p className="text-sm text-gray-400 mt-1">
              {t.minimumAmount.replace('{amount}', formatNumber(100))} {t.maximumAmount.replace('{amount}', formatNumber(30000))} <br />
              {t.depositTime}
            </p>
          </div>

          {/* Enhanced Bonus Selection Section */}
          {(availableBonuses.length > 0 || bonusLoading) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block font-bold text-white text-[17px]">
                  {t.selectBonusOffer || "Select Bonus Offer"}
                </label>
              </div>
              
              {bonusLoading ? (
                <div className="text-center py-6">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-cyan-500 border-r-transparent"></div>
                  <p className="text-sm text-gray-400 mt-3">Loading available bonuses...</p>
                </div>
              ) : availableBonuses.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {/* No Bonus Option - Prominent */}
                  <button
                    type="button"
                    className={`p-4 rounded-lg flex flex-col cursor-pointer items-start justify-center transition-all duration-300 ${
                      selectedBonus === null
                        ? "bg-gray-800 border-2 border-cyan-500 shadow-lg shadow-cyan-500/20"
                        : "bg-gray-800 hover:bg-gray-750 border-2 border-gray-700 hover:border-gray-600"
                    }`}
                    onClick={() => setSelectedBonus(null)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-[16px] block text-left font-semibold text-white">
                          {t.noBonus || "No Bonus"}
                        </span>
                        <span className="block text-[13px] text-gray-400 mt-1">
                          {t.noBonusDesc || "Proceed without any bonus"}
                        </span>
                      </div>
                      {selectedBonus === null && (
                        <div className="flex items-center justify-center w-6 h-6 bg-cyan-500 rounded-full">
                          <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Available Bonuses */}
                  {availableBonuses.map((bonus) => {
                    const calculatedAmount = calculateBonusAmount(bonus);
                    const isSelected = selectedBonus && 
                      ((selectedBonus._id && selectedBonus._id === bonus._id) || 
                       (selectedBonus.id && selectedBonus.id === bonus.id));
                    
                    return (
                      <button
                        type="button"
                        key={bonus._id || bonus.id}
                        className={`p-4 rounded-lg flex flex-col cursor-pointer items-start justify-center transition-all duration-300 transform hover:scale-[1.02] ${
                          isSelected
                            ? "bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-2 border-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "bg-gray-800 hover:bg-gray-750 border-2 border-gray-700 hover:border-cyan-500/50"
                        }`}
                        onClick={() => {
                          const selectedBonusObj = {
                            ...bonus,
                            calculatedAmount
                          };
                          setSelectedBonus(selectedBonusObj);
                        }}
                      >
                        <div className="flex justify-between items-start w-full mb-2">
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[20px] font-semibold text-white">
                                {bonus.name}
                              </span>
                              {bonus.tag && (
                                <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded">
                                  {bonus.tag}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-[15px] text-cyan-300 mb-1">
                              {bonus.description}
                            </p>
                            
                            {/* Game Categories Section */}
                            {bonus.gamesCategory && bonus.gamesCategory.length > 0 && (
                              <div className="mb-2">
                                <div className="flex items-center gap-1 text-[13px] text-gray-400 mb-1">
                                  <span className="font-medium">Games Category:</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {bonus.gamesCategory.map((game, index) => (
                                    <span 
                                      key={index} 
                                      className="bg-blue-900/30 text-blue-300 text-[13px] px-2 py-1 rounded border border-blue-700/50"
                                    >
                                      {game}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                           
                            {/* <div className="flex items-center gap-3 text-[12px] text-gray-400">
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                </svg>
                                Code: {bonus.bonusCode}
                              </span>
                              {bonus.wageringRequirement > 0 && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  {bonus.wageringRequirement}x Wager
                                </span>
                              )}
                              {bonus.validityDays > 0 && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  {bonus.validityDays} days
                                </span>
                              )}
                            </div> */}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {amount && !isNaN(parseFloat(amount)) && calculatedAmount > 0 && (
                              <div className="text-right">
                                <div className="text-cyan-300 px-3 py-1 rounded-lg">
                                  <span className="text-[14px] font-bold">+৳{calculatedAmount.toFixed(2)}</span>
                                  <div className="text-[10px] text-cyan-400">
                                    Bonus
                                  </div>
                                </div>
                              </div>
                            )}
                            {isSelected && (
                              <div className="flex items-center justify-center w-6 h-6 bg-cyan-500 rounded-full">
                                <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Bonus Details */}
                        <div className="w-full mt-2 pt-2 border-t border-gray-700">
                          <div className="flex justify-between text-[14px]">
                            {bonus.percentage > 0 && (
                              <div className="text-left">
                                <span className="text-gray-400">Percentage:</span>
                                <span className="ml-1 text-green-300">{bonus.percentage}%</span>
                              </div>
                            )}
                         
                            {bonus.minDeposit > 0 && (
                              <div className="text-left">
                                <span className="text-gray-400">Min Deposit:</span>
                                <span className="ml-1 text-orange-300">৳{bonus.minDeposit}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400">No bonus offers available at the moment.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Error/Success Messages */}
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded mb-4 text-[14px]">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </div>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-500 p-3 rounded mb-4 text-[14px]">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {successMessage}
              </div>
            </div>
          )}
          
          {/* Submit Button with Loading Animation */}
          <button 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-theme_color2 cursor-pointer text-gray-900 py-3 px-4 rounded-lg w-full text-[16px] font-bold flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-cyan-500/20"
            onClick={handleDeposit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.processing}
              </>
            ) : (
              <div className="flex items-center">
                {t.requestDeposit}
              </div>
            )}
          </button>

          {/* Terms and Conditions */}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <p className="font-bold mb-2 text-cyan-400 text-[15px]">{t.termsAndConditions}</p>
            <ul className="space-y-1 pl-2">
              <li className="text-gray-400 text-[13px] flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                {t.conditionMinDeposit}
              </li>
              <li className="text-gray-400 text-[13px] flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                {t.conditionAccountBlock}
              </li>
              <li className="text-gray-400 text-[13px] flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                {t.conditionBonusTerms}
              </li>
              <li className="text-gray-400 text-[13px] flex items-start">
                <span className="text-cyan-500 mr-2">•</span>
                {t.conditionProcessingTime}
              </li>
            </ul>
          </div>

          {/* Deposit History */}
          <div className="bg-gray-800 p-3 mt-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-[15px] text-white">{t.depositHistory}</h4>
              {userData?.depositHistory?.length > 0 && (
                <span className="text-cyan-400 text-xs bg-cyan-500/10 px-2 py-1 rounded">
                  {userData.depositHistory.length} Transactions
                </span>
              )}
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full text-[13px]">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="py-2 px-3 text-left text-gray-300 font-medium">{t.date}</th>
                    <th className="py-2 px-3 text-left text-gray-300 font-medium">{t.amount}</th>
                    <th className="py-2 px-3 text-left text-gray-300 font-medium">{t.method}</th>
                    <th className="py-2 px-3 text-left text-gray-300 font-medium">{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {userData?.depositHistory?.length > 0 ? (
                    [...userData.depositHistory]
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 5)
                      .map((deposit, index) => (
                        <tr key={index} className="border-t border-gray-700 hover:bg-gray-750 transition-colors">
                          <td className="py-2 px-3">
                            {new Date(deposit.createdAt).toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-2 px-3 font-medium">
                            {formatNumber(deposit.amount)} ৳
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center">
                              <img
                                src={deposit.method === 'bkash' 
                                  ? "https://images.5949390294.com/mcs-images/bank_type/BKASH/BN_2_20240312225413337.png"
                                  : "https://images.5949390294.com/mcs-images/bank_type/NAGAD/BN_2_20240312230148421.png"}
                                alt={deposit.method}
                                className="w-5 h-5 mr-2"
                              />
                              {deposit.method === 'bkash' ? t.bkash : deposit.method === 'nagad' ? t.nagad : deposit.method}
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              deposit.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                              deposit.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>
                              {deposit.status === 'completed' ? t.completedStatus :
                               deposit.status === 'pending' ? t.pendingStatus :
                               t.failedStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-gray-500">
                        {t.noDepositHistory}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Deposit;
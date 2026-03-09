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
  const [selectedBonus, setSelectedBonus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userData, loading, error, fetchUserData } = useUser();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const amounts = [300, 500,700,1000, 3000, 5000, 10000, 20000, 25000, 30000];
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Dynamic bonus states
  const [availableBonuses, setAvailableBonuses] = useState([]);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [dynamicSelectedBonus, setDynamicSelectedBonus] = useState(null);

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

  // Fetch available bonuses from backend
  useEffect(() => {
    const fetchAvailableBonuses = async () => {
      try {
        setBonusLoading(true);
        const token = localStorage.getItem("token");
        
        // Check if user is logged in
        if (!token) {
          console.log("No token found");
          return;
        }

        const response = await axios.get(
          `${base_url}/user/bonuses/available`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Bonus API Response:", response.data);

        if (response.data.success && response.data.data) {
          // Filter out bonuses that user has already used
          const userResponse = await axios.get(
            `${base_url}/user/all-information/${userData._id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (userResponse.data.success) {
            const userInfo = userResponse.data.data;
            
            // Get all bonus codes that user has already used (active or completed)
            const usedBonusCodes = [];
            
            // Check bonusActivityLogs for used bonuses
            if (userInfo.bonusActivityLogs && Array.isArray(userInfo.bonusActivityLogs)) {
              userInfo.bonusActivityLogs.forEach(log => {
                if (log.bonusCode && (log.status === 'active' || log.status === 'completed')) {
                  usedBonusCodes.push(log.bonusCode);
                }
              });
            }
            
            // Check activeBonuses for used bonuses
            if (userInfo.bonusInfo && userInfo.bonusInfo.activeBonuses && Array.isArray(userInfo.bonusInfo.activeBonuses)) {
              userInfo.bonusInfo.activeBonuses.forEach(bonus => {
                if (bonus.bonusCode) {
                  usedBonusCodes.push(bonus.bonusCode);
                }
              });
            }
            
            console.log("Used bonus codes:", usedBonusCodes);
            
            // Filter out bonuses that user has already used
            const filteredBonuses = response.data.data.filter(bonus => {
              // If bonus has no code, show it (generic bonuses)
              if (!bonus.bonusCode) return true;
              
              // Check if this bonus code has been used
              const isUsed = usedBonusCodes.includes(bonus.bonusCode);
              
              // Special case: first deposit bonus
              if (bonus.bonusType === 'first_deposit' && userInfo.bonusInfo?.firstDepositBonusClaimed) {
                console.log("First deposit bonus already claimed");
                return false;
              }
              
              console.log(`Bonus ${bonus.bonusCode} is used: ${isUsed}`);
              return !isUsed;
            });
            
            console.log("Filtered bonuses:", filteredBonuses);
            setAvailableBonuses(filteredBonuses);
          }
        }
      } catch (err) {
        console.error("Error fetching bonuses:", err);
        console.error("Error details:", err.response?.data);
      } finally {
        setBonusLoading(false);
      }
    };

    if (userData?._id) {
      fetchAvailableBonuses();
    }
  }, [base_url, userData?._id]);

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

  // Check if user is eligible for original bonuses
  const isNewUser = accountAgeInDays < 3;
  const firstDepositBonusAvailable = isNewUser && userData?.bonusInfo?.firstDepositBonusClaimed === false;
  const depositBonusAvailable = isNewUser && (userData?.total_deposit === 0 || 
    (userData?.bonusInfo?.activeBonuses?.length === 0));

  // Calculate dynamic bonus amount
  const calculateDynamicBonusAmount = (bonus) => {
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

  // Calculate total with bonus
  const calculateTotalWithBonus = () => {
    const amountNum = parseFloat(amount || 0);
    let bonusAmount = 0;
    
    if (selectedBonus === 'first_deposit') {
      bonusAmount = 150; // Fixed 150 bonus for first deposit
    } else if (selectedBonus === 'special_bonus') {
      bonusAmount = 150; // Fixed 150 bonus for special
    } else if (dynamicSelectedBonus) {
      bonusAmount = calculateDynamicBonusAmount(dynamicSelectedBonus);
    }
    
    return amountNum + bonusAmount;
  };

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

    // Check if original bonus is selected but not dynamic
    if ((firstDepositBonusAvailable || depositBonusAvailable) && !selectedBonus && !dynamicSelectedBonus) {
      setErrorMessage(t.selectBonusError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare bonus data
      let bonusType = 'none';
      let bonusAmount = 0;
      let bonusCode = '';
      let wageringRequirement = 0;
      let bonusName = '';

      if (selectedBonus === 'first_deposit') {
        bonusType = 'first_deposit';
        bonusAmount = 150;
        bonusCode = 'FIRST150';
        bonusName = t.firstDepositBonus;
      } else if (selectedBonus === 'special_bonus') {
        bonusType = 'special_bonus';
        bonusAmount = 150;
        bonusCode = 'SPECIAL150';
        bonusName = t.special150Bonus;
      } else if (dynamicSelectedBonus) {
        bonusType = dynamicSelectedBonus.bonusType || 'dynamic';
        bonusAmount = calculateDynamicBonusAmount(dynamicSelectedBonus);
        bonusCode = dynamicSelectedBonus.bonusCode || '';
        wageringRequirement = dynamicSelectedBonus.wageringRequirement || 0;
        bonusName = dynamicSelectedBonus.name || 'Dynamic Bonus';
      }

      // First create pending deposit record
      const initiateResponse = await axios.post(`${base_url}/user/initiate`, {
        method: selectedMethod || 'bkash',
        amount: amountNum || 0,
        bonusType: bonusType,
        bonusAmount: bonusAmount,
        bonusCode: bonusCode,
        wageringRequirement: wageringRequirement,
        bonusName: bonusName,
        userid: userData._id
      });

      if (initiateResponse.data.success && initiateResponse.data.redirectUrl) {
        setSuccessMessage(t.paymentInitiatedSuccess);
        // Redirect to payment gateway
        window.location.href = initiateResponse.data.redirectUrl;
      } else {
        setErrorMessage(initiateResponse.data.message || t.paymentInitiateError);
      }
    } catch (error) {
      console.error(t.depositError, error);
      setErrorMessage(error.response?.data?.message || t.paymentFailedError);
    } finally {
      setIsSubmitting(false);
    }
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
          {/* Bonus Information */}
          {isNewUser && !userData?.bonusInfo?.firstDepositBonusClaimed && 
           (!userData?.bonusInfo?.activeBonuses || userData.bonusInfo.activeBonuses.length === 0) && (
            <div className="bg-gradient-to-r from-purple-800 to-blue-800 border border-cyan-400 p-3 rounded mb-4">
              <h3 className="font-bold text-lg text-white mb-2">{t.specialBonusOffer}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-900/50 p-3 rounded border border-blue-400">
                  <h4 className="font-medium text-cyan-300">{t.firstDepositBonus}</h4>
                  <p className="text-white">{t.firstDepositBonusDesc}</p>
                </div>
                <div className="bg-purple-900/50 p-3 rounded border border-purple-400">
                  <h4 className="font-medium text-purple-300">{t.special150Bonus}</h4>
                  <p className="text-white">{t.special150BonusDesc}</p>
                  <p className="text-xs text-gray-300 mt-1">{t.newUsersOnly}</p>
                </div>
              </div>
            </div>
          )}

          {/* Account Age and Bonus Availability Notice */}
          {(firstDepositBonusAvailable || depositBonusAvailable || availableBonuses.length > 0) ? (
            <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-400 p-3 rounded mb-4 text-sm">
              {t.bonusTimeRemaining
                .replace('{days}', timeRemaining.days)
                .replace('{hours}', timeRemaining.hours)
                .replace('{minutes}', timeRemaining.minutes)
                .replace('{seconds}', timeRemaining.seconds)}
            </div>
          ) : (
            <div className="bg-blue-900/30 border border-blue-700 text-blue-400 p-3 rounded mb-4 text-sm flex justify-start items-center gap-2">
              <TiWarningOutline className="text-teal-500 text-[22px]"/>{t.bonusOfferEnded}
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="mb-4">
            <label className="block font-medium mb-2">{t.paymentMethod}</label>
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
                  {t.bkash}
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
                  {t.nagad}
                </div>
              </button>
            </div>
          </div>

          {/* Deposit Amount Section */}
          <div className="mb-4">
            <label className="block font-medium mb-2">{t.depositAmount}</label>
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
              className="mt-3 w-full p-3 border border-gray-600 rounded text-sm bg-gray-800 text-white"
              placeholder={t.amountPlaceholder}
              min="100"
              max="30000"
            />
            <p className="text-sm text-gray-400 mt-1">
              {t.minimumAmount.replace('{amount}', formatNumber(100))} {t.maximumAmount.replace('{amount}', formatNumber(30000))} <br />
              {t.depositTime}
            </p>
          </div>

          {/* Original Bonus Selection - Only show if user is eligible and no bonus has been claimed */}
          {(firstDepositBonusAvailable || depositBonusAvailable) && (
            <div className="mb-4">
              <label className="block font-medium mb-2">{t.selectBonusOffer}</label>
              <div className="space-y-2">
                {firstDepositBonusAvailable && (
                  <div 
                    className={`p-3 border rounded cursor-pointer ${selectedBonus === 'first_deposit' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 bg-gray-800'}`}
                    onClick={() => {
                      setSelectedBonus('first_deposit');
                      setDynamicSelectedBonus(null);
                    }}
                  >
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        checked={selectedBonus === 'first_deposit'}
                        onChange={() => {
                          setSelectedBonus('first_deposit');
                          setDynamicSelectedBonus(null);
                        }}
                        className="mr-2"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{t.firstDepositBonus}</h4>
                            <p className="text-sm text-gray-400">{t.firstDepositBonusDesc}</p>
                          </div>
                          {amount && !isNaN(parseFloat(amount)) && (
                            <span className="text-sm bg-cyan-500 text-gray-900 px-2 py-1 rounded ml-2">
                              +৳150
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {depositBonusAvailable && (
                  <div 
                    className={`p-3 border rounded cursor-pointer ${selectedBonus === 'special_bonus' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 bg-gray-800'}`}
                    onClick={() => {
                      setSelectedBonus('special_bonus');
                      setDynamicSelectedBonus(null);
                    }}
                  >
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        checked={selectedBonus === 'special_bonus'}
                        onChange={() => {
                          setSelectedBonus('special_bonus');
                          setDynamicSelectedBonus(null);
                        }}
                        className="mr-2"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{t.special150Bonus}</h4>
                            <p className="text-sm text-gray-400">{t.special150BonusDesc}</p>
                          </div>
                          {amount && !isNaN(parseFloat(amount)) && (
                            <span className="text-sm bg-cyan-500 text-gray-900 px-2 py-1 rounded ml-2">
                              +৳150
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div 
                  className={`p-3 border rounded cursor-pointer ${selectedBonus === 'none' ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 bg-gray-800'}`}
                  onClick={() => {
                    setSelectedBonus('none');
                    setDynamicSelectedBonus(null);
                  }}
                >
                  <div className="flex items-center">
                    <input 
                      type="radio" 
                      checked={selectedBonus === 'none'}
                      onChange={() => {
                        setSelectedBonus('none');
                        setDynamicSelectedBonus(null);
                      }}
                      className="mr-2"
                    />
                    <div>
                      <h4 className="font-medium">{t.noBonus}</h4>
                      <p className="text-sm text-gray-400">{t.noBonusDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Bonus Selection - Show only if no original bonuses available */}
          {!firstDepositBonusAvailable && !depositBonusAvailable && (
            <div className="mb-4">
              <label className="block font-medium mb-2">Available Bonuses</label>
              
              {bonusLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-cyan-500 border-r-transparent"></div>
                  <p className="text-xs text-gray-400 mt-2">Loading bonuses...</p>
                </div>
              ) : availableBonuses.length > 0 ? (
                <div className="space-y-2">
                  {/* No Bonus Option */}
                  <div 
                    className={`p-3 border rounded cursor-pointer ${!dynamicSelectedBonus ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 bg-gray-800'}`}
                    onClick={() => {
                      setDynamicSelectedBonus(null);
                      setSelectedBonus('');
                    }}
                  >
                    <div className="flex items-center">
                      <input 
                        type="radio" 
                        checked={!dynamicSelectedBonus}
                        onChange={() => {
                          setDynamicSelectedBonus(null);
                          setSelectedBonus('');
                        }}
                        className="mr-2"
                      />
                      <div>
                        <h4 className="font-medium">No Bonus</h4>
                        <p className="text-sm text-gray-400">Proceed without bonus</p>
                      </div>
                    </div>
                  </div>

                  {/* Available Dynamic Bonuses */}
                  {availableBonuses.map((bonus) => {
                    const calculatedAmount = calculateDynamicBonusAmount(bonus);
                    return (
                      <div 
                        key={bonus.id || bonus._id}
                        className={`p-3 border rounded cursor-pointer ${dynamicSelectedBonus?.id === bonus.id ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-600 bg-gray-800'}`}
                        onClick={() => {
                          setDynamicSelectedBonus({
                            ...bonus,
                            calculatedAmount
                          });
                          setSelectedBonus('');
                        }}
                      >
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            checked={dynamicSelectedBonus?.id === bonus.id}
                            onChange={() => {
                              setDynamicSelectedBonus({
                                ...bonus,
                                calculatedAmount
                              });
                              setSelectedBonus('');
                            }}
                            className="mr-2"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{bonus.name}</h4>
                                <p className="text-sm text-gray-400">
                                  {bonus.description}
                                  {bonus.bonusCode && ` • Code: ${bonus.bonusCode}`}
                                </p>
                              </div>
                              {amount && !isNaN(parseFloat(amount)) && calculatedAmount > 0 && (
                                <span className="text-sm bg-cyan-500 text-gray-900 px-2 py-1 rounded ml-2">
                                  +৳{calculatedAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                            {bonus.percentage > 0 && (
                              <p className="text-xs text-cyan-400 mt-1">
                                {bonus.percentage}% Bonus (Max: ৳{bonus.maxBonus || 'Unlimited'})
                              </p>
                            )}
                            {bonus.wageringRequirement > 0 && (
                              <p className="text-xs text-yellow-400 mt-1">
                                Wagering Requirement: {bonus.wageringRequirement}x
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 border border-gray-600 rounded">
                  <p className="text-sm text-gray-400">No bonuses available at the moment.</p>
                </div>
              )}
            </div>
          )}

          {/* Summary Section */}
          {amount && !isNaN(parseFloat(amount)) && (
            <div className="mb-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <h4 className="text-sm font-medium mb-3 text-white">Transaction Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Deposit Amount:</span>
                  <span className="text-white">৳{parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                
                {(selectedBonus === 'first_deposit' || selectedBonus === 'special_bonus') && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">
                      {selectedBonus === 'first_deposit' ? t.firstDepositBonus : t.special150Bonus}:
                    </span>
                    <span className="text-cyan-400">
                      +৳150
                    </span>
                  </div>
                )}
                
                {dynamicSelectedBonus && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">Bonus ({dynamicSelectedBonus.name}):</span>
                    <span className="text-cyan-400">
                      +৳{calculateDynamicBonusAmount(dynamicSelectedBonus).toFixed(2)}
                    </span>
                  </div>
                )}
                
                <div className="pt-2 border-t border-gray-600">
                  <div className="flex justify-between font-medium">
                    <span className="text-white">Total Credit:</span>
                    <span className="text-cyan-400">
                      ৳{calculateTotalWithBonus().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error/Success Messages */}
          {errorMessage && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded mb-4">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-500 p-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          {/* Submit Button with Loading Animation */}
          <button 
            className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer text-gray-900 py-3 px-4 rounded w-full text-lg flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
            ) : t.requestDeposit}
          </button>

          {/* Terms and Conditions */}
          <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-700 text-xs text-gray-400">
            <p className="font-medium mb-1 text-cyan-400">{t.termsAndConditions}</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>{t.conditionMinDeposit}</li>
              <li>{t.conditionAccountBlock}</li>
              <li>{t.conditionBonusTerms}</li>
              <li>{t.conditionProcessingTime}</li>
            </ul>
          </div>

          {/* Deposit History */}
          <div className="bg-gray-700 p-2 mt-6 rounded border border-gray-600">
            <h4 className="font-medium mb-3">{t.depositHistory}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-600">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="py-2 px-2 text-left border-b border-gray-600 text-xs">{t.date}</th>
                    <th className="py-2 px-2 text-left border-b border-gray-600 text-xs">{t.amount}</th>
                    <th className="py-2 px-2 text-left border-b border-gray-600 text-xs">{t.method}</th>
                    <th className="py-2 px-2 text-left border-b border-gray-600 text-xs">{t.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {userData?.depositHistory?.length > 0 ? (
                    [...userData.depositHistory]
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .slice(0, 5) // Show only last 5 deposits for mobile
                      .map((deposit, index) => (
                        <tr key={index}>
                          <td className="py-2 px-2 border-b border-gray-600 text-xs">
                            {new Date(deposit.createdAt).toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-2 px-2 border-b border-gray-600 text-xs">
                            {formatNumber(deposit.amount)} ৳
                            {deposit.bonusAmount > 0 && (
                              <span className="text-cyan-400 text-xs ml-1">(+{formatNumber(deposit.bonusAmount)}৳)</span>
                            )}
                          </td>
                          <td className="py-2 px-2 border-b border-gray-600 text-xs">
                            {deposit.method === 'bkash' ? t.bkash : deposit.method === 'nagad' ? t.nagad : deposit.method}
                          </td>
                          <td className="py-2 px-2 border-b border-gray-600">
                            <span className={`px-2 py-1 rounded text-xs ${
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
                      <td colSpan="4" className="text-center py-4 text-gray-500 text-xs">
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
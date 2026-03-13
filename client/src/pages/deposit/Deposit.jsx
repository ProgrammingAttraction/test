import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew, MdClose } from "react-icons/md";
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
  const base_url2 = import.meta.env.VITE_API_KEY_Base_URL2;
  const frontend_url = import.meta.env.VITE_API_KEY_Frotend_URL;
  const amounts = [500, 800, 1500, 2000, 5000];
  const [availableBonuses, setAvailableBonuses] = useState([]);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [autoPaymentStatus, setAutoPaymentStatus] = useState(false);
  const [autoPaymentLoading, setAutoPaymentLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deposit');

  const accountAgeInDays = userData?.createdAt
    ? Math.floor((new Date() - new Date(userData.createdAt)) / (1000 * 60 * 60 * 24))
    : 0;
  const bonusEndTime = userData?.createdAt
    ? new Date(new Date(userData.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000)
    : new Date();

  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const formatNumber = (number) => {
    if (number === undefined || number === null) return language.code === 'bn' ? '০' : '0';
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US').format(number);
  };

  useEffect(() => {
    const updateCountdown = () => {
      const timeRemainingMs = bonusEndTime - new Date();
      if (timeRemainingMs <= 0) { setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeRemaining({
        days: Math.floor(timeRemainingMs / (1000 * 60 * 60 * 24)),
        hours: Math.floor((timeRemainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((timeRemainingMs % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((timeRemainingMs % (1000 * 60)) / 1000),
      });
    };
    updateCountdown();
    const id = setInterval(updateCountdown, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const fetchAutoPaymentStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${base_url}/user/auto-payment-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) setAutoPaymentStatus(response.data.status);
      } catch (err) {
        setAutoPaymentStatus(false);
      } finally {
        setAutoPaymentLoading(false);
      }
    };
    fetchAutoPaymentStatus();
  }, []);

  useEffect(() => {
    const fetchAvailableBonuses = async () => {
      try {
        setBonusLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");
        if (!user || !user._id) return;
        const response = await axios.get(`${base_url}/user/bonuses/available`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { userid: user._id }
        });
        if (response.data) setAvailableBonuses(response.data.data);
      } catch (err) {
        console.error("Error fetching bonuses:", err);
      } finally {
        setBonusLoading(false);
      }
    };
    fetchAvailableBonuses();
  }, []);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get('paymentId');
      const status = urlParams.get('status');
      if (paymentId && status) {
        try {
          const response = await axios.get(`${base_url}/api/deposit/status?paymentId=${paymentId}`);
          if (response.data.success) { setSuccessMessage(t.depositSuccess); fetchUserData(); }
          else setErrorMessage(t.depositFailedOrProcessing);
        } catch (error) {
          setErrorMessage(t.paymentStatusCheckError);
        }
      }
    };
    checkPaymentStatus();
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const calculateBonusAmount = (bonus) => {
    if (!amount || isNaN(parseFloat(amount))) return 0;
    const amountNum = parseFloat(amount);
    let calculatedBonus = 0;
    if (bonus.percentage > 0) {
      calculatedBonus = (amountNum * bonus.percentage) / 100;
      if (bonus.maxBonus && calculatedBonus > bonus.maxBonus) calculatedBonus = bonus.maxBonus;
    } else if (bonus.amount > 0) {
      calculatedBonus = bonus.amount;
    }
    return calculatedBonus;
  };

  const handleDeposit = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    if (!amount) { setErrorMessage(t.enterAmountError); return; }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) { setErrorMessage(t.invalidAmountError); return; }
    if (amountNum < 300) { setErrorMessage(t.minimumDepositError); return; }
    if (amountNum > 30000) { setErrorMessage(t.maximumDepositError); return; }
    if (!/^\d+$/.test(amount)) { setErrorMessage(t.numericAmountError); return; }
    setIsSubmitting(true);
    try {
      let bonusData = {
        bonusType: 'none', bonusId: null, bonusCode: null, bonusAmount: 0,
        bonusName: null, bonusPercentage: 0, bonusMaxAmount: 0, wageringRequirement: 0,
        balanceType: 'main_balance', waigergamecategory: [], gameCategory: null
      };
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
          waigergamecategory: selectedBonus.waigergamecategory || selectedBonus.gamesCategory || selectedBonus.gameCategories || [],
          gameCategory: selectedBonus.gameCategory || null
        };
        if (selectedBonus.minDeposit && amountNum < selectedBonus.minDeposit) {
          setErrorMessage(`Minimum deposit for this bonus is ${selectedBonus.minDeposit} BDT`);
          setIsSubmitting(false);
          return;
        }
      }
      const token = localStorage.getItem("token");
      let orderCounter = (Date.now() % 1000) * 1000;
      const generateOrderId = () => {
        orderCounter = (orderCounter + 1) % 1000000;
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 15);
        const randomStr2 = Math.random().toString(36).substring(2, 15);
        const userPart = userData?._id?.slice(-6) || '000000';
        return `DEP${timestamp}${orderCounter}${randomStr}${randomStr2}${userPart}`;
      };
      const orderId = generateOrderId();
      const payload = {
        method: selectedMethod || 'bkash', amount: amountNum,
        bonusType: bonusData.bonusType, bonusId: bonusData.bonusId,
        bonusCode: bonusData.bonusCode, bonusAmount: bonusData.bonusAmount,
        bonusName: bonusData.bonusName, bonusPercentage: bonusData.bonusPercentage,
        bonusMaxAmount: bonusData.bonusMaxAmount, wageringRequirement: bonusData.wageringRequirement,
        balanceType: bonusData.balanceType, userid: userData._id,
        playerbalance: userData.balance || 0, waigergamecategory: bonusData.waigergamecategory,
        gameCategory: bonusData.gameCategory, orderId
      };
      let apiEndpoint = `${base_url}/user/initiate`;
      if (selectedMethod === 'bkash_fast') {
        const initiateResponse = await axios.post(apiEndpoint, payload, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        if (initiateResponse.data.success) {
          const bkashFastResponse = await axios.post(`${base_url2}/api/payment/p2c/bkash/payment`, {
            orderId, payerId: userData.player_id, amount: amountNum,
            player_id: userData.player_id, currency: 'BDT',
            redirectUrl: `${frontend_url}`,
            callbackUrl: `${frontend_url}/callback-payment`,
            sitecallback: `${base_url}/user/callback`,
            transactionId: initiateResponse.data.transactionId,
            paymentId: initiateResponse.data.paymentId
          }, {
            headers: { Authorization: `Bearer ${token}`, 'x-api-key': localStorage.getItem("apiKey") || "18e5f948356de68e2909", 'Content-Type': 'application/json' }
          });
          if (bkashFastResponse.data.success && bkashFastResponse.data.link) {
            setSuccessMessage(t.paymentInitiatedSuccess);
            localStorage.setItem('lastDeposit', JSON.stringify({
              amount: amountNum, bonus: bonusData, method: 'bkash_fast',
              paymentId: bkashFastResponse.data.paymentId || initiateResponse.data.paymentId,
              orderId: bkashFastResponse.data.orderId || orderId,
              transactionId: initiateResponse.data.transactionId,
              timestamp: new Date().toISOString()
            }));
            window.location.href = bkashFastResponse.data.link;
          } else {
            setErrorMessage(bkashFastResponse.data.message || t.paymentInitiateError);
          }
        } else {
          setErrorMessage(initiateResponse.data.message || t.paymentInitiateError);
        }
        setIsSubmitting(false);
        return;
      }
      const initiateResponse = await axios.post(apiEndpoint, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (initiateResponse.data.success && initiateResponse.data.redirectUrl) {
        setSuccessMessage(t.paymentInitiatedSuccess);
        localStorage.setItem('lastDeposit', JSON.stringify({
          amount: amountNum, bonus: bonusData,
          waigergamecategory: bonusData.waigergamecategory,
          gameCategory: bonusData.gameCategory,
          transactionId: initiateResponse.data.transactionId,
          paymentId: initiateResponse.data.paymentId,
          timestamp: new Date().toISOString()
        }));
        window.location.href = initiateResponse.data.redirectUrl;
      } else {
        setErrorMessage(initiateResponse.data.message || t.paymentInitiateError);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) setErrorMessage(error.response.data.message || t.paymentFailedError);
        else if (error.response.status === 401) {
          setErrorMessage(t.sessionExpiredError || "Session expired. Please login again.");
          setTimeout(() => navigate('/login'), 3000);
        } else setErrorMessage(error.response.data?.message || t.paymentFailedError);
      } else {
        setErrorMessage(t.networkError || "Network error. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Bonus card gradient palettes ───────────────────────────────────────────
  const bonusGradients = [
    'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
    'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
    'linear-gradient(135deg, #f97316 0%, #eab308 100%)',
  ];

  const bonusEmojis = ['🎁', '💎', '🔥', '⚡', '🎯', '🚀'];

  // ─── Loading State ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-[#f0f9fc] min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
        </div>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-[#f0f9fc] min-h-screen font-sans">
        <div className="bg-white py-3 px-4 shadow-sm border-b border-gray-100">
          <div className="max-w-md mx-auto flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 text-cyan-500">
              <MdArrowBackIosNew />
            </button>
            <h1 className="text-base font-semibold text-gray-800">{t.depositTitle}</h1>
          </div>
        </div>
        <div className="text-center py-6 text-yellow-600 px-4">{t.userDataError}</div>
      </div>
    );
  }

  // ─── Main UI ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#C7F6FF] min-h-screen font-anek p-[30px]">

      <div className="max-w-md bg-[#F5F5F5] mx-auto p-[15px] rounded-[20px]">

        {/* Close Icon - Top Right */}
        <div className="flex justify-end mb-2">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
            aria-label="Close"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Deposit / Withdraw Tabs */}
        <div className="rounded-xl p-1 flex mb-4">
          <button
            onClick={() => setActiveTab('deposit')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'deposit'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.depositTitle || 'Deposit'}
          </button>
          <button
            onClick={() => navigate('/withdraw')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'withdraw'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.withdrawTitle || 'Withdraw'}
          </button>
        </div>

        {/* Card Wrapper */}
        <div className="overflow-hidden">

          {/* Payment Method */}
          <div className="p-4 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {t.paymentMethod || 'Select your preferred payment method'}
            </p>
            <div className="grid grid-cols-3 gap-2.5">

              {/* Bkash */}
              <button
                onClick={() => setSelectedMethod('bkash')}
                className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${
                  selectedMethod === 'bkash'
                    ? 'border-cyan-400 bg-cyan-50'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <img
                  src="https://images.5949390294.com/mcs-images/bank_type/BKASH/BN_2_20240312225413337.png"
                  alt="bkash"
                  className="w-12 h-8 object-contain"
                />
                <span className="text-[11px] font-bold text-gray-600">{t.bkash || 'Bkash P2P'}</span>
              </button>

              {/* Nagad */}
              <button
                onClick={() => setSelectedMethod('nagad')}
                className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${
                  selectedMethod === 'nagad'
                    ? 'border-cyan-400 bg-cyan-50'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <img
                  src="https://images.5949390294.com/mcs-images/bank_type/NAGAD/BN_2_20240312230148421.png"
                  alt="nagad"
                  className="w-12 h-8 object-contain"
                />
                <span className="text-[11px] font-bold text-gray-600">{t.nagad || 'Nagad P2P'}</span>
              </button>

              {/* Bkash Fast (conditional) */}
              {!autoPaymentLoading && autoPaymentStatus && (
                <button
                  onClick={() => setSelectedMethod('bkash_fast')}
                  className={`rounded-xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${
                    selectedMethod === 'bkash_fast'
                      ? 'border-cyan-400 bg-cyan-50'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <img
                    src="https://play-lh.googleusercontent.com/1CRcUfmtwvWxT2g-xJF8s9_btha42TLi6Lo-qVkVomXBb_citzakZX9BbeY51iholWs"
                    alt="bkash fast"
                    className="w-12 h-8 object-contain rounded-md"
                  />
                  <span className="text-[11px] font-bold text-gray-600">{t.bkashFast || 'Bkash Fast'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="p-4 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {t.depositAmount || 'Enter Amount'}
            </p>
            <div className="relative mb-2">
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '' || /^\d+$/.test(v)) {
                    setAmount(v);
                    setErrorMessage('');
                  }
                }}
                placeholder={t.amountPlaceholder || 'Input your preferred amount'}
                className="w-full border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-cyan-400 focus:bg-white transition-colors"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">৳</span>
            </div>
            <p className="text-[11px] text-red-400 mb-3">
              *{t.minimumAmount?.replace('{amount}', formatNumber(300)) || 'Min & maximum deposit amount'}: 300–{formatNumber(30000)} BDT
            </p>

            {/* Quick Amount Buttons */}
            <div className="flex flex-wrap gap-2">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => { setAmount(amt.toString()); setErrorMessage(''); }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    amount === amt.toString()
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-cyan-300 hover:text-cyan-600'
                  }`}
                >
                  {formatNumber(amt)}৳
                </button>
              ))}
            </div>
          </div>

          {/* ─── Bonus Section: Horizontal Scroll Cards ─────────────────────── */}
          {(availableBonuses.length > 0 || bonusLoading) && (
            <div className="py-3 border-b border-gray-50">
              <div className="flex items-center justify-between px-4 mb-2">
                <p className="text-sm font-semibold text-gray-700">
                  {t.selectBonusOffer || 'Select Bonus Offer'}
                </p>
                <span className="text-[10px] text-gray-400 font-medium">← scroll →</span>
              </div>

              {bonusLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-cyan-500 border-r-transparent"></div>
                  <p className="text-xs text-gray-400 mt-2">Loading bonuses...</p>
                </div>
              ) : (
                <div
                  className="flex gap-3 overflow-x-auto px-4 pb-2"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                    cursor: 'grab',
                  }}
                  onMouseDown={(e) => {
                    const el = e.currentTarget;
                    el.style.cursor = 'grabbing';
                    const startX = e.pageX - el.offsetLeft;
                    const scrollLeft = el.scrollLeft;
                    const onMove = (ev) => {
                      const x = ev.pageX - el.offsetLeft;
                      el.scrollLeft = scrollLeft - (x - startX);
                    };
                    const onUp = () => {
                      el.style.cursor = 'grab';
                      window.removeEventListener('mousemove', onMove);
                      window.removeEventListener('mouseup', onUp);
                    };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                  }}
                >
                  {/* No Bonus Card */}
                  <button
                    type="button"
                    onClick={() => setSelectedBonus(null)}
                    className="flex-shrink-0 relative rounded-2xl overflow-hidden transition-all select-none"
                    style={{
                      width: 'calc(90.9% - 6px)',
                      minHeight: '90px',      /* ← reduced from 130px */
                      background: selectedBonus === null
                        ? 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
                        : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                      boxShadow: selectedBonus === null
                        ? '0 4px 20px rgba(6, 182, 212, 0.4)'
                        : '0 2px 8px rgba(0,0,0,0.06)',
                      transform: selectedBonus === null ? 'scale(1.03)' : 'scale(1)',
                    }}
                  >
                    {/* Decorative circles */}
                    <div style={{
                      position: 'absolute', top: '-14px', right: '-14px',
                      width: '55px', height: '55px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.12)'
                    }} />
                    <div style={{
                      position: 'absolute', bottom: '-8px', left: '-8px',
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)'
                    }} />
                    <div className="relative p-3 flex flex-row items-center gap-3 h-full" style={{ minHeight: '90px' }}>
                      <div className="text-xl flex-shrink-0">🚫</div>
                      <div className="flex flex-col">
                        <div className={`text-xs font-black tracking-wide ${selectedBonus === null ? 'text-white' : 'text-gray-600'}`}>
                          {t.noBonus || 'No Bonus'}
                        </div>
                        <div className={`text-[10px] leading-tight ${selectedBonus === null ? 'text-white/70' : 'text-gray-400'}`}>
                          {t.noBonusDesc || 'Continue without offer'}
                        </div>
                      </div>
                      {/* Selected checkmark */}
                      {selectedBonus === null && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                          <svg className="w-3 h-3 text-cyan-500" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="2,6 5,9 10,3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Dynamic Bonus Cards */}
                  {availableBonuses.map((bonus, idx) => {
                    const calculatedAmount = calculateBonusAmount(bonus);
                    const isSelected = selectedBonus &&
                      ((selectedBonus._id && selectedBonus._id === bonus._id) ||
                       (selectedBonus.id && selectedBonus.id === bonus.id));
                    const gradient = bonusGradients[idx % bonusGradients.length];
                    const emoji = bonusEmojis[idx % bonusEmojis.length];

                    return (
                      <button
                        type="button"
                        key={bonus._id || bonus.id}
                        onClick={() => setSelectedBonus({ ...bonus, calculatedAmount })}
                        className="flex-shrink-0 relative rounded-2xl overflow-hidden transition-all select-none"
                        style={{
                          width: 'calc(90.9% - 6px)',
                          minHeight: '90px',      /* ← reduced from 130px */
                          background: gradient,
                          boxShadow: isSelected
                            ? '0 6px 24px rgba(0,0,0,0.22)'
                            : '0 2px 8px rgba(0,0,0,0.08)',
                          transform: isSelected ? 'scale(1.04)' : 'scale(1)',
                          opacity: isSelected ? 1 : 0.88,
                        }}
                      >

                        <div className="relative p-3 flex flex-row items-center gap-3" style={{ minHeight: '90px' }}>
                          {/* Emoji */}
                          <div className="text-xl flex-shrink-0">{emoji}</div>

                          {/* Content */}
                          <div className="flex flex-col flex-1 min-w-0">
                            {/* Name */}
                            <div className="text-white text-[17px] font-bold truncate leading-tight mt-0.5">
                              {bonus.name}
                            </div>
                          </div>

                          {/* Checkmark */}
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 self-start">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12" stroke="#7c3aed" strokeWidth="2.5">
                                <polyline points="2,6 5,9 10,3" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Error / Success Messages */}
          {errorMessage && (
            <div className="mx-4 mb-3 bg-red-50 border border-red-200 text-red-500 p-3 rounded-xl text-xs flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="mx-4 mb-3 bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl text-xs flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Submit Button */}
          <div className="px-4 pb-4">
            <button
              onClick={handleDeposit}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.processing || 'Processing...'}
                </>
              ) : (
                t.requestDeposit || 'Click to Pay'
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Deposit;
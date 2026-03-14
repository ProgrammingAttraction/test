import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { MdArrowBackIosNew, MdClose } from "react-icons/md";
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
  const isKYCCompleted = userData?.kycCompleted || false;
  const isKYCSubmitted = userData?.kycSubmitted || false;
  const showKYCVerificationMessage = isKYCSubmitted && !isKYCCompleted;

  const wageringProgress = userData?.waigeringneed && userData.waigeringneed > 0 && userData?.bonusBalance > 0
    ? Math.min(((userData?.total_bet || 0) / (userData.waigeringneed * userData.bonusBalance)) * 100, 100)
    : 0;
  const isWageringComplete = userData?.waigeringneed > 0 && userData?.bonusBalance > 0 &&
    userData?.total_bet >= userData?.waigeringneed * userData?.bonusBalance;

  const formatUnbanDate = (dateString) => {
    if (!dateString) return t.notSpecified;
    return new Date(dateString).toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTimeUntilUnban = () => {
    if (!unbanDate) return null;
    const diffMs = new Date(unbanDate) - new Date();
    if (diffMs <= 0) return t.banPeriodEnded;
    const d = Math.floor(diffMs / 86400000), h = Math.floor((diffMs % 86400000) / 3600000), m = Math.floor((diffMs % 3600000) / 60000);
    return language.code === 'bn' ? `${d} দিন ${h} ঘন্টা ${m} মিনিট` : `${d} days ${h} hours ${m} minutes`;
  };

  const formatNumber = (number) => {
    if (number === undefined || number === null) return language.code === 'bn' ? '০' : '0';
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 }).format(number);
  };

  useEffect(() => {
    if (userData?.bonusInfo?.activeBonuses?.length > 0) {
      const activeBonuses = userData.bonusInfo.activeBonuses.filter(b => b.status === 'active');
      if (activeBonuses.length > 0) {
        const calculateCountdown = () => {
          const expiresAt = new Date(new Date(activeBonuses[0].createdAt).getTime() + 7 * 86400000);
          const diffMs = expiresAt - new Date();
          const isTransferEligible = userData.waigeringneed > 0 && userData.bonusBalance > 0
            ? (userData.total_bet || 0) >= userData.waigeringneed * userData.bonusBalance
            : (userData.total_bet || 0) >= userData.total_deposit * 30;
          if (diffMs <= 0) { setBonusCountdown({ expired: true }); setShowTransferBonusButton(false); return; }
          setBonusCountdown({
            days: Math.floor(diffMs / 86400000),
            hours: Math.floor((diffMs % 86400000) / 3600000),
            minutes: Math.floor((diffMs % 3600000) / 60000),
            seconds: Math.floor((diffMs % 60000) / 1000),
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
      } else { setBonusCountdown(null); setShowTransferBonusButton(false); }
    }
  }, [userData]);

  useEffect(() => {
    const fetchWithdrawalHistory = async () => {
      try {
        setHistoryLoading(true);
        const response = await axios.get(`${base_url}/user/withdrawal/${userData._id}`, {
          headers: { 'x-api-key': import.meta.env.VITE_API_KEY, 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setWithdrawalHistory(response.data.data || []);
      } catch (err) {
        setError(t.withdrawalHistoryLoadError);
      } finally { setHistoryLoading(false); }
    };
    if (userData?._id && isKYCCompleted) fetchWithdrawalHistory();
  }, [userData?._id, base_url, t, isKYCCompleted]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const hasMobileNumber = userData?.phone;

  // Shared Tabs Component
  const Tabs = () => (
    <div className="rounded-xl p-1 flex mb-4">
      <button onClick={() => navigate('/deposit')} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all text-gray-500 hover:text-gray-700">
        {t.depositTitle || 'Deposit'}
      </button>
      <button className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all bg-cyan-500 text-white shadow-sm">
        {t.withdrawTitle || 'Withdraw'}
      </button>
    </div>
  );

  if (showKYCVerificationMessage || (userData?.kycSubmitted === true && userData?.kycCompleted === false)) {
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
          <Tabs />
          <div className="text-center py-8 px-4">
            <div className="bg-yellow-100 p-4 rounded-full inline-block mb-3">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
            </div>
            <h3 className="text-sm font-bold text-yellow-600 mb-2">{t.kycVerificationRequired || "KYC verification required"}</h3>
            <p className="text-gray-500 text-xs mb-4">{t.kycVerificationDesc || "Complete KYC verification to withdraw funds."}</p>
            <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm" onClick={() => navigate('/kyc')}>
              {t.completeKycVerification || "Complete KYC"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isWithdrawalBanned) {
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
          <Tabs />
          <div className="bg-white rounded-2xl p-4 border border-red-100 text-center">
            <div className="bg-red-100 p-3 rounded-full inline-block mb-3"><svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></div>
            <h3 className="text-sm font-bold text-red-500 mb-1">{t.withdrawalRestricted}</h3>
            <p className="text-gray-500 text-xs mb-3">{t.withdrawalRestrictedDesc}</p>
            <div className="bg-gray-50 p-3 rounded-xl text-left text-xs mb-3">
              <p className="text-gray-400">{t.reason}</p><p className="text-red-500 font-medium">{banReason || t.noReasonSpecified}</p>
              {unbanDate && <><p className="text-gray-400 mt-1">{t.banEndDate}</p><p className="text-yellow-600 font-medium">{formatUnbanDate(unbanDate)}</p><p className="text-gray-400 mt-1">{t.timeRemaining}</p><p className="text-green-600 font-medium">{getTimeUntilUnban()}</p></>}
            </div>
            <p className="text-gray-400 text-xs">{t.contactSupport}</p>
          </div>
        </div>
      </div>
    );
  }

  if (userLoading) return <div className="bg-[#C7F6FF] min-h-screen font-anek flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div></div>;

  if (userError) return <div className="bg-[#C7F6FF] min-h-screen font-anek p-[30px]"><div className="max-w-md bg-[#F5F5F5] mx-auto p-[15px] rounded-[20px]"><Tabs /><div className="bg-red-50 border border-red-200 text-red-500 p-3 rounded-xl text-xs text-center">{t.userDataError}: {userError}</div></div></div>;

  if (!hasMobileNumber) return (
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
        <Tabs />
        <div className="text-center py-8"><h3 className="text-sm font-bold text-gray-700 mb-2">{t.addMobileNumber}</h3><p className="text-gray-500 text-xs mb-4">{t.addMobileNumberDesc}</p><button className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium py-2 px-5 rounded-lg text-sm" onClick={() => navigate('/mobile-information')}>{t.editProfile}</button></div>
      </div>
    </div>
  );

  const calculateWithdrawalInfo = () => {
    if (!userData) return { availableBalance: 0, commissionRate: 0, needsWagering: false };
    if (userData.bonusBalance > 0 && !cancelBonus) return { availableBalance: 0, commissionRate: 0, needsWagering: false, hasActiveBonus: true };
    if (userData.waigeringneed && userData.waigeringneed > 0 && userData.bonusBalance > 0) {
      const req = userData.waigeringneed * userData.bonusBalance, done = userData.total_bet || 0;
      if (done < req) {
        const comm = userData.total_deposit > 0 && done < userData.total_deposit ? 0.2 : 0;
        return { availableBalance: userData.balance, commissionRate: comm, needsWagering: true, wageringStatus: comm > 0 ? 'less-than-deposit' : 'pending-wagering', remainingWagering: req - done };
      }
      return { availableBalance: userData.balance, commissionRate: 0, needsWagering: false, wageringStatus: 'completed' };
    }
    if (userData.total_deposit > 0) {
      const done = userData.total_bet || 0, req1 = userData.total_deposit, req3 = userData.total_deposit * 3;
      if (done < req1) return { availableBalance: 0, commissionRate: 0, needsWagering: true, wageringStatus: 'less-than-1x', remainingWagering: req1 - done };
      if (done < req3) return { availableBalance: userData.balance, commissionRate: 0.2, needsWagering: true, wageringStatus: 'less-than-3x', remainingWagering: req3 - done };
    }
    return { availableBalance: userData.balance, commissionRate: 0, needsWagering: false, wageringStatus: 'completed' };
  };

  const { availableBalance, commissionRate, needsWagering, hasActiveBonus, remainingWagering, wageringStatus } = calculateWithdrawalInfo();

  const handleCancelBonus = async () => {
    setCancelBonusLoading(true); setError('');
    try {
      const response = await axios.post(`${base_url}/user/cancel-bonus`, { userid: userData._id }, { headers: { 'x-api-key': import.meta.env.VITE_API_KEY, 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (response.data.success) { setSuccess(response.data.message); setCancelBonus(false); setShowBonusCancelConfirm(false); await fetchUserData(); }
      else setError(response.data.message || t.cancelBonusError);
    } catch (err) { setError(err.response?.data?.message || t.cancelBonusError); }
    finally { setCancelBonusLoading(false); }
  };

  const handleTransferBonus = async () => {
    setTransferBonusLoading(true); setError('');
    try {
      const response = await axios.put(`${base_url}/user/transfer-bonus-to-main-balance`, { userId: userData._id }, { headers: { 'x-api-key': import.meta.env.VITE_API_KEY, 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (response.data.success) { setSuccess(response.data.message); setShowTransferBonusButton(false); await fetchUserData(); }
      else setError(response.data.message || t.transferBonusError);
    } catch (err) { setError(err.response?.data?.message || t.transferBonusError); }
    finally { setTransferBonusLoading(false); }
  };

  const handleWithdrawal = async () => {
    setError(''); setSuccess('');
    if (!amount || amount < 800) { setError(t.minimumWithdrawalError); return; }
    if (parseFloat(amount) > userData.balance) { setError(`${t.insufficientBalanceError} ৳${formatNumber(userData.balance)}`); return; }
    if (!accountNumber) { setError(t.accountNumberRequired); return; }
    if (!transactionPassword) { setError(t.transactionPasswordRequired); return; }
    if (['bkash', 'nagad'].includes(paymentMethod) && !/^01\d{9}$/.test(accountNumber)) { setError(t.invalidAccountNumberError?.replace('{method}', paymentMethod === 'bkash' ? t.bkash : t.nagad)); return; }
    if (wageringStatus === 'less-than-1x') { setError(t.wagering1xError?.replace('{amount}', formatNumber(remainingWagering))); return; }
    try {
      setLoading(true);
      const orderId = `WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const payoutResponse = await axios.post(`${base_url}/user/payout`, { userId: userData._id, username: userData.username, email: userData.email, playerId: userData.player_id, provider: paymentMethod, amount: parseFloat(amount), orderId, payeeAccount: accountNumber, transactionPassword, wageringStatus: wageringStatus || 'completed', cancelBonus, waigeringneed: userData.waigeringneed, total_bet: userData.total_bet }, { headers: { 'x-api-key': import.meta.env.VITE_API_KEY, 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      if (payoutResponse.data.success) {
        setSuccess(payoutResponse.data.message); setAmount(''); setAccountNumber(''); setTransactionPassword(''); setCancelBonus(false);
        await fetchUserData();
        const hr = await axios.get(`${base_url}/user/withdrawal/${userData._id}`, { headers: { 'x-api-key': import.meta.env.VITE_API_KEY, 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
        setWithdrawalHistory(hr.data.data || []);
      } else { setError(payoutResponse.data.message || t.withdrawalRequestError); }
    } catch (err) {
      if (err.response) {
        const msg = err.response.data.message;
        if (msg === 'Transaction password not set for this user') setError(<>{t.transactionPasswordNotSet}{' '}<button className="text-cyan-600 underline" onClick={() => navigate('/mobile-information')}>{t.setPasswordLink}</button></>);
        else setError(msg || t.serverError);
      } else setError(t.networkError);
    } finally { setLoading(false); }
  };

  const isDisabled = !amount || amount < 800 || !accountNumber || !transactionPassword || loading || hasActiveBonus || wageringStatus === 'less-than-1x' || parseFloat(amount || 0) > availableBalance;

  return (
    <div className="bg-[#C7F6FF] flex justify-center items-center min-h-screen font-anek p-[30px]">
      <div className="max-w-md w-full bg-[#F5F5F5] mx-auto p-[15px] min-h-[93vh] rounded-[20px]">

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

        <Tabs />

        {/* Balance Card */}
        <div className=" rounded-2xl p-4 mb-1">
          <p className="text-cyan-500 font-bold text-sm mb-1">{t.availableBalance || 'Available Balance'}</p>
          <p className="text-2xl font-bold text-gray-800">৳ {formatNumber(availableBalance)}</p>
        </div>

        {/* Form Card */}
        <div className=" rounded-2xl p-4 mb-4 ">
          {/* Active Bonus */}
          {hasActiveBonus && (
            <div className="bg-red-50 border border-red-200 text-red-500 p-3 rounded-xl mb-4 text-xs">
              <p className="font-semibold mb-1">{t.activeBonus || 'Active Bonus'}</p>
              <p className="text-gray-600">{t.activeBonusMessage?.replace('{amount}', formatNumber(userData.bonusBalance))}</p>
              {userData?.waigeringneed > 0 && userData?.bonusBalance > 0 && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${wageringProgress >= 100 ? 'bg-green-500' : 'bg-yellow-400'}`} style={{ width: `${wageringProgress}%` }}></div></div>
                  <p className="text-gray-500 text-[10px] mt-1">{t.wageringProgress?.replace('{bet}', formatNumber(userData.total_bet || 0)).replace('{target}', formatNumber(userData.waigeringneed * userData.bonusBalance)).replace('{percent}', wageringProgress.toFixed(0))}</p>
                </div>
              )}
              {bonusCountdown && !bonusCountdown.expired && <p className="mt-1 text-gray-500 text-[10px]">{t.bonusExpiresIn} <span className="font-semibold text-yellow-600">{bonusCountdown.days}d {bonusCountdown.hours}h {bonusCountdown.minutes}m</span></p>}
              {isWageringComplete && <div className="mt-2 p-1.5 bg-green-50 border border-green-200 rounded-lg"><p className="text-green-600 font-semibold text-[10px]">{t.wageringRequirementMet || "Wagering complete!"}</p></div>}
              <div className="mt-2 flex items-center gap-2">
                {!isWageringComplete && <div className="flex items-center gap-1.5"><input type="checkbox" id="cancelBonus" checked={cancelBonus} onChange={(e) => { if (e.target.checked) setShowBonusCancelConfirm(true); else setCancelBonus(false); }} className="h-3 w-3"/><label htmlFor="cancelBonus" className="text-[10px] text-gray-500">{t.cancelBonusCheckbox || 'Cancel bonus'}</label></div>}
                {isWageringComplete && <button className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${transferBonusLoading ? 'bg-gray-200 text-gray-400' : 'bg-green-500 hover:bg-green-600 text-white'}`} onClick={handleTransferBonus} disabled={transferBonusLoading}>{transferBonusLoading ? '...' : (t.transferBonus || 'Transfer to Main')}</button>}
              </div>
            </div>
          )}

          {/* Cancel Confirm (inline modal) */}
          {showBonusCancelConfirm && (
            <div className="bg-gray-50 border border-red-200 rounded-2xl p-4 mb-4">
              <h3 className="text-sm font-bold text-gray-700 mb-2">{t.confirmCancelBonus || 'Cancel Bonus?'}</h3>
              <p className="text-gray-500 text-xs mb-2">{t.cancelBonusMessage}</p>
              <div className="bg-white p-2 rounded-lg border border-gray-100 mb-2"><p className="text-cyan-500 font-semibold text-sm">৳{formatNumber(userData.bonusBalance)}</p></div>
              <p className="text-red-400 text-xs mb-3">{t.cancelBonusWarning}</p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-200" onClick={() => { setShowBonusCancelConfirm(false); setCancelBonus(false); }} disabled={cancelBonusLoading}>{t.cancel || 'Cancel'}</button>
                <button className="flex-1 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-xs font-semibold text-white" onClick={handleCancelBonus} disabled={cancelBonusLoading}>{cancelBonusLoading ? '...' : (t.cancelBonus || 'Confirm')}</button>
              </div>
            </div>
          )}

          {/* Wagering Info */}
          {needsWagering && (
            <div className="bg-purple-50 border border-purple-200 text-purple-600 p-3 rounded-xl mb-4 text-xs">
              <div className="flex items-start gap-2">
                <ImInfo className="text-sm flex-shrink-0 mt-0.5"/>
                <div>
                  <p className="font-semibold mb-1">{t.wageringRequirement || 'Wagering Requirement'}</p>
                  {wageringStatus === 'less-than-1x' && <><p className="text-red-500">{t.wagering1xIncomplete?.replace('{bet}', formatNumber(userData.total_bet || 0)).replace('{target}', formatNumber(userData.total_deposit))}</p><p className="mt-1">{t.wagering1xInstruction?.replace('{amount}', formatNumber(remainingWagering))}</p></>}
                  {(wageringStatus === 'less-than-3x' || wageringStatus === 'less-than-deposit') && <><p>{t.remainingWagering?.replace('{amount}', formatNumber(remainingWagering))}</p><p className="mt-1">{t.commissionWarning}</p>{amount && <div className="mt-1.5 bg-purple-100 p-2 rounded-lg"><p>{t.withdrawalAmount}: ৳{formatNumber(parseFloat(amount))}</p><p>{t.commission}: ৳{formatNumber(parseFloat(amount) * commissionRate)}</p><p className="font-bold">{t.receivable}: ৳{formatNumber(parseFloat(amount) * (1 - commissionRate))}</p></div>}</>}
                  {wageringStatus === 'pending-wagering' && <><p>{t.remainingWagering?.replace('{amount}', formatNumber(remainingWagering))}</p><p className="mt-1">{t.wageringInstruction?.replace('{amount}', formatNumber(userData.waigeringneed * userData.bonusBalance))}</p></>}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && <div className="bg-red-50 border border-red-200 text-red-500 p-3 rounded-xl mb-4 text-xs flex items-center gap-2"><svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span>{error}</span></div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-xl mb-4 text-xs flex items-center gap-2"><svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg><span>{success}</span></div>}

          {/* Payment Method */}
          <p className="text-xs font-semibold text-gray-600 mb-2">{t.paymentMethod || 'Select your preferred payment method'}</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[{id:'bkash',src:'https://images.5949390294.com/mcs-images/bank_type/BKASH/BN_2_20240312225413337.png',label:t.bkash||'Bkash P2P'},{id:'nagad',src:'https://images.5949390294.com/mcs-images/bank_type/NAGAD/BN_2_20240312230148421.png',label:t.nagad||'Nagad P2P'}].map(m => (
              <button key={m.id} onClick={() => setPaymentMethod(m.id)} className={`rounded-xl border-2 p-2.5 flex flex-col items-center gap-1.5 transition-all ${paymentMethod === m.id ? 'border-cyan-400 bg-cyan-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                <img src={m.src} alt={m.id} className="w-10 h-7 object-contain"/>
                <span className="text-[10px] font-bold text-gray-600">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.withdrawalAmount || 'Enter Amount'}</label>
            <div className="relative">
              <input type="number" className="w-full border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-cyan-400 focus:bg-white transition-colors" placeholder={t.amountPlaceholder || 'Minimum 800 BDT'} value={amount} onChange={(e) => setAmount(e.target.value)} min="800" step="100"/>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">৳</span>
            </div>
            <p className="text-[10px] text-red-400 mt-1">*Min & maximum withdrawal amount 800–25000 BDT</p>
          </div>

          {/* Account Number */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              {paymentMethod === 'bkash' ? (t.bkashNumber || 'Bkash Number') : paymentMethod === 'nagad' ? (t.nagadNumber || 'Nagad Number') : 'Rocket Number'}
            </label>
            <input type="text" className="w-full border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-cyan-400 focus:bg-white transition-colors" placeholder={t.bkashPlaceholder || 'Enter wallet number'} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}/>
            <p className="text-[10px] text-gray-400 mt-1">{t.accountNumberFormat || 'Format: 01XXXXXXXXX'}</p>
          </div>

          {/* Transaction Password */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{t.transactionPassword || 'Enter Transaction Password'}</label>
            <div className="relative">
              <input type={showTransactionPassword ? "text" : "password"} className="w-full border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:border-cyan-400 focus:bg-white transition-colors" placeholder={t.transactionPasswordPlaceholder || 'Enter Transaction Password'} value={transactionPassword} onChange={(e) => setTransactionPassword(e.target.value)}/>
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowTransactionPassword(!showTransactionPassword)}>
                {showTransactionPassword ? <FaEyeSlash size={13}/> : <FaEye size={13}/>}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 ${isDisabled ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-cyan-500 hover:bg-cyan-600 text-white'}`}
            onClick={handleWithdrawal}
            disabled={isDisabled}
          >
            {loading
              ? <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{t.processing || 'Processing...'}</>
              : wageringStatus === 'less-than-1x' ? (t.complete1xWagering || 'Complete Wagering First')
              : hasActiveBonus ? (t.cancelOrTransferBonus || 'Cancel or Transfer Bonus')
              : (t.requestWithdrawal || 'Process for success')}
          </button>
        </div>


      </div>
    </div>
  );
};

export default Withdraw;
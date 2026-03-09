import React, { useState, useEffect, useContext } from 'react';
import { useUser } from '../../context/UserContext';
import { 
  FaCopy, 
  FaTimes, 
  FaFacebookF, 
  FaTwitter, 
  FaTelegramPlane, 
  FaWhatsapp, 
  FaUser,
  FaHistory,
  FaCoins,
  FaCheck,
  FaCalendarAlt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { MdArrowBackIosNew } from "react-icons/md";
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import Header from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import { LanguageContext } from '../../context/LanguageContext';
import { GlobeAltIcon } from '@heroicons/react/24/solid';

const Referral = () => {
  const { t, changeLanguage, language } = useContext(LanguageContext);
  const [activeTab, setActiveTab] = useState('invite');
  const [copied, setCopied] = useState(false);
  const [referralData, setReferralData] = useState({
    referralCode: '',
    referredBy: null,
    totalReferrals: 0,
    activeReferrals: 0,
    depositedReferrals: 0,
    totalDepositsByReferrals: 0,
    totalWithdrawalsByReferrals: 0,
    referralEarnings: 0,
    referredUsers: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState(t.myAccount);
  const { userData } = useUser();
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const [feedback, setFeedback] = useState({ type: '', message: '', field: '' });

  const referralLink = `${window.location.origin}/?refer_code=${userData?.referralCode || ''}`;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (userData?._id && (activeTab === 'list' || activeTab === 'reward')) {
      fetchReferralData();
    }
  }, [activeTab, userData]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${API_BASE_URL}/user/referred-users-details/${userData?._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setReferralData(response.data.data);
      } else {
        throw new Error(t.referralFetchError);
      }
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setError(err.response?.data?.message || err.message || t.referralFetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocialMedia = (platform) => {
    let url = '';
    const text = `${t.referralShareText} ${referralLink}`;
    
    switch(platform) {
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateString) => {
    if (!dateString) return t.na;
    const date = new Date(dateString);
    return date.toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', {
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatMobileNumber = (number) => {
    if (!number || number.length < 7) return number;
    const firstPart = number.substring(0, 4);
    const lastPart = number.substring(number.length - 3);
    return `${firstPart}****${lastPart}`;
  };

  const transferToMainBalance = async () => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/user/transfer-refer-balance-to-main-balance`,
        { userId: userData._id },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        setFeedback({
          type: 'success',
          message: t.referralTransferSuccess,
          field: 'referralEarnings'
        });
        setReferralData(prevData => ({
          ...prevData,
          referralEarnings: 0
        }));
      } else {
        throw new Error(t.referralTransferError);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || err.message || t.referralTransferError,
        field: 'referralEarnings'
      });
    }
  };

  const toggleLanguage = () => {
    changeLanguage(
      language.code === 'bn'
        ? { code: 'en', name: 'English', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/US.svg' }
        : { code: 'bn', name: 'বাংলা', flag: 'https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/BD.svg' }
    );
  };

  return (
    <section className="min-h-screen font-anek pb-[90px] md:pb-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      
      <div className="flex w-full">
         <div className="w-full mx-auto">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 py-3 px-3 mb-4">
              <div className="flex items-center">
                <button 
                  onClick={() => navigate(-1)}
                  className="mr-3 p-1 rounded-full text-cyan-500 hover:bg-gray-700 transition-colors"
                >
                  <MdArrowBackIosNew />
                </button>
                <h1 className="text-base font-bold text-gray-200">{t.referralProgramTitle}</h1>
              </div>
            </header>

             <div className='p-[10px]'>

            {feedback.message && (
              <div className={`mb-4 p-3 rounded ${feedback.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
                {feedback.message}
                <button 
                  onClick={() => setFeedback({ type: '', message: '', field: '' })}
                  className="float-right font-bold"
                >
                  <FaTimes />
                </button>
              </div>
            )}
            <div className="bg-gray-800 rounded-[5px] border border-gray-700 shadow-lg p-4 mb-4">
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-4 text-white overflow-x-auto pb-2">
                <button
                  className={`px-3 py-1 rounded text-sm whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'invite' ? 'bg-cyan-500 text-gray-900' : 'bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('invite')}
                >
                  <FaUser size={12} /> {t.referralTabInvite}
                </button>
                <button
                  className={`px-3 py-1 rounded text-sm whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'list' ? 'bg-cyan-500 text-gray-900' : 'bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('list')}
                >
                  <FaHistory size={12} /> {t.referralTabList}
                </button>
                <button
                  className={`px-3 py-1 rounded text-sm whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'reward' ? 'bg-cyan-500 text-gray-900' : 'bg-gray-700'
                  }`}
                  onClick={() => setActiveTab('reward')}
                >
                  <FaCoins size={12} /> {t.referralTabReward}
                </button>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center h-64">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
                    <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 p-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Invite Tab Content */}
              {!loading && activeTab === 'invite' && (
                <div>
                  <div className="mb-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
                    <h4 className="font-medium mb-2 text-cyan-400">{t.referralLinkTitle}</h4>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-600 rounded bg-gray-800 text-white text-xs"
                        value={referralLink}
                        readOnly
                      />
                      <button 
                        className="bg-cyan-500 hover:bg-cyan-600 text-gray-900 px-2 py-2 rounded flex items-center gap-1 text-xs"
                        onClick={handleCopyLink}
                      >
                        <FaCopy className="text-xs" /> {copied ? t.referralCopied : t.referralCopy}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-cyan-400">{t.referralShareSocial}</h4>
                    <div className="flex gap-2">
                      <button 
                        className="bg-theme_color2 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                        onClick={() => shareOnSocialMedia('facebook')}
                      >
                        <FaFacebookF />
                      </button>
                      <button 
                        className="bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-full transition-colors"
                        onClick={() => shareOnSocialMedia('twitter')}
                      >
                        <FaTwitter />
                      </button>
                      <button 
                        className="bg-blue-500 hover:bg-theme_color2 text-white p-2 rounded-full transition-colors"
                        onClick={() => shareOnSocialMedia('telegram')}
                      >
                        <FaTelegramPlane />
                      </button>
                      <button 
                        className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                        onClick={() => shareOnSocialMedia('whatsapp')}
                      >
                        <FaWhatsapp />
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Referred List Tab Content */}
              {!loading && activeTab === 'list' && (
                <div className="overflow-x-auto border text-white border-gray-600 rounded-lg">
                  <table className="min-w-full">
                    <thead className="bg-gray-700 text-white">
                      <tr>
                        <th className="py-2 px-3 text-left text-xs border-b border-gray-600">{t.referralTableUser}</th>
                        <th className="py-2 px-3 text-left text-xs border-b border-gray-600">{t.referralTableDate}</th>
                        <th className="py-2 px-3 text-left text-xs border-b border-gray-600">{t.referralTableReward}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralData.referredUsers.length > 0 ? (
                        referralData.referredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-700/50">
                            <td className="py-2 px-3 border-b border-gray-600">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                                  <FaUser size={10} />
                                </div>
                                <div>
                                  <p className="text-xs font-medium">{user.username}</p>
                                  {user.phone && (
                                    <p className="text-xxs text-gray-400">{formatMobileNumber(user.phone)}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2 px-3 border-b border-gray-600 text-xs">
                              <div className="flex items-center gap-1">
                                <FaCalendarAlt size={10} className="text-gray-400" />
                                {formatDate(user.joinDate)}
                              </div>
                            </td>
                            <td className="py-2 px-3 border-b border-gray-600 text-xs font-medium">
                              {`৳${formatCurrency(user.earnedAmount)}` || '৳0.00'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="py-6 text-center text-gray-500 text-xs">
                            <div className="flex flex-col items-center justify-center">
                              <FaUser className="text-gray-600 mb-2" size={20} />
                              <p>{t.referralNoFriends}</p>
                              <p className="mt-1">{t.referralInviteFriends}</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Reward Tab Content */}
              {!loading && activeTab === 'reward' && (
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-700 p-3 rounded shadow border border-gray-600">
                      <p className="text-xs text-gray-400">{t.referralTotalInvites}</p>
                      <p className="text-lg font-bold text-cyan-400">
                        {referralData.totalReferrals}
                      </p>
                    </div>
                    <div className="bg-gray-700 p-3 rounded shadow border border-gray-600">
                      <p className="text-xs text-gray-400">{t.referralTotalEarnings}</p>
                      <p className="text-lg font-bold text-cyan-400">
                        ৳{formatCurrency(referralData.referralEarnings)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 p-3 rounded-lg border border-gray-600">
                    {referralData.referralEarnings >= 1000 ? (
                      <>
                        <p className="text-xs text-gray-300 mb-1">{t.referralEligibleText}</p>
                        <p className="text-xs text-gray-300 mb-1">{t.referralBonusText}: ৳{formatCurrency(referralData.referralEarnings)}</p>
                        <p className="text-xs text-gray-300 mb-2">{t.referralCodeText}: {referralData.referralCode}</p>
                        <button 
                          className="w-full bg-cyan-500 hover:bg-cyan-600 text-gray-900 py-2 px-4 rounded text-sm font-medium"
                          onClick={transferToMainBalance}
                        >
                          {t.referralTransferButton}
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-300 mb-1">{t.referralCodeText}: {referralData.referralCode}</p>
                        <p className="text-xs text-gray-300">{t.referralNotEligible}</p>
                        <div className="mt-2 bg-gray-800 p-2 rounded border border-amber-500/30">
                          <p className="text-xxs text-amber-400">{t.referralThresholdText}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
             </div>
            
          </div>
      </div>
      <Toaster />
    </section>
  );
};

export default Referral;
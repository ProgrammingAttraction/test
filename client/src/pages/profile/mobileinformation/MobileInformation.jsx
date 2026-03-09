import React, { useState, useContext } from 'react';
import { FaMobile, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import axios from 'axios';
import { LanguageContext } from '../../../context/LanguageContext';


const MobileInformation = () => {
  const { t, language } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const navigate = useNavigate();
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileTransactionPassword, setMobileTransactionPassword] = useState('');
  const [confirmMobileTransactionPassword, setConfirmMobileTransactionPassword] = useState('');
  const [showTransactionPassword, setShowTransactionPassword] = useState(false);
  const [feedback, setFeedback] = useState({
    type: '',
    message: '',
    field: ''
  });

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Format mobile number to show first 4 and last 3 digits
  const formatMobileNumber = (number) => {
    if (!number || number.length < 7) return number;
    const firstPart = number.substring(0, 4);
    const lastPart = number.substring(number.length - 3);
    return `${firstPart}****${lastPart}`;
  };

  // Handle adding mobile number
  const handleAddMobile = async (e) => {
    if (e) e.preventDefault();
    
    // Validation
    if (!/^[0-9]{10,15}$/.test(mobileNumber)) {
      setFeedback({
        type: 'error',
        message: t.invalidMobileFormat,
        field: 'mobile'
      });
      return;
    }

    if (mobileTransactionPassword !== confirmMobileTransactionPassword) {
      setFeedback({
        type: 'error',
        message: t.transactionPasswordMismatch,
        field: 'mobile'
      });
      return;
    }

    try {
      const response = await axios.post(`${base_url}/user/add-mobile`, {
        userId: userData._id,
        mobileNumber,
        transactionPassword: mobileTransactionPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFeedback({
        type: 'success',
        message: t.mobileAddSuccess,
        field: 'mobile'
      });

      // Reset form
      setMobileNumber('');
      setMobileTransactionPassword('');
      setConfirmMobileTransactionPassword('');

      // Refresh user data
      fetchUserData();

    } catch (err) {
      console.log(err)
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || t.mobileAddError,
        field: 'mobile'
      });
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen font-anek text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 py-3 px-3 sticky top-0 z-10">
        <div className="container mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full text-cyan-500 cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <MdArrowBackIosNew/>
          </button>
          <h1 className="text-base font-bold text-gray-200">{t.mobileInformationTitle}</h1>
        </div>
      </header>

      <div className="container mx-auto px-3 py-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
              <FaMobile className="text-sm" />
              {t.mobileNumber}
            </h3>
          </div>
                  
            {/* Security Tips */}
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow mb-6 border border-gray-600">
              <h4 className="font-medium mb-3 text-cyan-400 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                {t.securityTips}
              </h4>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{t.securityTip1}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{t.securityTip2}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{t.securityTip3}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{t.securityTip4}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{t.securityTip5}</span>
                </div>
                 <div className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{t.securityTip6}</span>
                </div>
              </div>
            </div>
          {/* Mobile Number Section */}
          <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg shadow mb-6 border border-gray-600">
            <h4 className="font-medium mb-4 text-cyan-400 flex items-center gap-2">
              <FaMobile />
              {t.mobileNumber}
            </h4>
            
            {feedback.message && (
              <div className={`mb-3 p-3 rounded text-sm ${
                feedback.type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'
              }`}>
                {feedback.message}
              </div>
            )}
            
            {userData?.phone ? (
              <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
                <div>
                  <p className="text-sm text-gray-400">{t.yourMobileNumber}</p>
                  <p className="text-white font-medium">{formatMobileNumber(userData.phone)}</p>
                </div>
                <span className="bg-green-50 bg-opacity-20 text-green-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="text-green-600">✓</span>
                  {t.verified}
                </span>
              </div>
            ) : (
              <>
                <div className="bg-yellow-500 bg-opacity-10 border text-gray-800 border-yellow-500 border-opacity-30 p-3 rounded mb-4">
                  <p className="text-sm  flex items-center gap-2">
                    {t.mobileRequiredNote}
                  </p>
                </div>
                <form onSubmit={handleAddMobile}>
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t.mobileNumber}</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500">+88</span>
                        </div>
                        <input
                          type="text"
                          className="w-full pl-12 p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder={t.mobilePlaceholder}
                          maxLength={11}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t.transactionPassword}</label>
                      <div className="relative">
                        <input
                          type={showTransactionPassword ? "text" : "password"}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                          value={mobileTransactionPassword}
                          onChange={(e) => setMobileTransactionPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder={t.transactionPasswordPlaceholder}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                          onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                        >
                          {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">{t.confirmPassword}</label>
                      <div className="relative">
                        <input
                          type={showTransactionPassword ? "text" : "password"}
                          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white text-sm"
                          value={confirmMobileTransactionPassword}
                          onChange={(e) => setConfirmMobileTransactionPassword(e.target.value)}
                          required
                          minLength={6}
                          placeholder={t.confirmPasswordPlaceholder}
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-2 text-gray-500 hover:text-gray-300"
                          onClick={() => setShowTransactionPassword(!showTransactionPassword)}
                        >
                          {showTransactionPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                    >
                      {t.saveMobileNumber}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileInformation;
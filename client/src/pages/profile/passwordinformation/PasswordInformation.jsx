import React, { useState, useContext } from 'react';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdArrowBackIosNew } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import axios from 'axios';
import { LanguageContext } from '../../../context/LanguageContext';

const PasswordInformation = () => {
  const { t } = useContext(LanguageContext);
  const { userData, fetchUserData } = useUser();
  const navigate = useNavigate();
  
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [currentLoginPassword, setCurrentLoginPassword] = useState('');
  const [newLoginPassword, setNewLoginPassword] = useState('');
  const [confirmLoginPassword, setConfirmLoginPassword] = useState('');
  const [feedback, setFeedback] = useState({
    type: '',
    message: '',
    field: ''
  });

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Handle login password change
  const handleLoginPasswordChange = async (e) => {
    e.preventDefault();
    
    // Validation
    if (newLoginPassword !== confirmLoginPassword) {
      setFeedback({
        type: 'error',
        message: t.loginPasswordMismatch || 'New passwords do not match',
        field: 'loginPassword'
      });
      return;
    }

    if (newLoginPassword.length < 6) {
      setFeedback({
        type: 'error',
        message: t.passwordLengthError || 'Password must be at least 6 characters',
        field: 'loginPassword'
      });
      return;
    }

    try {
      const response = await axios.put(`${base_url}/user/update-account-password`, {
        userId: userData._id,
        currentPassword: currentLoginPassword,
        newPassword: newLoginPassword
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFeedback({
        type: 'success',
        message: t.loginPasswordChangeSuccess || 'Login password updated successfully!',
        field: 'loginPassword'
      });

      // Reset form
      setCurrentLoginPassword('');
      setNewLoginPassword('');
      setConfirmLoginPassword('');

      // Refresh user data
      fetchUserData();

    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || t.loginPasswordChangeError || 'Failed to update password',
        field: 'loginPassword'
      });
    }
  };

  return (
    <div className="min-h-screen font-anek" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header className="py-3 px-3 sticky top-0 z-10" style={{ backgroundColor: '#1A1A2E', borderBottom: '1px solid #e0e0e0' }}>
        <div className="container mx-auto flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-3 p-1 rounded-full cursor-pointer transition-colors"
            style={{ color: '#fff' }}
          >
            <MdArrowBackIosNew />
          </button>
          <h1 className="text-base font-bold" style={{ color: '#fff' }}>{t.passwordInformationTitle || 'Password Information'}</h1>
        </div>
      </header>

      <div className="container mx-auto px-3 py-6">
        <div className="rounded-xl p-6 shadow-sm max-w-2xl mx-auto" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#4a90e2' }}>
              <FaLock className="text-sm" />
              {t.passwordUpdate || 'Password Update'}
            </h3>
          </div>

          {/* Login Password Change */}
          <div className="py-3 " >
            
            {feedback.field === 'loginPassword' && (
              <div className={`mb-4 p-3 rounded text-sm ${
                feedback.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {feedback.message}
              </div>
            )}
            
            <form onSubmit={handleLoginPasswordChange}>
              <div className="space-y-5 mb-5">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                    {t.currentLoginPassword || 'Current Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      className="w-full p-3 border rounded-lg text-sm outline-theme_color2 "
                      style={{ 
                        backgroundColor: '#ffffff',
                        borderColor: '#e0e0e0',
                        color: '#333333'
                      }}
                      value={currentLoginPassword}
                      onChange={(e) => setCurrentLoginPassword(e.target.value)}
                      required
                      placeholder={t.currentLoginPasswordPlaceholder || 'Enter current password'}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 transition-colors"
                      style={{ color: '#888888' }}
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                    {t.newLoginPassword || 'New Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      className="w-full p-3 border rounded-lg text-sm outline-theme_color2  "
                      style={{ 
                        backgroundColor: '#ffffff',
                        borderColor: '#e0e0e0',
                        color: '#333333'
                      }}
                      value={newLoginPassword}
                      onChange={(e) => setNewLoginPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder={t.newPasswordPlaceholder || 'Enter new password'}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#555555' }}>
                    {t.confirmPassword || 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      className="w-full p-3 border rounded-lg text-sm outline-theme_color2 "
                      style={{ 
                        backgroundColor: '#ffffff',
                        borderColor: '#e0e0e0',
                        color: '#333333'
                      }}
                      value={confirmLoginPassword}
                      onChange={(e) => setConfirmLoginPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder={t.confirmPasswordPlaceholder || 'Confirm new password'}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-theme_color2 flex items-center gap-2 transition-colors hover:opacity-90"
                >
                  {t.changePasswordButton || 'Update Password'}
                </button>
              </div>
            </form>
          </div>

   
        </div>
      </div>
    </div>
  );
};

export default PasswordInformation;
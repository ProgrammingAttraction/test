import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaSignOutAlt } from 'react-icons/fa';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { NavLink, useNavigate } from 'react-router-dom';

import man from "../../assets/profileimages/man.png";
import man1 from "../../assets/profileimages/man1.png";
import { useUser } from '../../context/UserContext';
import { LanguageContext } from '../../context/LanguageContext';

import bronze_img from "../../assets/level/badge.png";
import silver_img from "../../assets/level/silver.png";
import gold_img from "../../assets/level/medal.png";
import diamond_img from "../../assets/level/diamond.png";
import platinum_img from "../../assets/level/platinum.png";

const profileImages = [man, man1];

const Profile = () => {
    const { t, language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const { userData, loading, error, fetchUserData, logout } = useUser();

    const [activeTab, setActiveTab] = useState('account');
    const [mobileNumber, setMobileNumber] = useState('');
    const [mobileTransactionPassword, setMobileTransactionPassword] = useState('');
    const [confirmMobileTransactionPassword, setConfirmMobileTransactionPassword] = useState('');

    const base_url = import.meta.env.VITE_API_KEY_Base_URL;

    const [feedback, setFeedback] = useState({ type: '', message: '', field: '' });

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const [showMobileAlert, setShowMobileAlert] = useState(false);
    const [alertContext, setAlertContext] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const levels = [
        { name: t.levelBronze || 'Bronze', threshold: 0, icon: bronze_img, color: '#cd7f32' },
        { name: t.levelSilver || 'Silver', threshold: 10000, icon: silver_img, color: '#c0c0c0' },
        { name: t.levelGold || 'Gold', threshold: 30000, icon: gold_img, color: '#ffd700' },
        { name: t.levelPlatinum || 'Platinum', threshold: 100000, icon: platinum_img, color: '#00bcd4' },
        { name: t.levelDiamond || 'Diamond', threshold: 500000, icon: diamond_img, color: '#a855f7' }
    ];

    const calculateLevelData = () => {
        const lifetimeDeposit = userData?.lifetime_bet || 0;
        let currentLevel = levels[0];
        let nextLevel = null;
        for (let i = levels.length - 1; i >= 0; i--) {
            if (lifetimeDeposit >= levels[i].threshold) {
                currentLevel = levels[i];
                nextLevel = i < levels.length - 1 ? levels[i + 1] : null;
                break;
            }
        }
        let progressPercentage = 0;
        if (nextLevel) {
            const range = nextLevel.threshold - currentLevel.threshold;
            const progress = lifetimeDeposit - currentLevel.threshold;
            progressPercentage = Math.min(100, Math.round((progress / range) * 100));
        } else {
            progressPercentage = 100;
        }
        return { currentLevel, nextLevel, progressPercentage, lifetimeDeposit };
    };

    const levelData = calculateLevelData();

    const formatBalance = (amount) => {
        if (amount === undefined || amount === null) return language.code === 'bn' ? '০.০০' : '0.00';
        return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 }).format(amount);
    };

    const getProfileImage = (username) => {
        if (!username) return man;
        let hash = 0;
        for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
        return profileImages[Math.abs(hash) % profileImages.length];
    };

    const handleLogoutClick = () => setShowLogoutConfirm(true);
    const cancelLogout = () => setShowLogoutConfirm(false);
    const confirmLogout = () => {
        navigate('/');
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        logout();
    };

    const checkMobileBeforeAction = (actionType) => {
        if (!userData?.phone) { setShowMobileAlert(true); setAlertContext(actionType); return false; }
        return true;
    };

    const handleDeposit = (e) => { e.preventDefault(); if (checkMobileBeforeAction('deposit')) navigate('/deposit'); };
    const handleWithdraw = (e) => { e.preventDefault(); if (checkMobileBeforeAction('withdraw')) navigate('/withdraw'); };

    const handleAddMobile = async (e) => {
        if (e) e.preventDefault();
        if (mobileTransactionPassword !== confirmMobileTransactionPassword) {
            setFeedback({ type: 'error', message: t.transactionPasswordMismatch, field: 'mobile' });
            return;
        }
        try {
            await axios.post(`${base_url}/user/add-mobile`, {
                userId: userData._id, mobileNumber, transactionPassword: mobileTransactionPassword
            }, { headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
            setFeedback({ type: 'success', message: t.mobileAddSuccess, field: 'mobile' });
            setMobileNumber(''); setMobileTransactionPassword(''); setConfirmMobileTransactionPassword('');
            setShowMobileAlert(false); fetchUserData();
        } catch (err) {
            setFeedback({ type: 'error', message: err.response?.data?.message || t.mobileAddError, field: 'mobile' });
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-500"></div>
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-500 min-h-screen bg-gray-100">
            {t.error}: {error}
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen font-anek">

            {/* Header */}
            <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={() => navigate("/")}
                    className="bg-transparent border-none cursor-pointer text-white flex items-center"
                >
                    <MdArrowBackIosNew className="text-xl" />
                </button>
                <h1 className="text-white font-bold text-lg m-0">{t.profileTitle || 'Profile'}</h1>
                <div className="w-7"></div>
            </div>

            {/* Logout Confirm Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-xl p-6 max-w-xs w-full">
                        <h3 className="text-red-600 font-bold mb-2">{t.logoutConfirmTitle || 'Logout?'}</h3>
                        <p className="text-gray-500 text-sm mb-5">{t.logoutConfirmText || 'Are you sure you want to logout?'}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelLogout}
                                className="flex-1 py-2 px-3 bg-gray-200 border-none rounded-lg cursor-pointer font-semibold"
                            >
                                {t.cancel || 'Cancel'}
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 py-2 px-3 bg-red-600 text-white border-none rounded-lg cursor-pointer font-semibold"
                            >
                                {t.logout || 'Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Alert Modal */}
            {showMobileAlert && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full">
                        <h3 className="text-cyan-500 font-bold mb-3">{t.mobileRequiredTitle || 'Mobile Required'}</h3>
                        <p className="text-gray-500 text-xs mb-4 border-l-4 border-cyan-500 pl-3">
                            {alertContext === 'deposit' ? t.mobileRequiredDeposit : t.mobileRequiredWithdraw}
                        </p>
                        <form onSubmit={handleAddMobile}>
                            <div className="mb-3">
                                <label className="block text-xs text-cyan-500 mb-1">{t.mobileNumber || 'Mobile Number'}</label>
                                <input
                                    type="text"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                    placeholder={t.mobilePlaceholder || '017xxxxxxxx'}
                                    maxLength={15}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm box-border outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs text-cyan-500 mb-1">{t.transactionPassword || 'Transaction Password'}</label>
                                <input
                                    type="password"
                                    value={mobileTransactionPassword}
                                    onChange={(e) => setMobileTransactionPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm box-border outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs text-cyan-500 mb-1">{t.confirmPassword || 'Confirm Password'}</label>
                                <input
                                    type="password"
                                    value={confirmMobileTransactionPassword}
                                    onChange={(e) => setConfirmMobileTransactionPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm box-border outline-none focus:border-cyan-500"
                                />
                            </div>
                            {feedback.message && feedback.field === 'mobile' && (
                                <div className={`px-3 py-2 rounded-lg text-xs mb-3 ${
                                    feedback.type === 'success'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {feedback.message}
                                </div>
                            )}
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowMobileAlert(false)}
                                    className="py-2 px-4 bg-gray-200 border-none rounded-lg cursor-pointer font-semibold text-sm"
                                >
                                    {t.cancel || 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    className="py-2 px-4 bg-cyan-500 text-white border-none rounded-lg cursor-pointer font-semibold text-sm"
                                >
                                    {t.save || 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="pb-6 max-w-md mx-auto">

                {/* Teal Hero Card */}
                <div className="mx-3 mt-3 rounded-2xl p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,188,212,0.3)] bg-[#00B4D8]">

                    {/* Level badge top right */}
                    <div className="absolute top-3 right-3 bg-white/20 rounded-full px-3 py-0.5 text-[11px] text-white font-semibold">
                        {t.level || 'Level'} {levelData.currentLevel.name}
                    </div>

                    {/* Top row: Avatar + ID */}
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center overflow-hidden border-2 border-white/50">
                                <img
                                    src={getProfileImage(userData?.username)}
                                    alt={t.profile || 'Profile'}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="text-white/80 text-xs mb-0.5">{t.playerId || 'Customer ID'}:</div>
                            <div className="text-white font-bold text-base tracking-wide">{userData?.player_id || '123456789'}</div>
                            <div className="text-white/70 text-[11px] mt-0.5">{t.level || 'Level'} {levelData.currentLevel.name}</div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="h-1 bg-white/20 rounded-sm overflow-hidden">
                            <div
                                className="h-full bg-white/70 rounded-sm transition-all duration-500"
                                style={{ width: `${levelData.progressPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Balance Row */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                            <div className="text-white/70 text-[10px] mb-0.5">{t.mainBalance || 'Main Balance'}</div>
                            <div className="text-white font-bold text-sm">{formatBalance(userData?.balance)}</div>
                        </div>
                        <div className="text-center border-l border-r border-white/20">
                            <div className="text-white/70 text-[10px] mb-0.5">{t.bonusBalance || 'Bonus Balance'}</div>
                            <div className="text-white font-bold text-sm">{formatBalance(userData?.bonusBalance)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-white/70 text-[10px] mb-0.5">{t.referralBalance || 'Refer Bonus'}</div>
                            <div className="text-white font-bold text-sm">{formatBalance(userData?.referralEarnings)}</div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 px-3 pb-3 pt-3 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'account', label: t.account || 'Account' },
                        { id: 'transaction', label: t.transaction || 'Transaction', path: '/account-history' },
                        { id: 'bethistory', label: t.bettingHistory || 'Bet History', path: '/betting-history' },
                        { id: 'referral', label: t.referral || 'Referral', path: '/refer-programme' },
                    ].map((tab) => (
                        tab.path ? (
                            <NavLink
                                key={tab.id}
                                to={tab.path}
                                className="flex-shrink-0 px-4 py-1.5 rounded-[5px] text-xs font-semibold no-underline border border-gray-300 text-gray-100 bg-[#D0B1F9]"
                            >
                                {tab.label}
                            </NavLink>
                        ) : (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 px-4 py-1.5 rounded-[5px] text-xs font-semibold border-none cursor-pointer transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-[#E46248] text-white '
                                        : 'bg-[#E46248] text-gray-500'
                                }`}
                            >
                                {tab.label}
                            </button>
                        )
                    ))}
                </div>

                {/* Activity & Status Section */}
                <div className="px-3 pb-2.5">
                    <div className="text-gray-400 text-xs font-semibold mb-2 pl-1">{t.activity || 'Activity'} & {t.status || 'Status'}</div>
                    <div className="bg-[#e8e0f0] p-[10px] rounded-xl overflow-hidden ">
                      <div className='bg-white rounded-xl'>
                          {[
                            { label: t.username || 'Name', value: userData?.username || '-', path: '/profile-information', editable: true },
                            { label: t.dateOfBirth || 'Date of Birth', value: userData?.dob || '-', path: '/profile-information', locked: true },
                            { label: t.email || 'Email', value: userData?.email || '-', path: '/profile-information', locked: true },
                            { label: t.kyc || 'KYC', value: userData?.kyc_status || t.submitKYC || 'Submit KYC', path: '/kyc', arrow: true },
                        ].map((item, i, arr) => (
                            <NavLink
                                key={i}
                                to={item.path}
                                className={`flex items-center justify-between px-4 py-3 no-underline text-inherit bg-transparent ${
                                    i < arr.length - 1 ? 'border-b border-[rgba(200,190,220,0.5)]' : ''
                                }`}
                            >
                                <span className="text-sm text-gray-800 font-medium">{item.label}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] text-gray-500">{item.value}</span>
                                    {(item.arrow || item.editable) && <MdArrowForwardIos className="text-gray-400 text-sm" />}
                                </div>
                            </NavLink>
                        ))}
                      </div>
                    </div>
                </div>

                {/* Password & Security Section */}
                <div className="px-3 py-2 pb-2.5">
                    <div className="text-gray-400 text-xs font-semibold mb-2 pl-1">{t.password || 'Password'} & {t.security || 'Security'}</div>
                         <div className="bg-[#e8e0f0] p-[10px] rounded-xl overflow-hidden ">
                      <div className='bg-white rounded-xl'>  
                          {[
                            { label: t.passwordUpdate || 'Password Update', path: '/password-information' },
                            { label: t.transactionPassword || 'Trx Password Update', path: '/mobile-information' },
                            { label: t.resetTransactionPassword || 'Reset Trx Password', path: '/mobile-information' },
                        ].map((item, i, arr) => (
                            <NavLink
                                key={i}
                                to={item.path}
                                className={`flex items-center justify-between px-4 py-3 no-underline text-inherit ${
                                    i < arr.length - 1 ? 'border-b border-[rgba(200,190,220,0.5)]' : ''
                                }`}
                            >
                                <span className="text-sm text-gray-800 font-medium">{item.label}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-gray-500">{t.edit || 'Edit'}</span>
                                    <MdArrowForwardIos className="text-gray-400 text-sm" />
                                </div>
                            </NavLink>
                        ))}

                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <div className="px-3 pt-2 pb-6">
                    <button
                        onClick={handleLogoutClick}
                        className="w-full py-3 px-4 bg-[#e8e0f0] border-none rounded-xl flex items-center justify-between cursor-pointer"
                    >
                        <span className="text-sm text-red-600 font-semibold flex items-center gap-2">
                            <FaSignOutAlt /> {t.logout || 'Logout'}
                        </span>
                        <MdArrowForwardIos className="text-red-600 text-sm" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Profile;
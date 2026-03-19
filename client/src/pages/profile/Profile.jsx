import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FaSignOutAlt, FaLock } from 'react-icons/fa';
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

// ─── localStorage key helpers (per user) ─────────────────────────────────────
const usernameUpdatedKey = (userId) => `username_updated_${userId}`;
const dobUpdatedKey      = (userId) => `dob_updated_${userId}`;

const Profile = () => {
    const { t, language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const { userData, loading, error, fetchUserData, logout } = useUser();

    const base_url = import.meta.env.VITE_API_KEY_Base_URL;

    // ─── Profile field states ────────────────────────────────────────────────
    const [editableUsername, setEditableUsername]             = useState('');
    const [editableDob, setEditableDob]                       = useState('');
    const [isEditingUsername, setIsEditingUsername]           = useState(false);
    const [isEditingDob, setIsEditingDob]                     = useState(false);
    const [hasUsernameBeenUpdated, setHasUsernameBeenUpdated] = useState(false);
    const [hasDobBeenUpdated, setHasDobBeenUpdated]           = useState(false);

    // ─── Modal / alert states ────────────────────────────────────────────────
    const [mobileNumber, setMobileNumber]                                           = useState('');
    const [mobileTransactionPassword, setMobileTransactionPassword]                 = useState('');
    const [confirmMobileTransactionPassword, setConfirmMobileTransactionPassword]   = useState('');
    const [feedback, setFeedback]             = useState({ type: '', message: '', field: '' });
    const [showMobileAlert, setShowMobileAlert]     = useState(false);
    const [alertContext, setAlertContext]           = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    // ─── Sync userData → local state + one-time lock detection ───────────────
    useEffect(() => {
        if (!userData) return;

        // Username
        if (userData.username) setEditableUsername(userData.username);
        const uKey = usernameUpdatedKey(userData._id);
        const usernameAlreadyUpdated =
            !!userData.username_updated ||           // server flag (if backend supports it)
            localStorage.getItem(uKey) === 'true';   // localStorage fallback (always reliable)
        setHasUsernameBeenUpdated(usernameAlreadyUpdated);

        // Date of Birth
        const dKey = dobUpdatedKey(userData._id);
        if (userData.dateOfBirth) {
            const dob = new Date(userData.dateOfBirth);
            setEditableDob(dob.toISOString().split('T')[0]);
            setHasDobBeenUpdated(true);
            localStorage.setItem(dKey, 'true'); // keep in sync
        } else {
            setHasDobBeenUpdated(localStorage.getItem(dKey) === 'true');
        }
    }, [userData]);

    // ─── Level system ────────────────────────────────────────────────────────
    const levels = [
        { name: t.levelBronze   || 'Bronze',   threshold: 0,      icon: bronze_img,   color: '#cd7f32' },
        { name: t.levelSilver   || 'Silver',   threshold: 10000,  icon: silver_img,   color: '#c0c0c0' },
        { name: t.levelGold     || 'Gold',     threshold: 30000,  icon: gold_img,     color: '#ffd700' },
        { name: t.levelPlatinum || 'Platinum', threshold: 100000, icon: platinum_img, color: '#00bcd4' },
        { name: t.levelDiamond  || 'Diamond',  threshold: 500000, icon: diamond_img,  color: '#a855f7' },
    ];

    const calculateLevelData = () => {
        const lifetimeDeposit = userData?.lifetime_bet || 0;
        let currentLevel = levels[0];
        let nextLevel    = null;
        for (let i = levels.length - 1; i >= 0; i--) {
            if (lifetimeDeposit >= levels[i].threshold) {
                currentLevel = levels[i];
                nextLevel    = i < levels.length - 1 ? levels[i + 1] : null;
                break;
            }
        }
        let progressPercentage = 0;
        if (nextLevel) {
            const range    = nextLevel.threshold - currentLevel.threshold;
            const progress = lifetimeDeposit - currentLevel.threshold;
            progressPercentage = Math.min(100, Math.round((progress / range) * 100));
        } else {
            progressPercentage = 100;
        }
        return { currentLevel, nextLevel, progressPercentage, lifetimeDeposit };
    };

    const levelData = calculateLevelData();

    // ─── Helpers ─────────────────────────────────────────────────────────────
    const formatBalance = (amount) => {
        if (amount === undefined || amount === null)
            return language.code === 'bn' ? '০.০০' : '0.00';
        return new Intl.NumberFormat(
            language.code === 'bn' ? 'bn-BD' : 'en-US',
            { minimumFractionDigits: 2 }
        ).format(amount);
    };

    const getProfileImage = (username) => {
        if (!username) return man;
        let hash = 0;
        for (let i = 0; i < username.length; i++)
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        return profileImages[Math.abs(hash) % profileImages.length];
    };

    // ─── Logout ──────────────────────────────────────────────────────────────
    const handleLogoutClick = () => setShowLogoutConfirm(true);
    const cancelLogout      = () => setShowLogoutConfirm(false);
    const confirmLogout     = () => {
        navigate('/');
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        logout();
    };

    // ─── Mobile guard ─────────────────────────────────────────────────────────
    const checkMobileBeforeAction = (actionType) => {
        if (!userData?.phone) {
            setShowMobileAlert(true);
            setAlertContext(actionType);
            return false;
        }
        return true;
    };

    const handleDeposit  = (e) => { e.preventDefault(); if (checkMobileBeforeAction('deposit'))  navigate('/deposit'); };
    const handleWithdraw = (e) => { e.preventDefault(); if (checkMobileBeforeAction('withdraw')) navigate('/withdraw'); };

    // ─── Add mobile ───────────────────────────────────────────────────────────
    const handleAddMobile = async (e) => {
        if (e) e.preventDefault();
        if (mobileTransactionPassword !== confirmMobileTransactionPassword) {
            setFeedback({ type: 'error', message: t.transactionPasswordMismatch, field: 'mobile' });
            return;
        }
        try {
            await axios.post(
                `${base_url}/user/add-mobile`,
                { userId: userData._id, mobileNumber, transactionPassword: mobileTransactionPassword },
                { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            setFeedback({ type: 'success', message: t.mobileAddSuccess, field: 'mobile' });
            setMobileNumber('');
            setMobileTransactionPassword('');
            setConfirmMobileTransactionPassword('');
            setShowMobileAlert(false);
            fetchUserData();
        } catch (err) {
            setFeedback({ type: 'error', message: err.response?.data?.message || t.mobileAddError, field: 'mobile' });
        }
    };

    // ─── Username update — ONE-TIME ONLY ─────────────────────────────────────
    const handleUsernameUpdate = async () => {
        if (!editableUsername.trim()) {
            setFeedback({ type: 'error', message: 'Username cannot be empty.', field: 'username' });
            return;
        }
        try {
            await axios.put(
                `${base_url}/user/update-username`,
                { userId: userData._id, newUsername: editableUsername.trim() },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            // Save lock flag to localStorage — persists across page reloads
            localStorage.setItem(usernameUpdatedKey(userData._id), 'true');
            setHasUsernameBeenUpdated(true);
            setIsEditingUsername(false);
            setFeedback({ type: 'success', message: t?.usernameUpdateSuccess || 'Username updated successfully!', field: 'username' });
            fetchUserData();
        } catch (err) {
            setFeedback({ type: 'error', message: err.response?.data?.message || t?.error || 'Update failed.', field: 'username' });
        }
    };

    // ─── DOB update — ONE-TIME ONLY ──────────────────────────────────────────
    const handleDobUpdate = async () => {
        if (!editableDob) {
            setFeedback({ type: 'error', message: 'Please select a date of birth.', field: 'dob' });
            return;
        }
        try {
            await axios.put(
                `${base_url}/user/update-dob`,
                { userId: userData._id, dateOfBirth: editableDob },
                { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
            );
            // Save lock flag to localStorage
            localStorage.setItem(dobUpdatedKey(userData._id), 'true');
            setHasDobBeenUpdated(true);
            setIsEditingDob(false);
            setFeedback({ type: 'success', message: t?.dobUpdateSuccess || 'Date of birth updated successfully!', field: 'dob' });
            fetchUserData();
        } catch (err) {
            setFeedback({ type: 'error', message: err.response?.data?.message || t?.error || 'Update failed.', field: 'dob' });
        }
    };

    // ─── Loading / error guards ───────────────────────────────────────────────
    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-500" />
        </div>
    );

    if (error) return (
        <div className="text-center py-8 text-red-500 min-h-screen bg-gray-100">
            {t.error}: {error}
        </div>
    );

    // ─── Reusable components ──────────────────────────────────────────────────

    /** Renders a read-only input with a lock icon on the right */
    const LockedField = ({ value }) => (
        <div className="relative">
            <input
                type="text"
                className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-lg outline-none bg-gray-100 text-gray-600 text-sm cursor-not-allowed select-none"
                value={value || 'N/A'}
                readOnly
            />
            <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none" />
        </div>
    );

    /** Renders success/error feedback for a given field */
    const FeedbackBanner = ({ field }) =>
        feedback.message && feedback.field === field ? (
            <div className={`px-3 py-2 rounded-lg text-xs mb-2 ${
                feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
                {feedback.message}
            </div>
        ) : null;

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="bg-gray-100 min-h-screen font-anek">

            {/* ══ Header ══ */}
            <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={() => navigate("/")}
                    className="bg-transparent border-none cursor-pointer text-white flex items-center"
                >
                    <MdArrowBackIosNew className="text-xl" />
                </button>
                <h1 className="text-white font-bold text-lg m-0">{t.profileTitle || 'Profile'}</h1>
                <div className="w-7" />
            </div>

            {/* ══ Logout Confirm Modal ══ */}
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

            {/* ══ Mobile Alert Modal ══ */}
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
                                    type="text" value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                                    placeholder={t.mobilePlaceholder || '017xxxxxxxx'}
                                    maxLength={15} required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div className="mb-3">
                                <label className="block text-xs text-cyan-500 mb-1">{t.transactionPassword || 'Transaction Password'}</label>
                                <input
                                    type="password" value={mobileTransactionPassword}
                                    onChange={(e) => setMobileTransactionPassword(e.target.value)}
                                    required minLength={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-cyan-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs text-cyan-500 mb-1">{t.confirmPassword || 'Confirm Password'}</label>
                                <input
                                    type="password" value={confirmMobileTransactionPassword}
                                    onChange={(e) => setConfirmMobileTransactionPassword(e.target.value)}
                                    required minLength={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-cyan-500"
                                />
                            </div>
                            <FeedbackBanner field="mobile" />
                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button" onClick={() => setShowMobileAlert(false)}
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

            {/* ══ Page Body ══ */}
            <div className="pb-6 max-w-md mx-auto">

                {/* ── Hero Card ── */}
                <div className="mx-3 mt-3 rounded-2xl p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,188,212,0.3)] bg-[#00B4D8]">
                    <div className="absolute top-3 right-3 bg-white/20 rounded-full px-3 py-0.5 text-[11px] text-white font-semibold">
                        {t.level || 'Level'} {levelData.currentLevel.name}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center overflow-hidden border-2 border-white/50 flex-shrink-0">
                            <img
                                src={getProfileImage(userData?.username)}
                                alt={t.profile || 'Profile'}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="text-white/80 text-xs mb-0.5">{t.playerId || 'Customer ID'}:</div>
                            <div className="text-white font-bold text-base tracking-wide">{userData?.player_id || '—'}</div>
                            <div className="text-white/70 text-[11px] mt-0.5">{t.level || 'Level'} {levelData.currentLevel.name}</div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="h-1 bg-white/20 rounded-sm overflow-hidden">
                            <div
                                className="h-full bg-white/70 rounded-sm transition-all duration-500"
                                style={{ width: `${levelData.progressPercentage}%` }}
                            />
                        </div>
                    </div>
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

                {/* ── Tab Navigation ── */}
                <div className="flex gap-2 px-3 pt-3 pb-3 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'account',     label: t.account       || 'Account' },
                        { id: 'transaction', label: t.transaction    || 'Transaction', path: '/account-history' },
                        { id: 'bethistory',  label: t.bettingHistory || 'Bet History', path: '/betting-history' },
                        { id: 'referral',    label: t.referral       || 'Referral',    path: '/refer-programme' },
                    ].map((tab) =>
                        tab.path ? (
                            <NavLink
                                key={tab.id} to={tab.path}
                                className="flex-shrink-0 px-4 py-1.5 rounded-[5px] text-xs font-semibold no-underline border border-gray-300 text-gray-100 bg-[#D0B1F9]"
                            >
                                {tab.label}
                            </NavLink>
                        ) : (
                            <button
                                key={tab.id}
                                className="flex-shrink-0 px-4 py-1.5 rounded-[5px] text-xs font-semibold border-none cursor-pointer bg-[#E46248] text-white"
                            >
                                {tab.label}
                            </button>
                        )
                    )}
                </div>

                {/* ══════════════════════════════════════
                    Activity & Status — Personal Info
                ══════════════════════════════════════ */}
                <div className="px-3 pb-2.5">
                    <div className="text-gray-400 text-[13px] font-semibold mb-2 pl-1">
                        {t.activity || 'Activity'} &amp; {t.status || 'Status'}
                    </div>
                    <div className="bg-[#e8e0f0] p-[10px] rounded-xl">
                        <div className="bg-white rounded-xl ">

                            {/* Player ID — always locked */}
                            <div className="px-4 py-2">
                                <div className="text-[13px] text-gray-500 mb-1.5 font-medium">{t.playerId || 'Player ID'}</div>
                                <LockedField value={userData?.player_id} />
                            </div>

                            {/* Email — always locked */}
                            <div className="px-4 py-2">
                                <div className="text-[13px] text-gray-500 mb-1.5 font-medium">{t.email || 'Email'}</div>
                                <LockedField value={userData?.email} />
                            </div>

                            {/* Mobile — always locked */}
                            <div className="px-4 py-2">
                                <div className="text-[13px] text-gray-500 mb-1.5 font-medium">{t.mobileNumber || 'Mobile Number'}</div>
                                <LockedField value={userData?.phone} />
                            </div>

                            {/* ── Username — ONE-TIME editable ── */}
                            <div className="px-4 py-2">
                                <div className="text-[13px] text-gray-500 mb-1.5 font-medium">{t.username || 'Username'}</div>
                                <FeedbackBanner field="username" />

                                {hasUsernameBeenUpdated ? (
                                    /* Already updated → permanently locked */
                                    <LockedField value={editableUsername} />
                                ) : isEditingUsername ? (
                                    /* Currently editing */
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 px-3 py-2.5 border border-cyan-400 bg-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-200 transition"
                                            value={editableUsername}
                                            onChange={(e) => setEditableUsername(e.target.value)}
                                            placeholder="Enter new username"
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleUsernameUpdate}
                                            className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors whitespace-nowrap"
                                        >
                                            {t.save || 'Save'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingUsername(false);
                                                setEditableUsername(userData?.username || '');
                                                setFeedback({ type: '', message: '', field: '' });
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors whitespace-nowrap"
                                        >
                                            {t.cancel || 'Cancel'}
                                        </button>
                                    </div>
                                ) : (
                                    /* Not yet updated → tappable row */
                                    <div
                                        className="flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:border-cyan-400 hover:bg-cyan-50 transition-colors"
                                        onClick={() => setIsEditingUsername(true)}
                                    >
                                        <span className="text-sm text-gray-700">{editableUsername || 'Tap to set username'}</span>
                                        <span className="text-[11px] text-cyan-500 font-semibold shrink-0 ml-2">{t.edit || 'Edit'} ›</span>
                                    </div>
                                )}

                                {/* One-time warning — only visible while still editable */}
                                {!hasUsernameBeenUpdated && (
                                    <p className="text-[10px] text-amber-500 mt-1.5 pl-0.5 flex items-center gap-1">
                                        <span>⚠</span>
                                        <span>{t.usernameOneTimeWarning || 'Username can only be changed once.'}</span>
                                    </p>
                                )}
                            </div>

                            {/* ── Date of Birth — ONE-TIME editable ── */}
                            <div className="px-4 py-2">
                                <div className="text-[13px] text-gray-500 mb-1.5 font-medium">{t.dateOfBirth || 'Date of Birth'}</div>
                                <FeedbackBanner field="dob" />

                                {hasDobBeenUpdated ? (
                                    /* Already set → permanently locked */
                                    <LockedField value={
                                        editableDob
                                            ? new Date(editableDob).toLocaleDateString(
                                                language.code === 'bn' ? 'bn-BD' : 'en-US',
                                                { year: 'numeric', month: 'long', day: 'numeric' }
                                              )
                                            : userData?.dateOfBirth
                                              ? new Date(userData.dateOfBirth).toLocaleDateString(
                                                    language.code === 'bn' ? 'bn-BD' : 'en-US',
                                                    { year: 'numeric', month: 'long', day: 'numeric' }
                                                )
                                              : 'N/A'
                                    } />
                                ) : isEditingDob ? (
                                    /* Currently editing */
                                    <div className="flex gap-2">
                                        <input
                                            type="date"
                                            className="flex-1 px-3 py-2.5 border border-cyan-400 bg-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-200 transition"
                                            value={editableDob}
                                            onChange={(e) => setEditableDob(e.target.value)}
                                            max={new Date().toISOString().split('T')[0]}
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleDobUpdate}
                                            className="bg-cyan-500 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors whitespace-nowrap"
                                        >
                                            {t.save || 'Save'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingDob(false);
                                                setFeedback({ type: '', message: '', field: '' });
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors whitespace-nowrap"
                                        >
                                            {t.cancel || 'Cancel'}
                                        </button>
                                    </div>
                                ) : (
                                    /* Not yet set → tappable row */
                                    <div
                                        className="flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:border-cyan-400 hover:bg-cyan-50 transition-colors"
                                        onClick={() => setIsEditingDob(true)}
                                    >
                                        <span className="text-sm text-gray-500">{editableDob || 'Tap to set date of birth'}</span>
                                        <span className="text-[11px] text-cyan-500 font-semibold shrink-0 ml-2">{t.edit || 'Edit'} ›</span>
                                    </div>
                                )}

                                {/* One-time warning — only visible while still editable */}
                                {!hasDobBeenUpdated && (
                                    <p className="text-[10px] text-amber-500 mt-1.5 pl-0.5 flex items-center gap-1">
                                        <span>⚠</span>
                                        <span>{t.dobOneTimeWarning || 'Date of birth can only be set once.'}</span>
                                    </p>
                                )}
                            </div>

                            {/* KYC — nav link */}
                            <NavLink
                                to="/kyc"
                                className="flex items-center justify-between px-4 py-3 pt-[15px] no-underline text-inherit bg-transparent"
                            >
                                <span className="text-sm text-gray-800 font-medium">{t.kyc || 'KYC'}</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[13px] text-gray-500">
                                        {userData?.kyc_status || t.submitKYC || 'Submit KYC'}
                                    </span>
                                    <MdArrowForwardIos className="text-gray-400 text-sm" />
                                </div>
                            </NavLink>

                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════
                    Password & Security
                ══════════════════════════════════════ */}
                <div className="px-3 py-2 pb-2.5">
                    <div className="text-gray-400 text-[13px] font-semibold mb-2 pl-1">
                        {t.password || 'Password'} &amp; {t.security || 'Security'}
                    </div>
                    <div className="bg-[#e8e0f0] p-[10px] rounded-xl">
                        <div className="bg-white rounded-xl">
                            {[
                                { label: t.passwordUpdate           || 'Password Update',     path: '/password-information' },
                                { label: t.transactionPassword      || 'Trx Password Update', path: '/trx-password-update'   },
                                { label: t.resetTransactionPassword || 'Reset Trx Password',  path: '/reset-trx-password'   },
                            ].map((item, i, arr) => (
                                <NavLink
                                    key={i} to={item.path}
                                    className={`flex items-center justify-between px-4 py-3 no-underline text-inherit ${
                                        i < arr.length - 1 ? 'border-b border-[rgba(200,190,220,0.4)]' : ''
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

                {/* ── Logout Button ── */}
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
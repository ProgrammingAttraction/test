import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { FaUser, FaFilter } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { LanguageContext } from '../../../context/LanguageContext';

import man from "../../../assets/profileimages/man.png";
import man1 from "../../../assets/profileimages/man1.png";
import bronze_img from "../../../assets/level/badge.png";
import silver_img from "../../../assets/level/silver.png";
import gold_img from "../../../assets/level/medal.png";
import diamond_img from "../../../assets/level/diamond.png";
import platinum_img from "../../../assets/level/platinum.png";

const profileImages = [man, man1];

const Bettingrecord = () => {
    const { t, language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const { userData, loading, error } = useUser();
    const [betData, setBetData] = useState([]);
    const [betLoading, setBetLoading] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [filterGame, setFilterGame] = useState('');
    const base_url = import.meta.env.VITE_API_KEY_Base_URL;

    // Level logic (same as Profile/Referral)
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
        return { currentLevel, nextLevel, progressPercentage };
    };
    const levelData = calculateLevelData();

    const getProfileImage = (username) => {
        if (!username) return man;
        let hash = 0;
        for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
        return profileImages[Math.abs(hash) % profileImages.length];
    };

    const formatBalance = (amount) => {
        if (amount === undefined || amount === null) return language.code === 'bn' ? '০.০০' : '0.00';
        return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', { minimumFractionDigits: 2 }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const fetchBets = async () => {
            try {
                setBetLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(`${base_url}/user/bet-history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBetData(response.data.bets || []);
            } catch (err) {
                console.error("Error fetching bet history", err);
            } finally {
                setBetLoading(false);
            }
        };
        if (userData?._id) fetchBets();
        window.scrollTo(0, 0);
    }, [userData, base_url]);

    const filteredBets = betData.filter(bet => {
        const matchGame = filterGame ? (bet.gameName || '').toLowerCase().includes(filterGame.toLowerCase()) : true;
        const matchDate = filterDate ? new Date(bet.createdAt).toISOString().slice(0, 10) === filterDate : true;
        return matchGame && matchDate;
    });

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-500" />
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen font-anek pb-10">

            {/* Header */}
            <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-transparent border-none cursor-pointer text-white flex items-center"
                >
                    <MdArrowBackIosNew className="text-xl" />
                </button>
                <h1 className="text-white font-bold text-lg m-0">Bet History</h1>
                <div className="w-7" />
            </div>

            {/* Filter Drawer */}
            {filterOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 flex items-end justify-center" onClick={() => setFilterOpen(false)}>
                    <div
                        className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 className="text-gray-700 font-bold mb-4 text-base">Filter Bets</h3>
                        <div className="mb-4">
                            <label className="block text-xs text-cyan-500 mb-1 font-semibold">Game Name</label>
                            <input
                                type="text"
                                value={filterGame}
                                onChange={e => setFilterGame(e.target.value)}
                                placeholder="e.g. Casino, Slots..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-cyan-400"
                            />
                        </div>
                        <div className="mb-5">
                            <label className="block text-xs text-cyan-500 mb-1 font-semibold">Date</label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-cyan-400"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setFilterGame(''); setFilterDate(''); setFilterOpen(false); }}
                                className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 font-semibold"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setFilterOpen(false)}
                                className="flex-1 py-2 bg-[#00B4D8] text-white rounded-lg text-sm font-semibold"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-md mx-auto">

                {/* Teal Hero Card — same as Profile & Referral */}
                <div className="mx-3 mt-3 rounded-2xl p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,188,212,0.3)] bg-[#00B4D8]">
                    <div className="absolute top-3 right-3 bg-white/20 rounded-full px-3 py-0.5 text-[11px] text-white font-semibold">
                        {levelData.currentLevel.name}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center overflow-hidden border-2 border-white/50">
                                <img src={getProfileImage(userData?.username)} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div>
                            <div className="text-white/80 text-xs mb-0.5">Customer ID:</div>
                            <div className="text-white font-bold text-base tracking-wide">{userData?.player_id || '123456789'}</div>
                            <div className="text-white/70 text-[11px] mt-0.5">level {levelData.currentLevel.name}</div>
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
                            <div className="text-white/70 text-[10px] mb-0.5">Main Balance</div>
                            <div className="text-white font-bold text-sm">{formatBalance(userData?.balance)}</div>
                        </div>
                        <div className="text-center border-l border-r border-white/20">
                            <div className="text-white/70 text-[10px] mb-0.5">Bonus Balance</div>
                            <div className="text-white font-bold text-sm">{formatBalance(userData?.bonusBalance)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-white/70 text-[10px] mb-0.5">Refer Bonus</div>
                            <div className="text-white font-bold text-sm">{formatBalance(userData?.referralEarnings)}</div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation — same as Profile & Referral */}
                <div className="flex gap-2 px-3 pb-3 pt-3 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'account', label: t.account || 'Account', path: '/profile' },
                        { id: 'transaction', label: t.transaction || 'Transaction', path: '/account-history' },
                        { id: 'bethistory', label: t.bettingHistory || 'Bet History', path: null },
                        { id: 'referral', label: t.referral || 'Referral P', path: '/refer-programme' },
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
                                className="flex-shrink-0 px-4 py-1.5 rounded-[5px] text-xs font-semibold border-none cursor-pointer bg-[#E46248] text-white"
                            >
                                {tab.label}
                            </button>
                        )
                    ))}
                </div>

                {/* Bet History Section */}
                <div className="px-3 pb-2.5">
                    <div className="flex items-center justify-between mb-2 pl-1">
                        <div className="text-gray-500 text-xs font-semibold">Bet History</div>
                        <button
                            onClick={() => setFilterOpen(true)}
                            className="flex items-center gap-1 text-gray-400 text-xs bg-transparent border-none cursor-pointer"
                        >
                            <FaFilter size={10} />
                            <span>Filter</span>
                        </button>
                    </div>

                    {/* Loading */}
                    {betLoading && (
                        <div className="flex justify-center items-center h-24">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent" />
                        </div>
                    )}

                    {/* List */}
                    {!betLoading && (
                        <div className="bg-[#e8e0f0] p-[10px] rounded-xl">
                            <div className="bg-white rounded-xl overflow-hidden">
                                {filteredBets.length > 0 ? (
                                    filteredBets.map((bet, i, arr) => (
                                        <div
                                            key={bet._id || i}
                                            className={`px-4 py-3 ${i < arr.length - 1 ? 'border-b border-[rgba(200,190,220,0.5)]' : ''}`}
                                        >
                                            {/* Row 1: Transaction ID + Date/Time */}
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[11px] text-gray-700 font-semibold truncate max-w-[55%]">
                                                    {bet.transactionId || `TXN-${i + 1}`}
                                                </span>
                                                <span className="text-[10px] text-gray-400">{formatDate(bet.createdAt)} · {formatTime(bet.createdAt)}</span>
                                            </div>
                                            {/* Row 2: Game, Bet, Win */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] text-gray-500 font-medium">{bet.gameName || 'Casino'}</span>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-center">
                                                        <div className="text-[9px] text-gray-400">Bet</div>
                                                        <div className="text-[11px] text-gray-600 font-semibold">{formatBalance(bet.amount)}</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-[9px] text-gray-400">Win</div>
                                                        <div className={`text-[11px] font-semibold ${(bet.winAmount || 0) > 0 ? 'text-green-500' : 'text-red-400'}`}>
                                                            {formatBalance(bet.winAmount)}
                                                        </div>
                                                    </div>
                                                    {/* Status badge */}
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                                        bet.status === 'win' || (bet.winAmount || 0) > (bet.amount || 0)
                                                            ? 'bg-green-100 text-green-600'
                                                            : bet.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-600'
                                                            : 'bg-red-100 text-red-500'
                                                    }`}>
                                                        {bet.status || ((bet.winAmount || 0) > 0 ? 'Win' : 'Loss')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <FaUser size={28} className="mb-3 text-gray-300" />
                                        <p className="text-sm font-medium">No betting records found</p>
                                        <p className="text-xs mt-1 text-gray-300">Your bet history will appear here</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Bettingrecord;
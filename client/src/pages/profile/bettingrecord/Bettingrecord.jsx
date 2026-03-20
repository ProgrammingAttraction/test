import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MdArrowBackIosNew } from "react-icons/md";
import { FaFilter } from 'react-icons/fa';
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
    const { userData, loading: userLoading } = useUser();

    const [sessions, setSessions] = useState([]);
    const [betLoading, setBetLoading] = useState(false);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('today');
    const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 0 });
    const [summary, setSummary] = useState({
        totalBets: 0, totalWins: 0, totalRefunds: 0, netProfit: 0, sessionCount: 0
    });

    // Filter drawer state
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterDate, setFilterDate] = useState('');
    const [filterGame, setFilterGame] = useState('');

    const base_url = import.meta.env.VITE_API_KEY_Base_URL;

    // ── Level logic ──────────────────────────────────────────────────
    const levels = [
        { name: t.levelBronze   || 'Bronze',   threshold: 0,      icon: bronze_img },
        { name: t.levelSilver   || 'Silver',   threshold: 10000,  icon: silver_img },
        { name: t.levelGold     || 'Gold',     threshold: 30000,  icon: gold_img },
        { name: t.levelPlatinum || 'Platinum', threshold: 100000, icon: platinum_img },
        { name: t.levelDiamond  || 'Diamond',  threshold: 500000, icon: diamond_img },
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
            const range    = nextLevel.threshold - currentLevel.threshold;
            const progress = lifetimeDeposit - currentLevel.threshold;
            progressPercentage = Math.min(100, Math.round((progress / range) * 100));
        } else {
            progressPercentage = 100;
        }
        return { currentLevel, nextLevel, progressPercentage };
    };
    const levelData = calculateLevelData();

    // ── Helpers ──────────────────────────────────────────────────────
    const getProfileImage = (username) => {
        if (!username) return man;
        let hash = 0;
        for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
        return profileImages[Math.abs(hash) % profileImages.length];
    };

    const formatBalance = (amount) => {
        if (amount === undefined || amount === null) return language.code === 'bn' ? '০.০০' : '0.00';
        return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', {
            minimumFractionDigits: 2, maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Intl.DateTimeFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        }).format(new Date(dateString));
    };

    const getDateRange = (range) => {
        const now = new Date();
        let startDate, endDate;
        switch (range) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            case 'yesterday':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                endDate   = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                endDate   = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate   = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                break;
            default:
                startDate = null; endDate = null;
        }
        return {
            startDate: startDate ? startDate.toISOString().split('T')[0] : null,
            endDate:   endDate   ? endDate.toISOString().split('T')[0]   : null,
        };
    };

    // ── Fetch ─────────────────────────────────────────────────────────
    const fetchBettingSessions = async (page = 1, range = timeRange) => {
        if (!userData?._id) return;
        setBetLoading(true);
        setError('');
        try {
            const { startDate, endDate } = getDateRange(range);
            const response = await axios.get(`${base_url}/user/game-history/${userData._id}`, {
                params: { page, limit: pagination.limit, startDate, endDate },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.data.success) {
                const { sessions: sessionData, summary: summaryData, pagination: paginationData } = response.data.data;
                const processed = (sessionData || []).map(session => {
                    const transactions = session.transactions || [];
                    const totalBet    = transactions.filter(tx => tx.type === 'bet').reduce((s, tx) => s + (tx.amount || 0), 0);
                    const totalWin    = transactions.filter(tx => tx.type === 'win').reduce((s, tx) => s + (tx.amount || 0), 0);
                    const totalRefund = transactions.filter(tx => tx.type === 'refund').reduce((s, tx) => s + (tx.amount || 0), 0);
                    return { ...session, totalBet, totalWin, totalRefund, netResult: totalWin + totalRefund - totalBet };
                });
                setSessions(processed);
                setSummary(summaryData || { totalBets: 0, totalWins: 0, totalRefunds: 0, netProfit: 0, sessionCount: 0 });
                setPagination(prev => ({
                    ...prev,
                    page:  paginationData?.page  || page,
                    total: paginationData?.total || 0,
                    pages: paginationData?.pages || 0,
                }));
            } else {
                setError(t.fetchRecordsError || 'Failed to load records.');
            }
        } catch (err) {
            console.error('Error fetching betting records:', err);
            setError(err.response?.data?.message || t.fetchRecordsError || 'Failed to load records.');
        } finally {
            setBetLoading(false);
        }
    };

    useEffect(() => {
        if (userData?._id) fetchBettingSessions(1, timeRange);
        window.scrollTo(0, 0);
    }, [userData, timeRange]);

    const handleTimeRangeChange = (range) => {
        setTimeRange(range);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) fetchBettingSessions(newPage);
    };

    // ── Client-side filter (game name + date from drawer) ─────────────
    const filteredSessions = sessions.filter(session => {
        const matchGame = filterGame
            ? (session.game_name || '').toLowerCase().includes(filterGame.toLowerCase())
            : true;
        const matchDate = filterDate
            ? new Date(session.started_at || session.createdAt).toISOString().slice(0, 10) === filterDate
            : true;
        return matchGame && matchDate;
    });

    const hasActiveFilter = filterGame || filterDate;

    // ── Time range labels ─────────────────────────────────────────────
    const timeRanges = [
        { id: 'today',     label: t.today     || 'Today' },
        { id: 'yesterday', label: t.yesterday  || 'Yesterday' },
        { id: 'week',      label: t.thisWeek   || 'This Week' },
        { id: 'month',     label: t.thisMonth  || 'This Month' },
    ];

    if (userLoading) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-cyan-500" />
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen font-anek pb-10">

            {/* ── Header — dark, matching AccountRecord ─────────────── */}
            <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-transparent border-none cursor-pointer text-white flex items-center"
                >
                    <MdArrowBackIosNew className="text-xl" />
                </button>
              <h1 className="text-white font-bold text-lg m-0">{t.betHistory || 'Bet History'}</h1>
                <div className="w-7" />
            </div>

            {/* ── Filter Drawer ─────────────────────────────────────── */}
            {filterOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 flex items-end justify-center"
                    onClick={() => setFilterOpen(false)}
                >
                    <div
                        className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
                        <h3 className="text-gray-700 font-bold mb-4 text-base">Filter Bets</h3>

                        {/* Game Name */}
                        <div className="mb-4">
                            <label className="block text-xs text-cyan-500 mb-1 font-semibold">Game Name</label>
                            <input
                                type="text"
                                value={filterGame}
                                onChange={e => setFilterGame(e.target.value)}
                                placeholder="e.g. Casino, Slots..."
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-400 bg-gray-50 text-gray-700"
                            />
                        </div>

                        {/* Date */}
                        <div className="mb-5">
                            <label className="block text-xs text-cyan-500 mb-1 font-semibold">Date</label>
                            <input
                                type="date"
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-400 bg-gray-50 text-gray-700"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setFilterGame(''); setFilterDate(''); setFilterOpen(false); }}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 font-semibold"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setFilterOpen(false)}
                                className="flex-1 py-2.5 bg-[#00B4D8] text-white rounded-xl text-sm font-semibold"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-md mx-auto">

                {/* ── Hero Card ──────────────────────────────────────── */}
                <div className="mx-3 mt-3 rounded-2xl p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,188,212,0.3)] bg-[#00B4D8]">
                    <div className="absolute top-3 right-3 bg-white/20 rounded-full px-3 py-0.5 text-[11px] text-white font-semibold">
                        {levelData.currentLevel.name}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center overflow-hidden border-2 border-white/50 flex-shrink-0">
                            <img src={getProfileImage(userData?.username)} alt="Profile" className="w-full h-full object-cover" />
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

                {/* ── Tab Navigation — matching AccountRecord style ───── */}
                <div className="flex gap-2 px-3 pb-3 pt-3 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'account',     label: t.account        || 'Account',     path: '/profile' },
                        { id: 'transaction', label: t.transaction     || 'Transaction', path: '/account-history' },
                        { id: 'bethistory',  label: t.bettingHistory  || 'Bet History', path: null },
                        { id: 'referral',    label: t.referral        || 'Referral P',  path: '/refer-programme' },
                    ].map(tab =>
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
                    )}
                </div>

                {/* ── Bet History Section ────────────────────────────── */}
                <div className="px-3 pb-2.5">

                    {/* Section header row */}
                    <div className="flex items-center justify-between mb-2 pl-1">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs font-semibold">Bet History</span>
                            {hasActiveFilter && (
                                <span className="text-[#E46248] text-[10px] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-semibold">
                                    Filtered
                                </span>
                            )}
                            {filteredSessions.length > 0 && (
                                <span className="text-cyan-500 text-[10px] bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-full font-semibold">
                                    {filteredSessions.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setFilterOpen(true)}
                            className={`flex items-center gap-1 text-xs bg-transparent border-none cursor-pointer ${hasActiveFilter ? 'text-[#E46248]' : 'text-gray-400'}`}
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

                    {/* Error */}
                    {!betLoading && error && (
                        <div className="bg-[#D0B1F9] p-[10px] rounded-xl">
                            <div className="bg-red-50 border border-red-200 text-red-500 p-3 rounded-xl text-xs text-center">
                                {error}
                            </div>
                        </div>
                    )}

                    {/* Table — purple wrapper + white inner, same as AccountRecord TransactionTable */}
                    {!betLoading && !error && (
                        <div className="bg-[#D0B1F9] p-[10px] rounded-xl">
                            <div className="bg-white rounded-xl overflow-hidden">

                                {/* Table header */}
                                <div className="bg-gray-50 border-b border-gray-100">
                                    <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0">
                                        <div className="py-2.5 px-3 text-left text-gray-400 font-semibold text-[10px] uppercase tracking-wide whitespace-nowrap">   {t.date || 'Date'}</div>
                                        <div className="py-2.5 px-3 text-left text-gray-400 font-semibold text-[10px] uppercase tracking-wide whitespace-nowrap">{t.gameName || 'Game'}</div>
                                        <div className="py-2.5 px-3 text-left text-gray-400 font-semibold text-[10px] uppercase tracking-wide whitespace-nowrap">{t.totalBet || 'Bet'}</div>
                                        <div className="py-2.5 px-3 text-left text-gray-400 font-semibold text-[10px] uppercase tracking-wide whitespace-nowrap">{t.totalWin || 'Win'}</div>
                                        <div className="py-2.5 px-3 text-left text-gray-400 font-semibold text-[10px] uppercase tracking-wide whitespace-nowrap">{t.totalRefund || 'Refund'}</div>
                                    </div>
                                </div>

                                {filteredSessions.length > 0 ? (
                                    <>
                                        {/* Rows */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-[12px]">
                                                <tbody>
                                                    {filteredSessions.map((session, index, arr) => (
                                                        <tr
                                                            key={session.session_id || index}
                                                            className={`hover:bg-gray-50 transition-colors ${index < arr.length - 1 ? 'border-b border-[rgba(200,190,220,0.5)]' : ''}`}
                                                        >
                                                            <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap text-[11px]">
                                                                {formatDate(session.started_at || session.createdAt)}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-gray-700 font-medium whitespace-nowrap text-[11px]">
                                                                {session.game_name || '—'}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-blue-500 font-semibold whitespace-nowrap text-[11px]">
                                                                ৳{formatBalance(session.totalBet)}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-green-500 font-semibold whitespace-nowrap text-[11px]">
                                                                ৳{formatBalance(session.totalWin)}
                                                            </td>
                                                            <td className="py-2.5 px-3 text-yellow-500 font-semibold whitespace-nowrap text-[11px]">
                                                                ৳{formatBalance(session.totalRefund)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Summary strip */}
                                        <div className="border-t border-[rgba(200,190,220,0.5)] px-3 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5 bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-gray-400">{t.totalBet || 'Total Bet'}</span>
                                                <span className="text-[10px] font-bold text-blue-500">৳{formatBalance(summary.totalBets)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-gray-400">{t.totalWin || 'Total Win'}</span>
                                                <span className="text-[10px] font-bold text-green-500">৳{formatBalance(summary.totalWins)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-gray-400">{t.totalRefund || 'Refund'}</span>
                                                <span className="text-[10px] font-bold text-yellow-500">৳{formatBalance(summary.totalRefunds)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] text-gray-400">{t.netProfitLoss || 'Net P/L'}</span>
                                                <span className={`text-[10px] font-bold ${summary.netProfit > 0 ? 'text-green-500' : summary.netProfit < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                                    ৳{formatBalance(summary.netProfit)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Pagination */}
                                        {pagination.pages > 1 && (
                                            <div className="flex justify-center items-center gap-3 px-3 py-3 border-t border-[rgba(200,190,220,0.5)]">
                                                <button
                                                    onClick={() => handlePageChange(pagination.page - 1)}
                                                    disabled={pagination.page === 1}
                                                    className="px-3 py-1.5 bg-[#D0B1F9]/30 hover:bg-[#D0B1F9] text-gray-600 rounded-lg text-[10px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {t.previous || '← Prev'}
                                                </button>
                                                <span className="text-[10px] text-gray-500 font-medium">
                                                    {pagination.page} / {pagination.pages}
                                                </span>
                                                <button
                                                    onClick={() => handlePageChange(pagination.page + 1)}
                                                    disabled={pagination.page === pagination.pages}
                                                    className="px-3 py-1.5 bg-[#D0B1F9]/30 hover:bg-[#D0B1F9] text-gray-600 rounded-lg text-[10px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {t.next || 'Next →'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* Empty state */
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                        <svg className="w-10 h-10 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-sm font-medium">{t.noSessionRecords || 'No betting records found'}</p>
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
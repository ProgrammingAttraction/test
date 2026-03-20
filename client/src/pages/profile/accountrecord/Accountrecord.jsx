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

const AccountRecord = () => {
    const { t, language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const { userData, loading: userLoading } = useUser();

    const [deposits, setDeposits] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [depositFilterOpen, setDepositFilterOpen] = useState(false);
    const [withdrawFilterOpen, setWithdrawFilterOpen] = useState(false);
    const [depositFilterDate, setDepositFilterDate] = useState('');
    const [depositFilterStatus, setDepositFilterStatus] = useState('');
    const [withdrawFilterDate, setWithdrawFilterDate] = useState('');
    const [withdrawFilterStatus, setWithdrawFilterStatus] = useState('');

    const base_url = import.meta.env.VITE_API_KEY_Base_URL;

    // Level logic
    const levels = [
        { name: t.levelBronze || 'Bronze', threshold: 0, icon: bronze_img },
        { name: t.levelSilver || 'Silver', threshold: 10000, icon: silver_img },
        { name: t.levelGold || 'Gold', threshold: 30000, icon: gold_img },
        { name: t.levelPlatinum || 'Platinum', threshold: 100000, icon: platinum_img },
        { name: t.levelDiamond || 'Diamond', threshold: 500000, icon: diamond_img }
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
        return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatNumber = (number) => {
        if (number === undefined || number === null) return language.code === 'bn' ? '০' : '0';
        return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US').format(number);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString(language.code === 'bn' ? 'bn-BD' : 'en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Fetch transactions data
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                const withRes = await axios.get(`${base_url}/user/withdrawal-history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (withRes.data) {
                    setWithdrawals(withRes.data.transactions || withRes.data.withdrawals || []);
                }

                if (userData?.depositHistory) {
                    setDeposits(userData.depositHistory);
                } else {
                    setDeposits([]);
                }

            } catch (err) {
                console.error("Error fetching transactions", err);
                if (userData?.depositHistory) {
                    setDeposits(userData.depositHistory);
                }
            } finally {
                setLoading(false);
            }
        };

        if (userData?._id) fetchTransactions();
        window.scrollTo(0, 0);
    }, [userData, base_url]);

    useEffect(() => {
        if (userData?.depositHistory) setDeposits(userData.depositHistory);
    }, [userData]);

    const applyFilter = (list, dateFilter, statusFilter) => {
        return list.filter(item => {
            const matchDate = dateFilter ? new Date(item.createdAt).toISOString().slice(0, 10) === dateFilter : true;
            const matchStatus = statusFilter ? item.status === statusFilter : true;
            return matchDate && matchStatus;
        });
    };

    const filteredDeposits = applyFilter(deposits, depositFilterDate, depositFilterStatus);
    const filteredWithdrawals = applyFilter(withdrawals, withdrawFilterDate, withdrawFilterStatus);

    const getMethodImage = (method) => {
        if (method === 'bkash') return "https://images.5949390294.com/mcs-images/bank_type/BKASH/BN_2_20240312225413337.png";
        if (method === 'bkash_fast') return "https://play-lh.googleusercontent.com/1CRcUfmtwvWxT2g-xJF8s9_btha42TLi6Lo-qVkVomXBb_citzakZX9BbeY51iholWs";
        if (method === 'nagad') return "https://images.5949390294.com/mcs-images/bank_type/NAGAD/BN_2_20240312230148421.png";
        return null;
    };

    const getMethodLabel = (method) => {
        if (method === 'bkash') return t.bkash || 'bKash';
        if (method === 'bkash_fast') return 'bKash Fast';
        if (method === 'nagad') return t.nagad || 'Nagad';
        return method || '—';
    };

    // Status badge
    const StatusBadge = ({ status }) => {
        const map = {
            completed: 'bg-green-50 text-green-600 border border-green-200',
            approved:  'bg-green-50 text-green-600 border border-green-200',
            success:   'bg-green-50 text-green-600 border border-green-200',
            pending:   'bg-yellow-50 text-yellow-600 border border-yellow-200',
            rejected:  'bg-red-50 text-red-500 border border-red-200',
            failed:    'bg-red-50 text-red-500 border border-red-200',
        };
        const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
        return (
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${map[status] || 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                {label}
            </span>
        );
    };

    // Filter Drawer
    const FilterDrawer = ({ open, onClose, dateVal, setDate, statusVal, setStatus, onClear }) => {
        if (!open) return null;
        return (
            <div className="fixed inset-0 bg-black/30 z-40 flex items-end justify-center" onClick={onClose}>
                <div
                    className="bg-white w-full max-w-md rounded-t-2xl p-5 pb-8 shadow-xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
                    <h3 className="text-gray-700 font-bold mb-4 text-base">Filter</h3>
                    <div className="mb-4">
                        <label className="block text-xs text-cyan-500 mb-1.5 font-semibold">Date</label>
                        <input
                            type="date"
                            value={dateVal}
                            onChange={e => setDate(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-400 bg-gray-50 text-gray-700"
                        />
                    </div>
                    <div className="mb-5">
                        <label className="block text-xs text-cyan-500 mb-1.5 font-semibold">Status</label>
                        <select
                            value={statusVal}
                            onChange={e => setStatus(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-cyan-400 bg-gray-50 text-gray-700"
                        >
                            <option value="">All</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="completed">Completed</option>
                            <option value="rejected">Rejected</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => { onClear(); onClose(); }}
                            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-500 font-semibold"
                        >
                            Clear
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-sm font-semibold transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Transaction table — spinner while loading, data or empty state after
    const TransactionTable = ({ items, emptyLabel, showMethod, isLoading }) => (
        <div className="p-[10px] rounded-xl bg-[#D0B1F9] border border-gray-100 overflow-hidden shadow-sm">
            <div className="bg-white rounded-xl overflow-hidden">
                {isLoading ? (
                    /* ── Spinner loader ── */
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="py-2.5 px-3 text-left text-gray-400 font-semibold text-[11px] uppercase tracking-wide">
                                        {t.date || 'Date'}
                                    </th>
                                    <th className="py-2.5 px-3 text-left text-gray-400 font-semibold text-[11px] uppercase tracking-wide">
                                        {t.amount || 'Amount'}
                                    </th>
                                    {showMethod && (
                                        <th className="py-2.5 px-3 text-left text-gray-400 font-semibold text-[11px] uppercase tracking-wide">
                                            {t.method || 'Method'}
                                        </th>
                                    )}
                                    <th className="py-2.5 px-3 text-left text-gray-400 font-semibold text-[11px] uppercase tracking-wide">
                                        {t.status || 'Status'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length > 0 ? (
                                    [...items]
                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                        .map((item, index) => (
                                            <tr
                                                key={item._id || index}
                                                className="border-t border-gray-50 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-2.5 px-3 text-gray-500 text-[12px]">
                                                    {formatDate(item.createdAt)}
                                                </td>
                                                <td className="py-2.5 px-3 font-semibold text-gray-700 text-[12px]">
                                                    ৳{formatNumber(item.amount)}
                                                </td>
                                                {showMethod && (
                                                    <td className="py-2.5 px-3">
                                                        <div className="flex items-center gap-1.5">
                                                            {getMethodImage(item.method) && (
                                                                <img
                                                                    src={getMethodImage(item.method)}
                                                                    alt={item.method}
                                                                    className="w-5 h-5 rounded-full object-cover"
                                                                />
                                                            )}
                                                            <span className="text-gray-600 text-[12px]">
                                                                {getMethodLabel(item.method)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="py-2.5 px-3">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                            </tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={showMethod ? 4 : 3}
                                            className="text-center py-10 text-gray-400 text-sm"
                                        >
                                            {emptyLabel}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-100 min-h-screen font-anek pb-10">

            {/* Header */}
            <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-transparent border-none cursor-pointer text-cyan-500 p-1.5 rounded-full hover:bg-cyan-50 transition-colors"
                >
                    <MdArrowBackIosNew className="text-xl" />
                </button>
         <h1 className="text-white font-bold text-[17px] m-0">{t.transactionHistory || 'Transaction History'}</h1>
                <div className="w-9" />
            </div>

            {/* Filter Drawers */}
            <FilterDrawer
                open={depositFilterOpen}
                onClose={() => setDepositFilterOpen(false)}
                dateVal={depositFilterDate}
                setDate={setDepositFilterDate}
                statusVal={depositFilterStatus}
                setStatus={setDepositFilterStatus}
                onClear={() => { setDepositFilterDate(''); setDepositFilterStatus(''); }}
            />
            <FilterDrawer
                open={withdrawFilterOpen}
                onClose={() => setWithdrawFilterOpen(false)}
                dateVal={withdrawFilterDate}
                setDate={setWithdrawFilterDate}
                statusVal={withdrawFilterStatus}
                setStatus={setWithdrawFilterStatus}
                onClear={() => { setWithdrawFilterDate(''); setWithdrawFilterStatus(''); }}
            />

            <div className="max-w-md mx-auto px-3 pt-4">

                {/* Hero Card */}
                <div className="rounded-2xl p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(0,188,212,0.25)] bg-[#00B4D8] mb-3">
                    <div className="absolute top-3 right-3 bg-white/20 rounded-full px-3 py-0.5 text-[11px] text-white font-semibold">
                        {levelData.currentLevel.name}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center overflow-hidden border-2 border-white/50 flex-shrink-0">
                            <img src={getProfileImage(userData?.username)} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="text-white/80 text-xs mb-0.5">Customer ID</div>
                            <div className="text-white font-bold text-base tracking-wide">{userData?.player_id || '123456789'}</div>
                            <div className="text-white/70 text-[11px] mt-0.5">Level {levelData.currentLevel.name}</div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white/70 rounded-full transition-all duration-500"
                                style={{ width: `${levelData.progressPercentage}%` }}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                            <div className="text-white/70 text-[10px] mb-0.5">Main Balance</div>
                            <div className="text-white font-bold text-sm">৳{formatBalance(userData?.balance)}</div>
                        </div>
                        <div className="text-center border-l border-r border-white/20">
                            <div className="text-white/70 text-[10px] mb-0.5">Bonus Balance</div>
                            <div className="text-white font-bold text-sm">৳{formatBalance(userData?.bonusBalance)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-white/70 text-[10px] mb-0.5">Refer Bonus</div>
                            <div className="text-white font-bold text-sm">৳{formatBalance(userData?.referralEarnings)}</div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 pt-3 pb-3 overflow-x-auto scrollbar-hide">
                    {[
                        { id: 'account',     label: t.account     || 'Account',     path: '/profile' },
                        { id: 'transaction', label: t.transaction  || 'Transaction', path: null },
                        { id: 'bethistory',  label: t.bettingHistory || 'Bet History', path: '/betting-history' },
                        { id: 'referral',    label: t.referral    || 'Referral',    path: '/refer-programme' },
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

                {/* ── Deposit History ── */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 px-0.5">
                        <h4 className="font-bold text-[14px] text-gray-700">
                            {t.depositHistory || 'Deposit History'}
                        </h4>
                        <button
                            onClick={() => setDepositFilterOpen(true)}
                            className="flex items-center gap-1 text-gray-400 text-[11px] bg-white border border-gray-200 px-2.5 py-1 rounded-lg cursor-pointer hover:border-cyan-400 hover:text-cyan-500 transition-colors"
                        >
                            <FaFilter size={9} />
                            <span>Filter</span>
                        </button>
                    </div>
                    <TransactionTable
                        items={filteredDeposits}
                        emptyLabel={t.noDepositHistory || 'No deposit records found'}
                        showMethod={true}
                        isLoading={loading || userLoading}
                    />
                </div>

                {/* ── Withdrawal History ── */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2 px-0.5">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[14px] text-gray-700">
                                {t.withdrawalHistory || 'Withdrawal History'}
                            </h4>
                            {!loading && filteredWithdrawals.length > 0 && (
                                <span className="text-cyan-500 text-[10px] bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-full font-semibold">
                                    {filteredWithdrawals.length}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setWithdrawFilterOpen(true)}
                            className="flex items-center gap-1 text-gray-400 text-[11px] bg-white border border-gray-200 px-2.5 py-1 rounded-lg cursor-pointer hover:border-cyan-400 hover:text-cyan-500 transition-colors"
                        >
                            <FaFilter size={9} />
                            <span>Filter</span>
                        </button>
                    </div>
                    <TransactionTable
                        items={filteredWithdrawals}
                        emptyLabel={t.noWithdrawalHistory || 'No withdrawal records found'}
                        showMethod={false}
                        isLoading={loading || userLoading}
                    />
                </div>

            </div>
        </div>
    );
};

export default AccountRecord;
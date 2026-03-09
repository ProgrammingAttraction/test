import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MdArrowBackIosNew } from "react-icons/md";
import { FaUser } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { LanguageContext } from '../../../context/LanguageContext';

const AccountRecord = () => {
    const { t, language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const { userData, loading: userLoading } = useUser();
    
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const base_url = import.meta.env.VITE_API_KEY_Base_URL;

    // 1. Dynamic Balance Formatter
    const formatBalance = (amount) => {
        if (amount === undefined || amount === null) return '0.00';
        return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    // 2. Fetch Real Transaction Data
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${base_url}/user/transactions`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Assuming your API returns { transactions: [...] }
                setTransactions(response.data.transactions || []);
            } catch (err) {
                console.error("Error fetching transactions", err);
            } finally {
                setLoading(false);
            }
        };

        if (userData?._id) fetchTransactions();
        window.scrollTo(0, 0);
    }, [userData, base_url]);

    if (userLoading || loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-cyan-500"></div>
        </div>
    );

    return (
        <div className="bg-[#F3F3F3] min-h-screen font-sans pb-10">
            {/* Header */}
            <div className="bg-[#2D2D2D] px-4 py-4 flex items-center sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="text-white bg-transparent border-none cursor-pointer">
                    <MdArrowBackIosNew className="text-xl" />
                </button>
                <h1 className="text-white font-medium text-lg flex-1 text-center mr-6">Transection History</h1>
            </div>

            <div className="max-w-md mx-auto">
                {/* --- DYNAMIC TEAL HERO CARD --- */}
                <div className="mx-4 mt-5 rounded-[25px] p-6 relative bg-[#00BCD4] text-white shadow-lg">
                    <div className="absolute top-4 right-5 bg-[#4DD0E1] rounded px-2 py-0.5 text-[10px] font-bold">
                        LV {userData?.level || 0}
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-white border-4 border-[#4DD0E1] mb-4 flex items-center justify-center overflow-hidden">
                            <FaUser className="text-gray-300 text-5xl" />
                        </div>

                        <div className="text-center mb-6">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-lg font-bold">Customer ID:</span>
                                <span className="text-lg font-bold tracking-widest">{userData?.player_id || '--------'}</span>
                            </div>
                            <div className="text-[12px] opacity-90 mt-1 italic">level {userData?.level_name || 'Bronze'}</div>
                        </div>

                        <div className="w-full h-[1px] bg-white/30 mb-6"></div>

                        <div className="grid grid-cols-3 w-full text-center">
                            <div className="border-r border-white/20">
                                <div className="text-[10px] mb-2 opacity-90">Main Balance</div>
                                <div className="text-[13px] font-bold">{formatBalance(userData?.balance)}</div>
                            </div>
                            <div className="border-r border-white/20 px-1">
                                <div className="text-[10px] mb-2 opacity-90">Bonus Balance</div>
                                <div className="text-[13px] font-bold">{formatBalance(userData?.bonusBalance)}</div>
                            </div>
                            <div>
                                <div className="text-[10px] mb-2 opacity-90">Reffer Bonus</div>
                                <div className="text-[13px] font-bold">{formatBalance(userData?.referralEarnings)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TAB NAVIGATION --- */}
                <div className="flex justify-between px-4 py-8 gap-2 overflow-x-auto scrollbar-hide">
                    <NavLink to="/profile" className="flex-1 py-2 rounded-lg bg-[#D1C4E9] text-[#9575CD] text-[11px] font-bold text-center no-underline">Account</NavLink>
                    <button className="flex-1 py-2 rounded-lg bg-[#E57373] text-white text-[11px] font-bold border-none shadow-md">Transection</button>
                    <NavLink to="/betting-history" className="flex-1 py-2 rounded-lg bg-[#D1C4E9] text-[#9575CD] text-[11px] font-bold text-center no-underline">Bet History</NavLink>
                    <NavLink to="/refer-programme" className="flex-1 py-2 rounded-lg bg-[#D1C4E9] text-[#9575CD] text-[11px] font-bold text-center no-underline">Referral.P</NavLink>
                </div>

                {/* --- DYNAMIC TRANSACTION LIST --- */}
                <div className="px-4">
                    <div className="flex justify-between items-center mb-3 px-2">
                        <span className="text-[#C4C4C4] text-sm">Deposit History</span>
                        <span className="text-[#C4C4C4] text-sm cursor-pointer">Filter</span>
                    </div>

                    <div className="bg-[#E1D7E9] p-3 rounded-[30px]">
                        <div className="bg-white rounded-[25px] overflow-hidden min-h-[150px]">
                            {transactions.length > 0 ? transactions.map((trx, index) => (
                                <div key={trx._id || index} className={`flex justify-between items-center px-5 py-4 ${index !== transactions.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div>
                                        <div className="text-gray-600 font-bold text-[13px]">
                                            {new Date(trx.createdAt).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                        </div>
                                        <div className="text-gray-300 text-[10px] mt-0.5">
                                            {new Date(trx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit', hour12: false})} SEC
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-gray-400 text-[11px] mb-1">Amount</div>
                                        <div className="text-gray-400 font-medium text-[13px]">{formatBalance(trx.amount)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gray-400 text-[11px] mb-1">Status</div>
                                        <div className={`text-[13px] font-medium ${
                                            trx.status === 'pending' ? 'text-yellow-500' : 
                                            trx.status === 'rejected' ? 'text-red-500' : 
                                            'text-[#70E0AF]'
                                        }`}>
                                            {trx.status.charAt(0).toUpperCase() + trx.status.slice(1)}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-gray-400 text-sm">No transactions found</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Withdrawal Placeholder to match UI */}
                <div className="px-4 mt-8">
                    <div className="flex justify-between items-center mb-3 px-2">
                        <span className="text-[#C4C4C4] text-sm">Withdrawal History</span>
                        <span className="text-[#C4C4C4] text-sm">Filter</span>
                    </div>
                    <div className="bg-[#E1D7E9] h-20 rounded-[30px]"></div>
                </div>
            </div>
        </div>
    );
};

export default AccountRecord;
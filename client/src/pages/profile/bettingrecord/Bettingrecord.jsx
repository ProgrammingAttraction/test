import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { MdArrowBackIosNew } from "react-icons/md";
import { FaUser } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { LanguageContext } from '../../../context/LanguageContext';

// Import your level icons if you want them dynamic in the card too

const Bettingrecord = () => {
    const { t, language } = useContext(LanguageContext);
    const navigate = useNavigate();
    const { userData, loading, error } = useUser();
    const [betData, setBetData] = useState([]);
    const base_url = import.meta.env.VITE_API_KEY_Base_URL;

    // 1. Level Calculation Logic (Dynamic like Profile)
    const levels = [
        { name: t.levelBronze || 'Bronze', threshold: 0, color: '#cd7f32' },
        { name: t.levelSilver || 'Silver', threshold: 10000, color: '#c0c0c0' },
        // ... add others if needed
    ];

    const calculateLevel = () => {
        const lifetimeBet = userData?.lifetime_bet || 0;
        let currentLevel = levels[0];
        for (let i = levels.length - 1; i >= 0; i--) {
            if (lifetimeBet >= levels[i].threshold) {
                currentLevel = levels[i];
                break;
            }
        }
        return currentLevel;
    };

    const currentLevel = calculateLevel();

    // 2. Format Balance (Dynamic based on language)
    const formatBalance = (amount) => {
        if (amount === undefined || amount === null) return '0.00';
        return new Intl.NumberFormat(language.code === 'bn' ? 'bn-BD' : 'en-US', { 
            minimumFractionDigits: 2 
        }).format(amount);
    };

    // 3. Fetch Real Bet History
    useEffect(() => {
        const fetchBets = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${base_url}/user/bet-history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBetData(response.data.bets || []);
            } catch (err) {
                console.error("Error fetching bet history", err);
            }
        };
        if (userData?._id) fetchBets();
        window.scrollTo(0, 0);
    }, [userData, base_url]);

    if (loading) return <div className="flex justify-center items-center h-screen bg-gray-100"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-500"></div></div>;

    return (
        <div className="bg-[#F3F3F3] min-h-screen font-sans pb-10">
            {/* Header */}
            <div className="bg-[#2D2D2D] px-4 py-4 flex items-center sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="text-white bg-transparent border-none cursor-pointer">
                    <MdArrowBackIosNew className="text-xl" />
                </button>
                <h1 className="text-white font-medium text-lg flex-1 text-center mr-6">Bet History</h1>
            </div>

            <div className="max-w-md mx-auto">
                {/* --- DYNAMIC TEAL HERO CARD --- */}
                <div className="mx-4 mt-5 rounded-[25px] p-6 relative bg-[#00BCD4] text-white shadow-lg">
                    <div className="absolute top-4 right-5 bg-white/20 rounded-full px-3 py-0.5 text-[10px] font-bold">
                        LV {userData?.level || 0}
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-white/30 border-2 border-white/50 mb-3 flex items-center justify-center overflow-hidden">
                             <FaUser className="text-white/80 text-4xl" />
                        </div>

                        <div className="text-center mb-5">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-base font-bold">Customer ID:</span>
                                <span className="text-base font-bold tracking-widest">{userData?.player_id || '--------'}</span>
                            </div>
                            <div className="text-[11px] opacity-80 mt-1">level {currentLevel.name}</div>
                        </div>

                        <div className="w-full h-[1px] bg-white/20 mb-5"></div>

                        <div className="grid grid-cols-3 w-full text-center">
                            <div className="border-r border-white/10">
                                <div className="text-[9px] mb-1 opacity-80">Main Balance</div>
                                <div className="text-[12px] font-bold">{formatBalance(userData?.balance)}</div>
                            </div>
                            <div className="border-r border-white/10 px-1">
                                <div className="text-[9px] mb-1 opacity-80">Bonus Balance</div>
                                <div className="text-[12px] font-bold">{formatBalance(userData?.bonusBalance)}</div>
                            </div>
                            <div>
                                <div className="text-[9px] mb-1 opacity-80">Reffer Bonus</div>
                                <div className="text-[12px] font-bold">{formatBalance(userData?.referralEarnings)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- TAB NAVIGATION (Dynamic Routes) --- */}
                <div className="flex justify-between px-4 py-8 gap-2 overflow-x-auto scrollbar-hide">
                    <NavLink to="/profile" className="flex-1 py-2 rounded-lg bg-[#D1C4E9] text-[#9575CD] text-[11px] font-bold text-center no-underline">Account</NavLink>
                    <NavLink to="/account-history" className="flex-1 py-2 rounded-lg bg-[#D1C4E9] text-[#9575CD] text-[11px] font-bold text-center no-underline">Transection</NavLink>
                    <button className="flex-1 py-2 rounded-lg bg-[#E46248] text-white text-[11px] font-bold border-none shadow-md">Bet History</button>
                    <NavLink to="/refer-programme" className="flex-1 py-2 rounded-lg bg-[#D1C4E9] text-[#9575CD] text-[11px] font-bold text-center no-underline">Referral.P</NavLink>
                </div>

                {/* --- DYNAMIC BET LIST --- */}
                <div className="px-4">
                    <div className="flex justify-between items-center mb-3 px-2">
                        <span className="text-gray-400 text-sm font-medium">Bet History</span>
                        <span className="text-gray-400 text-sm cursor-pointer">Filter</span>
                    </div>

                    <div className="bg-[#e8e0f0] p-2.5 rounded-[30px]">
                        <div className="bg-white rounded-[25px] overflow-hidden min-h-[200px]">
                            {betData.length > 0 ? betData.map((bet, index) => (
                                <div key={bet._id || index} className={`grid grid-cols-4 gap-2 px-4 py-5 ${index !== betData.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="col-span-1">
                                        <div className="text-gray-700 font-bold text-[11px] truncate">{bet.transactionId || 'N/A'}</div>
                                        <div className="text-gray-300 text-[9px] mt-1">{new Date(bet.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})} SEC</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-gray-400 text-[10px] mb-1">Bet</div>
                                        <div className="text-gray-400 font-medium text-[12px]">{bet.amount || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-gray-400 text-[10px] mb-1">Win</div>
                                        <div className="text-gray-400 font-medium text-[12px]">{bet.winAmount || 0}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-gray-400 text-[10px] mb-1">Game Name</div>
                                        <div className="text-gray-500 font-medium text-[12px]">{bet.gameName || 'Casino'}</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-gray-400 text-sm">No betting records found</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bettingrecord;
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import axios from 'axios';
import moment from 'moment';
import Header from '../components/common/Header';

// Import browser logos
import chromeLogo from "../assets/chrome.png"
import firefoxLogo from "../assets/firefox.png"
import safariLogo from "../assets/safari.png"
import edgeLogo from "../assets/microsoft.png"
import operaLogo from "../assets/opera.png"
import defaultBrowserLogo from "../assets/browser.png"

const Loginhistory = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const base_url = import.meta.env.VITE_API_KEY_Base_URL;
    const [allLoginHistory, setAllLoginHistory] = useState([]); // Store all data
    const [filteredLoginHistory, setFilteredLoginHistory] = useState([]); // Store filtered data
    const [searchQuery, setSearchQuery] = useState(searchParams.get('name') || '');
    const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
    const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
    const [loading, setLoading] = useState(false);

    // Function to get browser logo and color
    const getBrowserInfo = (browser) => {
        const browserLower = browser.toLowerCase();
        
        if (browserLower.includes('chrome')) {
            return {
                logo: chromeLogo,
                color: 'bg-blue-100',
                textColor: 'text-blue-800'
            };
        } else if (browserLower.includes('firefox') || browserLower.includes('mozilla')) {
            return {
                logo: firefoxLogo,
                color: 'bg-orange-100',
                textColor: 'text-orange-800'
            };
        } else if (browserLower.includes('safari')) {
            return {
                logo: safariLogo,
                color: 'bg-blue-100',
                textColor: 'text-blue-600'
            };
        } else if (browserLower.includes('edge')) {
            return {
                logo: edgeLogo,
                color: 'bg-blue-100',
                textColor: 'text-blue-700'
            };
        } else if (browserLower.includes('opera')) {
            return {
                logo: operaLogo,
                color: 'bg-red-100',
                textColor: 'text-red-800'
            };
        } else {
            return {
                logo: defaultBrowserLogo,
                color: 'bg-gray-100',
                textColor: 'text-gray-800'
            };
        }
    };

    const fetchLoginHistory = () => {
        setLoading(true);

        axios.get(`${base_url}/admin/login-history`)
        .then((res) => {
            setAllLoginHistory(res.data.data);
            applyFilters(res.data.data, searchQuery, startDate, endDate);
        })
        .catch((err) => {
            console.error(err);
        })
        .finally(() => setLoading(false));
    };

    const applyFilters = (data, nameFilter, startDateFilter, endDateFilter) => {
        let filteredData = [...data];
        
        // Filter by name/email
        if (nameFilter) {
            const query = nameFilter.toLowerCase();
            filteredData = filteredData.filter(entry => 
                entry.name?.toLowerCase().includes(query) || 
                entry.email.toLowerCase().includes(query)
            );
        }
        
        // Filter by date range
        if (startDateFilter) {
            const start = moment(startDateFilter).startOf('day');
            filteredData = filteredData.filter(entry => 
                moment(entry.loginAt).isSameOrAfter(start)
            );
        }
        
        if (endDateFilter) {
            const end = moment(endDateFilter).endOf('day');
            filteredData = filteredData.filter(entry => 
                moment(entry.loginAt).isSameOrBefore(end)
            );
        }
        
        setFilteredLoginHistory(filteredData);
    };

    useEffect(() => {
        fetchLoginHistory();
    }, []);

    useEffect(() => {
        // Apply filters whenever searchParams change
        applyFilters(allLoginHistory, searchQuery, startDate, endDate);
    }, [searchParams, allLoginHistory]);

    const handleSearch = () => {
        setSearchParams({
            name: searchQuery || '',
            startDate: startDate || '',
            endDate: endDate || ''
        });
    };

    const clearSearch = () => {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        setSearchParams({});
        setFilteredLoginHistory(allLoginHistory);
    };

    return (
        <div className="w-full font-bai overflow-y-auto">
            <Header />
            <section className="">
                <div className="">
                    <div className="w-full p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-2xl font-semibold text-gray-800 mb-6">User Login History</h1>

                            {/* Search and Date Inputs */}
                            <div className="flex gap-[20px] mb-6">
                                {/* Search by Username */}
                                <div className="relative w-[250px] h-[50px] flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Search Username"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="py-2 px-4 h-[50px] border border-gray-300 text-black rounded-l-md focus:outline-none w-full"
                                    />
                                    {searchQuery && (
                                        <div 
                                            onClick={clearSearch} 
                                            className="absolute cursor-pointer right-10 text-gray-600 hover:text-gray-800"
                                        >
                                            <FiX size={18} />
                                        </div>
                                    )}
                                    <button 
                                        onClick={handleSearch} 
                                        className="bg-cyan-600 h-[50px] py-2 px-4 rounded-r-md text-white hover:bg-cyan-700 transition-colors"
                                    >
                                        <FiSearch />
                                    </button>
                                </div>

                                {/* Date Range Search */}
                                <div className="relative w-[350px] h-[50px] flex items-center">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="py-2 px-4 border w-[150px] h-[50px] border-gray-300 text-black rounded-l-md focus:outline-none"
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="py-2 px-4 border h-[50px] w-[150px] border-gray-300 text-black focus:outline-none"
                                    />
                                    <button 
                                        onClick={handleSearch} 
                                        className="bg-cyan-600 w-[50px] flex justify-center items-center h-[50px] p-2 rounded-r-md text-white hover:bg-cyan-700 transition-colors"
                                    >
                                        <FiSearch />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table with Search Results */}
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse shadow-xl bg-white border-[1px] border-[#eee] overflow-hidden">
                                <thead>
                                    <tr className="bg-cyan-600 text-white">
                                        <th className="py-3 px-4 text-left">User</th>
                                        <th className="py-3 px-4 text-left">Login at</th>
                                        <th className="py-3 px-4 text-left">IP</th>
                                        <th className="py-3 px-4 text-left">Location</th>
                                        <th className="py-3 px-4 text-left">Browser | OS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-6 text-gray-600">
                                                <div className="flex justify-center">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredLoginHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-6 text-gray-600">No login records found</td>
                                        </tr>
                                    ) : (
                                        filteredLoginHistory.map((entry, index) => {
                                            const browserInfo = getBrowserInfo(entry.browser);
                                            
                                            return (
                                                <tr key={index} className="border-b even:bg-gray-50 hover:bg-gray-100 transition-colors">
                                                    <td className="py-3 px-4 text-gray-800">
                                                        <strong>{entry.name}</strong>
                                                        <br />
                                                        <span className="text-gray-600 text-sm">{entry.email}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-800">
                                                        <span className='font-[600] text-[14px]'>
                                                            {moment(entry.loginAt).format("MMMM Do YYYY, h:mm A")}
                                                        </span>
                                                        <br />
                                                        <span className="text-gray-600 text-sm">
                                                            {moment(entry.loginAt).fromNow()}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-800 font-[600]">
                                                        {entry.ipAddress}
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-800">
                                                        {entry.location || 'Unknown'}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <img 
                                                                src={browserInfo.logo} 
                                                                alt={entry.browser} 
                                                                className="w-6 h-6 object-contain"
                                                            />
                                                            <span className={`text-sm px-2 py-1 rounded-full ${browserInfo.color} ${browserInfo.textColor}`}>
                                                                {entry.browser}
                                                            </span>
                                                            <span className="text-gray-500 text-sm">|</span>
                                                            <span className="text-gray-600 text-sm">
                                                                {entry.os}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Loginhistory;
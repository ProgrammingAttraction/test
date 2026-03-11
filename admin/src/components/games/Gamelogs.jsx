import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload, FiRefreshCw, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { AiOutlineEye } from 'react-icons/ai';
import Header from '../common/Header';
import axios from 'axios';

const Gamelogs = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    betType: 'all',
    startDate: '',
    endDate: ''
  });
  const [expandedSessions, setExpandedSessions] = useState({});
  const [stats, setStats] = useState({
    totalBets: 0,
    totalStake: 0,
    totalPayout: 0,
    netProfit: 0
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);

  // Fetch game sessions
  const fetchSessions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${base_url}/admin/bet-history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });
    console.log(response.data);
      if (response.data.success) {
        setSessions(response.data.data);
        setFilteredSessions(response.data.data);
        calculateStats(response.data.data);
        setTotalPages(Math.ceil(response.data.data.length / itemsPerPage));
      } else {
        setError('Failed to fetch game sessions');
      }
    } catch (err) {
      console.error('Error fetching game sessions:', err);
      setError(err.response?.data?.message || 'Failed to fetch game sessions');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    let totalBets = 0;
    let totalStake = 0;
    let totalPayout = 0;

    data.forEach(session => {
      totalBets += session.transactions.length;
      
      // Calculate total stake and payout from transactions
      session.transactions.forEach(transaction => {
        if (transaction.type === 'bet') {
          totalStake += transaction.amount;
        } else if (transaction.type === 'win') {
          totalPayout += transaction.amount;
        }
      });
    });

    setStats({
      totalBets,
      totalStake,
      totalPayout,
      netProfit: totalPayout - totalStake
    });
  };

  // Toggle session expansion
  const toggleSession = (sessionId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [sessionId]: !prev[sessionId]
    }));
  };

  // Format date with seconds
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (transaction) => {
    if (transaction.type === 'bet') {
      return transaction.win > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }
    return 'bg-orange-100 text-orange-800';
  };

  // Get transaction type text
  const getTransactionType = (transaction) => {
    if (transaction.type === 'bet') {
      return transaction.win > 0 ? 'Win' : 'Lose';
    }
    return transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
  };

  // Get game name from game_uuid or session data
  const getGameName = (session) => {
    // You can customize this function based on your game UUID naming convention
    if (!session.game_uuid) return 'Unknown Game';
    
    // Example mapping - adjust based on your actual game UUIDs
    const gameMap = {
      'poker': 'Poker',
      'blackjack': 'Blackjack',
      'roulette': 'Roulette',
      'slots': 'Slots',
      'baccarat': 'Baccarat',
      'dice': 'Dice Game',
      // Add more mappings as needed
    };
    
    // Extract game name from UUID or use mapping
    const gameKey = session.game_uuid.toLowerCase();
    for (const [key, name] of Object.entries(gameMap)) {
      if (gameKey.includes(key)) {
        return name;
      }
    }
    
    // If no mapping found, return the UUID or a formatted version
    return session.game_uuid.split('-')[0] || 'Casino Game';
  };

  // Apply filters and search
  const applyFilters = () => {
    let filtered = sessions;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.player_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getGameName(session).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(session => {
        if (filters.status === 'win') {
          return session.total_win > session.total_bet;
        } else if (filters.status === 'lose') {
          return session.total_win <= session.total_bet;
        }
        return true;
      });
    }
    
    // Apply bet type filter (using game name)
    if (filters.betType !== 'all') {
      filtered = filtered.filter(session => {
        const gameName = getGameName(session).toLowerCase();
        return gameName.includes(filters.betType.toLowerCase());
      });
    }
    
    // Apply date filters
    if (filters.startDate) {
      filtered = filtered.filter(session => 
        new Date(session.createdAt) >= new Date(filters.startDate)
      );
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      filtered = filtered.filter(session => 
        new Date(session.createdAt) <= endDate
      );
    }
    
    setFilteredSessions(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      betType: 'all',
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
    setFilteredSessions(sessions);
    setTotalPages(Math.ceil(sessions.length / itemsPerPage));
    setCurrentPage(1);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setTotalPages(Math.ceil(filteredSessions.length / newItemsPerPage));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // If total pages is less than max visible, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of visible page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're at the beginning
      if (currentPage <= 2) {
        endPage = 3;
      }
      
      // Adjust if we're at the end
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 2;
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  // Initial fetch
  useEffect(() => {
    fetchSessions();
  }, []);

  // Apply filters when filters or search query change
  useEffect(() => {
    if (sessions.length > 0) {
      applyFilters();
    }
  }, [filters, searchQuery, sessions]);

  return (
    <div className="min-h-screen bg-gray-50 font-bai">
      <Header />
      
      <section className="p-4 md:p-6 text-gray-700">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Bet History</h1>
            <p className="text-gray-600">Monitor and manage all betting activities</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg shadow-sm text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm">Total Bets</div>
                  <div className="text-xl font-bold">{stats.totalBets}</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg shadow-sm text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599-1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm">Total Stake</div>
                  <div className="text-xl font-bold">{formatCurrency(stats.totalStake)}</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg shadow-sm text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm">Total Payout</div>
                  <div className="text-xl font-bold">{formatCurrency(stats.totalPayout)}</div>
                </div>
              </div>
            </div>
            <div className={`p-4 rounded-lg shadow-sm text-white ${stats.netProfit >= 0 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'}`}>
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm">Net Profit</div>
                  <div className="text-xl font-bold">
                    {formatCurrency(Math.abs(stats.netProfit))} {stats.netProfit >= 0 ? 'Profit' : 'Loss'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Session ID, Player ID, Game Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All Status</option>
                  <option value="win">Win</option>
                  <option value="lose">Lose</option>
                  <option value="pending">Pending</option>
                </select>
                
                <select
                  value={filters.betType}
                  onChange={(e) => setFilters({...filters, betType: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="all">All Games</option>
                  <option value="poker">Poker</option>
                  <option value="blackjack">Blackjack</option>
                  <option value="roulette">Roulette</option>
                  <option value="slots">Slots</option>
                  <option value="baccarat">Baccarat</option>
                </select>
                
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="Start Date"
                />
                
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder="End Date"
                />
                
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                >
                  Apply
                </button>
                
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                
                <button
                  onClick={fetchSessions}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title="Refresh"
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>
          </div>

          {/* Pagination Controls - Top */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-2">Show</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-700 ml-2">entries</span>
            </div>
            
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSessions.length)} of {filteredSessions.length} entries
            </div>
          </div>

          {/* Sessions Table */}
          <div className="bg-white shadow-sm border border-gray-200 overflow-hidden mb-4">
            {loading ? (
              <div className='w-full p-[20px] flex justify-center items-center'>
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-b-blue-500 border-l-transparent border-r-transparent"></div>
                  <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-blue-500/20 blur-sm"></div>
                </div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchSessions}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-600">No game sessions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Session ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Player ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Game Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Start Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Last Activity
                      </th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Total Bets
                      </th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Total Stake
                      </th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Total Payout
                      </th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider border border-gray-200">
                        Net Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {currentItems.map((session) => (
                      <React.Fragment key={session._id}>
                        {/* Session Header Row */}
                        <tr 
                          className="cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => toggleSession(session._id)}
                        >
                          <td className="px-4 py-3 border border-blue-200">
                            <div className="flex items-center">
                              {expandedSessions[session._id] ? (
                                <FiChevronUp className="mr-2 text-blue-600" />
                              ) : (
                                <FiChevronDown className="mr-2 text-blue-600" />
                              )}
                              <span className="font-medium text-blue-800">
                                {session.session_id}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 border border-blue-200">
                            {session.player_id}
                          </td>
                          <td className="px-4 py-3 border border-blue-200 font-medium text-purple-700">
                            {session.game_name}
                          </td>
                          <td className="px-4 py-3 border border-blue-200">
                            {formatDate(session.createdAt)}
                          </td>
                          <td className="px-4 py-3 border border-blue-200">
                            {formatDate(session.updatedAt)}
                          </td>
                          <td className="px-4 py-3 border border-blue-200">
                            {session.transactions.length}
                          </td>
                          <td className="px-4 py-3 border border-blue-200">
                            {formatCurrency(session.total_bet)}
                          </td>
                          <td className="px-4 py-3 border border-blue-200">
                            {formatCurrency(session.total_win)}
                          </td>
                          <td className={`px-4 py-3 border border-blue-200 ${session.total_win - session.total_bet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(session.total_win - session.total_bet)}
                          </td>
                        </tr>

                        {/* Session Details Row */}
                        {expandedSessions[session._id] && (
                          <>
                            <tr className="bg-blue-50">
                              <td colSpan="9" className="px-4 py-3 border border-blue-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span className="font-medium text-blue-800">
                                      {session.transactions.length} transactions • 
                                      Game: {getGameName(session)} • 
                                      Initial Balance: {formatCurrency(session.initial_balance)} • 
                                      Current Balance: {formatCurrency(session.current_balance)}
                                    </span>
                                  </div>
                                  <div className="text-sm text-blue-600">
                                    Session Duration: {Math.round((new Date(session.updatedAt) - new Date(session.createdAt)) / 60000)} minutes
                                  </div>
                                </div>
                              </td>
                            </tr>

                            {/* Transactions Table */}
                            <tr>
                              <td colSpan="9" className="px-0 py-0 border border-blue-200">
                                <div className="bg-gray-50 p-2">
                                  <h4 className="font-semibold text-gray-700 mb-2 ml-2">Bet Details</h4>
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                                          Round ID
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                                          Time
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                                          Game Name
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                                          Status
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                                          Stake
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                                          Payout
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border border-gray-300">
                                          Amount
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {session.transactions.map((transaction, index) => (
                                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                                          <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">
                                            {transaction.round_id || 'N/A'}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">
                                            {formatDate(transaction.timestamp)}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-900 font-medium border border-gray-300">
                                            {getGameName(session)}
                                          </td>
                                          <td className={`px-4 py-2 text-sm border border-gray-300 ${getStatusColor(transaction)}`}>
                                            <span className="px-2 py-1 text-xs font-medium rounded-full">
                                              {getTransactionType(transaction)}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-900 font-medium border border-gray-300">
                                            {transaction.type === 'bet' ? formatCurrency(transaction.amount) : '-'}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-900 font-medium border border-gray-300">
                                            {transaction.type === 'win' ? formatCurrency(transaction.amount) : '-'}
                                          </td>
                                          <td className="px-4 py-2 text-sm text-gray-900 font-medium border border-gray-300">
                                            {formatCurrency(transaction.amount)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                    <tfoot>
                                      <tr className="bg-gray-100 font-semibold">
                                        <td colSpan="3" className="px-4 py-2 text-right border border-gray-300">
                                          Session Totals:
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300"></td>
                                        <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">
                                          {formatCurrency(session.total_bet)}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-900 border border-gray-300">
                                          {formatCurrency(session.total_win)}
                                        </td>
                                        <td className={`px-4 py-2 text-sm border border-gray-300 ${session.total_win - session.total_bet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {formatCurrency(session.total_win - session.total_bet)}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Controls - Bottom */}
          {filteredSessions.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSessions.length)} of {filteredSessions.length} entries
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md border ${currentPage === 1 ? 'text-gray-400 border-gray-300 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  <FiChevronLeft />
                </button>
                
                {getPageNumbers().map((pageNumber, index) => (
                  <button
                    key={index}
                    onClick={() => typeof pageNumber === 'number' ? setCurrentPage(pageNumber) : null}
                    className={`min-w-[40px] px-3 py-2 rounded-md border ${
                      pageNumber === currentPage 
                        ? 'bg-cyan-600 text-white border-cyan-600' 
                        : pageNumber === '...'
                        ? 'text-gray-500 border-transparent cursor-default'
                        : 'text-gray-700 border-gray-300 hover:bg-gray-100'
                    }`}
                    disabled={pageNumber === '...'}
                  >
                    {pageNumber}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md border ${currentPage === totalPages ? 'text-gray-400 border-gray-300 cursor-not-allowed' : 'text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Gamelogs;
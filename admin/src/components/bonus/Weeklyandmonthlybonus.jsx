import React, { useState, useEffect } from 'react';
import { 
  FaCalendarWeek, FaCalendarDay, FaSpinner, FaHistory, 
  FaUsers, FaChartBar, FaInfoCircle, FaUser, FaIdCard, 
  FaMoneyBillWave, FaPlusCircle, FaEye, FaSearch, FaFilter,
  FaCheckCircle, FaClock, FaTimesCircle, FaDownload
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../common/Header';
import axios from 'axios';

const Weeklyandmonthlybonus = () => {
  const [submittingWeekly, setSubmittingWeekly] = useState(false);
  const [submittingMonthly, setSubmittingMonthly] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingEligibleUsers, setLoadingEligibleUsers] = useState(false);
  const [loadingUnclaimed, setLoadingUnclaimed] = useState(false);
  const [stats, setStats] = useState(null);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [bonusHistory, setBonusHistory] = useState([]);
  const [unclaimedBonuses, setUnclaimedBonuses] = useState([]);
  const [showEligibleUsers, setShowEligibleUsers] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showUnclaimed, setShowUnclaimed] = useState(false);
  const [bonusType, setBonusType] = useState('weekly');
  const [searchTerm, setSearchTerm] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [unclaimedPage, setUnclaimedPage] = useState(1);
  const [unclaimedTotalPages, setUnclaimedTotalPages] = useState(1);
  const [showHistoryFilters, setShowHistoryFilters] = useState(false);
  const [showUnclaimedFilters, setShowUnclaimedFilters] = useState(false);
  const [historyFilters, setHistoryFilters] = useState({
    bonusType: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });
  const [unclaimedFilters, setUnclaimedFilters] = useState({
    bonusType: 'all',
    startDate: '',
    endDate: ''
  });

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const admin = JSON.parse(localStorage.getItem('genzz_admin'));

  // Fetch data on component mount
  useEffect(() => {
    fetchBonusStats();
    fetchEligibleUsers('weekly');
    fetchBonusHistory();
    fetchUnclaimedBonuses();
  }, []);

  const fetchBonusStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('genzz_token')
      const response = await axios.get(`${base_url}/admin/bonus/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching bonus stats:', error);
      toast.error('Failed to load bonus statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchEligibleUsers = async (type) => {
    try {
      setLoadingEligibleUsers(true);
      const token = localStorage.getItem('genzz_token')
      const response = await axios.get(`${base_url}/admin/bonus/eligible-users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { bonusType: type }
      });

      if (response.data.success) {
        setEligibleUsers(response.data.users || []);
        setBonusType(type);
      }
    } catch (error) {
      console.error('Error fetching eligible users:', error);
      toast.error('Failed to load eligible users');
    } finally {
      setLoadingEligibleUsers(false);
    }
  };

  const fetchBonusHistory = async (page = 1, filters = {}) => {
    try {
      setLoadingHistory(true);
      const token = localStorage.getItem('genzz_token')
      const response = await axios.get(`${base_url}/admin/bonus/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page,
          limit: 10,
          ...filters,
          sortBy: 'creditedAt',
          sortOrder: 'desc'
        }
      });

      if (response.data.success) {
        setBonusHistory(response.data.data || []);
        setHistoryTotalPages(response.data.pagination?.pages || 1);
        setHistoryPage(page);
      }
    } catch (error) {
      console.error('Error fetching bonus history:', error);
      toast.error('Failed to load bonus history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchUnclaimedBonuses = async (page = 1, filters = {}) => {
    try {
      setLoadingUnclaimed(true);
      const token = localStorage.getItem('genzz_token')
      const response = await axios.get(`${base_url}/admin/bonus/unclaimed`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page,
          limit: 10,
          ...filters
        }
      });

      if (response.data.success) {
        setUnclaimedBonuses(response.data.data || []);
        setUnclaimedTotalPages(response.data.pagination?.pages || 1);
        setUnclaimedPage(page);
      }
    } catch (error) {
      console.error('Error fetching unclaimed bonuses:', error);
      toast.error('Failed to load unclaimed bonuses');
    } finally {
      setLoadingUnclaimed(false);
    }
  };

  const applyHistoryFilters = () => {
    fetchBonusHistory(1, historyFilters);
    setShowHistoryFilters(false);
  };

  const clearHistoryFilters = () => {
    setHistoryFilters({
      bonusType: 'all',
      status: 'all',
      startDate: '',
      endDate: ''
    });
    fetchBonusHistory(1);
  };

  const applyUnclaimedFilters = () => {
    fetchUnclaimedBonuses(1, unclaimedFilters);
    setShowUnclaimedFilters(false);
  };

  const clearUnclaimedFilters = () => {
    setUnclaimedFilters({
      bonusType: 'all',
      startDate: '',
      endDate: ''
    });
    fetchUnclaimedBonuses(1);
  };

  const handleWeeklyBonusSubmit = async () => {
    if (!admin?._id || !admin?.name) {
      toast.error('Admin information is required');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to distribute weekly bonus to ${eligibleUsers.length} eligible users? Bonuses will be marked as unclaimed.`);
    if (!confirmed) return;

    setSubmittingWeekly(true);
    
    try {
      const token = localStorage.getItem('genzz_token')
      const response = await axios.post(
        `${base_url}/admin/bonus/weekly`,
        {
          adminId: admin._id,
          adminUsername: admin.name,
          notes: "Weekly bonus distribution",
          date: new Date().toISOString().split('T')[0]
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Weekly bonus distributed successfully!');
        
        // Update all data after successful distribution
        fetchBonusStats();
        fetchEligibleUsers('weekly');
        fetchBonusHistory();
        fetchUnclaimedBonuses();
        
        // Show summary in toast
        const summary = response.data.summary;
        toast.success(
          `Distributed ${formatCurrency(summary.totalBonusAmount)} to ${summary.creditedUsers} users. Status: ${summary.status}`,
          { duration: 5000 }
        );
      } else {
        toast.error(response.data.message || 'Failed to distribute weekly bonus');
      }
    } catch (error) {
      console.error('Error submitting weekly bonus:', error);
      toast.error(error.response?.data?.message || 'Failed to submit weekly bonus');
    } finally {
      setSubmittingWeekly(false);
    }
  };

  const handleMonthlyBonusSubmit = async () => {
    if (!admin?._id || !admin?.name) {
      toast.error('Admin information is required');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to distribute monthly bonus to ${eligibleUsers.length} eligible users? Bonuses will be marked as unclaimed.`);
    if (!confirmed) return;

    setSubmittingMonthly(true);
    
    try {
      const token = localStorage.getItem('genzz_token')
      const now = new Date();
      
      const response = await axios.post(
        `${base_url}/admin/bonus/monthly`,
        {
       adminId: admin._id,
          adminUsername: admin.name,
          notes: "Monthly bonus distribution",
          date: now.toISOString().split('T')[0],
          month: now.getMonth() + 1,
          year: now.getFullYear()
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Monthly bonus distributed successfully!');
        
        // Update all data after successful distribution
        fetchBonusStats();
        fetchEligibleUsers('monthly');
        fetchBonusHistory();
        fetchUnclaimedBonuses();
        
        // Show summary in toast
        const summary = response.data.summary;
        toast.success(
          `Distributed ${formatCurrency(summary.totalBonusAmount)} to ${summary.creditedUsers} users. Status: ${summary.status}`,
          { duration: 5000 }
        );
      } else {
        toast.error(response.data.message || 'Failed to distribute monthly bonus');
      }
    } catch (error) {
      console.error('Error submitting monthly bonus:', error);
      toast.error(error.response?.data?.message || 'Failed to submit monthly bonus');
    } finally {
      setSubmittingMonthly(false);
    }
  };

  const handleManualBonus = async (userId, username, betAmount = 0) => {
    const bonusType = prompt(`Select bonus type for ${username}:\n1. Weekly\n2. Monthly`, "weekly");
    if (!bonusType || !['weekly', 'monthly'].includes(bonusType.toLowerCase())) {
      toast.error('Invalid bonus type selected');
      return;
    }

    const status = prompt(`Select bonus status:\n1. Unclaimed (will not add to balance)\n2. Claimed (add to balance immediately)`, "unclaimed");
    if (!status || !['unclaimed', 'claimed'].includes(status.toLowerCase())) {
      toast.error('Invalid status selected');
      return;
    }

    const defaultAmount = bonusType === 'weekly' ? (betAmount * 0.008).toFixed(2) : (betAmount * 0.005).toFixed(2);
    const bonusAmount = prompt(`Enter ${bonusType} bonus amount for ${username} (${status}):`, defaultAmount);
    
    if (!bonusAmount || isNaN(bonusAmount) || parseFloat(bonusAmount) <= 0) {
      toast.error('Please enter a valid bonus amount');
      return;
    }

    try {
      const token = localStorage.getItem('genzz_token')
      const response = await axios.post(
        `${base_url}/admin/bonus/single-user`,
        {
          userId: userId,
          adminId: admin.id,
          adminUsername: admin.username,
          bonusType: bonusType.toLowerCase(),
          bonusAmount: parseFloat(bonusAmount),
          betAmount: betAmount,
          notes: `Manual ${bonusType} bonus`,
          status: status.toLowerCase()
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`${formatCurrency(parseFloat(bonusAmount))} ${status} bonus added to ${username}`);
        fetchEligibleUsers(bonusType.toLowerCase());
        fetchBonusStats();
        fetchBonusHistory();
        fetchUnclaimedBonuses();
      }
    } catch (error) {
      console.error('Error adding manual bonus:', error);
      toast.error(error.response?.data?.message || 'Failed to add manual bonus');
    }
  };

  const handleClaimBonus = async (bonusId, username, amount) => {
    const confirmed = window.confirm(`Are you sure you want to claim ${formatCurrency(amount)} bonus for ${username}? This will add the amount to their balance.`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('genzz_token')
      const response = await axios.post(
        `${base_url}/admin/bonus/claim/${bonusId}`,
        {
          adminId: admin.id,
          adminUsername: admin.username
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`Bonus claimed successfully for ${username}`);
        fetchBonusStats();
        fetchBonusHistory();
        fetchUnclaimedBonuses();
      }
    } catch (error) {
      console.error('Error claiming bonus:', error);
      toast.error(error.response?.data?.message || 'Failed to claim bonus');
    }
  };

  const handleBulkClaim = async () => {
    if (unclaimedBonuses.length === 0) {
      toast.error('No unclaimed bonuses to claim');
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to claim ALL ${unclaimedBonuses.length} unclaimed bonuses? This will add ${formatCurrency(unclaimedBonuses.reduce((sum, b) => sum + b.bonusAmount, 0))} to user balances.`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('genzz_token')
      const promises = unclaimedBonuses.map(bonus => 
        axios.post(
          `${base_url}/admin/bonus/claim/${bonus._id}`,
          {
            adminId: admin.id,
            adminUsername: admin.username
          },
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.data.success).length;
      const failed = results.filter(r => r.status === 'rejected' || !r.value?.data.success).length;

      if (successful > 0) {
        toast.success(`Successfully claimed ${successful} bonuses`);
      }
      if (failed > 0) {
        toast.error(`${failed} bonuses failed to claim`);
      }

      fetchBonusStats();
      fetchBonusHistory();
      fetchUnclaimedBonuses();
    } catch (error) {
      console.error('Error in bulk claim:', error);
      toast.error('Failed to process bulk claim');
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter eligible users based on search term
  const filteredEligibleUsers = eligibleUsers.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.player_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'claimed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheckCircle className="mr-1" /> Claimed
        </span>;
      case 'unclaimed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <FaClock className="mr-1" /> Unclaimed
        </span>;
      case 'failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaTimesCircle className="mr-1" /> Failed
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  return (
    <div className="min-h-screen font-bai bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      <Header />
      
      <div className="w-full mx-auto p-4 md:p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Bonus Management</h1>
          <p className="text-gray-600 mt-2">Manage weekly and monthly bonus distributions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Weekly Bonus Rate</p>
                <p className="text-2xl font-bold text-blue-600">0.8%</p>
              </div>
              <FaCalendarWeek className="text-blue-500 text-xl" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Weekly bet × 0.008</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monthly Bonus Rate</p>
                <p className="text-2xl font-bold text-purple-600">0.5%</p>
              </div>
              <FaCalendarDay className="text-purple-500 text-xl" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Monthly bet × 0.005</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users Eligible</p>
                <p className="text-2xl font-bold text-green-600">{eligibleUsers.length}</p>
              </div>
              <FaUsers className="text-green-500 text-xl" />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {bonusType === 'weekly' ? 'Weekly' : 'Monthly'} bonus
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unclaimed Bonuses</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats?.byStatus?.find(s => s._id === 'unclaimed')?.count || 0}
                </p>
              </div>
              <FaClock className="text-orange-500 text-xl" />
            </div>
            <p className="text-xs text-gray-400 mt-2">Waiting to be claimed</p>
          </div>
        </div>

        {/* Two Button Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Weekly Bonus Button */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-blue-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaCalendarWeek className="text-blue-600 text-2xl" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">Weekly Bonus</h2>
              <p className="text-gray-600 mb-4 text-sm">
                Distribute weekly bonus: <span className="font-semibold">Weekly bet amount × 0.8%</span>
              </p>
              
              <div className="w-full mb-4 text-gray-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Weekly Rate:</span>
                  <span className="font-semibold text-blue-600">0.8%</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Calculation:</span>
                  <span className="font-semibold">Weekly Bet × 0.008</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Eligible Users:</span>
                  <span className="font-semibold">
                    {eligibleUsers.filter(u => u.betAmount > 0).length} users
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleWeeklyBonusSubmit}
                disabled={submittingWeekly || eligibleUsers.length === 0}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingWeekly ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCalendarWeek />
                    Distribute Weekly Bonus
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  fetchEligibleUsers('weekly');
                  setShowEligibleUsers(true);
                  setShowHistory(false);
                  setShowUnclaimed(false);
                }}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <FaInfoCircle />
                View Eligible Users
              </button>
            </div>
          </div>

          {/* Monthly Bonus Button */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-purple-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FaCalendarDay className="text-purple-600 text-2xl" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">Monthly Bonus</h2>
              <p className="text-gray-600 mb-4 text-sm">
                Distribute monthly bonus: <span className="font-semibold">Monthly bet amount × 0.5%</span>
              </p>
              
              <div className="w-full mb-4 text-gray-700">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Monthly Rate:</span>
                  <span className="font-semibold text-purple-600">0.5%</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Calculation:</span>
                  <span className="font-semibold">Monthly Bet × 0.005</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Eligible Users:</span>
                  <span className="font-semibold">
                    {eligibleUsers.filter(u => u.betAmount > 0).length} users
                  </span>
                </div>
              </div>
              
              <button
                onClick={handleMonthlyBonusSubmit}
                disabled={submittingMonthly || eligibleUsers.length === 0}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingMonthly ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaCalendarDay />
                    Distribute Monthly Bonus
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  fetchEligibleUsers('monthly');
                  setShowEligibleUsers(true);
                  setShowHistory(false);
                  setShowUnclaimed(false);
                }}
                className="mt-3 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <FaInfoCircle />
                View Eligible Users
              </button>
            </div>
          </div>
        </div>

        {/* Tabs for Eligible Users, History, and Unclaimed */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => {
                setShowEligibleUsers(true);
                setShowHistory(false);
                setShowUnclaimed(false);
              }}
              className={`flex-1 py-3 px-4 text-center font-medium ${showEligibleUsers ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FaUsers className="inline-block mr-2" />
              Eligible Users ({eligibleUsers.length})
            </button>
            <button
              onClick={() => {
                setShowHistory(true);
                setShowEligibleUsers(false);
                setShowUnclaimed(false);
                fetchBonusHistory();
              }}
              className={`flex-1 py-3 px-4 text-center font-medium ${showHistory ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FaHistory className="inline-block mr-2" />
              Bonus History
            </button>
            <button
              onClick={() => {
                setShowUnclaimed(true);
                setShowEligibleUsers(false);
                setShowHistory(false);
                fetchUnclaimedBonuses();
              }}
              className={`flex-1 py-3 px-4 text-center font-medium ${showUnclaimed ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FaClock className="inline-block mr-2" />
              Unclaimed Bonuses ({unclaimedBonuses.length})
            </button>
          </div>

          {/* Eligible Users Tab Content */}
          {showEligibleUsers && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Eligible Users</h3>
                  <p className="text-sm text-gray-600">
                    {bonusType === 'weekly' ? 'Weekly' : 'Monthly'} bonus eligible users
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative flex-1">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-blue-500 text-gray-700"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchEligibleUsers('weekly')}
                      disabled={loadingEligibleUsers}
                      className={`px-4 py-2 rounded-lg border ${bonusType === 'weekly' ? 'bg-blue-100 text-blue-700 border-blue-500' : 'bg-gray-100 border-gray-300 text-gray-600'} ${loadingEligibleUsers ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loadingEligibleUsers ? <FaSpinner className="animate-spin inline mr-1" /> : null}
                      Weekly
                    </button>
                    <button
                      onClick={() => fetchEligibleUsers('monthly')}
                      disabled={loadingEligibleUsers}
                      className={`px-4 py-2 rounded-lg border ${bonusType === 'monthly' ? 'bg-purple-100 text-purple-700 border-purple-500' : 'bg-gray-100 text-gray-600 border-gray-300'} ${loadingEligibleUsers ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loadingEligibleUsers ? <FaSpinner className="animate-spin inline mr-1" /> : null}
                      Monthly
                    </button>
                  </div>
                </div>
              </div>

              {loadingEligibleUsers ? (
                <div className="flex justify-center py-12">
                  <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : filteredEligibleUsers.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">User Info</th>
                        <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                          {bonusType === 'weekly' ? 'Weekly Bet' : 'Monthly Bet'}
                        </th>
                        <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Potential Bonus</th>
                        <th className="px-4 py-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">Current Balance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredEligibleUsers.map((user, index) => (
                        <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <FaUser className="text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="flex items-center text-xs text-gray-400 mt-1">
                                  <FaIdCard className="mr-1" />
                                  {user.player_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(user.betAmount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {bonusType === 'weekly' ? 'Weekly bet' : 'Monthly bet'}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-semibold text-green-600">
                                  {formatCurrency(user.potentialBonus)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.bonusPercentage || (bonusType === 'weekly' ? '0.8%' : '0.5%')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(user.currentBalance)}
                            </div>
                            <div className="text-xs text-gray-500">
                              After bonus: {formatCurrency(user.newBalance)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredEligibleUsers.length > 10 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                      <div className="text-sm text-gray-500 text-center">
                        Showing {Math.min(10, filteredEligibleUsers.length)} of {filteredEligibleUsers.length} users
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No eligible users</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No users found for {bonusType} bonus distribution.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* History Tab Content */}
          {showHistory && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Bonus History</h3>
                  <p className="text-sm text-gray-600">All bonus distribution records</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowHistoryFilters(!showHistoryFilters)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FaFilter className="mr-2" />
                    Filters
                  </button>
                  <button
                    onClick={() => fetchBonusHistory()}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showHistoryFilters && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border text-gray-700 border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Type</label>
                      <select
                        value={historyFilters.bonusType}
                        onChange={(e) => setHistoryFilters({...historyFilters, bonusType: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="all">All Types</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={historyFilters.status}
                        onChange={(e) => setHistoryFilters({...historyFilters, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="all">All Status</option>
                        <option value="claimed">Claimed</option>
                        <option value="unclaimed">Unclaimed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={historyFilters.startDate}
                        onChange={(e) => setHistoryFilters({...historyFilters, startDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={historyFilters.endDate}
                        onChange={(e) => setHistoryFilters({...historyFilters, endDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={clearHistoryFilters}
                      className="px-4 py-2 text-sm font-medium border-[1px] border-gray-300 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Clear
                    </button>
                    <button
                      onClick={applyHistoryFilters}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}

              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : bonusHistory.length > 0 ? (
                <>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bet Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bonusHistory.map((record) => (
                          <tr key={record._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">{record.username}</div>
                              <div className="text-xs text-gray-500">ID: {record.userId?.username || record.userId || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                record.bonusType === 'weekly' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {record.bonusType}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {formatCurrency(record.betAmount)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-semibold text-green-600">
                                {formatCurrency(record.bonusAmount)}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-gray-900">
                                {record.bonusRate || record.bonusPercentage || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {formatDate(record.creditedAt)}
                            </td>
                            <td className="px-4 py-4">
                              {getStatusBadge(record.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {historyTotalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                      <div className="flex flex-1 justify-between sm:hidden">
                        <button
                          onClick={() => fetchBonusHistory(historyPage - 1, historyFilters)}
                          disabled={historyPage === 1}
                          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => fetchBonusHistory(historyPage + 1, historyFilters)}
                          disabled={historyPage === historyTotalPages}
                          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing page <span className="font-medium">{historyPage}</span> of{' '}
                            <span className="font-medium">{historyTotalPages}</span>
                          </p>
                        </div>
                        <div>
                          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                              onClick={() => fetchBonusHistory(historyPage - 1, historyFilters)}
                              disabled={historyPage === 1}
                              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                              <span className="sr-only">Previous</span>
                              Previous
                            </button>
                            {Array.from({ length: Math.min(5, historyTotalPages) }, (_, i) => {
                              let pageNum;
                              if (historyTotalPages <= 5) {
                                pageNum = i + 1;
                              } else if (historyPage <= 3) {
                                pageNum = i + 1;
                              } else if (historyPage >= historyTotalPages - 2) {
                                pageNum = historyTotalPages - 4 + i;
                              } else {
                                pageNum = historyPage - 2 + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => fetchBonusHistory(pageNum, historyFilters)}
                                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                    historyPage === pageNum
                                      ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => fetchBonusHistory(historyPage + 1, historyFilters)}
                              disabled={historyPage === historyTotalPages}
                              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                              <span className="sr-only">Next</span>
                              Next
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No bonus history</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No bonus distribution records found.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Unclaimed Bonuses Tab Content */}
          {showUnclaimed && (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Unclaimed Bonuses</h3>
                  <p className="text-sm text-gray-600">Bonuses waiting to be claimed by users</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium text-orange-600">
                      Total: {formatCurrency(unclaimedBonuses.reduce((sum, b) => sum + b.bonusAmount, 0))}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({unclaimedBonuses.length} bonuses)
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowUnclaimedFilters(!showUnclaimedFilters)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FaFilter className="mr-2" />
                    Filters
                  </button>
                  <button
                    onClick={() => fetchUnclaimedBonuses()}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {/* Filters Panel */}
              {showUnclaimedFilters && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 border text-gray-700 border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bonus Type</label>
                      <select
                        value={unclaimedFilters.bonusType}
                        onChange={(e) => setUnclaimedFilters({...unclaimedFilters, bonusType: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="all">All Types</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={unclaimedFilters.startDate}
                        onChange={(e) => setUnclaimedFilters({...unclaimedFilters, startDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={unclaimedFilters.endDate}
                        onChange={(e) => setUnclaimedFilters({...unclaimedFilters, endDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={clearUnclaimedFilters}
                      className="px-4 py-2 text-sm font-medium border-[1px] border-gray-300 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Clear
                    </button>
                    <button
                      onClick={applyUnclaimedFilters}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}

              {loadingUnclaimed ? (
                <div className="flex justify-center py-12">
                  <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : unclaimedBonuses.length > 0 ? (
                <>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bet Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus Amount</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Distributed</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {unclaimedBonuses.map((record) => (
                          <tr key={record._id} className="hover:bg-gray-50">
                            <td className="px-4 py-4">
                              <div className="text-sm font-medium text-gray-900">{record.username}</div>
                              <div className="text-xs text-gray-500">ID: {record.userId?.username || record.userId || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                record.bonusType === 'weekly' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {record.bonusType}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {formatCurrency(record.betAmount)}
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-semibold text-orange-600">
                                {formatCurrency(record.bonusAmount)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {record.bonusRate || record.bonusPercentage || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {formatDate(record.creditedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {unclaimedTotalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                      <div className="flex flex-1 justify-between sm:hidden">
                        <button
                          onClick={() => fetchUnclaimedBonuses(unclaimedPage - 1, unclaimedFilters)}
                          disabled={unclaimedPage === 1}
                          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => fetchUnclaimedBonuses(unclaimedPage + 1, unclaimedFilters)}
                          disabled={unclaimedPage === unclaimedTotalPages}
                          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Showing page <span className="font-medium">{unclaimedPage}</span> of{' '}
                            <span className="font-medium">{unclaimedTotalPages}</span>
                          </p>
                        </div>
                        <div>
                          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                              onClick={() => fetchUnclaimedBonuses(unclaimedPage - 1, unclaimedFilters)}
                              disabled={unclaimedPage === 1}
                              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                              <span className="sr-only">Previous</span>
                              Previous
                            </button>
                            {Array.from({ length: Math.min(5, unclaimedTotalPages) }, (_, i) => {
                              let pageNum;
                              if (unclaimedTotalPages <= 5) {
                                pageNum = i + 1;
                              } else if (unclaimedPage <= 3) {
                                pageNum = i + 1;
                              } else if (unclaimedPage >= unclaimedTotalPages - 2) {
                                pageNum = unclaimedTotalPages - 4 + i;
                              } else {
                                pageNum = unclaimedPage - 2 + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => fetchUnclaimedBonuses(pageNum, unclaimedFilters)}
                                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                    unclaimedPage === pageNum
                                      ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => fetchUnclaimedBonuses(unclaimedPage + 1, unclaimedFilters)}
                              disabled={unclaimedPage === unclaimedTotalPages}
                              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                              <span className="sr-only">Next</span>
                              Next
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <FaClock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No unclaimed bonuses</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All bonuses have been claimed.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Statistics Section */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Bonus Statistics</h3>
            <button
              onClick={fetchBonusStats}
              disabled={loadingStats}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              {loadingStats ? <FaSpinner className="animate-spin mr-1" /> : <FaChartBar className="mr-1" />}
              Refresh Stats
            </button>
          </div>
          
          {loadingStats ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin text-2xl text-blue-500" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Statistics */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-4">Overall Statistics</h4>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-blue-600">Total Bonus Distributed</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {formatCurrency(stats.overall?.totalBonusAmount || 0)}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-blue-600">Total Transactions</div>
                      <div className="text-xl font-bold text-blue-800">{stats.overall?.totalTransactions || 0}</div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Average Bonus</div>
                      <div className="text-xl font-bold text-blue-800">
                        {formatCurrency(stats.overall?.averageBonus || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* By Type Statistics */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-4">By Bonus Type</h4>
                <div className="space-y-4">
                  {stats.byType?.map((typeStat, index) => (
                    <div key={index} className="bg-white/50 p-3 rounded-lg border-[1px] border-purple-300">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize text-purple-700">{typeStat._id} Bonus</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          typeStat._id === 'weekly' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {typeStat.count} transactions
                        </span>
                      </div>
                      <div className="text-xl font-bold text-purple-800">
                        {formatCurrency(typeStat.totalBonusAmount)}
                      </div>
                      <div className="text-sm text-purple-600">
                        Avg: {formatCurrency(typeStat.averageBonus || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Status Statistics */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800 mb-4">By Status</h4>
                <div className="space-y-4">
                  {stats.byStatus?.map((statusStat, index) => (
                    <div key={index} className="bg-white/50 p-3 rounded-lg border-[1px] border-green-300">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          {statusStat._id === 'claimed' && <FaCheckCircle className="text-green-500 mr-2" />}
                          {statusStat._id === 'unclaimed' && <FaClock className="text-yellow-500 mr-2" />}
                          {statusStat._id === 'failed' && <FaTimesCircle className="text-red-500 mr-2" />}
                          <span className="font-medium capitalize text-green-700">
                            {statusStat._id}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          statusStat._id === 'claimed' ? 'bg-green-100 text-green-800' :
                          statusStat._id === 'unclaimed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {statusStat.count}
                        </span>
                      </div>
                      <div className="text-xl font-bold text-green-800">
                        {formatCurrency(statusStat.totalBonusAmount)}
                      </div>
                      <div className="text-sm text-green-600">
                        Avg: {formatCurrency(statusStat.averageBonus || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No statistics available
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Weeklyandmonthlybonus;
import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  BarChart2, 
  ShoppingBag, 
  Users, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  Activity, 
  CreditCard, 
  UserPlus, 
  TrendingUp,
  Filter,
  Download,
  MoreVertical,
  Calendar,
  RefreshCw,
  DollarSign,
  Wallet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bell,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import Header from "../components/common/Header";
import StatCard from "../components/common/StatCard";
import Dashboardcard from "../components/overview/Dashboardcard";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { FaBangladeshiTakaSign } from "react-icons/fa6";

const OverviewPage = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Define CHART_COLORS constant
  const CHART_COLORS = {
    deposit: '#6366F1',
    withdraw: '#10B981',
    users: '#F59E0B',
    activities: '#EC4899',
    revenue: '#8B5CF6',
    pending: '#F59E0B',
    success: '#10B981',
    failed: '#EF4444',
    total: '#3B82F6',
    successful: '#10B981',
    completed: '#10B981',
    successRevenue: '#059669'
  };

  const [statisticData, setStatisticData] = useState({
    all_users: [],
    all_deposits: [],
    all_withdraw: []
  });

  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateFilter, setDateFilter] = useState('7d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [currentPage, setCurrentPage] = useState({
    users: 1,
    deposits: 1,
    withdrawals: 1
  });
  const [showPendingAlert, setShowPendingAlert] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationQueue, setNotificationQueue] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  
  const audioRef = useRef(null);
  const notificationIntervalRef = useRef(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchStatisticData();
    
    // Set up interval to check for pending withdrawals every 30 seconds
    const interval = setInterval(() => {
      fetchStatisticData();
    }, 30000);

    return () => {
      clearInterval(interval);
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, [dateFilter, statusFilter, typeFilter]);

  // Effect for pending withdrawal alert and notification
  useEffect(() => {
    const pendingWithdrawals = filteredData.withdrawals.filter(w => 
      w.status?.toLowerCase() === 'pending'
    ).length;

    if (pendingWithdrawals > 0) {
      setShowPendingAlert(true);
      
      // Add to notification queue
      const newNotification = {
        id: Date.now(),
        message: `${pendingWithdrawals} withdrawal${pendingWithdrawals > 1 ? 's' : ''} pending approval`,
        count: pendingWithdrawals,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setNotificationQueue(prev => [...prev, newNotification]);
      
      // Play alert sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }
    } else {
      setShowPendingAlert(false);
      setShowNotification(false);
      setNotificationQueue([]);
      setCurrentNotification(null);
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    }
  }, []);

  // Effect to handle notification queue
  useEffect(() => {
    if (notificationQueue.length > 0 && !currentNotification) {
      // Show first notification in queue
      setCurrentNotification(notificationQueue[0]);
      setShowNotification(true);
      
      // Set up interval to cycle through notifications
      notificationIntervalRef.current = setInterval(() => {
        setNotificationQueue(prev => {
          if (prev.length === 0) {
            setShowNotification(false);
            setCurrentNotification(null);
            clearInterval(notificationIntervalRef.current);
            return [];
          }
          
          // Rotate notifications
          const newQueue = [...prev.slice(1), prev[0]];
          setCurrentNotification(newQueue[0]);
          return newQueue;
        });
      }, 5000); // Change notification every 5 seconds
      
      // Auto-hide after 10 seconds for each notification
      const hideTimer = setTimeout(() => {
        setShowNotification(false);
        setTimeout(() => {
          setCurrentNotification(null);
        }, 300);
      }, 10000);
      
      return () => clearTimeout(hideTimer);
    }
  }, [notificationQueue, currentNotification]);

  const fetchStatisticData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("genzz_token");
      
      const response = await axios.get(`${base_url}/admin/statistic-data`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });
      
      setStatisticData(response.data);
    } catch (error) {
      console.error("Error fetching statistic data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on date range and other filters
  const filteredData = useMemo(() => {
    const filterByDate = (data, dateField = 'createdAt') => {
      if (!data || !Array.isArray(data)) return [];
      
      const now = new Date();
      let startDate = new Date();

      switch (dateFilter) {
        case '1d':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case 'custom':
          if (customDateRange.start && customDateRange.end) {
            startDate = new Date(customDateRange.start);
            const endDate = new Date(customDateRange.end);
            return data.filter(item => {
              const itemDate = new Date(item[dateField] || item.createdAt || item.created_at);
              return itemDate >= startDate && itemDate <= endDate;
            });
          }
          return data;
        default:
          return data;
      }

      if (dateFilter !== 'custom') {
        return data.filter(item => {
          const itemDate = new Date(item[dateField] || item.createdAt || item.created_at);
          return itemDate >= startDate && itemDate <= now;
        });
      }

      return data;
    };

    const filterByStatus = (data) => {
      if (statusFilter === 'all' || !data) return data;
      return data.filter(item => 
        item.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    };

    const filterByType = (data) => {
      if (typeFilter === 'all' || !data) return data;
      return data.filter(item => 
        item.payment_type?.toLowerCase() === typeFilter.toLowerCase() ||
        item.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    };

    // Apply filters to each dataset
    let filteredUsers = filterByDate(statisticData.all_users, 'createdAt');
    let filteredDeposits = filterByDate(statisticData.all_deposits, 'createdAt');
    let filteredWithdrawals = filterByDate(statisticData.all_withdraw, 'createdAt');

    filteredDeposits = filterByStatus(filteredDeposits);
    filteredWithdrawals = filterByStatus(filteredWithdrawals);
    
    if (typeFilter !== 'all') {
      filteredDeposits = filterByType(filteredDeposits);
      filteredWithdrawals = filterByType(filteredWithdrawals);
    }

    return {
      users: filteredUsers,
      deposits: filteredDeposits,
      withdrawals: filteredWithdrawals
    };
  }, [statisticData, dateFilter, statusFilter, typeFilter, customDateRange]);

  // Calculate metrics from filtered data
  const metrics = useMemo(() => {
    const users = filteredData.users || [];
    const deposits = filteredData.deposits || [];
    const withdrawals = filteredData.withdrawals || [];

    // Calculate totals
    const totalDeposits = deposits.reduce((sum, deposit) => sum + (parseFloat(deposit.amount) || 0), 0);
    const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + (parseFloat(withdrawal.amount) || 0), 0);
    const totalRevenue = totalDeposits - totalWithdrawals;

    // Calculate today's values (only successful transactions)
    const today = new Date().toDateString();
    const todaysDeposits = deposits
      .filter(deposit => 
        new Date(deposit.createdAt).toDateString() === today &&
        ['success', 'completed', 'approved'].includes(deposit.status?.toLowerCase())
      )
      .reduce((sum, deposit) => sum + (parseFloat(deposit.amount) || 0), 0);
    
    const todaysWithdrawals = withdrawals
      .filter(withdrawal => 
        new Date(withdrawal.createdAt).toDateString() === today &&
        ['success', 'completed', 'approved'].includes(withdrawal.status?.toLowerCase())
      )
      .reduce((sum, withdrawal) => sum + (parseFloat(withdrawal.amount) || 0), 0);

    // Calculate yesterday's values for comparison (only successful transactions)
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const yesterdaysDeposits = deposits
      .filter(deposit => 
        new Date(deposit.createdAt).toDateString() === yesterday &&
        ['success', 'completed', 'approved'].includes(deposit.status?.toLowerCase())
      )
      .reduce((sum, deposit) => sum + (parseFloat(deposit.amount) || 0), 0);
    
    const yesterdaysWithdrawals = withdrawals
      .filter(withdrawal => 
        new Date(withdrawal.createdAt).toDateString() === yesterday &&
        ['success', 'completed', 'approved'].includes(withdrawal.status?.toLowerCase())
      )
      .reduce((sum, withdrawal) => sum + (parseFloat(withdrawal.amount) || 0), 0);

    // Calculate user growth
    const todaysUsers = users.filter(user => 
      new Date(user.createdAt).toDateString() === today
    ).length;
    
    const yesterdaysUsers = users.filter(user => 
      new Date(user.createdAt).toDateString() === yesterday
    ).length;

    const userGrowth = todaysUsers - yesterdaysUsers;

    // Calculate status counts
    const successfulDeposits = deposits.filter(d => 
      ['success', 'completed', 'approved'].includes(d.status?.toLowerCase())
    );
    
    const successfulWithdrawals = withdrawals.filter(w => 
      ['success', 'completed', 'approved'].includes(w.status?.toLowerCase())
    );

    const pendingDeposits = deposits.filter(d => 
      d.status?.toLowerCase() === 'pending'
    );
    
    const pendingWithdrawals = withdrawals.filter(w => 
      w.status?.toLowerCase() === 'pending'
    );

    // Calculate successful amounts
    const successfulDepositsAmount = successfulDeposits.reduce((sum, deposit) => sum + (parseFloat(deposit.amount) || 0), 0);
    const successfulWithdrawalsAmount = successfulWithdrawals.reduce((sum, withdrawal) => sum + (parseFloat(withdrawal.amount) || 0), 0);

    // Calculate successful revenue (only from successful transactions)
    const successfulRevenue = successfulDepositsAmount - successfulWithdrawalsAmount;

    return {
      totalUsers: users.length,
      totalDeposits,
      totalWithdrawals,
      totalRevenue,
      successfulRevenue,
      todaysDeposits,
      todaysWithdrawals,
      todaysUsers,
      userGrowth,
      successfulDeposits: successfulDeposits.length,
      successfulWithdrawals: successfulWithdrawals.length,
      successfulDepositsAmount,
      successfulWithdrawalsAmount,
      pendingDeposits: pendingDeposits.length,
      pendingWithdrawals: pendingWithdrawals.length,
      depositSuccessRate: deposits.length > 0 ? (successfulDeposits.length / deposits.length) * 100 : 0,
      withdrawSuccessRate: withdrawals.length > 0 ? (successfulWithdrawals.length / withdrawals.length) * 100 : 0,
      depositGrowth: yesterdaysDeposits > 0 ? 
        ((todaysDeposits - yesterdaysDeposits) / yesterdaysDeposits) * 100 : 
        (todaysDeposits > 0 ? 100 : 0),
      withdrawGrowth: yesterdaysWithdrawals > 0 ? 
        ((todaysWithdrawals - yesterdaysWithdrawals) / yesterdaysWithdrawals) * 100 : 
        (todaysWithdrawals > 0 ? 100 : 0)
    };
  }, [filteredData]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const deposits = filteredData.deposits || [];
    const withdrawals = filteredData.withdrawals || [];

    // Group by date for charts
    const depositByDate = deposits.reduce((acc, deposit) => {
      const date = new Date(deposit.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += parseFloat(deposit.amount) || 0;
      return acc;
    }, {});

    const withdrawByDate = withdrawals.reduce((acc, withdrawal) => {
      const date = new Date(withdrawal.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += parseFloat(withdrawal.amount) || 0;
      return acc;
    }, {});

    // Convert to array format for charts
    const depositChartData = Object.entries(depositByDate).map(([date, amount]) => ({
      date,
      amount: Math.round(amount * 100) / 100
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const withdrawChartData = Object.entries(withdrawByDate).map(([date, amount]) => ({
      date,
      amount: Math.round(amount * 100) / 100
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      depositHistory: depositChartData,
      withdrawHistory: withdrawChartData
    };
  }, [filteredData]);

  const handleExport = async (type) => {
    try {
      setExportLoading(true);
      
      // Create CSV content based on type
      let csvContent = "data:text/csv;charset=utf-8,";
      let headers = [];
      let data = [];

      switch (type) {
        case 'users':
          headers = ['Username', 'Email', 'Player ID', 'Balance', 'Status', 'Joined Date'];
          data = filteredData.users.map(user => [
            user.username,
            user.email,
            user.player_id,
            user.balance,
            user.status,
            new Date(user.createdAt).toLocaleDateString()
          ]);
          break;
        case 'deposits':
          headers = ['Customer', 'Amount', 'Method', 'Status', 'Bonus Amount', 'Date'];
          data = filteredData.deposits.map(deposit => [
            deposit.customer_name,
            deposit.amount,
            deposit.payment_method,
            deposit.status,
            deposit.bonus_amount || 0,
            new Date(deposit.createdAt).toLocaleDateString()
          ]);
          break;
        case 'withdrawals':
          headers = ['User', 'Amount', 'Method', 'Status', 'Received Amount', 'Date'];
          data = filteredData.withdrawals.map(withdrawal => [
            withdrawal.name,
            withdrawal.amount,
            withdrawal.provider,
            withdrawal.status,
            withdrawal.recieved_amount || withdrawal.amount,
            new Date(withdrawal.createdAt).toLocaleDateString()
          ]);
          break;
      }

      csvContent += headers.join(',') + '\n';
      data.forEach(row => {
        csvContent += row.map(field => `"${field}"`).join(',') + '\n';
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.href = encodedUri;
      link.setAttribute('download', `${type}-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error("Export error:", error);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `৳${parseFloat(amount || 0).toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
      case 'completed':
      case 'approved':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'in review':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'rejected':
      case 'banned':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setShowNotification(false);
    setTimeout(() => {
      setCurrentNotification(null);
      setNotificationQueue([]);
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    }, 300);
  };

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (page, data) => (page - 1) * itemsPerPage;
    const endIndex = (page, data) => Math.min(page * itemsPerPage, data.length);

    return {
      users: {
        data: filteredData.users.slice(
          startIndex(currentPage.users, filteredData.users),
          endIndex(currentPage.users, filteredData.users)
        ),
        total: filteredData.users.length,
        totalPages: Math.ceil(filteredData.users.length / itemsPerPage)
      },
      deposits: {
        data: filteredData.deposits.slice(
          startIndex(currentPage.deposits, filteredData.deposits),
          endIndex(currentPage.deposits, filteredData.deposits)
        ),
        total: filteredData.deposits.length,
        totalPages: Math.ceil(filteredData.deposits.length / itemsPerPage)
      },
      withdrawals: {
        data: filteredData.withdrawals.slice(
          startIndex(currentPage.withdrawals, filteredData.withdrawals),
          endIndex(currentPage.withdrawals, filteredData.withdrawals)
        ),
        total: filteredData.withdrawals.length,
        totalPages: Math.ceil(filteredData.withdrawals.length / itemsPerPage)
      }
    };
  }, [filteredData, currentPage]);

  if (loading) {
    return (
      <div className="flex-1 overflow-auto relative z-10 font-Lato">
        <Header title="Dashboard Overview" />
        <div className="flex items-center justify-center h-96">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative z-10 font-bai">
      {/* Hidden audio element for pending withdrawal alert */}
      <audio 
        ref={audioRef} 
        preload="auto"
        src="/notification-sound.mp3" // Add your notification sound file
      />
      
      <Header title="Dashboard Overview" />

      {/* Pending Withdrawal Notification */}
      <AnimatePresence>
        {showNotification && currentNotification && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full"
          >
            <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-2xl border-2 border-white/20 overflow-hidden">
              {/* Notification Header */}
              <div className="flex items-center justify-between p-4 bg-black/20">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Bell className="h-6 w-6 text-white" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 h-3 w-3 bg-red-400 rounded-full border-2 border-white"
                    />
                  </div>
                  <span className="text-white font-bold text-lg">Alert!</span>
                </div>
                <button
                  onClick={handleCloseNotification}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Notification Body */}
              <div className="p-4 bg-white">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Pending Withdrawals
                    </h3>
                    <p className="text-gray-700 text-sm mb-2">
                      {currentNotification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {currentNotification.count} pending
                      </span>
                      <span className="text-xs text-gray-500">
                        {currentNotification.timestamp}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 10, ease: "linear" }}
                      className="h-1.5 rounded-full bg-red-500"
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => {
                      setActiveTab('transactions');
                      setTypeFilter('withdraw');
                      setStatusFilter('pending');
                      handleCloseNotification();
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Review Now
                  </button>
                  <button
                    onClick={handleCloseNotification}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Flashing Border Effect */}
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 border-2 border-red-400 rounded-2xl pointer-events-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="py-6 px-4 lg:px-8">
        {/* Tabs */}
        <div className="flex mb-6 bg-white rounded-lg border-[1px] border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-medium rounded-md ${
              activeTab === 'overview'
                ? 'text-white bg-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium rounded-md ${
              activeTab === 'users'
                ? 'text-white bg-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-6 py-3 font-medium rounded-md ${
              activeTab === 'transactions'
                ? 'text-white bg-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-6 py-3 font-medium rounded-md ${
              activeTab === 'analytics'
                ? 'text-white bg-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 mb-6 flex flex-wrap border-[1px] border-gray-200 rounded-[10px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              {activeTab === 'overview' && 'Performance Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'transactions' && 'Transaction History'}
              {activeTab === 'analytics' && 'Performance Analytics'}
            </h2>
            <button 
              onClick={fetchStatisticData}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Refresh data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Filter */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-[5px] border-[1px] border-gray-300 px-3 py-2">
              <Calendar size={16} className="text-gray-500" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-sm text-gray-800 border-none focus:ring-0"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            
            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-[5px] border-[1px] border-gray-300 px-3 py-2">
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange({...customDateRange, start: e.target.value})}
                  className="bg-transparent text-sm text-gray-800 border-none focus:ring-0 max-w-28"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange({...customDateRange, end: e.target.value})}
                  className="bg-transparent text-sm text-gray-800 border-none focus:ring-0 max-w-28"
                />
              </div>
            )}

            {/* Status Filter */}
            {(activeTab === 'transactions' || activeTab === 'users') && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-[5px] border-[1px] border-gray-300 px-3 py-2">
                <Filter size={16} className="text-gray-500" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-sm text-gray-800 border-none focus:ring-0"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="success">Success</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            )}

            {/* Type Filter for Transactions */}
            {activeTab === 'transactions' && (
              <div className="flex items-center gap-2 bg-gray-100 rounded-[5px] border-[1px] border-gray-300 px-3 py-2">
                <Filter size={16} className="text-gray-500" />
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent text-sm text-gray-800 border-none focus:ring-0"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdraw">Withdrawals</option>
                </select>
              </div>
            )}

            <button 
              onClick={() => handleExport(activeTab)}
              disabled={exportLoading}
              className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 border-[1px] border-gray-300 hover:bg-gray-200 rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
            >
              {exportLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              ) : (
                <Download size={16} />
              )}
              Export
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* STATS */}
            <motion.div
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              {/* Total Users */}
              <StatCard
                name="Total Users"
                icon={Users}
                value={metrics.totalUsers.toString()}
                color={CHART_COLORS.users}
                trend={metrics.userGrowth > 0 ? "up" : metrics.userGrowth < 0 ? "down" : "equal"}
                difference={Math.abs(metrics.userGrowth).toString()}
                percentage={metrics.todaysUsers > 0 ? `${metrics.todaysUsers} today` : "0 today"}
              />

              {/* Total Deposits */}
              <StatCard
                name="Total Deposits"
                icon={FaBangladeshiTakaSign}
                value={formatCurrency(metrics.totalDeposits)}
                color={CHART_COLORS.deposit}
                trend={metrics.depositGrowth > 0 ? "up" : metrics.depositGrowth < 0 ? "down" : "equal"}
                difference={formatCurrency(metrics.todaysDeposits)}
                percentage={`${metrics.depositGrowth.toFixed(1)}%`}
              />

              {/* Total Withdrawals */}
              <motion.div
                animate={showPendingAlert ? {
                  y: [0, -10, 0, -10, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: showPendingAlert ? 3 : 0,
                  repeatType: "loop"
                }}
              >
                <StatCard
                  name="Total Withdrawals"
                  icon={Wallet}
                  value={formatCurrency(metrics.totalWithdrawals)}
                  color={showPendingAlert ? '#EF4444' : CHART_COLORS.withdraw}
                  trend={metrics.withdrawGrowth > 0 ? "up" : metrics.withdrawGrowth < 0 ? "down" : "equal"}
                  difference={formatCurrency(metrics.todaysWithdrawals)}
                  percentage={`${metrics.withdrawGrowth.toFixed(1)}%`}
                  alert={showPendingAlert}
                />
              </motion.div>

              {/* Total Revenue */}
              <StatCard
                name="Net Revenue"
                icon={ShoppingBag}
                value={formatCurrency(metrics.totalRevenue)}
                color={CHART_COLORS.revenue}
                trend={metrics.totalRevenue > 0 ? "up" : metrics.totalRevenue < 0 ? "down" : "equal"}
                difference={formatCurrency(metrics.totalRevenue)}
                percentage="Net"
              />
            </motion.div>

            {/* TODAY'S METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {/* Today's Deposits */}
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Today's Successful Deposits</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.todaysDeposits)}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {metrics.depositGrowth > 0 ? (
                        <span className="text-green-600 flex items-center">
                          <ArrowUp size={12} className="mr-1" />
                          {metrics.depositGrowth.toFixed(1)}% from yesterday
                        </span>
                      ) : metrics.depositGrowth < 0 ? (
                        <span className="text-red-600 flex items-center">
                          <ArrowDown size={12} className="mr-1" />
                          {Math.abs(metrics.depositGrowth).toFixed(1)}% from yesterday
                        </span>
                      ) : (
                        <span className="text-gray-600">No change from yesterday</span>
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FaBangladeshiTakaSign size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Today's Withdrawals */}
              <motion.div 
                className="bg-white p-4 rounded-[10px] border border-gray-200"
                animate={showPendingAlert ? {
                  boxShadow: [
                    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                    "0 0 0 3px rgba(239, 68, 68, 0.3), 0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                  ]
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: showPendingAlert ? 3 : 0,
                  repeatType: "loop"
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Today's Successful Withdrawals</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.todaysWithdrawals)}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {metrics.withdrawGrowth > 0 ? (
                        <span className="text-green-600 flex items-center">
                          <ArrowUp size={12} className="mr-1" />
                          {metrics.withdrawGrowth.toFixed(1)}% from yesterday
                        </span>
                      ) : metrics.withdrawGrowth < 0 ? (
                        <span className="text-red-600 flex items-center">
                          <ArrowDown size={12} className="mr-1" />
                          {Math.abs(metrics.withdrawGrowth).toFixed(1)}% from yesterday
                        </span>
                      ) : (
                        <span className="text-gray-600">No change from yesterday</span>
                      )}
                    </p>
                    {showPendingAlert && (
                      <div className="flex items-center mt-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        <AlertTriangle size={12} className="mr-1" />
                        {metrics.pendingWithdrawals} pending withdrawals need attention
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${showPendingAlert ? 'bg-red-100' : 'bg-green-100'}`}>
                    <Wallet size={24} className={showPendingAlert ? 'text-red-600' : 'text-green-600'} />
                  </div>
                </div>
              </motion.div>

              {/* Today's Users */}
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Today's New Users</p>
                    <p className="text-2xl font-bold text-purple-600">{metrics.todaysUsers}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {metrics.userGrowth > 0 ? (
                        <span className="text-green-600 flex items-center">
                          <ArrowUp size={12} className="mr-1" />
                          +{metrics.userGrowth} from yesterday
                        </span>
                      ) : metrics.userGrowth < 0 ? (
                        <span className="text-red-600 flex items-center">
                          <ArrowDown size={12} className="mr-1" />
                          {metrics.userGrowth} from yesterday
                        </span>
                      ) : (
                        <span className="text-gray-600">No change from yesterday</span>
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <UserPlus size={24} className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* SUCCESSFUL REVENUE BOX */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Successful Revenue */}
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Successful Revenue</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(metrics.successfulRevenue)}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      From successful transactions only
                    </p>
                    <div className="flex items-center mt-2 text-xs">
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded mr-2">
                        +{formatCurrency(metrics.successfulDepositsAmount)}
                      </span>
                      <span className="text-red-600 bg-red-50 px-2 py-1 rounded">
                        -{formatCurrency(metrics.successfulWithdrawalsAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <CheckCircle size={24} className="text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Successful Deposits */}
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Successful Deposits</p>
                    <p className="text-lg font-semibold text-gray-800">{metrics.successfulDeposits}</p>
                    <p className="text-sm text-green-600 font-medium">
                      {formatCurrency(metrics.successfulDepositsAmount)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                </div>
              </div>
              
              {/* Successful Withdrawals */}
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Successful Withdrawals</p>
                    <p className="text-lg font-semibold text-gray-800">{metrics.successfulWithdrawals}</p>
                    <p className="text-sm text-green-600 font-medium">
                      {formatCurrency(metrics.successfulWithdrawalsAmount)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                </div>
              </div>
              
              {/* Deposit Success Rate */}
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Deposit Success Rate</p>
                    <p className="text-lg font-semibold text-gray-800">{metrics.depositSuccessRate.toFixed(1)}%</p>
                    <p className="text-sm text-gray-600">
                      {metrics.successfulDeposits} of {filteredData.deposits.length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Activity size={20} className="text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Transactions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Pending Deposits */}
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Deposits</p>
                    <p className="text-lg font-semibold text-gray-800">{metrics.pendingDeposits}</p>
                    <p className="text-sm text-yellow-600">Awaiting approval</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <CreditCard size={20} className="text-yellow-600" />
                  </div>
                </div>
              </div>
              
              {/* Pending Withdrawals */}
              <motion.div 
                className="bg-white p-4 rounded-[10px] border border-gray-200"
                animate={showPendingAlert ? {
                  borderColor: ["#e5e7eb", "#ef4444", "#e5e7eb"],
                  backgroundColor: ["#ffffff", "#fef2f2", "#ffffff"]
                } : {}}
                transition={{
                  duration: 0.5,
                  repeat: showPendingAlert ? 3 : 0,
                  repeatType: "loop"
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pending Withdrawals</p>
                    <p className="text-lg font-semibold text-gray-800">{metrics.pendingWithdrawals}</p>
                    <p className="text-sm text-yellow-600">Awaiting processing</p>
                    {showPendingAlert && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <AlertTriangle size={12} className="mr-1" />
                        Requires immediate attention
                      </div>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${showPendingAlert ? 'bg-red-100' : 'bg-orange-100'}`}>
                    <Wallet size={20} className={showPendingAlert ? 'text-red-600' : 'text-orange-600'} />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Deposit History Chart */}
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <TrendingUp size={20} className="mr-2 text-purple-500" />
                    Deposit History
                  </h3>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {dateFilter === '1d' ? '24 Hours' : 
                     dateFilter === '7d' ? '7 Days' : 
                     dateFilter === '30d' ? '30 Days' : 
                     dateFilter === '90d' ? '90 Days' : 'Custom Range'}
                  </div>
                </div>
                {chartData.depositHistory.length > 0 ? (
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <AreaChart data={chartData.depositHistory}>
                        <defs>
                          <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.deposit} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={CHART_COLORS.deposit} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `৳${value}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`৳${value}`, "Amount"]}
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke={CHART_COLORS.deposit} 
                          fillOpacity={1} 
                          fill="url(#colorDeposit)" 
                          name="Deposit Amount" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No deposit data available for the selected period
                  </div>
                )}
              </div>

              {/* Withdraw History Chart */}
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <TrendingUp size={20} className="mr-2 text-green-500" />
                    Withdraw History
                  </h3>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {dateFilter === '1d' ? '24 Hours' : 
                     dateFilter === '7d' ? '7 Days' : 
                     dateFilter === '30d' ? '30 Days' : 
                     dateFilter === '90d' ? '90 Days' : 'Custom Range'}
                  </div>
                </div>
                {chartData.withdrawHistory.length > 0 ? (
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer>
                      <AreaChart data={chartData.withdrawHistory}>
                        <defs>
                          <linearGradient id="colorWithdraw" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={CHART_COLORS.withdraw} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={CHART_COLORS.withdraw} stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `৳${value}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`৳${value}`, "Amount"]}
                          contentStyle={{ 
                            borderRadius: '8px', 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke={CHART_COLORS.withdraw} 
                          fillOpacity={1} 
                          fill="url(#colorWithdraw)" 
                          name="Withdraw Amount" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No withdrawal data available for the selected period
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Users Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold text-gray-800">{paginatedData.users.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Active Users</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {filteredData.users.filter(u => u.status === 'active').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <UserPlus size={24} className="text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">New Today</p>
                    <p className="text-2xl font-bold text-gray-800">{metrics.todaysUsers}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <TrendingUp size={24} className="text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white p-4 rounded-[10px] border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  User List ({paginatedData.users.total} users)
                </h3>
              </div>
              {paginatedData.users.data.length > 0 ? (
                <>
                  <div className="overflow-x-auto border-[1px] border-gray-300">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player ID</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Deposit</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Withdraw</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.users.data.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                                  <span className="font-medium text-purple-600">{user.username?.charAt(0).toUpperCase()}</span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.player_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(user.balance)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(user.total_deposit)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(user.total_withdraw)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Pagination */}
                  {paginatedData.users.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 px-2">
                      <p className="text-sm text-gray-700">
                        Showing {(currentPage.users - 1) * itemsPerPage + 1} to {Math.min(currentPage.users * itemsPerPage, paginatedData.users.total)} of {paginatedData.users.total} results
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setCurrentPage({...currentPage, users: currentPage.users - 1})}
                          disabled={currentPage.users === 1}
                          className="px-3 py-1 text-sm bg-gray-100 rounded-md disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage({...currentPage, users: currentPage.users + 1})}
                          disabled={currentPage.users >= paginatedData.users.totalPages}
                          className="px-3 py-1 text-sm bg-gray-100 rounded-md disabled:opacity-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No users found for the selected filters
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            {/* Transaction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Deposits</p>
                    <p className="text-2xl font-bold text-gray-800">{paginatedData.deposits.total}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(metrics.totalDeposits)}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <DollarSign size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Withdrawals</p>
                    <p className="text-2xl font-bold text-gray-800">{paginatedData.withdrawals.total}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(metrics.totalWithdrawals)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Wallet size={24} className="text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Successful Deposits</p>
                    <p className="text-2xl font-bold text-gray-800">{metrics.successfulDeposits}</p>
                    <p className="text-sm text-green-600">{formatCurrency(metrics.successfulDepositsAmount)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[10px] border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Successful Withdrawals</p>
                    <p className="text-2xl font-bold text-gray-800">{metrics.successfulWithdrawals}</p>
                    <p className="text-sm text-green-600">{formatCurrency(metrics.successfulWithdrawalsAmount)}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Deposits Table */}
            {(typeFilter === 'all' || typeFilter === 'deposit') && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Deposit History ({paginatedData.deposits.total} deposits)
                  </h3>
                </div>
                {paginatedData.deposits.data.length > 0 ? (
                  <>
                    <div className="overflow-x-auto border-[1px] border-gray-300">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedData.deposits.data.map((deposit) => (
                            <tr key={deposit._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="font-medium text-blue-600">{deposit.customer_name?.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{deposit.customer_name}</div>
                                    <div className="text-sm text-gray-500">{deposit.customer_email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(deposit.amount)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(deposit.bonus_amount)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{deposit.payment_method}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(deposit.status)}`}>
                                  {deposit.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(deposit.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                    </table>
                    </div>
                    {/* Pagination */}
                    {paginatedData.deposits.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 px-2">
                        <p className="text-sm text-gray-700">
                          Showing {(currentPage.deposits - 1) * itemsPerPage + 1} to {Math.min(currentPage.deposits * itemsPerPage, paginatedData.deposits.total)} of {paginatedData.deposits.total} results
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCurrentPage({...currentPage, deposits: currentPage.deposits - 1})}
                            disabled={currentPage.deposits === 1}
                            className="px-3 py-1 text-sm bg-gray-100 rounded-md disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setCurrentPage({...currentPage, deposits: currentPage.deposits + 1})}
                            disabled={currentPage.deposits >= paginatedData.deposits.totalPages}
                            className="px-3 py-1 text-sm bg-gray-100 rounded-md disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No deposits found for the selected filters
                  </div>
                )}
              </div>
            )}

            {/* Withdrawals Table */}
            {(typeFilter === 'all' || typeFilter === 'withdraw') && (
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Withdrawal History ({paginatedData.withdrawals.total} withdrawals)
                  </h3>
                </div>
                {paginatedData.withdrawals.data.length > 0 ? (
                  <>
                    <div className="overflow-x-auto border-[1px] border-gray-300">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedData.withdrawals.data.map((withdrawal) => (
                            <tr key={withdrawal._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="font-medium text-green-600">{withdrawal.name?.charAt(0).toUpperCase()}</span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{withdrawal.name}</div>
                                    <div className="text-sm text-gray-500">{withdrawal.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(withdrawal.amount)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(withdrawal.recieved_amount || withdrawal.amount)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{withdrawal.provider}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(withdrawal.status)}`}>
                                  {withdrawal.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(withdrawal.createdAt)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    {paginatedData.withdrawals.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 px-2 text-gray-700">
                        <p className="text-sm text-gray-700">
                          Showing {(currentPage.withdrawals - 1) * itemsPerPage + 1} to {Math.min(currentPage.withdrawals * itemsPerPage, paginatedData.withdrawals.total)} of {paginatedData.withdrawals.total} results
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setCurrentPage({...currentPage, withdrawals: currentPage.withdrawals - 1})}
                            disabled={currentPage.withdrawals === 1}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setCurrentPage({...currentPage, withdrawals: currentPage.withdrawals + 1})}
                            disabled={currentPage.withdrawals >= paginatedData.withdrawals.totalPages}
                            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No withdrawals found for the selected filters
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-[10px] border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Performance Analytics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Transaction Status Distribution */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Transaction Status Distribution</h4>
                  {filteredData.deposits.length > 0 || filteredData.withdrawals.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Success', value: metrics.successfulDeposits + metrics.successfulWithdrawals, color: '#10B981' },
                              { name: 'Pending', value: metrics.pendingDeposits + metrics.pendingWithdrawals, color: '#F59E0B' },
                              { name: 'Other', value: (filteredData.deposits.length + filteredData.withdrawals.length) - (metrics.successfulDeposits + metrics.successfulWithdrawals + metrics.pendingDeposits + metrics.pendingWithdrawals), color: '#6B7280' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#10B981" />
                            <Cell fill="#F59E0B" />
                            <Cell fill="#6B7280" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      No transaction data available
                    </div>
                  )}
                </div>
                
                {/* Payment Method Distribution */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-gray-700 mb-4">Payment Method Distribution</h4>
                  {filteredData.deposits.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(
                            filteredData.deposits.reduce((acc, deposit) => {
                              const method = deposit.payment_method || 'Unknown';
                              acc[method] = (acc[method] || 0) + 1;
                              return acc;
                            }, {})
                          ).map(([method, count]) => ({ method, count }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="method" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#6366F1" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      No payment data available
                    </div>
                  )}
                </div>
              </div>
              
              {/* Key Metrics Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-full mr-3">
                      <Users size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">User Growth</p>
                      <p className="text-xl font-semibold text-blue-900">
                        {metrics.userGrowth > 0 ? '+' : ''}{metrics.userGrowth}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-full mr-3">
                      <CreditCard size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-green-700">Avg. Deposit</p>
                      <p className="text-xl font-semibold text-green-900">
                        {formatCurrency(filteredData.deposits.length > 0 ? metrics.totalDeposits / filteredData.deposits.length : 0)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-full mr-3">
                      <Activity size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-purple-700">Deposit Success</p>
                      <p className="text-xl font-semibold text-purple-900">
                        {metrics.depositSuccessRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-full mr-3">
                      <Activity size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-orange-700">Withdraw Success</p>
                      <p className="text-xl font-semibold text-orange-900">
                        {metrics.withdrawSuccessRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Successful Transactions Summary */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-green-800">Successful Deposits</h4>
                      <p className="text-2xl font-bold text-green-900">{metrics.successfulDeposits}</p>
                      <p className="text-green-700">{formatCurrency(metrics.successfulDepositsAmount)}</p>
                      <p className="text-sm text-green-600 mt-1">
                        {metrics.depositSuccessRate.toFixed(1)}% success rate
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-green-800">Successful Withdrawals</h4>
                      <p className="text-2xl font-bold text-green-900">{metrics.successfulWithdrawals}</p>
                      <p className="text-green-700">{formatCurrency(metrics.successfulWithdrawalsAmount)}</p>
                      <p className="text-sm text-green-600 mt-1">
                        {metrics.withdrawSuccessRate.toFixed(1)}% success rate
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <CheckCircle size={32} className="text-green-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OverviewPage;
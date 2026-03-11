import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiDownload, FiRefreshCw, FiShield, FiLock, FiUnlock, FiTrash2, FiEye } from 'react-icons/fi';
import { FaSort, FaSortUp, FaSortDown, FaUserShield, FaNetworkWired, FaDesktop } from 'react-icons/fa';
import Header from '../common/Header';
import axios from 'axios';

const SecurityDashboard = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [activeTab, setActiveTab] = useState('login-logs');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 0
  });

  // Login Logs State
  const [loginLogs, setLoginLogs] = useState([]);
  const [loginLogsFilters, setLoginLogsFilters] = useState({
    userId: '',
    username: '',
    ipAddress: '',
    deviceType: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });

  // IP Whitelist State
  const [ipWhitelist, setIpWhitelist] = useState([]);
  const [showAddIpModal, setShowAddIpModal] = useState(false);
  const [newIp, setNewIp] = useState({
    ipAddress: '',
    description: ''
  });

  // Failed Logins State
  const [failedLogins, setFailedLogins] = useState([]);
  const [failedLoginsFilters, setFailedLoginsFilters] = useState({
    username: '',
    ipAddress: '',
    isLocked: 'all',
    startDate: '',
    endDate: ''
  });

  // Security Stats State
  const [securityStats, setSecurityStats] = useState({
    totals: {
      loginAttempts: 0,
      successfulLogins: 0,
      failedLogins: 0,
      lockedAccounts: 0,
      whitelistedIPs: 0,
      trustedDevices: 0
    },
    today: {
      loginAttempts: 0,
      successfulLogins: 0,
      failedLogins: 0
    },
    analytics: {
      loginAttemptsByHour: [],
      failedReasons: []
    }
  });

  // Sort Configuration
  const [sortConfig, setSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc'
  });

  // Fetch data based on active tab
  const fetchData = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      let endpoint = '';
      let params = {
        page,
        limit: pagination.limit
      };

      switch (activeTab) {
        case 'login-logs':
          endpoint = '/security/login-logs';
          Object.assign(params, loginLogsFilters);
          if (searchQuery) params.search = searchQuery;
          break;
        case 'ip-whitelist':
          endpoint = '/security/ip-whitelist';
          if (searchQuery) params.search = searchQuery;
          break;
        case 'failed-logins':
          endpoint = '/security/failed-logins';
          Object.assign(params, failedLoginsFilters);
          if (searchQuery) params.search = searchQuery;
          break;
        case 'stats':
          await fetchSecurityStats();
          setLoading(false);
          return;
        default:
          break;
      }

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await axios.get(`${base_url}/admin${endpoint}`, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        if (activeTab === 'login-logs') {
          setLoginLogs(response.data.data);
          setPagination(response.data.pagination);
        } else if (activeTab === 'ip-whitelist') {
          setIpWhitelist(response.data.data);
          setPagination(response.data.pagination);
        } else if (activeTab === 'failed-logins') {
          setFailedLogins(response.data.data);
          setPagination(response.data.pagination);
        }
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch security statistics
  const fetchSecurityStats = async () => {
    try {
      const response = await axios.get(`${base_url}/admin/security/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        setSecurityStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching security stats:', err);
    }
  };

  // Add IP to whitelist
  const addToWhitelist = async () => {
    try {
      const response = await axios.post(`${base_url}/admin/security/ip-whitelist`, newIp, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        setShowAddIpModal(false);
        setNewIp({ ipAddress: '', description: '' });
        fetchData(pagination.page);
      }
    } catch (err) {
      console.error('Error adding IP to whitelist:', err);
      alert(err.response?.data?.message || 'Failed to add IP to whitelist');
    }
  };

  // Toggle IP active status
  const toggleIpStatus = async (id, isActive) => {
    try {
      const response = await axios.put(`${base_url}/admin/security/ip-whitelist/${id}`, 
        { isActive: !isActive },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );

      if (response.data.success) {
        fetchData(pagination.page);
      }
    } catch (err) {
      console.error('Error updating IP status:', err);
      alert('Failed to update IP status');
    }
  };

  // Delete IP from whitelist
  const deleteIp = async (id) => {
    if (!window.confirm('Are you sure you want to remove this IP from whitelist?')) {
      return;
    }

    try {
      const response = await axios.delete(`${base_url}/admin/security/ip-whitelist/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        fetchData(pagination.page);
      }
    } catch (err) {
      console.error('Error deleting IP:', err);
      alert('Failed to delete IP');
    }
  };

  // Unlock account/IP
  const unlockAccount = async (id) => {
    try {
      const response = await axios.put(`${base_url}/admin/security/failed-logins/${id}/unlock`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        fetchData(pagination.page);
      }
    } catch (err) {
      console.error('Error unlocking account:', err);
      alert('Failed to unlock account');
    }
  };

  // Clear failed login record
  const clearFailedLogin = async (id) => {
    if (!window.confirm('Are you sure you want to clear this failed login record?')) {
      return;
    }

    try {
      const response = await axios.delete(`${base_url}/admin/security/failed-logins/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        fetchData(pagination.page);
      }
    } catch (err) {
      console.error('Error clearing failed login:', err);
      alert('Failed to clear failed login record');
    }
  };

  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Apply sorting
  const sortedData = (data) => {
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
      fetchData(newPage);
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType, key, value) => {
    if (filterType === 'login-logs') {
      setLoginLogsFilters({ ...loginLogsFilters, [key]: value });
    } else if (filterType === 'failed-logins') {
      setFailedLoginsFilters({ ...failedLoginsFilters, [key]: value });
    }
  };

  // Apply filters
  const applyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    fetchData(1);
  };

  // Reset filters
  const resetFilters = () => {
    if (activeTab === 'login-logs') {
      setLoginLogsFilters({
        userId: '',
        username: '',
        ipAddress: '',
        deviceType: 'all',
        status: 'all',
        startDate: '',
        endDate: ''
      });
    } else if (activeTab === 'failed-logins') {
      setFailedLoginsFilters({
        username: '',
        ipAddress: '',
        isLocked: 'all',
        startDate: '',
        endDate: ''
      });
    }
    setSearchQuery('');
    setPagination({ ...pagination, page: 1 });
    fetchData(1);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get device icon
  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case 'desktop': return <FaDesktop className="text-blue-500" />;
      case 'mobile': return <FiEye className="text-purple-500" />;
      case 'tablet': return <FiEye className="text-orange-500" />;
      default: return <FaDesktop className="text-gray-500" />;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 font-bai">
      <Header />
      
      <section className="p-4 md:p-6">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Security Dashboard</h1>
            <p className="text-gray-600">Monitor and manage system security</p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('login-logs')}
                className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'login-logs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              >
                <FiEye className="mr-2" /> Login Logs
              </button>
              <button
                onClick={() => setActiveTab('ip-whitelist')}
                className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'ip-whitelist' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              >
                <FaNetworkWired className="mr-2" /> IP Whitelist
              </button>
              <button
                onClick={() => setActiveTab('failed-logins')}
                className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'failed-logins' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              >
                <FiLock className="mr-2" /> Failed Logins
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'stats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
              >
                <FiShield className="mr-2" /> Security Stats
              </button>
            </div>
          </div>

          {/* Stats Cards - Only show for stats tab */}
          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <FiEye className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Login Attempts</div>
                    <div className="text-2xl font-bold text-gray-800">{securityStats.totals.loginAttempts.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <FiUnlock className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Successful Logins</div>
                    <div className="text-2xl font-bold text-green-600">{securityStats.totals.successfulLogins.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg mr-4">
                    <FiLock className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Failed Logins</div>
                    <div className="text-2xl font-bold text-red-600">{securityStats.totals.failedLogins.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg mr-4">
                    <FiLock className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Locked Accounts</div>
                    <div className="text-2xl font-bold text-orange-600">{securityStats.totals.lockedAccounts.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <FaNetworkWired className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Whitelisted IPs</div>
                    <div className="text-2xl font-bold text-purple-600">{securityStats.totals.whitelistedIPs.toLocaleString()}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-teal-100 rounded-lg mr-4">
                    <FaDesktop className="text-teal-600 text-xl" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Trusted Devices</div>
                    <div className="text-2xl font-bold text-teal-600">{securityStats.totals.trustedDevices.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Bar - Not for stats tab */}
          {activeTab !== 'stats' && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={
                      activeTab === 'login-logs' ? "Search by username, IP, browser, location..." :
                      activeTab === 'ip-whitelist' ? "Search by IP address or description..." :
                      "Search by username or IP address..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={applyFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Apply
                  </button>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => fetchData(pagination.page)}
                    className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    title="Refresh"
                  >
                    <FiRefreshCw />
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {(activeTab === 'login-logs' || activeTab === 'failed-logins') && (
                <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTab === 'login-logs' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                          <input
                            type="text"
                            value={loginLogsFilters.userId}
                            onChange={(e) => handleFilterChange('login-logs', 'userId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter user ID"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <input
                            type="text"
                            value={loginLogsFilters.username}
                            onChange={(e) => handleFilterChange('login-logs', 'username', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                          <input
                            type="text"
                            value={loginLogsFilters.ipAddress}
                            onChange={(e) => handleFilterChange('login-logs', 'ipAddress', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter IP address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                          <select
                            value={loginLogsFilters.deviceType}
                            onChange={(e) => handleFilterChange('login-logs', 'deviceType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="all">All Devices</option>
                            <option value="desktop">Desktop</option>
                            <option value="mobile">Mobile</option>
                            <option value="tablet">Tablet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select
                            value={loginLogsFilters.status}
                            onChange={(e) => handleFilterChange('login-logs', 'status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="all">All Status</option>
                            <option value="success">Success</option>
                            <option value="failed">Failed</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                          <input
                            type="text"
                            value={failedLoginsFilters.username}
                            onChange={(e) => handleFilterChange('failed-logins', 'username', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter username"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                          <input
                            type="text"
                            value={failedLoginsFilters.ipAddress}
                            onChange={(e) => handleFilterChange('failed-logins', 'ipAddress', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Enter IP address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Lock Status</label>
                          <select
                            value={failedLoginsFilters.isLocked}
                            onChange={(e) => handleFilterChange('failed-logins', 'isLocked', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="all">All</option>
                            <option value="true">Locked</option>
                            <option value="false">Not Locked</option>
                          </select>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={activeTab === 'login-logs' ? loginLogsFilters.startDate : failedLoginsFilters.startDate}
                        onChange={(e) => handleFilterChange(
                          activeTab, 
                          'startDate', 
                          e.target.value
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={activeTab === 'login-logs' ? loginLogsFilters.endDate : failedLoginsFilters.endDate}
                        onChange={(e) => handleFilterChange(
                          activeTab, 
                          'endDate', 
                          e.target.value
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add IP Button for IP Whitelist tab */}
          {activeTab === 'ip-whitelist' && (
            <div className="mb-4">
              <button
                onClick={() => setShowAddIpModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <FiEye className="mr-2" /> Add IP to Whitelist
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading data...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchData()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : activeTab === 'stats' ? (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Today's Activity</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Login Attempts</div>
                    <div className="text-2xl font-bold text-gray-800">{securityStats.today.loginAttempts}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Successful Logins</div>
                    <div className="text-2xl font-bold text-green-600">{securityStats.today.successfulLogins}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Failed Logins</div>
                    <div className="text-2xl font-bold text-red-600">{securityStats.today.failedLogins}</div>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4">Failed Login Reasons</h2>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  {securityStats.analytics.failedReasons.length > 0 ? (
                    <div className="space-y-2">
                      {securityStats.analytics.failedReasons.map((reason, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{reason._id}</span>
                          <span className="text-sm font-medium">{reason.count} attempts</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No failed login data available</p>
                  )}
                </div>

                <h2 className="text-xl font-semibold mb-4">Login Attempts by Hour (Last 24 Hours)</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {securityStats.analytics.loginAttemptsByHour.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {securityStats.analytics.loginAttemptsByHour.map((hourData, index) => (
                        <div key={index} className="text-center">
                          <div className="text-sm font-medium">Hour {hourData._id.hour}</div>
                          <div className="text-sm">
                            {hourData._id.status === 'success' ? 'Success: ' : 'Failed: '}
                            {hourData.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No login attempt data available</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {activeTab === 'login-logs' && (
                          <>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('username')}
                            >
                              <div className="flex items-center">
                                User
                                {sortConfig.key === 'username' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'username' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('ipAddress')}
                            >
                              <div className="flex items-center">
                                IP Address
                                {sortConfig.key === 'ipAddress' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'ipAddress' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('deviceType')}
                            >
                              <div className="flex items-center">
                                Device
                                {sortConfig.key === 'deviceType' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'deviceType' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('browser')}
                            >
                              <div className="flex items-center">
                                Browser
                                {sortConfig.key === 'browser' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'browser' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('status')}
                            >
                              <div className="flex items-center">
                                Status
                                {sortConfig.key === 'status' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'status' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('timestamp')}
                            >
                              <div className="flex items-center">
                                Date
                                {sortConfig.key === 'timestamp' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'timestamp' && <FaSort />}
                              </div>
                            </th>
                          </>
                        )}
                        {activeTab === 'ip-whitelist' && (
                          <>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('ipAddress')}
                            >
                              <div className="flex items-center">
                                IP Address
                                {sortConfig.key === 'ipAddress' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'ipAddress' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('description')}
                            >
                              <div className="flex items-center">
                                Description
                                {sortConfig.key === 'description' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'description' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('isActive')}
                            >
                              <div className="flex items-center">
                                Status
                                {sortConfig.key === 'isActive' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'isActive' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('createdAt')}
                            >
                              <div className="flex items-center">
                                Created At
                                {sortConfig.key === 'createdAt' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'createdAt' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('createdBy')}
                            >
                              <div className="flex items-center">
                                Created By
                                {sortConfig.key === 'createdBy' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'createdBy' && <FaSort />}
                              </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </>
                        )}
                        {activeTab === 'failed-logins' && (
                          <>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('username')}
                            >
                              <div className="flex items-center">
                                Username
                                {sortConfig.key === 'username' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'username' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('ipAddress')}
                            >
                              <div className="flex items-center">
                                IP Address
                                {sortConfig.key === 'ipAddress' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'ipAddress' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('attemptCount')}
                            >
                              <div className="flex items-center">
                                Attempts
                                {sortConfig.key === 'attemptCount' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'attemptCount' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('isLocked')}
                            >
                              <div className="flex items-center">
                                Locked
                                {sortConfig.key === 'isLocked' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'isLocked' && <FaSort />}
                              </div>
                            </th>
                            <th 
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                              onClick={() => handleSort('lastAttempt')}
                            >
                              <div className="flex items-center">
                                Last Attempt
                                {sortConfig.key === 'lastAttempt' && (
                                  sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                                )}
                                {sortConfig.key !== 'lastAttempt' && <FaSort />}
                              </div>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activeTab === 'login-logs' && sortedData(loginLogs).map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{log.username}</div>
                            <div className="text-sm text-gray-500">ID: {log.userId?.player_id || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.ipAddress}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getDeviceIcon(log.deviceType)}
                              <span className="ml-2 text-sm text-gray-900 capitalize">{log.deviceType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.browser}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.timestamp)}
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'ip-whitelist' && sortedData(ipWhitelist).map((ip) => (
                        <tr key={ip._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ip.ipAddress}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {ip.description || 'No description'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${ip.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {ip.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(ip.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {ip.createdBy?.username || 'System'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleIpStatus(ip._id, ip.isActive)}
                                className={`px-2 py-1 text-xs rounded ${ip.isActive ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                              >
                                {ip.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => deleteIp(ip._id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'failed-logins' && sortedData(failedLogins).map((attempt) => (
                        <tr key={attempt._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {attempt.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {attempt.ipAddress}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {attempt.attemptCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${attempt.isLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                              {attempt.isLocked ? 'Locked' : 'Not Locked'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(attempt.lastAttempt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {attempt.isLocked && (
                                <button
                                  onClick={() => unlockAccount(attempt._id)}
                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Unlock
                                </button>
                              )}
                              <button
                                onClick={() => clearFailedLogin(attempt._id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Clear
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                        {pagination.total} results
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          let pageNum;
                          if (pagination.pages <= 5) {
                            pageNum = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNum = i + 1;
                          } else if (pagination.page >= pagination.pages - 2) {
                            pageNum = pagination.pages - 4 + i;
                          } else {
                            pageNum = pagination.page - 2 + i;
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 border rounded-md text-sm ${
                                pagination.page === pageNum
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'border-gray-300 text-gray-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.pages}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Add IP Modal */}
      {showAddIpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Add IP to Whitelist</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <input
                  type="text"
                  value={newIp.ipAddress}
                  onChange={(e) => setNewIp({ ...newIp, ipAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter IP address (e.g., 192.168.1.1)"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newIp.description}
                  onChange={(e) => setNewIp({ ...newIp, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter description (optional)"
                  rows="3"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddIpModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addToWhitelist}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add IP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
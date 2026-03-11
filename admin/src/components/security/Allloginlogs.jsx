import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiRefreshCw, FiDownload, FiEye, FiUnlock, FiTrash2 } from 'react-icons/fi';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Header from '../common/Header';
import axios from 'axios';

const Allloginlogs = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [loginLogs, setLoginLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    userId: '',
    username: '',
    ipAddress: '',
    deviceType: 'all',
    status: 'all',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 0
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'timestamp',
    direction: 'desc'
  });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalLoginAttempts: 0,
    successfulLogins: 0,
    failedLogins: 0,
    lockedAccounts: 0,
    whitelistedIPs: 0,
    trustedDevices: 0
  });

  // Fetch login logs
  const fetchLoginLogs = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const params = {
        page,
        limit: pagination.limit,
        ...filters,
        search: searchQuery
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
          delete params[key];
        }
      });

      const response = await axios.get(`${base_url}/admin/security/login-logs`, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        setLoginLogs(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch login logs');
      }
    } catch (err) {
      console.error('Error fetching login logs:', err);
      setError(err.response?.data?.message || 'Failed to fetch login logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch security stats
  const fetchSecurityStats = async () => {
    try {
      const response = await axios.get(`${base_url}/admin/security/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        setStats({
          totalLoginAttempts: response.data.data.totals.loginAttempts,
          successfulLogins: response.data.data.totals.successfulLogins,
          failedLogins: response.data.data.totals.failedLogins,
          lockedAccounts: response.data.data.totals.lockedAccounts,
          whitelistedIPs: response.data.data.totals.whitelistedIPs,
          trustedDevices: response.data.data.totals.trustedDevices
        });
      }
    } catch (err) {
      console.error('Error fetching security stats:', err);
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
  const sortedLogs = [...loginLogs].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination({ ...pagination, page: newPage });
      fetchLoginLogs(newPage);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Apply filters
  const applyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    fetchLoginLogs(1);
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      userId: '',
      username: '',
      ipAddress: '',
      deviceType: 'all',
      status: 'all',
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
    setPagination({ ...pagination, page: 1 });
    fetchLoginLogs(1);
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

  // Get device type badge color
  const getDeviceColor = (deviceType) => {
    switch (deviceType) {
      case 'desktop': return 'bg-blue-100 text-blue-800';
      case 'mobile': return 'bg-purple-100 text-purple-800';
      case 'tablet': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // View log details
  const viewLogDetails = (log) => {
    setSelectedLog(log);
  };

  // Close modal
  const closeModal = () => {
    setSelectedLog(null);
  };

  // Unlock account/IP
  const unlockAccount = async (id) => {
    try {
      const response = await axios.put(`${base_url}/admin/security/failed-logins/${id}/unlock`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.data.success) {
        alert('Account/IP unlocked successfully');
        fetchSecurityStats(); // Refresh stats
      }
    } catch (err) {
      console.error('Error unlocking account:', err);
      alert('Failed to unlock account');
    }
  };

  // Export logs to CSV
  const exportToCSV = () => {
    const headers = ['Timestamp', 'Username', 'IP Address', 'Device Type', 'Browser', 'OS', 'Status', 'Location'];
    const csvData = loginLogs.map(log => [
      formatDate(log.timestamp),
      log.username,
      log.ipAddress,
      log.deviceType,
      log.browser,
      log.os,
      log.status,
      `${log.location?.city || 'N/A'}, ${log.location?.country || 'N/A'}`
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `login-logs-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Initial fetch
  useEffect(() => {
    fetchLoginLogs();
    fetchSecurityStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-bai">
      <Header />
      
      <section className="p-4 md:p-6">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Login Logs</h1>
            <p className="text-gray-600">Monitor and manage user login activities and security events</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Logins</div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalLoginAttempts.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Successful</div>
              <div className="text-2xl font-bold text-green-600">{stats.successfulLogins.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Failed</div>
              <div className="text-2xl font-bold text-red-600">{stats.failedLogins.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Locked Accounts</div>
              <div className="text-2xl font-bold text-orange-600">{stats.lockedAccounts.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Whitelisted IPs</div>
              <div className="text-2xl font-bold text-blue-600">{stats.whitelistedIPs.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Trusted Devices</div>
              <div className="text-2xl font-bold text-purple-600">{stats.trustedDevices.toLocaleString()}</div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username, IP, browser, OS, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <FiFilter /> Filters
                </button>
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
                  onClick={() => fetchLoginLogs(pagination.page)}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  title="Refresh"
                >
                  <FiRefreshCw />
                </button>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  title="Export to CSV"
                >
                  <FiDownload /> Export
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                    <input
                      type="text"
                      value={filters.userId}
                      onChange={(e) => handleFilterChange('userId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter user ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={filters.username}
                      onChange={(e) => handleFilterChange('username', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                    <input
                      type="text"
                      value={filters.ipAddress}
                      onChange={(e) => handleFilterChange('ipAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter IP address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                    <select
                      value={filters.deviceType}
                      onChange={(e) => handleFilterChange('deviceType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Devices</option>
                      <option value="desktop">Desktop</option>
                      <option value="mobile">Mobile</option>
                      <option value="tablet">Tablet</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Status</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Login Logs Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading login logs...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchLoginLogs()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('timestamp')}
                        >
                          <div className="flex items-center">
                            Date & Time
                            {sortConfig.key === 'timestamp' && (
                              sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                            )}
                            {sortConfig.key !== 'timestamp' && <FaSort />}
                          </div>
                        </th>
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
                          onClick={() => handleSort('location.country')}
                        >
                          <div className="flex items-center">
                            Location
                            {sortConfig.key === 'location.country' && (
                              sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                            )}
                            {sortConfig.key !== 'location.country' && <FaSort />}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{log.username}</div>
                            {log.userId && (
                              <div className="text-sm text-gray-500">ID: {log.userId._id.substring(0, 8)}...</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.ipAddress}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDeviceColor(log.deviceType)}`}>
                              {log.deviceType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{log.browser}</div>
                            <div className="text-xs text-gray-500">{log.os}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                            {log.failureReason && (
                              <div className="text-xs text-red-500 mt-1">{log.failureReason}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.location ? (
                              <>
                                <div>{log.location.city || 'Unknown'}</div>
                                <div className="text-xs text-gray-500">{log.location.country}</div>
                              </>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => viewLogDetails(log)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="View Details"
                              >
                                <FiEye size={16} />
                              </button>
                              {log.status === 'failed' && (
                                <button
                                  onClick={() => unlockAccount(log._id)}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Unlock Account"
                                >
                                  <FiUnlock size={16} />
                                </button>
                              )}
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

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Login Log Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Timestamp</h3>
                  <p className="text-sm">{formatDate(selectedLog.timestamp)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Username</h3>
                  <p className="text-sm">{selectedLog.username}</p>
                </div>
                {selectedLog.userId && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                      <p className="text-sm font-mono">{selectedLog.userId._id}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="text-sm">{selectedLog.userId.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Player ID</h3>
                      <p className="text-sm">{selectedLog.userId.player_id}</p>
                    </div>
                  </>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">IP Address</h3>
                  <p className="text-sm font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Device Type</h3>
                  <p className="text-sm capitalize">{selectedLog.deviceType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Browser</h3>
                  <p className="text-sm">{selectedLog.browser}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Operating System</h3>
                  <p className="text-sm">{selectedLog.os}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedLog.status)}`}>
                    {selectedLog.status}
                  </span>
                </div>
                {selectedLog.failureReason && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Failure Reason</h3>
                    <p className="text-sm text-red-600">{selectedLog.failureReason}</p>
                  </div>
                )}
                {selectedLog.location && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Country</h3>
                      <p className="text-sm">{selectedLog.location.country || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">City</h3>
                      <p className="text-sm">{selectedLog.location.city || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Region</h3>
                      <p className="text-sm">{selectedLog.location.region || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Timezone</h3>
                      <p className="text-sm">{selectedLog.location.timezone || 'N/A'}</p>
                    </div>
                  </>
                )}
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">User Agent</h3>
                  <p className="text-sm font-mono text-xs break-all">{selectedLog.userAgent}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allloginlogs;
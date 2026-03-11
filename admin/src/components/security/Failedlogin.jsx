import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiRefreshCw, FiUnlock, FiTrash2 } from 'react-icons/fi';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Header from '../common/Header';
import axios from 'axios';

const FailedLoginLogs = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    username: '',
    ipAddress: '',
    isLocked: 'all',
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
    key: 'lastAttempt',
    direction: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalFailedAttempts: 0,
    lockedAccounts: 0,
    todayFailedAttempts: 0
  });

  // Fetch failed login logs
  const fetchFailedLogins = async (page = 1) => {
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

      const response = await axios.get(`${base_url}/admin/security/failed-logins`, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        setLogs(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch failed login logs');
      }
    } catch (err) {
      console.error('Error fetching failed login logs:', err);
      setError(err.response?.data?.message || 'Failed to fetch failed login logs');
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
          totalFailedAttempts: response.data.data.totals.failedLogins,
          lockedAccounts: response.data.data.totals.lockedAccounts,
          todayFailedAttempts: response.data.data.today.failedLogins
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
  const sortedLogs = [...logs].sort((a, b) => {
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
      fetchFailedLogins(newPage);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Apply filters
  const applyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    fetchFailedLogins(1);
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      username: '',
      ipAddress: '',
      isLocked: 'all',
      startDate: '',
      endDate: ''
    });
    setSearchQuery('');
    setPagination({ ...pagination, page: 1 });
    fetchFailedLogins(1);
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

  // Unlock account/IP
  const unlockAccount = async (id) => {
    try {
      const response = await axios.put(
        `${base_url}/admin/security/failed-logins/${id}/unlock`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );

      if (response.data.success) {
        alert('Account/IP unlocked successfully');
        fetchFailedLogins(pagination.page);
        fetchSecurityStats();
      }
    } catch (err) {
      console.error('Error unlocking account:', err);
      alert('Failed to unlock account/IP');
    }
  };

  // Delete failed login record
  const deleteFailedLogin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this failed login record?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${base_url}/admin/security/failed-logins/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );

      if (response.data.success) {
        alert('Failed login record deleted successfully');
        fetchFailedLogins(pagination.page);
        fetchSecurityStats();
      }
    } catch (err) {
      console.error('Error deleting failed login record:', err);
      alert('Failed to delete record');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchFailedLogins();
    fetchSecurityStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-bai">
      <Header />
      
      <section className="p-4 md:p-6">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Failed Login Logs</h1>
            <p className="text-gray-600">Monitor and manage failed login attempts</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Failed Attempts</div>
              <div className="text-2xl font-bold text-red-600">{stats.totalFailedAttempts.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Locked Accounts/IPs</div>
              <div className="text-2xl font-bold text-orange-600">{stats.lockedAccounts.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Today's Failed Attempts</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.todayFailedAttempts.toLocaleString()}</div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username, IP address, user agent..."
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
                  onClick={() => fetchFailedLogins(pagination.page)}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  title="Refresh"
                >
                  <FiRefreshCw />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lock Status</label>
                    <select
                      value={filters.isLocked}
                      onChange={(e) => handleFilterChange('isLocked', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Status</option>
                      <option value="true">Locked</option>
                      <option value="false">Not Locked</option>
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

          {/* Failed Login Logs Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading failed login logs...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchFailedLogins()}
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
                            Status
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
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          User Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{log.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.ipAddress}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.attemptCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.isLocked ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                Locked
                                {log.lockedUntil && (
                                  <div className="text-xs text-red-600">
                                    Until: {formatDate(log.lockedUntil)}
                                  </div>
                                )}
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.lastAttempt)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate" title={log.userAgent}>
                              {log.userAgent}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {log.isLocked && (
                                <button
                                  onClick={() => unlockAccount(log._id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Unlock"
                                >
                                  <FiUnlock size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => deleteFailedLogin(log._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <FiTrash2 size={18} />
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
    </div>
  );
};

export default FailedLoginLogs;
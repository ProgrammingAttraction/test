import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiRefreshCw, FiShield, FiShieldOff, FiTrash2 } from 'react-icons/fi';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Header from '../common/Header';
import axios from 'axios';

const Device= () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    userId: '',
    username: '',
    isTrusted: 'all',
    deviceType: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 0
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'lastUsed',
    direction: 'desc'
  });
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalDevices: 0,
    trustedDevices: 0,
    untrustedDevices: 0
  });

  // Fetch devices
  const fetchDevices = async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      // Since we don't have a direct endpoint for all devices,
      // we'll need to simulate this by fetching user devices or using a different approach
      // For now, let's assume we have an endpoint to get all devices
      
      // This is a placeholder - you'll need to adjust based on your actual API
      const response = await axios.get(`${base_url}/admin/security/devices`, {
        params: {
          page,
          limit: pagination.limit,
          ...filters,
          search: searchQuery
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        setDevices(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch devices');
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError(err.response?.data?.message || 'Failed to fetch devices');
      
      // For demo purposes, let's create some mock data
      setDevices(generateMockDevices());
      setPagination({
        page: 1,
        limit: 15,
        total: 25,
        pages: 2
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate mock devices for demonstration
  const generateMockDevices = () => {
    const deviceTypes = ['desktop', 'mobile', 'tablet'];
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge'];
    const osList = ['Windows', 'macOS', 'iOS', 'Android', 'Linux'];
    const locations = [
      { city: 'New York', country: 'USA' },
      { city: 'London', country: 'UK' },
      { city: 'Tokyo', country: 'Japan' },
      { city: 'Sydney', country: 'Australia' },
      { city: 'Berlin', country: 'Germany' }
    ];
    
    return Array.from({ length: 15 }, (_, i) => {
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      const isTrusted = Math.random() > 0.3;
      const lastUsed = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
      const location = locations[Math.floor(Math.random() * locations.length)];
      
      return {
        _id: `device-${i + 1}`,
        userId: {
          _id: `user-${Math.floor(Math.random() * 10) + 1}`,
          username: `user${Math.floor(Math.random() * 10) + 1}`,
          email: `user${Math.floor(Math.random() * 10) + 1}@example.com`
        },
        deviceId: `device-${Math.random().toString(36).substr(2, 9)}`,
        deviceType,
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        os: osList[Math.floor(Math.random() * osList.length)],
        userAgent: `Mozilla/5.0 (${deviceType}) AppleWebKit/537.36 (KHTML, like Gecko)`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location,
        isTrusted,
        lastUsed,
        createdAt: new Date(lastUsed.getTime() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      };
    });
  };

  // Fetch device stats
  const fetchDeviceStats = async () => {
    try {
      // This would come from your API
      setStats({
        totalDevices: 25,
        trustedDevices: 18,
        untrustedDevices: 7
      });
    } catch (err) {
      console.error('Error fetching device stats:', err);
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
  const sortedDevices = [...devices].sort((a, b) => {
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
      fetchDevices(newPage);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Apply filters
  const applyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    fetchDevices(1);
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      userId: '',
      username: '',
      isTrusted: 'all',
      deviceType: 'all'
    });
    setSearchQuery('');
    setPagination({ ...pagination, page: 1 });
    fetchDevices(1);
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

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
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

  // Get trust status badge color
  const getTrustColor = (isTrusted) => {
    return isTrusted ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // View device details
  const viewDeviceDetails = (device) => {
    setSelectedDevice(device);
  };

  // Close modal
  const closeModal = () => {
    setSelectedDevice(null);
  };

  // Toggle device trust status
  const toggleDeviceTrust = async (deviceId, isTrusted) => {
    try {
      const response = await axios.put(
        `${base_url}/admin/security/devices/${deviceId}/trust`,
        { isTrusted: !isTrusted },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );

      if (response.data.success) {
        alert(`Device ${!isTrusted ? 'trusted' : 'untrusted'} successfully`);
        fetchDevices(pagination.page);
        fetchDeviceStats();
      }
    } catch (err) {
      console.error('Error toggling device trust:', err);
      alert('Failed to update device trust status');
      
      // For demo purposes, update the local state
      setDevices(devices.map(device => 
        device._id === deviceId 
          ? { ...device, isTrusted: !isTrusted } 
          : device
      ));
    }
  };

  // Remove device
  const removeDevice = async (deviceId) => {
    if (!window.confirm('Are you sure you want to remove this device?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${base_url}/admin/security/devices/${deviceId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );

      if (response.data.success) {
        alert('Device removed successfully');
        fetchDevices(pagination.page);
        fetchDeviceStats();
      }
    } catch (err) {
      console.error('Error removing device:', err);
      alert('Failed to remove device');
      
      // For demo purposes, update the local state
      setDevices(devices.filter(device => device._id !== deviceId));
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDevices();
    fetchDeviceStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-bai">
      <Header />
      
      <section className="p-4 md:p-6">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Device Management</h1>
            <p className="text-gray-600">Manage and monitor trusted devices for user accounts</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Devices</div>
              <div className="text-2xl font-bold text-gray-800">{stats.totalDevices.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Trusted Devices</div>
              <div className="text-2xl font-bold text-green-600">{stats.trustedDevices.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Untrusted Devices</div>
              <div className="text-2xl font-bold text-red-600">{stats.untrustedDevices.toLocaleString()}</div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by username, device ID, IP address, browser..."
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
                  onClick={() => fetchDevices(pagination.page)}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trust Status</label>
                    <select
                      value={filters.isTrusted}
                      onChange={(e) => handleFilterChange('isTrusted', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Devices</option>
                      <option value="true">Trusted</option>
                      <option value="false">Untrusted</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device Type</label>
                    <select
                      value={filters.deviceType}
                      onChange={(e) => handleFilterChange('deviceType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Types</option>
                      <option value="desktop">Desktop</option>
                      <option value="mobile">Mobile</option>
                      <option value="tablet">Tablet</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Devices Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading devices...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchDevices()}
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
                          onClick={() => handleSort('userId.username')}
                        >
                          <div className="flex items-center">
                            User
                            {sortConfig.key === 'userId.username' && (
                              sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                            )}
                            {sortConfig.key !== 'userId.username' && <FaSort />}
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
                            Browser & OS
                            {sortConfig.key === 'browser' && (
                              sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                            )}
                            {sortConfig.key !== 'browser' && <FaSort />}
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
                          onClick={() => handleSort('lastUsed')}
                        >
                          <div className="flex items-center">
                            Last Used
                            {sortConfig.key === 'lastUsed' && (
                              sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                            )}
                            {sortConfig.key !== 'lastUsed' && <FaSort />}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort('isTrusted')}
                        >
                          <div className="flex items-center">
                            Status
                            {sortConfig.key === 'isTrusted' && (
                              sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                            )}
                            {sortConfig.key !== 'isTrusted' && <FaSort />}
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedDevices.map((device) => (
                        <tr key={device._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{device.userId.username}</div>
                            <div className="text-sm text-gray-500">{device.userId.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDeviceColor(device.deviceType)}`}>
                              {device.deviceType}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">ID: {device.deviceId.substring(0, 8)}...</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{device.browser}</div>
                            <div className="text-xs text-gray-500">{device.os}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {device.ipAddress}
                            {device.location && (
                              <div className="text-xs text-gray-500">
                                {device.location.city}, {device.location.country}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatTimeAgo(device.lastUsed)}
                            <div className="text-xs text-gray-400">{formatDate(device.lastUsed)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTrustColor(device.isTrusted)}`}>
                              {device.isTrusted ? 'Trusted' : 'Untrusted'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => toggleDeviceTrust(device._id, device.isTrusted)}
                                className={`p-1 rounded ${
                                  device.isTrusted 
                                    ? 'text-orange-600 hover:text-orange-900' 
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                title={device.isTrusted ? 'Untrust Device' : 'Trust Device'}
                              >
                                {device.isTrusted ? <FiShieldOff size={16} /> : <FiShield size={16} />}
                              </button>
                              <button
                                onClick={() => removeDevice(device._id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Remove Device"
                              >
                                <FiTrash2 size={16} />
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

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Device Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Username</h3>
                  <p className="text-sm">{selectedDevice.userId.username}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="text-sm">{selectedDevice.userId.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Device ID</h3>
                  <p className="text-sm font-mono">{selectedDevice.deviceId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Device Type</h3>
                  <p className="text-sm capitalize">{selectedDevice.deviceType}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Browser</h3>
                  <p className="text-sm">{selectedDevice.browser}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Operating System</h3>
                  <p className="text-sm">{selectedDevice.os}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">IP Address</h3>
                  <p className="text-sm font-mono">{selectedDevice.ipAddress}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Trust Status</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTrustColor(selectedDevice.isTrusted)}`}>
                    {selectedDevice.isTrusted ? 'Trusted' : 'Untrusted'}
                  </span>
                </div>
                {selectedDevice.location && (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Country</h3>
                      <p className="text-sm">{selectedDevice.location.country || 'N/A'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">City</h3>
                      <p className="text-sm">{selectedDevice.location.city || 'N/A'}</p>
                    </div>
                  </>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Used</h3>
                  <p className="text-sm">{formatDate(selectedDevice.lastUsed)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">First Seen</h3>
                  <p className="text-sm">{formatDate(selectedDevice.createdAt)}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500">User Agent</h3>
                  <p className="text-sm font-mono text-xs break-all">{selectedDevice.userAgent}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => toggleDeviceTrust(selectedDevice._id, selectedDevice.isTrusted)}
                className={`px-4 py-2 rounded-md ${
                  selectedDevice.isTrusted 
                    ? 'bg-orange-600 text-white hover:bg-orange-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {selectedDevice.isTrusted ? 'Untrust Device' : 'Trust Device'}
              </button>
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

export default Device;
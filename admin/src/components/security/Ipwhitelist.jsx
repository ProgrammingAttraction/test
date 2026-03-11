import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiRefreshCw, FiPlus, FiEdit, FiTrash2, FiShield } from 'react-icons/fi';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import Header from '../common/Header';
import axios from 'axios';

const IPWhitelist = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [ipWhitelist, setIpWhitelist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    isActive: 'all',
    createdBy: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 0
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [formData, setFormData] = useState({
    ipAddress: '',
    description: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch IP whitelist entries
  const fetchIPWhitelist = async (page = 1) => {
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

      const response = await axios.get(`${base_url}/admin/security/ip-whitelist`, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        setIpWhitelist(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch IP whitelist entries');
      }
    } catch (err) {
      console.error('Error fetching IP whitelist:', err);
      setError(err.response?.data?.message || 'Failed to fetch IP whitelist entries');
      
      // For demo purposes, create mock data
      setIpWhitelist(generateMockIPWhitelist());
      setPagination({
        page: 1,
        limit: 15,
        total: 8,
        pages: 1
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate mock IP whitelist data for demonstration
  const generateMockIPWhitelist = () => {
    const admins = [
      { _id: 'admin1', username: 'admin_user', email: 'admin@example.com' },
      { _id: 'admin2', username: 'security_admin', email: 'security@example.com' }
    ];
    
    return [
      {
        _id: '1',
        ipAddress: '192.168.1.100',
        description: 'Main office network',
        isActive: true,
        createdBy: admins[0],
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15')
      },
      {
        _id: '2',
        ipAddress: '10.0.0.50',
        description: 'Development server',
        isActive: true,
        createdBy: admins[1],
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10')
      },
      {
        _id: '3',
        ipAddress: '172.16.0.25',
        description: 'Backup system',
        isActive: false,
        createdBy: admins[0],
        createdAt: new Date('2023-09-20'),
        updatedAt: new Date('2023-10-05')
      },
      {
        _id: '4',
        ipAddress: '203.0.113.5',
        description: 'VPN endpoint',
        isActive: true,
        createdBy: admins[1],
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2023-10-01')
      },
      {
        _id: '5',
        ipAddress: '198.51.100.10',
        description: 'API gateway',
        isActive: true,
        createdBy: admins[0],
        createdAt: new Date('2023-09-15'),
        updatedAt: new Date('2023-09-15')
      },
      {
        _id: '6',
        ipAddress: '192.0.2.75',
        description: 'Monitoring system',
        isActive: true,
        createdBy: admins[1],
        createdAt: new Date('2023-09-10'),
        updatedAt: new Date('2023-09-10')
      },
      {
        _id: '7',
        ipAddress: '192.168.2.200',
        description: 'Temporary access - disabled',
        isActive: false,
        createdBy: admins[0],
        createdAt: new Date('2023-08-25'),
        updatedAt: new Date('2023-09-05')
      },
      {
        _id: '8',
        ipAddress: '10.1.1.100',
        description: 'Testing environment',
        isActive: true,
        createdBy: admins[1],
        createdAt: new Date('2023-08-15'),
        updatedAt: new Date('2023-08-15')
      }
    ];
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
  const sortedEntries = [...ipWhitelist].sort((a, b) => {
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
      fetchIPWhitelist(newPage);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  // Apply filters
  const applyFilters = () => {
    setPagination({ ...pagination, page: 1 });
    fetchIPWhitelist(1);
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      isActive: 'all',
      createdBy: ''
    });
    setSearchQuery('');
    setPagination({ ...pagination, page: 1 });
    fetchIPWhitelist(1);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Open add modal
  const openAddModal = () => {
    setFormData({
      ipAddress: '',
      description: '',
      isActive: true
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  // Open edit modal
  const openEditModal = (entry) => {
    setSelectedEntry(entry);
    setFormData({
      ipAddress: entry.ipAddress,
      description: entry.description,
      isActive: entry.isActive
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  // Close modals
  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedEntry(null);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!formData.ipAddress.trim()) {
      errors.ipAddress = 'IP address is required';
    } else if (!ipRegex.test(formData.ipAddress)) {
      errors.ipAddress = 'Invalid IP address format';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new IP to whitelist
  const addIPToWhitelist = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const response = await axios.post(
        `${base_url}/admin/security/ip-whitelist`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      if (response.data.success) {
        alert('IP added to whitelist successfully');
        closeModals();
        fetchIPWhitelist(pagination.page);
      }
    } catch (err) {
      console.error('Error adding IP to whitelist:', err);
      if (err.response?.data?.message === 'IP address already exists in whitelist') {
        setFormErrors({ ipAddress: 'IP address already exists in whitelist' });
      } else {
        alert('Failed to add IP to whitelist');
      }
    }
  };

  // Update IP whitelist entry
  const updateIPWhitelist = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const response = await axios.put(
        `${base_url}/admin/security/ip-whitelist/${selectedEntry._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      if (response.data.success) {
        alert('IP whitelist updated successfully');
        closeModals();
        fetchIPWhitelist(pagination.page);
      }
    } catch (err) {
      console.error('Error updating IP whitelist:', err);
      alert('Failed to update IP whitelist');
    }
  };

  // Remove IP from whitelist
  const removeIPFromWhitelist = async (id) => {
    if (!window.confirm('Are you sure you want to remove this IP from the whitelist?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `${base_url}/admin/security/ip-whitelist/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        }
      );

      if (response.data.success) {
        alert('IP removed from whitelist successfully');
        fetchIPWhitelist(pagination.page);
      }
    } catch (err) {
      console.error('Error removing IP from whitelist:', err);
      alert('Failed to remove IP from whitelist');
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchIPWhitelist();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-bai">
      <Header />
      
      <section className="p-4 md:p-6">
        <div className="w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">IP Whitelist Management</h1>
            <p className="text-gray-600">Manage IP addresses that are allowed to access the system</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total IPs</div>
              <div className="text-2xl font-bold text-gray-800">{pagination.total.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Active IPs</div>
              <div className="text-2xl font-bold text-green-600">
                {ipWhitelist.filter(ip => ip.isActive).length.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Inactive IPs</div>
              <div className="text-2xl font-bold text-red-600">
                {ipWhitelist.filter(ip => !ip.isActive).length.toLocaleString()}
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
                  placeholder="Search by IP address, description..."
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
                  onClick={() => fetchIPWhitelist(pagination.page)}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  title="Refresh"
                >
                  <FiRefreshCw />
                </button>
                <button
                  onClick={openAddModal}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <FiPlus /> Add IP
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.isActive}
                      onChange={(e) => handleFilterChange('isActive', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="all">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                    <input
                      type="text"
                      value={filters.createdBy}
                      onChange={(e) => handleFilterChange('createdBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Enter username"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* IP Whitelist Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading IP whitelist...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchIPWhitelist()}
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
                          onClick={() => handleSort('createdBy.username')}
                        >
                          <div className="flex items-center">
                            Created By
                            {sortConfig.key === 'createdBy.username' && (
                              sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />
                            )}
                            {sortConfig.key !== 'createdBy.username' && <FaSort />}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedEntries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {entry.ipAddress}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{entry.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.isActive)}`}>
                              {entry.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{entry.createdBy.username}</div>
                            <div className="text-xs text-gray-500">{entry.createdBy.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(entry.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(entry)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Edit"
                              >
                                <FiEdit size={16} />
                              </button>
                              <button
                                onClick={() => removeIPFromWhitelist(entry._id)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete"
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

      {/* Add IP Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiShield /> Add IP to Whitelist
              </h2>
            </div>
            <form onSubmit={addIPToWhitelist}>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address *
                  </label>
                  <input
                    type="text"
                    name="ipAddress"
                    value={formData.ipAddress}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.ipAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 192.168.1.100"
                  />
                  {formErrors.ipAddress && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.ipAddress}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe the purpose of this IP address"
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add IP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit IP Modal */}
      {showEditModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FiShield /> Edit IP Whitelist
              </h2>
            </div>
            <form onSubmit={updateIPWhitelist}>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IP Address *
                  </label>
                  <input
                    type="text"
                    name="ipAddress"
                    value={formData.ipAddress}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.ipAddress ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 192.168.1.100"
                  />
                  {formErrors.ipAddress && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.ipAddress}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Describe the purpose of this IP address"
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModals}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update IP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPWhitelist;
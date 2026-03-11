import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiCheck, FiFileText, FiDownload, FiEye, FiRefreshCw, FiFilter } from 'react-icons/fi';
import { RiComputerLine } from "react-icons/ri";
import { NavLink } from 'react-router-dom';
import axios from "axios";
import moment from "moment";
import Header from '../common/Header';
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const VerifiedKYC = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
 
  // State for verified KYC data
  const [verifiedKYC, setVerifiedKYC] = useState([]);
  const [filteredKYC, setFilteredKYC] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [verifiedByFilter, setVerifiedByFilter] = useState('all');
  const [daysSinceFilter, setDaysSinceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
 
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
 
  // Modal states
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showStatisticsModal, setShowStatisticsModal] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [statistics, setStatistics] = useState(null);
 
  // Document type options
  const documentTypes = [
    'Passport',
    'Driving License',
    'National ID',
    'Voter ID',
    'PAN Card',
    'Aadhaar Card',
    'Utility Bill',
    'Bank Statement'
  ];
 
  // Per page options
  const perPageOptions = [10, 20, 50, 100];
 
  // Fetch verified KYC data
  const fetchVerifiedKYC = async () => {
    try {
      const response = await axios.get(`${base_url}/admin/kyc/verified`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });
      setVerifiedKYC(response.data.data);
      setFilteredKYC(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error("Failed to load verified KYC submissions");
    }
  };

  // Fetch KYC statistics
  const fetchKYCStatistics = async () => {
    try {
      const response = await axios.get(`${base_url}/admin/kyc/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching KYC statistics:", error);
    }
  };
 
  useEffect(() => {
    fetchVerifiedKYC();
    fetchKYCStatistics();
  }, []);
 
  // Apply filters
  useEffect(() => {
    let result = verifiedKYC;
   
    // Apply search filter
    if (searchQuery) {
      result = result.filter(user =>
        user._id.includes(searchQuery) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.player_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.kycInfo?.fullLegalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.kycInfo?.voterIdNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.kycInfo?.verifiedBy?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
   
    // Apply date filter (verification date)
    if (dateFilter !== 'all') {
      const now = moment();
      result = result.filter(user => {
        const verifiedDate = moment(user.kycInfo?.verifiedAt);
       
        if (dateFilter === 'custom') {
          if (startDate && endDate) {
            const start = moment(startDate);
            const end = moment(endDate);
            return verifiedDate.isBetween(start, end, null, '[]');
          }
          return true;
        }
       
        switch (dateFilter) {
          case 'today':
            return verifiedDate.isSame(now, 'day');
          case 'week':
            return verifiedDate.isSame(now, 'week');
          case 'month':
            return verifiedDate.isSame(now, 'month');
          default:
            return true;
        }
      });
    }
   
    // Apply document type filter
    if (documentTypeFilter !== 'all') {
      result = result.filter(user => {
        return user.kycDocuments?.some(doc => 
          doc.documentType === documentTypeFilter
        );
      });
    }
   
    // Apply verified by filter
    if (verifiedByFilter !== 'all') {
      result = result.filter(user => {
        if (verifiedByFilter === 'system') {
          return !user.kycInfo?.verifiedBy || user.kycInfo.verifiedBy === 'system';
        }
        return user.kycInfo?.verifiedBy === verifiedByFilter;
      });
    }
   
    // Apply days since verification filter
    if (daysSinceFilter !== 'all') {
      result = result.filter(user => {
        const verifiedDate = moment(user.kycInfo?.verifiedAt);
        const daysSinceVerification = moment().diff(verifiedDate, 'days');
       
        switch (daysSinceFilter) {
          case '1':
            return daysSinceVerification <= 1;
          case '7':
            return daysSinceVerification <= 7;
          case '30':
            return daysSinceVerification <= 30;
          case '90':
            return daysSinceVerification <= 90;
          case '180':
            return daysSinceVerification <= 180;
          case '365':
            return daysSinceVerification <= 365;
          default:
            return true;
        }
      });
    }

    // Apply user status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
   
    setFilteredKYC(result);
    setCurrentPage(1);
  }, [
    searchQuery, dateFilter, startDate, endDate, 
    documentTypeFilter, verifiedByFilter, daysSinceFilter,
    statusFilter, verifiedKYC
  ]);
 
  // View KYC details
  const viewKYCDetails = async (user) => {
    setSelectedKYC(user);
    
    try {
      // Fetch full KYC details
      const response = await axios.get(`${base_url}/admin/kyc/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });
      
      if (response.data.success) {
        setSelectedKYC(response.data.data);
        setDocuments(response.data.data.kycDocuments || []);
        setShowKYCModal(true);
      }
    } catch (error) {
      console.error("Error fetching KYC details:", error);
      toast.error("Failed to load KYC details");
    }
  };
 
  // Download KYC data as Excel
  const downloadKYCData = () => {
    const data = filteredKYC.map((user, index) => ({
      'S.No': index + 1,
      'User ID': user._id,
      'Player ID': user.player_id,
      'Username': user.username,
      'Email': user.email,
      'Full Name': user.kycInfo?.fullLegalName || 'N/A',
      'Document Type': user.kycInfo?.documentType || 'N/A',
      'ID Number': user.kycInfo?.voterIdNumber || user.kycInfo?.idNumber || 'N/A',
      'Date of Birth': user.kycInfo?.dateOfBirth ? 
        moment(user.kycInfo.dateOfBirth).format('YYYY-MM-DD') : 'N/A',
      'Age': user.kycInfo?.dateOfBirth ? 
        moment().diff(moment(user.kycInfo.dateOfBirth), 'years') : 'N/A',
      'Address': `${user.kycInfo?.address || ''}, ${user.kycInfo?.city || ''}, ${user.kycInfo?.state || ''}, ${user.kycInfo?.country || ''}`,
      'Verified At': user.kycInfo?.verifiedAt ? 
        moment(user.kycInfo.verifiedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
      'Verified By': user.kycInfo?.verifiedBy || 'System',
      'Days Since Verification': user.kycInfo?.verifiedAt ? 
        moment().diff(moment(user.kycInfo.verifiedAt), 'days') : 'N/A',
      'Admin Notes': user.kycInfo?.adminNotes || 'N/A',
      'Document Count': user.kycDocuments?.length || 0,
      'Phone': user.phone || 'N/A',
      'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
      'Account Status': user.status,
      'Account Created': moment(user.createdAt).format('YYYY-MM-DD HH:mm:ss')
    }));
   
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Verified KYC Data");
   
    // Auto-size columns
    const colWidths = [
      { wch: 5 },   // S.No
      { wch: 25 },  // User ID
      { wch: 12 },  // Player ID
      { wch: 15 },  // Username
      { wch: 25 },  // Email
      { wch: 20 },  // Full Name
      { wch: 15 },  // Document Type
      { wch: 20 },  // ID Number
      { wch: 12 },  // Date of Birth
      { wch: 8 },   // Age
      { wch: 30 },  // Address
      { wch: 20 },  // Verified At
      { wch: 15 },  // Verified By
      { wch: 18 },  // Days Since Verification
      { wch: 30 },  // Admin Notes
      { wch: 15 },  // Document Count
      { wch: 15 },  // Phone
      { wch: 12 },  // Email Verified
      { wch: 12 },  // Account Status
      { wch: 20 }   // Account Created
    ];
    ws['!cols'] = colWidths;
   
    XLSX.writeFile(wb, `verified_kyc_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
  };
 
  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setStartDate(null);
    setEndDate(null);
    setDocumentTypeFilter('all');
    setVerifiedByFilter('all');
    setDaysSinceFilter('all');
    setStatusFilter('all');
  };
 
  // Get filter summary
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (dateFilter !== 'all') count++;
    if (documentTypeFilter !== 'all') count++;
    if (verifiedByFilter !== 'all') count++;
    if (daysSinceFilter !== 'all') count++;
    if (statusFilter !== 'all') count++;
    return count;
  };
 
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredKYC.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredKYC.length / itemsPerPage);
 
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
 
  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    setItemsPerPage(newPerPage);
    setCurrentPage(1);
  };
 
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return moment(date).format('MMM D, YYYY');
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return moment(date).format('MMM D, YYYY h:mm A');
  };
 
  // Calculate days since verification
  const calculateDaysSinceVerification = (verifiedDate) => {
    if (!verifiedDate) return 0;
    return moment().diff(moment(verifiedDate), 'days');
  };
 
  // Get status color based on days
  const getDaysColor = (days) => {
    if (days <= 7) return 'text-green-600 bg-green-100';
    if (days <= 30) return 'text-blue-600 bg-blue-100';
    if (days <= 90) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  // Get unique admins who verified KYC
  const getUniqueAdmins = () => {
    const admins = verifiedKYC
      .map(user => user.kycInfo?.verifiedBy)
      .filter(Boolean)
      .filter(admin => admin !== 'system');
    
    return [...new Set(admins)];
  };

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    await fetchVerifiedKYC();
    await fetchKYCStatistics();
    toast.success("Data refreshed successfully");
  };
 
  if (loading) {
    return (
      <div className='flex justify-center items-center w-full h-full'>
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-green-500 border-b-green-500 border-l-transparent border-r-transparent"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-green-500/20 blur-sm"></div>
        </div>
      </div>
    );
  }
 
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
 
  return (
    <div className="w-full font-bai overflow-y-auto text-gray-700">
      <Header />
      <Toaster position="top-right" />
      <section className="">
        <div className="">
          <div className="w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Verified KYC</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Total Verified: {verifiedKYC.length} users | Filtered: {filteredKYC.length} users
                  {getActiveFilterCount() > 0 && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {getActiveFilterCount()} active filter(s)
                    </span>
                  )}
                </p>
              </div>
             
              <div className="flex items-center space-x-3">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search by username, email, name, verified by..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  onClick={refreshData}
                  className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                  title="Refresh Data"
                >
                  <FiRefreshCw className="text-lg" />
                </button>
                <button
                  onClick={() => setShowStatisticsModal(true)}
                  className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                  title="View Statistics"
                >
                  <FiFilter className="text-lg" />
                </button>
              </div>
            </div>
           
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 border border-green-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100 mr-3">
                    <FiCheck className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Verified</p>
                    <p className="text-2xl font-semibold text-gray-800">{verifiedKYC.length}</p>
                  </div>
                </div>
              </div>
             
              <div className="bg-white rounded-lg shadow p-4 border border-blue-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100 mr-3">
                    <FiFileText className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg. Documents</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {verifiedKYC.length > 0 ? 
                        (verifiedKYC.reduce((sum, user) => 
                          sum + (user.kycDocuments?.length || 0), 0) / verifiedKYC.length
                        ).toFixed(1) : '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border border-purple-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-purple-100 mr-3">
                    <FiEye className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Accounts</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {verifiedKYC.filter(user => user.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 border border-yellow-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-yellow-100 mr-3">
                    <FiCheck className="text-yellow-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recently Verified</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {verifiedKYC.filter(user => 
                        user.kycInfo?.verifiedAt && 
                        moment().diff(moment(user.kycInfo.verifiedAt), 'days') <= 7
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
           
            {/* Filter controls */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-800">Filters</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={resetAllFilters}
                    className="px-4 py-2 bg-gray-500 text-white rounded-[3px] hover:bg-gray-600 text-sm"
                  >
                    Reset All
                  </button>
                  <button
                    onClick={downloadKYCData}
                    className="px-4 py-2 bg-green-600 text-white rounded-[3px] hover:bg-green-700 text-sm flex items-center"
                  >
                    <FiDownload className="mr-2" /> Export Excel
                  </button>
                </div>
              </div>
             
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 text-gray-700">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Verification Date</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
               
                {dateFilter === 'custom' && (
                  <>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">From Date</label>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm w-full"
                        placeholderText="Start date"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-700 mb-1">To Date</label>
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm w-full"
                        placeholderText="End date"
                      />
                    </div>
                  </>
                )}
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Document Type</label>
                  <select
                    value={documentTypeFilter}
                    onChange={(e) => setDocumentTypeFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="all">All Types</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Verified By</label>
                  <select
                    value={verifiedByFilter}
                    onChange={(e) => setVerifiedByFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="all">All Verifiers</option>
                    <option value="system">System</option>
                    {getUniqueAdmins().map(admin => (
                      <option key={admin} value={admin}>{admin}</option>
                    ))}
                  </select>
                </div>
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Days Since Verified</label>
                  <select
                    value={daysSinceFilter}
                    onChange={(e) => setDaysSinceFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="1">≤ 1 day</option>
                    <option value="7">≤ 7 days</option>
                    <option value="30">≤ 30 days</option>
                    <option value="90">≤ 90 days</option>
                    <option value="180">≤ 180 days</option>
                    <option value="365">≤ 365 days</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Account Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>
            </div>
           
            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
              <span>
                Showing {filteredKYC.length === 0 ? 0 : indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredKYC.length)} of {filteredKYC.length} verified users
              </span>
              <div className="flex items-center space-x-4">
                {filteredKYC.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Page {currentPage} of {totalPages}
                  </span>
                )}
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    {perPageOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
           
            <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg">
              <table className="w-full border-collapse shadow-xl bg-white overflow-hidden">
                <thead>
                  <tr className="bg-green-600 text-white">
                    <th className="py-3 px-4 text-left">User Info</th>
                    <th className="py-3 px-4 text-left">KYC Details</th>
                    <th className="py-3 px-4 text-left">Verification Info</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((user, index) => {
                      const daysSince = calculateDaysSinceVerification(user.kycInfo?.verifiedAt);
                     
                      return (
                        <tr key={index} className="border-b even:bg-gray-50 hover:bg-green-50 transition-colors">
                          <td className="py-3 px-4 text-gray-800">
                            <div className="font-semibold">{user.player_id}</div>
                            <div className="text-sm text-gray-600">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-xs text-gray-500 mt-1">📱 {user.phone}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-800">
                            <div className="font-medium">{user.kycInfo?.fullLegalName || 'N/A'}</div>
                            <div className="text-sm text-gray-600">
                              {user.kycInfo?.documentType || 'No document type'}
                            </div>
                            {user.kycInfo?.voterIdNumber && (
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {user.kycInfo.voterIdNumber}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-800">
                            <div className="space-y-1">
                              <div>
                                <span className="text-sm text-gray-500">Verified: </span>
                                <span className="font-medium">
                                  {formatDateTime(user.kycInfo?.verifiedAt)}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">By: </span>
                                <span className="font-medium text-green-600">
                                  {user.kycInfo?.verifiedBy || 'System'}
                                </span>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">Days: </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${getDaysColor(daysSince)}`}>
                                  {daysSince} days ago
                                </span>
                              </div>
                            </div>
                          </td>
                    
                          
                          <td className="py-3 px-4">
                            <div className="flex flex-col space-y-1">
                              <span className={`text-sm px-2 py-2.5 rounded-full text-center font-medium border-[1px] bg-green-100 border-green-500`}>
                               verified
                              </span>
                        
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => viewKYCDetails(user)}
                                className="flex items-center justify-center border-[1px] border-blue-500 px-[10px] py-[6px] rounded-[5px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 w-full text-sm"
                              >
                                <FiEye className="mr-1" /> View Details
                              </button>
                              <NavLink to={`/users/user-detail/${user._id}`}>
                                <button className="flex items-center justify-center border-[1px] border-green-500 px-[10px] py-[6px] rounded-[5px] text-green-500 hover:text-green-600 hover:bg-green-50 w-full text-sm">
                                  <RiComputerLine className="mr-1" /> User Profile
                                </button>
                              </NavLink>
                              {user.kycInfo?.adminNotes && (
                                <div className="text-xs text-gray-500 mt-1 truncate" title={user.kycInfo.adminNotes}>
                                  📝 {user.kycInfo.adminNotes.substring(0, 30)}...
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <FiSearch className="text-4xl text-gray-300 mb-2" />
                          <p className="text-lg">No verified KYC submissions found</p>
                          <p className="text-sm mt-1">Try adjusting your filters</p>
                          <button
                            onClick={resetAllFilters}
                            className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            Clear All Filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
           
            {/* Pagination */}
            {filteredKYC.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({filteredKYC.length} total verified users)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-[2px] border-[1px] border-gray-200 ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                  >
                    Previous
                  </button>
                 
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                   
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-3 py-1 rounded-[2px] ${currentPage === pageNum ? 'bg-green-600 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                 
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-[2px] border-[1px] border-gray-200 ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* KYC Details Modal */}
      {showKYCModal && selectedKYC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">Verified KYC Details</h3>
              <button
                onClick={() => setShowKYCModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
           
            <div className="p-6">
              {/* Verification Badge */}
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-full mr-3">
                    <FiCheck className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-800">KYC Verified</h4>
                    <p className="text-sm text-green-600">
                      Verified on {formatDateTime(selectedKYC.kycInfo?.verifiedAt)} by {selectedKYC.kycInfo?.verifiedBy || 'System'}
                    </p>
                  </div>
                </div>
              </div>
             
              {/* User Information */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-3">User Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{selectedKYC.userInfo?.username || selectedKYC.username}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedKYC.userInfo?.email || selectedKYC.email}</p>
                    {selectedKYC.userInfo?.emailVerified && (
                      <span className="text-xs text-green-600">✓ Verified</span>
                    )}
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{selectedKYC.userInfo?.phone || selectedKYC.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Account Status</p>
                    <p className={`font-medium ${
                      selectedKYC.userInfo?.status === 'active' ? 'text-green-600' :
                      selectedKYC.userInfo?.status === 'inactive' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {selectedKYC.userInfo?.status || selectedKYC.status}
                    </p>
                  </div>
                </div>
              </div>
             
              {/* KYC Information */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-3">KYC Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Full Legal Name</p>
                    <p className="font-medium">{selectedKYC.kycInfo?.fullLegalName || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">
                      {selectedKYC.kycInfo?.dateOfBirth ? 
                        formatDate(selectedKYC.kycInfo.dateOfBirth) : 'N/A'}
                      {selectedKYC.calculatedAge && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({selectedKYC.calculatedAge} years old)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Document Type</p>
                    <p className="font-medium">{selectedKYC.kycInfo?.documentType || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">ID Number</p>
                    <p className="font-medium">{selectedKYC.kycInfo?.voterIdNumber || 'N/A'}</p>
                  </div>
                </div>
               
                {/* Address */}
                {selectedKYC.kycInfo?.address && (
                  <div className="mt-4 bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {selectedKYC.kycInfo.address}
                      {selectedKYC.kycInfo.city && `, ${selectedKYC.kycInfo.city}`}
                      {selectedKYC.kycInfo.state && `, ${selectedKYC.kycInfo.state}`}
                      {selectedKYC.kycInfo.country && `, ${selectedKYC.kycInfo.country}`}
                    </p>
                  </div>
                )}
              </div>
             
              {/* Verification Details */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Verification Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Verified By</p>
                    <p className="font-medium text-green-600">
                      {selectedKYC.kycInfo?.verifiedBy || 'System'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Verification Date</p>
                    <p className="font-medium">
                      {formatDateTime(selectedKYC.kycInfo?.verifiedAt)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedKYC.kycInfo?.verifiedAt && 
                        `${calculateDaysSinceVerification(selectedKYC.kycInfo.verifiedAt)} days ago`}
                    </p>
                  </div>
                </div>
               
                {selectedKYC.kycInfo?.adminNotes && (
                  <div className="mt-4 bg-blue-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Admin Notes</p>
                    <p className="font-medium">{selectedKYC.kycInfo.adminNotes}</p>
                  </div>
                )}
              </div>
             
              {/* Documents */}
              {documents.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">
                    Verified Documents ({documents.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border border-green-200">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-800">{doc.documentType}</p>
                            <p className="text-sm text-gray-500">
                              Status: <span className="font-medium text-green-600">Verified</span>
                            </p>
                            {doc.verifiedAt && (
                              <p className="text-xs text-gray-500">
                                Verified on: {moment(doc.verifiedAt).format('MMM D, YYYY')}
                              </p>
                            )}
                          </div>
                        </div>
                       
                        <div className="space-y-2">
                          {doc.frontImage && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Front</p>
                              <a
                                href={doc.frontImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                              >
                                <FiFileText className="mr-1" /> View Front Image
                              </a>
                            </div>
                          )}
                          {doc.backImage && (
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Back</p>
                              <a
                                href={doc.backImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                              >
                                <FiFileText className="mr-1" /> View Back Image
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
             
              {/* Action Buttons */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Account created: {formatDateTime(selectedKYC.userInfo?.accountCreated || selectedKYC.createdAt)}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowKYCModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Close
                    </button>
                    <NavLink to={`/users/user-detail/${selectedKYC.userInfo?.id || selectedKYC._id}`}>
                      <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                        View User Profile
                      </button>
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Modal */}
      {showStatisticsModal && statistics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">KYC Statistics</h3>
              <button
                onClick={() => setShowStatisticsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
           
            <div className="p-6">
              {/* Overall Statistics */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Overall Statistics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Total Verified</p>
                    <p className="text-2xl font-bold text-green-600">
                      {statistics.totals?.verified || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {statistics.percentages?.verificationRate?.toFixed(1)}% of submitted KYC
                    </p>
                  </div>
                 
                  <div className="bg-white border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Active Accounts</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {verifiedKYC.filter(user => user.status === 'active').length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((verifiedKYC.filter(user => user.status === 'active').length / verifiedKYC.length) * 100).toFixed(1)}% of verified users
                    </p>
                  </div>
                 
                  <div className="bg-white border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Avg. Verification Time</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {statistics.verificationPerformance?.averageVerificationTime?.toFixed(1)} hours
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {statistics.verificationPerformance?.count || 0} verifications
                    </p>
                  </div>
                 
                  <div className="bg-white border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Recent Verifications</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {statistics.recentActivity?.submissionsLast7Days || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Last 7 days
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Performance */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Verification Performance</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Fastest Verification</p>
                      <p className="text-xl font-bold text-green-600">
                        {statistics.verificationPerformance?.minVerificationTime?.toFixed(1)} hours
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Slowest Verification</p>
                      <p className="text-xl font-bold text-red-600">
                        {statistics.verificationPerformance?.maxVerificationTime?.toFixed(1)} hours
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Total Processed</p>
                      <p className="text-xl font-bold text-blue-600">
                        {statistics.verificationPerformance?.count || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily Verification Chart */}
              {statistics.recentActivity?.dailyVerifications && statistics.recentActivity.dailyVerifications.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">Daily Verification Trend</h4>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="space-y-2">
                      {statistics.recentActivity.dailyVerifications.slice(-7).map((day, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-24 text-sm text-gray-600">{day._id}</div>
                          <div className="flex-1">
                            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="absolute top-0 left-0 h-full bg-green-500 rounded-full"
                                style={{ 
                                  width: `${(day.count / Math.max(...statistics.recentActivity.dailyVerifications.map(d => d.count))) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="w-10 text-right text-sm font-medium">{day.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* User Status Distribution */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-3">User Status Distribution</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-green-200 rounded-lg p-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                      {verifiedKYC.filter(user => user.status === 'active').length}
                    </div>
                    <p className="font-medium text-green-600">Active</p>
                    <p className="text-xs text-gray-500">
                      {((verifiedKYC.filter(user => user.status === 'active').length / verifiedKYC.length) * 100).toFixed(1)}%
                    </p>
                  </div>
                 
                  <div className="bg-white border border-yellow-200 rounded-lg p-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 mb-2">
                      {verifiedKYC.filter(user => user.status === 'inactive').length}
                    </div>
                    <p className="font-medium text-yellow-600">Inactive</p>
                    <p className="text-xs text-gray-500">
                      {((verifiedKYC.filter(user => user.status === 'inactive').length / verifiedKYC.length) * 100).toFixed(1)}%
                    </p>
                  </div>
                 
                  <div className="bg-white border border-red-200 rounded-lg p-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-2">
                      {verifiedKYC.filter(user => user.status === 'banned').length}
                    </div>
                    <p className="font-medium text-red-600">Banned</p>
                    <p className="text-xs text-gray-500">
                      {((verifiedKYC.filter(user => user.status === 'banned').length / verifiedKYC.length) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Type Distribution */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3">Document Types Used</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {documentTypes.map((type, index) => {
                      const count = verifiedKYC.filter(user => 
                        user.kycInfo?.documentType === type
                      ).length;
                      const percentage = (count / verifiedKYC.length) * 100;
                     
                      return count > 0 ? (
                        <div key={index} className="text-center">
                          <p className="text-sm font-medium text-gray-700">{type}</p>
                          <p className="text-lg font-bold text-blue-600">{count}</p>
                          <p className="text-xs text-gray-500">
                            {percentage.toFixed(1)}%
                          </p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifiedKYC;
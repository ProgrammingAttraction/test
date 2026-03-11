import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiFileText, FiCheck, FiClock, FiAlertCircle } from 'react-icons/fi';
import { RiComputerLine } from "react-icons/ri";
import { NavLink } from 'react-router-dom';
import axios from "axios";
import moment from "moment";
import Header from '../common/Header';
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const PendingKYC = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
 
  // State for KYC data
  const [pendingKYC, setPendingKYC] = useState([]);
  const [filteredKYC, setFilteredKYC] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [documentTypeFilter, setDocumentTypeFilter] = useState('all');
  const [submissionDaysFilter, setSubmissionDaysFilter] = useState('all');
 
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
 
  // Modal states
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documents, setDocuments] = useState([]);
 
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
 
  // Fetch pending KYC data
  const fetchPendingKYC = async () => {
    try {
      const response = await axios.get(`${base_url}/admin/kyc/pending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });
      setPendingKYC(response.data.data);
      setFilteredKYC(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error("Failed to load pending KYC submissions");
    }
  };
 
  useEffect(() => {
    fetchPendingKYC();
  }, []);
 
  // Apply filters
  useEffect(() => {
    let result = pendingKYC;
   
    // Apply search filter
    if (searchQuery) {
      result = result.filter(user =>
        user._id.includes(searchQuery) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.player_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.kycInfo?.fullLegalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.kycInfo?.voterIdNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
   
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = moment();
      result = result.filter(user => {
        const submittedDate = moment(user.kycInfo?.submittedAt);
       
        if (dateFilter === 'custom') {
          if (startDate && endDate) {
            const start = moment(startDate);
            const end = moment(endDate);
            return submittedDate.isBetween(start, end, null, '[]');
          }
          return true;
        }
       
        switch (dateFilter) {
          case 'today':
            return submittedDate.isSame(now, 'day');
          case 'week':
            return submittedDate.isSame(now, 'week');
          case 'month':
            return submittedDate.isSame(now, 'month');
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
   
    // Apply submission days filter
    if (submissionDaysFilter !== 'all') {
      result = result.filter(user => {
        const submittedDate = moment(user.kycInfo?.submittedAt);
        const daysSinceSubmission = moment().diff(submittedDate, 'days');
       
        switch (submissionDaysFilter) {
          case '1':
            return daysSinceSubmission <= 1;
          case '3':
            return daysSinceSubmission <= 3;
          case '7':
            return daysSinceSubmission <= 7;
          case '14':
            return daysSinceSubmission <= 14;
          case '30':
            return daysSinceSubmission <= 30;
          default:
            return true;
        }
      });
    }
   
    setFilteredKYC(result);
    setCurrentPage(1);
  }, [
    searchQuery, dateFilter, startDate, endDate, 
    documentTypeFilter, submissionDaysFilter, pendingKYC
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
 
  // Open action modal
  const openActionModal = (type, user) => {
    setSelectedKYC(user);
    setActionType(type);
    setRejectionReason('');
    setVerificationNotes('');
    setShowActionModal(true);
  };
 
  // Process KYC action
  const processKYCAction = async () => {
    if (!selectedKYC) return;
   
    setIsProcessing(true);
    const token = localStorage.getItem('genzz_token');
    const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
   
    try {
      let endpoint = '';
      let payload = {};
   
      if (actionType === 'verify') {
         console.log(adminData)
        endpoint = `${base_url}/admin/kyc/${selectedKYC.userInfo?.id || selectedKYC._id}/verify`;
        payload = {
          adminId: adminData.id,
          adminUsername: adminData.username,
          notes: verificationNotes || "KYC verified by admin"
        };
      } else if (actionType === 'reject') {
        if (!rejectionReason.trim()) {
          toast.error("Please provide a rejection reason");
          setIsProcessing(false);
          return;
        }
       console.log(adminData)
        endpoint = `${base_url}/admin/kyc/${selectedKYC.userInfo?.id || selectedKYC._id}/reject`;
        payload = {
          adminId: adminData.id,
          adminUsername: adminData.username,
          rejectionReason: rejectionReason.trim(),
          notes: verificationNotes || "KYC rejected by admin",
          allowResubmission: true
        };
      }
   
      const response = await axios.put(endpoint, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
   
      if (response.data.success) {
        // Update local state
        setPendingKYC(prev => prev.filter(user => 
          user._id !== (selectedKYC.userInfo?.id || selectedKYC._id)
        ));
       
        toast.success(response.data.message);
        setShowActionModal(false);
        setShowKYCModal(false);
        setSelectedKYC(null);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing KYC:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${actionType} KYC`;
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };
 
  // Request resubmission
  const requestResubmission = async () => {
    if (!selectedKYC || !rejectionReason.trim()) {
      toast.error("Please provide a resubmission reason");
      return;
    }
   
    setIsProcessing(true);
    const token = localStorage.getItem('genzz_token');
    const adminData = JSON.parse(localStorage.getItem('admin') || '{}');
   
    try {
        console.log(adminData)
      const response = await axios.put(
        `${base_url}/admin/kyc/${selectedKYC.userInfo?.id || selectedKYC._id}/request-resubmission`,
        {
          adminId: adminData.id,
          adminUsername: adminData.username,
          reason: rejectionReason.trim(),
          requiredDocuments: selectedKYC.kycInfo?.documentType ? [selectedKYC.kycInfo.documentType] : [],
          deadlineDays: 7
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
   
      if (response.data.success) {
        // Update local state
        setPendingKYC(prev => prev.filter(user => 
          user._id !== (selectedKYC.userInfo?.id || selectedKYC._id)
        ));
       
        toast.success("Resubmission requested successfully");
        setShowActionModal(false);
        setShowKYCModal(false);
        setSelectedKYC(null);
      }
    } catch (error) {
      console.error("Error requesting resubmission:", error);
      toast.error("Failed to request resubmission");
    } finally {
      setIsProcessing(false);
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
      'Submitted At': user.kycInfo?.submittedAt ? 
        moment(user.kycInfo.submittedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
      'Days Pending': user.kycInfo?.submittedAt ? 
        moment().diff(moment(user.kycInfo.submittedAt), 'days') : 'N/A',
      'Document Count': user.kycDocuments?.length || 0,
      'Phone': user.phone || 'N/A',
      'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
      'Account Status': user.status
    }));
   
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending KYC Data");
   
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
      { wch: 20 },  // Submitted At
      { wch: 12 },  // Days Pending
      { wch: 15 },  // Document Count
      { wch: 15 },  // Phone
      { wch: 12 },  // Email Verified
      { wch: 12 }   // Account Status
    ];
    ws['!cols'] = colWidths;
   
    XLSX.writeFile(wb, `pending_kyc_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
  };
 
  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setStartDate(null);
    setEndDate(null);
    setDocumentTypeFilter('all');
    setSubmissionDaysFilter('all');
  };
 
  // Get filter summary
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (dateFilter !== 'all') count++;
    if (documentTypeFilter !== 'all') count++;
    if (submissionDaysFilter !== 'all') count++;
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
 
  // Calculate days pending
  const calculateDaysPending = (submittedDate) => {
    if (!submittedDate) return 0;
    return moment().diff(moment(submittedDate), 'days');
  };
 
  // Get status color
  const getDaysPendingColor = (days) => {
    if (days >= 30) return 'text-red-600 border-[1px] border-red-500 bg-red-100';
    if (days >= 14) return 'text-orange-600 border-[1px] border-green-500 bg-orange-100';
    if (days >= 7) return 'text-yellow-600 border-[1px] border-yellow-500 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };
 
  if (loading) {
    return (
      <div className='flex justify-center items-center w-full h-full'>
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
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
                <h1 className="text-2xl font-semibold text-gray-800">Pending KYC Verification</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {pendingKYC.length} pending | Filtered: {filteredKYC.length} submissions
                  {getActiveFilterCount() > 0 && (
                    <span className="ml-2 px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs">
                      {getActiveFilterCount()} active filter(s)
                    </span>
                  )}
                </p>
              </div>
             
              <div className="relative w-[30%]">
                <input
                  type="text"
                  placeholder="Search by username, email, name, ID number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
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
                    className="px-4 py-2 bg-green-600 text-white rounded-[3px] hover:bg-green-700 text-sm"
                  >
                    Export Excel
                  </button>
                </div>
              </div>
             
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 text-gray-700">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Submission Date</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full"
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
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full"
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
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All Types</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Days Pending</label>
                  <select
                    value={submissionDaysFilter}
                    onChange={(e) => setSubmissionDaysFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="1">≤ 1 day</option>
                    <option value="3">≤ 3 days</option>
                    <option value="7">≤ 7 days</option>
                    <option value="14">≤ 14 days</option>
                    <option value="30">≤ 30 days</option>
                  </select>
                </div>
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Items per page</label>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    {perPageOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
           
            {/* Statistics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100 mr-3">
                    <FiClock className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Pending</p>
                    <p className="text-2xl font-semibold text-gray-800">{pendingKYC.length}</p>
                  </div>
                </div>
              </div>
             
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-green-100 mr-3">
                    <FiCheck className="text-green-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Filtered</p>
                    <p className="text-2xl font-semibold text-gray-800">{filteredKYC.length}</p>
                  </div>
                </div>
              </div>
             
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-yellow-100 mr-3">
                    <FiAlertCircle className="text-yellow-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Oldest Pending</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {pendingKYC.length > 0 ? 
                        Math.max(...pendingKYC.map(user => 
                          calculateDaysPending(user.kycInfo?.submittedAt)
                        )) + ' days' : '0 days'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-purple-100 mr-3">
                    <FiFileText className="text-purple-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg. Documents</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {pendingKYC.length > 0 ? 
                        (pendingKYC.reduce((sum, user) => 
                          sum + (user.kycDocuments?.length || 0), 0) / pendingKYC.length
                        ).toFixed(1) : '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
           
            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
              <span>
                Showing {filteredKYC.length === 0 ? 0 : indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredKYC.length)} of {filteredKYC.length} submissions
              </span>
              {filteredKYC.length > 0 && (
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
           
            <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg">
              <table className="w-full border-collapse shadow-xl bg-white overflow-hidden">
                <thead>
                  <tr className="bg-purple-600 text-white">
                    <th className="py-3 px-4 text-left">User Info</th>
                    <th className="py-3 px-4 text-left">KYC Details</th>
                    <th className="py-3 px-4 text-left">Submission</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length > 0 ? (
                    currentItems.map((user, index) => {
                      const daysPending = calculateDaysPending(user.kycInfo?.submittedAt);
                     
                      return (
                        <tr key={index} className="border-b even:bg-gray-50 hover:bg-gray-100 transition-colors">
                          <td className="py-3 px-4 text-gray-800">
                            <div className="font-semibold">{user.player_id}</div>
                            <div className="text-sm text-gray-600">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 mt-1">📱 {user.phone}</div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-800">
                            <div className="font-medium">{user.kycInfo?.fullLegalName || 'N/A'}</div>
                            {user.kycInfo?.voterIdNumber && (
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {user.kycInfo.voterIdNumber}
                              </div>
                            )}
                            {user.kycInfo?.dateOfBirth && (
                              <div className="text-xs text-gray-500">
                                DOB: {formatDate(user.kycInfo.dateOfBirth)}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-800">
                            <div className="font-medium">
                              {user.kycInfo?.submittedAt ? 
                                moment(user.kycInfo.submittedAt).format("MMM D, YYYY") : 'Not submitted'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {user.kycInfo?.submittedAt ? 
                                moment(user.kycInfo.submittedAt).fromNow() : 'N/A'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col space-y-1">
                              <span className={`text-xs px-2 py-2.5 rounded-full border-[1px] border-green-500  text-center font-medium ${getDaysPendingColor(daysPending)}`}>
                                {daysPending} days pending
                              </span>
                              {user.isEmailVerified && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-2.5 rounded-full">
                                  Email Verified
                                </span>
                              )}
                              {user.phone && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-2.5 rounded-full">
                                  Phone Provided
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={() => viewKYCDetails(user)}
                                className="flex items-center justify-center border-[1px] border-blue-500 px-[10px] py-[6px] rounded-[5px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 w-full text-sm"
                              >
                                <FiFileText className="mr-1" /> View Details
                              </button>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  onClick={() => openActionModal('verify', user)}
                                  className="flex items-center justify-center border-[1px] border-green-500 px-2 py-[6px] rounded-[5px] text-green-500 hover:text-green-600 hover:bg-green-50 transition-colors text-sm"
                                  title="Verify KYC"
                                >
                                  <FiCheck className="mr-1" /> Verify
                                </button>
                                <button
                                  onClick={() => openActionModal('reject', user)}
                                  className="flex items-center justify-center border-[1px] border-red-500 px-2 py-[6px] rounded-[5px] text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors text-sm"
                                  title="Reject KYC"
                                >
                                  <FiX className="mr-1" /> Reject
                                </button>
                              </div>
                              <NavLink to={`/users/user-detail/${user._id}`}>
                                <button className="flex items-center justify-center border-[1px] border-purple-500 px-[10px] py-[6px] rounded-[5px] text-purple-500 hover:text-purple-600 hover:bg-purple-50 w-full text-sm">
                                  <RiComputerLine className="mr-1" /> User Profile
                                </button>
                              </NavLink>
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
                          <p className="text-lg">No pending KYC submissions found</p>
                          <p className="text-sm mt-1">Try adjusting your filters or check back later</p>
                          <button
                            onClick={resetAllFilters}
                            className="mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
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
                  Page {currentPage} of {totalPages} ({filteredKYC.length} total submissions)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-[2px] border-[1px] border-gray-200 ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
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
                        className={`px-3 py-1 rounded-[2px] ${currentPage === pageNum ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                 
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-[2px] border-[1px] border-gray-200 ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
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
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">KYC Verification Details</h3>
              <button
                onClick={() => setShowKYCModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
           
            <div className="p-6">
              {/* User Information */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-3">User Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
             
              {/* Documents */}
              {documents.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-800 mb-3">
                    Submitted Documents ({documents.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-800">{doc.documentType}</p>
                            <p className="text-sm text-gray-500">
                              Status: <span className={`font-medium ${
                                doc.status === 'verified' ? 'text-green-600' :
                                doc.status === 'rejected' ? 'text-red-600' :
                                'text-yellow-600'
                              }`}>
                                {doc.status || 'pending'}
                              </span>
                            </p>
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
                       
                        {doc.uploadedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Uploaded: {moment(doc.uploadedAt).format('MMM D, YYYY h:mm A')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
             
              {/* Verification Progress */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Verification Progress</h4>
                <div className="space-y-2">
                  {selectedKYC.verificationProgress && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Email Verification</span>
                        <span className={`text-sm ${selectedKYC.verificationProgress.email ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedKYC.verificationProgress.email ? '✓ Completed' : '✗ Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Phone Verification</span>
                        <span className={`text-sm ${selectedKYC.verificationProgress.phone ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedKYC.verificationProgress.phone ? '✓ Completed' : '✗ Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">KYC Submission</span>
                        <span className={`text-sm ${selectedKYC.verificationProgress.kycSubmitted ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedKYC.verificationProgress.kycSubmitted ? '✓ Completed' : '✗ Pending'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Documents Uploaded</span>
                        <span className={`text-sm ${selectedKYC.verificationProgress.documentsUploaded ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedKYC.verificationProgress.documentsUploaded ? '✓ Completed' : '✗ Pending'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
             
              {/* Action Buttons */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowKYCModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowKYCModal(false);
                      openActionModal('reject', selectedKYC);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Reject KYC
                  </button>
                  <button
                    onClick={() => {
                      setShowKYCModal(false);
                      openActionModal('verify', selectedKYC);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Verify KYC
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Verify/Reject) */}
      {showActionModal && selectedKYC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                {actionType === 'verify' ? 'Verify KYC' : 'Reject KYC'}
              </h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isProcessing}
              >
                <FiX size={24} />
              </button>
            </div>
           
            <div className="mb-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-1">
                User: <span className="font-semibold">{selectedKYC.userInfo?.username || selectedKYC.username}</span>
              </p>
              <p className="text-sm text-gray-600">
                Name: <span className="font-semibold">{selectedKYC.kycInfo?.fullLegalName || 'N/A'}</span>
              </p>
            </div>
           
            {actionType === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a detailed reason for rejection..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  required
                />
              </div>
            )}
           
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
             
              {actionType === 'reject' && (
                <button
                  onClick={requestResubmission}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                  disabled={isProcessing || !rejectionReason.trim()}
                >
                  {isProcessing ? 'Processing...' : 'Request Resubmission'}
                </button>
              )}
             
              <button
                onClick={processKYCAction}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  actionType === 'verify' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={isProcessing || (actionType === 'reject' && !rejectionReason.trim())}
              >
                {isProcessing ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  actionType === 'verify' ? 'Verify KYC' : 'Reject KYC'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingKYC;
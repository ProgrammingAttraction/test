import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiFileText, FiAlertCircle, FiDownload, FiEye } from 'react-icons/fi';
import { RiComputerLine } from "react-icons/ri";
import { NavLink } from 'react-router-dom';
import axios from "axios";
import moment from "moment";
import Header from '../common/Header';
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Rejectedkyc = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
 
  // State for rejected KYC data
  const [rejectedKYC, setRejectedKYC] = useState([]);
  const [filteredKYC, setFilteredKYC] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
 
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
 
  // Modal states
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState(null);
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
 
  // Fetch rejected KYC data
  const fetchRejectedKYC = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(searchQuery && { search: searchQuery }),
        ...(startDate && { startDate: moment(startDate).format('YYYY-MM-DD') }),
        ...(endDate && { endDate: moment(endDate).format('YYYY-MM-DD') })
      };

      const response = await axios.get(`${base_url}/admin/kyc/rejected`, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      if (response.data.success) {
        setRejectedKYC(response.data.data);
        setFilteredKYC(response.data.data);
        setTotalItems(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      }
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error("Failed to load rejected KYC submissions");
    }
  };
 
  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchRejectedKYC();
  }, [currentPage, itemsPerPage, searchQuery, startDate, endDate]);
 
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
      'Rejection Reason': user.kycInfo?.rejectionReason || 'N/A',
      'Rejected By': user.kycInfo?.rejectedByAdmin || 'N/A',
      'Date of Birth': user.kycInfo?.dateOfBirth ? 
        moment(user.kycInfo.dateOfBirth).format('YYYY-MM-DD') : 'N/A',
      'Age': user.kycInfo?.dateOfBirth ? 
        moment().diff(moment(user.kycInfo.dateOfBirth), 'years') : 'N/A',
      'Address': `${user.kycInfo?.address || ''}, ${user.kycInfo?.city || ''}, ${user.kycInfo?.state || ''}, ${user.kycInfo?.country || ''}`,
      'Submitted At': user.kycInfo?.submittedAt ? 
        moment(user.kycInfo.submittedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
      'Rejected At': user.kycInfo?.rejectedAt ? 
        moment(user.kycInfo.rejectedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A',
      'Days Since Rejection': user.kycInfo?.rejectedAt ? 
        moment().diff(moment(user.kycInfo.rejectedAt), 'days') : 'N/A',
      'Document Count': user.kycDocuments?.length || 0,
      'Phone': user.phone || 'N/A',
      'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
      'Account Status': user.status
    }));
   
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rejected KYC Data");
   
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
      { wch: 30 },  // Rejection Reason
      { wch: 15 },  // Rejected By
      { wch: 12 },  // Date of Birth
      { wch: 8 },   // Age
      { wch: 30 },  // Address
      { wch: 20 },  // Submitted At
      { wch: 20 },  // Rejected At
      { wch: 15 },  // Days Since Rejection
      { wch: 15 },  // Document Count
      { wch: 15 },  // Phone
      { wch: 12 },  // Email Verified
      { wch: 12 }   // Account Status
    ];
    ws['!cols'] = colWidths;
   
    XLSX.writeFile(wb, `rejected_kyc_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
  };
 
  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery('');
    setStartDate(null);
    setEndDate(null);
    setCurrentPage(1);
  };
 
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return moment(date).format('MMM D, YYYY h:mm A');
  };
 
  // Calculate days since rejection
  const calculateDaysSinceRejection = (rejectedDate) => {
    if (!rejectedDate) return 0;
    return moment().diff(moment(rejectedDate), 'days');
  };
 
  // Get status color for days
  const getDaysColor = (days) => {
    if (days >= 30) return 'bg-red-100 text-red-800 border-red-200';
    if (days >= 14) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (days >= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };
 
  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    setItemsPerPage(newPerPage);
    setCurrentPage(1);
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
                <h1 className="text-2xl font-semibold text-gray-800">Rejected KYC Submissions</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {totalItems} rejected submissions
                </p>
              </div>
             
              <div className="relative w-[30%]">
                <input
                  type="text"
                  placeholder="Search by username, email, name, rejection reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
                    className="px-4 py-2 bg-green-600 text-white rounded-[3px] hover:bg-green-700 text-sm flex items-center"
                  >
                    <FiDownload className="mr-2" /> Export Excel
                  </button>
                </div>
              </div>
             
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 text-gray-700">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm w-full"
                    placeholderText="Start date"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    minDate={startDate}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm w-full"
                    placeholderText="End date"
                  />
                </div>
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Items per page</label>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
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
                  <div className="p-2 rounded-lg bg-red-100 mr-3">
                    <FiAlertCircle className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Rejected</p>
                    <p className="text-2xl font-semibold text-gray-800">{totalItems}</p>
                  </div>
                </div>
              </div>
             
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-orange-100 mr-3">
                    <FiAlertCircle className="text-orange-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">This Month</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {rejectedKYC.filter(user => 
                        moment(user.kycInfo?.rejectedAt).isSame(moment(), 'month')
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
             
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-yellow-100 mr-3">
                    <FiAlertCircle className="text-yellow-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">This Week</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {rejectedKYC.filter(user => 
                        moment(user.kycInfo?.rejectedAt).isSame(moment(), 'week')
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100 mr-3">
                    <FiFileText className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg. Documents</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {rejectedKYC.length > 0 ? 
                        (rejectedKYC.reduce((sum, user) => 
                          sum + (user.kycDocuments?.length || 0), 0) / rejectedKYC.length
                        ).toFixed(1) : '0'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
           
            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
              <span>
                Showing {filteredKYC.length === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} submissions
              </span>
              {filteredKYC.length > 0 && (
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
           
            <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg">
              <table className="w-full border-collapse shadow-xl bg-white overflow-hidden">
                <thead>
                  <tr className="bg-red-600 text-white">
                    <th className="py-3 px-4 text-left">User Info</th>
                    <th className="py-3 px-4 text-left">KYC Details</th>
                    <th className="py-3 px-4 text-left">Rejection Details</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKYC.length > 0 ? (
                    filteredKYC.map((user, index) => {
                      const daysSinceRejection = calculateDaysSinceRejection(user.kycInfo?.rejectedAt);
                     
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
                            <div className="font-medium text-red-600">
                              {user.kycInfo?.rejectionReason ? 
                                user.kycInfo.rejectionReason.substring(0, 50) + 
                                (user.kycInfo.rejectionReason.length > 50 ? '...' : '') : 
                                'No reason provided'}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Rejected:</span> {formatDate(user.kycInfo?.rejectedAt)}
                            </div>
                            {user.kycInfo?.rejectedByAdmin && (
                              <div className="text-xs text-gray-500">
                                By: {user.kycInfo.rejectedByAdmin}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col space-y-1">
                              <span className={`text-xs px-2 py-1.5 rounded-full border ${getDaysColor(daysSinceRejection)} text-center font-medium`}>
                                {daysSinceRejection} days ago
                              </span>
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1.5 rounded-full">
                                Rejected
                              </span>
                              {user.kycInfo?.allowResubmission && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1.5 rounded-full">
                                  Resubmission Allowed
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
                                <FiEye className="mr-1" /> View Details
                              </button>
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
                          <p className="text-lg">No rejected KYC submissions found</p>
                          <p className="text-sm mt-1">Try adjusting your filters or check back later</p>
                          <button
                            onClick={resetAllFilters}
                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
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
            {filteredKYC.length > 0 && totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalItems} total submissions)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-[2px] border-[1px] border-gray-200 ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
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
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-[2px] ${currentPage === pageNum ? 'bg-red-600 text-white' : 'bg-red-500 text-white hover:bg-red-600'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                 
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-[2px] border-[1px] border-gray-200 ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
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
              <h3 className="text-xl font-semibold text-gray-800">Rejected KYC Details</h3>
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
             
              {/* Rejection Details */}
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Rejection Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Rejection Reason</p>
                    <p className="font-medium text-red-700 bg-white p-3 rounded border border-red-100">
                      {selectedKYC.kycInfo?.rejectionReason || 'No reason provided'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Rejected By</p>
                      <p className="font-medium">{selectedKYC.kycInfo?.rejectedByAdmin || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rejected On</p>
                      <p className="font-medium">{formatDate(selectedKYC.kycInfo?.rejectedAt)}</p>
                    </div>
                  </div>
                  {selectedKYC.kycInfo?.allowResubmission && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-sm font-medium text-yellow-800">
                        ✓ Resubmission Allowed
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        User can submit new KYC documents
                      </p>
                    </div>
                  )}
                </div>
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
                              Status: <span className="font-medium text-red-600">
                                {doc.status || 'rejected'}
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
             
              {/* Action Buttons */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowKYCModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                  <NavLink to={`/users/user-detail/${selectedKYC._id}`}>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                      View User Profile
                    </button>
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rejectedkyc;
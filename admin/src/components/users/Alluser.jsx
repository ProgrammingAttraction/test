import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiTrash2, FiStar, FiEdit2, FiMessageSquare } from 'react-icons/fi';
import { RiComputerLine } from "react-icons/ri";
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import { NavLink } from 'react-router-dom';
import axios from "axios";
import moment from "moment";
import Header from '../common/Header';
import toast, { Toaster } from "react-hot-toast";
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Alluser = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
 
  // State for users data and UI
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [bonusFilter, setBonusFilter] = useState('all');
  const [inactivityFilter, setInactivityFilter] = useState('all');
  const [depositFilter, setDepositFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [kycFilter, setKycFilter] = useState('all');
  const [referralFilter, setReferralFilter] = useState('all');
  const [bettingFilter, setBettingFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
 
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(50);
 
  // Confirmation modal states
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [banReason, setBanReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [permanentDelete, setPermanentDelete] = useState(false);

  // NEW: Rating and Notes modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);
  const [noteContent, setNoteContent] = useState('');
  const [userNotes, setUserNotes] = useState([]);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
 
  // Per page options
  const perPageOptions = [10, 20, 50, 100, 200];
 
  // Fetch users data with pagination and filters
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {
        page: currentPage,
        limit: usersPerPage,
      };

      // Add filters if not 'all'
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (balanceFilter !== 'all') params.balanceFilter = balanceFilter;
      if (bonusFilter !== 'all') params.bonusFilter = bonusFilter;
      if (inactivityFilter !== 'all') params.inactivityFilter = inactivityFilter;
      if (depositFilter !== 'all') params.depositFilter = depositFilter;
      if (verificationFilter !== 'all') params.verificationFilter = verificationFilter;
      if (kycFilter !== 'all') params.kycFilter = kycFilter;
      if (referralFilter !== 'all') params.referralFilter = referralFilter;
      if (bettingFilter !== 'all') params.bettingFilter = bettingFilter;
      if (ratingFilter !== 'all') params.ratingFilter = ratingFilter;
      if (dateFilter !== 'all') params.dateFilter = dateFilter;
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await axios.get(`${base_url}/admin/all-users`, {
        params,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      console.log('API Response:', response.data);
      setUsers(response.data.data);
      setTotalUsers(response.data.pagination.total);
      setTotalPages(response.data.pagination.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setLoading(false);
      toast.error("Failed to fetch users");
    }
  };
 
  // Fetch users when filters or pagination changes
  useEffect(() => {
    fetchUsers();
  }, [
    currentPage, usersPerPage, searchQuery, statusFilter, dateFilter,
    balanceFilter, bonusFilter, inactivityFilter, depositFilter,
    verificationFilter, kycFilter, referralFilter, bettingFilter, ratingFilter
  ]);

  // Reset to page 1 when filters change (except pagination filters)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchUsers();
    }
  }, [
    searchQuery, statusFilter, dateFilter, balanceFilter, bonusFilter,
    inactivityFilter, depositFilter, verificationFilter, kycFilter,
    referralFilter, bettingFilter, ratingFilter, startDate, endDate
  ]);
 
  // Status toggle component
  function StatusSwitch({ status, userId }) {
    const isActive = status === "active";
 
    if (status === "banned") {
      return <span className="text-red-600 font-medium">Banned</span>;
    }
 
    const handleToggle = () => {
      const newStat = isActive ? "inactive" : "active";
      setSelectedUser(userId);
      setNewStatus(newStat);
      setShowConfirmation(true);
    };
 
    return (
      <div className="flex items-center space-x-3 w-[130px]">
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={isActive}
            onChange={handleToggle}
          />
          <div
            className={`w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-[2px] flex items-center px-1 transition-all duration-300 cursor-pointer peer-checked:bg-green-500`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-[2px] shadow-md transform transition-all duration-300 ${
                isActive ? "translate-x-[20px]" : "translate-x-0"
              }`}
            ></div>
          </div>
        </label>
        <span className={`text-sm font-medium ${isActive ? "text-green-600" : "text-gray-500"}`}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
    );
  }

  // NEW: Star Rating Component
  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange(star)}
            disabled={readonly}
            className={`text-2xl ${
              star <= rating 
                ? 'text-yellow-500' 
                : 'text-gray-300'
            } ${!readonly ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  // NEW: Open Rating Modal
  const openRatingModal = (user) => {
    setSelectedUser(user);
    setCurrentRating(user.rating || 0);
    setShowRatingModal(true);
  };

  // NEW: Save Rating
  const saveRating = async () => {
    if (!selectedUser) return;

    setIsSavingRating(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/users/${selectedUser._id}/rate`,
        { rating: currentRating },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );

      if (response.data.success) {
        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === selectedUser._id ? { ...user, rating: currentRating } : user
          )
        );
        
        toast.success(`Rating set to ${currentRating} for ${selectedUser.username}`);
        setShowRatingModal(false);
        setSelectedUser(null);
        setCurrentRating(0);
      }
    } catch (error) {
      console.error("Error saving rating:", error);
      toast.error("Failed to save rating");
    } finally {
      setIsSavingRating(false);
    }
  };

  // NEW: Open Notes Modal
  const openNotesModal = async (user) => {
    setSelectedUser(user);
    setNoteContent('');
    setShowNotesModal(true);
    
    // Fetch existing notes
    try {
      const response = await axios.get(
        `${base_url}/admin/users/${user._id}/notes`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );
      if (response.data.success) {
        setUserNotes(response.data.data.notes || []);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      setUserNotes([]);
    }
  };

  // NEW: Save Note
  const saveNote = async () => {
    if (!selectedUser || !noteContent.trim()) {
      toast.error("Please enter note content");
      return;
    }

    setIsSavingNote(true);
    try {
      const response = await axios.post(
        `${base_url}/admin/users/${selectedUser._id}/notes`,
        { note: noteContent.trim() },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );

      if (response.data.success) {
        // Update local notes
        const newNote = response.data.data.note;
        setUserNotes(prevNotes => [newNote, ...prevNotes]);
        setNoteContent('');
        toast.success("Note added successfully");
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  // NEW: Delete Note
  const deleteNote = async (noteId) => {
    try {
      const response = await axios.delete(
        `${base_url}/admin/users/${selectedUser._id}/notes/${noteId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );

      if (response.data.success) {
        setUserNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
        toast.success("Note deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };
 
  // Handle status change confirmation
  const confirmStatusChange = async () => {
    if (!selectedUser) return;
   
    setIsUpdating(true);
    try {
      const response = await axios.put(
        `${base_url}/admin/users/${selectedUser}/status`,
        {
          status: newStatus,
          reason: newStatus === 'banned' ? banReason : undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );
      if (response.data.success) {
        // Update local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === selectedUser ? { ...user, status: newStatus } : user
          )
        );
       
        toast.success(`User status updated to ${newStatus}`);
        setShowConfirmation(false);
        setSelectedUser(null);
        setNewStatus('');
        setBanReason('');
        
        // Refresh the list
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    } finally {
      setIsUpdating(false);
    }
  };
 
  // Cancel status change
  const cancelStatusChange = () => {
    setShowConfirmation(false);
    setSelectedUser(null);
    setNewStatus('');
    setBanReason('');
  };
 
  // Handle delete button click
  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteReason('');
    setPermanentDelete(false);
    setShowDeleteConfirmation(true);
  };
 
  // Confirm user deletion
  const confirmDelete = async () => {
    if (!selectedUser || !deleteReason.trim()) {
      toast.error("Please provide a delete reason");
      return;
    }
   
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${base_url}/admin/users/${selectedUser._id}`,
        {
          data: {
            deleteReason: deleteReason.trim(),
            permanent: permanentDelete
          },
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );
      if (response.data.success) {
        toast.success(
          permanentDelete
            ? "User permanently deleted successfully"
            : "User account deactivated successfully"
        );
       
        setShowDeleteConfirmation(false);
        setSelectedUser(null);
        setDeleteReason('');
        setPermanentDelete(false);
        
        // Refresh the list
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete user";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };
 
  // Cancel delete operation
  const cancelDelete = () => {
    setShowDeleteConfirmation(false);
    setSelectedUser(null);
    setDeleteReason('');
    setPermanentDelete(false);
  };
 
  // Download users data as Excel
  const downloadUsersData = async () => {
    try {
      // Fetch all users without pagination for export
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (balanceFilter !== 'all') params.balanceFilter = balanceFilter;
      if (bonusFilter !== 'all') params.bonusFilter = bonusFilter;
      if (inactivityFilter !== 'all') params.inactivityFilter = inactivityFilter;
      if (depositFilter !== 'all') params.depositFilter = depositFilter;
      if (verificationFilter !== 'all') params.verificationFilter = verificationFilter;
      if (kycFilter !== 'all') params.kycFilter = kycFilter;
      if (referralFilter !== 'all') params.referralFilter = referralFilter;
      if (bettingFilter !== 'all') params.bettingFilter = bettingFilter;
      if (ratingFilter !== 'all') params.ratingFilter = ratingFilter;
      if (dateFilter !== 'all') params.dateFilter = dateFilter;
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await axios.get(`${base_url}/admin/all-users`, {
        params: { ...params, limit: 10000, page: 1 },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });

      const usersToExport = response.data.data;
      
      const data = usersToExport.map((user, index) => ({
        'S.No': index + 1,
        'User ID': user._id,
        'Player ID': user.player_id,
        'Username': user.username,
        'Email': user.email,
        'Phone': user.phone || user.mobile || 'N/A',
        'Status': user.status,
        'Rating': user.rating || 0,
        'Balance': user.balance || 0,
        'Total Deposit': user.total_deposit || 0,
        'Total Withdraw': user.total_withdraw || 0,
        'Total Bet': user.total_bet || 0,
        'Net Profit': user.net_profit || 0,
        'Referral Count': user.referralCount || 0,
        'Referral Earnings': user.referralEarnings || 0,
        'KYC Status': user.kycStatus || 'unverified',
        'Email Verified': user.isEmailVerified ? 'Yes' : 'No',
        'Phone Verified': user.isPhoneVerified ? 'Yes' : 'No',
        'Registration Date': moment(user.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        'Last Login': user.loginHistory && user.loginHistory.length > 0
          ? moment(user.loginHistory[user.loginHistory.length - 1].createdAt).format('YYYY-MM-DD HH:mm:ss')
          : 'Never'
      }));
     
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users Data");
     
      // Auto-size columns
      const colWidths = [
        { wch: 5 }, // S.No
        { wch: 25 }, // User ID
        { wch: 12 }, // Player ID
        { wch: 15 }, // Username
        { wch: 25 }, // Email
        { wch: 15 }, // Phone
        { wch: 10 }, // Status
        { wch: 8 },  // Rating
        { wch: 10 }, // Balance
        { wch: 12 }, // Total Deposit
        { wch: 13 }, // Total Withdraw
        { wch: 10 }, // Total Bet
        { wch: 12 }, // Net Profit
        { wch: 15 }, // Referral Count
        { wch: 18 }, // Referral Earnings
        { wch: 12 }, // KYC Status
        { wch: 15 }, // Email Verified
        { wch: 15 }, // Phone Verified
        { wch: 20 }, // Registration Date
        { wch: 20 } // Last Login
      ];
      ws['!cols'] = colWidths;
     
      XLSX.writeFile(wb, `users_data_${moment().format('YYYY-MM-DD_HH-mm')}.xlsx`);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };
 
  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDateFilter('all');
    setStartDate(null);
    setEndDate(null);
    setBalanceFilter('all');
    setBonusFilter('all');
    setInactivityFilter('all');
    setDepositFilter('all');
    setVerificationFilter('all');
    setKycFilter('all');
    setReferralFilter('all');
    setBettingFilter('all');
    setRatingFilter('all');
  };
 
  // Get filter summary
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchQuery) count++;
    if (statusFilter !== 'all') count++;
    if (dateFilter !== 'all') count++;
    if (balanceFilter !== 'all') count++;
    if (bonusFilter !== 'all') count++;
    if (inactivityFilter !== 'all') count++;
    if (depositFilter !== 'all') count++;
    if (verificationFilter !== 'all') count++;
    if (kycFilter !== 'all') count++;
    if (referralFilter !== 'all') count++;
    if (bettingFilter !== 'all') count++;
    if (ratingFilter !== 'all') count++;
    return count;
  };
 
  // Calculate showing range
  const getShowingRange = () => {
    const start = (currentPage - 1) * usersPerPage + 1;
    const end = Math.min(currentPage * usersPerPage, totalUsers);
    return { start, end };
  };

  const { start, end } = getShowingRange();
 
  // Handle users per page change
  const handleUsersPerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value);
    setUsersPerPage(newPerPage);
    setCurrentPage(1);
  };

  // Handle page change
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
 
  if (loading){
    return(
      <div className='flex justify-center items-center w-full h-full'>
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
        </div>
      </div>
    )
  };
 
if (error) return (
  <div className="max-w-md font-bai mx-auto my-8 p-8 bg-white rounded-2xl shadow-md border border-gray-100">
    <div className="flex flex-col items-center text-center space-y-6">
      {/* Avatar/Icon Container */}
      <div className="relative">
        <div className="w-20 h-20 bg-gradient-to-br from-red-50 to-pink-50 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367z" 
                  clipRule="evenodd"/>
          </svg>
        </div>
      </div>

      {/* Message Section */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-gray-900">User Not Found</h3>
        <p className="text-gray-600 text-lg">
          We couldn't find the user you're looking for.
        </p>
      </div>

      {/* Details Box */}
      <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Technical Details</span>
          </div>
          <span className="text-xs text-gray-500">Error Reference</span>
        </div>
        <p className="mt-2 text-sm text-gray-600 font-mono bg-white p-3 rounded-lg border">
          {error}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-medium rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all duration-200 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow"
        >
          Go Back
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Search Again
        </button>
      </div>

      {/* Help Text */}
      <p className="text-sm text-gray-500 pt-4 border-t border-gray-100">
        Check the username or ID and try again. If the problem persists, contact support.
      </p>
    </div>
  </div>
);
 
  return (
    <div className="w-full font-bai overflow-y-auto text-gray-700">
      <Header/>
      <Toaster position="top-right" />
      <section className="">
        <div className="">
          <div className="w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">All Users</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {totalUsers} users | Showing: {start}-{end} of {totalUsers}
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
                  placeholder="Search by username, email, phone, player ID..."
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
                    onClick={downloadUsersData}
                    className="px-4 py-2 bg-green-600 text-white rounded-[3px] hover:bg-green-700 text-sm"
                  >
                    Export Excel
                  </button>
                </div>
              </div>
             
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 text-gray-700">
                {/* Basic Filters */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
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
                  <label className="text-sm font-medium text-gray-700 mb-1">Balance</label>
                  <select
                    value={balanceFilter}
                    onChange={(e) => setBalanceFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All Balances</option>
                    <option value="0">৳0</option>
                    <option value="1-1000">৳1 - ৳1000</option>
                    <option value="1001-5000">৳1001 - ৳5000</option>
                    <option value="5000+">৳5000+</option>
                  </select>
                </div>

                {/* NEW: Rating Filter */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All Ratings</option>
                    <option value="0">Not Rated (0)</option>
                    <option value="1-2">1-2 Stars</option>
                    <option value="3-4">3-4 Stars</option>
                    <option value="5">5 Stars</option>
                    <option value="rated">Any Rating</option>
                  </select>
                </div>
               
                {/* NEW: Deposit Filter */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Deposit Status</label>
                  <select
                    value={depositFilter}
                    onChange={(e) => setDepositFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All Users</option>
                    <option value="never">Never Deposited</option>
                    <option value="first_time">First Time (No Deposit)</option>
                    <option value="has_deposited">Has Deposited</option>
                    <option value="multiple">Multiple Deposits</option>
                  </select>
                </div>
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Bonus Status</label>
                  <select
                    value={bonusFilter}
                    onChange={(e) => setBonusFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="eligible">Eligible</option>
                    <option value="claimed">Claimed</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
               
                {/* NEW: Verification Filter */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Verification</label>
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="email_verified">Email Verified</option>
                    <option value="phone_verified">Phone Verified</option>
                    <option value="both_verified">Both Verified</option>
                    <option value="none_verified">None Verified</option>
                  </select>
                </div>
               
                {/* NEW: Referral Filter */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Referral</label>
                  <select
                    value={referralFilter}
                    onChange={(e) => setReferralFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="has_referrals">Has Referrals</option>
                    <option value="no_referrals">No Referrals</option>
                    <option value="has_earnings">Has Earnings</option>
                    <option value="top_referrers">Top Referrers (5+)</option>
                  </select>
                </div>
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Inactivity</label>
                  <select
                    value={inactivityFilter}
                    onChange={(e) => setInactivityFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="never">Never Deposited</option>
                    <option value=">7">{'>'}7 days</option>
                    <option value=">30">{'>'}30 days</option>
                    <option value=">90">{'>'}90 days</option>
                    <option value=">180">{'>'}180 days</option>
                  </select>
                </div>
               
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">Users per page</label>
                  <select
                    value={usersPerPage}
                    onChange={handleUsersPerPageChange}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    {perPageOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
           
            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600 flex justify-between items-center">
              <span>
                Showing {start}-{end} of {totalUsers} users
              </span>
              {totalUsers > 0 && (
                <span className="text-xs bg-cyan-100 text-cyan-800 px-2 py-1 rounded">
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
           
            <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg">
              <table className="w-full border-collapse shadow-xl bg-white overflow-hidden">
                <thead>
                  <tr className="bg-cyan-600 text-white">
                    <th className="py-3 px-4 text-left">User</th>
                    <th className="py-3 px-4 text-left">Email-Mobile</th>
                    <th className="py-3 px-4 text-left">Rating</th>
                    <th className="py-3 px-4 text-left">Joined At</th>
                    <th className="py-3 px-4 text-left">Balance</th>
                    <th className="py-3 px-4 text-left">Deposit/Withdraw</th>
                    <th className="py-3 px-4 text-left">Referral</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <tr key={index} className="border-b even:bg-gray-50 hover:bg-gray-100 transition-colors">
                        <td className="py-3 px-4 text-gray-800">
                          <div className="font-semibold">{user?.player_id}</div>
                          <div className="text-sm text-gray-600">{user.username}</div>
                          {user.referralCode && (
                            <div className="text-xs text-gray-500 mt-1">
                              Ref: {user.referralCode}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <div className="font-medium">{user.email}</div>
                          <div className="text-sm text-gray-600">{user.phone || user.mobile || 'N/A'}</div>
                          <div className="flex space-x-2 mt-1">
                            {user.isEmailVerified && (
                              <span className="text-xs bg-green-100 text-green-800 px-1 rounded">Email✓</span>
                            )}
                            {user.isPhoneVerified && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Phone✓</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-start space-y-2">
                            <StarRating 
                              rating={user.rating || 0} 
                              readonly={true}
                            />
                            <div className="text-xs text-gray-500">
                              {user.rating ? `${user.rating}/5` : 'Not rated'}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <div className='font-[600] text-[14px]'>{moment(user?.createdAt).format("MMM Do YYYY")}</div>
                          <div className="text-sm text-gray-600">{moment(user?.createdAt).fromNow()}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-[600] text-cyan-700">৳{user?.balance || 0}</div>
                          {user.bonusBalance > 0 && (
                            <div className="text-xs text-green-600">Bonus: ৳{user.bonusBalance}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="text-green-600">Dep: ৳{user.total_deposit || 0}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div>Refs: {user.referralCount || 0}</div>
                            <div className="text-green-600">Earn: ৳{user.referralEarnings || 0}</div>
                          </div>
                          {user.kycStatus && user.kycStatus !== 'unverified' && (
                            <div className={`text-xs mt-1 px-1 rounded ${
                              user.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                              user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              KYC: {user.kycStatus}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <StatusSwitch
                            status={user.status}
                            userId={user._id}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col space-y-2">
                            <NavLink to={`/users/${user.status === "active" ? "user-detail" : "banned-user-detail"}/${user._id}`}>
                              <button className="flex items-center justify-center border-[1px] border-blue-500 px-[10px] py-[6px] rounded-[5px] text-blue-500 hover:text-blue-600 hover:bg-blue-50 w-full text-sm">
                                <RiComputerLine className="mr-1" /> Details
                              </button>
                            </NavLink>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => openRatingModal(user)}
                                className="flex items-center justify-center border-[1px] border-yellow-500 px-2 py-[6px] rounded-[5px] text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 transition-colors text-sm"
                                title="Rate User"
                              >
                                <FiStar className="mr-1" /> Rate
                              </button>
                              <button
                                onClick={() => openNotesModal(user)}
                                className="flex items-center justify-center border-[1px] border-purple-500 px-2 py-[6px] rounded-[5px] text-purple-500 hover:text-purple-600 hover:bg-purple-50 transition-colors text-sm"
                                title="Add Note"
                              >
                                <FiMessageSquare className="mr-1" /> Notes
                              </button>
                            </div>
                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="flex items-center justify-center border-[1px] border-red-500 px-[10px] py-[6px] rounded-[5px] text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full text-sm"
                              title="Delete User"
                            >
                              <FiTrash2 className="mr-1" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <FiSearch className="text-4xl text-gray-300 mb-2" />
                          <p className="text-lg">No users found matching your criteria</p>
                          <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
                          <button
                            onClick={resetAllFilters}
                            className="mt-3 px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm"
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
            {totalUsers > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalUsers} total users)
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-[2px] border-[1px] border-gray-200 ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-cyan-500 text-white hover:bg-cyan-600'}`}
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
                        className={`px-3 py-1 rounded-[2px] ${currentPage === pageNum ? 'bg-cyan-600 text-white' : 'bg-cyan-500 text-white hover:bg-cyan-600'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                 
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-[2px] border-[1px] border-gray-200 ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-cyan-500 text-white hover:bg-cyan-600'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* NEW: Rating Modal */}
      {showRatingModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Rate User</h3>
              <button
                onClick={() => setShowRatingModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isSavingRating}
              >
                <FiX size={24} />
              </button>
            </div>
           
            <div className="text-center mb-6">
              <p className="text-gray-600 mb-4">
                Rate <span className="font-semibold">{selectedUser.username}</span>
              </p>
              <StarRating 
                rating={currentRating} 
                onRatingChange={setCurrentRating}
              />
              <p className="text-sm text-gray-500 mt-2">
                {currentRating === 0 ? 'Select a rating' : `${currentRating} out of 5 stars`}
              </p>
            </div>
           
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRatingModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isSavingRating}
              >
                Cancel
              </button>
              <button
                onClick={saveRating}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center"
                disabled={isSavingRating || currentRating === 0}
              >
                {isSavingRating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Rating'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Notes Modal */}
      {showNotesModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Notes for {selectedUser.username}
              </h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
           
            {/* Add New Note */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add New Note
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter your note here..."
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={saveNote}
                  disabled={isSavingNote || !noteContent.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {isSavingNote ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    'Add Note'
                  )}
                </button>
              </div>
            </div>
           
            {/* Existing Notes */}
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-3">
                Previous Notes ({userNotes.length})
              </h4>
              {userNotes.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {userNotes.map((note) => (
                    <div key={note._id} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {note.createdBy || 'Admin'}
                        </span>
                        <div className="flex space-x-2">
                          <span className="text-xs text-gray-500">
                            {moment(note.createdAt).format('MMM D, YYYY h:mm A')}
                          </span>
                          <button
                            onClick={() => deleteNote(note._id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Delete Note"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{note.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No notes yet</p>
              )}
            </div>
          </div>
        </div>
      )}
 
      {/* Status Change Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Confirm Status Change</h3>
              <button
                onClick={cancelStatusChange}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUpdating}
              >
                <FiX size={24} />
              </button>
            </div>
           
            <p className="text-gray-600 mb-4">
              Are you sure you want to change this user's status to <span className="font-semibold">{newStatus}</span>?
            </p>
           
            {newStatus === 'banned' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for banning</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason for banning"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
           
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelStatusChange}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors flex items-center"
                disabled={isUpdating || (newStatus === 'banned' && !banReason.trim())}
              >
                {isUpdating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Confirm Change'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-red-600">Delete User Account</h3>
              <button
                onClick={cancelDelete}
                className="text-gray-500 hover:text-gray-700"
                disabled={isDeleting}
              >
                <FiX size={24} />
              </button>
            </div>
           
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 font-medium mb-2">Warning: This action cannot be undone!</p>
              <p className="text-sm text-red-600">
                You are about to delete user: <span className="font-semibold">{selectedUser.username}</span> ({selectedUser.email})
              </p>
            </div>
           
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delete Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Please provide a reason for deleting this user account..."
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
           
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={permanentDelete}
                  onChange={(e) => setPermanentDelete(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Permanent deletion (cannot be restored)
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                {permanentDelete
                  ? "All user data including transactions, history, and records will be permanently deleted."
                  : "User account will be deactivated but data will be preserved."
                }
              </p>
            </div>
           
            {selectedUser.balance > 0 && (
              <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-700 text-sm">
                  <span className="font-semibold">Note:</span> This user has a balance of ৳{selectedUser.balance}.
                  Consider processing any pending withdrawals before deletion.
                </p>
              </div>
            )}
           
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={isDeleting || !deleteReason.trim()}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" />
                    {permanentDelete ? 'Permanently Delete' : 'Deactivate Account'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Alluser;
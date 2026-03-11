import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { RiComputerLine } from "react-icons/ri";
import { NavLink } from 'react-router-dom';
import axios from "axios";
import moment from "moment";
import Header from '../common/Header';

const Inactiveuser = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  
  // State for users data and UI
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [balanceFilter, setBalanceFilter] = useState('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(50);
  
  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch banned users data
  const fetchBannedUsers = async () => {
    try {
      const response = await axios.get(`${base_url}/admin/banned-users`,{  
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });
      setUsers(response.data.data);
      setFilteredUsers(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBannedUsers();
  }, []);
  
  // Apply filters whenever search or filter criteria change
  useEffect(() => {
    let result = users;
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.mobile?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         user.player_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = moment();
      result = result.filter(user => {
        const userDate = moment(user.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return userDate.isSame(now, 'day');
          case 'week':
            return userDate.isSame(now, 'week');
          case 'month':
            return userDate.isSame(now, 'month');
          case 'year':
            return userDate.isSame(now, 'year');
          default:
            return true;
        }
      });
    }
    
    // Apply balance filter
    if (balanceFilter !== 'all') {
      result = result.filter(user => {
        const balance = user.balance || 0;
        
        switch (balanceFilter) {
          case '0':
            return balance === 0;
          case '1-1000':
            return balance > 0 && balance <= 1000;
          case '1001-5000':
            return balance > 1000 && balance <= 5000;
          case '5000+':
            return balance > 5000;
          default:
            return true;
        }
      });
    }
    
    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, dateFilter, balanceFilter, users]);
  
  // Status toggle component
  function StatusSwitch({ status, userId, onStatusChange }) {
    const [isActive, setIsActive] = useState(status === "active");
  
    const handleToggle = () => {
      const newStatus = isActive ? "inactive" : "active";
      setSelectedUser(userId);
      setNewStatus(newStatus);
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
  
  // Handle status change confirmation
  const confirmStatusChange = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true);
    try {
      await axios.put(
        `${base_url}/admin/users/${selectedUser}/status`, 
        { status: newStatus },
        {  
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );
      
      // Update local state to reflect the change without refetching
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUser ? { ...user, status: newStatus } : user
        )
      );
      
      setShowConfirmation(false);
      setSelectedUser(null);
      setNewStatus('');
    } catch (err) {
      console.error("Error updating user status:", err);
      alert("Failed to update user status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Cancel status change
  const cancelStatusChange = () => {
    setShowConfirmation(false);
    setSelectedUser(null);
    setNewStatus('');
  };
  
  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
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
  
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  
  return (
    <div className="w-full font-bai overflow-y-auto">
      <Header/>
      <section className="">
        <div className="">
          <div className="w-full p-4">
            <div className="flex justify-between items-center ">
              <h1 className="text-2xl font-semibold text-orange-600 mb-6">Inactive Users</h1>
              
              <div className="relative w-[30%]">
                <input
                  type="text"
                  placeholder="Search by username, email, phone or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            {/* Filter controls */}
            <div className="flex flex-wrap gap-4 mb-6 text-gray-700">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Join Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-1">Balance</label>
                <select
                  value={balanceFilter}
                  onChange={(e) => setBalanceFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Balances</option>
                  <option value="0">৳0</option>
                  <option value="1-1000">৳1 - ৳1000</option>
                  <option value="1001-5000">৳1001 - ৳5000</option>
                  <option value="5000+">৳5000+</option>
                </select>
              </div>
              
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setDateFilter('all');
                  setBalanceFilter('all');
                }}
                className="self-end ml-2 px-4 py-2 bg-cyan-600 text-white rounded-[5px] hover:bg-cyan-700"
              >
                Reset Filters
              </button>
            </div>
            
            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} banned users
            </div>
            
            <div className="overflow-x-auto border-[1px] border-gray-200">
              <table className="w-full border-collapse shadow-xl bg-white border-[1px] border-[#eee] overflow-hidden">
                <thead>
                  <tr className="bg-cyan-600 text-white">
                    <th className="py-3 px-4 text-left">User</th>
                    <th className="py-3 px-4 text-left">Email-Mobile</th>
                    <th className="py-3 px-4 text-left">Joined At</th>
                    <th className="py-3 px-4 text-left">Balance</th>
                    <th className="py-3 px-4 text-left">Total Bet</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => (
                      <tr key={index} className="border-b even:bg-gray-50">
                        <td className="py-3 px-4 text-gray-800">
                              <strong>{user?.player_id}</strong>
                          <br />
                          <span className="text-gray-600">{user.username}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <span>{user.email}</span>
                          <br />
                          <span className="text-gray-600">{user.mobile}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <span className='font-[600] text-[14px]'>{moment(user?.createdAt).format("MMMM Do YYYY, h:mm A")}</span>
                          <br />
                          <span className="text-gray-600">{moment(user?.createdAt).fromNow()}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-800 font-[600]">৳{user?.balance || 0}</td>
                        <td className="py-3 px-4 text-gray-800 font-[600]">৳{user?.lifetime_bet || 0}</td>
                        <td className="py-3 px-4">
                          <StatusSwitch
                            status={user.status}
                            userId={user._id}
                            onStatusChange={() => {}}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <NavLink to={`/users/user-detail/${user._id}`}>
                            <button className="flex items-center border-[1px] border-blue-500 px-[10px] py-[4px] rounded-[5px] text-blue-500 hover:text-blue-600">
                              <RiComputerLine className="mr-1" /> Details
                            </button>
                          </NavLink>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-4 text-center text-gray-500">
                        No banned users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
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

      {/* Confirmation Modal */}
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
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to change this user's status to <span className="font-semibold">{newStatus}</span>?
            </p>
            
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
                disabled={isUpdating}
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
    </div>
  );
};

export default Inactiveuser;
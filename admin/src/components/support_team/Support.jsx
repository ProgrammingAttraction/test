import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiTrash2, FiEdit2, FiEye, FiEyeOff, FiKey, FiUser, FiMail, FiLock } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import axios from "axios";
import moment from "moment";
import Header from '../common/Header';
import toast, { Toaster } from "react-hot-toast";

const Support = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
 
  // State for supports data
  const [supports, setSupports] = useState([]);
  const [filteredSupports, setFilteredSupports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // Form states for creating/editing support
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingId, setEditingId] = useState(null);
 
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
 
  // Confirmation modal states
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
 
  // Loading states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
 
  // Fetch supports data
  const fetchSupports = async () => {
    try {
      const response = await axios.get(`${base_url}/admin/all-supports`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
        }
      });
      setSupports(response.data.data);
      setFilteredSupports(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchSupports();
  }, []);
 
  // Apply filters
  useEffect(() => {
    let result = supports;
   
    // Apply search filter
    if (searchQuery) {
      result = result.filter(support =>
        support._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        support.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        support.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
   
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(support => support.status === statusFilter);
    }
   
    setFilteredSupports(result);
  }, [searchQuery, statusFilter, supports]);
 
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
 
  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setEditingId(null);
  };
 
  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
   
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
   
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
   
    // Password validation (only for new support)
    if (!editingId) {
      if (!formData.password) {
        toast.error("Password is required");
        return false;
      }
     
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return false;
      }
     
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }
    }
   
    return true;
  };
 
  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    if (!validateForm()) return;
   
    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update existing support
        const response = await axios.put(
          `${base_url}/admin/support/${editingId}`,
          {
            name: formData.name,
            email: formData.email,
            status: 'active'
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
            }
          }
        );
       
        if (response.data.success) {
          // Update local state
          setSupports(prevSupports =>
            prevSupports.map(support =>
              support._id === editingId ? response.data.data : support
            )
          );
          toast.success("Support account updated successfully");
          resetForm();
        }
      } else {
        // Create new support
        const response = await axios.post(
          `${base_url}/admin/create-support`,
          {
            name: formData.name,
            email: formData.email,
            password: formData.password
          },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
            }
          }
        );
       
        if (response.data.success) {
          // Add to local state
          setSupports(prevSupports => [response.data.data, ...prevSupports]);
          toast.success("Support account created successfully");
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error saving support:", error);
      const errorMessage = error.response?.data?.message || 
        (editingId ? "Failed to update support" : "Failed to create support");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
 
  // Handle edit button click
  const handleEditClick = (support) => {
    setFormData({
      name: support.name,
      email: support.email,
      password: '',
      confirmPassword: ''
    });
    setEditingId(support._id);
   
    // Scroll to form
    document.getElementById('supportForm').scrollIntoView({ behavior: 'smooth' });
  };
 
  // Handle delete button click
  const handleDeleteClick = (support) => {
    setSelectedSupport(support);
    setShowDeleteConfirmation(true);
  };
 
  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedSupport) return;
   
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${base_url}/admin/support/${selectedSupport._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );
     
      if (response.data.success) {
        // Remove from local state
        setSupports(prevSupports => 
          prevSupports.filter(support => support._id !== selectedSupport._id)
        );
        toast.success("Support account deleted successfully");
        setShowDeleteConfirmation(false);
        setSelectedSupport(null);
      }
    } catch (error) {
      console.error("Error deleting support:", error);
      toast.error("Failed to delete support account");
    } finally {
      setIsDeleting(false);
    }
  };
 
  // Open password update modal
  const openPasswordModal = (support) => {
    setSelectedSupport(support);
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPasswordModal(true);
  };
 
  // Update password
  const updatePassword = async () => {
    if (!selectedSupport) return;
   
    if (!newPassword.trim()) {
      toast.error("New password is required");
      return;
    }
   
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
   
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
   
    setIsUpdatingPassword(true);
    try {
      const response = await axios.put(
        `${base_url}/admin/support/${selectedSupport._id}/password`,
        {
          newPassword: newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );
     
      if (response.data.success) {
        toast.success("Password updated successfully");
        setShowPasswordModal(false);
        setSelectedSupport(null);
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };
 
  // Toggle support status
  const toggleStatus = async (supportId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
   
    try {
      const response = await axios.put(
        `${base_url}/admin/support/${supportId}/status`,
        {
          status: newStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('genzz_token')}`
          }
        }
      );
     
      if (response.data.success) {
        // Update local state
        setSupports(prevSupports =>
          prevSupports.map(support =>
            support._id === supportId ? response.data.data : support
          )
        );
       
        toast.success(`Support account ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };
 
  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
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
      <Header/>
      <Toaster position="top-right" />
     
      <section className="">
        <div className="">
          <div className="w-full p-4">
            {/* Page Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">Support Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Total: {supports.length} support accounts | Active: {supports.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
           
            {/* Create/Edit Support Form */}
            <div id="supportForm" className="mb-8 bg-white p-6 rounded-lg border-[1px] border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {editingId ? 'Edit Support Account' : 'Create New Support Account'}
              </h2>
             
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>
                 
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>
                 
                  {/* Password Field (only for new support) */}
                  {!editingId && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password <span className="text-red-500">*</span>
                          <span className="text-xs text-gray-500 ml-1">(min. 6 characters)</span>
                        </label>
                        <div className="relative">
                          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter password"
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                      </div>
                     
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            placeholder="Confirm password"
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
               
                <div className="flex justify-end space-x-3 pt-4">
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                      disabled={isSubmitting}
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white mr-2"></div>
                        {editingId ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingId ? 'Update Support' : 'Create Support'
                    )}
                  </button>
                </div>
              </form>
            </div>
           
            {/* Search and Filter Section */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="relative w-full md:w-1/3">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                </div>
               
                <div className="flex items-center space-x-4 w-full md:w-auto">
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
                    </select>
                  </div>
                 
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm mt-6"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
           
            {/* Results count */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredSupports.length} of {supports.length} support accounts
            </div>
           
            {/* Supports Table */}
            <div className="overflow-x-auto border-[1px] border-gray-200 rounded-lg">
              <table className="w-full border-collapse shadow-xl bg-white overflow-hidden">
                <thead>
                  <tr className="bg-cyan-600 text-white">
                    <th className="py-3 px-4 text-left">Name</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Created At</th>
                    <th className="py-3 px-4 text-left">Last Updated</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSupports.length > 0 ? (
                    filteredSupports.map((support, index) => (
                      <tr key={index} className="border-b even:bg-gray-50 hover:bg-gray-100 transition-colors">
                        <td className="py-3 px-4 text-gray-800">
                          <div className="font-semibold">{support.name}</div>
                          <div className="text-xs text-gray-500">ID: {support._id.substring(0, 8)}...</div>
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <div className="font-medium">{support.email}</div>
                          {support.is_admin && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded mt-1 inline-block">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleStatus(support._id, support.status)}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              support.status === 'active'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {support.status === 'active' ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <div className="text-sm">
                            {moment(support.createdAt).format("MMM Do YYYY")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {moment(support.createdAt).fromNow()}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-800">
                          <div className="text-sm">
                            {moment(support.updatedAt).format("MMM Do YYYY")}
                          </div>
                          <div className="text-xs text-gray-600">
                            {moment(support.updatedAt).fromNow()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(support)}
                              className="p-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 transition-colors"
                              title="Edit Support"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => openPasswordModal(support)}
                              className="p-2 border border-green-500 text-green-500 rounded-md hover:bg-green-50 transition-colors"
                              title="Change Password"
                            >
                              <FiKey size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(support)}
                              className="p-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete Support"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <FiSearch className="text-4xl text-gray-300 mb-2" />
                          <p className="text-lg">No support accounts found</p>
                          <p className="text-sm mt-1">Try adjusting your filters or create a new support account</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && selectedSupport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-red-600">Delete Support Account</h3>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isDeleting}
              >
                <FiX size={24} />
              </button>
            </div>
           
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 font-medium mb-2">Warning: This action cannot be undone!</p>
              <p className="text-sm text-red-600">
                You are about to delete support account: <span className="font-semibold">{selectedSupport.name}</span> ({selectedSupport.email})
              </p>
            </div>
           
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="mr-2" />
                    Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {showPasswordModal && selectedSupport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isUpdatingPassword}
              >
                <FiX size={24} />
              </button>
            </div>
           
            <p className="text-gray-600 mb-4">
              Update password for <span className="font-semibold">{selectedSupport.name}</span>
            </p>
           
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-1">(min. 6 characters)</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>
           
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isUpdatingPassword}
              >
                Cancel
              </button>
              <button
                onClick={updatePassword}
                className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition-colors flex items-center"
                disabled={isUpdatingPassword || !newPassword || !confirmNewPassword}
              >
                {isUpdatingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;
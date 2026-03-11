import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import Header from '../common/Header';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Categorylist = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    categoryId: null,
    categoryName: ''
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/admin/categories`, {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm
          }
        });
        setCategories(response.data.data);
        setTotalItems(response.data.total || response.data.length);
      } catch (error) {
        toast.error('Failed to fetch categories');
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [base_url, currentPage, itemsPerPage, searchTerm]);

  // Open delete confirmation modal
  const openDeleteModal = (id, name) => {
    setDeleteModal({
      isOpen: true,
      categoryId: id,
      categoryName: name
    });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      categoryId: null,
      categoryName: ''
    });
  };

  // Handle category deletion
  const handleDelete = async () => {
    try {
      await axios.delete(`${base_url}/admin/categories/${deleteModal.categoryId}`, {
        headers: {
          "Content-Type": "multipart/form-data",
          'Authorization': localStorage.getItem('genzz_token')
        },
      });
      toast.success('Category deleted successfully');
      setCategories(categories.filter(category => category._id !== deleteModal.categoryId));
      closeDeleteModal();
    } catch (error) {
      toast.error('Failed to delete category');
      console.error('Error deleting category:', error);
    }
  };

  // Handle toggle active status
  const toggleStatus = async (id, currentStatus) => {
    try {
      const response = await axios.put(`${base_url}/admin/categories/${id}/status`, {
        isActive: !currentStatus
      });
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}`);
      setCategories(categories.map(category => 
        category._id === id ? { ...category, isActive: !currentStatus } : category
      ));
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Error updating status:', error);
    }
  };

  // Pagination functions
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Calculate visible page numbers
  const getPageNumbers = () => {
    const maxVisiblePages = 5;
    const pages = [];
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      if (startPage > 1) pages.push(1);
      if (startPage > 2) pages.push('...');
      
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      
      if (endPage < totalPages - 1) pages.push('...');
      if (endPage < totalPages) pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="w-full font-bai min-h-screen bg-gray-50">
      <Header />
      <Toaster position="top-right" />
      
      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              <button 
                onClick={closeDeleteModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={24} />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the category "{deleteModal.categoryName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <section className="p-4 md:p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header with Search and Add Button */}
          <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
              <p className="text-sm text-gray-500 mt-1">Manage your game categories</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Search Input */}
              <div className="relative flex-grow sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              
              {/* Add New Button */}
              <NavLink
                to="/game-api/new-category"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <FaPlus className="mr-2" size={14} />
                Add New
              </NavLink>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 flex justify-center">
               <div className="flex justify-center items-center h-64">
  <div className="relative">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
    <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
  </div>
</div>
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiEye className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No categories found</h3>
                <p className="text-gray-500">Create your first category to get started</p>
                <NavLink
                  to="/game-api/new-category"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaPlus className="mr-2" size={14} />
                  Add New Category
                </NavLink>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                          <img
                            className="h-full w-full object-cover"
                            src={`${base_url}/${category.imageUrl}`}
                            alt={category.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/40';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          onClick={() => toggleStatus(category._id, category.isActive)}
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                            category.isActive
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(category.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => openDeleteModal(category._id, category.name)}
                         className="text-white bg-red-500 px-[10px] py-[5px] rounded-[3px]  flex items-center space-x-1 gap-2"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {categories.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 sm:px-6 bg-gray-50 rounded-b-xl">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? goToPage(page) : null}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } ${
                          typeof page !== 'number' ? 'pointer-events-none' : ''
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <FiChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Categorylist;
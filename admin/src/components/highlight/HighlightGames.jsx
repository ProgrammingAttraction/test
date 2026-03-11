import React, { useState, useEffect } from 'react';
import { FaCheck, FaHeart, FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../common/Header';
import * as XLSX from 'xlsx';
import Select from 'react-select';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const HighlightGames = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    gameId: '',
    categories: [],
    imageUrl: '',
    isFeatured: false,
    status: 'active',
    displayOrder: 0
  });

  // Table state
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalGames: 0,
    activeGames: 0,
    featuredGames: 0
  });

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Bulk upload states
  const [parsedGames, setParsedGames] = useState([]);
  const [importStatus, setImportStatus] = useState({
    total: 0,
    processed: 0,
    added: 0,
    skipped: 0,
    errors: 0,
    details: []
  });
  const [isImporting, setIsImporting] = useState(false);
  const [showImportDetails, setShowImportDetails] = useState(false);

  // Toast configurations
  const showSuccessToast = (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '500',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      icon: '✅',
    });
  };

  const showErrorToast = (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '500',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      icon: '❌',
    });
  };

  const showInfoToast = (message) => {
    toast(message, {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '500',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      icon: 'ℹ️',
    });
  };

  const showWarningToast = (message) => {
    toast(message, {
      duration: 4000,
      position: 'top-center',
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '500',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      icon: '⚠️',
    });
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get(`${base_url}/admin/categories`);
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        showErrorToast('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [base_url]);

  // Fetch providers
  const fetchProviders = () => {
    axios
      .get(`${base_url}/admin/providers`)
      .then((res) => {
        setProviders(res.data);
      })
      .catch((err) => {
        console.error(err);
        showErrorToast('Failed to load providers');
      });
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // Fetch highlight games
  const fetchHighlightGames = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${base_url}/admin/highlight-games`, {
        params: {
          page: currentPage,
          limit: itemsPerPage * 2,
        }
      });
      
      if (response.data.success) {
        setGames(response.data.data);
        applyFilters(response.data.data, searchTerm, statusFilter, providerFilter, featuredFilter);
        fetchStats();
      }
    } catch (error) {
      console.error('Error fetching highlight games:', error);
      showErrorToast('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(`${base_url}/admin/highlight-games/stats`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchHighlightGames();
  }, []);

  // Apply filters
  const applyFilters = (gamesList, search, status, provider, featured) => {
    let filtered = [...gamesList];

    if (search) {
      filtered = filtered.filter(game => 
        game.name?.toLowerCase().includes(search.toLowerCase()) ||
        game.provider?.toLowerCase().includes(search.toLowerCase()) ||
        game.gameId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(game => game.status === status);
    }

    if (provider !== 'all') {
      filtered = filtered.filter(game => game.provider === provider);
    }

    if (featured !== 'all') {
      filtered = filtered.filter(game => game.isFeatured === (featured === 'true'));
    }

    setFilteredGames(filtered);
    setCurrentPage(1);
  };

  // Handle filter changes
  useEffect(() => {
    applyFilters(games, searchTerm, statusFilter, providerFilter, featuredFilter);
  }, [searchTerm, statusFilter, providerFilter, featuredFilter, games]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGames.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCategoriesChange = (selectedOptions) => {
    setFormData({
      ...formData,
      categories: selectedOptions ? selectedOptions.map(option => option.value) : []
    });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) {
      errors.name = 'Game name is required';
    }
    if (!formData.provider?.trim()) {
      errors.provider = 'Provider name is required';
    }
    if (!formData.gameId?.trim()) {
      errors.gameId = 'Game ID is required';
    }
    if (!formData.categories || formData.categories.length === 0) {
      errors.categories = 'At least one category is required';
    }
    if (!formData.imageUrl?.trim()) {
      errors.imageUrl = 'Image URL is required';
    } else if (!isValidUrl(formData.imageUrl)) {
      errors.imageUrl = 'Please enter a valid URL';
    }
    return errors;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showErrorToast('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (editingId) {
        await axios.put(`${base_url}/admin/highlight-games/${editingId}`, {
          name: formData.name,
          provider: formData.provider,
          gameId: formData.gameId,
          categories: formData.categories,
          imageUrl: formData.imageUrl,
          isFeatured: formData.isFeatured,
          status: formData.status,
          displayOrder: formData.displayOrder
        });

        showSuccessToast('Game updated successfully!');
      } else {
        await axios.post(`${base_url}/admin/highlight-games`, {
          name: formData.name,
          provider: formData.provider,
          gameId: formData.gameId,
          categories: formData.categories,
          imageUrl: formData.imageUrl,
          isFeatured: formData.isFeatured,
          status: formData.status,
          displayOrder: formData.displayOrder
        });

        showSuccessToast('Game added successfully!');
      }

      setFormData({
        name: '',
        provider: '',
        gameId: '',
        categories: [],
        imageUrl: '',
        isFeatured: false,
        status: 'active',
        displayOrder: 0
      });
      setEditingId(null);
      setErrors({});
      fetchHighlightGames();
    } catch (error) {
      console.error('Error saving game:', error);
      
      let errorMessage = editingId ? 'Failed to update game' : 'Failed to add game';
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data.message || 'Validation error';
        } else if (error.response.status === 409) {
          errorMessage = 'Game with this ID already exists';
        }
      }

      showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (game) => {
    setFormData({
      name: game.name || '',
      provider: game.provider || '',
      gameId: game.gameId || '',
      categories: game.categories || [],
      imageUrl: game.imageUrl || '',
      isFeatured: game.isFeatured || false,
      status: game.status || 'active',
      displayOrder: game.displayOrder || 0
    });
    setEditingId(game._id);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showInfoToast('Editing game: ' + game.name);
  };

  const handleDelete = (id, name) => {
    confirmAlert({
      title: 'Confirm to delete',
      message: `Are you sure you want to delete "${name}"?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await axios.delete(`${base_url}/admin/highlight-games/${id}`);
              showSuccessToast('Game deleted successfully!');
              fetchHighlightGames();
            } catch (error) {
              console.error('Error deleting game:', error);
              showErrorToast('Failed to delete game');
            }
          }
        },
        {
          label: 'No',
          onClick: () => {}
        }
      ]
    });
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      await axios.put(`${base_url}/admin/highlight-games/${id}/status`, { status: newStatus });
      showSuccessToast(`Game ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      fetchHighlightGames();
    } catch (error) {
      console.error('Error toggling status:', error);
      showErrorToast('Failed to update status');
    }
  };

  const handleFeaturedToggle = async (id, currentFeatured) => {
    try {
      await axios.put(`${base_url}/admin/highlight-games/${id}/feature`, { 
        isFeatured: !currentFeatured 
      });
      
      showSuccessToast(`Game ${!currentFeatured ? 'featured' : 'unfeatured'} successfully!`);
      fetchHighlightGames();
    } catch (error) {
      console.error('Error toggling featured:', error);
      showErrorToast('Failed to update featured status');
    }
  };

  const handleDisplayOrderChange = async (id, newOrder) => {
    try {
      await axios.put(`${base_url}/admin/highlight-games/${id}`, { 
        displayOrder: newOrder 
      });
      
      fetchHighlightGames();
    } catch (error) {
      console.error('Error updating display order:', error);
      showErrorToast('Failed to update display order');
    }
  };

  const handleReorder = async (id, direction) => {
    const currentGame = games.find(g => g._id === id);
    if (!currentGame) return;

    const sortedGames = [...games].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const currentIndex = sortedGames.findIndex(g => g._id === id);
    
    try {
      if (direction === 'up' && currentIndex > 0) {
        const prevGame = sortedGames[currentIndex - 1];
        await handleDisplayOrderChange(id, prevGame.displayOrder - 1);
        await handleDisplayOrderChange(prevGame._id, prevGame.displayOrder + 1);
        showSuccessToast('Game moved up');
      } else if (direction === 'down' && currentIndex < sortedGames.length - 1) {
        const nextGame = sortedGames[currentIndex + 1];
        await handleDisplayOrderChange(id, nextGame.displayOrder + 1);
        await handleDisplayOrderChange(nextGame._id, nextGame.displayOrder - 1);
        showSuccessToast('Game moved down');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      showErrorToast('Failed to reorder games');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setProviderFilter('all');
    setFeaturedFilter('all');
    setCurrentPage(1);
    showInfoToast('Filters cleared');
  };

  // Handle Excel file change and parsing
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const games = data.slice(1).map((row) => ({
          name: row[0]?.toString().trim(),
          provider: row[1]?.toString().trim(),
          gameId: row[2]?.toString().trim(),
          categories: row[3]?.toString().split(',').map(cat => cat.trim()).filter(cat => cat),
          imageUrl: row[4]?.toString().trim(),
          isFeatured: row[5]?.toString().toLowerCase() === 'yes' || row[5]?.toString().toLowerCase() === 'true',
          status: row[6]?.toString().toLowerCase() === 'active' ? 'active' : 'inactive',
          displayOrder: parseInt(row[7]) || 0
        })).filter((game) => 
          game.name && 
          game.provider && 
          game.gameId && 
          game.categories.length > 0 && 
          game.imageUrl && 
          isValidUrl(game.imageUrl)
        );

        setParsedGames(games);
        setImportStatus({
          total: games.length,
          processed: 0,
          added: 0,
          skipped: 0,
          errors: 0,
          details: []
        });

        if (games.length === 0) {
          showWarningToast('No valid games found in the Excel file');
        } else {
          showSuccessToast(`Parsed ${games.length} valid games from the file`);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        showErrorToast('Failed to parse Excel file');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Start importing games
  const startImport = async () => {
    if (parsedGames.length === 0) {
      showWarningToast('No games to import');
      return;
    }

    setIsImporting(true);
    setImportStatus(prev => ({ ...prev, processed: 0, added: 0, skipped: 0, errors: 0, details: [] }));

    try {
      const response = await axios.post(`${base_url}/admin/highlight-games/bulk-upload`, { 
        games: parsedGames 
      });
      
      if (response.data.success) {
        const { results } = response.data;
        setImportStatus(results);
        
        if (results.errors === 0) {
          showSuccessToast(`Import completed! Added: ${results.added}, Skipped: ${results.skipped}`);
        } else {
          showWarningToast(`Import completed with errors. Added: ${results.added}, Skipped: ${results.skipped}, Errors: ${results.errors}`);
        }
        
        fetchHighlightGames();
      }
    } catch (error) {
      console.error('Error in bulk upload:', error);
      showErrorToast('Error during bulk upload');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="w-full font-bai bg-gray-100 min-h-screen text-gray-700">
      <Header />
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            maxWidth: '500px',
            padding: '16px 24px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
            icon: '✅',
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            icon: '❌',
          },
        }}
      />
      
      <div className="p-4 w-full mx-auto ">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Games</p>
                <h3 className="text-3xl font-bold text-gray-800">{stats.totalGames}</h3>
              </div>
              <div className="bg-teal-100 p-3 rounded-full">
                <FaHeart className="text-teal-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Games</p>
                <h3 className="text-3xl font-bold text-green-600">{stats.activeGames}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaCheck className="text-green-600 text-xl" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Featured Games</p>
                <h3 className="text-3xl font-bold text-yellow-600">{stats.featuredGames}</h3>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaStar className="text-yellow-600 text-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? 'Edit Highlight Game' : 'Add New Highlight Game'}
          </h1>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Game Name */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Game Name *
                </label>
                <input
                  className={`appearance-none rounded w-full py-3 border ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } px-3 text-gray-700 leading-tight outline-teal-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter game name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>
                )}
              </div>

              {/* Provider Name */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="provider">
                  Provider Name *
                </label>
                <select
                  className={`appearance-none rounded w-full py-3 border ${
                    errors.provider ? 'border-red-500' : 'border-gray-300'
                  } px-3 text-gray-700 leading-tight outline-teal-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
                  id="provider"
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                >
                  <option value="">Select a provider</option>
                  {providers.map((provider) => (
                    <option key={provider._id} value={provider.providerName}>
                      {provider.providerName}
                    </option>
                  ))}
                </select>
                {errors.provider && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.provider}</p>
                )}
              </div>

              {/* Game ID */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gameId">
                  Game ID *
                </label>
                <input
                  className={`appearance-none rounded w-full py-3 border ${
                    errors.gameId ? 'border-red-500' : 'border-gray-300'
                  } px-3 text-gray-700 leading-tight outline-teal-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
                  id="gameId"
                  name="gameId"
                  type="text"
                  placeholder="Enter game ID"
                  value={formData.gameId}
                  onChange={handleChange}
                />
                {errors.gameId && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.gameId}</p>
                )}
              </div>

              {/* Image URL */}
              <div className="mb-4 md:col-span-2 lg:col-span-3">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                  Image URL *
                </label>
                <input
                  className={`appearance-none rounded w-full py-3 border ${
                    errors.imageUrl ? 'border-red-500' : 'border-gray-300'
                  } px-3 text-gray-700 leading-tight outline-teal-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
                  id="imageUrl"
                  name="imageUrl"
                  type="text"
                  placeholder="Enter image URL"
                  value={formData.imageUrl}
                  onChange={handleChange}
                />
                {errors.imageUrl && (
                  <p className="text-red-500 text-xs italic mt-1">{errors.imageUrl}</p>
                )}
                
                {formData.imageUrl && isValidUrl(formData.imageUrl) && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                    <img
                      src={formData.imageUrl}
                      alt="Game preview"
                      className="w-32 h-32 object-cover rounded-md border"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=Invalid+Image';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: '',
                      provider: '',
                      gameId: '',
                      categories: [],
                      imageUrl: '',
                      isFeatured: false,
                      status: 'active',
                      displayOrder: 0
                    });
                    setEditingId(null);
                    setErrors({});
                    showInfoToast('Edit cancelled');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className={`bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center transition duration-150 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  editingId ? 'Update Game' : 'Add Game'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Bulk Upload Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Upload Games from Excel</h2>
          <p className="text-sm text-gray-500 mb-4">
            Excel format: Game Name | Provider | Game ID | Categories (comma-separated) | Image URL | Featured (yes/no) | Status (active/inactive) | Display Order
          </p>
          
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 border-2 border-teal-500 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 transition duration-150"
          />

          {parsedGames.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-700">
                  Found <span className="font-bold">{parsedGames.length}</span> valid games in the file.
                </p>
                <button
                  onClick={() => setShowImportDetails(!showImportDetails)}
                  className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                >
                  {showImportDetails ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {showImportDetails && (
                <div className="mb-4 max-h-60 overflow-y-auto border rounded-lg p-3">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Game ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedGames.slice(0, 5).map((game, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm">{game.name}</td>
                          <td className="px-4 py-2 text-sm">{game.provider}</td>
                          <td className="px-4 py-2 text-sm">{game.gameId}</td>
                          <td className="px-4 py-2 text-sm">{game.categories.join(', ')}</td>
                        </tr>
                      ))}
                      {parsedGames.length > 5 && (
                        <tr>
                          <td colSpan="4" className="px-4 py-2 text-sm text-gray-500 italic">
                            ... and {parsedGames.length - 5} more games
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex items-center space-x-4">
                <button
                  onClick={startImport}
                  disabled={isImporting}
                  className={`bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded flex items-center transition duration-150 ${
                    isImporting ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isImporting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    'Start Import'
                  )}
                </button>

                <button
                  onClick={() => {
                    setParsedGames([]);
                    setImportStatus({
                      total: 0,
                      processed: 0,
                      added: 0,
                      skipped: 0,
                      errors: 0,
                      details: []
                    });
                    showInfoToast('Import cleared');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition duration-150"
                >
                  Clear
                </button>
              </div>

              {importStatus.total > 0 && (
                <div className="mt-6">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-teal-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${(importStatus.processed / importStatus.total) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <span className="text-gray-600">Processed:</span>
                      <span className="ml-2 font-bold">{importStatus.processed}/{importStatus.total}</span>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <span className="text-green-600">Added:</span>
                      <span className="ml-2 font-bold text-green-700">{importStatus.added}</span>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <span className="text-yellow-600">Skipped:</span>
                      <span className="ml-2 font-bold text-yellow-700">{importStatus.skipped}</span>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg">
                      <span className="text-red-600">Errors:</span>
                      <span className="ml-2 font-bold text-red-700">{importStatus.errors}</span>
                    </div>
                  </div>

                  {importStatus.details && importStatus.details.length > 0 && (
                    <div className="mt-4 max-h-40 overflow-y-auto border rounded-lg p-3">
                      <h4 className="font-medium mb-2">Import Details:</h4>
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr>
                            <th className="text-left">Game ID</th>
                            <th className="text-left">Status</th>
                            <th className="text-left">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importStatus.details.slice(0, 10).map((detail, idx) => (
                            <tr key={idx} className="border-t hover:bg-gray-50">
                              <td className="py-1">{detail.gameId}</td>
                              <td className="py-1">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  detail.status === 'added' ? 'bg-green-100 text-green-800' :
                                  detail.status === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {detail.status}
                                </span>
                              </td>
                              <td className="py-1">{detail.reason || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Games Table Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-xl font-bold text-gray-800">Highlight Games List</h2>
            
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <select
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Providers</option>
                {providers.map(provider => (
                  <option key={provider._id} value={provider.providerName}>
                    {provider.providerName}
                  </option>
                ))}
              </select>
              
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Games</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured</option>
              </select>
              
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center transition duration-150"
                title="Clear filters"
              >
                <FiRefreshCw className="mr-2" /> Clear
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Game Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((game) => (
                      <tr key={game._id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={game.imageUrl}
                            alt={game.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                            }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{game.name}</div>
                          <div className="text-sm text-gray-500">ID: {game.gameId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.provider}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {game.categories?.map((cat, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleStatusToggle(game._id, game.status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition duration-150 ${
                              game.status === 'active'
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {game.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleFeaturedToggle(game._id, game.isFeatured)}
                            className={`text-xl transition duration-150 ${
                              game.isFeatured ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-500'
                            }`}
                            title={game.isFeatured ? 'Remove from featured' : 'Add to featured'}
                          >
                            <FaStar />
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{game.displayOrder || 0}</span>
                            <div className="flex flex-col">
                              <button
                                onClick={() => handleReorder(game._id, 'up')}
                                className="text-gray-500 hover:text-teal-600 transition duration-150"
                                title="Move up"
                              >
                                <FaArrowUp className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleReorder(game._id, 'down')}
                                className="text-gray-500 hover:text-teal-600 transition duration-150"
                                title="Move down"
                              >
                                <FaArrowDown className="text-xs" />
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEdit(game)}
                              className="text-blue-600 hover:text-blue-800 transition duration-150"
                              title="Edit game"
                            >
                              <FaEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(game._id, game.name)}
                              className="text-red-600 hover:text-red-800 transition duration-150"
                              title="Delete game"
                            >
                              <FaTrash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {currentItems.map((game) => (
                  <div key={game._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition duration-150">
                    <div className="flex items-start space-x-4">
                      <img
                        src={game.imageUrl}
                        alt={game.name}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/50?text=No+Image';
                        }}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{game.name}</h3>
                        <p className="text-sm text-gray-500">ID: {game.gameId}</p>
                        <p className="text-sm text-gray-500">Provider: {game.provider}</p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {game.categories?.map((cat, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                            {cat}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleStatusToggle(game._id, game.status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition duration-150 ${
                            game.status === 'active'
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {game.status}
                        </button>
                        
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleFeaturedToggle(game._id, game.isFeatured)}
                            className={`text-xl transition duration-150 ${
                              game.isFeatured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
                            }`}
                          >
                            <FaStar />
                          </button>
                          <button
                            onClick={() => handleEdit(game)}
                            className="text-blue-600 hover:text-blue-800 transition duration-150"
                          >
                            <FaEdit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(game._id, game.name)}
                            className="text-red-600 hover:text-red-800 transition duration-150"
                          >
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {currentItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No highlight games found.</p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {filteredGames.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-2 sm:space-y-0">
                  <p className="text-sm text-gray-500">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredGames.length)} of {filteredGames.length} games
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-150"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 border rounded-lg bg-teal-50 text-teal-600 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-150"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HighlightGames;
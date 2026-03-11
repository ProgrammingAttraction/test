import React, { useState, useEffect } from 'react';
import { FaEdit, FaTimes, FaExclamationTriangle, FaStar, FaTrash } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import { AiOutlineEdit, AiOutlineDelete } from 'react-icons/ai';
import axios from 'axios';
import toast from 'react-hot-toast';
import Header from '../common/Header';
import Select from 'react-select';

const Allgames = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    provider: '',
    search: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
  });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    gameId: null,
    gameName: '',
  });
  const [deleteAllModal, setDeleteAllModal] = useState({ show: false });
  const [deleteProviderModal, setDeleteProviderModal] = useState({
    show: false,
    providerName: 'PragmaticPlay',
  });
  const [bulkInactivateModal, setBulkInactivateModal] = useState({ show: false });
  const [editModal, setEditModal] = useState({
    show: false,
    game: null,
  });
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [editForm, setEditForm] = useState({
    gameName: '',
    providerName: '',
    gameId: '',
    categories: [],
    imageUrl: '',
    isFeatured: false,
  });
  const [categoryError, setCategoryError] = useState('');
  const [popularGames, setPopularGames] = useState([]);
  const [showActiveOnly, setShowActiveOnly] = useState(true);

  // Axios instance
  const api = axios.create({
    baseURL: base_url,
    timeout: 10000,
  });

  // Sample of 50 popular game IDs, extended to ~1,500 with placeholders
  const famousGameIds = [
    'sweet_bonanza', 'gates_of_olympus', 'starburst', 'book_of_dead', 'gonzos_quest',
    'mega_moolah', 'wolf_gold', 'dead_or_alive_2', 'bonanza_megaways', 'reactoonz',
    'classic_blackjack', 'european_roulette', 'lightning_roulette', 'baccarat', 'speed_baccarat',
    'jacks_or_better', 'texas_holdem', 'fishing_god', 'fish_hunter', 'keno',
    'bingo_blast', 'aviator', 'spaceman', 'hilo', 'coin_flip',
    'crazy_time', 'monopoly_live', 'dream_catcher', 'live_blackjack', 'live_baccarat',
    'buffalo_king_megaways', 'the_dog_house', 'money_train_2', 'jammin_jars', 'razor_shark',
    'fire_in_the_hole', 'extra_chilli', 'legacy_of_dead', 'rise_of_merlin', 'vikings_go_berzerk',
    'a_night_with_cleo', 'cash_bandits_3', 'plinko', 'mines', 'crash',
    'scratch_cards', 'sic_bo', 'craps', 'dragon_tiger', 'deal_or_no_deal_live',
  ];

  // Generate placeholders to reach ~1,500 popular games
  const categoryCounts = {
    'Slot Games': 700, // 750 total - 50 from famousGameIds
    'Table': 136, // 150 - 14
    'Casino': 140, // 150 - 10
    'Roulette': 72, // 75 - 3
    'Poker': 73, // 75 - 2
    'Fishing': 73, // 75 - 2
    'Lottery': 73, // 75 - 2
    'Crash': 72, // 75 - 3
    'Instant': 28, // 30 - 2
    'Popular': 30, // 30 - 0
    'Live Dealer': 71, // 75 - 4
    'Others': 15, // 15 - 0
  };

  const generatePlaceholderGameIds = () => {
    const placeholders = [];
    Object.entries(categoryCounts).forEach(([category, count]) => {
      const prefix = category.toLowerCase().replace(' ', '_');
      for (let i = 1; i <= count; i++) {
        placeholders.push(`${prefix}_${i}`);
      }
    });
    return [...famousGameIds, ...placeholders]; // Total ~1,500
  };

  const allPopularGameIds = generatePlaceholderGameIds();

  // Fetch games
  const fetchGames = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.category && { category: filters.category }),
        ...(filters.provider && { provider: filters.provider }),
        ...(filters.search && { search: filters.search }),
        ...(showActiveOnly && { isActive: true }),
      };

      const response = await api.get('/admin/games', { params });
      
      if (response.data.success) {
        setGames(response.data.data);
        setPagination({
          total: response.data.total,
          pages: response.data.pages,
        });
        // Match popular games
        const matchedPopular = response.data.data.filter(game => 
          allPopularGameIds.includes(game.gameId?.toLowerCase())
        );
        setPopularGames(matchedPopular);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch games';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories');
      if (response.data.success) {
        setCategories(response.data.data.map(cat => cat.name));
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch providers
  const fetchProviders = async () => {
    try {
      const response = await api.get('/admin/providers');
      if (response.data.success) {
        setProviders(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchCategories();
    fetchProviders();
  }, [filters, showActiveOnly]);

  // Count PragmaticPlay games
  const pragmaticPlayGamesCount = games.filter(game => 
    game.categories?.some(cat => cat.toLowerCase().includes('pragmaticplay'))
  ).length;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage,
    }));
  };

  // Bulk inactivate non-popular games
  const inactivateNonPopularGames = async () => {
    try {
      const popularGameIds = popularGames.map(game => game._id);
      const response = await api.post('/admin/games/bulk-inactivate', {
        excludeGameIds: popularGameIds,
      });
      
      toast.success(response.data.message || `Kept ~${popularGameIds.length} popular games active!`, {
        duration: 3000,
        position: 'top-right',
        style: { background: '#10B981', color: '#fff' },
      });
      
      fetchGames();
      setBulkInactivateModal({ show: false });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to inactivate non-popular games';
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
        style: { background: '#EF4444', color: '#fff' },
      });
      setBulkInactivateModal(false);
    }
  };

  // Toggle Featured Status
  const toggleFeatured = async (gameId, currentFeaturedStatus) => {
    try {
      setUpdatingStatus(gameId);
      const response = await api.patch(`/admin/games/${gameId}/featured`, {
        isFeatured: !currentFeaturedStatus,
      });
      
      setGames(prevGames => 
        prevGames.map(game => 
          game._id === gameId ? { ...game, isFeatured: !currentFeaturedStatus } : game
        )
      );
      
      toast.success(response.data.message, {
        duration: 3000,
        position: 'top-right',
        style: { background: '#10B981', color: '#fff' },
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to toggle featured status';
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
        style: { background: '#EF4444', color: '#fff' },
      });
      fetchGames();
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Toggle Active Status
  const toggleActive = async (gameId, currentStatus) => {
    try {
      setUpdatingStatus(gameId);
      const response = await api.put(`/admin/games/${gameId}/status`);
      
      setGames(prevGames => 
        prevGames.map(game => 
          game._id === gameId ? { ...game, isActive: !currentStatus } : game
        )
      );
      
      toast.success('Status updated successfully!', {
        duration: 3000,
        position: 'top-right',
      });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to toggle active status';
      setError(errorMessage);
      toast.error(errorMessage);
      fetchGames();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const showDeleteConfirmation = (gameId, gameName) => {
    setDeleteModal({
      show: true,
      gameId,
      gameName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      show: false,
      gameId: null,
      gameName: '',
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.gameId) return;
    
    try {
      await api.delete(`/admin/games/${deleteModal.gameId}`);
      toast.success('Game deleted successfully!', {
        duration: 3000,
        position: 'top-right',
        style: { background: '#10B981', color: '#fff' },
      });
      fetchGames();
      closeDeleteModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete game';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
        style: { background: '#EF4444', color: '#fff' },
      });
      closeDeleteModal();
    }
  };

  const showDeleteAllConfirmation = () => {
    setDeleteAllModal({ show: true });
  };

  const closeDeleteAllModal = () => {
    setDeleteAllModal({ show: false });
  };

  const confirmDeleteAll = async () => {
    try {
      const response = await api.delete('/admin/games');
      toast.success(response.data.message, {
        duration: 3000,
        position: 'top-right',
        style: { background: '#10B981', color: '#fff' },
      });
      setGames([]);
      setPagination({ total: 0, pages: 1 });
      closeDeleteAllModal();
      fetchGames();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete all games';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
        style: { background: '#EF4444', color: '#fff' },
      });
      closeDeleteAllModal();
    }
  };

  const showDeleteProviderConfirmation = () => {
    if (pragmaticPlayGamesCount === 0) {
      toast.error('No PragmaticPlay games found to delete', {
        duration: 3000,
        position: 'top-right',
      });
      return;
    }
    setDeleteProviderModal({
      show: true,
      providerName: 'PragmaticPlay',
    });
  };

  const closeDeleteProviderModal = () => {
    setDeleteProviderModal({
      show: false,
      providerName: '',
    });
  };

  const confirmDeleteProvider = async () => {
    try {
      const response = await api.delete('/admin/games/category/PragmaticPlay');
      toast.success(response.data.message, {
        duration: 3000,
        position: 'top-right',
        style: { background: '#10B981', color: '#fff' },
      });
      closeDeleteProviderModal();
      fetchGames();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete PragmaticPlay games';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
        style: { background: '#EF4444', color: '#fff' },
      });
      closeDeleteProviderModal();
    }
  };

  const showEditModal = (game) => {
    setEditModal({
      show: true,
      game,
    });
    setEditForm({
      gameName: game.gameName,
      providerName: game.providerName,
      gameId: game.gameId,
      categories: game.categories || [],
      imageUrl: game.imageUrl,
      isFeatured: game.isFeatured,
    });
    setCategoryError('');
  };

  const closeEditModal = () => {
    setEditModal({
      show: false,
      game: null,
    });
    setEditForm({
      gameName: '',
      providerName: '',
      gameId: '',
      categories: [],
      imageUrl: '',
      isFeatured: false,
    });
    setCategoryError('');
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCategoryChange = (selectedOptions) => {
    const newCategories = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setEditForm(prev => ({
      ...prev,
      categories: newCategories,
    }));
    setCategoryError(newCategories.length === 0 ? 'At least one category is required' : '');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (editForm.categories.length === 0) {
      setCategoryError('At least one category is required');
      toast.error('Please select at least one category', {
        duration: 4000,
        position: 'top-right',
        style: { background: '#EF4444', color: '#fff' },
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('gameName', editForm.gameName);
      formData.append('providerName', editForm.providerName);
      formData.append('gameId', editForm.gameId);
      formData.append('categories', JSON.stringify(editForm.categories));
      formData.append('imageUrl', editForm.imageUrl);
      formData.append('isFeatured', editForm.isFeatured);

      const response = await api.put(`/admin/games/${editModal.game._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Game updated successfully!', {
        duration: 3000,
        position: 'top-right',
        style: { background: '#10B981', color: '#fff' },
      });

      fetchGames();
      closeEditModal();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update game';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 4000,
        position: 'top-right',
        style: { background: '#EF4444', color: '#fff' },
      });
    }
  };

  // Custom Switch Component for Active Status
  const StatusSwitch = ({ gameId, isActive }) => {
    const [isChecked, setIsChecked] = useState(isActive);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
      setIsLoading(true);
      try {
        setIsChecked(!isChecked);
        await toggleActive(gameId, isChecked);
      } catch (error) {
        setIsChecked(isChecked);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex items-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            onChange={handleToggle}
            disabled={isLoading}
          />
          <div
            className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
              isChecked ? 'bg-green-500' : 'bg-gray-300'
            } ${isLoading ? 'opacity-50' : ''}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full transition-transform duration-200 ease-in-out ${
                isChecked ? 'transform translate-x-5' : ''
              }`}
              style={{ width: '1rem', height: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            />
          </div>
        </label>
        <span className="ml-2 text-sm font-medium text-gray-700">
          {isLoading ? 'Updating...' : isChecked ? 'Active' : 'Inactive'}
        </span>
      </div>
    );
  };

  // Custom Switch Component for Featured Status
  const FeaturedSwitch = ({ gameId, isFeatured, gameName }) => {
    const [isChecked, setIsChecked] = useState(isFeatured);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
      setIsLoading(true);
      try {
        setIsChecked(!isChecked);
        await toggleFeatured(gameId, isChecked);
      } catch (error) {
        setIsChecked(isChecked);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="flex items-center justify-center">
        <label
          className="relative inline-flex items-center cursor-pointer"
          title={isChecked ? 'Remove from featured' : 'Mark as featured'}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            onChange={handleToggle}
            disabled={isLoading || updatingStatus === gameId}
          />
          <div
            className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
              isChecked ? 'bg-yellow-500' : 'bg-gray-300'
            } ${(isLoading || updatingStatus === gameId) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 bg-white border border-gray-300 rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center ${
                isChecked ? 'transform translate-x-6' : ''
              }`}
              style={{ width: '1rem', height: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
            >
              {isChecked && <FaStar className="text-yellow-500 text-xs" />}
            </div>
          </div>
        </label>
        <span className="ml-2 text-sm font-medium text-gray-700 hidden md:inline">
          {(isLoading || updatingStatus === gameId) ? 'Updating...' : isChecked ? 'Featured' : 'Standard'}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full font-bai min-h-screen overflow-y-auto bg-gray-50 text-gray-700">
      <Header />
      <section className="p-4 md:p-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Game Management</h1>
            <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
              <NavLink
                to="/game-api/add-new-game"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-[5px] shadow-sm transition duration-200 flex items-center font-medium"
              >
                Add New Game
              </NavLink>
              <button
                onClick={showDeleteProviderConfirmation}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-[5px] shadow-sm transition duration-200 flex items-center font-medium"
                disabled={pragmaticPlayGamesCount === 0}
                title={`Delete all PragmaticPlay games (${pragmaticPlayGamesCount} found)`}
              >
                <FaTrash className="mr-2" />
                Delete PragmaticPlay ({pragmaticPlayGamesCount})
              </button>
              <button
                onClick={() => setBulkInactivateModal(true)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-[5px] shadow-sm transition duration-200 flex items-center font-medium"
                disabled={popularGames.length === 0 || games.length === 0}
                title={`Inactivate ~${games.length - popularGames.length} non-popular games (keep ~${popularGames.length} popular)`}
              >
                <FaTrash className="mr-2" />
                Inactivate Non-Popular (Keep ~1,500)
              </button>
              <button
                onClick={showDeleteAllConfirmation}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-[5px] shadow-sm transition duration-200 flex items-center font-medium"
                disabled={games.length === 0}
              >
                Delete All Games
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by game name, provider or ID"
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
              <option value="500">500 per page</option>
              <option value="1000">1000 per page</option>
            </select>
            <div className="flex items-center md:col-span-1">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={(e) => {
                  setShowActiveOnly(e.target.checked);
                  setFilters(prev => ({ ...prev, page: 1 }));
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              <label className="text-sm font-medium text-gray-700">Show Active Only (Popular)</label>
            </div>
          </div>

          {/* Counts Display */}
          {!loading && (
            <div className="text-sm text-gray-700 mb-4 p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-blue-800">{popularGames.length}</span> active popular games |{' '}
              <span className="font-medium text-gray-600">{games.length - popularGames.length}</span> inactive games
              {games.length === 0 && ' (No matches found—check filters)'}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <button
                  className="ml-auto text-red-500 hover:text-red-700"
                  onClick={() => setError(null)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-cyan-500 border-b-cyan-500 border-l-transparent border-r-transparent"></div>
                <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-cyan-500/20 blur-sm"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Games table */}
              <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">Image</th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">Game Name</th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">Provider</th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">Game ID</th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">Categories</th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">Featured</th>
                      <th className="px-4 py-3 text-left text-xs md:text-sm font-medium uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {games.length > 0 ? (
                      games.map(game => (
                        <tr key={game._id} className="hover:bg-gray-50 transition duration-150">
                          <td className="px-4 py-4 whitespace-nowrap">
                            {game.imageUrl && (
                              <img
                                src={game.imageUrl}
                                alt={game.gameName}
                                className="h-12 w-12 object-cover rounded-lg shadow-sm"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/48x48?text=No+Image';
                                }}
                              />
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{game.gameName}</div>
                            {game.isFeatured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                <FaStar className="mr-1" /> Featured
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{game.providerName}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {game.gameId}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {game.categories?.length > 0 ? (
                                game.categories.map((category, index) => {
                                  const colors = [
                                    'bg-blue-100 text-blue-800 border-blue-200',
                                    'bg-green-100 text-green-800 border-green-200',
                                    'bg-yellow-100 text-yellow-800 border-yellow-200',
                                    'bg-purple-100 text-purple-800 border-purple-200',
                                    'bg-pink-100 text-pink-800 border-pink-200',
                                    'bg-teal-100 text-teal-800 border-teal-200',
                                    'bg-orange-100 text-orange-800 border-orange-200',
                                    'bg-red-100 text-red-800 border-red-200',
                                  ];
                                  const colorClass = colors[index % colors.length];
                                  return (
                                    <span
                                      key={`${category}-${index}`}
                                      className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full border-[1px] ${colorClass}`}
                                    >
                                      {category}
                                    </span>
                                  );
                                })
                              ) : (
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-800 border-gray-200 border-[1px]">
                                  {game.category || 'None'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <StatusSwitch gameId={game._id} isActive={game.isActive} />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <FeaturedSwitch gameId={game._id} isFeatured={game.isFeatured} gameName={game.gameName} />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => showEditModal(game)}
                                className="text-blue-600 hover:text-blue-900 transition duration-200 flex items-center"
                                title="Edit"
                              >
                                <AiOutlineEdit className="mr-1" /> Edit
                              </button>
                              <button
                                onClick={() => showDeleteConfirmation(game._id, game.gameName)}
                                className="text-red-600 hover:text-red-900 transition duration-200 flex items-center"
                                title="Delete"
                              >
                                <AiOutlineDelete className="mr-1" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <FiSearch className="h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No games found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex flex-col md:flex-row justify-between items-center mt-6 space-y-4 md:space-y-0">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(filters.page - 1) * filters.limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(filters.page * filters.limit, pagination.total)}</span> of{' '}
                    <span className="font-medium">{pagination.total}</span> games
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page === 1}
                      className={`px-4 py-2 border rounded-md flex items-center ${
                        filters.page === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (filters.page <= 3) {
                        pageNum = i + 1;
                      } else if (filters.page >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = filters.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 border rounded-md ${
                            filters.page === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page === pagination.pages}
                      className={`px-4 py-2 border rounded-md flex items-center ${
                        filters.page === pagination.pages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Game</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete <span className="font-semibold">"{deleteModal.gameName}"</span>? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl">
              <button
                type="button"
                onClick={confirmDelete}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition duration-200"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {deleteAllModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <FaExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete All Games</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete all games? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl">
              <button
                type="button"
                onClick={confirmDeleteAll}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm transition duration-200"
              >
                Delete All
              </button>
              <button
                type="button"
                onClick={closeDeleteAllModal}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Provider Confirmation Modal */}
      {deleteProviderModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 rounded-full">
                <FaExclamationTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Delete PragmaticPlay Games</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete all <span className="font-semibold">PragmaticPlay</span> games? 
                    This will delete <span className="font-semibold">{pragmaticPlayGamesCount}</span> games. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl">
              <button
                type="button"
                onClick={confirmDeleteProvider}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm transition duration-200"
              >
                Delete PragmaticPlay Games
              </button>
              <button
                type="button"
                onClick={closeDeleteProviderModal}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Inactivate Non-Popular Modal */}
      {bulkInactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000000]">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 rounded-full">
                <FaExclamationTriangle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Inactivate Non-Popular Games</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Keep <span className="font-semibold">~{popularGames.length}</span> popular games active? This will inactivate{' '}
                    <span className="font-semibold">~{games.length - popularGames.length}</span> others. Cannot undo easily.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl">
              <button
                type="button"
                onClick={inactivateNonPopularGames}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm transition duration-200"
              >
                Confirm & Inactivate
              </button>
              <button
                type="button"
                onClick={() => setBulkInactivateModal(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {editModal.show && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-[1000]">
          <div className="bg-white rounded-[5px] shadow-xl max-w-lg w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Game</h3>
                <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Game Name</label>
                    <input
                      type="text"
                      name="gameName"
                      value={editForm.gameName}
                      onChange={handleEditFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-[5px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Provider Name</label>
                    <select
                      name="providerName"
                      value={editForm.providerName}
                      onChange={handleEditFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-[5px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Provider</option>
                      {providers.map(provider => (
                        <option key={provider._id} value={provider.providerName}>
                          {provider.providerName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Game ID</label>
                    <input
                      type="text"
                      name="gameId"
                      value={editForm.gameId}
                      onChange={handleEditFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-[5px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categories</label>
                    <Select
                      isMulti
                      name="categories"
                      options={categories.map(cat => ({ value: cat, label: cat }))}
                      value={editForm.categories.map(cat => ({ value: cat, label: cat }))}
                      onChange={handleCategoryChange}
                      className="mt-1"
                      classNamePrefix="select"
                      placeholder="Select categories..."
                    />
                    {categoryError && (
                      <p className="mt-1 text-sm text-red-600">{categoryError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={editForm.imageUrl}
                      onChange={handleEditFormChange}
                      className="mt-1 block w-full border border-gray-300 rounded-[5px] px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={editForm.isFeatured}
                      onChange={handleEditFormChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm font-medium text-gray-700">Featured</label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-[5px] text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Allgames;
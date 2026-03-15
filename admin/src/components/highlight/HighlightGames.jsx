import React, { useState, useEffect } from 'react';
import { FaCheck, FaHeart, FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { FiSearch, FiRefreshCw, FiDownload, FiX } from 'react-icons/fi';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import Header from '../common/Header';
import * as XLSX from 'xlsx';
import Select from 'react-select';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

// ─── Custom Download Popup ───────────────────────────────────────────────────
const DownloadModal = ({ isOpen, onClose, games }) => {
  const [format, setFormat] = useState('xlsx');
  const [includeInactive, setIncludeInactive] = useState(true);

  if (!isOpen) return null;

  const handleDownload = () => {
    const dataToExport = includeInactive
      ? games
      : games.filter((g) => g.status === 'active');

    if (dataToExport.length === 0) {
      toast.error('No data to export');
      return;
    }

    if (format === 'xlsx') {
      const rows = dataToExport.map((g) => ({
        Name: g.name || '',
        Provider: g.provider || '',
        'Game ID': g.gameId || '',
        Categories: Array.isArray(g.categories) ? g.categories.join(', ') : '',
        'Image URL': g.imageUrl || '',
        Featured: g.isFeatured ? 'Yes' : 'No',
        Status: g.status || '',
        'Display Order': g.displayOrder ?? 0,
      }));
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Highlight Games');
      XLSX.writeFile(wb, 'highlight_games.xlsx');
    } else {
      const rows = dataToExport.map((g) => ({
        name: g.name || '',
        provider: g.provider || '',
        gameId: g.gameId || '',
        categories: Array.isArray(g.categories) ? g.categories.join(', ') : '',
        imageUrl: g.imageUrl || '',
        isFeatured: g.isFeatured ? 'Yes' : 'No',
        status: g.status || '',
        displayOrder: g.displayOrder ?? 0,
      }));
      const headers = Object.keys(rows[0]).join(',');
      const csvRows = rows.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      );
      const csv = [headers, ...csvRows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'highlight_games.csv';
      a.click();
      URL.revokeObjectURL(url);
    }

    toast.success(`Exported ${dataToExport.length} games as .${format}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FiDownload className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Export Games</h3>
                <p className="text-teal-100 text-sm">{games.length} games available</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {['xlsx', 'csv'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                    format === f
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{f === 'xlsx' ? '📊' : '📄'}</span>
                  <span className="uppercase">{f}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Data Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Data to Include
            </label>
            <div className="space-y-2">
              {[
                { label: 'All Games (Active + Inactive)', value: true },
                { label: 'Active Games Only', value: false },
              ].map((opt) => (
                <label
                  key={String(opt.value)}
                  className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    includeInactive === opt.value
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="dataFilter"
                    checked={includeInactive === opt.value}
                    onChange={() => setIncludeInactive(opt.value)}
                    className="accent-teal-500"
                  />
                  <span className="text-sm text-gray-700 font-medium">{opt.label}</span>
                  <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {opt.value
                      ? games.length
                      : games.filter((g) => g.status === 'active').length}{' '}
                    rows
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-gray-700">Summary</span>
            </div>
            <p>
              Exporting{' '}
              <strong>
                {includeInactive
                  ? games.length
                  : games.filter((g) => g.status === 'active').length}
              </strong>{' '}
              games as <strong>.{format}</strong> file.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center space-x-2"
          >
            <FiDownload size={16} />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const HighlightGames = () => {
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    gameId: '',
    categories: [],
    imageUrl: '',
    isFeatured: false,
    status: 'active',
    displayOrder: 0,
  });

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
  const [stats, setStats] = useState({ totalGames: 0, activeGames: 0, featuredGames: 0 });
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const [parsedGames, setParsedGames] = useState([]);
  const [importStatus, setImportStatus] = useState({
    total: 0, processed: 0, added: 0, skipped: 0, errors: 0, details: [],
  });
  const [isImporting, setIsImporting] = useState(false);

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // ── Fetch categories ─────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get(`${base_url}/admin/categories`);
        if (response.data.success) setCategories(response.data.data);
      } catch {
        toast.error('Failed to load categories');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [base_url]);

  // ── Fetch providers ──────────────────────────────────────────────────────
  const fetchProviders = () => {
    axios
      .get(`${base_url}/admin/providers`)
      .then((res) => setProviders(res.data))
      .catch(() => toast.error('Failed to load providers'));
  };

  useEffect(() => { fetchProviders(); }, []);

  // ── Fetch highlight games ────────────────────────────────────────────────
  const fetchHighlightGames = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${base_url}/admin/highlight-games`, {
        params: { page: currentPage, limit: itemsPerPage * 2 },
      });
      if (response.data.success) {
        setGames(response.data.data);
        applyFilters(response.data.data, searchTerm, statusFilter, providerFilter, featuredFilter);
        fetchStats();
      }
    } catch {
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${base_url}/admin/highlight-games/stats`);
      if (response.data.success) setStats(response.data.data);
    } catch {}
  };

  useEffect(() => { fetchHighlightGames(); }, []);

  // ── Filters ──────────────────────────────────────────────────────────────
  const applyFilters = (gamesList, search, status, provider, featured) => {
    let filtered = [...gamesList];
    if (search)
      filtered = filtered.filter(
        (g) =>
          g.name?.toLowerCase().includes(search.toLowerCase()) ||
          g.provider?.toLowerCase().includes(search.toLowerCase()) ||
          g.gameId?.toLowerCase().includes(search.toLowerCase())
      );
    if (status !== 'all') filtered = filtered.filter((g) => g.status === status);
    if (provider !== 'all') filtered = filtered.filter((g) => g.provider === provider);
    if (featured !== 'all') filtered = filtered.filter((g) => g.isFeatured === (featured === 'true'));
    setFilteredGames(filtered);
    setCurrentPage(1);
  };

  useEffect(() => {
    applyFilters(games, searchTerm, statusFilter, providerFilter, featuredFilter);
  }, [searchTerm, statusFilter, providerFilter, featuredFilter, games]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredGames.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredGames.length / itemsPerPage);

  // ── Form helpers ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleCategoriesChange = (selectedOptions) => {
    setFormData({
      ...formData,
      categories: selectedOptions ? selectedOptions.map((o) => o.value) : [],
    });
  };

  const isValidUrl = (string) => {
    try { new URL(string); return true; } catch { return false; }
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Game name is required';
    if (!formData.provider?.trim()) errs.provider = 'Provider name is required';
    if (!formData.gameId?.trim()) errs.gameId = 'Game ID is required';
    if (!formData.imageUrl?.trim()) errs.imageUrl = 'Image URL is required';
    else if (!isValidUrl(formData.imageUrl)) errs.imageUrl = 'Please enter a valid URL';
    return errs;
  };

  const resetForm = () => {
    setFormData({ name: '', provider: '', gameId: '', categories: [], imageUrl: '', isFeatured: false, status: 'active', displayOrder: 0 });
    setEditingId(null);
    setErrors({});
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please fix the validation errors');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      name: formData.name, provider: formData.provider, gameId: formData.gameId,
      categories: formData.categories, imageUrl: formData.imageUrl,
      isFeatured: formData.isFeatured, status: formData.status, displayOrder: formData.displayOrder,
    };
    const headers = { Authorization: `Bearer ${localStorage.getItem('genzz_token')}` };

    try {
      if (editingId) {
        await axios.put(`${base_url}/admin/highlight-games/${editingId}`, payload, { headers });
        toast.success('Game updated successfully!');
      } else {
        await axios.post(`${base_url}/admin/highlight-games`, payload, { headers });
        toast.success('Game added successfully!');
      }
      resetForm();
      fetchHighlightGames();
    } catch (error) {
      let msg = editingId ? 'Failed to update game' : 'Failed to add game';
      if (error.response?.status === 409) msg = 'Game with this ID already exists';
      else if (error.response?.status === 400) msg = error.response.data.message || 'Validation error';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Edit / Delete ────────────────────────────────────────────────────────
  const handleEdit = (game) => {
    setFormData({
      name: game.name || '', provider: game.provider || '', gameId: game.gameId || '',
      categories: game.categories || [], imageUrl: game.imageUrl || '',
      isFeatured: game.isFeatured || false, status: game.status || 'active', displayOrder: game.displayOrder || 0,
    });
    setEditingId(game._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast('Editing: ' + game.name, { icon: '✏️' });
  };

  const handleDelete = (id, name) => {
    confirmAlert({
      title: 'Confirm delete',
      message: `Are you sure you want to delete "${name}"?`,
      buttons: [
        {
          label: 'Yes',
          onClick: async () => {
            try {
              await axios.delete(`${base_url}/admin/highlight-games/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('genzz_token')}` },
              });
              toast.success('Game deleted successfully!');
              fetchHighlightGames();
            } catch {
              toast.error('Failed to delete game');
            }
          },
        },
        { label: 'No', onClick: () => {} },
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
    });
  };

  // ── Toggles ──────────────────────────────────────────────────────────────
  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await axios.put(`${base_url}/admin/highlight-games/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('genzz_token')}` },
      });
      toast.success(`Game ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
      fetchHighlightGames();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleFeaturedToggle = async (id, currentFeatured) => {
    try {
      await axios.put(`${base_url}/admin/highlight-games/${id}/feature`, { isFeatured: !currentFeatured }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('genzz_token')}` },
      });
      toast.success(`Game ${!currentFeatured ? 'featured' : 'unfeatured'} successfully!`);
      fetchHighlightGames();
    } catch {
      toast.error('Failed to update featured status');
    }
  };

  const handleDisplayOrderChange = async (id, newOrder) => {
    try {
      await axios.put(`${base_url}/admin/highlight-games/${id}`, { displayOrder: newOrder }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('genzz_token')}` },
      });
      fetchHighlightGames();
    } catch {
      toast.error('Failed to update display order');
    }
  };

  const handleReorder = async (id, direction) => {
    const sortedGames = [...games].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    const currentIndex = sortedGames.findIndex((g) => g._id === id);
    try {
      if (direction === 'up' && currentIndex > 0) {
        const prev = sortedGames[currentIndex - 1];
        await handleDisplayOrderChange(id, prev.displayOrder - 1);
        await handleDisplayOrderChange(prev._id, prev.displayOrder + 1);
        toast.success('Game moved up');
      } else if (direction === 'down' && currentIndex < sortedGames.length - 1) {
        const next = sortedGames[currentIndex + 1];
        await handleDisplayOrderChange(id, next.displayOrder + 1);
        await handleDisplayOrderChange(next._id, next.displayOrder - 1);
        toast.success('Game moved down');
      }
    } catch {
      toast.error('Failed to reorder games');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setProviderFilter('all');
    setFeaturedFilter('all');
    setCurrentPage(1);
    toast('Filters cleared', { icon: '🧹' });
  };

  // ── Bulk upload ──────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const parsed = data.slice(1).map((row) => ({
          name: row[0]?.toString().trim(),
          provider: row[1]?.toString().trim(),
          gameId: row[2]?.toString().trim(),
          categories: row[3]?.toString().split(',').map((c) => c.trim()).filter(Boolean),
          imageUrl: row[4]?.toString().trim(),
          isFeatured: ['yes', 'true'].includes(row[5]?.toString().toLowerCase()),
          status: row[6]?.toString().toLowerCase() === 'active' ? 'active' : 'inactive',
          displayOrder: parseInt(row[7]) || 0,
        })).filter((g) => g.name && g.provider && g.gameId && g.categories.length && g.imageUrl && isValidUrl(g.imageUrl));

        setParsedGames(parsed);
        setImportStatus({ total: parsed.length, processed: 0, added: 0, skipped: 0, errors: 0, details: [] });

        if (parsed.length === 0) toast('No valid games found in file', { icon: '⚠️' });
        else toast.success(`Parsed ${parsed.length} valid games from file`);
      } catch {
        toast.error('Failed to parse Excel file');
      }
    };
    reader.readAsBinaryString(file);
  };

  const startImport = async () => {
    if (parsedGames.length === 0) { toast('No games to import', { icon: '⚠️' }); return; }
    setIsImporting(true);
    setImportStatus((prev) => ({ ...prev, processed: 0, added: 0, skipped: 0, errors: 0, details: [] }));
    try {
      const response = await axios.post(`${base_url}/admin/highlight-games/bulk-upload`, { games: parsedGames }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('genzz_token')}` },
      });
      if (response.data.success) {
        const { results } = response.data;
        setImportStatus(results);
        if (results.errors === 0)
          toast.success(`Import done! Added: ${results.added}, Skipped: ${results.skipped}`);
        else
          toast(`Import done with errors. Added: ${results.added}, Skipped: ${results.skipped}, Errors: ${results.errors}`, { icon: '⚠️' });
        fetchHighlightGames();
      }
    } catch {
      toast.error('Error during bulk upload');
    } finally {
      setIsImporting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full font-bai bg-gray-100 min-h-screen text-gray-700">
      <Header />

      {/* Simple react-hot-toast – no custom styles, uses library defaults */}
      <Toaster  reverseOrder={false} />

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        games={games}
      />

      <div className="p-4 w-full mx-auto">
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
                  className={`appearance-none rounded w-full py-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} px-3 text-gray-700 leading-tight outline-teal-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
                  id="name" name="name" type="text" placeholder="Enter game name"
                  value={formData.name} onChange={handleChange}
                />
                {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
              </div>

              {/* Provider */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="provider">
                  Provider Name *
                </label>
                <select
                  className={`appearance-none rounded w-full py-3 border ${errors.provider ? 'border-red-500' : 'border-gray-300'} px-3 text-gray-700 leading-tight outline-teal-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
                  id="provider" name="provider" value={formData.provider} onChange={handleChange}
                >
                  <option value="">Select a provider</option>
                  {providers.map((p) => (
                    <option key={p._id} value={p.providerName}>{p.providerName}</option>
                  ))}
                </select>
                {errors.provider && <p className="text-red-500 text-xs italic mt-1">{errors.provider}</p>}
              </div>

              {/* Game ID */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gameId">
                  Game ID *
                </label>
                <input
                  className={`appearance-none rounded w-full py-3 border ${errors.gameId ? 'border-red-500' : 'border-gray-300'} px-3 text-gray-700 leading-tight outline-teal-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
                  id="gameId" name="gameId" type="text" placeholder="Enter game ID"
                  value={formData.gameId} onChange={handleChange}
                />
                {errors.gameId && <p className="text-red-500 text-xs italic mt-1">{errors.gameId}</p>}
              </div>

              {/* Image URL */}
              <div className="mb-4 md:col-span-2 lg:col-span-3">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
                  Image URL *
                </label>
                <input
                  className={`appearance-none rounded w-full py-3 border ${errors.imageUrl ? 'border-red-500' : 'border-gray-300'} px-3 text-gray-700 leading-tight outline-teal-600 focus:border-teal-500 focus:ring-1 focus:ring-teal-500`}
                  id="imageUrl" name="imageUrl" type="text" placeholder="Enter image URL"
                  value={formData.imageUrl} onChange={handleChange}
                />
                {errors.imageUrl && <p className="text-red-500 text-xs italic mt-1">{errors.imageUrl}</p>}
                {formData.imageUrl && isValidUrl(formData.imageUrl) && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                    <img
                      src={formData.imageUrl} alt="Game preview"
                      className="w-32 h-32 object-cover rounded-md border"
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=Invalid+Image'; }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              {editingId && (
                <button
                  type="button"
                  onClick={() => { resetForm(); toast('Edit cancelled', { icon: '❌' }); }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition duration-150"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded flex items-center transition duration-150 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

        {/* Games Table Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-xl font-bold text-gray-800">Highlight Games List</h2>

            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text" placeholder="Search games..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Status filter */}
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Provider filter */}
              <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="all">All Providers</option>
                {providers.map((p) => (
                  <option key={p._id} value={p.providerName}>{p.providerName}</option>
                ))}
              </select>

              {/* Featured filter */}
              <select value={featuredFilter} onChange={(e) => setFeaturedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="all">All Games</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured</option>
              </select>

              {/* Clear */}
              <button onClick={handleClearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center transition duration-150" title="Clear filters">
                <FiRefreshCw className="mr-2" /> Clear
              </button>

              {/* ── Download button ── */}
              <button
                onClick={() => setShowDownloadModal(true)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg flex items-center space-x-2 transition duration-150"
                title="Export games"
              >
                <FiDownload size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentItems.map((game) => (
                      <tr key={game._id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img src={game.imageUrl} alt={game.name} className="w-12 h-12 object-cover rounded"
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/50?text=No+Image'; }} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{game.name}</div>
                          <div className="text-sm text-gray-500">ID: {game.gameId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.provider}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button onClick={() => handleStatusToggle(game._id, game.status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition duration-150 ${game.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                            {game.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-3">
                            <button onClick={() => handleEdit(game)} className="text-blue-600 hover:text-blue-800 transition duration-150" title="Edit game">
                              <FaEdit size={18} />
                            </button>
                            <button onClick={() => handleDelete(game._id, game.name)} className="text-red-600 hover:text-red-800 transition duration-150" title="Delete game">
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
                      <img src={game.imageUrl} alt={game.name} className="w-16 h-16 object-cover rounded"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/50?text=No+Image'; }} />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{game.name}</h3>
                        <p className="text-sm text-gray-500">ID: {game.gameId}</p>
                        <p className="text-sm text-gray-500">Provider: {game.provider}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {game.categories?.map((cat, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded-full">{cat}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <button onClick={() => handleStatusToggle(game._id, game.status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition duration-150 ${game.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                          {game.status}
                        </button>
                        <div className="flex items-center space-x-3">
                          <button onClick={() => handleFeaturedToggle(game._id, game.isFeatured)}
                            className={`text-xl transition duration-150 ${game.isFeatured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}>
                            <FaStar />
                          </button>
                          <button onClick={() => handleEdit(game)} className="text-blue-600 hover:text-blue-800 transition duration-150"><FaEdit size={18} /></button>
                          <button onClick={() => handleDelete(game._id, game.name)} className="text-red-600 hover:text-red-800 transition duration-150"><FaTrash size={18} /></button>
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
                  <button onClick={handleClearFilters} className="mt-4 text-teal-600 hover:text-teal-800 font-medium">
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
                    <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-150">
                      Previous
                    </button>
                    <span className="px-4 py-2 border rounded-lg bg-teal-50 text-teal-600 font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition duration-150">
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